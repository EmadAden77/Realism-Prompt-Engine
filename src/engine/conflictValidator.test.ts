import assert from 'node:assert/strict';
import { detectCarSelfieOpticalConflicts, detectConditionalWearConflict, validateUnifiedConflicts } from './conflictValidator';
import { compileUnifiedPromptPipeline } from './unifiedPromptPipeline';
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

const clean = compileUnifiedPromptPipeline(base);
assert.equal(clean.diagnostics.conflictReport.errors.length, 0);
assert.equal(clean.diagnostics.conflictReport.isValid, true);
assert.equal(clean.diagnostics.isValid, true);

const mirrorOutdoor = compileUnifiedPromptPipeline({
  ...base,
  captureType: 'mirror-selfie',
  subScene: 'شارع فلل سكني',
});
const mirrorCorrection = mirrorOutdoor.diagnostics.conflictReport.corrections.find(
  item => item.affectedFields.includes('captureType')
);
assert(mirrorCorrection, 'Outdoor mirror selfie must be reported as an auto-correction');
assert.equal(mirrorCorrection?.severity, 'correction');
assert.equal(mirrorCorrection?.suggestedPatch?.captureType, 'front-selfie');
assert.equal(
  mirrorOutdoor.diagnostics.conflictReport.errors.length,
  0,
  'Safely auto-resolved input conflict must not remain an error'
);
assert.equal(mirrorOutdoor.diagnostics.isValid, true);

const phoneDay = compileUnifiedPromptPipeline({
  ...base,
  timeOfDay: 'morning',
  lightingMode: 'إضاءة شاشة الهاتف فقط',
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
});
const phoneCorrection = phoneDay.diagnostics.conflictReport.corrections.find(
  item => item.affectedFields.includes('lightingMode')
);
assert(phoneCorrection);
assert.match(
  String(phoneCorrection?.suggestedPatch?.lightingMode),
  /ضوء نهاري/,
  'Phone-only daytime correction must expose the resolved daylight patch'
);

const identityConflict = compileUnifiedPromptPipeline({
  ...base,
  glassesMode: 'no_glasses',
  customIdentityPrompt:
    'Preserve exact facial identity. Must wear dark rectangular eyeglasses.',
});
const glassesCorrection =
  identityConflict.diagnostics.conflictReport.corrections.find(
    item => item.affectedFields.includes('glassesMode')
  );
assert(glassesCorrection);
assert.equal(glassesCorrection?.suggestedPatch?.glassesMode, undefined);
assert.doesNotMatch(
  String(glassesCorrection?.suggestedPatch?.customIdentityPrompt || ''),
  /must wear dark rectangular eyeglasses/i
);
assert.equal(identityConflict.diagnostics.isValid, true);

const home = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  activity: 'جالس بهدوء',
  pose: 'جالس على حافة السرير',
  lightingMode: 'إضاءة أباجورة دافئة',
});
assert(home.manifest.continuityContext);
const hiddenAnchor = home.manifest.continuityContext!.permanentAnchors.find(
  anchor => !home.manifest.continuityContext!.visiblePermanentAnchors.includes(anchor)
);
assert(hiddenAnchor);

const badManifest = {
  ...home.manifest,
  resolved: {
    ...home.manifest.resolved,
    physicalState: {
      ...home.manifest.resolved.physicalState,
      visibleEnvironment:
        home.manifest.resolved.physicalState.visibleEnvironment +
        '; ' +
        hiddenAnchor,
    },
  },
};

const continuityReport = validateUnifiedConflicts({
  rawState: home.manifest.resolved.state,
  manifest: badManifest,
  semantic: home.semantic,
  negative: home.negative,
  inputValidation: home.diagnostics.inputValidation,
  resolvedValidation: home.diagnostics.resolvedValidation,
  chatgpt: home.platforms.chatgpt.validation,
  gemini: home.platforms.gemini.validation,
  midjourney: home.platforms.midjourney.validation,
  chatgptNegativePrompt: home.platforms.chatgpt.negativePrompt,
  geminiNegativePrompt: home.platforms.gemini.negativePrompt,
  midjourneyNegativePrompt: home.platforms.midjourney.negativePrompt,
  chatgptPrompt: home.platforms.chatgpt.prompt,
  geminiPrompt: home.platforms.gemini.prompt,
  midjourneyPrompt: home.platforms.midjourney.prompt,
});
assert(
  continuityReport.errors.some(
    item => item.code === 'FIXED_HOME_HIDDEN_ANCHOR_LEAK'
  )
);
assert.equal(continuityReport.isValid, false);

const divergenceReport = validateUnifiedConflicts({
  rawState: clean.manifest.resolved.state,
  manifest: clean.manifest,
  semantic: clean.semantic,
  negative: clean.negative,
  inputValidation: clean.diagnostics.inputValidation,
  resolvedValidation: clean.diagnostics.resolvedValidation,
  chatgpt: clean.platforms.chatgpt.validation,
  gemini: clean.platforms.gemini.validation,
  midjourney: clean.platforms.midjourney.validation,
  chatgptNegativePrompt: clean.platforms.chatgpt.negativePrompt,
  geminiNegativePrompt:
    clean.platforms.gemini.negativePrompt + ' synthetic divergence',
  midjourneyNegativePrompt: clean.platforms.midjourney.negativePrompt,
  chatgptPrompt: clean.platforms.chatgpt.prompt,
  geminiPrompt: clean.platforms.gemini.prompt,
  midjourneyPrompt: clean.platforms.midjourney.prompt,
});
assert(
  divergenceReport.errors.some(
    item => item.code === 'PLATFORM_NEGATIVE_DIVERGENCE'
  )
);

const noRef = compileUnifiedPromptPipeline({
  ...base,
  referenceImageId: null,
});
const falseReferenceReport = validateUnifiedConflicts({
  rawState: noRef.manifest.resolved.state,
  manifest: noRef.manifest,
  semantic: noRef.semantic,
  negative: noRef.negative,
  inputValidation: noRef.diagnostics.inputValidation,
  resolvedValidation: noRef.diagnostics.resolvedValidation,
  chatgpt: noRef.platforms.chatgpt.validation,
  gemini: noRef.platforms.gemini.validation,
  midjourney: noRef.platforms.midjourney.validation,
  chatgptNegativePrompt: noRef.platforms.chatgpt.negativePrompt,
  geminiNegativePrompt: noRef.platforms.gemini.negativePrompt,
  midjourneyNegativePrompt: noRef.platforms.midjourney.negativePrompt,
  chatgptPrompt:
    'Use the attached reference image to preserve identity. ' +
    noRef.platforms.chatgpt.prompt,
  geminiPrompt: noRef.platforms.gemini.prompt,
  midjourneyPrompt: noRef.platforms.midjourney.prompt,
});
assert(
  falseReferenceReport.errors.some(
    item => item.code === 'CHATGPT_FALSE_REFERENCE_CLAIM'
  )
);

const promptCorrectionReport = validateUnifiedConflicts({
  rawState: clean.manifest.resolved.state,
  manifest: clean.manifest,
  semantic: clean.semantic,
  negative: clean.negative,
  inputValidation: clean.diagnostics.inputValidation,
  resolvedValidation: clean.diagnostics.resolvedValidation,
  chatgpt: {
    ...clean.platforms.chatgpt.validation,
    isValid: false,
    contradictionsFound: [
      'Non-Xiaomi front-camera focal length detected in a Xiaomi 15 Ultra front-selfie prompt.',
    ],
  },
  gemini: clean.platforms.gemini.validation,
  midjourney: clean.platforms.midjourney.validation,
  chatgptNegativePrompt: clean.platforms.chatgpt.negativePrompt,
  geminiNegativePrompt: clean.platforms.gemini.negativePrompt,
  midjourneyNegativePrompt: clean.platforms.midjourney.negativePrompt,
  chatgptPrompt: clean.platforms.chatgpt.prompt,
  geminiPrompt: clean.platforms.gemini.prompt,
  midjourneyPrompt: clean.platforms.midjourney.prompt,
});
assert(
  promptCorrectionReport.corrections.some(
    item => item.code === 'CHATGPT_PROMPT_AUTO_CORRECTION'
  )
);
assert.equal(
  promptCorrectionReport.isValid,
  true,
  'Already repaired prompt contradictions are corrections, not unresolved errors'
);


const explicitHomePeople = compileUnifiedPromptPipeline({
  ...base,
  sceneFamily: 'living-room',
  subScene: 'منتصف الصالة',
  activity: 'جالس بهدوء',
  pose: 'جالس على الكنبة',
  lightingMode: 'إضاءة سقف',
  backgroundMode: 'active',
  backgroundHumans: 'light',
  backgroundPresence: 'visible',
  homeBackgroundPeopleMode: 'men',
  homeBackgroundCount: 2,
  homeBackgroundClothing: ['thobe-white', 'casual-jeans-tee'],
});
assert.equal(
  explicitHomePeople.diagnostics.conflictReport.errors.some(
    item =>
      item.code === 'EXPLICIT_HOME_PEOPLE_ERASED' ||
      item.code === 'EXPLICIT_HOME_PEOPLE_MISSING_FROM_PROMPT'
  ),
  false,
  'Explicit home background people must survive resolution and semantic compilation'
);

const erasedPeopleManifest = {
  ...explicitHomePeople.manifest,
  resolved: {
    ...explicitHomePeople.manifest.resolved,
    physicalState: {
      ...explicitHomePeople.manifest.resolved.physicalState,
      backgroundRealism: {
        ...explicitHomePeople.manifest.resolved.physicalState.backgroundRealism,
        humanDensity: 'none' as const,
        allowsHumans: false,
      },
    },
  },
};
const erasedPeopleReport = validateUnifiedConflicts({
  rawState: explicitHomePeople.manifest.resolved.state,
  manifest: erasedPeopleManifest,
  semantic: explicitHomePeople.semantic,
  negative: explicitHomePeople.negative,
  inputValidation: explicitHomePeople.diagnostics.inputValidation,
  resolvedValidation: explicitHomePeople.diagnostics.resolvedValidation,
  chatgpt: explicitHomePeople.platforms.chatgpt.validation,
  gemini: explicitHomePeople.platforms.gemini.validation,
  midjourney: explicitHomePeople.platforms.midjourney.validation,
  chatgptNegativePrompt: explicitHomePeople.platforms.chatgpt.negativePrompt,
  geminiNegativePrompt: explicitHomePeople.platforms.gemini.negativePrompt,
  midjourneyNegativePrompt: explicitHomePeople.platforms.midjourney.negativePrompt,
  chatgptPrompt: explicitHomePeople.platforms.chatgpt.prompt,
  geminiPrompt: explicitHomePeople.platforms.gemini.prompt,
  midjourneyPrompt: explicitHomePeople.platforms.midjourney.prompt,
});
assert(
  erasedPeopleReport.errors.some(item => item.code === 'EXPLICIT_HOME_PEOPLE_ERASED'),
  'Validator must block silent erasure of explicitly selected home people'
);

const livingRoomLeakReport = validateUnifiedConflicts({
  rawState: explicitHomePeople.manifest.resolved.state,
  manifest: explicitHomePeople.manifest,
  semantic: {
    ...explicitHomePeople.semantic,
    visibleEnvironment:
      explicitHomePeople.semantic.visibleEnvironment +
      ' traditional majlis sofa arrangement with dark red carpet and floor seating',
  },
  negative: explicitHomePeople.negative,
  inputValidation: explicitHomePeople.diagnostics.inputValidation,
  resolvedValidation: explicitHomePeople.diagnostics.resolvedValidation,
  chatgpt: explicitHomePeople.platforms.chatgpt.validation,
  gemini: explicitHomePeople.platforms.gemini.validation,
  midjourney: explicitHomePeople.platforms.midjourney.validation,
  chatgptNegativePrompt: explicitHomePeople.platforms.chatgpt.negativePrompt,
  geminiNegativePrompt: explicitHomePeople.platforms.gemini.negativePrompt,
  midjourneyNegativePrompt: explicitHomePeople.platforms.midjourney.negativePrompt,
  chatgptPrompt: explicitHomePeople.platforms.chatgpt.prompt,
  geminiPrompt: explicitHomePeople.platforms.gemini.prompt,
  midjourneyPrompt: explicitHomePeople.platforms.midjourney.prompt,
});
assert(
  livingRoomLeakReport.errors.some(
    item => item.code === 'LIVING_ROOM_MAJLIS_FURNITURE_LEAK'
  ),
  'Validator must block majlis-only furniture from leaking into a modern living room'
);

// Optical regression: explicit CGI-style blur is forbidden, but a negative
// instruction mentioning the same phrase must not create a false alarm.
const carSelfie = { sceneFamily: 'car' as const, captureType: 'front-selfie' as const };
assert.equal(detectCarSelfieOpticalConflicts(carSelfie, 'Add fake bokeh to the cabin background.'), true);
assert.equal(detectCarSelfieOpticalConflicts(carSelfie, 'No fake bokeh; preserve natural depth.'), false);
assert.equal(detectCarSelfieOpticalConflicts(carSelfie, 'Natural depth and ordinary window light.'), false);
assert.equal(detectCarSelfieOpticalConflicts({ ...carSelfie, captureType: 'third-person-candid' }, 'Add fake bokeh.'), false);

console.log('conflictValidator tests passed');

const groceryWear = { wearProfile: { surfaceCondition: 'dry' as const } };
assert.equal(detectConditionalWearConflict(groceryWear, 'wet floor reflecting ceiling lights'), true);
assert.equal(detectConditionalWearConflict(groceryWear, 'No wet floor, ordinary dry tile threshold'), false);
assert.equal(detectConditionalWearConflict(groceryWear, 'fingerprints on the glass entrance door'), false);
assert.equal(detectConditionalWearConflict(undefined, 'wet floor'), false);
