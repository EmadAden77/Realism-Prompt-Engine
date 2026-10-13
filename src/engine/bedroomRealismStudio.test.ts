import assert from 'node:assert/strict';
import { MICRO_LOCATIONS } from '../data/microLocations';
import { buildSemanticScene } from './semanticSceneCompiler';
import { resolveScene, type SceneState } from './physicsEngine';
import type { DerivedSceneState } from './realismDeriver';
import { BEDROOM_INTERACTIVE_SELFIES, resolveBedroomSelfieActivity } from './bedroomSelfieAffordances';
import {
  BEDROOM_REALISM_PRESETS, BEDROOM_BEDDING_OPTIONS, BEDROOM_COMPOSITION_OPTIONS,
  bedroomActionForPreset, buildBedroomRealismPrompt, getBedroomRecommendedActivities
} from './bedroomRealismStudio';

const labels = new Set(MICRO_LOCATIONS.bedroom.map(v => v.labelAR));
const ids = new Set<string>();
for (const action of BEDROOM_INTERACTIVE_SELFIES) {
  assert.ok(!ids.has(action.id), 'Every action must have a distinct ID: ' + action.id);
  ids.add(action.id);
  assert.ok(labels.has(action.subScene), 'Every interactive pose must exist inside actual bedroom geometry: ' + action.id);
  assert.match(action.contact, /phone|smartphone|camera|capture/i,
    'Keep a capturing smartphone supported by exactly one arm: ' + action.id);
}
assert.ok(BEDROOM_INTERACTIVE_SELFIES.length >= 26, 'Expanded bedroom catalog must exceed 25 practical actions');
assert.equal(BEDROOM_BEDDING_OPTIONS.length, 4);
assert.equal(BEDROOM_COMPOSITION_OPTIONS.length, 4);
assert.ok(BEDROOM_REALISM_PRESETS.length >= 8);

for (const preset of BEDROOM_REALISM_PRESETS) {
  const action = bedroomActionForPreset(preset.id);
  assert.ok(action, 'Preset must link to a real supported interactive activity: ' + preset.id);
  assert.equal(resolveBedroomSelfieActivity({
    sceneFamily: 'bedroom', subScene: action.subScene, captureType: action.captureType,
    bedroomSelfieActionId: action.id
  }).status, 'ready', 'Preset must be geometrically compatible: ' + preset.id);
}

const base = {
  sceneFamily: 'bedroom', subScene: 'جالس فوق السرير', pose: 'جالس فوق السرير',
  timeOfDay: 'night', captureType: 'front-selfie', lightingMode: 'إضاءة أباجورة دافئة',
  environmentRealism: 'مستخدمة يوميًا', bedroomBedding: 'slept-in',
  bedroomComposition: 'bed-context', bedroomSelfieActionId: 'bed-seated-duvet'
} as const;
const bed = buildBedroomRealismPrompt(base);
assert.match(bed, /5\.2m x 6\.2m/);
assert.match(bed, /160cm x 200cm/);
assert.match(bed, /mattress visibly compresses/);
assert.match(bed, /dark/);
assert.match(bed, /lateral practical/);
assert.match(bed, /no visible recording phone/i);
assert.match(bed, /design target|staging geometry/i);

const stand = buildBedroomRealismPrompt({
  ...base, subScene: 'بجانب طاولة السرير', pose: 'واقف بجانب طاولة السرير',
  bedroomSelfieActionId: 'bedside-water', bedroomBedding: 'fresh'
});
assert.match(stand, /No unexplained deep mattress impressions/);
assert.doesNotMatch(stand, /mattress visibly compresses/);

const solarNight = buildBedroomRealismPrompt({ ...base, lightingMode: 'ضوء نهاري طبيعي' });
assert.match(solarNight, /incompatible/);
assert.match(solarNight, /dark/);

const phoneNight = buildBedroomRealismPrompt({ ...base, lightingMode: 'فلاش الشاشة الأمامية فقط' });
assert.match(phoneNight, /Keep ceiling spots and bedside lamp off/);
assert.doesNotMatch(phoneNight, /ceiling spotlights provide actual downward illumination/i);

const mirror = buildBedroomRealismPrompt({
  ...base, subScene: 'أمام المرآة', pose: 'واقف أمام المرآة',
  bedroomSelfieActionId: 'mirror-watch', captureType: 'mirror-selfie'
});
assert.match(mirror, /one planar mirror/);
assert.match(mirror, /single visible recording phone/);

const outside = buildBedroomRealismPrompt({ ...base, sceneFamily: 'gym' });
assert.equal(outside, '', 'Non-bedroom scenes must not inherit bedroom construction constraints');

assert.equal(getBedroomRecommendedActivities('bed', 'night', 'bed-reclined')[0].id, 'bed-reclined',
  'Selected bedroom action should remain first in recommendations');

const sceneState = {
  ...base,
  referenceImageId: 'face.jpg', activity: 'جالس على السرير ويرتّب الغطاء',
  framing: 'chest-up', cameraAngle: 'eye-level', outfitId: 'thobe_white_summer',
  hairStyle: 'h1', expression: 'e1', realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference', lightingIntensity: 65, shadowDepth: 50,
  lensCondition: 'xiaomi-clean', clothingCondition: 'crisp',
  atmosphericCondition: 'neutral', foregroundObstruction: 'clean', muscleFatigue: 'none'
} as unknown as SceneState;
const resolved = resolveScene(sceneState);
const derived = {
  skinResponse: 'natural skin texture', hairCondition: 'natural hair',
  fabricBehavior: ['cotton drape'], shadowBehavior: 'physical shadows',
  environmentalLightBehavior: 'wall bounce', cameraDistance: '50cm',
  visibleBackgroundElements: ['duvet'], contactPhysics: ['arm holds phone'],
  reflectionRules: [], realismConstraints: [], lensEffects: 'low-light sensor noise',
  atmosphericEffects: 'ordinary air', muscleFatigueEffects: 'neutral',
  lightingIntensityDescription: 'practical', shadowDepthDescription: 'natural'
} as DerivedSceneState;
const compiled = buildSemanticScene(resolved.state, derived, resolved.physicalState);
assert.match(compiled.visibleEnvironment, /COHERENT BEDROOM ARCHITECTURE/);
assert.match(compiled.visibleEnvironment, /slept-in|pillow depression/);
assert.match(compiled.visibleEnvironment, /160cm x 200cm/);
console.log('✅ Bedroom realistic architecture, presets, full compiler and contact tests passed');
