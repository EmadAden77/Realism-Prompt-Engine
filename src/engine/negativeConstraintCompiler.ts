import type { SemanticPromptScene } from './promptCompiler';

export interface NegativeConstraintState {
  glassesMode: string;
  realismStyle: string;
  captureType: string;
  groupSelfieEnabled?: boolean;
  shirtButtons?: string;
  shirtTuck?: string;
  sleeveStyle?: string;
  lightingMode: string;
  sceneFamily: string | null;
  atmosphericCondition: string;
  muscleFatigue: string;
  lightingIntensity: number;
  shadowDepth: number;
}

export interface NegativeConstraintFragment {
  id: string;
  category:
    | 'baseline'
    | 'identity'
    | 'camera'
    | 'group'
    | 'attire'
    | 'lighting'
    | 'environment'
    | 'atmosphere'
    | 'fatigue';
  text: string;
  reason: string;
  sceneFacts: string[];
}

export interface NegativeConstraintConflict {
  code: string;
  fragmentId: string;
  message: string;
}

export interface CompiledNegativeConstraints {
  text: string;
  fragments: NegativeConstraintFragment[];
  omittedConflictingFragments: NegativeConstraintFragment[];
  conflicts: NegativeConstraintConflict[];
}

const fragment = (
  id: string,
  category: NegativeConstraintFragment['category'],
  text: string,
  reason: string,
  sceneFacts: string[]
): NegativeConstraintFragment => ({
  id,
  category,
  text: text.trim(),
  reason,
  sceneFacts,
});

const buildRawNegativeFragments = (
  state: NegativeConstraintState
): NegativeConstraintFragment[] => {
  const fragments: NegativeConstraintFragment[] = [
    fragment(
      'NEG_BASELINE_ANATOMY_IDENTITY',
      'baseline',
      'identity drift, altered facial proportions, changed hairline, increased hair density, filled sparse hair, beautification filters, airbrushing, waxy skin, CGI appearance, synthetic face, perfect symmetry, cartoon, illustration, extra fingers, malformed hands, missing limbs, floating objects.',
      'Always protect identity stability, human anatomy, and photographic appearance.',
      ['baseline']
    ),
  ];

  if (state.glassesMode === 'no_glasses') {
    fragments.push(
      fragment(
        'NEG_GLASSES_ABSENT',
        'identity',
        'eyeglasses, spectacles, sunglasses, reading glasses, frames on face, tinted lenses.',
        'Scene explicitly requires no glasses.',
        ['glassesMode=no_glasses']
      )
    );
  } else if (state.glassesMode === 'wear_glasses') {
    fragments.push(
      fragment(
        'NEG_GLASSES_REQUIRED',
        'identity',
        'missing glasses, bare eyes without frames, no eyeglasses.',
        'Scene explicitly requires eyeglasses.',
        ['glassesMode=wear_glasses']
      )
    );
  }

  if (state.realismStyle === 'anti-ai-raw') {
    fragments.push(
      fragment(
        'NEG_ANTI_AI_RAW_POLISH',
        'baseline',
        'masterpiece, award-winning photography, studio lighting, flawless skin, magazine cover, retouched, cinematic color grading, 3D render, octane render, unreal engine, smooth skin, plastic, digital painting, over-sharpened, denoised, pristine, clear, professional portrait.',
        'Anti-AI raw mode rejects polished studio/render aesthetics.',
        ['realismStyle=anti-ai-raw']
      )
    );
  } else {
    fragments.push(
      fragment(
        'NEG_GENERIC_RENDER_LOOK',
        'baseline',
        'plastic skin, 3D render look.',
        'All realism styles reject synthetic skin and obvious 3D rendering.',
        [`realismStyle=${state.realismStyle}`]
      )
    );
  }

  if (state.captureType === 'front-selfie') {
    fragments.push(
      fragment(
        'NEG_FRONT_SELFIE_CAMERA',
        'camera',
        'floating camera, third-person perspective, impossible selfie arm length, professional studio bokeh on selfie, DSLR extreme shallow depth of field.',
        'Front-selfie geometry requires a physically reachable handheld smartphone camera.',
        ['captureType=front-selfie']
      )
    );
  }

  if (state.groupSelfieEnabled) {
    fragments.push(
      fragment(
        'NEG_GROUP_CLONING',
        'group',
        'cloned faces, twin-like companions, repeated face identity, duplicated skull geometry, duplicated hairline, identical beard patterns, identical body builds, identical heights, duplicated outfits, face-swapped companions, repeated hands, mirrored duplicate poses, every person holding a phone, multiple selfie arms, perfectly symmetric group arrangement.',
        'Group selfies require distinct secondary identities and one coherent selfie-camera holder.',
        ['groupSelfieEnabled=true']
      )
    );
  }

  if (state.shirtButtons === 'fully-buttoned') {
    fragments.push(
      fragment(
        'NEG_SHIRT_FULLY_BUTTONED',
        'attire',
        'open shirt collar, unbuttoned shirt placket, exposed upper chest through shirt opening.',
        'Shirt buttons are explicitly fully buttoned.',
        ['shirtButtons=fully-buttoned']
      )
    );
  } else if (state.shirtButtons === 'top-one-open') {
    fragments.push(
      fragment(
        'NEG_SHIRT_TOP_ONE_OPEN',
        'attire',
        'fully buttoned shirt collar, two or more open shirt buttons, deep shirt opening.',
        'Exactly the top shirt button is open.',
        ['shirtButtons=top-one-open']
      )
    );
  } else if (state.shirtButtons === 'top-two-open') {
    fragments.push(
      fragment(
        'NEG_SHIRT_TOP_TWO_OPEN',
        'attire',
        'fully buttoned shirt collar, three or more open shirt buttons, excessively deep shirt opening.',
        'Exactly the top two shirt buttons are open.',
        ['shirtButtons=top-two-open']
      )
    );
  }

  if (state.shirtTuck === 'tucked') {
    fragments.push(
      fragment(
        'NEG_SHIRT_TUCKED',
        'attire',
        'untucked shirt hem, shirt hanging over waistband, half-tucked shirt.',
        'Shirt is explicitly tucked.',
        ['shirtTuck=tucked']
      )
    );
  } else if (state.shirtTuck === 'untucked') {
    fragments.push(
      fragment(
        'NEG_SHIRT_UNTUCKED',
        'attire',
        'fully tucked shirt, shirt hem disappearing uniformly inside waistband.',
        'Shirt is explicitly untucked.',
        ['shirtTuck=untucked']
      )
    );
  }

  if (state.sleeveStyle === 'down') {
    fragments.push(
      fragment(
        'NEG_SLEEVES_DOWN',
        'attire',
        'rolled sleeves, exposed forearms from rolled cuffs.',
        'Sleeves are explicitly worn down.',
        ['sleeveStyle=down']
      )
    );
  } else if (state.sleeveStyle === 'rolled-forearm') {
    fragments.push(
      fragment(
        'NEG_SLEEVES_ROLLED_FOREARM',
        'attire',
        'fully lowered sleeves, cuffs covering wrists.',
        'Sleeves are explicitly rolled to the forearms.',
        ['sleeveStyle=rolled-forearm']
      )
    );
  }

  if (state.lightingMode === 'إضاءة شاشة الهاتف فقط') {
    fragments.push(
      fragment(
        'NEG_PHONE_ONLY_LIGHT',
        'lighting',
        'glowing skin, bright background, ceiling lights on, impossible room-wide ambient light, daylight.',
        'Phone screen is the only permitted light source.',
        ['lightingMode=إضاءة شاشة الهاتف فقط']
      )
    );
  }

  if (state.sceneFamily === 'military-base') {
    fragments.push(
      fragment(
        'NEG_MILITARY_FANTASY',
        'environment',
        'sci-fi armor, futuristic military, non-saudi military uniform, excessive medals, combat action, weapons drawn.',
        'Military-base scenes remain ordinary Saudi administrative/work environments.',
        ['sceneFamily=military-base']
      )
    );
  }

  if (state.atmosphericCondition === 'high-humidity') {
    fragments.push(
      fragment(
        'NEG_HIGH_HUMIDITY_DRYNESS',
        'atmosphere',
        'matte powder-dry airbrushed skin, studio dehumidified air, perfectly dry hair.',
        'High humidity requires plausible moisture response.',
        ['atmosphericCondition=high-humidity']
      )
    );
  } else if (state.atmosphericCondition === 'dusty-haze') {
    fragments.push(
      fragment(
        'NEG_DUSTY_HAZE_CLEAN_AIR',
        'atmosphere',
        'sterile hospital-clean air, zero airborne particles, crystal clear infinite contrast.',
        'Dusty haze requires reduced distant contrast and plausible particulates.',
        ['atmosphericCondition=dusty-haze']
      )
    );
  } else if (state.atmosphericCondition === 'breezy') {
    fragments.push(
      fragment(
        'NEG_BREEZE_STATIC_ELEMENTS',
        'atmosphere',
        'static frozen stiff fabric, motionless helmet hair, mannequin stillness.',
        'Breezy conditions require coherent lightweight motion.',
        ['atmosphericCondition=breezy']
      )
    );
  }

  if (state.muscleFatigue !== 'none') {
    fragments.push(
      fragment(
        'NEG_FATIGUE_WELL_RESTED',
        'fatigue',
        'well-rested vibrant bright eyes, pure bleached white cartoon sclera, wide awake energized alert gaze, airbrushed smooth under-eye skin, fake porcelain flushed cheeks, cosmetic concealer, awake doll eyes.',
        'Selected fatigue state must remain visible instead of being beautified away.',
        [`muscleFatigue=${state.muscleFatigue}`]
      )
    );
  }

  if (state.lightingIntensity > 80) {
    fragments.push(
      fragment(
        'NEG_HIGH_INTENSITY_UNDEREXPOSURE',
        'lighting',
        'underexposed crushed dark ambiance, murky flat gloom.',
        'High selected lighting intensity must not render as a crushed low-light scene.',
        [`lightingIntensity=${state.lightingIntensity}`]
      )
    );
  }

  if (state.shadowDepth > 75) {
    fragments.push(
      fragment(
        'NEG_DEEP_SHADOW_FLATNESS',
        'lighting',
        'flat shadowless 3D render lighting, video game ambient light, erased neck shadow, floating head without cast shadows.',
        'Deep shadow setting requires visible grounded shadow structure.',
        [`shadowDepth=${state.shadowDepth}`]
      )
    );
  } else if (state.shadowDepth < 30) {
    fragments.push(
      fragment(
        'NEG_SOFT_SHADOW_HARSHNESS',
        'lighting',
        'pitch black harsh drop shadows, unnatural camera flash shadows.',
        'Soft shadow setting must not become harsh flash lighting.',
        [`shadowDepth=${state.shadowDepth}`]
      )
    );
  }

  return fragments;
};

const semanticText = (semantic: SemanticPromptScene): string =>
  [
    semantic.identity,
    semantic.body,
    semantic.glasses,
    semantic.captureMechanics,
    semantic.hair,
    semantic.expression,
    semantic.outfit,
    semantic.outfitPhysics,
    semantic.poseAndContact,
    semantic.visibleEnvironment,
    semantic.lighting,
    semantic.atmosphere,
    semantic.skinResponse,
    semantic.cameraRealism,
    semantic.styleConstraints,
    semantic.groupSelfie || '',
  ]
    .join('\n')
    .toLowerCase();

export function auditNegativeConstraintConsistency(
  semantic: SemanticPromptScene,
  fragments: NegativeConstraintFragment[]
): NegativeConstraintConflict[] {
  const positive = semanticText(semantic);
  const byId = new Set(fragments.map(item => item.id));
  const conflicts: NegativeConstraintConflict[] = [];

  if (
    byId.has('NEG_GLASSES_ABSENT') &&
    /wearing black rectangular full-rim eyeglasses|wearing eyeglasses|wearing spectacles/.test(positive)
  ) {
    conflicts.push({
      code: 'NEGATIVE_FORBIDS_REQUIRED_GLASSES',
      fragmentId: 'NEG_GLASSES_ABSENT',
      message: 'Negative constraints forbid glasses while the semantic scene explicitly requires wearing them.',
    });
  }

  if (
    byId.has('NEG_GLASSES_REQUIRED') &&
    /not wearing glasses|without glasses|bare-faced without eyewear/.test(positive)
  ) {
    conflicts.push({
      code: 'NEGATIVE_REQUIRES_FORBIDDEN_GLASSES',
      fragmentId: 'NEG_GLASSES_REQUIRED',
      message: 'Negative constraints require glasses while the semantic scene explicitly removes them.',
    });
  }

  if (
    byId.has('NEG_FRONT_SELFIE_CAMERA') &&
    /third-person candid photograph|smartphone mirror selfie/.test(positive)
  ) {
    conflicts.push({
      code: 'FRONT_SELFIE_NEGATIVE_WITH_NON_FRONT_CAPTURE',
      fragmentId: 'NEG_FRONT_SELFIE_CAMERA',
      message: 'Front-selfie negative constraints conflict with the semantic capture topology.',
    });
  }

  if (
    byId.has('NEG_PHONE_ONLY_LIGHT') &&
    /lighting source:\s*(?:ceiling|overhead)|ceiling lights?\s+(?:on|active)|daylight\s+as\s+primary/.test(positive)
  ) {
    conflicts.push({
      code: 'PHONE_ONLY_NEGATIVE_WITH_POSITIVE_AMBIENT_LIGHT',
      fragmentId: 'NEG_PHONE_ONLY_LIGHT',
      message: 'Phone-only negative constraints conflict with an explicitly active ambient/daylight source.',
    });
  }

  return conflicts;
}

/**
 * Compile state-driven negative constraints.
 *
 * Positive semantic state has higher priority than a conflicting negative
 * fragment. Any detected conflicting fragment is omitted before prompt output.
 */
export function compileNegativeConstraints(
  state: NegativeConstraintState,
  semantic?: SemanticPromptScene
): CompiledNegativeConstraints {
  const rawFragments = buildRawNegativeFragments(state);
  const conflicts = semantic
    ? auditNegativeConstraintConsistency(semantic, rawFragments)
    : [];
  const conflictIds = new Set(conflicts.map(conflict => conflict.fragmentId));

  const fragments = rawFragments.filter(item => !conflictIds.has(item.id));
  const omittedConflictingFragments = rawFragments.filter(item =>
    conflictIds.has(item.id)
  );

  return {
    text: fragments.map(item => item.text).join(' '),
    fragments,
    omittedConflictingFragments,
    conflicts,
  };
}
