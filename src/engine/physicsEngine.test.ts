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
  lensCondition: 'modern-iphone',
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
  lensCondition: 'modern-iphone',
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
  lensCondition: 'modern-iphone',
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
  lensCondition: 'modern-iphone',
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
  lensCondition: 'modern-iphone',
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
  lensCondition: 'modern-iphone',
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
  lensCondition: 'modern-iphone',
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
          lensCondition: 'modern-iphone',
          clothingCondition: 'worn-all-day',
          atmosphericCondition: 'neutral',
          foregroundObstruction: 'clean',
          muscleFatigue: 'none',
          glassesMode: gMode,
          lightingIntensity: 70,
          shadowDepth: 60
        };

        const resolved = resolveScene(testState);
        assert(resolved.validation.isValid, `Combination ${fam} / ${sub.id} / ${time} / ${gMode} must be valid`);
        combinationsTested++;
      }
    }
  }
}

console.log(`  ✓ All ${combinationsTested} combinations resolved without physical contradictions!\n`);
console.log('🎉 ALL AUTOMATED VALIDATION TESTS PASSED PERFECTLY!\n');
