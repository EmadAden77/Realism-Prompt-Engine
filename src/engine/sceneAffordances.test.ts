import { MICRO_LOCATIONS } from '../data/microLocations';
import {
  deriveMicroPhysics,
  getStructuredPoseSuggestions,
  resolveStructuredPoseSuggestion
} from './sceneAffordances';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error('Scene Affordance assertion failed: ' + message);
};

console.log('▶ Scene Affordances 1: meeting room binds chair + table contact');
const meeting = getStructuredPoseSuggestions('military-base', 'غرفة اجتماعات عادية');
assert(meeting[0].labelAR === 'جالس على كرسي أمام طاولة الاجتماعات', 'Meeting room must prioritize chair/table pose');
assert(meeting[0].supportSurface === 'conference chair', 'Meeting room must expose conference-chair support');
assert(meeting[0].contactObject === 'meeting table', 'Meeting room must expose meeting-table contact');
assert(/occlud/i.test(meeting[0].physics), 'Meeting room physics must encode tabletop occlusion');

console.log('▶ Scene Affordances 2: bedroom lying encodes mattress + pillow deformation');
const lying = resolveStructuredPoseSuggestion('bedroom', 'مستلقٍ على السرير', 'مستلقي على السرير');
assert(lying.stance === 'lying', 'Bed lying pose must resolve as lying');
assert(lying.supportSurface === 'mattress', 'Bed lying pose must use mattress support');
assert(/pillow/i.test(lying.physics), 'Bed lying pose must encode pillow deformation');
assert(/compress/i.test(lying.physics), 'Bed lying pose must encode mattress compression');

console.log('▶ Scene Affordances 3: cafe seat uses chair and table rather than a generic sitting label');
const cafe = getStructuredPoseSuggestions('saudi-outdoor', 'أمام مقهى محلي');
assert(cafe[0].supportSurface === 'cafe chair', 'Cafe suggestion must bind to a cafe chair');
assert(cafe[0].contactObject === 'cafe table', 'Cafe suggestion must bind to a cafe table');
assert(cafe[0].labelAR.includes('طاولة المقهى'), 'Cafe label must expose the table geometry to the user');

console.log('▶ Scene Affordances 4: car exterior never defaults to an in-cabin seated pose');
const exteriorCar = getStructuredPoseSuggestions('car', 'بجانب باب السائق');
assert(exteriorCar[0].stance === 'standing', 'Exterior car scene must prioritize standing');
assert(exteriorCar[0].labelAR.includes('السيارة'), 'Exterior car pose must reference the vehicle');
assert(!exteriorCar[0].supportSurface?.includes('seat'), 'Exterior car pose must not use an interior seat');

console.log('▶ Scene Affordances 5: every micro-location exposes structured physical choices');
for (const family of Object.keys(MICRO_LOCATIONS) as Array<keyof typeof MICRO_LOCATIONS>) {
  for (const location of MICRO_LOCATIONS[family]) {
    const suggestions = getStructuredPoseSuggestions(family, location.labelAR);
    assert(suggestions.length >= 2, `${family}/${location.id} must expose at least two structured pose suggestions`);
    assert(new Set(suggestions.map(item => item.labelAR)).size === suggestions.length, `${family}/${location.id} labels must be unique`);
    for (const suggestion of suggestions) {
      assert(Boolean(suggestion.physics), `${family}/${location.id}/${suggestion.id} missing physics`);
      assert(Boolean(suggestion.promptAddon), `${family}/${location.id}/${suggestion.id} missing promptAddon`);
      assert(!/24\s*mm/i.test(suggestion.promptAddon), `${family}/${location.id}/${suggestion.id} must not introduce 24mm optics`);
      assert(!/dutch angle/i.test(suggestion.promptAddon), `${family}/${location.id}/${suggestion.id} must not force Dutch-angle styling`);
    }
  }
}

console.log('▶ Scene Affordances 6: seated selfie drives fabric/contact physics');
const seatedSelfie = deriveMicroPhysics({
  familyId: 'military-base',
  subScene: 'غرفة اجتماعات عادية',
  pose: 'جالس على كرسي أمام طاولة الاجتماعات',
  captureType: 'front-selfie',
  timeOfDay: 'midday',
  lightingIntensity: 70
});
assert(seatedSelfie.stance === 'sitting', 'Meeting selfie must remain sitting');
assert(seatedSelfie.fabricTension.some(text => /waist|hips|lap/i.test(text)), 'Sitting must create waist/hip/lap fabric bunching');
assert(seatedSelfie.fabricTension.some(text => /phone-holding|extended arm/i.test(text)), 'Front selfie must create arm-side garment tension');
assert(seatedSelfie.eyeConvergence.includes('Xiaomi 15 Ultra'), 'Front selfie gaze physics must stay tied to Xiaomi front camera');
assert(seatedSelfie.realismGuards.some(text => /21mm/i.test(text)), 'Front selfie guard must preserve approx 21mm geometry');

console.log('▶ Scene Affordances 7: sensor artifacts are conditional, not a permanent defect');
const brightDay = deriveMicroPhysics({
  familyId: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  pose: 'واقف بثبات',
  captureType: 'front-selfie',
  timeOfDay: 'midday',
  lightingIntensity: 85
});
assert(brightDay.sensorArtifacts.some(text => /micro-contrast/i.test(text)), 'Bright daylight should use normal smartphone micro-contrast');
assert(!brightDay.sensorArtifacts.some(text => /low-light luminance noise/i.test(text)), 'Bright daylight must not force low-light noise');

const dimNight = deriveMicroPhysics({
  familyId: 'saudi-outdoor',
  subScene: 'شارع تجاري محلي',
  pose: 'واقف بثبات',
  captureType: 'front-selfie',
  timeOfDay: 'night',
  lightingIntensity: 35
});
assert(dimNight.sensorArtifacts.some(text => /low-light luminance noise/i.test(text)), 'Dim night should expose restrained mobile sensor noise');

console.log('✓ Structured scene affordance + micro-physics regression suite passed.');
