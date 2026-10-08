import type { SceneManifest } from './causalPipeline';
import type {
  PromptValidationResult,
  SceneState,
  ValidationIssue,
  ValidationResult,
} from './physicsEngine';
import type { SemanticPromptScene } from './promptCompiler';
import type { CompiledNegativeConstraints } from './negativeConstraintCompiler';

export type ConflictSeverity = 'error' | 'correction' | 'warning';

export interface UnifiedConflictResult {
  ruleId: string;
  severity: ConflictSeverity;
  code: string;
  message: string;
  affectedFields: string[];
  source:
    | 'input-scene'
    | 'resolved-scene'
    | 'continuity'
    | 'reference'
    | 'negative'
    | 'chatgpt-prompt'
    | 'gemini-prompt'
    | 'midjourney-prompt'
    | 'cross-platform';
  suggestedPatch?: Partial<SceneState>;
}

export interface UnifiedConflictReport {
  results: UnifiedConflictResult[];
  errors: UnifiedConflictResult[];
  corrections: UnifiedConflictResult[];
  warnings: UnifiedConflictResult[];
  isValid: boolean;
  hasCorrections: boolean;
}

export interface ConflictValidatorInput {
  rawState: SceneState;
  manifest: SceneManifest;
  semantic: SemanticPromptScene;
  negative: CompiledNegativeConstraints;
  inputValidation: ValidationResult;
  resolvedValidation: ValidationResult;
  chatgpt: PromptValidationResult;
  gemini: PromptValidationResult;
  midjourney: PromptValidationResult;
  chatgptNegativePrompt: string;
  geminiNegativePrompt: string;
  midjourneyNegativePrompt: string;
  chatgptPrompt: string;
  geminiPrompt: string;
  midjourneyPrompt: string;
}

const FIELD_ALIASES: Record<string, keyof SceneState | undefined> = {
  scenePlausibility: undefined,
  groupSelfieProfiles: undefined,
};

const PATCH_FIELDS_BY_ISSUE_FIELD: Record<string, (keyof SceneState)[]> = {
  groupSelfieEnabled: ['captureType'],
  glassesMode: ['glassesMode', 'customIdentityPrompt'],
  lightingMode: ['lightingMode', 'lightingIntensity', 'shadowDepth'],
  captureType: ['captureType'],
  framing: ['framing'],
  groupSelfieSize: ['groupSelfieSize'],
  lensCondition: ['lensCondition'],
  foregroundObstruction: ['foregroundObstruction'],
  pose: ['pose'],
  atmosphericCondition: ['atmosphericCondition'],
  lightingIntensity: ['lightingIntensity'],
  shadowDepth: ['shadowDepth'],
};

const issueCode = (
  scope: 'INPUT' | 'RESOLVED',
  issue: ValidationIssue
): string =>
  [
    scope,
    issue.type.toUpperCase(),
    issue.field
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toUpperCase(),
  ].join('_');

const sameIssue = (a: ValidationIssue, b: ValidationIssue): boolean =>
  a.type === b.type &&
  a.field === b.field &&
  a.description === b.description;

const suggestedPatchForFields = (
  rawState: SceneState,
  resolvedState: SceneState,
  fields: string[]
): Partial<SceneState> | undefined => {
  const patch: Partial<SceneState> = {};
  let changed = false;

  const candidateKeys = new Set<keyof SceneState>();

  for (const field of fields) {
    for (const mapped of PATCH_FIELDS_BY_ISSUE_FIELD[field] || []) {
      candidateKeys.add(mapped);
    }

    const direct = FIELD_ALIASES[field] ?? (field as keyof SceneState);
    if (direct) candidateKeys.add(direct);
  }

  for (const key of candidateKeys) {
    if (!(key in resolvedState) || !(key in rawState)) continue;

    if (rawState[key] !== resolvedState[key]) {
      (patch as Record<string, unknown>)[key] = resolvedState[key] as unknown;
      changed = true;
    }
  }

  return changed ? patch : undefined;
};

const validationIssueToConflict = (
  source: 'input-scene' | 'resolved-scene',
  scope: 'INPUT' | 'RESOLVED',
  issue: ValidationIssue,
  rawState: SceneState,
  resolvedState: SceneState,
  wasAutoResolved: boolean
): UnifiedConflictResult => {
  const severity: ConflictSeverity = wasAutoResolved
    ? 'correction'
    : issue.type === 'warning'
      ? 'warning'
      : 'error';

  const affectedFields = [issue.field];
  const suggestedPatch =
    wasAutoResolved || severity === 'correction'
      ? suggestedPatchForFields(rawState, resolvedState, affectedFields)
      : undefined;

  return {
    ruleId: `SCENE_${scope}_${issue.field}`,
    severity,
    code: wasAutoResolved
      ? `AUTO_RESOLVED_${issueCode(scope, issue)}`
      : issueCode(scope, issue),
    message: wasAutoResolved
      ? `Auto-resolved scene conflict: ${issue.description}`
      : issue.description,
    affectedFields,
    source,
    suggestedPatch,
  };
};

const promptContradictionFields = (message: string): string[] => {
  const lower = message.toLowerCase();
  const fields: string[] = [];

  if (lower.includes('glasses')) fields.push('glassesMode');
  if (lower.includes('daytime') || lower.includes('night scene') || lower.includes('solar')) {
    fields.push('timeOfDay', 'lightingMode');
  }
  if (lower.includes('front selfie') || lower.includes('floating') || lower.includes('camera')) {
    fields.push('captureType', 'cameraAngle');
  }
  if (lower.includes('focal length') || lower.includes('xiaomi') || lower.includes('iphone')) {
    fields.push('captureType');
  }

  return [...new Set(fields.length > 0 ? fields : ['prompt'])];
};

const promptValidationToConflicts = (
  source: 'chatgpt-prompt' | 'gemini-prompt' | 'midjourney-prompt',
  platform: 'CHATGPT' | 'GEMINI' | 'MIDJOURNEY',
  validation: PromptValidationResult
): UnifiedConflictResult[] => {
  const results: UnifiedConflictResult[] = [];

  for (const [index, message] of validation.contradictionsFound.entries()) {
    results.push({
      ruleId: `PROMPT_${platform}_CONTRADICTION_${index + 1}`,
      severity: 'correction',
      code: `${platform}_PROMPT_AUTO_CORRECTION`,
      message,
      affectedFields: promptContradictionFields(message),
      source,
    });
  }

  for (const [index, message] of validation.warnings.entries()) {
    results.push({
      ruleId: `PROMPT_${platform}_WARNING_${index + 1}`,
      severity: 'warning',
      code: `${platform}_PROMPT_WARNING`,
      message,
      affectedFields: ['prompt'],
      source,
    });
  }

  return results;
};

const continuityConflicts = (
  manifest: SceneManifest
): UnifiedConflictResult[] => {
  const context = manifest.continuityContext;
  if (!context) return [];

  const visibleEnvironment =
    manifest.resolved.physicalState.visibleEnvironment.toLowerCase();
  const results: UnifiedConflictResult[] = [];

  const roomLabel =
    context.roomId === 'bedroom'
      ? 'same fixed master bedroom'
      : 'same fixed family living room';

  if (!visibleEnvironment.includes(roomLabel)) {
    results.push({
      ruleId: 'CONTINUITY_ROOM_IDENTITY',
      severity: 'error',
      code: 'FIXED_HOME_ROOM_IDENTITY_MISSING',
      message:
        'Fixed-home scene lost its canonical room identity in the resolved visible environment.',
      affectedFields: ['sceneFamily', 'subScene', 'visibleEnvironment'],
      source: 'continuity',
    });
  }

  for (const anchor of context.visiblePermanentAnchors) {
    if (!visibleEnvironment.includes(anchor.toLowerCase())) {
      results.push({
        ruleId: 'CONTINUITY_VISIBLE_ANCHOR',
        severity: 'error',
        code: 'FIXED_HOME_VISIBLE_ANCHOR_MISSING',
        message: `Required visible fixed-home anchor is missing: ${anchor}`,
        affectedFields: ['subScene', 'visibleEnvironment'],
        source: 'continuity',
      });
    }
  }

  for (const hiddenAnchor of context.permanentAnchors.filter(
    anchor => !context.visiblePermanentAnchors.includes(anchor)
  )) {
    if (visibleEnvironment.includes(hiddenAnchor.toLowerCase())) {
      results.push({
        ruleId: 'CONTINUITY_HIDDEN_ANCHOR',
        severity: 'error',
        code: 'FIXED_HOME_HIDDEN_ANCHOR_LEAK',
        message: `Off-frame fixed-home anchor leaked into the visible environment: ${hiddenAnchor}`,
        affectedFields: ['subScene', 'visibleEnvironment'],
        source: 'continuity',
      });
    }
  }

  return results;
};

const referenceConflicts = (
  input: ConflictValidatorInput
): UnifiedConflictResult[] => {
  const { referencePlan } = input.manifest;
  const results: UnifiedConflictResult[] = [];

  if (!referencePlan.hasReference) {
    if (/attached reference image|provided reference image/i.test(input.chatgptPrompt)) {
      results.push({
        ruleId: 'REFERENCE_CHATGPT_ATTACHMENT',
        severity: 'error',
        code: 'CHATGPT_FALSE_REFERENCE_CLAIM',
        message:
          'ChatGPT prompt claims a reference image is attached while ReferencePlan has no reference.',
        affectedFields: ['referenceImageId'],
        source: 'reference',
      });
    }

    if (/attached reference image|provided reference image/i.test(input.geminiPrompt)) {
      results.push({
        ruleId: 'REFERENCE_GEMINI_ATTACHMENT',
        severity: 'error',
        code: 'GEMINI_FALSE_REFERENCE_CLAIM',
        message:
          'Gemini prompt claims a reference image is provided while ReferencePlan has no reference.',
        affectedFields: ['referenceImageId'],
        source: 'reference',
      });
    }

    if (/Midjourney Edit Model reference/i.test(input.midjourneyPrompt)) {
      results.push({
        ruleId: 'REFERENCE_MIDJOURNEY_EDIT_MODEL',
        severity: 'error',
        code: 'MIDJOURNEY_FALSE_REFERENCE_CLAIM',
        message:
          'Midjourney prompt claims an Edit Model reference while ReferencePlan has no reference.',
        affectedFields: ['referenceImageId'],
        source: 'reference',
      });
    }
  }

  return results;
};

const sceneIntentConflicts = (
  input: ConflictValidatorInput
): UnifiedConflictResult[] => {
  const state = input.manifest.resolved.state;
  const visibleEnvironment = input.semantic.visibleEnvironment.toLowerCase();
  const results: UnifiedConflictResult[] = [];

  const explicitHomePeople =
    (state.sceneFamily === 'living-room' || state.sceneFamily === 'bedroom') &&
    state.homeBackgroundPeopleMode !== undefined &&
    state.homeBackgroundPeopleMode !== 'none' &&
    (state.homeBackgroundCount ?? 0) > 0;

  if (explicitHomePeople) {
    const density = input.manifest.resolved.physicalState.backgroundRealism?.humanDensity;
    if (density === 'none') {
      results.push({
        ruleId: 'SCENE_INTENT_HOME_BACKGROUND_PEOPLE',
        severity: 'error',
        code: 'EXPLICIT_HOME_PEOPLE_ERASED',
        message:
          'User explicitly selected background people for a home scene, but the resolved background density became none.',
        affectedFields: [
          'homeBackgroundPeopleMode',
          'homeBackgroundCount',
          'backgroundHumans',
        ],
        source: 'resolved-scene',
      });
    }

    if (!/user-selected home background people:/i.test(input.semantic.visibleEnvironment)) {
      results.push({
        ruleId: 'SCENE_INTENT_HOME_BACKGROUND_PROMPT',
        severity: 'error',
        code: 'EXPLICIT_HOME_PEOPLE_MISSING_FROM_PROMPT',
        message:
          'User-selected home background people were not preserved in the semantic environment prompt.',
        affectedFields: [
          'homeBackgroundPeopleMode',
          'homeBackgroundCount',
          'visibleEnvironment',
        ],
        source: 'resolved-scene',
      });
    }
  }

  if (state.sceneFamily === 'living-room') {
    const majlisOnlyCue =
      /majlis carpet|floor seating|traditional majlis sofa|brown beige sofa|dark red carpet|mabkhara|incense burner|misbaha/i;

    if (majlisOnlyCue.test(input.semantic.visibleEnvironment)) {
      results.push({
        ruleId: 'SCENE_INTENT_LIVING_ROOM_TOPOLOGY',
        severity: 'error',
        code: 'LIVING_ROOM_MAJLIS_FURNITURE_LEAK',
        message:
          'Modern living-room scene contains furniture or decor reserved for a traditional majlis.',
        affectedFields: ['sceneFamily', 'subScene', 'visibleEnvironment'],
        source: 'resolved-scene',
      });
    }

    if (!/modern saudi family living room|l-shaped grey fabric sectional/i.test(visibleEnvironment)) {
      results.push({
        ruleId: 'SCENE_INTENT_LIVING_ROOM_IDENTITY',
        severity: 'error',
        code: 'MODERN_LIVING_ROOM_IDENTITY_MISSING',
        message:
          'Living-room scene lost the canonical modern Saudi living-room identity.',
        affectedFields: ['sceneFamily', 'subScene', 'visibleEnvironment'],
        source: 'resolved-scene',
      });
    }
  }

  if (state.sceneFamily === 'bedroom') {
    const livingRoomCue =
      /l-shaped grey fabric sectional|55-inch television and low modern media-unit|light-grey rug placement under the seating/i;

    if (livingRoomCue.test(input.semantic.visibleEnvironment)) {
      results.push({
        ruleId: 'SCENE_INTENT_BEDROOM_TOPOLOGY',
        severity: 'error',
        code: 'BEDROOM_LIVING_ROOM_FURNITURE_LEAK',
        message:
          'Bedroom scene contains fixed furniture reserved for the living-room topology.',
        affectedFields: ['sceneFamily', 'subScene', 'visibleEnvironment'],
        source: 'resolved-scene',
      });
    }
  }

  return results;
};

const negativeConflicts = (
  negative: CompiledNegativeConstraints
): UnifiedConflictResult[] =>
  negative.conflicts.map(conflict => ({
    ruleId: `NEGATIVE_${conflict.fragmentId}`,
    severity: 'correction',
    code: conflict.code,
    message: conflict.message,
    affectedFields: ['positivePrompt', 'negativePrompt'],
    source: 'negative',
  }));

const crossPlatformConflicts = (
  input: ConflictValidatorInput
): UnifiedConflictResult[] => {
  const results: UnifiedConflictResult[] = [];

  const platformNegatives = [
    input.chatgptNegativePrompt,
    input.geminiNegativePrompt,
    input.midjourneyNegativePrompt,
  ];
  if (new Set(platformNegatives).size !== 1) {
    results.push({
      ruleId: 'CROSS_PLATFORM_NEGATIVE',
      severity: 'error',
      code: 'PLATFORM_NEGATIVE_DIVERGENCE',
      message:
        'Platform adapters ended with different negative constraints for the same canonical scene.',
      affectedFields: ['negativePrompt'],
      source: 'cross-platform',
    });
  }

  if (
    input.manifest.platformTarget !== 'neutral'
  ) {
    results.push({
      ruleId: 'MANIFEST_PLATFORM_NEUTRALITY',
      severity: 'error',
      code: 'NON_NEUTRAL_CANONICAL_MANIFEST',
      message:
        'Unified prompt compilation must derive both platform outputs from a neutral SceneManifest.',
      affectedFields: ['platformTarget'],
      source: 'cross-platform',
    });
  }

  return results;
};

const dedupe = (
  results: UnifiedConflictResult[]
): UnifiedConflictResult[] => {
  const seen = new Set<string>();
  return results.filter(result => {
    const key = [
      result.severity,
      result.code,
      result.message,
      result.affectedFields.join(','),
    ].join('|');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Final deterministic conflict aggregation layer.
 *
 * Priority:
 * 1. unresolved physical/scene errors
 * 2. fixed continuity/reference/cross-platform invariants
 * 3. auto-corrections already applied by scene/prompt/negative validators
 * 4. warnings
 *
 * Corrections are reported but do not make the final pipeline invalid after
 * they have been safely applied. Only unresolved errors make isValid=false.
 */
export function validateUnifiedConflicts(
  input: ConflictValidatorInput
): UnifiedConflictReport {
  const rawIssues = input.inputValidation.issues;
  const resolvedIssues = input.resolvedValidation.issues;

  const sceneResults: UnifiedConflictResult[] = [];

  for (const issue of rawIssues) {
    const persists = resolvedIssues.some(resolvedIssue =>
      sameIssue(issue, resolvedIssue)
    );

    if (!persists) {
      sceneResults.push(
        validationIssueToConflict(
          'input-scene',
          'INPUT',
          issue,
          input.rawState,
          input.manifest.resolved.state,
          true
        )
      );
    }
  }

  for (const issue of resolvedIssues) {
    sceneResults.push(
      validationIssueToConflict(
        'resolved-scene',
        'RESOLVED',
        issue,
        input.rawState,
        input.manifest.resolved.state,
        false
      )
    );
  }

  const results = dedupe([
    ...sceneResults,
    ...continuityConflicts(input.manifest),
    ...sceneIntentConflicts(input),
    ...referenceConflicts(input),
    ...negativeConflicts(input.negative),
    ...promptValidationToConflicts(
      'chatgpt-prompt',
      'CHATGPT',
      input.chatgpt
    ),
    ...promptValidationToConflicts(
      'gemini-prompt',
      'GEMINI',
      input.gemini
    ),
    ...promptValidationToConflicts(
      'midjourney-prompt',
      'MIDJOURNEY',
      input.midjourney
    ),
    ...crossPlatformConflicts(input),
  ]);

  const errors = results.filter(result => result.severity === 'error');
  const corrections = results.filter(
    result => result.severity === 'correction'
  );
  const warnings = results.filter(result => result.severity === 'warning');

  return {
    results,
    errors,
    corrections,
    warnings,
    isValid: errors.length === 0,
    hasCorrections: corrections.length > 0,
  };
}
