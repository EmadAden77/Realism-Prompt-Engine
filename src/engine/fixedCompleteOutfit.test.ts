import assert from 'node:assert/strict';
import { buildSemanticScene } from './semanticSceneCompiler';
import { resolveScene, type SceneState } from './physicsEngine';
import { OUTFITS, CLOTHING_CATEGORIES, filterClothingOutfits } from '../data/clothingOutfits';
import type { DerivedSceneState } from './realismDeriver';

const base: SceneState = {
  referenceImageId: 'face.jpg', sceneFamily: 'bedroom',
  subScene: 'جالس على حافة السرير', activity: 'جالس بهدوء',
  captureType: 'front-selfie', framing: 'chest-up',
  cameraAngle: 'eye-level', pose: 'جالس على حافة السرير',
  outfitId: 'burgundy_shirt_grey_trousers', outfitLocked: true,
  outfitWearStyle: 'sporty', garmentWearContext: 'post-workout',
  shirtTuck: 'half-tuck', sleeveStyle: 'rolled-forearm',
  shirtButtons: 'top-two-open', collarStyle: 'relaxed',
  timeOfDay: 'night', lightingMode: 'إضاءة سقف دافئة 3000K',
  environmentRealism: 'مستخدمة يوميًا', realismStyle: 'anti-ai-raw',
  hairStyle: 'h1', expression: 'e1', glassesMode: 'match_reference',
  lightingIntensity: 60, shadowDepth: 60, lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp', atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean', muscleFatigue: 'none'
};
const outfit = OUTFITS.find(x => x.id === base.outfitId);
assert.ok(outfit, 'Selected full outfit must exist');
const derived = {
  skinResponse: 'natural skin', hairCondition: 'natural',
  fabricBehavior: ['realistic folds'], shadowBehavior: 'natural shadows',
  environmentalLightBehavior: 'room bounce', cameraDistance: '52cm',
  visibleBackgroundElements: ['headboard'], contactPhysics: ['handheld selfie'],
  reflectionRules: [], realismConstraints: [], lensEffects: 'sensor noise',
  atmosphericEffects: 'normal room air', muscleFatigueEffects: 'none',
  lightingIntensityDescription: 'natural', shadowDepthDescription: 'physical'
} as DerivedSceneState;
function compile(state: SceneState) {
  const res = resolveScene(state);
  return buildSemanticScene(res.state, derived, res.physicalState);
}
const bedroom = compile(base);
assert.match(bedroom.outfit, /LOCKED COMPLETE OUTFIT/);
assert.match(bedroom.outfit, /burgundy|wine/i);
assert.match(bedroom.outfit, /grey/i);
assert.doesNotMatch(bedroom.outfit, /half.tuck|rolled.forearm|top two buttons|post.workout|sporty look/i);
assert.match(bedroom.outfit, /No additions, omissions, swaps, recoloring/);

for (const family of ['gym', 'saudi-outdoor', 'car', 'military-base', 'living-room'] as const) {
  const scene = compile({ ...base, sceneFamily: family, subScene: '', pose: 'واقف بثبات' });
  assert.match(scene.outfit, /LOCKED COMPLETE OUTFIT/, 'Fixed outfit survives ' + family);
  assert.match(scene.outfit, /burgundy|wine/i, 'Selected outfit persists in ' + family);
}
const oldSaved = compile({ ...base, outfitLocked: undefined });
assert.match(oldSaved.outfit, /LOCKED COMPLETE OUTFIT/, 'Old saved states should lock by default');
console.log('✅ Complete fixed outfit keeps garment identity across scenes and ignores legacy per-piece controls');

// The complete wardrobe must stay present and in a stable order for every scene.
assert.ok(OUTFITS.length >= 99, 'The permanently available wardrobe must remain extensive');
assert.equal(new Set(OUTFITS.map(item => item.id)).size, OUTFITS.length, 'Every outfit ID must be unique');
assert.deepEqual(filterClothingOutfits().map(item => item.id), OUTFITS.map(item => item.id),
  'Opening the clothes list must show the entire static catalog, never a 12-item suggestion subset');
for (const category of CLOTHING_CATEGORIES.filter(item => item.id !== 'all')) {
  const matches = filterClothingOutfits(category.id);
  assert.ok(matches.length > 0, 'Category must be accessible at all times: ' + category.labelAR);
}
assert.ok(filterClothingOutfits('home', 'شورت').length >= 5,
  'The home clothing list must expose several complete T-shirt and shorts sets');
assert.deepEqual(filterClothingOutfits().map(item => item.id), OUTFITS.map(item => item.id),
  'Searching or filtering must not mutate the fixed wardrobe order');
const stableOutfit = 'home_grey_tee_white_shorts';
for (const family of ['bedroom', 'gym', 'saudi-outdoor', 'car', 'military-base', 'living-room'] as const) {
  const scene = compile({ ...base, outfitId: stableOutfit, sceneFamily: family, subScene: '' });
  assert.match(scene.outfit, /grey.*T-shirt.*white.*shorts/i, 'Selected home clothes stay unchanged in ' + family);
}
console.log('✅ Permanent 99-outfit wardrobe, categories, search, and cross-scene locks');
