// ============================================================================
// Automated Validation Test Suite for PhysFrame Physics & Realism Engine
// Tests combinations of:
// location × micro-location × capture mode × pose × day/night × lighting × glasses × outfit
// ============================================================================

import {
  resolveScene,
  validateScene,
  validatePrompt,
  SceneState,
  XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE
} from './physicsEngine';
import { MICRO_LOCATIONS, SceneFamilyId } from '../data/microLocations';
import { SELFIE_ANGLE_LIBRARY } from './selfieAngles';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('🧪 Starting Automated Validation Tests...\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test 1: Close-up car selfie at night
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('▶ Test 1: Close-up car selfie at night');
const carNightState: SceneState = {
  referenceImageId: '1000236308.png',
  sceneFamily: 'car',
  subScene: 'مقعد السائق والسيارة متوقفة',
  activity: 'استراحة هادئة',
  captureType: 'front-selfie',
  framing: 'head-shoulders', // TIGHT
  cameraAngle: 'eye-level',
  pose: 'جالس باسترخاء في المقعد',
  outfitId: 'cas1',
  hairStyle: 'h2',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'ضوء نهاري طبيعي', // Contradiction: daytime light at night!
  environmentRealism: 'عادية وطبيعية',
  realismStyle: 'anti-ai-raw',
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'worn-all-day',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  glassesMode: 'wear_glasses',
  lightingIntensity: 70,
  shadowDepth: 60
};

const resolvedCarNight = resolveScene(carNightState);
assert(resolvedCarNight.validation.isValid, 'Resolved car night scene must be physically valid');
assert(resolvedCarNight.state.lightingMode !== 'ضوء نهاري طبيعي', 'Daylight must be resolved to nocturnal car lighting');
assert(resolvedCarNight.physicalState.framingClass === 'tight', 'head-shoulders must classify as tight framing');
assert(resolvedCarNight.physicalState.fieldOfView.includes('90°'), 'Xiaomi 15 Ultra ~90° FOV must apply to front selfie');
assert(resolvedCarNight.physicalState.opticalPerspective.includes('21mm'), 'Xiaomi 15 Ultra 21mm wide-angle optics must apply');
assert(!resolvedCarNight.physicalState.visibleEnvironment.includes('street vanishing point'), 'Tight selfie must NOT include distant street elements');

const promptCarNight = validatePrompt(
  'A photo wearing black rectangular full-rim eyeglasses in midday sun.',
  resolvedCarNight,
  'eyeglasses, spectacles, waxy skin'
);
assert(!promptCarNight.cleanPrompt.includes('midday sun'), 'Nocturnal scene prompt must not contain midday sun');
assert(!promptCarNight.cleanNegativePrompt.includes('eyeglasses'), 'Negative prompt must not forbid eyeglasses when glasses are worn');
console.log('  ✓ Car night selfie passed!\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test 2: Wider residential street selfie
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('▶ Test 2: Wider residential street selfie');
const streetWideState: SceneState = {
  referenceImageId: '1000236308.png',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'يمشي بهدوء',
  captureType: 'front-selfie',
  framing: 'half-body', // WIDE
  cameraAngle: 'slightly-high',
  pose: 'واقف ومستقيم',
  outfitId: 'thobe1',
  hairStyle: 'h1',
  expression: 'e3',
  timeOfDay: 'afternoon',
  lightingMode: 'ضوء نهاري طبيعي',
  environmentRealism: 'عادية وطبيعية',
  realismStyle: 'anti-ai-raw',
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  glassesMode: 'no_glasses',
  lightingIntensity: 75,
  shadowDepth: 65,
  customIdentityPrompt: 'MUST wear dark rectangular eyeglasses.' // Contradiction!
};

const resolvedStreetWide = resolveScene(streetWideState);
assert(resolvedStreetWide.validation.isValid, 'Street wide scene must be physically valid');
assert(resolvedStreetWide.physicalState.framingClass === 'wide', 'half-body must classify as wide');
assert(resolvedStreetWide.physicalState.cameraDistance.includes('65-70cm'), 'Wide selfie must reflect extended arm reach');
assert(resolvedStreetWide.physicalState.armReach.includes('dominant arm extended'), 'Arm reach must be modeled physically');
assert(resolvedStreetWide.physicalState.opticalPerspective.includes('21mm'), 'Xiaomi 15 Ultra profile applies');
assert(!resolvedStreetWide.state.customIdentityPrompt?.includes('MUST wear dark rectangular eyeglasses'), 'Glasses contradiction resolved honoring user choice');

const promptStreetWide = validatePrompt(
  'Subject wearing black rectangular full-rim eyeglasses in afternoon sunlight.',
  resolvedStreetWide,
  'waxy skin'
);
assert(!promptStreetWide.cleanPrompt.includes('wearing black rectangular full-rim eyeglasses'), 'Prompt must not demand glasses when no_glasses is set');
console.log('  ✓ Wider residential street selfie passed!\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test 3: Office corridor selfie
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('▶ Test 3: Office corridor selfie');
const officeCorridorState: SceneState = {
  referenceImageId: '1000236308.png',
  sceneFamily: 'military-base',
  subScene: 'ممر إداري داخلي',
  activity: 'يمشي بهدوء',
  captureType: 'front-selfie',
  framing: 'chest-up', // MEDIUM
  cameraAngle: 'eye-level',
  pose: 'واقف ومستقيم',
  outfitId: 'mil_admin_tan_shirt',
  hairStyle: 'h2',
  expression: 'e1',
  timeOfDay: 'morning',
  lightingMode: 'إضاءة ممرات متوازية',
  environmentRealism: 'رسمية ومنظمة',
  realismStyle: 'anti-ai-raw',
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'worn-all-day',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  glassesMode: 'match_reference',
  lightingIntensity: 70,
  shadowDepth: 60
};

const resolvedOffice = resolveScene(officeCorridorState);
assert(resolvedOffice.validation.isValid, 'Office corridor must be physically valid');
assert(resolvedOffice.physicalState.framingClass === 'medium', 'chest-up must classify as medium');
assert(resolvedOffice.physicalState.visibleEnvironment.length > 0, 'Must have scene-aware background');
console.log('  ✓ Office corridor selfie passed!\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test 4: Covered parking daylight selfie
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('▶ Test 4: Covered parking daylight selfie');
const parkingState: SceneState = {
  referenceImageId: '1000236308.png',
  sceneFamily: 'saudi-outdoor',
  subScene: 'مواقف سيارات مظللة',
  activity: 'بجانب السيارة',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'slightly-off-center',
  pose: 'مستند على السيارة',
  outfitId: 'smart_casual_navy_grey',
  hairStyle: 'h2',
  expression: 'e2',
  timeOfDay: 'midday',
  lightingMode: 'ظل نهاري مع انعكاسات خفيفة',
  environmentRealism: 'عادية وطبيعية',
  realismStyle: 'anti-ai-raw',
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  glassesMode: 'wear_glasses',
  lightingIntensity: 75,
  shadowDepth: 65
};

const resolvedParking = resolveScene(parkingState);
assert(resolvedParking.validation.isValid, 'Parking scene must be valid');
assert(resolvedParking.physicalState.cameraYaw.includes('yaw'), 'Asymmetric camera angle must derive yaw offset');
console.log('  ✓ Covered parking daylight selfie passed!\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test 5: Bedroom night selfie
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('▶ Test 5: Bedroom night selfie');
const bedroomState: SceneState = {
  referenceImageId: '1000236308.png',
  sceneFamily: 'bedroom',
  subScene: 'على السرير',
  activity: 'مستلقي',
  captureType: 'front-selfie',
  framing: 'head-shoulders',
  cameraAngle: 'slightly-high',
  pose: 'مستلقي على السرير',
  outfitId: 'home1',
  hairStyle: 'h2',
  expression: 'e18',
  timeOfDay: 'night',
  lightingMode: 'إضاءة شاشة الهاتف فقط',
  environmentRealism: 'عادية وطبيعية',
  realismStyle: 'anti-ai-raw',
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'worn-all-day',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'heavy-eyelids',
  glassesMode: 'no_glasses',
  lightingIntensity: 25,
  shadowDepth: 85
};

const resolvedBedroom = resolveScene(bedroomState);
assert(resolvedBedroom.validation.isValid, 'Bedroom night scene must be valid');
assert(resolvedBedroom.physicalState.activityDensity === 'none', 'Bedroom must have zero unrelated background activity');
assert(resolvedBedroom.physicalState.visiblePeople.length === 0, 'No secondary humans in private bedroom');
console.log('  ✓ Bedroom night selfie passed!\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test 6: Mirror selfie without mirror vs with mirror
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('▶ Test 6: Mirror selfie validation');
const invalidMirrorState: SceneState = {
  referenceImageId: '1000236308.png',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'يمشي بهدوء',
  captureType: 'mirror-selfie', // IMPOSSIBLE: No mirror on outdoor street!
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف ومستقيم',
  outfitId: 'thobe1',
  hairStyle: 'h2',
  expression: 'e1',
  timeOfDay: 'midday',
  lightingMode: 'ضوء نهاري طبيعي',
  environmentRealism: 'عادية وطبيعية',
  realismStyle: 'anti-ai-raw',
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  glassesMode: 'wear_glasses',
  lightingIntensity: 70,
  shadowDepth: 60
};

const initialCheck = validateScene(invalidMirrorState);
assert(!initialCheck.isValid, 'Mirror selfie in outdoor street must be marked invalid before resolution');

const resolvedMirror = resolveScene(invalidMirrorState);
assert(resolvedMirror.validation.isValid, 'Resolved mirror must be valid');
assert(resolvedMirror.state.captureType === 'front-selfie', 'Outdoor mirror selfie must resolve to front-selfie');
console.log('  ✓ Mirror selfie resolution passed!\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test 7: Driver-seat selfie with standing pose conflict
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('▶ Test 7: Driver-seat selfie with standing pose');
const driverPoseConflict: SceneState = {
  referenceImageId: '1000236308.png',
  sceneFamily: 'car',
  subScene: 'مقعد السائق والسيارة متوقفة',
  activity: 'خلف المقود والسيارة متوقفة',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف ومستقيم', // IMPOSSIBLE inside car cabin!
  outfitId: 'smart_casual_white_navy',
  hairStyle: 'h2',
  expression: 'e1',
  timeOfDay: 'sunset',
  lightingMode: 'ساعة ذهبية (شروق/غروب)',
  environmentRealism: 'عادية وطبيعية',
  realismStyle: 'anti-ai-raw',
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  glassesMode: 'wear_glasses',
  lightingIntensity: 70,
  shadowDepth: 60
};

const resolvedDriver = resolveScene(driverPoseConflict);
assert(resolvedDriver.validation.isValid, 'Driver scene must be valid after resolution');
assert(!resolvedDriver.state.pose.includes('واقف'), 'Standing pose inside car cabin must be resolved to seated');
assert(resolvedDriver.physicalState.occlusions.some(o => o.includes('car door panel') || o.includes('steering wheel')), 'Car cabin occlusions must be computed');
console.log('  ✓ Driver-seat selfie passed!\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test 8: Exhaustive combination scan
// location × micro-location × capture mode × day/night × glasses
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('▶ Test 8: Exhaustive Combination Matrix Scan');
const families: SceneFamilyId[] = ['saudi-outdoor', 'military-base', 'car', 'bedroom', 'gym', 'living-room'];
const times: ('midday' | 'night')[] = ['midday', 'night'];
const glassesModes: ('wear_glasses' | 'no_glasses')[] = ['wear_glasses', 'no_glasses'];
let combinationsTested = 0;

for (const fam of families) {
  const subScenes = MICRO_LOCATIONS[fam].slice(0, 3);
  for (const sub of subScenes) {
    for (const time of times) {
      for (const gMode of glassesModes) {
        const testState: SceneState = {
          referenceImageId: '1000236308.png',
          sceneFamily: fam,
          subScene: sub.labelAR,
          activity: 'طبيعي',
          captureType: 'front-selfie',
          framing: 'chest-up',
          cameraAngle: 'eye-level',
          pose: fam === 'car' ? 'جالس في مقعد الراكب' : 'واقف ومستقيم',
          outfitId: 'cas1',
          hairStyle: 'h2',
          expression: 'e1',
          timeOfDay: time,
          lightingMode: time === 'night' ? 'إنارة شارع دافئة' : 'ضوء نهاري طبيعي',
          environmentRealism: 'عادية',
          realismStyle: 'anti-ai-raw',
          lensCondition: 'xiaomi-clean',
          clothingCondition: 'worn-all-day',
          atmosphericCondition: 'neutral',
          foregroundObstruction: 'clean',
          muscleFatigue: 'none',
          glassesMode: gMode,
          lightingIntensity: 70,
          shadowDepth: 60
        };

        const resolved = resolveScene(testState);
        if (!resolved.validation.isValid) {
          console.error('Combination debug:', JSON.stringify({
            family: fam,
            subScene: sub.id,
            resolvedActivity: resolved.state.activity,
            resolvedPose: resolved.state.pose,
            lightingMode: resolved.state.lightingMode,
            validation: resolved.validation,
            plausibility: resolved.physicalState.plausibility
          }, null, 2));
        }
        assert(resolved.validation.isValid, `Combination ${fam} / ${sub.id} / ${time} / ${gMode} must be valid`);
        combinationsTested++;
      }
    }
  }
}

console.log(`  ✓ All ${combinationsTested} combinations resolved without physical contradictions!\n`);


console.log('▶ Test 9: Xiaomi camera lock and front-selfie foreground topology');
const cameraLockState: SceneState = {
  ...streetWideState,
  captureType: 'front-selfie',
  lensCondition: 'modern-iphone',
  foregroundObstruction: 'through-glass'
};
const resolvedCameraLock = resolveScene(cameraLockState);
assert(resolvedCameraLock.state.lensCondition === 'xiaomi-clean', 'Legacy iPhone lens condition must normalize to Xiaomi clean front-camera profile');
assert(resolvedCameraLock.state.foregroundObstruction === 'clean', 'Direct front selfie cannot place window glass between camera and face');
assert(resolvedCameraLock.physicalState.opticalPerspective.includes('21mm'), 'Front-selfie optics must remain Xiaomi 15 Ultra 21mm equivalent');

console.log('▶ Test 10: Phone-screen-only lighting causality');
const phoneOnlyOverbright: SceneState = {
  ...bedroomState,
  lightingMode: 'إضاءة شاشة الهاتف فقط',
  lightingIntensity: 95,
  shadowDepth: 20
};
const resolvedPhoneOnly = resolveScene(phoneOnlyOverbright);
assert(resolvedPhoneOnly.state.lightingIntensity <= 35, 'Phone-screen-only lighting must not create room-scale brightness');
assert(resolvedPhoneOnly.state.shadowDepth >= 75, 'Phone-screen-only lighting must preserve deep falloff/shadows');

console.log('▶ Test 11: Final prompt camera contamination purifier');
const contaminatedPrompt = validatePrompt(
  'Front selfie photographed with an iPhone front-camera using a 24mm-28mm eq wide lens.',
  resolvedCameraLock,
  ''
);
assert(!contaminatedPrompt.cleanPrompt.includes('24mm-28mm'), 'Wrong 24-28mm focal range must be removed from Xiaomi selfie prompt');
assert(contaminatedPrompt.cleanPrompt.includes('21mm'), 'Final prompt must restore the 21mm equivalent Xiaomi camera lock');
assert(contaminatedPrompt.cleanPrompt.includes('Xiaomi 15 Ultra front camera'), 'iPhone front-camera wording must be replaced');


console.log('▶ Test 12: Scene-aware bedroom close-up background restraint');
assert(resolvedBedroom.physicalState.backgroundRealism.visibilityClass === 'minimal', 'Close bedroom selfie must use minimal background visibility');
assert(!resolvedBedroom.physicalState.backgroundRealism.allowsHumans, 'Private bedroom close-up must forbid random background humans');
assert(!resolvedBedroom.physicalState.backgroundRealism.allowsVehicles, 'Private bedroom close-up must forbid background vehicles');
assert(resolvedBedroom.physicalState.backgroundRealism.environmentalSurfaces.length <= 1, 'Tight bedroom framing must expose at most one immediate background surface');

console.log('▶ Test 13: Wider Saudi residential street background life');
assert(resolvedStreetWide.physicalState.backgroundRealism.allowsHumans, 'Wide residential street selfie may allow sparse everyday pedestrian life');
assert(resolvedStreetWide.physicalState.backgroundRealism.humanDensity === 'sparse', 'Quiet residential street should keep human density sparse');
assert(resolvedStreetWide.physicalState.backgroundRealism.allowsVehicles, 'Wide residential street selfie may show sparse ordinary vehicles');
assert(resolvedStreetWide.physicalState.backgroundRealism.vehicleDensity === 'sparse', 'Quiet residential street vehicle density must remain sparse');
assert(resolvedStreetWide.physicalState.backgroundRealism.allowsMildDisorder, 'Outdoor street scene should allow restrained lived-in disorder');
assert(resolvedStreetWide.physicalState.visibleEnvironment.includes('villa') || resolvedStreetWide.physicalState.visibleEnvironment.includes('curb'), 'Street background must come from the selected micro-location surfaces');

console.log('▶ Test 14: Medium café selfie uses café-specific public activity');
const cafeMediumState: SceneState = {
  ...streetWideState,
  subScene: 'أمام مقهى محلي',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف بشكل طبيعي',
  activity: 'ينتظر',
  timeOfDay: 'afternoon'
};
const resolvedCafeMedium = resolveScene(cafeMediumState);
assert(resolvedCafeMedium.physicalState.backgroundRealism.visibilityClass === 'limited', 'Medium café selfie must use limited background visibility');
assert(resolvedCafeMedium.physicalState.backgroundRealism.humanDensity === 'light', 'Medium café selfie may show light public activity but not a crowd');
assert(resolvedCafeMedium.physicalState.backgroundRealism.vehicleDensity === 'sparse', 'Medium café selfie must cap vehicles at sparse');
assert(resolvedCafeMedium.physicalState.visibleEnvironment.includes('café glass facade') || resolvedCafeMedium.physicalState.visibleEnvironment.includes('bistro chair'), 'Café scene must preserve café micro-location surfaces rather than generic villa background');
assert(resolvedCafeMedium.physicalState.visiblePeople.every(p => !p.toLowerCase().includes('crowd')), 'Café background must never force crowding');

console.log('▶ Test 15: Phone-screen-only scene keeps background dark');
assert(resolvedBedroom.physicalState.backgroundRealism.lightSources.length === 0, 'Phone-screen-only scene must not invent independent background light sources');
assert(
  resolvedBedroom.physicalState.backgroundRealism.realismGuards.some(g => g.includes('predominantly dark')),
  'Phone-screen-only background guard must explicitly preserve darkness'
);

console.log('▶ Test 16: Car interior exposes outside vehicles only through real glazing');
const carMediumState: SceneState = {
  ...carNightState,
  framing: 'chest-up',
  lightingMode: 'إضاءة الشارع عبر زجاج السيارة'
};
const resolvedCarMedium = resolveScene(carMediumState);
assert(resolvedCarMedium.physicalState.backgroundRealism.vehicleDensity === 'sparse', 'Car interior medium selfie may expose only sparse external vehicle presence');
assert(
  resolvedCarMedium.physicalState.backgroundRealism.vehicleBehavior.every(v => /window|windshield/i.test(v)),
  'External vehicles in car interior must be constrained to physically visible window or windshield planes'
);
assert(
  resolvedCarMedium.physicalState.backgroundRealism.occlusionRules.some(r => r.includes('window') || r.includes('windshield')),
  'Car interior background occlusion rules must constrain exterior visibility through glazing'
);

console.log('▶ Test 17: Explicit background density is capped by selfie FOV');
const tightForcedBackground: SceneState = {
  ...bedroomState,
  backgroundMode: 'active',
  backgroundHumans: 'moderate',
  backgroundVehicles: 'moderate',
  backgroundDisorder: 'moderate',
  backgroundGeminiAssist: true,
  backgroundGeminiAdvice: {
    humanDensity: 'moderate',
    vehicleDensity: 'moderate',
    disorderLevel: 'moderate',
    reasonAR: ['اختبار'],
    confidence: 95
  }
};
const resolvedTightForced = resolveScene(tightForcedBackground);
assert(resolvedTightForced.physicalState.backgroundRealism.humanDensity === 'none', 'Tight private selfie must cap forced humans to none');
assert(resolvedTightForced.physicalState.backgroundRealism.vehicleDensity === 'none', 'Tight private selfie must cap forced vehicles to none');
assert(resolvedTightForced.physicalState.backgroundRealism.cappedByFraming, 'FOV cap must be reported when user asks for impossible density');

console.log('▶ Test 18: Explicit user controls override Gemini background advice');
const userPriorityState: SceneState = {
  ...streetWideState,
  backgroundMode: 'auto',
  backgroundHumans: 'none',
  backgroundVehicles: 'none',
  backgroundDisorder: 'very-clean',
  backgroundGeminiAssist: true,
  backgroundGeminiAdvice: {
    humanDensity: 'moderate',
    vehicleDensity: 'light',
    disorderLevel: 'moderate',
    reasonAR: ['المشهد العام يسمح بنشاط'],
    confidence: 92
  }
};
const resolvedUserPriority = resolveScene(userPriorityState);
assert(resolvedUserPriority.physicalState.backgroundRealism.humanDensity === 'none', 'Explicit no-humans choice must override Gemini');
assert(resolvedUserPriority.physicalState.backgroundRealism.vehicleDensity === 'none', 'Explicit no-vehicles choice must override Gemini');
assert(resolvedUserPriority.physicalState.backgroundRealism.disorderLevel === 'very-clean', 'Explicit very-clean choice must override Gemini disorder advice');

console.log('▶ Test 19: Gemini advice is advisory and capped by medium framing');
const geminiMediumCafe: SceneState = {
  ...cafeMediumState,
  backgroundMode: 'auto',
  backgroundHumans: 'auto',
  backgroundVehicles: 'auto',
  backgroundDisorder: 'auto',
  backgroundGeminiAssist: true,
  backgroundGeminiAdvice: {
    humanDensity: 'moderate',
    vehicleDensity: 'moderate',
    disorderLevel: 'moderate',
    reasonAR: ['المقهى مكان عام لكن الكادر متوسط'],
    confidence: 90
  }
};
const resolvedGeminiMedium = resolveScene(geminiMediumCafe);
assert(resolvedGeminiMedium.physicalState.backgroundRealism.geminiApplied, 'Gemini advice should be applied when controls are automatic');
assert(resolvedGeminiMedium.physicalState.backgroundRealism.humanDensity === 'light', 'Medium selfie must cap Gemini human advice to light');
assert(resolvedGeminiMedium.physicalState.backgroundRealism.vehicleDensity === 'sparse', 'Medium selfie must cap Gemini vehicle advice to sparse');

console.log('▶ Test 20: Background off mode disables secondary life');
const backgroundOffState: SceneState = {
  ...streetWideState,
  backgroundMode: 'off',
  backgroundHumans: 'moderate',
  backgroundVehicles: 'moderate',
  backgroundDisorder: 'moderate',
  backgroundGeminiAssist: true
};
const resolvedBackgroundOff = resolveScene(backgroundOffState);
assert(resolvedBackgroundOff.physicalState.backgroundRealism.humanDensity === 'none', 'Background off must disable humans');
assert(resolvedBackgroundOff.physicalState.backgroundRealism.vehicleDensity === 'none', 'Background off must disable vehicles');
assert(resolvedBackgroundOff.physicalState.backgroundRealism.disorderLevel === 'none', 'Background off must disable disorder');

console.log('▶ Test 21: Phone-screen-only lighting uses real near-field falloff');
assert(
  resolvedBedroom.physicalState.lightingCausality.primarySource.name === 'smartphone display glow',
  'Phone-screen-only mode must resolve to the smartphone display as the primary source'
);
assert(
  resolvedBedroom.physicalState.lightingCausality.inverseSquareBehavior.includes('inverse-square'),
  'Phone-screen-only mode must encode near-field inverse-square behavior'
);
assert(
  resolvedBedroom.physicalState.lightingCausality.falloffBehavior.includes('rapid'),
  'Phone-screen-only mode must preserve rapid light falloff'
);

console.log('▶ Test 22: Midday Saudi outdoor lighting has directional sun plus real bounce');
const streetMiddayState: SceneState = {
  ...streetWideState,
  timeOfDay: 'midday',
  lightingMode: 'ضوء نهاري طبيعي'
};
const resolvedStreetMidday = resolveScene(streetMiddayState);
assert(
  resolvedStreetMidday.physicalState.lightingCausality.primarySource.name.includes('midday sun'),
  'Midday Saudi outdoor scene must use high-angle sun as primary source'
);
assert(
  resolvedStreetMidday.physicalState.lightingCausality.bounceSurfaces.some(s => /asphalt|wall/i.test(s)),
  'Midday outdoor scene must include real wall/asphalt bounce surfaces'
);
assert(
  resolvedStreetMidday.physicalState.lightingCausality.inverseSquareBehavior.includes('do not misuse inverse-square'),
  'Sunlight must not be modeled as a near-field inverse-square source'
);

console.log('▶ Test 23: Indoor fluorescent lighting preserves overhead directionality');
const officeFluorescentState: SceneState = {
  ...officeCorridorState,
  lightingMode: 'إضاءة مكتب فلورسنت',
  timeOfDay: 'midday'
};
const resolvedOfficeFluorescent = resolveScene(officeFluorescentState);
assert(
  resolvedOfficeFluorescent.physicalState.lightingCausality.primarySource.name.includes('fluorescent') ||
  resolvedOfficeFluorescent.physicalState.lightingCausality.primarySource.name.includes('LED'),
  'Office fluorescent mode must resolve to a real overhead fixture'
);
assert(
  resolvedOfficeFluorescent.physicalState.lightingCausality.primarySource.direction.includes('downward'),
  'Overhead office fixture must cast downward light'
);

console.log('▶ Test 24: Daylight car interior is shaped by real glazing');
const carDayState: SceneState = {
  ...carNightState,
  timeOfDay: 'midday',
  lightingMode: 'ضوء نهاري طبيعي'
};
const resolvedCarDay = resolveScene(carDayState);
assert(
  resolvedCarDay.physicalState.lightingCausality.primarySource.name.includes('vehicle glazing'),
  'Daytime car interior must source daylight through real vehicle glazing'
);
assert(
  resolvedCarDay.physicalState.lightingCausality.shadowBehavior.includes('window-shaped'),
  'Car daylight shadows must preserve window-shaped cabin gradients'
);

console.log('▶ Test 25: Scene plausibility exposes constrained but valid selfie geometry');
assert(
  resolvedStreetWide.physicalState.plausibility.overallStatus === 'constrained',
  'Wide front selfie should be valid but constrained by maximum arm reach'
);
assert(
  resolvedStreetWide.physicalState.plausibility.captureTopology.score < 100,
  'Wide front selfie must carry a lower capture-topology plausibility score'
);
assert(
  resolvedStreetWide.physicalState.plausibility.overallScore > 0 &&
  resolvedStreetWide.physicalState.plausibility.overallScore < 100,
  'Constrained scene must expose a bounded non-perfect plausibility score'
);

console.log('▶ Test 26: Normal medium selfie remains fully plausible after resolution');
assert(
  resolvedOffice.physicalState.plausibility.overallStatus !== 'impossible',
  'Resolved normal medium selfie must not contain plausibility blockers'
);
assert(
  resolvedOffice.physicalState.plausibility.blockers.length === 0,
  'Resolved normal scene must have zero hard plausibility blockers'
);

console.log('▶ Test 27: Smart selfie library is broad and has unique IDs');
assert(SELFIE_ANGLE_LIBRARY.length >= 30, 'Smart selfie angle library must contain at least 30 physically designed angles');
assert(
  new Set(SELFIE_ANGLE_LIBRARY.map(angle => angle.id)).size === SELFIE_ANGLE_LIBRARY.length,
  'Every selfie angle preset ID must be unique'
);
assert(
  SELFIE_ANGLE_LIBRARY.every(angle => Math.abs(angle.rollDeg) <= 3),
  'Base selfie roll must stay within natural handheld micro-tilt and never become a dramatic Dutch angle'
);

console.log('▶ Test 28: Gemini angle advice is accepted only inside the eligible catalog');
const smartCafeState: SceneState = {
  ...cafeMediumState,
  captureType: 'front-selfie',
  pose: 'جالس على كرسي',
  activity: 'جالس في المقهى',
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: {
    angleId: 'cafe_seated_diagonal',
    pitchOffsetDeg: -1,
    yawOffsetDeg: 2,
    rollOffsetDeg: 1,
    distanceOffsetCm: 2,
    reasonAR: ['الجلوس في المقهى يناسب زاوية قطرية خفيفة.'],
    confidence: 93
  }
};
const resolvedSmartCafe = resolveScene(smartCafeState);
assert(resolvedSmartCafe.physicalState.selfieAngle?.source === 'gemini', 'Eligible Gemini angle must be accepted');
assert(resolvedSmartCafe.physicalState.selfieAngle?.presetId === 'cafe_seated_diagonal', 'Expected café angle preset must be used');
assert(
  (resolvedSmartCafe.physicalState.selfieAngle?.distanceCm ?? 0) >= 47 &&
  (resolvedSmartCafe.physicalState.selfieAngle?.distanceCm ?? 0) <= 58,
  'Smart chest-up selfie distance must remain inside physical framing limits'
);

console.log('▶ Test 29: Excessive Gemini micro-variation is clamped locally');
const excessiveVariationState: SceneState = {
  ...smartCafeState,
  selfieAngleAdvice: {
    angleId: 'cafe_seated_diagonal',
    pitchOffsetDeg: -50,
    yawOffsetDeg: 60,
    rollOffsetDeg: 20,
    distanceOffsetCm: 40,
    reasonAR: ['اختبار تجاوز الحدود'],
    confidence: 99
  }
};
const resolvedExcessive = resolveScene(excessiveVariationState);
assert(
  Math.abs(resolvedExcessive.physicalState.selfieAngle?.rollDeg ?? 99) <= 3,
  'Local physics must clamp Gemini roll to the preset micro-variation limit'
);
assert(
  (resolvedExcessive.physicalState.selfieAngle?.distanceCm ?? 0) <= 58,
  'Local physics must clamp Gemini distance to chest-up arm-reach limits'
);
assert(
  Math.abs(resolvedExcessive.physicalState.selfieAngle?.yawDeg ?? 99) <= 16,
  'Local physics must clamp excessive Gemini yaw variation'
);

console.log('▶ Test 30: Ineligible Gemini angle falls back to deterministic physics');
const invalidCarAdviceState: SceneState = {
  ...carNightState,
  captureType: 'front-selfie',
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: {
    angleId: 'lying_overhead_restrained',
    pitchOffsetDeg: 0,
    yawOffsetDeg: 0,
    rollOffsetDeg: 0,
    distanceOffsetCm: 0,
    reasonAR: ['زاوية غير مناسبة عمدًا للاختبار'],
    confidence: 99
  }
};
const resolvedInvalidCarAdvice = resolveScene(invalidCarAdviceState);
assert(
  resolvedInvalidCarAdvice.physicalState.selfieAngle?.source === 'local-fallback',
  'Ineligible Gemini angle must be rejected and replaced by local deterministic fallback'
);
assert(
  resolvedInvalidCarAdvice.physicalState.selfieAngle?.presetId?.startsWith('car_') === true,
  'Car fallback should select a vehicle-compatible selfie angle'
);

console.log('▶ Test 31: Reclined bedroom pose gets a physically compatible smart angle');
const smartReclinedState: SceneState = {
  ...bedroomState,
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: undefined
};
const resolvedSmartReclined = resolveScene(smartReclinedState);
assert(
  resolvedSmartReclined.physicalState.selfieAngle?.source === 'local-fallback',
  'Smart mode must remain functional locally when Gemini advice is absent'
);
assert(
  Boolean(
    resolvedSmartReclined.physicalState.selfieAngle?.presetId?.includes('reclined') ||
    resolvedSmartReclined.physicalState.selfieAngle?.presetId?.includes('lying')
  ),
  'Reclined bedroom pose should select a reclined/lying-compatible angle locally'
);

console.log('▶ Test 32: Wide smart selfie preserves Xiaomi arm-reach geometry');
const smartWideState: SceneState = {
  ...streetWideState,
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: undefined
};
const resolvedSmartWide = resolveScene(smartWideState);
assert(
  (resolvedSmartWide.physicalState.selfieAngle?.distanceCm ?? 0) >= 62 &&
  (resolvedSmartWide.physicalState.selfieAngle?.distanceCm ?? 0) <= 70,
  'Half-body smart selfie must remain within maximum functional Xiaomi selfie reach'
);
assert(
  resolvedSmartWide.physicalState.armReach.includes('functional maximum selfie reach'),
  'Wide smart selfie must retain near-maximum physical arm extension mechanics'
);

console.log('▶ Test 33: In-car selfie library has dedicated driver/passenger/rear geometry');
const vehicleAngles = SELFIE_ANGLE_LIBRARY.filter(angle => angle.family === 'vehicle');
assert(vehicleAngles.length >= 12, 'Car interior must have a broad dedicated vehicle-angle library');
assert(vehicleAngles.some(angle => angle.carSeat === 'driver'), 'Vehicle library must include driver-seat angles');
assert(vehicleAngles.some(angle => angle.carSeat === 'front-passenger'), 'Vehicle library must include front-passenger angles');
assert(vehicleAngles.some(angle => angle.carSeat === 'rear-passenger'), 'Vehicle library must include rear-seat angles');
assert(vehicleAngles.some(angle => angle.carFocus === 'cabin-context'), 'Vehicle library must include cabin-context angles');
assert(vehicleAngles.some(angle => angle.carFocus === 'face-priority'), 'Vehicle library must include face-priority angles');

console.log('▶ Test 34: Phone-screen-only driver selfie prefers face-priority geometry');
const carScreenLightState: SceneState = {
  ...carNightState,
  framing: 'chest-up',
  lightingMode: 'إضاءة شاشة الهاتف فقط',
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: undefined
};
const resolvedCarScreenLight = resolveScene(carScreenLightState);
assert(
  resolvedCarScreenLight.physicalState.selfieAngle?.presetId === 'car_driver_screen_light',
  'Phone-screen-only driver selfie should select the dedicated close screen-light angle'
);
assert(
  resolvedCarScreenLight.physicalState.selfieAngle?.carFocus === 'face-priority',
  'Phone-screen-only driver selfie must prioritize the face'
);
assert(
  (resolvedCarScreenLight.physicalState.selfieAngle?.distanceCm ?? 0) <= 58,
  'Phone-screen-only driver selfie must stay within realistic in-cabin arm reach'
);

console.log('▶ Test 35: Passenger scene rejects driver-only Gemini angle');
const passengerState: SceneState = {
  ...carNightState,
  subScene: 'المقعد الأمامي للراكب',
  activity: 'جالس في مقعد الراكب',
  framing: 'chest-up',
  lightingMode: 'ضوء نهاري طبيعي',
  timeOfDay: 'midday',
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: {
    angleId: 'car_driver_offaxis',
    pitchOffsetDeg: 0,
    yawOffsetDeg: 0,
    rollOffsetDeg: 0,
    distanceOffsetCm: 0,
    carFocus: 'balanced',
    reasonAR: ['اختبار رفض زاوية السائق للراكب'],
    confidence: 99
  }
};
const resolvedPassenger = resolveScene(passengerState);
assert(
  resolvedPassenger.physicalState.selfieAngle?.source === 'local-fallback',
  'Passenger scene must reject a driver-only Gemini angle'
);
assert(
  resolvedPassenger.physicalState.selfieAngle?.carSeat === 'front-passenger' ||
  resolvedPassenger.physicalState.selfieAngle?.carSeat === 'either',
  'Passenger fallback must remain passenger-compatible'
);

console.log('▶ Test 36: Rear-seat selfie stays behind front-seat geometry');
const rearSeatState: SceneState = {
  ...carNightState,
  subScene: 'المقعد الخلفي',
  activity: 'جالس بهدوء في المقعد الخلفي',
  framing: 'chest-up',
  lightingMode: 'إضاءة داخل السيارة',
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: undefined
};
const resolvedRearSeat = resolveScene(rearSeatState);
assert(
  resolvedRearSeat.physicalState.selfieAngle?.carSeat === 'rear-passenger',
  'Rear-seat scene must select rear-passenger geometry'
);
assert(
  resolvedRearSeat.physicalState.selfieAngle?.cabinGuards?.some(rule => /front-seat|seatback|headrest/i.test(rule)) === true,
  'Rear-seat geometry must preserve front-seat/headrest clearance'
);

console.log('▶ Test 37: Driver micro-variation is hard-clamped to cabin clearance');
const edgeDriverState: SceneState = {
  ...carNightState,
  framing: 'chest-up',
  lightingMode: 'إضاءة داخل السيارة',
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: {
    angleId: 'car_driver_offaxis',
    pitchOffsetDeg: -20,
    yawOffsetDeg: 50,
    rollOffsetDeg: 20,
    distanceOffsetCm: 20,
    carFocus: 'balanced',
    reasonAR: ['اختبار حدود المقصورة'],
    confidence: 99
  }
};
const resolvedEdgeDriver = resolveScene(edgeDriverState);
assert(
  resolvedEdgeDriver.physicalState.selfieAngle?.source === 'gemini',
  'Eligible driver angle should be accepted before local cabin clamping'
);
assert(
  Math.abs(resolvedEdgeDriver.physicalState.selfieAngle?.yawDeg ?? 99) <= 16,
  'Driver cabin yaw must remain within physical cabin clearance'
);
assert(
  Math.abs(resolvedEdgeDriver.physicalState.selfieAngle?.rollDeg ?? 99) <= 2.5,
  'Driver cabin roll must remain a micro-tilt'
);
assert(
  (resolvedEdgeDriver.physicalState.selfieAngle?.distanceCm ?? 99) <= 58,
  'Driver chest-up selfie must remain within in-cabin functional reach'
);
assert(
  resolvedEdgeDriver.physicalState.selfieAngle?.carClearanceAdjusted === true,
  'Cabin clamp must report when Gemini variation was physically corrected'
);

console.log('▶ Test 38: Driver cabin-context angle exposes explicit phone placement and guards');
const cabinContextState: SceneState = {
  ...carNightState,
  framing: 'chest-up',
  lightingMode: 'إضاءة داخل السيارة',
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: {
    angleId: 'car_driver_cabin_context',
    pitchOffsetDeg: 0,
    yawOffsetDeg: 0,
    rollOffsetDeg: 0,
    distanceOffsetCm: 0,
    carFocus: 'cabin-context',
    reasonAR: ['إظهار المقود والتابلوه مع بقاء الوجه هو العنصر الأساسي'],
    confidence: 94
  }
};
const resolvedCabinContext = resolveScene(cabinContextState);
assert(
  resolvedCabinContext.physicalState.selfieAngle?.carFocus === 'cabin-context',
  'Cabin-context selection must remain explicitly tagged'
);
assert(
  Boolean(resolvedCabinContext.physicalState.selfieAngle?.phonePlacement),
  'Car selfie angle must expose a physical phone placement'
);
assert(
  (resolvedCabinContext.physicalState.selfieAngle?.cabinGuards?.length ?? 0) >= 3,
  'Car selfie angle must carry explicit cabin collision guards'
);

console.log('▶ Test 39: Background composition automatically changes smart selfie angle');
const facePriorityBackgroundState: SceneState = {
  ...streetWideState,
  framing: 'chest-up',
  cameraAngleMode: 'gemini-smart',
  selfieAngleAdvice: undefined,
  backgroundAutoAngle: true,
  backgroundMode: 'auto',
  backgroundHumans: 'none',
  backgroundVehicles: 'none',
  backgroundDisorder: 'very-clean',
  backgroundActivity: 'calm',
  backgroundPresence: 'low',
  backgroundCompositionGoal: 'face-priority'
};
const resolvedFacePriorityBackground = resolveScene(facePriorityBackgroundState);

const backgroundPriorityState: SceneState = {
  ...facePriorityBackgroundState,
  backgroundHumans: 'high',
  backgroundVehicles: 'moderate',
  backgroundDisorder: 'lived-in',
  backgroundActivity: 'active',
  backgroundPresence: 'strong',
  backgroundCompositionGoal: 'background-priority'
};
const resolvedBackgroundPriority = resolveScene(backgroundPriorityState);

assert(
  resolvedFacePriorityBackground.physicalState.selfieAngle?.presetId !==
  resolvedBackgroundPriority.physicalState.selfieAngle?.presetId,
  'Changing background realism from face-priority to background-priority must automatically change the smart selfie angle'
);
assert(
  resolvedBackgroundPriority.physicalState.selfieAngle?.legacyAngle === 'slightly-off-center',
  'Strong/background-priority realism should bias the selfie toward a physically valid off-axis angle'
);
assert(
  resolvedBackgroundPriority.physicalState.backgroundRealism.angleIntent.backgroundPriority === 'high',
  'Background-priority settings must derive high background camera intent'
);

console.log('▶ Test 40: Disabling background-angle link preserves angle selection');
const unlinkedFaceState: SceneState = {
  ...facePriorityBackgroundState,
  backgroundAutoAngle: false
};
const unlinkedBackgroundState: SceneState = {
  ...backgroundPriorityState,
  backgroundAutoAngle: false
};
const resolvedUnlinkedFace = resolveScene(unlinkedFaceState);
const resolvedUnlinkedBackground = resolveScene(unlinkedBackgroundState);
assert(
  resolvedUnlinkedFace.physicalState.selfieAngle?.presetId ===
  resolvedUnlinkedBackground.physicalState.selfieAngle?.presetId,
  'When background-angle linking is OFF, background realism changes must not alter the deterministic selfie angle'
);

console.log('▶ Test 41: Strong background presence is capped by medium selfie FOV');
assert(
  resolvedBackgroundPriority.physicalState.backgroundRealism.presenceLevel === 'visible',
  'Chest-up framing must cap requested strong background presence to visible'
);
assert(
  resolvedBackgroundPriority.physicalState.backgroundRealism.cappedByFraming,
  'Medium framing must report when strong/high background requests are physically capped'
);

console.log('▶ Test 42: High people density expands intent but remains physically bounded');
assert(
  ['none', 'sparse', 'light', 'moderate'].includes(
    resolvedBackgroundPriority.physicalState.backgroundRealism.humanDensity
  ),
  'High user density request must resolve to a physically supported engine density'
);
assert(
  resolvedBackgroundPriority.physicalState.backgroundRealism.requestedHumans === 'high',
  'Engine must preserve the explicit high-density user request for auditability'
);

console.log('▶ Test 43: Expanded disorder controls map to physical disorder levels');
const naturalDisorderState: SceneState = {
  ...streetWideState,
  backgroundDisorder: 'natural',
  backgroundAutoAngle: true
};
const livedInDisorderState: SceneState = {
  ...streetWideState,
  backgroundDisorder: 'lived-in',
  backgroundAutoAngle: true
};
const resolvedNaturalDisorder = resolveScene(naturalDisorderState);
const resolvedLivedInDisorder = resolveScene(livedInDisorderState);
assert(
  resolvedNaturalDisorder.physicalState.backgroundRealism.disorderLevel === 'light',
  'Natural disorder control must map to restrained light physical irregularity'
);
assert(
  resolvedLivedInDisorder.physicalState.backgroundRealism.disorderLevel === 'moderate',
  'Lived-in disorder control should map to moderate irregularity when wide framing permits it'
);

console.log('  ✓ Background Realism → Selfie Angle Link V2 regression suite passed!\n');

console.log('🎉 ALL AUTOMATED VALIDATION TESTS PASSED PERFECTLY!\n');
