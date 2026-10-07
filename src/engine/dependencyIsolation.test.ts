import assert from 'node:assert/strict';
import { createSceneManifest } from './causalPipeline';
import type { SceneState } from './physicsEngine';

const baseState: SceneState = {
  referenceImageId: 'ref.jpg',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'واقف بشكل طبيعي',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف بثبات',
  outfitId: 'navy_shirt_grey_trousers',
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

const physicalInvariantSnapshot = (state: SceneState) => {
  const physical = createSceneManifest(state, 'neutral').resolved.physicalState;
  return {
    cameraPosition: physical.cameraPosition,
    cameraDistance: physical.cameraDistance,
    cameraDirection: physical.cameraDirection,
    cameraPitch: physical.cameraPitch,
    cameraYaw: physical.cameraYaw,
    cameraRoll: physical.cameraRoll,
    fieldOfView: physical.fieldOfView,
    opticalPerspective: physical.opticalPerspective,
    visibleEnvironment: physical.visibleEnvironment,
    backgroundDepth: physical.backgroundDepth,
    lightSources: physical.lightSources,
    shadowBehavior: physical.shadowBehavior,
  };
};

const outfitA = createSceneManifest(baseState, 'neutral');
const outfitB = createSceneManifest(
  { ...baseState, outfitId: 'burgundy_shirt_grey_trousers' },
  'neutral'
);

assert.equal(
  outfitA.resolved.physicalState.cameraDistance,
  outfitB.resolved.physicalState.cameraDistance,
  'Changing outfitId must not change camera distance'
);
assert.equal(
  outfitA.resolved.physicalState.visibleEnvironment,
  outfitB.resolved.physicalState.visibleEnvironment,
  'Changing outfitId must not change environment geometry'
);
assert.deepEqual(
  outfitA.resolved.physicalState.lightSources,
  outfitB.resolved.physicalState.lightSources,
  'Changing outfitId must not replace light sources'
);

const expressionA = physicalInvariantSnapshot(baseState);
const expressionB = physicalInvariantSnapshot({ ...baseState, expression: 'e3' });
assert.deepEqual(
  expressionB,
  expressionA,
  'Changing expression must not alter camera/environment/light physics'
);

const platformChatGPT = createSceneManifest(baseState, 'chatgpt');
const platformGemini = createSceneManifest(baseState, 'gemini');
assert.deepEqual(
  platformChatGPT.resolved,
  platformGemini.resolved,
  'Changing platformTarget must not change resolved scene physics'
);
assert.deepEqual(
  platformChatGPT.knowledgeDecisions,
  platformGemini.knowledgeDecisions,
  'Changing platformTarget must not change domain knowledge decisions'
);

const neutralAtmosphere = createSceneManifest(baseState, 'neutral');
const dustyAtmosphere = createSceneManifest(
  { ...baseState, atmosphericCondition: 'dusty-haze' },
  'neutral'
);
assert.equal(
  neutralAtmosphere.resolved.physicalState.cameraDistance,
  dustyAtmosphere.resolved.physicalState.cameraDistance,
  'Changing atmospheric condition must not change camera distance'
);
assert.equal(
  neutralAtmosphere.resolved.physicalState.visibleEnvironment,
  dustyAtmosphere.resolved.physicalState.visibleEnvironment,
  'Changing atmospheric condition must not replace location geometry'
);
assert.equal(
  dustyAtmosphere.knowledgeDecisions.find(r => r.id === 'V20_OUTDOOR_AEROSOL_SCATTERING')?.active,
  true,
  'Dusty outdoor atmosphere should activate only the relevant aerosol knowledge rule'
);

console.log('dependencyIsolation tests passed');
