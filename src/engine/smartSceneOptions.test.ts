import { buildSmartSceneOptions, isLightingCompatible, smartDependentPatch } from './smartSceneOptions';
import type { BackgroundViewGeometry } from './backgroundRealism';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error('Smart scene controls: ' + message);
};

const lighting = ['ضوء نهاري طبيعي', 'شمس الظهر', 'ساعة ذهبية (شروق/غروب)',
  'إنارة شارع دافئة', 'إنارة نيون تجارية متناثرة'];
const wallView: BackgroundViewGeometry = {
  aperture: 'partial', verticalBias: 'level', horizontalBias: 'centered',
  wallDominated: true, streetVisible: false, windowVisible: false,
  peripheralActorsAllowed: false, placementRules: []
};
const openView: BackgroundViewGeometry = {
  ...wallView, aperture: 'open', horizontalBias: 'right',
  wallDominated: false, streetVisible: true, peripheralActorsAllowed: true
};

console.log('▶ Smart controls: time filters incompatible light sources');
assert(!isLightingCompatible('شمس الظهر', 'night'), 'Night must not suggest noon sun');
assert(!isLightingCompatible('إنارة شارع دافئة', 'midday'), 'Day must not suggest night streetlamps');
assert(isLightingCompatible('ساعة ذهبية (شروق/غروب)', 'sunset'), 'Sunset should allow warm golden-hour sun');
assert(isLightingCompatible('إضاءة سقف دافئة 3000K', 'night'), 'Interior artificial lamps work at night');

const wall = buildSmartSceneOptions({
  familyId: 'saudi-outdoor', subScene: 'أمام سور منزل',
  timeOfDay: 'night', captureType: 'front-selfie',
  activity: 'واقف بشكل طبيعي', selectedOutfitId: 'navy_shirt_grey_trousers',
  allowedLighting: lighting, viewGeometry: wallView
});
assert(!wall.compatibleLighting.includes('شمس الظهر'), 'Night wall scene should exclude noon sun');
assert(wall.compatibleLighting.includes('إنارة شارع دافئة'), 'Night exterior may offer street lighting');
assert(wall.availableHumanDensities.join(',') === 'auto,none',
  'Opaque wall must offer no visible background people');
assert(wall.availableVehicleDensities.join(',') === 'auto,none',
  'Opaque wall must offer no visible vehicles');
assert(wall.recommendedActivities.length > 0 && wall.recommendedPoses.length > 0,
  'Outdoor wall needs activity and pose suggestions');

console.log('▶ Smart controls: off-axis street opens limited traffic choices');
const street = buildSmartSceneOptions({
  familyId: 'saudi-outdoor', subScene: 'أمام مقهى محلي',
  timeOfDay: 'afternoon', captureType: 'front-selfie',
  activity: 'جالس في المقهى', selectedOutfitId: 'navy_shirt_grey_trousers',
  allowedLighting: lighting, viewGeometry: openView
});
assert(street.availableVehicleDensities.includes('sparse'),
  'Real street sightline should allow cars when the micro-location permits them');
assert(street.availableHumanDensities.includes('sparse'),
  'Open café selfie should allow plausible passers-by');
assert(street.recommendedOutfits.length > 0, 'Café needs clothing suggestions');
assert(street.recommendedActivities.some(a => /مقهى|قهوة|طلب/.test(a)),
  'Café recommendations must use the actual location, not arbitrary work activities');

console.log('▶ Smart controls: sleeping and gym contexts do not share suggested wardrobes');
const gym = buildSmartSceneOptions({
  familyId: 'gym', subScene: 'ممر بين الأجهزة', timeOfDay: 'night',
  captureType: 'front-selfie', activity: 'بعد التمرين',
  selectedOutfitId: 'navy_shirt_grey_trousers',
  allowedLighting: ['إضاءة النادي الرياضي', 'ضوء نهاري طبيعي'],
  viewGeometry: wallView
});
assert(gym.recommendedOutfits.some(item => item.categoryAR.includes('رياضي')),
  'Gym wardrobe should suggest complete sports outfits');
assert(!gym.compatibleLighting.includes('ضوء نهاري طبيعي'),
  'Indoor gym at night cannot have daylight as its source');

console.log('▶ Smart controls: dependent patch is deterministic and does not touch identity or clothing');
const input = {
  familyId: 'saudi-outdoor' as const, subScene: 'أمام مقهى محلي',
  timeOfDay: 'night' as const, captureType: 'front-selfie' as const,
  activity: 'يستخدم الهاتف', selectedOutfitId: 'navy_shirt_grey_trousers',
  allowedLighting: lighting
};
const patch = smartDependentPatch(input);
assert(patch.activity.length > 0 && patch.pose.length > 0,
  'Changing location must choose physically grounded activity and posture');
assert(isLightingCompatible(patch.lightingMode, input.timeOfDay),
  'Dependent patch cannot choose incompatible lighting');
assert(!('outfitId' in patch) && !('referenceImageId' in patch),
  'Smart adjustments must never replace the selected outfit or identity');
assert(JSON.stringify(patch) === JSON.stringify(smartDependentPatch(input)),
  'Changing the same location must not make random hidden changes');

console.log('✅ SMART SCENE CONTROL REGRESSION TESTS PASSED');
