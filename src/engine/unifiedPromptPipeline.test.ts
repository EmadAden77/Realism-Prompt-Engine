import assert from 'node:assert/strict';
import {
  compileUnifiedPromptPipeline,
  causalFingerprint,
  verifyCausalFingerprint,
  validateExternalPromptCandidate,
} from './unifiedPromptPipeline';
import type { SceneState } from './physicsEngine';

const base: SceneState = {
  referenceImageId: 'face-reference.jpg',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'واقف بشكل طبيعي',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف بثبات',
  outfitId: 'burgundy_shirt_grey_trousers',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إنارة شارع دافئة',
  environmentRealism: 'طبيعي',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 55,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const pipeline = compileUnifiedPromptPipeline(base);

assert.equal(pipeline.manifest.platformTarget, 'neutral');
assert.equal(pipeline.manifest.resolved.state.sceneFamily, 'saudi-outdoor');
assert.equal(pipeline.semantic.glasses, 'eyewear naturally follows reference image (preserve glasses if worn in reference, do not add if absent)');
assert.match(pipeline.neutral.text, /Generate a realistic photograph/);

assert.match(
  pipeline.platforms.chatgpt.rawPrompt,
  /attached image input only to preserve/i
);
assert.match(
  pipeline.platforms.gemini.rawPrompt,
  /provided image input only to preserve/i
);
assert.match(pipeline.platforms.chatgpt.prompt, /Photorealistic vertical 9:16/);
assert.match(pipeline.platforms.gemini.prompt, /Photorealistic vertical 9:16/);
assert.match(pipeline.platforms.midjourney.prompt, /Photorealistic vertical 9:16/);
assert.match(pipeline.platforms.midjourney.prompt, /--v 8\.2 --raw$/);
assert(pipeline.platforms.gemini.prompt.length < pipeline.neutral.text.length / 2, 'export must be substantially shorter than audited internal prompt');
assert.doesNotMatch(pipeline.platforms.gemini.prompt, /\\[CAUSAL REALISM CONSTRAINTS\\]/);
assert.equal(pipeline.platforms.chatgpt.adapter.recommendedModel, 'gpt-image-2.5-sunburst');
assert.equal(pipeline.platforms.gemini.adapter.recommendedModel, 'gemini-nano-banana-2.1');
assert.equal(pipeline.platforms.midjourney.adapter.referenceWorkflow, 'midjourney_edit_model');
assert.equal(pipeline.platforms.midjourney.adapter.referenceLimit, 4);

assert.equal(pipeline.platforms.chatgpt.validation.isValid, true);
assert.equal(pipeline.platforms.gemini.validation.isValid, true);
assert.equal(pipeline.platforms.midjourney.validation.isValid, true);
assert.equal(pipeline.diagnostics.negativeConflicts.length, 0);
assert.equal(pipeline.diagnostics.isValid, true);
assert(pipeline.neutral.compression.savedChars > 0);
assert(
  pipeline.diagnostics.compression.totalSavedChars >=
    pipeline.neutral.compression.savedChars
);

assert.match(pipeline.negative.text, /identity drift/);
assert.match(pipeline.negative.text, /floating camera/);
assert.equal(
  pipeline.platforms.chatgpt.negativePrompt,
  pipeline.platforms.gemini.negativePrompt,
  'ChatGPT and Gemini must share one reconciled negative prompt'
);
assert.equal(
  pipeline.platforms.chatgpt.negativePrompt,
  pipeline.platforms.midjourney.negativePrompt,
  'Midjourney must share the same canonical negative constraints'
);

const withoutReference = compileUnifiedPromptPipeline({
  ...base,
  referenceImageId: null,
});
assert.doesNotMatch(
  withoutReference.platforms.chatgpt.rawPrompt,
  /attached reference/i,
  'No-reference pipeline must not falsely claim an attachment'
);
assert.doesNotMatch(
  withoutReference.platforms.gemini.rawPrompt,
  /provided reference image/i
);
assert.doesNotMatch(
  withoutReference.platforms.midjourney.rawPrompt,
  /Edit Model reference/i
);
assert.equal(
  withoutReference.platforms.chatgpt.adapter.recommendedModel,
  'gpt-image-2.5-flare'
);

const wearGlasses = compileUnifiedPromptPipeline({
  ...base,
  glassesMode: 'wear_glasses',
});
assert.match(wearGlasses.semantic.glasses, /wearing black rectangular full-rim eyeglasses/);
assert.match(wearGlasses.negative.text, /missing glasses/);
assert.match(wearGlasses.negative.text, /no eyeglasses/);
assert.equal(
  wearGlasses.platforms.chatgpt.validation.contradictionsFound.length,
  0,
  'Valid "no eyeglasses" absence-constraint must not be misread as a prohibition on glasses'
);
assert.equal(wearGlasses.platforms.gemini.validation.contradictionsFound.length, 0);
assert.equal(wearGlasses.platforms.midjourney.validation.contradictionsFound.length, 0);

const noGlasses = compileUnifiedPromptPipeline({
  ...base,
  glassesMode: 'no_glasses',
});
assert.equal(noGlasses.semantic.glasses, 'not wearing glasses');
assert.match(noGlasses.negative.text, /eyeglasses, spectacles/);
assert.equal(noGlasses.diagnostics.isValid, true);

const phoneOnly = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  activity: 'جالس بهدوء',
  pose: 'جالس على حافة السرير',
  lightingMode: 'إضاءة شاشة الهاتف فقط',
  lightingIntensity: 12,
});
assert.match(phoneOnly.negative.text, /ceiling lights on/);
assert.match(phoneOnly.semantic.lighting, /إضاءة شاشة الهاتف فقط/);
assert.equal(phoneOnly.diagnostics.negativeConflicts.length, 0);

const externalConflict = validateExternalPromptCandidate(
  noGlasses,
  'gemini',
  'Generate the same subject wearing black rectangular full-rim eyeglasses in the resolved scene.'
);
assert(
  externalConflict.validation.contradictionsFound.some(item =>
    item.includes('explicitly forbids glasses')
  )
);
assert.match(externalConflict.prompt, /not wearing glasses/i);
assert.doesNotMatch(
  externalConflict.negativePrompt,
  /eyeglasses, spectacles/,
  'Contradictory negative fragment must be omitted while repairing the external positive candidate'
);

const repeated = compileUnifiedPromptPipeline(base);
assert.deepEqual(
  repeated.manifest.resolved.physicalState,
  pipeline.manifest.resolved.physicalState,
  'Unified pipeline must remain deterministic'
);
assert.deepEqual(repeated.negative.fragments, pipeline.negative.fragments);
assert.deepEqual(repeated.neutral.compression, pipeline.neutral.compression);
assert.deepEqual(repeated.negative.compression, pipeline.negative.compression);
assert.equal(
  repeated.platforms.chatgpt.prompt,
  pipeline.platforms.chatgpt.prompt
);
assert.equal(
  repeated.platforms.gemini.prompt,
  pipeline.platforms.gemini.prompt
);
assert.equal(
  repeated.platforms.midjourney.prompt,
  pipeline.platforms.midjourney.prompt
);

const insideCar = compileUnifiedPromptPipeline({
  ...base, sceneFamily: 'car', subScene: 'داخل السيارة',
  pose: 'جالس في مقعد السائق', activity: 'السيارة متوقفة'
});
assert.match(insideCar.platforms.gemini.prompt, /Inside the vehicle:/);
assert.doesNotMatch(insideCar.platforms.gemini.prompt, /Outside beside the parked vehicle:/);
const besideCar = compileUnifiedPromptPipeline({
  ...base, sceneFamily: 'car', subScene: 'بجانب السيارة في المواقف',
  pose: 'واقف بجانب باب السائق'
});
assert.match(besideCar.platforms.chatgpt.prompt, /Outside beside the parked vehicle:/);
assert.doesNotMatch(besideCar.platforms.chatgpt.prompt, /Inside the vehicle:/);

// Exported prompts must inherit resolved physical decisions, not guess from Arabic text.
const carSeatById = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'car',
  subScene: 'car_driver_parked',
  pose: 'جالس في مقعد السائق',
  lightingMode: 'إضاءة الشارع عبر زجاج السيارة',
});
assert.match(carSeatById.platforms.chatgpt.prompt, /Inside the vehicle:/);
assert.match(carSeatById.platforms.chatgpt.prompt, /seatback\/headrest behind/);
assert.match(carSeatById.platforms.chatgpt.prompt, /LEFT driver seat/);
assert.match(carSeatById.platforms.chatgpt.prompt, /2017 Range Rover Sport L494 pre-facelift/);
assert.match(carSeatById.platforms.chatgpt.prompt, /single|one central infotainment touchscreen/i);
assert.doesNotMatch(carSeatById.platforms.chatgpt.prompt, /ordinary modern sedan or SUV/);
assert.doesNotMatch(carSeatById.platforms.chatgpt.prompt, /Outside beside the parked vehicle:/);

const carOutsideById = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'car',
  subScene: 'car_outside_beside_door_closed',
  pose: 'واقف بجانب باب السائق',
  lightingMode: 'إنارة موقف ليلي بجانب السيارة',
});
assert.match(carOutsideById.platforms.gemini.prompt, /Outside beside the parked vehicle:/);
assert.doesNotMatch(carOutsideById.platforms.gemini.prompt, /Inside the vehicle:/);
assert.match(carOutsideById.platforms.gemini.prompt, /parking fixture/);

const carOutsideFreeText = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'car',
  subScene: 'بجانب السيارة في المواقف',
  pose: 'واقف بجانب باب السائق',
  lightingMode: 'إنارة موقف ليلي بجانب السيارة',
});
assert.equal(carOutsideFreeText.manifest.resolved.physicalState.bodyOrientation.includes('bucket seat'), false);
const rangeRoverExternalNight = compileUnifiedPromptPipeline({
  ...base, sceneFamily: 'car', subScene: 'car_beside_driver_door',
  pose: 'جالس في مقعد السائق', activity: 'واقف بشكل طبيعي',
  lightingMode: 'ضوء نهاري طبيعي', timeOfDay: 'night'
});
assert.equal(rangeRoverExternalNight.manifest.resolved.state.pose, 'واقف بجانب السيارة');
assert.equal(rangeRoverExternalNight.manifest.resolved.state.lightingMode, 'إنارة موقف ليلي بجانب السيارة');
assert.match(rangeRoverExternalNight.platforms.gemini.prompt, /Fuji White/);
assert.match(rangeRoverExternalNight.platforms.gemini.prompt, /pre-facelift/);
assert.match(rangeRoverExternalNight.platforms.gemini.prompt, /Headlights, taillights and dashboard stay OFF unless explicitly requested/);
assert.doesNotMatch(rangeRoverExternalNight.platforms.gemini.prompt, /full outdoor daylight|headrest, pillars and dashboard/i);

const rangeRoverPassenger = compileUnifiedPromptPipeline({
  ...base, sceneFamily: 'car', subScene: 'car_front_passenger',
  pose: 'واقف', timeOfDay: 'night',
  lightingMode: 'إنارة موقف ليلي بجانب السيارة'
});
assert.equal(rangeRoverPassenger.manifest.resolved.state.pose, 'جالس في مقعد الراكب');
assert.equal(rangeRoverPassenger.manifest.resolved.state.lightingMode, 'إضاءة الشارع عبر زجاج السيارة');
assert.match(rangeRoverPassenger.platforms.chatgpt.prompt, /RIGHT front passenger seat/);
assert.match(rangeRoverPassenger.platforms.chatgpt.prompt, /center console is to the LEFT/);
assert.doesNotMatch(rangeRoverPassenger.platforms.chatgpt.prompt, /standing beside the parked car|2018\+ dual-stack touchscreens as a feature/i);

const rangeRoverRear = compileUnifiedPromptPipeline({
  ...base, sceneFamily: 'car', subScene: 'car_in_front_trunk',
  pose: 'واقف بجانب السيارة', lightingMode: 'إنارة موقف ليلي بجانب السيارة',
});
assert.match(rangeRoverRear.platforms.gemini.prompt, /era-correct tailgate/);
assert.doesNotMatch(rangeRoverRear.platforms.gemini.prompt, /front grille appearing behind the person as a feature/);
assert.doesNotMatch(rangeRoverRear.platforms.gemini.prompt, /trunk lid/);

assert.match(carOutsideFreeText.platforms.gemini.prompt, /Outside beside the parked vehicle:/);

assert.match(pipeline.platforms.chatgpt.prompt, /21mm equivalent, f\/2\.0/);
assert.match(pipeline.platforms.chatgpt.prompt, /pitch\/yaw\/roll/);
assert.match(pipeline.platforms.chatgpt.prompt, /connected phone-holding arm/);
assert.match(pipeline.platforms.chatgpt.prompt, /true seams, weave, gravity folds and contact creases/);
assert.match(pipeline.platforms.chatgpt.prompt, /Same camera exposure and noise across face, clothing and background/);

assert.match(phoneOnly.platforms.gemini.prompt, /Only the phone screen lights face and near fingers/);
assert.match(phoneOnly.platforms.gemini.prompt, /rapid falloff below upper chest/);
assert.match(phoneOnly.platforms.gemini.prompt, /no ceiling\/bedside\/vehicle\/flash or invisible fill/);
assert.doesNotMatch(phoneOnly.platforms.gemini.prompt, /actual overhead streetlight/i);

const bedroomBedContact = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'bedroom', subScene: 'بجانب السرير',
  pose: 'جالس على حافة السرير', lightingMode: 'إضاءة أباجورة دافئة'
});
assert.match(bedroomBedContact.platforms.chatgpt.prompt, /Mattress and pillow compress only where body weight contacts/);
const selectedGaze = compileUnifiedPromptPipeline({...base, gazeInteractionId: 'g6'});
assert.match(selectedGaze.platforms.gemini.prompt, /Eyes focused on the phone screen rather than the lens/);

const garmentSettings = compileUnifiedPromptPipeline({
  ...base, shirtTuck: 'tucked', sleeveStyle: 'rolled-forearm',
  shirtButtons: 'top-one-open',
});
assert.match(garmentSettings.platforms.chatgpt.prompt, /tuck: tucked/);
assert.match(garmentSettings.platforms.chatgpt.prompt, /sleeves: rolled forearm/);
assert.match(garmentSettings.platforms.chatgpt.prompt, /buttons: top one open/);

const opticalMirror = compileUnifiedPromptPipeline({
  ...base, sceneFamily: 'bedroom', subScene: 'أمام المرآة',
  captureType: 'mirror-selfie', lightingMode: 'إضاءة أباجورة دافئة'
});
assert.match(opticalMirror.platforms.gemini.prompt, /Single real phone visible in one flat-mirror reflection/);
assert.doesNotMatch(opticalMirror.platforms.gemini.prompt, /Xiaomi 15 Ultra front camera/);

const outfitChanged = compileUnifiedPromptPipeline({
  ...base,
  outfitId: 'navy_shirt_grey_trousers',
});
assert.equal(
  outfitChanged.manifest.resolved.physicalState.cameraDistance,
  pipeline.manifest.resolved.physicalState.cameraDistance,
  'Outfit changes must not alter camera geometry through the unified pipeline'
);
assert.equal(
  outfitChanged.manifest.resolved.physicalState.visibleEnvironment,
  pipeline.manifest.resolved.physicalState.visibleEnvironment,
  'Outfit changes must not replace environment geometry through the unified pipeline'
);


assert.equal(
  pipeline.spatialPlan.backgroundCapacity,
  pipeline.manifest.resolved.physicalState.backgroundRealism.visibilityClass,
  'Planner must reuse the canonical visibility decision'
);
assert.equal(pipeline.spatialPlan.regions[0].role, 'subject');
assert.match(pipeline.semantic.visibleEnvironment, /Spatial composition:/);
assert.match(pipeline.platforms.gemini.prompt, /Photorealistic vertical 9:16/);

const closeSpatial = compileUnifiedPromptPipeline({
  ...base,
  framing: 'head-shoulders',
  backgroundHumans: 'high',
  backgroundVehicles: 'high',
});
assert.match(closeSpatial.spatialPlan.promptInstruction, /narrow areas actually visible/);
assert.equal(
  closeSpatial.spatialPlan.regions.find(region => region.role === 'near-background')?.visibility,
  'limited',
  'Tight selfies must not promise an expansive visible background'
);
assert.equal(
  closeSpatial.spatialPlan.regions.some(region => region.role === 'far-background'),
  false
);

const wideSpatial = compileUnifiedPromptPipeline({
  ...base,
  framing: 'half-body',
  cameraAngle: 'slightly-off-center',
  backgroundAutoAngle: false,
  backgroundPresence: 'visible',
});
assert.match(wideSpatial.spatialPlan.promptInstruction, /slightly off-center/);
assert.equal(wideSpatial.spatialPlan.regions[0].visibility, 'dominant');

const mirrorSpatial = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  captureType: 'mirror-selfie',
  lightingMode: 'إضاءة أباجورة دافئة',
});
assert.match(mirrorSpatial.spatialPlan.promptInstruction, /one coherent flat mirror plane/);
assert.doesNotMatch(mirrorSpatial.spatialPlan.promptInstruction, /outside the direct selfie image/);

assert.deepEqual(
  repeated.spatialPlan,
  pipeline.spatialPlan,
  'Spatial composition must be deterministic for identical scene settings'
);
assert.deepEqual(
  outfitChanged.spatialPlan,
  pipeline.spatialPlan,
  'Changing outfit cannot change spatial composition'
);


const insufficientAngle = compileUnifiedPromptPipeline({
  ...base,
  validatedAngleEvidence: { mode: 'auto' },
});
assert.equal(insufficientAngle.diagnostics.anglePromptReady, false);
assert.equal(insufficientAngle.diagnostics.isValid, false);
assert.equal(insufficientAngle.platforms.chatgpt.prompt, '');
assert.equal(insufficientAngle.platforms.gemini.prompt, '');
assert.equal(insufficientAngle.platforms.midjourney.prompt, '');
assert.equal(insufficientAngle.neutral.text, '');
assert.throws(
  () => validateExternalPromptCandidate(insufficientAngle, 'gemini', 'unsafe external prompt'),
  /Camera evidence insufficient/
);
const supportedAngle = compileUnifiedPromptPipeline({
  ...base,
  validatedAngleEvidence: { mode: 'auto', frontClearanceCm: 90, requiredFrontClearanceCm: 55 },
});
assert.equal(supportedAngle.diagnostics.anglePromptReady, true);
assert.ok(supportedAngle.platforms.gemini.prompt.length > 0);


const bedroomWork = compileUnifiedPromptPipeline({
  ...base, sceneFamily: 'bedroom', subScene: 'قرب الجدار المقابل للسرير',
  activity: 'يعمل على اللابتوب عند المكتب', pose: 'جالس على كرسي المكتب',
  timeOfDay: 'morning', lightingMode: 'ضوء نهاري طبيعي',
  bedroomSelfieActionId: 'desk-trackpad', captureType: 'front-selfie'
});
assert.equal(bedroomWork.diagnostics.anglePromptReady, true);
assert.match(bedroomWork.semantic.poseAndContact, /free hand on laptop trackpad/);
assert.match(bedroomWork.semantic.poseAndContact, /INTERACTIVE BEDROOM SELFIE AT SHUTTER TIME/);
assert.match(bedroomWork.platforms.gemini.prompt, /free hand on laptop trackpad/);
assert.match(bedroomWork.semantic.poseAndContact, /compact bedroom work desk/);
const incompatibleCapture = compileUnifiedPromptPipeline({
  ...base, sceneFamily: 'bedroom', subScene: 'قرب الجدار المقابل للسرير',
  bedroomSelfieActionId: 'desk-trackpad', captureType: 'mirror-selfie'
});
assert.equal(incompatibleCapture.diagnostics.anglePromptReady, false);
assert.equal(incompatibleCapture.platforms.gemini.prompt, '');
assert.deepEqual(incompatibleCapture.diagnostics.angleBlockingReasons, ['Interactive selfie zone, sub-location or capture mode mismatch']);
const mirrorInteraction = compileUnifiedPromptPipeline({
  ...base, sceneFamily: 'bedroom', subScene: 'أمام المرآة',
  bedroomSelfieActionId: 'mirror-collar', captureType: 'mirror-selfie'
});
assert.match(mirrorInteraction.semantic.poseAndContact, /one real capturing smartphone/);

console.log('unifiedPromptPipeline tests passed');

assert.ok(pipeline.causalLedger.length > 0, 'causal ledger should list prompt decisions');
const recordedFingerprint = pipeline.causalFingerprint;
assert.notEqual(recordedFingerprint, causalFingerprint({
  state: {...pipeline.manifest.resolved.state, timeOfDay:'midday'},
  angle:pipeline.manifest.angleDecision, prompt:pipeline.neutral.text
}), 'post-compile scene edit must change fingerprint');

const earIntegrated = compileUnifiedPromptPipeline({
  ...base,
  earTransmissionEvidence: {
    sourceBehindEar:true, earExposed:true, hairOccluded:false, tissuePathMm:3, viewerOnOppositeSide:true
  }
});
assert.match(earIntegrated.semantic.skinResponse, /warm red translucency/);
const earBlocked = compileUnifiedPromptPipeline({
  ...base,
  earTransmissionEvidence: {
    sourceBehindEar:true, earExposed:true, hairOccluded:true, tissuePathMm:3, viewerOnOppositeSide:true
  }
});
assert.doesNotMatch(earBlocked.semantic.skinResponse, /warm red translucency/);
assert.equal(verifyCausalFingerprint(pipeline), true);
pipeline.manifest.resolved.state.timeOfDay = 'midday';
assert.equal(verifyCausalFingerprint(pipeline), false);

const tightGroupPipeline = compileUnifiedPromptPipeline({
  ...base, groupSelfieEnabled:true, groupSelfieSize:4,
  measuredGroupSpaceWidthMeters:1.2,
});
assert.equal(tightGroupPipeline.manifest.resolved.physicalState.groupSelfie?.shoulderClearance?.clearanceConstraint,'tight');
assert.match(tightGroupPipeline.semantic.groupSelfie || '', /Lateral space is constrained/);
assert.match(tightGroupPipeline.platforms.gemini.prompt, /Limited lateral shoulder space/);
const openGroupPipeline = compileUnifiedPromptPipeline({
  ...base, groupSelfieEnabled:true, groupSelfieSize:2,
  measuredGroupSpaceWidthMeters:3,
});
assert.equal(openGroupPipeline.manifest.resolved.physicalState.groupSelfie?.shoulderClearance?.clearanceConstraint,'open');
assert.doesNotMatch(openGroupPipeline.platforms.gemini.prompt,/Limited lateral shoulder space/);

const sourcedWidth = compileUnifiedPromptPipeline({
  ...base,groupSelfieEnabled:true,groupSelfieSize:4,
  measuredGroupSpaceWidthMeters:1.2,groupSpaceWidthSource:'user-provided'
});
assert.equal(sourcedWidth.manifest.resolved.physicalState.groupSelfie?.measurementConfidence.classification,'measured');
assert.equal(sourcedWidth.manifest.resolved.physicalState.groupSelfie?.measurementConfidence.confidence,'medium');
const estimatedWidth = compileUnifiedPromptPipeline({
  ...base,groupSelfieEnabled:true,groupSelfieSize:4,
  measuredGroupSpaceWidthMeters:1.2,groupSpaceWidthSource:'estimated'
});
assert.equal(estimatedWidth.manifest.resolved.physicalState.groupSelfie?.measurementConfidence.classification,'estimated');
const noWidth = compileUnifiedPromptPipeline({...base,groupSelfieEnabled:true,groupSelfieSize:2});
assert.equal(noWidth.manifest.resolved.physicalState.groupSelfie?.measurementConfidence.classification,'unknown');


// Hairstyle selector must reach the canonical semantic prompt and both platform exports.
const hairstyleSamples = [
  ['h1', 'natural everyday hair'],
  ['h2', 'neatly styled back hair'],
  ['h3', 'neatly parted to the side hair'],
  ['h4', 'slightly messy casual hair'],
  ['h5', 'slightly sweat-dampened post-workout hair'],
  ['h6', 'very short neat military regulation haircut'],
] as const;
for (const [hairStyle, descriptor] of hairstyleSamples) {
  const compiled = compileUnifiedPromptPipeline({...base, hairStyle});
  assert.ok(compiled.semantic.hair.includes(descriptor), `Selected hairstyle ${hairStyle} missing from semantic engine`);
  assert.ok(compiled.platforms.chatgpt.prompt.includes(descriptor), `Selected hairstyle ${hairStyle} missing from ChatGPT export`);
  assert.ok(compiled.platforms.gemini.prompt.includes(descriptor), `Selected hairstyle ${hairStyle} missing from Gemini export`);
  assert.match(compiled.semantic.hair, /preserve the original hairline, density/i);
  assert.doesNotMatch(compiled.semantic.hair, /undefined/i);
}
const unknownHair = compileUnifiedPromptPipeline({...base, hairStyle: 'missing-hair-id'});
assert.match(unknownHair.semantic.hair, /natural everyday hair/);
assert.doesNotMatch(unknownHair.platforms.chatgpt.prompt, /undefined/);

const militaryHair = compileUnifiedPromptPipeline({...base, hairStyle:'h6'});
assert.match(militaryHair.semantic.hair, /No automatic haircut is permitted/);
assert.match(militaryHair.semantic.hair, /do not perform a digital buzz cut/);
const noHairReference = compileUnifiedPromptPipeline({...base, referenceImageId:null, hairStyle:'h2'});
assert.match(noHairReference.semantic.hair, /No visual hair reference is attached/);
assert.doesNotMatch(noHairReference.semantic.hair, /Use the supplied reference to determine/);
const referenceAwareHair = compileUnifiedPromptPipeline({...base, hairStyle:'h3'});
assert.match(referenceAwareHair.semantic.hair, /If the chosen styling is incompatible/);
assert.match(referenceAwareHair.semantic.hair, /existing hair only/);
