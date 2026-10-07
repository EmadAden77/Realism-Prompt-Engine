import assert from 'node:assert/strict';
import { resolveScene, type SceneState } from './physicsEngine';
import { deriveSaudiStreetRealism } from './saudiStreetRealism';
import { evaluateV20Knowledge } from './v20KnowledgeBase';
import {
  SAUDI_STREET_REALISM_LIBRARY,
  getSaudiStreetRulesByCategory,
} from '../data/saudiStreetRealismLibrary';

const base: SceneState = {
  referenceImageId: 'ref.jpg',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'واقف بشكل طبيعي',
  captureType: 'front-selfie',
  framing: 'half-body',
  cameraAngle: 'slightly-off-center',
  pose: 'واقف بثبات',
  outfitId: 'burgundy_shirt_grey_trousers',
  hairStyle: 'h1',
  hairPhysicsPreset: 'hp_auto',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إنارة شارع دافئة',
  environmentRealism: 'طبيعي',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 55,
  shadowDepth: 65,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  backgroundMode: 'active',
  backgroundHumans: 'light',
  backgroundVehicles: 'light',
  backgroundDisorder: 'moderate',
  backgroundActivity: 'active',
  backgroundPresence: 'visible',
  backgroundCompositionGoal: 'balanced',
  backgroundAutoAngle: true,
  backgroundGeminiAssist: false,
  cameraAngleMode: 'manual',
  groupSelfieEnabled: false,
  groupSelfieSize: 2,
  groupSelfieRelationship: 'auto',
};

assert(SAUDI_STREET_REALISM_LIBRARY.length >= 60);
for (const category of [
  'asphalt',
  'sidewalk',
  'buildings',
  'disorder',
  'car-movement',
  'car-types',
  'license-plates',
  'people',
  'people-clothing',
  'golden-rules',
] as const) {
  assert(
    getSaudiStreetRulesByCategory(category).length > 0,
    'Missing Saudi street category: ' + category
  );
}

const resolved = resolveScene(base);
const street = deriveSaudiStreetRealism(resolved.state, resolved.physicalState);

assert.equal(street.active, true);
assert.match(street.surface || '', /Saudi asphalt|neighborhood asphalt/i);
assert(street.architecture);
assert(street.disorder);
assert(street.vehicle);
assert(street.people);
assert(street.peopleClothing);
assert(street.sky);
assert(street.depth);
assert.match(street.guards.join(' '), /exactly one selected physical place/i);
assert.match(street.guards.join(' '), /at most one named background vehicle/i);

const vehicleText = street.vehicle || '';
const namedVehicleMatches = [
  /Camry/i,
  /Hilux/i,
  /Land Cruiser/i,
  /Corolla/i,
  /Yaris/i,
  /Accent/i,
].filter(regex => regex.test(vehicleText));
assert(
  namedVehicleMatches.length <= 1,
  'Auto street realism must never emit a catalog of multiple vehicle types'
);

const knowledge = evaluateV20Knowledge(
  resolved.state,
  resolved.physicalState
);
const get = (id: string) => knowledge.find(item => item.id === id)!;

assert.equal(get('SAUDI_STREET_GOLDEN_GUARDS').active, true);
assert.equal(get('SAUDI_STREET_GROUND_SURFACE').active, true);
assert.equal(get('SAUDI_STREET_SINGLE_VEHICLE').active, true);
assert.equal(get('SAUDI_STREET_BACKGROUND_PEOPLE').active, true);
assert.equal(get('SAUDI_STREET_NIGHT_SKY').active, true);
assert.equal(get('SAUDI_STREET_DEPTH_LAYERS').active, true);
assert.equal(get('SAUDI_STREET_GOLDEN_GUARDS').source, 'SAUDI_STREET_REALISM');

const clean = resolveScene({
  ...base,
  backgroundMode: 'off',
  backgroundHumans: 'none',
  backgroundVehicles: 'none',
  backgroundDisorder: 'very-clean',
  backgroundActivity: 'calm',
});
const cleanStreet = deriveSaudiStreetRealism(clean.state, clean.physicalState);
assert.equal(cleanStreet.people, undefined);
assert.equal(cleanStreet.vehicle, undefined);
assert.equal(cleanStreet.disorder, undefined);
assert(cleanStreet.surface, 'Physical ground surface should remain even when disorder is off');
assert.doesNotMatch(
  cleanStreet.surface || '',
  /cigarette|bottle cap|tissue|oil stain/i,
  'Surface geometry must not smuggle disorder into a clean scene'
);

const tight = resolveScene({
  ...base,
  framing: 'head-shoulders',
  backgroundHumans: 'high',
  backgroundVehicles: 'high',
});
const tightStreet = deriveSaudiStreetRealism(tight.state, tight.physicalState);
assert.equal(tightStreet.people, undefined);
assert.equal(tightStreet.vehicle, undefined);

const indoor: SceneState = {
  ...base,
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  lightingMode: 'إضاءة أباجورة دافئة',
};
assert.equal(deriveSaudiStreetRealism(indoor).active, false);
assert.equal(
  evaluateV20Knowledge(indoor).find(item => item.id === 'SAUDI_STREET_GROUND_SURFACE')?.active,
  false
);

console.log('saudiStreetRealism tests passed');
