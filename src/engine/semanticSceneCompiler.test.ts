import assert from 'node:assert/strict';
import { resolveScene, type SceneState } from './physicsEngine';
import {
  buildSemanticScene,
  HAIRSTYLES,
  EXPRESSIONS,
  type DerivedSceneState,
} from './semanticSceneCompiler';

const state: SceneState = {
  referenceImageId: 'face.jpg',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'يمشي بهدوء',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'slightly-off-center',
  pose: 'يمشي بخطوات طبيعية',
  outfitId: 'burgundy_shirt_grey_trousers',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إنارة شارع دافئة',
  environmentRealism: 'طبيعي',
  realismStyle: 'anti-ai-raw',
  customIdentityPrompt:
    'Preserve exact facial identity. Must wear dark rectangular eyeglasses. Keep natural asymmetry.',
  glassesMode: 'no_glasses',
  lightingIntensity: 45,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const derived: DerivedSceneState = {
  skinResponse: 'natural skin texture',
  hairCondition: 'natural resting hair condition',
  fabricBehavior: ['natural gravity folds'],
  shadowBehavior: 'causal contact shadows',
  environmentalLightBehavior: 'restrained wall and ground bounce',
  cameraDistance: 'arm-length distance',
  visibleBackgroundElements: ['ordinary villa wall', 'asphalt'],
  contactPhysics: [
    'one arm clearly extended holding the camera',
    'feet grounded naturally on pavement',
  ],
  reflectionRules: [],
  realismConstraints: ['no invisible fill light'],
  lensEffects: 'restrained low-light sensor noise',
  atmosphericEffects: 'clear ordinary night air',
  muscleFatigueEffects: 'well-rested facial muscles',
  lightingIntensityDescription: 'dim practical ambient level',
  shadowDepthDescription: 'moderate physically grounded shadow depth',
};

const resolved = resolveScene(state);
const semantic = buildSemanticScene(
  resolved.state,
  derived,
  resolved.physicalState
);

assert.equal(HAIRSTYLES.length, 6);
assert.equal(EXPRESSIONS.length, 60);
assert(EXPRESSIONS.some(item => item.id === 'fx01'));
assert(EXPRESSIONS.some(item => item.id === 'fx_core10'));
assert(EXPRESSIONS.some(item => item.id === 'fx_full'));

const advancedState = {
  ...resolved.state,
  expression: 'fx03',
};
const advancedSemantic = buildSemanticScene(
  advancedState,
  derived,
  resolved.physicalState
);
assert.match(advancedSemantic.expression, /FACS AU7 lid tightener/i);
assert.match(advancedSemantic.expression, /crow's feet/i);

const skinDetailSemantic = buildSemanticScene(
  { ...resolved.state, expression: 'fx21' },
  derived,
  resolved.physicalState
);
assert.match(skinDetailSemantic.expression, /Skin physical detail/i);
assert.match(skinDetailSemantic.expression, /3mm cheek mole/i);

const fullPresetSemantic = buildSemanticScene(
  { ...resolved.state, expression: 'fx_full' },
  derived,
  resolved.physicalState
);
assert.match(fullPresetSemantic.expression, /Combined facial physical details/i);
assert.match(fullPresetSemantic.expression, /masseter bulging jaw clench/i);
assert.match(fullPresetSemantic.expression, /one crooked lower incisor/i);

assert.match(semantic.identity, /Preserve exact facial identity/i);
assert.doesNotMatch(
  semantic.identity,
  /Must wear dark rectangular eyeglasses/i,
  'Identity text must not override the explicit no-glasses selector'
);
assert.equal(semantic.glasses, 'not wearing glasses');

assert.match(semantic.captureMechanics, /Smartphone front-camera capture/i);
assert.match(semantic.captureMechanics, /Capturing phone is NOT visible in frame/i);
assert.match(semantic.cameraRealism, /Absolute raw hyper-realism/i);

const hairPhysicsSemantic = buildSemanticScene(
  { ...resolved.state, hairPhysicsPreset: 'hp03' },
  derived,
  resolved.physicalState
);
assert.match(hairPhysicsSemantic.hair, /2-3cm halo/i);
assert.match(hairPhysicsSemantic.hair, /baby hairs/i);
assert.match(hairPhysicsSemantic.hair, /natural everyday hair/i);

assert.match(semantic.outfit, /burgundy/i);
assert.match(semantic.poseAndContact, /walking at a relaxed everyday pace/i);
assert.match(semantic.visibleEnvironment, /Authentic everyday Saudi life/i);
assert.match(semantic.visibleEnvironment, /Physically visible scene/i);
assert.match(semantic.lighting, /Time: night/i);
assert.equal(semantic.atmosphere, derived.atmosphericEffects);
assert.equal(semantic.skinResponse, derived.skinResponse);
assert.match(semantic.styleConstraints, /no invisible fill light/i);

assert.doesNotMatch(
  JSON.stringify(semantic),
  /ChatGPT|Gemini|Midjourney/i,
  'Semantic compiler must remain platform-neutral'
);

const second = buildSemanticScene(
  resolved.state,
  derived,
  resolved.physicalState
);
assert.deepEqual(second, semantic, 'Semantic compilation must be deterministic');

console.log('semanticSceneCompiler tests passed');
