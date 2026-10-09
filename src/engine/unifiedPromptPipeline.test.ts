import assert from 'node:assert/strict';
import {
  compileUnifiedPromptPipeline,
  causalFingerprint,
  verifyCausalFingerprint,
  validateExternalPromptCandidate,
} from './unifiedPromptPipeline';
import type { SceneState } from './physicsEngine';

const base: SceneState = {
  referenceImageId: 'face-reference.jpg',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'واقف بشكل طبيعي',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف بثبات',
  outfitId: 'burgundy_shirt_grey_trousers',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إنارة شارع دافئة',
  environmentRealism: 'طبيعي',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 55,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const pipeline = compileUnifiedPromptPipeline(base);

assert.equal(pipeline.manifest.platformTarget, 'neutral');
assert.equal(pipeline.manifest.resolved.state.sceneFamily, 'saudi-outdoor');
assert.equal(pipeline.semantic.glasses, 'eyewear naturally follows reference image (preserve glasses if worn in reference, do not add if absent)');
assert.match(pipeline.neutral.text, /Generate a realistic photograph/);

assert.match(
  pipeline.platforms.chatgpt.rawPrompt,
  /attached image input only to preserve/i
);
assert.match(
  pipeline.platforms.gemini.rawPrompt,
  /provided image input only to preserve/i
);
assert.match(pipeline.platforms.chatgpt.prompt, /SUBJECT & IDENTITY LOCK/);
assert.match(pipeline.platforms.gemini.prompt, /SUBJECT & IDENTITY LOCK/);
assert.match(pipeline.platforms.midjourney.prompt, /SUBJECT & IDENTITY LOCK/);
assert.match(pipeline.platforms.midjourney.prompt, /--v 8\.2 --raw$/);
assert.equal(pipeline.platforms.chatgpt.adapter.recommendedModel, 'gpt-image-2.5-sunburst');
assert.equal(pipeline.platforms.gemini.adapter.recommendedModel, 'gemini-nano-banana-2.1');
assert.equal(pipeline.platforms.midjourney.adapter.referenceWorkflow, 'midjourney_edit_model');
assert.equal(pipeline.platforms.midjourney.adapter.referenceLimit, 4);

assert.equal(pipeline.platforms.chatgpt.validation.isValid, true);
assert.equal(pipeline.platforms.gemini.validation.isValid, true);
assert.equal(pipeline.platforms.midjourney.validation.isValid, true);
assert.equal(pipeline.diagnostics.negativeConflicts.length, 0);
assert.equal(pipeline.diagnostics.isValid, true);
assert(pipeline.neutral.compression.savedChars > 0);
assert(
  pipeline.diagnostics.compression.totalSavedChars >=
    pipeline.neutral.compression.savedChars
);

assert.match(pipeline.negative.text, /identity drift/);
assert.match(pipeline.negative.text, /floating camera/);
assert.equal(
  pipeline.platforms.chatgpt.negativePrompt,
  pipeline.platforms.gemini.negativePrompt,
  'ChatGPT and Gemini must share one reconciled negative prompt'
);
assert.equal(
  pipeline.platforms.chatgpt.negativePrompt,
  pipeline.platforms.midjourney.negativePrompt,
  'Midjourney must share the same canonical negative constraints'
);

const withoutReference = compileUnifiedPromptPipeline({
  ...base,
  referenceImageId: null,
});
assert.doesNotMatch(
  withoutReference.platforms.chatgpt.rawPrompt,
  /attached reference/i,
  'No-reference pipeline must not falsely claim an attachment'
);
assert.doesNotMatch(
  withoutReference.platforms.gemini.rawPrompt,
  /provided reference image/i
);
assert.doesNotMatch(
  withoutReference.platforms.midjourney.rawPrompt,
  /Edit Model reference/i
);
assert.equal(
  withoutReference.platforms.chatgpt.adapter.recommendedModel,
  'gpt-image-2.5-flare'
);

const wearGlasses = compileUnifiedPromptPipeline({
  ...base,
  glassesMode: 'wear_glasses',
});
assert.match(wearGlasses.semantic.glasses, /wearing black rectangular full-rim eyeglasses/);
assert.match(wearGlasses.negative.text, /missing glasses/);
assert.match(wearGlasses.negative.text, /no eyeglasses/);
assert.equal(
  wearGlasses.platforms.chatgpt.validation.contradictionsFound.length,
  0,
  'Valid "no eyeglasses" absence-constraint must not be misread as a prohibition on glasses'
);
assert.equal(wearGlasses.platforms.gemini.validation.contradictionsFound.length, 0);
assert.equal(wearGlasses.platforms.midjourney.validation.contradictionsFound.length, 0);

const noGlasses = compileUnifiedPromptPipeline({
  ...base,
  glassesMode: 'no_glasses',
});
assert.equal(noGlasses.semantic.glasses, 'not wearing glasses');
assert.match(noGlasses.negative.text, /eyeglasses, spectacles/);
assert.equal(noGlasses.diagnostics.isValid, true);

const phoneOnly = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  activity: 'جالس بهدوء',
  pose: 'جالس على حافة السرير',
  lightingMode: 'إضاءة شاشة الهاتف فقط',
  lightingIntensity: 12,
});
assert.match(phoneOnly.negative.text, /ceiling lights on/);
assert.match(phoneOnly.semantic.lighting, /إضاءة شاشة الهاتف فقط/);
assert.equal(phoneOnly.diagnostics.negativeConflicts.length, 0);

const externalConflict = validateExternalPromptCandidate(
  noGlasses,
  'gemini',
  'Generate the same subject wearing black rectangular full-rim eyeglasses in the resolved scene.'
);
assert(
  externalConflict.validation.contradictionsFound.some(item =>
    item.includes('explicitly forbids glasses')
  )
);
assert.match(externalConflict.prompt, /not wearing glasses/i);
assert.doesNotMatch(
  externalConflict.negativePrompt,
  /eyeglasses, spectacles/,
  'Contradictory negative fragment must be omitted while repairing the external positive candidate'
);

const repeated = compileUnifiedPromptPipeline(base);
assert.deepEqual(
  repeated.manifest.resolved.physicalState,
  pipeline.manifest.resolved.physicalState,
  'Unified pipeline must remain deterministic'
);
assert.deepEqual(repeated.negative.fragments, pipeline.negative.fragments);
assert.deepEqual(repeated.neutral.compression, pipeline.neutral.compression);
assert.deepEqual(repeated.negative.compression, pipeline.negative.compression);
assert.equal(
  repeated.platforms.chatgpt.prompt,
  pipeline.platforms.chatgpt.prompt
);
assert.equal(
  repeated.platforms.gemini.prompt,
  pipeline.platforms.gemini.prompt
);
assert.equal(
  repeated.platforms.midjourney.prompt,
  pipeline.platforms.midjourney.prompt
);

const outfitChanged = compileUnifiedPromptPipeline({
  ...base,
  outfitId: 'navy_shirt_grey_trousers',
});
assert.equal(
  outfitChanged.manifest.resolved.physicalState.cameraDistance,
  pipeline.manifest.resolved.physicalState.cameraDistance,
  'Outfit changes must not alter camera geometry through the unified pipeline'
);
assert.equal(
  outfitChanged.manifest.resolved.physicalState.visibleEnvironment,
  pipeline.manifest.resolved.physicalState.visibleEnvironment,
  'Outfit changes must not replace environment geometry through the unified pipeline'
);


assert.equal(
  pipeline.spatialPlan.backgroundCapacity,
  pipeline.manifest.resolved.physicalState.backgroundRealism.visibilityClass,
  'Planner must reuse the canonical visibility decision'
);
assert.equal(pipeline.spatialPlan.regions[0].role, 'subject');
assert.match(pipeline.semantic.visibleEnvironment, /Spatial composition:/);
assert.match(pipeline.platforms.gemini.prompt, /Spatial composition:/);

const closeSpatial = compileUnifiedPromptPipeline({
  ...base,
  framing: 'head-shoulders',
  backgroundHumans: 'high',
  backgroundVehicles: 'high',
});
assert.match(closeSpatial.spatialPlan.promptInstruction, /narrow areas actually visible/);
assert.equal(
  closeSpatial.spatialPlan.regions.find(region => region.role === 'near-background')?.visibility,
  'limited',
  'Tight selfies must not promise an expansive visible background'
);
assert.equal(
  closeSpatial.spatialPlan.regions.some(region => region.role === 'far-background'),
  false
);

const wideSpatial = compileUnifiedPromptPipeline({
  ...base,
  framing: 'half-body',
  cameraAngle: 'slightly-off-center',
  backgroundAutoAngle: false,
  backgroundPresence: 'visible',
});
assert.match(wideSpatial.spatialPlan.promptInstruction, /slightly off-center/);
assert.equal(wideSpatial.spatialPlan.regions[0].visibility, 'dominant');

const mirrorSpatial = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  captureType: 'mirror-selfie',
  lightingMode: 'إضاءة أباجورة دافئة',
});
assert.match(mirrorSpatial.spatialPlan.promptInstruction, /one coherent flat mirror plane/);
assert.doesNotMatch(mirrorSpatial.spatialPlan.promptInstruction, /outside the direct selfie image/);

assert.deepEqual(
  repeated.spatialPlan,
  pipeline.spatialPlan,
  'Spatial composition must be deterministic for identical scene settings'
);
assert.deepEqual(
  outfitChanged.spatialPlan,
  pipeline.spatialPlan,
  'Changing outfit cannot change spatial composition'
);


const insufficientAngle = compileUnifiedPromptPipeline({
  ...base,
  validatedAngleEvidence: { mode: 'auto' },
});
assert.equal(insufficientAngle.diagnostics.anglePromptReady, false);
assert.equal(insufficientAngle.diagnostics.isValid, false);
assert.equal(insufficientAngle.platforms.chatgpt.prompt, '');
assert.equal(insufficientAngle.platforms.gemini.prompt, '');
assert.equal(insufficientAngle.platforms.midjourney.prompt, '');
assert.equal(insufficientAngle.neutral.text, '');
assert.throws(
  () => validateExternalPromptCandidate(insufficientAngle, 'gemini', 'unsafe external prompt'),
  /Camera evidence insufficient/
);
const supportedAngle = compileUnifiedPromptPipeline({
  ...base,
  validatedAngleEvidence: { mode: 'auto', frontClearanceCm: 90, requiredFrontClearanceCm: 55 },
});
assert.equal(supportedAngle.diagnostics.anglePromptReady, true);
assert.ok(supportedAngle.platforms.gemini.prompt.length > 0);

console.log('unifiedPromptPipeline tests passed');

assert.ok(pipeline.causalLedger.length > 0, 'causal ledger should list prompt decisions');
const recordedFingerprint = pipeline.causalFingerprint;
assert.notEqual(recordedFingerprint, causalFingerprint({
  state: {...pipeline.manifest.resolved.state, timeOfDay:'midday'},
  angle:pipeline.manifest.angleDecision, prompt:pipeline.neutral.text
}), 'post-compile scene edit must change fingerprint');

const earIntegrated = compileUnifiedPromptPipeline({
  ...base,
  earTransmissionEvidence: {
    sourceBehindEar:true, earExposed:true, hairOccluded:false, tissuePathMm:3, viewerOnOppositeSide:true
  }
});
assert.match(earIntegrated.semantic.skinResponse, /warm red translucency/);
const earBlocked = compileUnifiedPromptPipeline({
  ...base,
  earTransmissionEvidence: {
    sourceBehindEar:true, earExposed:true, hairOccluded:true, tissuePathMm:3, viewerOnOppositeSide:true
  }
});
assert.doesNotMatch(earBlocked.semantic.skinResponse, /warm red translucency/);
assert.equal(verifyCausalFingerprint(pipeline), true);
pipeline.manifest.resolved.state.timeOfDay = 'midday';
assert.equal(verifyCausalFingerprint(pipeline), false);
