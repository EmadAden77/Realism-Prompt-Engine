import { resolveBedroomSelfieActivity } from './bedroomSelfieAffordances';
import { describe2017RangeRoverSport } from './carReality';
import { getMicroLocation } from '../data/microLocations';
import { getPhysicalLightingOption } from '../data/physicalLighting';
import { gazeInteractionPrompt } from '../data/gazeInteractions';
import { exportCausalAttestationLedger, type CausalLedgerEntry } from './promptCompiler';
import { planSpatialComposition, type SpatialCompositionPlan } from './spatialCompositionPlanner';
import { createSceneManifest, deriveCausalHairExpression, type SceneManifest } from './causalPipeline';
import {
  validatePrompt,
  validateScene,
  type PromptValidationResult,
  type SceneState,
  type DerivedPhysicalState,
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
  causalLedger: CausalLedgerEntry[];
  causalFingerprint: string;
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

/**
 * Export a compact, physically grounded image prompt.
 *
 * Keep the canonical resolved scene as the only source of camera, location and
 * light facts. Brief visual constraints must never contradict those facts.
 * The verbose causal audit is kept in neutral/diagnostics, not sent to models.
 */
export function compileUltraShortPrompt(
  state: SceneState,
  semantic: SemanticPromptScene,
  physical?: DerivedPhysicalState
): string {
  const compact = (value: string, limit = 180): string => {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= limit) return normalized;
    const cut = normalized.slice(0, limit);
    const boundary = cut.lastIndexOf(' ');
    return cut.slice(0, boundary > limit * 0.65 ? boundary : limit)
      .trim().replace(/[,;:.]$/, '');
  };

  const micro = getMicroLocation(state.sceneFamily, state.subScene);
  const lightOption = state.sceneFamily
    ? getPhysicalLightingOption(state.sceneFamily, state.lightingMode)
    : undefined;
  const screenOnly = lightOption?.model === 'phone-screen'
    || /شاشة الهاتف.*فقط|phone[- ]?screen.*only/i.test(state.lightingMode);
  const phoneFlash = /فلاش|flash/i.test(state.lightingMode) && !screenOnly;
  const interactive = resolveBedroomSelfieActivity(state);
  const hairstyle = semantic.hair.match(/Selected hairstyle:\s*([^.]*)\./i)?.[1] || '';
  const expression = semantic.expression.split(/\.\s+/)[0];
  const gaze = state.gazeInteractionId ? gazeInteractionPrompt(state.gazeInteractionId) : '';
  const bedContact = state.sceneFamily === 'bedroom' && /سرير|مرتبة|bed|mattress/i.test(state.pose)
    ? 'Mattress and pillow compress only where body weight contacts; naturally wrinkled bedding, supported hips/shoulders and real contact shadows.'
    : '';
  const outfit = semantic.outfit.split(/\. LOCKED COMPLETE OUTFIT:/)[0];
  const wearControls = [
    ['tuck', state.shirtTuck],
    ['sleeves', state.sleeveStyle],
    ['buttons', state.shirtButtons],
    ['collar', state.collarStyle],
    ['outerwear', state.outerwearClosure],
    ['hood', state.hoodPosition],
    ['thobe collar', state.thobeCollar]
  ].filter((entry): entry is [string, string] =>
    typeof entry[1] === 'string' && entry[1] !== 'auto'
  ).map(([name, value]) => name + ': ' + value.replace(/-/g, ' ')).join('; ');
  const outdoorCar = state.sceneFamily === 'car' && (micro?.isOutdoor
    || /خارج|بجانب|مواقف|outside|beside|parking/i.test(state.subScene));
  const carStatement = state.sceneFamily !== 'car'
    ? ''
    : (outdoorCar ? 'Outside beside the parked vehicle: ' : 'Inside the vehicle: ')
      + describe2017RangeRoverSport({
        subScene: state.subScene,
        outdoor: outdoorCar,
        timeOfDay: state.timeOfDay,
        lightingMode: state.lightingMode,
        pose: state.pose
      });
  // A car preset contains stock descriptive hints, some daylight-only;
  // never append them verbatim to a night scene or a fixed-model car export.
  const microDetails = state.sceneFamily !== 'car' && micro?.environmentPrompt
    ? compact(micro.environmentPrompt.split(',').slice(0, 3).join(', '), 160)
    : '';
  const cameraDistance = physical?.cameraDistance.match(/(\d{2,3}(?:-\d{2,3})?)\s*cm/i)?.[1];
  const angleNumber = (value?: string): string => value?.match(/-?\d+(?:\.\d+)?°/)?.[0] || '';
  const angles = physical
    ? [angleNumber(physical.cameraPitch), angleNumber(physical.cameraYaw), angleNumber(physical.cameraRoll)]
    : [];
  const camera = state.captureType === 'front-selfie'
    ? 'Xiaomi 15 Ultra front camera, 21mm equivalent, f/2.0, '
      + (cameraDistance ? cameraDistance + 'cm handheld reach' : 'natural one-arm reach')
      + (angles.every(Boolean) ? ', pitch/yaw/roll ' + angles.join('/') : '')
      + '. One connected phone-holding arm, camera outside the frame; natural wide-angle foreshortening, no floating viewpoint.'
    : state.captureType === 'mirror-selfie'
      ? 'Single real phone visible in one flat-mirror reflection, correct hand and reflection geometry; no duplicate phone.'
      : 'Eye-level candid observer camera, no raised selfie arm or impossible perspective.';
  const lighting = screenOnly
    ? 'Only the phone screen lights face and near fingers; rapid falloff below upper chest, nearly black surroundings, no ceiling/bedside/vehicle/flash or invisible fill.'
    : phoneFlash
      ? 'Only the selected physical flash and credible ambient fixtures; hard near-axis highlights, coherent cast shadows and darker background.'
      : lightOption
        ? compact(lightOption.detail, 178)
        : 'Light source: ' + compact(state.lightingMode, 65) + '; all highlights and shadows must trace to a real source.';
  const contact = physical?.occlusions?.[0]
    ? 'Occlusion: ' + compact(physical.occlusions[0], 108) + '.'
    : '';
  const group = state.groupSelfieEnabled
    ? 'Group selfie of ' + (state.groupSelfieSize || 2) + ' distinct people'
      + (state.measuredGroupSpaceWidthMeters
        ? ' within ' + state.measuredGroupSpaceWidthMeters + 'm lateral space'
        : '')
      + '; natural shoulder clearance, one capturing phone.'
      + (semantic.groupSelfie?.includes('Lateral space is constrained') ? ' Limited lateral shoulder space.' : '')
    : '';
  const homePeople = !state.groupSelfieEnabled
    && state.homeBackgroundPeopleMode && state.homeBackgroundPeopleMode !== 'none'
    && state.homeBackgroundCount
      ? 'Background: ' + state.homeBackgroundCount + ' ' + state.homeBackgroundPeopleMode
        + ' with distinct, non-cloned faces only where framing permits.'
      : '';
  const pieces = [
    'Photorealistic vertical 9:16, unedited smartphone photograph.',
    state.referenceImageId
      ? 'Reference photo fixes exact facial identity, age, skull, eyes, nose, jaw, beard, skin tone/asymmetry and original hairline/density; never reshape or beautify.'
      : 'Natural unretouched face; do not invent reference-only identity details.',
    'Male, 193cm, 83kg, lean-athletic.',
    state.glassesMode === 'no_glasses' ? 'No glasses.'
      : state.glassesMode === 'wear_glasses' ? 'Black rectangular eyeglasses.'
        : state.referenceImageId ? 'Eyewear follows reference.' : '',
    'Outfit: ' + compact(outfit, 340) + '. Keep all chosen garments/colors; true seams, weave, gravity folds and contact creases.',
    wearControls ? 'Garment configuration: ' + wearControls + '.' : '',
    'Expression: ' + compact(expression, 105) + '.',
    gaze ? 'Gaze: ' + compact(gaze, 120) + '.' : '',
    hairstyle ? 'Hair: ' + compact(hairstyle, 80) + '; preserve reference hairline and density.' : '',
    'Pose: ' + compact(state.pose, 115) + '.',
    state.activity ? 'Action: ' + compact(state.activity, 90) + '.' : '',
    interactive.status === 'ready'
      ? 'Hand/prop contact: ' + compact(interactive.activity.contact, 135) + '.'
      : '',
    'Setting: ' + compact(micro?.labelAR || state.subScene || 'ordinary Saudi scene', 90) + '.',
    microDetails ? 'Visible scene: ' + microDetails + '.' : '',
    carStatement,
    bedContact,
    camera,
    contact,
    group,
    homePeople,
    'Time: ' + state.timeOfDay + '. Lighting: ' + lighting,
    screenOnly ? 'Expose for the near face without raising distant background; deep natural shadows remain.' : 'Real-source direction, occlusion, distance falloff and weaker bounce; no unexplained rim/fill light.',
    'Same camera exposure and noise across face, clothing and background; real skin microtexture, restrained HDR, imperfect white balance, natural sensor grain, no fake bokeh, CGI or skin smoothing.'
  ];
  return pieces.filter(Boolean).join(' ');
}

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
export function causalFingerprint(value: unknown): string {
  const json=JSON.stringify(value);
  let hash=2166136261;
  for(let i=0;i<json.length;i++) hash=Math.imul(hash ^ json.charCodeAt(i),16777619);
  return (hash>>>0).toString(16).padStart(8,'0');
}

export function verifyCausalFingerprint(pipeline: UnifiedPromptPipelineResult): boolean {
  return pipeline.causalFingerprint === causalFingerprint({
    state: pipeline.manifest.resolved.state,
    angle: pipeline.manifest.angleDecision,
    prompt: pipeline.neutral.text
  });
}

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

  const shortPrompt = compileUltraShortPrompt(resolved.state, semantic, resolved.physicalState);

  const chatgptAdapter = compilePlatformAdapter(
    'chatgpt',
    shortPrompt,
    manifest
  );
  const geminiAdapter = compilePlatformAdapter(
    'gemini',
    shortPrompt,
    manifest
  );
  const midjourneyAdapter = compilePlatformAdapter(
    'midjourney',
    shortPrompt,
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

  const bedroomInteraction = resolveBedroomSelfieActivity(resolved.state);
  const anglePromptReady = manifest.angleDecision?.status !== 'insufficient-evidence' && bedroomInteraction.status !== 'blocked';
  const angleBlockingReasons = [
    ...(manifest.angleDecision?.status === 'insufficient-evidence' ? ['No verified camera geometry available'] : []),
    ...bedroomInteraction.reasons
  ];
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

  const causalLedger = exportCausalAttestationLedger(neutral.fragments,manifest.angleDecision?.decisionAuditTrail);
  const fingerprint = causalFingerprint({state:resolved.state, angle:manifest.angleDecision, prompt:neutral.text});
  return {
    manifest,
    causalLedger,
    causalFingerprint:fingerprint,
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
  if (!pipeline.diagnostics.anglePromptReady || !verifyCausalFingerprint(pipeline)) {
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
