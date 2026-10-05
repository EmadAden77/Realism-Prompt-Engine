import { OUTFITS } from '../data/clothingOutfits';
import { MICRO_LOCATIONS } from '../data/microLocations';
import {
  describeAttireControls,
  getActivityDefinition,
  getActivityOptions,
  getAttireAwareOutfitPrompt,
  getOutfitCapabilities,
  getPoseOptions,
  getSceneRecommendations,
  inferGarmentWearContext
} from './activityAttire';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error('Activity/Attire assertion failed: ' + message);
};

console.log('▶ Activity/Attire Test 1: each scene gets a broad activity menu');
for (const family of ['bedroom','living-room','saudi-outdoor','gym','car','military-base'] as const) {
  const options = getActivityOptions(family);
  assert(options.length >= 12, family + ' must expose at least 12 activity choices');
  assert(new Set(options.map(item => item.labelAR)).size === options.length, family + ' activity labels must be unique');
}

console.log('▶ Activity/Attire Test 2: activity semantics include body mechanics and gaze');
const texting = getActivityDefinition('يكتب رسالة');
assert(/thumb|grip|phone/i.test(texting.mechanics), 'Texting must define hand/phone mechanics');
assert(/screen/i.test(texting.gaze), 'Texting must direct gaze to the screen');

console.log('▶ Activity/Attire Test 3: activity automatically derives garment state');
assert(inferGarmentWearContext('يمشي بهدوء') === 'after-walking', 'Walking should derive after-walking garment state');
assert(inferGarmentWearContext('بعد التمرين') === 'post-workout', 'Post-workout activity should derive post-workout garment state');
assert(inferGarmentWearContext('جالس على حافة السرير') === 'after-sitting', 'Seated activity should derive after-sitting garment state');

console.log('▶ Activity/Attire Test 4: shirt-specific controls are capability-gated');
const shirt = OUTFITS.find(item => item.id === 'navy_shirt_grey_trousers');
const tee = OUTFITS.find(item => /white_tee|black_tee/.test(item.id)) || OUTFITS.find(item => /t-shirt|tee/i.test(item.prompt));
const thobe = OUTFITS.find(item => item.id === 'thobe_white_summer') || OUTFITS.find(item => /thobe/i.test(item.prompt));

assert(Boolean(shirt), 'Expected canonical button-up shirt fixture');
assert(Boolean(tee), 'Expected T-shirt fixture');
assert(Boolean(thobe), 'Expected thobe fixture');

const shirtCaps = getOutfitCapabilities(shirt);
const teeCaps = getOutfitCapabilities(tee);
const thobeCaps = getOutfitCapabilities(thobe);

assert(shirtCaps.supportsShirtButtons, 'Button-up shirt must expose button controls');
assert(shirtCaps.supportsTuck, 'Button-up shirt must expose tuck controls');
assert(!teeCaps.supportsShirtButtons, 'T-shirt must not expose shirt-button controls');
assert(!teeCaps.supportsCollar, 'T-shirt must not expose shirt-collar controls');
assert(thobeCaps.supportsThobeCollar, 'Thobe must expose thobe-collar control');
assert(!thobeCaps.supportsShirtButtons, 'Thobe must not expose shirt-button control');

console.log('▶ Activity/Attire Test 5: exact shirt button selection reaches prompt physics');
const twoOpen = describeAttireControls(shirt, {
  outfitWearStyle: 'casual-relaxed',
  garmentWearContext: 'auto',
  activity: 'يمشي بهدوء',
  shirtButtons: 'top-two-open',
  shirtTuck: 'untucked',
  sleeveStyle: 'rolled-forearm',
  collarStyle: 'relaxed'
});
assert(twoOpen.prompt.includes('exactly the top two buttons open'), 'Top-two-open must be explicit in prompt');
assert(twoOpen.prompt.includes('shirt worn untucked'), 'Untucked state must be explicit');
assert(twoOpen.prompt.includes('rolled naturally to mid-forearm'), 'Rolled sleeves must be explicit');
assert(twoOpen.resolvedWearContext === 'after-walking', 'Auto garment state must follow activity');

console.log('▶ Activity/Attire Test 6: non-shirt ignores stale shirt controls');
const teeDescription = describeAttireControls(tee, {
  outfitWearStyle: 'natural-neat',
  garmentWearContext: 'neutral',
  shirtButtons: 'top-two-open',
  shirtTuck: 'half-tuck',
  sleeveStyle: 'rolled-forearm',
  collarStyle: 'relaxed'
});
assert(!teeDescription.prompt.includes('top two buttons'), 'T-shirt prompt must ignore stale shirt-button state');
assert(!teeDescription.prompt.includes('half-tuck'), 'T-shirt prompt must ignore stale shirt tuck state');

console.log('▶ Activity/Attire Test 7: explicit button control removes contradictory base wording');
const suit = OUTFITS.find(item => item.id === 'suit_navy_white_shirt');
assert(Boolean(suit), 'Expected suit fixture');
const strictClosed = getAttireAwareOutfitPrompt(suit, { shirtButtons: 'fully-buttoned' });
assert(!/open-collar|unbuttoned at neck/i.test(strictClosed), 'Explicit button state must remove conflicting open-collar wording');

console.log('▶ Activity/Attire Test 8: expanded pose library preserves legacy values');
assert(getPoseOptions('military-base').includes('واقف بثبات'), 'Military pose library must preserve legacy standing pose');
assert(getPoseOptions('gym').includes('يحمل زجاجة ماء'), 'Gym pose library must preserve legacy bottle pose');
assert(getPoseOptions('saudi-outdoor').includes('مستند بظهره على الجدار'), 'Outdoor pose library must preserve legacy wall-lean pose');


console.log('▶ Activity/Attire Test 9: selected micro-location changes recommendation order');
const meetingRecommendations = getSceneRecommendations('military-base', 'غرفة اجتماعات عادية');
assert(meetingRecommendations.poses[0].includes('طاولة الاجتماعات'), 'Meeting room must suggest chair/table contact explicitly');
assert(meetingRecommendations.activities.includes('يراجع ملفًا'), 'Meeting room must suggest a plausible meeting-room activity');

const cafeRecommendations = getSceneRecommendations('saudi-outdoor', 'أمام مقهى محلي');
assert(cafeRecommendations.activities[0] === 'جالس في المقهى', 'Cafe must prioritize cafe-specific activity');
assert(cafeRecommendations.poses.some(item => item.includes('طاولة المقهى')), 'Cafe must suggest table/chair geometry');

const bedRecommendations = getSceneRecommendations('bedroom', 'مستلقٍ على السرير');
assert(bedRecommendations.poses[0].includes('السرير'), 'Bed scene must prioritize bed-contact pose');

const exteriorCarRecommendations = getSceneRecommendations('car', 'بجانب باب السائق');
assert(exteriorCarRecommendations.poses[0].includes('السيارة'), 'Exterior car scene must not default to an in-cabin seated pose');

console.log('▶ Activity/Attire Test 10: every micro-location exposes contextual suggestions');
for (const family of Object.keys(MICRO_LOCATIONS) as Array<keyof typeof MICRO_LOCATIONS>) {
  for (const location of MICRO_LOCATIONS[family]) {
    const recommendations = getSceneRecommendations(family, location.labelAR);
    assert(recommendations.activities.length >= 3, `${family}/${location.id} must expose at least 3 activity suggestions`);
    assert(recommendations.poses.length >= 2, `${family}/${location.id} must expose at least 2 pose suggestions`);
    const activityOptions = getActivityOptions(family, location.labelAR).map(item => item.labelAR);
    const poseOptions = getPoseOptions(family, location.labelAR);
    assert(activityOptions[0] === recommendations.activities[0], `${family}/${location.id} must place contextual activity first`);
    assert(poseOptions[0] === recommendations.poses[0], `${family}/${location.id} must place contextual pose first`);
  }
}

console.log('✓ Activity + Attire controls regression suite passed.');
