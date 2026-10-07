import assert from 'node:assert/strict';
import {
  compileUnifiedPromptPipeline,
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
  /attached reference image only to preserve/i
);
assert.match(
  pipeline.platforms.gemini.rawPrompt,
  /provided reference image only to preserve/i
);
assert.match(pipeline.platforms.chatgpt.prompt, /SUBJECT & IDENTITY LOCK/);
assert.match(pipeline.platforms.gemini.prompt, /SUBJECT & IDENTITY LOCK/);

assert.equal(pipeline.platforms.chatgpt.validation.isValid, true);
assert.equal(pipeline.platforms.gemini.validation.isValid, true);
assert.equal(pipeline.diagnostics.negativeConflicts.length, 0);
assert.equal(pipeline.diagnostics.isValid, true);

assert.match(pipeline.negative.text, /identity drift/);
assert.match(pipeline.negative.text, /floating camera/);
assert.equal(
  pipeline.platforms.chatgpt.negativePrompt,
  pipeline.platforms.gemini.negativePrompt,
  'Both platform outputs must share one reconciled negative prompt'
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
assert.equal(
  repeated.platforms.chatgpt.prompt,
  pipeline.platforms.chatgpt.prompt
);
assert.equal(
  repeated.platforms.gemini.prompt,
  pipeline.platforms.gemini.prompt
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

console.log('unifiedPromptPipeline tests passed');
