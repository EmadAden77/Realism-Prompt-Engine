import assert from 'node:assert/strict';
import { createSceneManifest } from './causalPipeline';
import type { SceneState } from './physicsEngine';

const base: SceneState = {
  referenceImageId: 'ref.jpg',
  sceneFamily: 'bedroom',
  subScene: 'أمام المرآة',
  activity: 'واقف',
  captureType: 'mirror-selfie',
  framing: 'half-body',
  cameraAngle: 'eye-level',
  pose: 'واقف بثبات',
  outfitId: 'burgundy_shirt_grey_trousers',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إضاءة سقف',
  environmentRealism: 'طبيعية',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 45,
  shadowDepth: 55,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const mirror = createSceneManifest(base, 'neutral');
const mirrorEnv = mirror.resolved.physicalState.visibleEnvironment;
assert.match(mirrorEnv, /same fixed master bedroom/i);
assert.match(mirrorEnv, /sliding-door wardrobe/i);
assert.doesNotMatch(
  mirrorEnv,
  /perfume bottles|watch tray|dressing table|vanity glass top/i,
  'Generic vanity furniture must not override the fixed wardrobe-mirror identity'
);

const sofa = createSceneManifest(
  {
    ...base,
    sceneFamily: 'living-room',
    subScene: 'بجانب الكنبة',
    captureType: 'front-selfie',
    framing: 'chest-up',
    lightingMode: 'إضاءة سقف',
  },
  'neutral'
);
const sofaEnv = sofa.resolved.physicalState.visibleEnvironment;
assert.match(sofaEnv, /same fixed family living room/i);
assert.match(sofaEnv, /single coherent L-shaped grey fabric sectional sofa footprint/i);
assert.match(sofaEnv, /light-grey rug/i);
assert.match(sofaEnv, /modern Saudi family living room/i);
assert.doesNotMatch(
  sofaEnv,
  /embroidered decorative throw cushion|acrylic tissue box|Persian/i,
  'Generic living-room decoration must not replace the fixed-home furniture identity'
);

const tv = createSceneManifest(
  {
    ...base,
    sceneFamily: 'living-room',
    subScene: 'أمام التلفاز',
    captureType: 'front-selfie',
    framing: 'chest-up',
    lightingMode: 'إضاءة سقف',
  },
  'neutral'
);
const tvEnv = tv.resolved.physicalState.visibleEnvironment;
assert.match(tvEnv, /55-inch television/i);
assert.doesNotMatch(
  tvEnv,
  /soundbar|family photo frame|satellite receiver|gaming console/i,
  'TV micro-location must not inject unapproved electronics into the fixed home'
);

const outdoor = createSceneManifest(
  {
    ...base,
    sceneFamily: 'saudi-outdoor',
    subScene: 'شارع فلل سكني',
    captureType: 'front-selfie',
    lightingMode: 'إنارة شارع دافئة',
  },
  'neutral'
);
assert.doesNotMatch(
  outdoor.resolved.physicalState.visibleEnvironment,
  /same fixed master bedroom|same fixed family living room/i,
  'Fixed-home compiler must never leak into outdoor scenes'
);

console.log('homeEnvironmentCompiler tests passed');
