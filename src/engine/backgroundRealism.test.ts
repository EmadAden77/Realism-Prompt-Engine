import { getMicroLocation } from '../data/microLocations';
import { deriveBackgroundRealism } from './backgroundRealism';
import { resolveScene, type SceneState } from './physicsEngine';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error('Background Geometry assertion failed: ' + message);
};

const street = getMicroLocation('saudi-outdoor', 'شارع فلل سكني');

const baseContext = {
  familyId: 'saudi-outdoor' as const,
  subScene: 'شارع فلل سكني',
  timeOfDay: 'midday' as const,
  cameraAngle: 'slightly-off-center' as const,
  captureType: 'front-selfie' as const,
  activityDensity: 'moderate' as const,
  isOutdoor: true,
  lightingMode: 'ضوء نهاري طبيعي',
  backgroundMode: 'active' as const,
  backgroundHumans: 'high' as const,
  backgroundVehicles: 'high' as const,
  backgroundDisorder: 'moderate' as const,
  backgroundActivity: 'active' as const,
  backgroundPresence: 'strong' as const,
  backgroundCompositionGoal: 'background-priority' as const,
  backgroundGeminiAssist: false,
  microLoc: street,
  horizontalFovDeg: 79
};

console.log('▶ Background Geometry 1: tight/close selfie hard-caps all visible life');
const tightClose = deriveBackgroundRealism({
  ...baseContext,
  framingClass: 'tight',
  selfieDistanceCm: 43,
  selfiePitchDeg: -2,
  selfieYawDeg: 12,
  selfieRollDeg: 1
});
assert(tightClose.geometryVisibilityCap === 'minimal', 'tight close selfie must have minimal geometry cap');
assert(tightClose.humanDensity === 'none', 'tight close selfie must remove complete background people');
assert(tightClose.vehicleDensity === 'none', 'tight close selfie must remove complete background vehicles');
assert(tightClose.activityLevel === 'calm', 'tight close selfie must cap requested active background to calm');
assert(tightClose.presenceLevel === 'low', 'tight close selfie must cap strong presence to low');
assert(tightClose.compositionGoal === 'face-priority', 'tight close selfie must become face-priority');
assert(tightClose.cappedByFraming, 'tight close selfie must report geometry capping');

console.log('▶ Background Geometry 2: same medium framing changes with resolved yaw');
const mediumCentered = deriveBackgroundRealism({
  ...baseContext,
  framingClass: 'medium',
  cameraAngle: 'eye-level',
  selfieDistanceCm: 50,
  selfiePitchDeg: 0,
  selfieYawDeg: 0,
  selfieRollDeg: 0
});
const mediumOffAxis = deriveBackgroundRealism({
  ...baseContext,
  framingClass: 'medium',
  selfieDistanceCm: 56,
  selfiePitchDeg: -3,
  selfieYawDeg: 14,
  selfieRollDeg: 1
});
assert(mediumCentered.geometryVisibilityCap === 'limited', 'centered medium selfie should remain limited');
assert(mediumOffAxis.geometryVisibilityCap === 'moderate', 'off-axis medium selfie should expose moderate background geometry');
assert(mediumCentered.humanDensity === 'sparse', 'limited medium view should cap people to sparse');
assert(mediumOffAxis.humanDensity === 'light', 'off-axis medium view should allow light people density');
assert(mediumCentered.vehicleDensity === 'sparse', 'limited medium view should cap vehicles to sparse');
assert(mediumOffAxis.vehicleDensity === 'light', 'off-axis medium view should allow light vehicle density');
assert(mediumCentered.activityLevel === 'natural', 'limited view should cap activity to natural');
assert(mediumOffAxis.activityLevel === 'active', 'moderate off-axis view may preserve active background');
assert(mediumCentered.presenceLevel === 'balanced', 'limited geometry must cap presence to balanced');
assert(mediumOffAxis.presenceLevel === 'visible', 'moderate geometry may expose visible background presence');

console.log('▶ Background Geometry 3: distance and pitch alter wide-view capacity');
const wideNatural = deriveBackgroundRealism({
  ...baseContext,
  framingClass: 'wide',
  cameraAngle: 'eye-level',
  selfieDistanceCm: 68,
  selfiePitchDeg: 0,
  selfieYawDeg: 0,
  selfieRollDeg: 0
});
const wideSteep = deriveBackgroundRealism({
  ...baseContext,
  framingClass: 'wide',
  cameraAngle: 'slightly-high',
  selfieDistanceCm: 68,
  selfiePitchDeg: -16,
  selfieYawDeg: 0,
  selfieRollDeg: 0
});
assert(wideNatural.geometryVisibilityCap === 'expanded', 'wide long-reach selfie should expose expanded environment');
assert(wideSteep.geometryVisibilityCap === 'moderate', 'steep pitch should reduce usable background despite wide framing');
assert(wideNatural.humanDensity === 'moderate', 'expanded outdoor view may allow moderate people density');
assert(wideSteep.humanDensity === 'light', 'steep wide view must reduce people density');
assert(wideNatural.presenceLevel === 'strong', 'expanded geometry may preserve strong presence');
assert(wideSteep.presenceLevel === 'visible', 'steep geometry must cap strong presence to visible');

console.log('▶ Background Geometry 4: physics background uses the exact resolved smart-selfie geometry');
const state: SceneState = {
  referenceImageId: 'ref.png',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'واقف بشكل طبيعي',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف بثبات',
  outfitId: 'thobe_white_summer',
  hairStyle: 'h2',
  expression: 'e1',
  timeOfDay: 'midday',
  lightingMode: 'ضوء نهاري طبيعي',
  environmentRealism: 'طبيعي',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 70,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  backgroundMode: 'active',
  backgroundHumans: 'high',
  backgroundVehicles: 'high',
  backgroundDisorder: 'moderate',
  backgroundActivity: 'active',
  backgroundPresence: 'strong',
  backgroundCompositionGoal: 'background-priority',
  backgroundAutoAngle: true,
  backgroundGeminiAssist: false,
  cameraAngleMode: 'gemini-smart'
};

const resolved = resolveScene(state);
assert(Boolean(resolved.physicalState.selfieAngle), 'smart front selfie must resolve an actual angle preset');
const smart = resolved.physicalState.selfieAngle!;
const bg = resolved.physicalState.backgroundRealism;
assert(Math.abs(bg.cameraGeometry.distanceCm - smart.distanceCm) < 0.01, 'background solver must use exact smart selfie distance');
assert(Math.abs(bg.cameraGeometry.pitchDeg - smart.pitchDeg) < 0.01, 'background solver must use exact smart selfie pitch');
assert(Math.abs(bg.cameraGeometry.yawDeg - smart.yawDeg) < 0.01, 'background solver must use exact smart selfie yaw');
assert(Math.abs(bg.cameraGeometry.rollDeg - smart.rollDeg) < 0.01, 'background solver must use exact smart selfie roll');
assert(bg.cameraGeometry.horizontalFovDeg === 79, 'background solver must use Xiaomi 15 Ultra ~79° horizontal FOV');
assert(bg.decisionReasons.some(reason => reason.includes('FOV أفقي')), 'background audit must explain the resolved FOV geometry');

console.log('✓ Background realism is physically linked to selfie angle, distance and FOV.');
