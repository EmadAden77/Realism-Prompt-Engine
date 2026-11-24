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
assert.match(bedroom.outfit, /No unauthorized additions, omissions, swaps, recoloring/);

for (const family of ['gym', 'saudi-outdoor', 'car', 'military-base', 'living-room'] as const) {
  const scene = compile({ ...base, sceneFamily: family, subScene: '', pose: 'واقف بثبات' });
  assert.match(scene.outfit, /LOCKED COMPLETE OUTFIT/, 'Fixed outfit survives ' + family);
  assert.match(scene.outfit, /burgundy|wine/i, 'Selected outfit persists in ' + family);
}
const oldSaved = compile({ ...base, outfitLocked: undefined });
assert.match(oldSaved.outfit, /LOCKED COMPLETE OUTFIT/, 'Old saved states should lock by default');
console.log('✅ Complete fixed outfit keeps garment identity across scenes and ignores legacy per-piece controls');

// The complete wardrobe must stay present and in a stable order for every scene.
assert.equal(OUTFITS.length, 19, 'Wardrobe consists of 15 reference color combinations and four Saudi thobes');
assert.equal(new Set(OUTFITS.map(item => item.id)).size, OUTFITS.length, 'Every outfit ID must be unique');
assert.deepEqual(filterClothingOutfits().map(item => item.id), OUTFITS.map(item => item.id),
  'Opening the clothes list must show the entire static catalog, never a 12-item suggestion subset');
for (const category of CLOTHING_CATEGORIES.filter(item => item.id !== 'all')) {
  const matches = filterClothingOutfits(category.id);
  assert.ok(matches.length > 0, 'Category must be accessible at all times: ' + category.labelAR);
}
assert.equal(filterClothingOutfits('traditional').length, 4, 'The four Saudi thobes must be present');
assert.deepEqual(filterClothingOutfits().map(item => item.id), OUTFITS.map(item => item.id),
  'Searching or filtering must not mutate the fixed wardrobe order');
const stableOutfit = 'thobe_light_grey';
for (const family of ['bedroom', 'gym', 'saudi-outdoor', 'car', 'military-base', 'living-room'] as const) {
  const scene = compile({ ...base, outfitId: stableOutfit, sceneFamily: family, subScene: '' });
  assert.match(scene.outfit, /light cool-grey traditional Saudi thobe/i, 'Selected Saudi thobe stays unchanged in ' + family);
}
console.log('✅ Reference-only wardrobe, categories, search, and cross-scene locks');

// Optional outerwear must stay separate from the selected base outfit.
const withJacket = compile({ ...base, jacketId: 'long_black_puffer' });
assert.match(withJacket.outfit, /long matte-black insulated puffer parka/i);
assert.match(withJacket.outfit, /burgundy|wine/i);
assert.match(withJacket.outfit, /grey/i);
const withVest = compile({ ...base, jacketId: 'camel_quilted_vest' });
assert.match(withVest.outfit, /camel-brown suede-like sleeveless padded vest/i);
assert.match(compile({ ...base, jacketId: 'none' }).outfit, /NO OUTERWEAR/);
assert.doesNotMatch(compile({ ...base, jacketId: 'none' }).outfit, /ADD SELECTED OUTERWEAR/);

assert.match(withVest.outfit, /separately selected optional outerwear is allowed/i,
  'Locked outfit instructions must explicitly permit the selected jacket');
assert.doesNotMatch(withVest.outfit, /No additions, omissions, swaps/i,
  'Old blanket prohibition conflicts with an explicitly selected jacket');
