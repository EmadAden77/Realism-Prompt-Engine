import assert from 'node:assert/strict';
import { createSceneManifest } from './causalPipeline';
import { compileKnowledgeFragments } from './promptCompiler';
import type { SceneState } from './physicsEngine';

const baseOutdoor: SceneState = {
  referenceImageId: 'ref.jpg',
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

const baseManifest = createSceneManifest(baseOutdoor, 'neutral');
const byId = (id: string) => baseManifest.knowledgeDecisions.find(rule => rule.id === id)!;

assert.equal(byId('V20_LIGHT_SOURCE_CAUSALITY').active, true);
assert.equal(byId('V20_DEPTH_PARALLAX').active, true);
assert.equal(byId('V20_OUTDOOR_AEROSOL_SCATTERING').active, false);
assert.equal(byId('V20_WET_SURFACE_REFLECTIONS').active, false);
assert.equal(byId('V20_COMPRESSION_ARTIFACTS').active, false);
assert.equal(byId('V20_SEASONAL_WEATHER').active, false);

const emitted = compileKnowledgeFragments(baseManifest.knowledgeDecisions);
const emittedIds = emitted.flatMap(fragment => fragment.provenance.ruleIds);
assert(emittedIds.includes('V20_LIGHT_SOURCE_CAUSALITY'));
assert(emittedIds.includes('V20_DEPTH_PARALLAX'));
assert(!emittedIds.includes('V20_WET_SURFACE_REFLECTIONS'));
assert(!emittedIds.includes('V20_COMPRESSION_ARTIFACTS'));

const dusty = createSceneManifest(
  { ...baseOutdoor, atmosphericCondition: 'dusty-haze' },
  'neutral'
);
assert.equal(
  dusty.knowledgeDecisions.find(rule => rule.id === 'V20_OUTDOOR_AEROSOL_SCATTERING')?.active,
  true
);

const breezy = createSceneManifest(
  { ...baseOutdoor, atmosphericCondition: 'breezy' },
  'neutral'
);
assert.equal(
  breezy.knowledgeDecisions.find(rule => rule.id === 'V20_WIND_DIRECTION_SYNC')?.active,
  true
);

const worn = createSceneManifest(
  { ...baseOutdoor, clothingCondition: 'worn-all-day' },
  'neutral'
);
assert.equal(
  worn.knowledgeDecisions.find(rule => rule.id === 'V20_MATERIAL_WEAR_RESPONSE')?.active,
  true
);

const bedroom = createSceneManifest(
  {
    ...baseOutdoor,
    sceneFamily: 'bedroom',
    subScene: 'جانب السرير',
    activity: 'جالس',
    pose: 'جالس على حافة السرير',
    lightingMode: 'إضاءة أباجورة دافئة',
    atmosphericCondition: 'neutral',
  },
  'neutral'
);
assert.equal(
  bedroom.knowledgeDecisions.find(rule => rule.id === 'V20_FIXED_HOME_CONTINUITY')?.active,
  true
);
assert.equal(
  bedroom.knowledgeDecisions.find(rule => rule.id === 'V20_INDOOR_MIE_GUARD')?.active,
  true
);
assert.equal(
  bedroom.knowledgeDecisions.find(rule => rule.id === 'V20_OUTDOOR_AEROSOL_SCATTERING')?.active,
  false
);

console.log('v20Phase2 tests passed');
