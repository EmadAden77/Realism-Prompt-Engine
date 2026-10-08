import assert from 'node:assert/strict';
import { createSceneManifest } from './causalPipeline';
import { compileKnowledgeFragments } from './promptCompiler';
import { resolveHomeContinuity } from './fixedHomeContinuity';
import type { SceneState } from './physicsEngine';

const bedroomBase: SceneState = {
  referenceImageId: 'ref.jpg',
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  activity: 'جالس',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'جالس على حافة السرير',
  outfitId: 'burgundy_shirt_grey_trousers',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إضاءة أباجورة دافئة',
  environmentRealism: 'طبيعية',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 35,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const bedroom = createSceneManifest(bedroomBase, 'neutral');
assert(bedroom.continuityContext, 'Bedroom must resolve fixed-home continuity');
assert.equal(bedroom.continuityContext?.roomId, 'bedroom');
assert.equal(bedroom.continuityContext?.mode, 'persistent-environment');
assert.equal(bedroom.continuityContext?.transientAnchors.length, 0);
assert(
  bedroom.continuityContext?.permanentAnchors.some(anchor => anchor.includes('180 cm master bed')),
  'Bedroom continuity must lock the 180 cm master bed'
);
assert(
  bedroom.continuityContext?.permanentAnchors.some(anchor => anchor.includes('white sliding-door wardrobe')),
  'Bedroom continuity must lock the white sliding wardrobe'
);

const changedLighting = createSceneManifest(
  { ...bedroomBase, lightingMode: 'إضاءة شاشة الهاتف فقط', lightingIntensity: 10 },
  'neutral'
);
assert.deepEqual(
  changedLighting.continuityContext?.permanentAnchors,
  bedroom.continuityContext?.permanentAnchors,
  'Changing lighting must not change fixed furniture or architecture'
);
assert.deepEqual(
  changedLighting.continuityContext?.wearAnchors,
  bedroom.continuityContext?.wearAnchors,
  'Changing lighting must not move persistent wear'
);

const changedSubScene = createSceneManifest(
  { ...bedroomBase, subScene: 'أمام الدولاب', pose: 'واقف بثبات' },
  'neutral'
);
assert.equal(
  changedSubScene.continuityContext?.continuityKey,
  bedroom.continuityContext?.continuityKey,
  'Changing micro-location within the same bedroom must keep the same room continuity key'
);
assert.deepEqual(
  changedSubScene.continuityContext?.permanentAnchors,
  bedroom.continuityContext?.permanentAnchors,
  'Changing bedroom micro-location must not replace fixed bedroom anchors'
);

const changedOutfit = createSceneManifest(
  { ...bedroomBase, outfitId: 'navy_shirt_grey_trousers', expression: 'e3' },
  'neutral'
);
assert.deepEqual(
  changedOutfit.continuityContext,
  bedroom.continuityContext,
  'Outfit/expression changes must not modify home continuity'
);

const fixedHomeRule = bedroom.knowledgeDecisions.find(
  rule => rule.id === 'V20_FIXED_HOME_CONTINUITY'
);
assert.equal(fixedHomeRule?.active, true);
assert.match(fixedHomeRule?.visibleConsequence || '', /Fixed-home continuity key/i);
assert.match(fixedHomeRule?.visibleConsequence || '', /fixed-home anchors win/i);
assert.doesNotMatch(
  fixedHomeRule?.visibleConsequence || '',
  /180 cm master bed/,
  'Continuity guard must not duplicate furniture already compiled into the visible environment'
);
assert.match(bedroom.resolved.physicalState.visibleEnvironment, /180 cm master bed/);
assert.match(bedroom.resolved.physicalState.visibleEnvironment, /white ceramic-base bedside lamp/);
assert.doesNotMatch(bedroom.resolved.physicalState.visibleEnvironment, /sliding-door wardrobe/);

const fragments = compileKnowledgeFragments(bedroom.knowledgeDecisions);
const fixedHomeFragment = fragments.find(
  fragment => fragment.provenance.ruleIds.includes('V20_FIXED_HOME_CONTINUITY')
);
assert(fixedHomeFragment, 'Compiled prompt must include the active fixed-home continuity guard');
assert.match(fixedHomeFragment?.text || '', /already compiled in the environment description/i);
assert.doesNotMatch(fixedHomeFragment?.text || '', /white ceramic-base bedside lamp/);
assert.match(fixedHomeFragment?.text || '', /Allowed to vary: lighting state/);

const livingRoom = createSceneManifest(
  {
    ...bedroomBase,
    sceneFamily: 'living-room',
    subScene: 'بجانب الكنبة',
    pose: 'واقف بثبات',
    lightingMode: 'إضاءة سقف',
  },
  'neutral'
);
assert.equal(livingRoom.continuityContext?.roomId, 'living-room');
assert(
  livingRoom.continuityContext?.permanentAnchors.some(anchor => anchor.includes('single coherent L-shaped grey fabric sectional sofa footprint')),
  'Living-room continuity must lock one coherent grey L-shaped sectional footprint'
);
assert(
  livingRoom.continuityContext?.permanentAnchors.some(anchor => anchor.includes('55-inch television')),
  'Living-room continuity must lock the 55-inch TV'
);
assert.notEqual(
  livingRoom.continuityContext?.continuityKey,
  bedroom.continuityContext?.continuityKey,
  'Different home rooms must have distinct continuity keys'
);
assert(
  livingRoom.continuityContext?.permanentAnchors.some(anchor => anchor.includes('low modern media-unit')),
  'Living-room continuity must keep the TV on one fixed modern media wall'
);
const livingRoomFragments = compileKnowledgeFragments(livingRoom.knowledgeDecisions);
const livingRoomFragment = livingRoomFragments.find(
  fragment => fragment.provenance.ruleIds.includes('V20_FIXED_HOME_CONTINUITY')
);
assert.match(livingRoomFragment?.text || '', /modern Saudi family living room/i);
assert.match(livingRoomFragment?.text || '', /never a traditional majlis/i);

const outdoor = resolveHomeContinuity({
  ...bedroomBase,
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
});
assert.equal(outdoor, null, 'Outdoor scenes must not inherit the fixed-home context');

console.log('fixedHomeContinuity tests passed');
