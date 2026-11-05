import assert from 'node:assert/strict';
import type { SceneState } from './physicsEngine';
import { describeRangeRoverSport, carSeatView } from './carReality';
import {
  VEHICLE_LOCAL_TOPOLOGY, compileVisibleWardrobe,
  resolvePhysicalConstraints, visibleRegions
} from './physicalConsistency';

const base: SceneState = {
  referenceImageId:'reference.jpg', sceneFamily:'car', subScene:'car_driver_parked',
  activity:'السيارة متوقفة', captureType:'front-selfie', framing:'chest-up',
  cameraAngle:'eye-level', pose:'جالس في مقعد السائق',
  outfitId:'lightblue_shirt_navy_trousers', hairStyle:'h1', expression:'e1',
  timeOfDay:'night', lightingMode:'إضاءة شاشة الهاتف فقط',
  environmentRealism:'natural', realismStyle:'anti-ai-raw',
  glassesMode:'match_reference', lightingIntensity:12, shadowDepth:85,
  lensCondition:'xiaomi-clean', clothingCondition:'crisp',
  atmosphericCondition:'neutral', foregroundObstruction:'clean', muscleFatigue:'none'
};
const resolve = (change: Partial<SceneState> = {}) =>
  resolvePhysicalConstraints({...base, ...change});

// Tests 01–03: LHD topology and no unrequested mirror projection.
assert.equal(VEHICLE_LOCAL_TOPOLOGY.anchors.driverSeat.x, VEHICLE_LOCAL_TOPOLOGY.anchors.steeringWheel.x);
assert(VEHICLE_LOCAL_TOPOLOGY.anchors.driverDoor.x < VEHICLE_LOCAL_TOPOLOGY.anchors.driverSeat.x);
assert(VEHICLE_LOCAL_TOPOLOGY.anchors.centerConsole.x > VEHICLE_LOCAL_TOPOLOGY.anchors.driverSeat.x);
assert.equal(VEHICLE_LOCAL_TOPOLOGY.anchors.passengerSeat.x > 0, true);
assert.equal(resolve().seat,'driver');
assert.equal(carSeatView('المقعد الأمامي للراكب','جالس بهدوء'), 'front-passenger');
assert.equal(resolve().model,'l494-2017');

// 04: Full extension cannot coincide with 90-degree elbow flexion.
assert(resolve({pose:'fully extended arm with 90-degree elbow flexion'}).issues
  .some(issue=>issue.code==='ELBOW_EXTENSION_CONFLICT'));

// 05: Reachability needs actual, independently supplied geometry.
const unreachable = resolve({selfieCalibration:{
  upperArmCm:30,forearmCm:25,lensBeyondWristCm:5,shoulderToEyeCm:15,cameraToFaceCm:125
}});
assert(unreachable.hasBlocker);
assert(unreachable.issues.some(issue=>issue.code==='SELFIE_REACH_IMPOSSIBLE'));
assert.equal(resolve().reach.status,'insufficient-calibration');

// 06: Impossible joint state is detected rather than emitting false precision.
assert(resolve({pose:'fully extended arm',selfieCalibration:{elbowFlexionDeg:90}})
  .issues.some(issue=>issue.code==='ELBOW_EXTENSION_CALIBRATION'));

// 07: Waist/thigh details cannot be requested inside a chest-up crop.
assert.deepEqual(visibleRegions('chest-up'),['head','shoulders','upper-torso']);
assert(!visibleRegions('head-shoulders').includes('waist'));
assert(resolve({pose:'show visible belt buckle and thighs'}).issues.some(i=>i.code==='CROP_VISIBILITY'));

// 08–09: Phone OLED source is an area emitter, not an assumed portrait flash.
const screen = resolve();
assert.equal(screen.lighting.phoneScreenOnly,true);
assert.match(screen.lighting.sourceModel,/OLED display/);
assert(!screen.issues.some(issue=>issue.code==='UNDECLARED_STUDIO_LIGHT'));

// 10: Catchlights are not fabricated by this validator.
assert(!('eyeCatchlightCount' in screen.lighting));

// 11: Portrait bokeh requires evidence of computational processing.
assert(resolve({pose:'extreme shallow depth',portraitModeEnabled:false})
  .issues.some(issue=>issue.code==='UNJUSTIFIED_BOKEH'));

// 12: Camera optics are computed only from measured/custom values.
assert.equal(resolve().optics.horizontalFovDeg,null);
const optics = resolve({selfieCalibration:{sensorWidthMm:6,opticalFocalMm:4,equivalentFocalMm:24}});
assert.equal(optics.optics.status,'derived-from-inputs');
assert(optics.optics.horizontalFovDeg!>70 && optics.optics.horizontalFovDeg!<80);
assert(!optics.issues.some(i=>i.code==='FOCAL_EQUIVALENCE_CONFLICT'));

// 13: Wardrobe selection is complete while image prompt filters hidden regions.
const clothes=compileVisibleWardrobe(base,'light blue shirt paired with navy trousers; black belt');
assert.match(clothes.fullSelection,/trousers/);
assert.match(clothes.visiblePrompt,/shirt/i);
assert.doesNotMatch(clothes.visiblePrompt,/belt|trousers/i);
assert(clothes.hiddenRegions.includes('waist and belt'));

// 14: Seatbelt shoulder directions follow LHD/right-side passenger geometry.
const driverText=describeRangeRoverSport({...base,model:'l494-2022',outdoor:false});
const passText=describeRangeRoverSport({...base,model:'l494-2022',outdoor:false,subScene:'car_front_passenger'});
assert.match(driverText,/Driver belt from vehicle-left shoulder/);
assert.match(passText,/Passenger belt from vehicle-right shoulder/);

// 15: No demographic assumptions arise from calibration-only validation.
assert(!JSON.stringify(screen).includes('Saudi male'));
assert(!JSON.stringify(screen).includes('35-year-old'));

// 16: Repeated validation is deterministic.
assert.deepEqual(resolve(),resolve());

// 17: Structured reports serialize without NaN and without undefined numerics.
assert.doesNotThrow(()=>JSON.parse(JSON.stringify(optics)));
assert(!JSON.stringify(optics).includes('NaN'));

// 18: Blocking contradictions really block acceptance.
assert.equal(resolve({vehicleMotion:'moving'}).hasBlocker,true);
assert(resolve({vehicleMotion:'moving'}).issues.some(i=>i.severity==='BLOCKER'));

// 19: Preserve 2017 default and distinguish 2022 facelift.
assert.match(describeRangeRoverSport({...base,outdoor:false}),/2017 Range Rover Sport/);
assert.match(driverText,/Touch Pro Duo/);
assert.doesNotMatch(driverText,/2017 cabin: one central infotainment/);
assert.equal(resolve({vehicleModel:'l494-2022'}).model,'l494-2022');

// 20: Normal parked scenario is not blocked.
assert.equal(resolve({vehicleMotion:'parked'}).hasBlocker,false);

console.log('physicalConsistency: 20 regression scenarios passed');
