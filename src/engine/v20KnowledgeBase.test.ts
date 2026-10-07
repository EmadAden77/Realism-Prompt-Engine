import assert from 'node:assert/strict';
import { evaluateV20Knowledge } from './v20KnowledgeBase';
import type { SceneState } from './physicsEngine';

const base: SceneState = {
  referenceImageId: 'ref.jpg',
  sceneFamily: 'bedroom',
  subScene: 'غرفة نوم',
  activity: 'جالس',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'جالس على حافة السرير',
  outfitId: 'cas1',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إضاءة أباجورة دافئة',
  environmentRealism: 'عادية وطبيعية',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 30,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const get = (state: SceneState, id: string) =>
  evaluateV20Knowledge(state).find(rule => rule.id === id)!;

assert.equal(get(base, 'V20_FIXED_HOME_CONTINUITY').active, true);
assert.equal(get(base, 'V20_INDOOR_MIE_GUARD').active, true);
assert.equal(get(base, 'V20_OUTDOOR_AEROSOL_SCATTERING').active, false);
assert.equal(get(base, 'V20_WET_SURFACE_REFLECTIONS').active, false);
assert.equal(get(base, 'V20_SAME_MOMENT_CONTINUITY').active, false);
assert.equal(get(base, 'V20_GENERIC_MICRO_IMPERFECTIONS').active, false);

const dustyOutdoor: SceneState = {
  ...base,
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  atmosphericCondition: 'dusty-haze',
};
assert.equal(get(dustyOutdoor, 'V20_OUTDOOR_AEROSOL_SCATTERING').active, true);
assert.equal(get(dustyOutdoor, 'V20_INDOOR_MIE_GUARD').active, false);

const breezy: SceneState = { ...dustyOutdoor, atmosphericCondition: 'breezy' };
assert.equal(get(breezy, 'V20_WIND_DIRECTION_SYNC').active, true);

const throughGlass: SceneState = { ...base, foregroundObstruction: 'through-glass' };
assert.equal(get(throughGlass, 'V20_GLASS_LAYERING').active, true);

const smudged: SceneState = { ...base, lensCondition: 'smudged-lens' };
assert.equal(get(smudged, 'V20_LENS_CONTAMINATION').active, true);

console.log('v20KnowledgeBase tests passed');
