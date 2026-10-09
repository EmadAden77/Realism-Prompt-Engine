import { planSpatialComposition, type SpatialCompositionPlan } from './spatialCompositionPlanner';
import { createSceneManifest, deriveCausalHairExpression, type SceneManifest } from './causalPipeline';
import {
  validatePrompt,
  validateScene,
  type PromptValidationResult,
  type SceneState,
  type ValidationResult,
} from './physicsEngine';
import {
  compileNeutralPrompt,
  type CompiledNeutralPrompt,
  type SemanticPromptScene,
} from './promptCompiler';
import { buildSemanticScene } from './semanticSceneCompiler';
import {
  buildPlatformAdapterPlan,
  type PlatformAdapterPlan,
} from './platformAdapter';
import {
  compileNegativeConstraints,
  type CompiledNegativeConstraints,
  type NegativeConstraintConflict,
} from './negativeConstraintCompiler';
import {
  validateUnifiedConflicts,
  type UnifiedConflictReport,
} from './conflictValidator';
import { compressNegativePromptText } from './promptCompression';

export type UnifiedPromptTarget = 'chatgpt' | 'gemini' | 'midjourney';

export interface PlatformPromptResult {
  target: UnifiedPromptTarget;
  rawPrompt: string;
  prompt: string;
  negativePrompt: string;
  validation: PromptValidationResult;
  adapter: PlatformAdapterPlan;
}

export interface UnifiedPromptDiagnostics {
  inputValidation: ValidationResult;
  resolvedValidation: ValidationResult;
  negativeConflicts: NegativeConstraintConflict[];
  contradictionsByPlatform: Record<UnifiedPromptTarget, string[]>;
  warningsByPlatform: Record<UnifiedPromptTarget, string[]>;
  conflictReport: UnifiedConflictReport;
  compression: {
    neutralSavedChars: number;
    negativeSavedChars: number;
    totalSavedChars: number;
  };
  isValid: boolean;
  anglePromptReady: boolean;
  angleBlockingReasons: string[];
}

export interface UnifiedPromptPipelineResult {
  manifest: SceneManifest;
  spatialPlan: SpatialCompositionPlan;
  semantic: SemanticPromptScene;
  neutral: CompiledNeutralPrompt;
  negative: CompiledNegativeConstraints;
  platforms: Record<UnifiedPromptTarget, PlatformPromptResult>;
  diagnostics: UnifiedPromptDiagnostics;
}

const dedupeBy = <T,>(items: T[], key: (item: T) => string): T[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

const reconcileSharedNegative = (
  base: CompiledNegativeConstraints,
  platformNegatives: CompiledNegativeConstraints[]
): CompiledNegativeConstraints => {
  const platformIdSets = platformNegatives.map(
    item => new Set(item.fragments.map(fragment => fragment.id))
  );

  const fragments = base.fragments.filter(fragment =>
    platformIdSets.every(ids => ids.has(fragment.id))
  );

  const keptIds = new Set(fragments.map(item => item.id));
  const omitted = dedupeBy(
    [
      ...base.fragments.filter(item => !keptIds.has(item.id)),
      ...base.omittedConflictingFragments,
      ...platformNegatives.flatMap(item => item.omittedConflictingFragments),
    ],
    item => item.id
  );

  const conflicts = dedupeBy(
    [
      ...base.conflicts,
      ...platformNegatives.flatMap(item => item.conflicts),
    ],
    item => `${item.code}:${item.fragmentId}`
  );

  const compressed = compressNegativePromptText(
    fragments.map(item => item.text).join(' ')
  );

  return {
    text: compressed.text,
    fragments,
    omittedConflictingFragments: omitted,
    conflicts,
    compression: compressed.stats,
  };
};

const compilePlatformAdapter = (
  target: UnifiedPromptTarget,
  neutralPrompt: string,
  manifest: SceneManifest
): PlatformAdapterPlan =>
  buildPlatformAdapterPlan(
    neutralPrompt,
    target,
    manifest.referencePlan
  );

const compilePlatformNegative = (
  target: UnifiedPromptTarget,
  rawPrompt: string,
  manifest: SceneManifest,
  semantic: SemanticPromptScene
): CompiledNegativeConstraints => {
  void target;
  return compileNegativeConstraints(
    manifest.resolved.state,
    semantic,
    rawPrompt
  );
};

const validatePlatformPrompt = (
  adapter: PlatformAdapterPlan,
  sharedNegative: CompiledNegativeConstraints,
  manifest: SceneManifest
): PlatformPromptResult => {
  const validation = validatePrompt(
    adapter.prompt,
    manifest.resolved,
    sharedNegative.text
  );

  return {
    target: adapter.target,
    rawPrompt: adapter.prompt,
    prompt: validation.cleanPrompt,
    negativePrompt: validation.cleanNegativePrompt || sharedNegative.text,
    validation,
    adapter,
  };
};

/**
 * The single authoritative prompt-generation entry point.
 *
 * SceneState
 * -> SceneManifest
 * -> Semantic Scene
 * -> Neutral Prompt
 * -> Negative Constraints
 * -> Platform Adapters
 * -> Final Prompt Validation
 *
 * React and other callers should consume this result rather than rebuilding
 * any of these stages independently.
 */
export function compileUnifiedPromptPipeline(
  rawState: SceneState
): UnifiedPromptPipelineResult {
  const inputValidation = validateScene(rawState);
  const manifest = createSceneManifest(rawState, 'neutral');
  const resolved = manifest.resolved;
  const resolvedValidation = validateScene(resolved);

  const semantic = buildSemanticScene(
    resolved.state,
    resolved.derived,
    resolved.physicalState
  );

  const spatialPlan = planSpatialComposition(resolved.state, resolved.physicalState);
  semantic.visibleEnvironment = [semantic.visibleEnvironment, spatialPlan.promptInstruction].filter(Boolean).join(' ');

  const hairExpression = deriveCausalHairExpression(resolved.state);
  semantic.hair = [semantic.hair, ...hairExpression.hair].join(' ');
  semantic.expression = [semantic.expression, ...hairExpression.expression].join(' ');

  const neutral = compileNeutralPrompt(
    semantic,
    manifest.knowledgeDecisions
  );

  const chatgptAdapter = compilePlatformAdapter(
    'chatgpt',
    neutral.text,
    manifest
  );
  const geminiAdapter = compilePlatformAdapter(
    'gemini',
    neutral.text,
    manifest
  );
  const midjourneyAdapter = compilePlatformAdapter(
    'midjourney',
    neutral.text,
    manifest
  );

  const baseNegative = compileNegativeConstraints(
    resolved.state,
    semantic,
    neutral.text
  );
  const chatNegative = compilePlatformNegative(
    'chatgpt',
    chatgptAdapter.prompt,
    manifest,
    semantic
  );
  const geminiNegative = compilePlatformNegative(
    'gemini',
    geminiAdapter.prompt,
    manifest,
    semantic
  );
  const midjourneyNegative = compilePlatformNegative(
    'midjourney',
    midjourneyAdapter.prompt,
    manifest,
    semantic
  );

  const negative = reconcileSharedNegative(
    baseNegative,
    [chatNegative, geminiNegative, midjourneyNegative]
  );

  const chatgpt = validatePlatformPrompt(
    chatgptAdapter,
    negative,
    manifest
  );
  const gemini = validatePlatformPrompt(
    geminiAdapter,
    negative,
    manifest
  );
  const midjourney = validatePlatformPrompt(
    midjourneyAdapter,
    negative,
    manifest
  );

  const contradictionsByPlatform = {
    chatgpt: chatgpt.validation.contradictionsFound,
    gemini: gemini.validation.contradictionsFound,
    midjourney: midjourney.validation.contradictionsFound,
  };

  const warningsByPlatform = {
    chatgpt: chatgpt.validation.warnings,
    gemini: gemini.validation.warnings,
    midjourney: midjourney.validation.warnings,
  };

  const anglePromptReady = manifest.angleDecision?.status !== 'insufficient-evidence';
  const angleBlockingReasons = anglePromptReady ? [] : ['No verified camera geometry available'];
  if (!anglePromptReady) {
    neutral.text = '';
    for (const platform of [chatgpt, gemini, midjourney]) {
      platform.prompt = '';
      platform.rawPrompt = '';
      platform.negativePrompt = '';
    }
  }

  const conflictReport = validateUnifiedConflicts({
    rawState,
    manifest,
    semantic,
    negative,
    inputValidation,
    resolvedValidation,
    chatgpt: chatgpt.validation,
    gemini: gemini.validation,
    midjourney: midjourney.validation,
    chatgptNegativePrompt: chatgpt.negativePrompt,
    geminiNegativePrompt: gemini.negativePrompt,
    midjourneyNegativePrompt: midjourney.negativePrompt,
    chatgptPrompt: chatgpt.prompt,
    geminiPrompt: gemini.prompt,
    midjourneyPrompt: midjourney.prompt,
  });

  return {
    manifest,
    spatialPlan,
    semantic,
    neutral,
    negative,
    platforms: {
      chatgpt,
      gemini,
      midjourney,
    },
    diagnostics: {
      inputValidation,
      resolvedValidation,
      negativeConflicts: negative.conflicts,
      contradictionsByPlatform,
      warningsByPlatform,
      conflictReport,
      compression: {
        neutralSavedChars: neutral.compression.savedChars,
        negativeSavedChars: negative.compression.savedChars,
        totalSavedChars:
          neutral.compression.savedChars + negative.compression.savedChars,
      },
      isValid: conflictReport.isValid && anglePromptReady,
      anglePromptReady,
      angleBlockingReasons,
    },
  };
}

/**
 * Re-validates an externally modified prompt, such as an AI-enhanced version,
 * against the same canonical resolved scene and negative compiler.
 */
export function validateExternalPromptCandidate(
  pipeline: UnifiedPromptPipelineResult,
  target: UnifiedPromptTarget,
  candidatePrompt: string
): PlatformPromptResult {
  if (!pipeline.diagnostics.anglePromptReady) {
    throw new Error('Camera evidence insufficient: prompt export blocked');
  }
  const negative = compileNegativeConstraints(
    pipeline.manifest.resolved.state,
    pipeline.semantic,
    candidatePrompt
  );

  const validation = validatePrompt(
    candidatePrompt,
    pipeline.manifest.resolved,
    negative.text
  );

  const adapter = buildPlatformAdapterPlan(
    pipeline.neutral.text,
    target,
    pipeline.manifest.referencePlan
  );

  return {
    target,
    rawPrompt: candidatePrompt,
    prompt: validation.cleanPrompt,
    negativePrompt: validation.cleanNegativePrompt || negative.text,
    validation,
    adapter,
  };
}
