import assert from 'node:assert/strict';
import {
  BEDROOM_INTERACTIVE_SELFIES,
  getBedroomSelfieActivities,
  evaluateCaptureFeasibility,
  resolveBedroomSelfieActivity
} from './bedroomSelfieAffordances';
import type { SceneState } from './physicsEngine';

assert.ok(BEDROOM_INTERACTIVE_SELFIES.length >= 15, 'Bedroom must have a varied interactive selfie library');
assert.ok(getBedroomSelfieActivities('desk').some(a => a.id === 'desk-trackpad'));
for (const zone of ['desk','chair','window','floor','wardrobe','mirror','bedside','bed'] as const) {
  assert.ok(getBedroomSelfieActivities(zone).length > 0, 'Zone must have interactive actions: ' + zone);
}
const desktop = BEDROOM_INTERACTIVE_SELFIES.find(a => a.id === 'desk-trackpad')!;
const bedroom = {
  sceneFamily:'bedroom', subScene:desktop.subScene, captureType:'front-selfie',
  bedroomSelfieActionId: desktop.id
} as const satisfies Pick<SceneState,'sceneFamily'|'subScene'|'captureType'|'bedroomSelfieActionId'>;
const allowed = resolveBedroomSelfieActivity(bedroom);
assert.equal(allowed.status,'ready');
assert.match(allowed.prompt,/free hand on laptop trackpad/);
assert.match(allowed.prompt,/capturing smartphone remains outside the image/);
assert.match(allowed.prompt,/requested arrangement, not an observed existing object/);
assert.equal(resolveBedroomSelfieActivity({...bedroom,subScene:'جالس فوق السرير'}).status,'blocked');
assert.equal(resolveBedroomSelfieActivity({...bedroom,captureType:'mirror-selfie'}).status,'blocked');
assert.equal(resolveBedroomSelfieActivity({...bedroom,bedroomSelfieActionId:'not-an-action'}).status,'blocked');
assert.equal(resolveBedroomSelfieActivity({...bedroom,bedroomSelfieActionId:undefined}).status,'inactive');
const mirror = BEDROOM_INTERACTIVE_SELFIES.find(a => a.id === 'mirror-laptop')!;
const reflected = resolveBedroomSelfieActivity({
  ...bedroom,subScene:mirror.subScene,captureType:'mirror-selfie',bedroomSelfieActionId:mirror.id
});
assert.equal(reflected.status,'ready');
assert.match(reflected.prompt,/one real capturing smartphone/);
assert.match(reflected.prompt,/no duplicated objects/);
const windowActivity=BEDROOM_INTERACTIVE_SELFIES.find(a=>a.id==='window-laptop')!;
assert.match(windowActivity.lighting,/daylight as side key/);
assert.doesNotMatch(windowActivity.camera,/fixed 45-degree requirement\./i); // text explicitly warns against fixed angle
console.log('Bedroom interactive selfie affordances passed');

const measured = {
  phoneToFaceCm: 50, usablePhoneArmReachCm: 60,
  horizontalFovDeg: 72, targetBearingDeg: 10, targetHalfWidthDeg: 8,
  freeHandTargetDistanceCm: 38, usableFreeHandReachCm: 55
};
assert.equal(evaluateCaptureFeasibility(measured).status, 'feasible');
assert.equal(evaluateCaptureFeasibility({}).status, 'unverified');
assert.equal(evaluateCaptureFeasibility({...measured, phoneToFaceCm: 70}).status, 'blocked');
assert.equal(evaluateCaptureFeasibility({...measured, targetBearingDeg: 35}).status, 'blocked');
assert.equal(evaluateCaptureFeasibility({...measured, freeHandTargetDistanceCm: 65}).status, 'blocked');
assert.equal(evaluateCaptureFeasibility({...measured, targetBearingDeg: Number.NaN}).status, 'blocked');
const pillow = BEDROOM_INTERACTIVE_SELFIES.find(a => a.id === 'bed-pillow')!;
const pillowState = {
  sceneFamily: 'bedroom' as const, subScene: pillow.subScene,
  captureType: 'front-selfie' as const, bedroomSelfieActionId: pillow.id
};
assert.equal(resolveBedroomSelfieActivity({...pillowState, captureFrameEvidence: measured}).status, 'ready');
assert.equal(resolveBedroomSelfieActivity({...pillowState, captureFrameEvidence: {...measured, targetBearingDeg: 50}}).status, 'blocked');
assert.match(resolveBedroomSelfieActivity(pillowState).prompt, /without verified measurements/);
