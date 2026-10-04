import { OUTFITS } from '../data/clothingOutfits';
import {
  describeAttireControls,
  getActivityDefinition,
  getActivityOptions,
  getAttireAwareOutfitPrompt,
  getOutfitCapabilities,
  getPoseOptions,
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

console.log('✓ Activity + Attire controls regression suite passed.');
