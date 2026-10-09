import { MICRO_LOCATIONS } from './microLocations';
import { deriveBackgroundRealism } from '../engine/backgroundRealism';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error('Military micro-location assertion failed: ' + message);
};

const military = MICRO_LOCATIONS['military-base'];

console.log('▶ Military Micro-Locations 1: exact breadth and uniqueness');
assert(military.length === 54, 'military-base must contain exactly 54 micro-locations');
assert(new Set(military.map(item => item.id)).size === military.length, 'ids must be unique');
assert(new Set(military.map(item => item.labelAR)).size === military.length, 'Arabic labels must be unique');

console.log('▶ Military Micro-Locations 2: grouped mobile taxonomy');
const expectedGroups = [
  'المكاتب',
  'الممرات',
  'الأبواب والمداخل',
  'الانتظار والاجتماعات',
  'الاستراحة والخدمات',
  'الدرج',
  'خارج المبنى',
  'المواقف'
];
for (const group of expectedGroups) {
  assert(military.some(item => item.groupAR === group), 'missing group: ' + group);
}
assert(new Set(military.map(item => item.groupAR)).size === expectedGroups.length, 'unexpected extra/missing groups');

console.log('▶ Military Micro-Locations 3: realism metadata completeness');
for (const item of military) {
  assert(Boolean(item.groupAR), item.id + ' missing groupAR');
  assert(Boolean(item.spaceType), item.id + ' missing spaceType');
  assert(Boolean(item.zone), item.id + ' missing zone');
  assert(Boolean(item.humanDensityCap), item.id + ' missing humanDensityCap');
  assert(Boolean(item.vehicleDensityCap), item.id + ' missing vehicleDensityCap');
  assert(Boolean(item.disorderCap), item.id + ' missing disorderCap');
  assert(Boolean(item.cameraBias), item.id + ' missing cameraBias');
  assert((item.recommendedActivities?.length || 0) >= 2, item.id + ' needs recommended activities');
  assert((item.recommendedPoses?.length || 0) >= 1, item.id + ' needs recommended poses');
  assert(item.backgroundElements.length >= 4, item.id + ' needs enough physical background cues');
}

console.log('▶ Military Micro-Locations 4: ordinary-workplace safety boundary');
const combined = military
  .map(item => [
    item.labelAR,
    item.environmentPrompt,
    item.spatialBehavior,
    item.activity,
    ...item.backgroundElements
  ].join(' '))
  .join(' ')
  .toLowerCase();

const prohibited = [
  'armory',
  'ammunition',
  'weapons room',
  'operations room',
  'command center',
  'classified map',
  'classified document',
  'radar console',
  'surveillance control room'
];
for (const term of prohibited) {
  assert(!combined.includes(term), 'sensitive/non-admin setting leaked into library: ' + term);
}

console.log('▶ Military Micro-Locations 5: office background caps stay quiet');
const smallOffice = military.find(item => item.id === 'mb_small_side_office');
assert(Boolean(smallOffice), 'small office fixture missing');
const officeDecision = deriveBackgroundRealism({
  familyId: 'military-base',
  subScene: smallOffice!.labelAR,
  timeOfDay: 'morning',
  framingClass: 'wide',
  cameraAngle: 'slightly-off-center',
  captureType: 'front-selfie',
  activityDensity: 'moderate',
  isOutdoor: false,
  lightingMode: 'إضاءة مكتب فلورسنت',
  backgroundMode: 'active',
  backgroundHumans: 'high',
  backgroundVehicles: 'high',
  backgroundDisorder: 'moderate',
  backgroundActivity: 'active',
  backgroundPresence: 'strong',
  backgroundCompositionGoal: 'auto',
  backgroundGeminiAssist: false,
  microLoc: smallOffice
});
assert(officeDecision.humanDensity === 'none', 'small office must never invent random people');
assert(officeDecision.vehicleDensity === 'none', 'small office must never invent vehicles');
assert(officeDecision.disorderLevel === 'light', 'small office disorder must stay restrained');
assert(officeDecision.compositionGoal === 'face-priority', 'small office should prefer face-priority composition');

console.log('▶ Military Micro-Locations 6: parking allows context but remains capped');
const parking = military.find(item => item.id === 'mb_staff_parking');
assert(Boolean(parking), 'parking fixture missing');
const parkingDecision = deriveBackgroundRealism({
  familyId: 'military-base',
  subScene: parking!.labelAR,
  timeOfDay: 'midday',
  framingClass: 'wide',
  cameraAngle: 'slightly-off-center',
  captureType: 'front-selfie',
  activityDensity: 'moderate',
  isOutdoor: true,
  lightingMode: 'شمس الظهر',
  backgroundMode: 'active',
  backgroundHumans: 'high',
  backgroundVehicles: 'high',
  backgroundDisorder: 'moderate',
  backgroundActivity: 'active',
  backgroundPresence: 'strong',
  backgroundCompositionGoal: 'auto',
  backgroundGeminiAssist: false,
  microLoc: parking
});
assert(parkingDecision.humanDensity === 'sparse', 'staff parking human density must stay sparse');
assert(parkingDecision.vehicleDensity === 'light' || parkingDecision.vehicleDensity === 'moderate', 'staff parking should allow visible parked vehicles');
assert(parkingDecision.compositionGoal === 'background-priority', 'parking should expose more environmental context');
assert(parkingDecision.humanBehavior.some(text => text.includes('parked car')), 'parking human behavior must be place-specific');

console.log('✓ Military workplace micro-location regression suite passed.');


console.log('▶ Home Living-Room Micro-Locations 1: expanded useful home coverage');
const livingRoom = MICRO_LOCATIONS['living-room'];
const requiredHomeLocations = [
  'lr_home_foyer',
  'lr_home_stairs',
  'lr_dining_room',
  'lr_open_kitchen',
  'lr_home_office'
];
for (const id of requiredHomeLocations) {
  assert(livingRoom.some(item => item.id === id), 'missing home living-room micro-location: ' + id);
}
assert(livingRoom.length >= 25, 'living-room must expose the expanded home location set');

console.log('▶ Home Living-Room Micro-Locations 2: remain modern-home specific');
const addedHomeText = livingRoom
  .filter(item => requiredHomeLocations.includes(item.id))
  .map(item => [item.labelAR, item.environmentPrompt, item.spatialBehavior, ...item.backgroundElements].join(' '))
  .join(' ')
  .toLowerCase();
for (const forbidden of ['majlis carpet', 'floor seating', 'traditional majlis sofa', 'mabkhara', 'misbaha']) {
  assert(!addedHomeText.includes(forbidden), 'modern home location leaked majlis-only cue: ' + forbidden);
}

console.log('▶ Saudi grocery light-profile regression');
const baqala = MICRO_LOCATIONS['saudi-outdoor'].find(item => item.id === 'so_beside_baqala');
assert(Boolean(baqala), 'neighborhood grocery entrance must exist');
assert(Boolean(baqala?.lightingProfile), 'grocery must declare its actual lighting sources');
assert(baqala!.lightingProfile!.cri === 'fixture-dependent', 'CRI must not be invented as a fixed location value');
assert(baqala!.lightingProfile!.kelvinRange![0] < baqala!.lightingProfile!.kelvinRange![1], 'plausible fixture color temperatures must be a range');
assert(/daylight/i.test(baqala!.lightingHints) && /fluorescent|LED/i.test(baqala!.lightingHints), 'grocery must describe mixed practical and exterior light');
assert(!/studio lighting|beauty light|softbox/i.test(baqala!.lightingProfile!.source), 'grocery cannot invent photographic light equipment');
assert(/glass/i.test(baqala!.lightingProfile!.materialResponse), 'grocery must model door-glass reflectance');
assert(MICRO_LOCATIONS['saudi-outdoor'].length === 20, 'retrofitting the existing grocery must preserve the 20-site taxonomy');
