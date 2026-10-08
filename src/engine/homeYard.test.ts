import assert from 'node:assert/strict';
import {
  HOME_SECTION_LABEL_AR,
  HOME_YARD_BLUEPRINT,
  compileHomeYardEnvironment,
  isHomeYardMicroLocationId,
  resolveHomeYardVisibility,
} from './homeYard';

assert.equal(HOME_SECTION_LABEL_AR, 'المنزل');
assert.equal(HOME_YARD_BLUEPRINT.vehicle.identity.includes('2017 Range Rover Sport L494 pre-facelift'), true);
assert.equal(HOME_YARD_BLUEPRINT.vehicle.identity.includes('Fuji White'), true);
assert.match(HOME_YARD_BLUEPRINT.vehicle.lightingState, /OFF by default/i);

assert.equal(isHomeYardMicroLocationId('hy_front_door'), true);
assert.equal(isHomeYardMicroLocationId('lr_center_room'), false);

const beside = resolveHomeYardVisibility({
  microLocationId: 'hy_beside_range_rover',
  framingClass: 'wide',
  cameraAngle: 'eye-level',
  captureType: 'front-selfie',
});
assert.equal(beside?.vehicleVisibility, 'full');
assert.equal(beside?.visibleGroundEffects, true);
assert.match(compileHomeYardEnvironment(beside!), /fixed parking bay/i);
assert.match(compileHomeYardEnvironment(beside!), /40-60cm/i);
assert.doesNotMatch(compileHomeYardEnvironment(beside!), /65cm/i);

const tightFrontDoor = resolveHomeYardVisibility({
  microLocationId: 'hy_front_door',
  framingClass: 'tight',
  cameraAngle: 'eye-level',
  captureType: 'front-selfie',
});
assert.equal(tightFrontDoor?.vehicleVisibility, 'none');
assert.equal(tightFrontDoor?.vehiclePrompt.length, 0);

const sideFrontDoor = resolveHomeYardVisibility({
  microLocationId: 'hy_front_door',
  framingClass: 'medium',
  cameraAngle: 'slightly-off-center',
  captureType: 'front-selfie',
});
assert.equal(sideFrontDoor?.vehicleVisibility, 'partial');

const gate = resolveHomeYardVisibility({
  microLocationId: 'hy_outside_gate',
  framingClass: 'wide',
  cameraAngle: 'slightly-off-center',
  captureType: 'front-selfie',
});
assert.equal(gate?.vehicleVisibility, 'partial');
assert(
  gate?.geometryGuards.some(rule => /closed solid gate fully occludes/i.test(rule)),
  'Outside-gate view must respect solid-gate occlusion'
);
assert(
  gate?.geometryGuards.some(rule => /headlights, fog lights and brake lights OFF by default/i.test(rule)),
  'Parked vehicle lights must remain off unless explicitly activated'
);

const nonYard = resolveHomeYardVisibility({
  microLocationId: 'lr_center_room',
  framingClass: 'wide',
  cameraAngle: 'eye-level',
  captureType: 'front-selfie',
});
assert.equal(nonYard, null);

console.log('homeYard tests passed');
