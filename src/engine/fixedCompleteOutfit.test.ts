import assert from 'node:assert/strict';
import { buildSemanticScene } from './semanticSceneCompiler';
import { resolveScene, type SceneState } from './physicsEngine';
import { OUTFITS } from '../data/clothingOutfits';
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
