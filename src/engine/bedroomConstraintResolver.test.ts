import assert from 'node:assert/strict';
import { resolveBedroomCapture, type BedroomCaptureConfig } from './bedroomConstraintResolver';

const base: BedroomCaptureConfig = {
  holdingHand:'right',
  hands:{right:'holding_phone',left:'touching_hair'},
  microGesture:'hair_touch',
  camera:{deviceId:'iPhone 15 Pro',module:'front',lensToFaceCm:55},
  body:{heightCm:193,weightKg:83,type:'lean_athletic'},
  pose:'pillow_supported',pillow:'fiber',mattress:'soft',
  lighting:{mode:'phone_screen_only',activeSources:['phone_screen'],lampVisible:true,lampOn:false,dustBeam:false},
  clothing:{top:'warm light-gray cotton T-shirt',bottom:'matching lounge sweatpants',fabric:'cotton',fit:'loose'},
  framing:'chest-up'
};
const clone = (): BedroomCaptureConfig => JSON.parse(JSON.stringify(base)) as BedroomCaptureConfig;
const passes=(c:BedroomCaptureConfig)=>assert.equal(resolveBedroomCapture(c).valid,true);
const fails=(c:BedroomCaptureConfig,code:string)=>{
  const r=resolveBedroomCapture(c);
  assert.equal(r.valid,false,code);
  if(!r.valid)assert.ok(r.errors.some(e=>e.code===code),code);
};
// A: legal free hand touching hair
passes(clone());
// B: phone hand cannot also touch hair
{const c=clone();c.hands.right='touching_hair';fails(c,'HOLDING_HAND_CONFLICT');}
// C: free hand resting conflicts with active hair touch
{const c=clone();c.hands.left='resting';fails(c,'GESTURE_HAND_CONFLICT');}
// D: screen only stays screen only
{const r=resolveBedroomCapture(clone());assert.ok(r.valid);
if(r.valid)assert.ok(!r.value.visualInstructions.join(' ').includes('illuminated bedside lamp'));}
// E: lamp OFF may remain visible
{const r=resolveBedroomCapture(clone());assert.ok(r.valid);
if(r.valid)assert.match(r.value.visualInstructions.join(' '),/unlit bedside lamp/);}
// F: canonical non-template body
{const r=resolveBedroomCapture(clone(),{weightKg:68});assert.ok(r.valid);if(r.valid)assert.equal(r.value.config.body.weightKg,83);}
// G: invalid module for selfie
{const c=clone();c.camera.module='rear_main';fails(c,'FRONT_SELFIE_MODULE');}
// H: sensor width not fabricated
{const r=resolveBedroomCapture(clone());assert.ok(r.valid);
if(r.valid)assert.equal(r.value.diagnostics.cameraSpec?.sensorWidthMm,undefined);}
// I: approximate selfie reach
passes(clone());
// J: side lying, supported head
{const c=clone();c.pose='right_side';passes(c);}
// K: no dust beam under screen-only conditions
{const c=clone();c.lighting.dustBeam=true;fails(c,'DUST_BEAM_UNSUPPORTED');}
// L: loose cloth under realistic contacts
{const r=resolveBedroomCapture(clone());assert.ok(r.valid);
if(r.valid)assert.match(r.value.visualInstructions.join(' '),/cloth wrinkles follow gravity/);}
// M: invisible trousers do not block
{const c=clone();c.clothing!.fullOutfitRequired=true;const r=resolveBedroomCapture(c);assert.ok(r.valid);
if(r.valid)assert.ok(r.warnings.some(w=>w.code==='OUTFIT_OUTSIDE_CROP'));}
// N: no invented facial traits
{const r=resolveBedroomCapture(clone());assert.ok(r.valid);
if(r.valid){assert.match(r.value.identityPrompt,/attached reference/);assert.doesNotMatch(r.value.identityPrompt,/brown eyes|oval face/);}}
// O: deterministic serialization
{const a=resolveBedroomCapture(clone()),b=resolveBedroomCapture(clone());assert.deepEqual(a,b);}
// Extra: self-support and light contradictions
{const c=clone();c.pose='elbow_supported';fails(c,'SUPPORT_HAND_CONFLICT');}
{const c=clone();c.lighting.activeSources.push('bedside_lamp');fails(c,'EXTRA_LIGHT_SOURCE');}
{const c=clone();c.lighting.lampOn=true;fails(c,'LAMP_ON_CONFLICT');}
{const c=clone();c.camera.lensToFaceCm=150;fails(c,'SELFIE_REACH');}
console.log('bedroomConstraintResolver: 19 regression assertions passed');
