import { MICRO_LOCATIONS, getMicroLocation, type SceneFamilyId } from '../data/microLocations';
import {
  getSceneCapabilities,
  getSuggestedActivities,
  getSuggestedPoses,
  getSceneActivityPosePrompt,
  resolveSceneActivityPose
} from './sceneActivityPose';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error('Scene Activity/Pose assertion failed: ' + message);
};

const labels = <T extends { labelAR: string }>(items: T[]) => items.map(item => item.labelAR);

console.log('▶ Scene Activity/Pose 1: meeting room exposes furniture-aware suggestions');
const meeting = getMicroLocation('military-base', 'غرفة اجتماعات عادية');
assert(Boolean(meeting), 'meeting-room fixture must exist');
const meetingCaps = getSceneCapabilities('military-base', meeting!.labelAR, meeting);
assert(meetingCaps.furniture.includes('meeting-table'), 'meeting room must detect conference table');
assert(meetingCaps.furniture.includes('meeting-chair'), 'meeting room must detect meeting chairs');

const meetingActivities = getSuggestedActivities('military-base', meeting!.labelAR, meeting);
const meetingActivityLabels = labels(meetingActivities);
for (const expected of [
  'جالس في اجتماع',
  'يراجع أوراقًا على الطاولة',
  'يكتب ملاحظات',
  'واقف بجانب طاولة الاجتماعات',
  'يسحب الكرسي ليجلس'
]) {
  assert(meetingActivityLabels.includes(expected), 'meeting room missing activity: ' + expected);
}

const meetingPoses = getSuggestedPoses('military-base', meeting!.labelAR, 'جالس في اجتماع', meeting);
const meetingPoseLabels = labels(meetingPoses);
assert(meetingPoseLabels.includes('جالس على كرسي الاجتماع'), 'meeting room missing meeting-chair pose');
assert(meetingPoseLabels.includes('جالس أمام طاولة الاجتماعات'), 'meeting room missing chair+table pose');
assert(meetingPoseLabels.includes('جالس عند رأس طاولة الاجتماعات'), 'meeting room missing head-of-table pose');

console.log('▶ Scene Activity/Pose 2: waiting area only exposes valid waiting furniture');
const waiting = getMicroLocation('military-base', 'منطقة انتظار داخلية');
assert(Boolean(waiting), 'waiting-area fixture must exist');
const waitingActivities = labels(getSuggestedActivities('military-base', waiting!.labelAR, waiting));
assert(waitingActivities.includes('ينتظر موعدًا'), 'waiting area should suggest appointment waiting');
assert(waitingActivities.includes('جالس ينتظر'), 'waiting area should suggest seated waiting');
const waitingPoses = labels(getSuggestedPoses('military-base', waiting!.labelAR, 'جالس ينتظر', waiting));
assert(waitingPoses.includes('جالس على كرسي انتظار'), 'waiting activity must offer waiting-chair pose');
assert(!waitingPoses.includes('جالس أمام طاولة الاجتماعات'), 'waiting area must not invent conference-table pose');

console.log('▶ Scene Activity/Pose 3: corridor rejects furniture-only poses');
const corridor = getMicroLocation('military-base', 'ممر إداري رئيسي');
assert(Boolean(corridor), 'corridor fixture must exist');
const corridorActivities = labels(getSuggestedActivities('military-base', corridor!.labelAR, corridor));
assert(corridorActivities.includes('يمشي داخل الممر'), 'corridor should suggest walking');
const corridorPoses = labels(getSuggestedPoses('military-base', corridor!.labelAR, 'يمشي داخل الممر', corridor));
assert(corridorPoses.includes('يمشي في الممر'), 'corridor should expose corridor-walking pose');
assert(!corridorPoses.includes('جالس خلف المكتب'), 'corridor must not expose desk sitting');
assert(!corridorPoses.includes('جالس أمام طاولة الاجتماعات'), 'corridor must not expose meeting-table sitting');

console.log('▶ Scene Activity/Pose 4: parking produces car/parking suggestions, not office furniture');
const parking = getMicroLocation('military-base', 'موقف موظفين عادي');
assert(Boolean(parking), 'parking fixture must exist');
const parkingActivities = labels(getSuggestedActivities('military-base', parking!.labelAR, parking));
assert(parkingActivities.includes('واقف قرب السيارة'), 'parking should suggest standing near car');
assert(parkingActivities.includes('يمشي بين السيارات'), 'parking should suggest walking between cars');
const parkingPoses = labels(getSuggestedPoses('military-base', parking!.labelAR, 'واقف قرب السيارة', parking));
assert(parkingPoses.includes('واقف بجانب السيارة'), 'parking should expose beside-car pose');
assert(parkingPoses.includes('واقف ويده على باب السيارة'), 'parking should expose hand-on-door pose');
assert(!parkingPoses.includes('جالس على كرسي المكتب'), 'parking must not invent office chair');

console.log('▶ Scene Activity/Pose 5: changing sub-scene changes both suggestion sets');
const office = getMicroLocation('military-base', 'مكتب جانبي صغير');
assert(Boolean(office), 'small-office fixture must exist');
const officeActivities = labels(getSuggestedActivities('military-base', office!.labelAR, office));
assert(officeActivities.includes('عمل مكتبي'), 'office should suggest desk work');
assert(!officeActivities.includes('جالس في اجتماع'), 'small office should not pretend to be meeting room');

const officePoses = labels(getSuggestedPoses('military-base', office!.labelAR, 'عمل مكتبي', office));
assert(officePoses.includes('جالس خلف المكتب'), 'desk work should offer behind-desk pose');
assert(!officePoses.includes('جالس عند رأس طاولة الاجتماعات'), 'office should not expose head-of-table pose');

console.log('▶ Scene Activity/Pose 6: resolver repairs stale cross-scene choices');
const repaired = resolveSceneActivityPose({
  familyId: 'military-base',
  subScene: corridor!.labelAR,
  activity: 'عمل مكتبي',
  pose: 'جالس خلف المكتب',
  microLoc: corridor
});
assert(repaired.activityChanged, 'corridor must replace stale office activity');
assert(repaired.poseChanged, 'corridor must replace stale office pose');
assert(repaired.activities.some(item => item.labelAR === repaired.activity), 'resolved activity must be valid for corridor');
assert(repaired.poses.some(item => item.labelAR === repaired.pose), 'resolved pose must be valid for resolved activity');

console.log('▶ Scene Activity/Pose 7: prompt carries furniture/contact mechanics');
const scenePrompt = getSceneActivityPosePrompt({
  familyId: 'military-base',
  subScene: meeting!.labelAR,
  activity: 'يكتب ملاحظات',
  pose: 'جالس أمام طاولة الاجتماعات',
  microLoc: meeting
});
assert(scenePrompt.prompt.includes('forearm'), 'writing prompt must contain writing mechanics');
assert(scenePrompt.prompt.includes('meeting chair'), 'prompt must contain meeting-chair contact');
assert(scenePrompt.prompt.includes('table'), 'prompt must preserve table geometry');

console.log('▶ Scene Activity/Pose 8: foundational rule works across every scene family');
for (const familyId of Object.keys(MICRO_LOCATIONS) as SceneFamilyId[]) {
  for (const microLoc of MICRO_LOCATIONS[familyId]) {
    const activities = getSuggestedActivities(familyId, microLoc.labelAR, microLoc);
    assert(activities.length > 0, familyId + '/' + microLoc.labelAR + ' must have scene-aware activity suggestions');
    const poses = getSuggestedPoses(familyId, microLoc.labelAR, activities[0].labelAR, microLoc);
    assert(poses.length > 0, familyId + '/' + microLoc.labelAR + ' must have scene-aware pose suggestions');
  }
}

console.log('✓ Global scene-aware activity + pose regression suite passed.');
