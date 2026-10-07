import assert from 'node:assert/strict';
import {
  auditNegativeAgainstPositivePrompt,
  compileNegativeConstraints,
  type NegativeConstraintState,
} from './negativeConstraintCompiler';
import type { SemanticPromptScene } from './promptCompiler';

const base: NegativeConstraintState = {
  glassesMode: 'match_reference',
  realismStyle: 'anti-ai-raw',
  captureType: 'front-selfie',
  groupSelfieEnabled: false,
  shirtButtons: 'auto',
  shirtTuck: 'auto',
  sleeveStyle: 'auto',
  lightingMode: 'إنارة شارع دافئة',
  sceneFamily: 'saudi-outdoor',
  atmosphericCondition: 'neutral',
  muscleFatigue: 'none',
  lightingIntensity: 55,
  shadowDepth: 60,
};

const semanticBase: SemanticPromptScene = {
  identity: 'preserve exact identity',
  body: '193cm, 83kg, tall lean-athletic male build',
  glasses: 'eyewear naturally follows reference image',
  captureMechanics: 'Smartphone front-camera capture at realistic arm reach.',
  hair: 'natural hair',
  expression: 'neutral expression',
  outfit: 'burgundy shirt and grey trousers',
  outfitPhysics: 'natural fabric folds',
  poseAndContact: 'standing naturally',
  visibleEnvironment: 'ordinary Saudi residential street',
  lighting: 'Time: night. Lighting source: إنارة شارع دافئة.',
  atmosphere: 'clear night air',
  skinResponse: 'natural skin texture',
  cameraRealism: 'raw smartphone capture',
  styleConstraints: 'camera MUST NOT be floating freely',
};

const neutral = compileNegativeConstraints(base, semanticBase);
const neutralIds = neutral.fragments.map(item => item.id);

assert(neutralIds.includes('NEG_BASELINE_ANATOMY_IDENTITY'));
assert(neutralIds.includes('NEG_ANTI_AI_RAW_POLISH'));
assert(neutralIds.includes('NEG_FRONT_SELFIE_CAMERA'));
assert(!neutralIds.includes('NEG_GLASSES_ABSENT'));
assert(!neutralIds.includes('NEG_GLASSES_REQUIRED'));
assert.equal(neutral.conflicts.length, 0);
assert.match(neutral.text, /identity drift/);
assert.match(neutral.text, /floating camera/);

for (const item of neutral.fragments) {
  assert(item.reason.length > 0, item.id + ': missing reason');
  assert(item.sceneFacts.length > 0, item.id + ': missing scene facts');
}

const noGlassesSemantic = {
  ...semanticBase,
  glasses: 'not wearing glasses',
};
const noGlasses = compileNegativeConstraints(
  { ...base, glassesMode: 'no_glasses' },
  noGlassesSemantic
);
assert(noGlasses.fragments.some(item => item.id === 'NEG_GLASSES_ABSENT'));
assert.match(noGlasses.text, /eyeglasses, spectacles/);
assert.equal(noGlasses.conflicts.length, 0);

const wearGlassesSemantic = {
  ...semanticBase,
  glasses: 'wearing black rectangular full-rim eyeglasses',
};
const wearGlasses = compileNegativeConstraints(
  { ...base, glassesMode: 'wear_glasses' },
  wearGlassesSemantic
);
assert(wearGlasses.fragments.some(item => item.id === 'NEG_GLASSES_REQUIRED'));
assert.match(wearGlasses.text, /missing glasses/);
assert.equal(wearGlasses.conflicts.length, 0);

const mismatchedSemantic = compileNegativeConstraints(
  { ...base, glassesMode: 'no_glasses' },
  wearGlassesSemantic
);
assert.equal(mismatchedSemantic.conflicts.length, 1);
assert.equal(
  mismatchedSemantic.conflicts[0].code,
  'NEGATIVE_FORBIDS_REQUIRED_GLASSES'
);
assert(
  mismatchedSemantic.omittedConflictingFragments.some(
    item => item.id === 'NEG_GLASSES_ABSENT'
  )
);
assert.doesNotMatch(
  mismatchedSemantic.text,
  /eyeglasses, spectacles/,
  'Conflicting negative fragment must be removed before output'
);

const enhancedPromptConflict = compileNegativeConstraints(
  { ...base, glassesMode: 'no_glasses' },
  noGlassesSemantic,
  'Generate a portrait of the subject wearing black rectangular full-rim eyeglasses.'
);
assert.equal(enhancedPromptConflict.conflicts.length, 1);
assert(
  enhancedPromptConflict.omittedConflictingFragments.some(
    item => item.id === 'NEG_GLASSES_ABSENT'
  ),
  'Final enhanced positive prompt must be able to suppress a contradictory negative rule'
);

const directAudit = auditNegativeAgainstPositivePrompt(
  'Smartphone mirror selfie.',
  neutral.fragments
);
assert(
  directAudit.some(
    item => item.code === 'FRONT_SELFIE_NEGATIVE_WITH_NON_FRONT_CAPTURE'
  )
);

const mirror = compileNegativeConstraints(
  { ...base, captureType: 'mirror-selfie' },
  {
    ...semanticBase,
    captureMechanics: 'Smartphone mirror selfie with geometrically correct reflection.',
  }
);
assert(
  !mirror.fragments.some(item => item.id === 'NEG_FRONT_SELFIE_CAMERA'),
  'Mirror selfie must not inherit front-selfie camera negatives'
);

const group = compileNegativeConstraints(
  { ...base, groupSelfieEnabled: true },
  semanticBase
);
assert(group.fragments.some(item => item.id === 'NEG_GROUP_CLONING'));
assert.match(group.text, /cloned faces/);

const shirtOneOpen = compileNegativeConstraints(
  { ...base, shirtButtons: 'top-one-open' },
  semanticBase
);
assert(shirtOneOpen.fragments.some(item => item.id === 'NEG_SHIRT_TOP_ONE_OPEN'));
assert.match(shirtOneOpen.text, /two or more open shirt buttons/);

const tucked = compileNegativeConstraints(
  { ...base, shirtTuck: 'tucked' },
  semanticBase
);
assert(tucked.fragments.some(item => item.id === 'NEG_SHIRT_TUCKED'));
assert.match(tucked.text, /untucked shirt hem/);

const sleeves = compileNegativeConstraints(
  { ...base, sleeveStyle: 'rolled-forearm' },
  semanticBase
);
assert(
  sleeves.fragments.some(item => item.id === 'NEG_SLEEVES_ROLLED_FOREARM')
);

const phoneOnlySemantic = {
  ...semanticBase,
  lighting: 'Time: night. Lighting source: إضاءة شاشة الهاتف فقط.',
};
const phoneOnly = compileNegativeConstraints(
  {
    ...base,
    lightingMode: 'إضاءة شاشة الهاتف فقط',
    lightingIntensity: 12,
  },
  phoneOnlySemantic
);
assert(phoneOnly.fragments.some(item => item.id === 'NEG_PHONE_ONLY_LIGHT'));
assert.match(phoneOnly.text, /ceiling lights on/);
assert.equal(phoneOnly.conflicts.length, 0);

const phoneLightMismatch = compileNegativeConstraints(
  {
    ...base,
    lightingMode: 'إضاءة شاشة الهاتف فقط',
    lightingIntensity: 12,
  },
  phoneOnlySemantic,
  'Lighting source: إضاءة سقف. Bright indoor scene.'
);
assert(
  phoneLightMismatch.conflicts.some(
    item => item.code === 'PHONE_ONLY_NEGATIVE_WITH_POSITIVE_AMBIENT_LIGHT'
  )
);
assert(
  !phoneLightMismatch.fragments.some(item => item.id === 'NEG_PHONE_ONLY_LIGHT')
);

const dusty = compileNegativeConstraints(
  { ...base, atmosphericCondition: 'dusty-haze' },
  semanticBase
);
assert(dusty.fragments.some(item => item.id === 'NEG_DUSTY_HAZE_CLEAN_AIR'));
assert.match(dusty.text, /zero airborne particles/);

const breezy = compileNegativeConstraints(
  { ...base, atmosphericCondition: 'breezy' },
  semanticBase
);
assert(breezy.fragments.some(item => item.id === 'NEG_BREEZE_STATIC_ELEMENTS'));

const fatigued = compileNegativeConstraints(
  { ...base, muscleFatigue: 'heavy-eyelids' },
  semanticBase
);
assert(fatigued.fragments.some(item => item.id === 'NEG_FATIGUE_WELL_RESTED'));

const bright = compileNegativeConstraints(
  { ...base, lightingIntensity: 90 },
  semanticBase
);
assert(
  bright.fragments.some(item => item.id === 'NEG_HIGH_INTENSITY_UNDEREXPOSURE')
);

const deepShadow = compileNegativeConstraints(
  { ...base, shadowDepth: 85 },
  semanticBase
);
assert(deepShadow.fragments.some(item => item.id === 'NEG_DEEP_SHADOW_FLATNESS'));

const softShadow = compileNegativeConstraints(
  { ...base, shadowDepth: 20 },
  semanticBase
);
assert(softShadow.fragments.some(item => item.id === 'NEG_SOFT_SHADOW_HARSHNESS'));

const nonAntiAi = compileNegativeConstraints(
  { ...base, realismStyle: 'raw-candid' },
  semanticBase
);
assert(nonAntiAi.fragments.some(item => item.id === 'NEG_GENERIC_RENDER_LOOK'));
assert(!nonAntiAi.fragments.some(item => item.id === 'NEG_ANTI_AI_RAW_POLISH'));

const onlyGlassesChangedA = compileNegativeConstraints(
  { ...base, glassesMode: 'no_glasses' },
  noGlassesSemantic
);
const onlyGlassesChangedB = compileNegativeConstraints(
  { ...base, glassesMode: 'wear_glasses' },
  wearGlassesSemantic
);
const stableA = onlyGlassesChangedA.fragments
  .filter(item => !item.id.startsWith('NEG_GLASSES'))
  .map(item => item.id);
const stableB = onlyGlassesChangedB.fragments
  .filter(item => !item.id.startsWith('NEG_GLASSES'))
  .map(item => item.id);
assert.deepEqual(
  stableA,
  stableB,
  'Changing glasses mode must not alter unrelated negative rules'
);

console.log('negativeConstraintCompiler tests passed');
