import { getMicroLocation } from '../data/microLocations';
import { deriveBackgroundRealism } from './backgroundRealism';
import {
  evaluateAntiCloning,
  getGroupClothingOptions,
  getGroupSelfieLocationLimit,
  getRequiredGroupFraming,
  resolveGroupSelfie,
  widenFramingForGroup
} from './groupSelfie';
import { resolveScene, type SceneState } from './physicsEngine';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error('Group Selfie assertion failed: ' + message);
};

console.log('▶ Group Selfie 1: location capacity is scene-aware');
const smallOffice = getMicroLocation('military-base', 'مكتب جانبي صغير');
const parking = getMicroLocation('military-base', 'موقف موظفين عادي');
assert(getGroupSelfieLocationLimit('military-base', smallOffice) === 3, 'small office must cap group at 3');
assert(getGroupSelfieLocationLimit('military-base', parking) === 5, 'parking should allow up to 5');
assert(getGroupSelfieLocationLimit('bedroom') === 2, 'bedroom must stay intimate and cap at 2');

console.log('▶ Group Selfie 2: requested size is capped by micro-location');
const capped = resolveGroupSelfie({
  enabled: true,
  requestedSize: 5,
  relationship: 'auto',
  familyId: 'military-base',
  subScene: 'مكتب جانبي صغير',
  framing: 'head-shoulders',
  microLoc: smallOffice
});
assert(capped.resolvedSize === 3, 'five-person request must cap to three in small office');
assert(capped.relationship === 'coworkers', 'military workplace auto relationship should resolve to coworkers');
assert(capped.requiredFraming === 'chest-up', 'three-person group should require chest-up framing');

console.log('▶ Group Selfie 3: open parking supports non-fixed five-person geometry');
const openGroup = resolveGroupSelfie({
  enabled: true,
  requestedSize: 5,
  relationship: 'auto',
  familyId: 'military-base',
  subScene: 'موقف موظفين عادي',
  framing: 'half-body',
  microLoc: parking
});
assert(openGroup.resolvedSize === 5, 'parking should preserve requested five-person group');
assert(openGroup.arrangement.includes('semicircle'), 'five-person parking group should use open-space semicircle geometry');
assert(openGroup.recommendedDistanceCm === 69, 'five-person selfie must use near-max one-arm reach');

console.log('▶ Group Selfie 4: anti-cloning profiles are actually distinct');
const profiles = openGroup.profiles;
assert(profiles.length === 4, 'five-person selfie must generate four companions plus reference subject');
for (const key of ['heightCm','bodyBuild','faceShape','jawShape','eyeShape','noseShape','hair','facialHair','outfit'] as const) {
  assert(new Set(profiles.map(profile => String(profile[key]))).size === profiles.length, key + ' must be unique across companions');
}
const uniqueness = evaluateAntiCloning(profiles);
assert(uniqueness.passed, 'generated profiles must pass anti-cloning');
assert(uniqueness.score >= 88, 'anti-cloning score must remain high');
assert(/only identity-locked person/.test(openGroup.prompt), 'prompt must reserve identity lock for reference subject only');
assert(/Do not reuse the reference subject's face/.test(openGroup.prompt), 'prompt must explicitly prohibit reference-face cloning');

console.log('▶ Group Selfie 5: framing widens only when physically required');
assert(getRequiredGroupFraming(2) === 'head-shoulders', 'two people may use head-shoulders');
assert(widenFramingForGroup('head-shoulders', 3) === 'chest-up', 'three people require chest-up');
assert(widenFramingForGroup('chest-up', 5) === 'half-body', 'five people require half-body');
assert(widenFramingForGroup('half-body', 2) === 'half-body', 'do not narrow an already wider user framing');

console.log('▶ Group Selfie 6: large group consumes background people budget');
const background = deriveBackgroundRealism({
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
  backgroundDisorder: 'light',
  backgroundActivity: 'active',
  backgroundPresence: 'strong',
  backgroundCompositionGoal: 'auto',
  backgroundGeminiAssist: false,
  groupSelfieEnabled: true,
  groupSelfieSize: 5,
  microLoc: parking
});
assert(background.humanDensity === 'none', 'five-person group must suppress unrelated background people');

console.log('▶ Group Selfie 7: physics resolver canonicalizes group topology');
const base: SceneState = {
  referenceImageId: 'ref',
  sceneFamily: 'military-base',
  subScene: 'مكتب جانبي صغير',
  activity: 'واقف فقط',
  captureType: 'third-person-candid',
  framing: 'head-shoulders',
  cameraAngle: 'eye-level',
  pose: 'واقف بثبات',
  outfitId: 'mil_admin_tan_shirt',
  hairStyle: 'h2',
  expression: 'e1',
  timeOfDay: 'midday',
  lightingMode: 'إضاءة مكتب فلورسنت',
  environmentRealism: 'رسمية ومنظمة',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 70,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  backgroundMode: 'auto',
  backgroundHumans: 'auto',
  backgroundVehicles: 'auto',
  backgroundDisorder: 'auto',
  backgroundActivity: 'auto',
  backgroundPresence: 'auto',
  backgroundCompositionGoal: 'auto',
  backgroundAutoAngle: true,
  backgroundGeminiAssist: false,
  cameraAngleMode: 'gemini-smart',
  groupSelfieEnabled: true,
  groupSelfieSize: 5,
  groupSelfieRelationship: 'auto'
};
const resolved = resolveScene(base);
assert(resolved.state.captureType === 'front-selfie', 'group selfie must canonicalize capture to front-selfie');
assert(resolved.state.groupSelfieSize === 3, 'physics must cap group to micro-location capacity');
assert(resolved.state.framing === 'chest-up', 'physics must widen framing for resolved group');
assert(resolved.physicalState.groupSelfie?.resolvedSize === 3, 'physical state must expose resolved group');
assert((resolved.physicalState.groupSelfie?.profiles.length || 0) === 2, 'resolved three-person group must contain two companions');
assert(resolved.physicalState.cameraDistance.includes('group selfie reach'), 'camera distance must switch to group-selfie mechanics');

console.log('✓ Dynamic group selfie regression suite passed.');


console.log('▶ Group Selfie 8: military group clothing options follow the micro-location');
const meetingRoom = getMicroLocation('military-base', 'غرفة اجتماعات عادية');
const officeClothing = getGroupClothingOptions('military-base', meetingRoom);
assert(officeClothing.some(option => option.id === 'saudi-military-realistic'), 'Military office must expose realistic Saudi military clothing');
assert(officeClothing.some(option => option.id === 'saudi-military-admin'), 'Military office must expose administrative Saudi military clothing');
assert(!officeClothing.some(option => option.id === 'saudi-military-field'), 'Administrative meeting room must hide field-only military clothing');

const parkingClothing = getGroupClothingOptions('military-base', parking);
assert(parkingClothing.some(option => option.id === 'saudi-military-field'), 'Military parking must allow restrained field-duty clothing');
assert(parkingClothing.some(option => option.id === 'saudi-military-winter'), 'Military parking must allow jacket/winter duty variation');

console.log('▶ Group Selfie 9: realistic Saudi military preset adapts its actual outfit pool by zone');
const officeMilitaryGroup = resolveGroupSelfie({
  enabled: true,
  requestedSize: 3,
  relationship: 'coworkers',
  clothingPreset: 'saudi-military-realistic',
  clothingDiversity: 'natural',
  uniformConsistency: 'naturally-varied',
  familyId: 'military-base',
  subScene: meetingRoom!.labelAR,
  framing: 'chest-up',
  microLoc: meetingRoom
});
assert(officeMilitaryGroup.clothingPreset === 'saudi-military-realistic', 'Explicit realistic Saudi military preset must remain selected');
assert(officeMilitaryGroup.profiles.every(profile => !/field-duty camouflage|special-forces/i.test(profile.outfit)), 'Administrative military interior must not use field-only camouflage styling');
assert(/main subject's outfit remains controlled exclusively/i.test(officeMilitaryGroup.prompt), 'Group clothing prompt must explicitly protect main-subject clothing');

const parkingMilitaryGroup = resolveGroupSelfie({
  enabled: true,
  requestedSize: 5,
  relationship: 'coworkers',
  clothingPreset: 'saudi-military-realistic',
  clothingDiversity: 'high',
  uniformConsistency: 'naturally-varied',
  familyId: 'military-base',
  subScene: parking!.labelAR,
  framing: 'half-body',
  microLoc: parking
});
assert(new Set(parkingMilitaryGroup.profiles.map(profile => profile.outfit)).size === parkingMilitaryGroup.profiles.length, 'Naturally-varied high-diversity military group must not clone outfits');
assert(parkingMilitaryGroup.profiles.some(profile => /field|jacket|daily-duty/i.test(profile.outfit)), 'Military parking should draw from daily/field/jacket-compatible variations');

console.log('▶ Group Selfie 10: unified mode intentionally aligns clothing without cloning faces');
const unifiedMilitaryGroup = resolveGroupSelfie({
  enabled: true,
  requestedSize: 4,
  relationship: 'coworkers',
  clothingPreset: 'saudi-military-admin',
  clothingDiversity: 'low',
  uniformConsistency: 'unified',
  familyId: 'military-base',
  subScene: meetingRoom!.labelAR,
  framing: 'half-body',
  microLoc: meetingRoom
});
assert(new Set(unifiedMilitaryGroup.profiles.map(profile => profile.outfit)).size === 1, 'Unified mode should intentionally use one aligned outfit');
assert(unifiedMilitaryGroup.antiCloningPassed, 'Unified clothing must not make distinct faces fail anti-cloning');
assert(new Set(unifiedMilitaryGroup.profiles.map(profile => profile.faceShape)).size === unifiedMilitaryGroup.profiles.length, 'Unified outfits must preserve distinct companion faces');

console.log('▶ Group Selfie 11: Saudi military presets never leak into unrelated places');
const outdoorClothing = getGroupClothingOptions('saudi-outdoor', getMicroLocation('saudi-outdoor', 'شارع فلل سكني'));
assert(!outdoorClothing.some(option => option.id.startsWith('saudi-military')), 'Saudi outdoor family must not expose military clothing presets');

console.log('▶ Group Selfie 12: physics state carries selected group clothing while main outfit stays untouched');
const militaryClothingState: SceneState = {
  ...base,
  captureType: 'front-selfie',
  framing: 'chest-up',
  groupSelfieSize: 3,
  groupClothingPreset: 'saudi-military-admin',
  groupClothingDiversity: 'natural',
  groupUniformConsistency: 'naturally-varied',
  outfitId: 'mil_admin_tan_shirt'
};
const resolvedMilitaryClothing = resolveScene(militaryClothingState);
assert(resolvedMilitaryClothing.state.outfitId === 'mil_admin_tan_shirt', 'Group clothing must never overwrite main subject outfitId');
assert(resolvedMilitaryClothing.physicalState.groupSelfie?.clothingPreset === 'saudi-military-admin', 'Resolved physical group state must carry selected companion clothing preset');
assert(resolvedMilitaryClothing.physicalState.groupSelfie?.profiles.length === 2, 'Three-person group must still contain two companions');

console.log('✓ Place-aware group clothing + Saudi military attire regression suite passed.');
