import { getMicroLocation, type SceneFamilyId } from '../data/microLocations';

export interface RealismDerivationState {
  sceneFamily: SceneFamilyId | null;
  subScene: string;
  activity: string;
  captureType: 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
  framing: 'head-shoulders' | 'chest-up' | 'half-body';
  pose: string;
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
  lightingMode: string;
  environmentRealism: string;
  realismStyle: string;
  lightingIntensity: number;
  shadowDepth: number;
  lensCondition: string;
  clothingCondition: string;
  atmosphericCondition: string;
  foregroundObstruction: string;
  muscleFatigue: string;
}

export interface DerivedSceneState {
  skinResponse: string;
  hairCondition: string;
  fabricBehavior: string[];
  shadowBehavior: string;
  environmentalLightBehavior: string;
  cameraDistance: string;
  visibleBackgroundElements: string[];
  contactPhysics: string[];
  reflectionRules: string[];
  realismConstraints: string[];
  lensEffects: string;
  atmosphericEffects: string;
  muscleFatigueEffects: string;
  lightingIntensityDescription: string;
  shadowDepthDescription: string;
}

/**
 * Deterministic realism derivation layer.
 *
 * Converts user/canonical scene controls into visible physical consequences.
 * It does not know about React, platform prompt syntax, or image-model adapters.
 */
export const deriveRealismState = (state: RealismDerivationState): DerivedSceneState => {
  const intensity = typeof state.lightingIntensity === 'number' ? state.lightingIntensity : 70;
  const depth = typeof state.shadowDepth === 'number' ? state.shadowDepth : 60;

  let lightingIntensityDescription = '';
  if (intensity <= 35) {
    lightingIntensityDescription = `dim ambient level (${intensity}%), low-intensity indirect bounce, subtle environmental illumination, deep natural light falloff in non-lit recesses`;
  } else if (intensity <= 75) {
    lightingIntensityDescription = `balanced natural ambient level (${intensity}%), authentic secondary light bounce reflecting off surrounding surfaces, realistic environmental diffuse fill`;
  } else {
    lightingIntensityDescription = `high luminous ambient level (${intensity}%), pronounced radiant light bounce from adjacent walls and surfaces, vibrant environmental illumination`;
  }

  let shadowDepthDescription = '';
  if (depth <= 35) {
    shadowDepthDescription = `soft diffused shadow hardness (${depth}%), gentle gradual penumbra falloff, shallow ambient occlusion under chin and facial contours, minimal edge sharpness`;
  } else if (depth <= 75) {
    shadowDepthDescription = `physically grounded shadow depth (${depth}%), natural contact shadow density, balanced penumbra sharpness, realistic occlusion under jawline, nose, and garment seams`;
  } else {
    shadowDepthDescription = `deep high-contrast shadow hardness (${depth}%), crisp hard-edged penumbras, dense dark ambient occlusion crevices, stark chiaroscuro separation between lit planes and shadows`;
  }

  const derived: DerivedSceneState = {
    skinResponse: 'natural restrained skin texture, visible pores, no artificial smoothing',
    hairCondition: 'maintains natural original density',
    fabricBehavior: [],
    shadowBehavior: `physically plausible contact shadows, shadow hardness calibrated to ${depth}% depth (${shadowDepthDescription})`,
    environmentalLightBehavior: `natural indirect bounce light, ambient light bounce calibrated to ${intensity}% intensity (${lightingIntensityDescription})`,
    cameraDistance: 'arm-length distance (approx 40-60cm)',
    visibleBackgroundElements: [],
    contactPhysics: [],
    reflectionRules: [],
    realismConstraints: [],
    lensEffects: 'clean modern lens processing',
    atmosphericEffects: 'Clean natural atmospheric clarity without particulate haze or wind blur, realistic crisp depth separation.',
    muscleFatigueEffects: 'Well-rested muscle condition: natural ocular clarity, balanced eyelid tension, and healthy resting epidermal tone.',
    lightingIntensityDescription,
    shadowDepthDescription
  };

  if (state.sceneFamily === 'gym' && state.activity === 'بعد التمرين') {
    derived.skinResponse = 'mild realistic perspiration, subtle natural skin sheen from physical exertion, realistic highlight roll-off';
    derived.hairCondition = 'slightly damp and natural clumping from sweat, preserving exact baseline density';
  } else if (state.sceneFamily === 'saudi-outdoor' && (state.timeOfDay === 'midday' || state.timeOfDay === 'afternoon') && state.activity === 'يمشي بهدوء') {
    derived.skinResponse = 'subtle natural sheen from outdoor heat, mild forehead moisture, natural unedited skin texture';
  } else if (state.lightingMode === 'إضاءة مكتب فلورسنت') {
    derived.skinResponse = 'unflattering office light skin response, slight cool/greenish tint on skin highlights typical of fluorescent bulbs, sharp downward shadows';
  } else if (state.lightingMode === 'إضاءة شاشة الهاتف فقط') {
    derived.skinResponse = 'no glowing skin, realistic low-light noise on skin surface, stark illumination falloff';
  }

  if (state.captureType === 'front-selfie') {
    derived.contactPhysics.push('one arm clearly extended holding the camera causing slight shoulder elevation and torso compensation');
    derived.realismConstraints.push('camera MUST NOT be floating freely', 'perspective MUST reflect a wide smartphone front-camera lens (approx 21mm eq)');
    if (state.framing === 'head-shoulders') derived.cameraDistance = 'close arm-reach (approx 40cm)';
    else if (state.framing === 'half-body') derived.cameraDistance = 'extended arm-reach (approx 65cm)';
  } else if (state.captureType === 'mirror-selfie') {
    derived.reflectionRules.push('geometrically accurate mirror reflection', 'smartphone clearly visible in hand in reflection', 'body orientation matches reflection physics');
  } else {
    derived.cameraDistance = 'third-person candid distance (approx 1.5 - 3 meters)';
    derived.realismConstraints.push('candid framing without selfie-arm mechanics');
  }

  if (state.pose.includes('جالس على حافة السرير')) {
    derived.contactPhysics.push('pelvis supported by mattress', 'localized mattress compression under body weight');
  } else if (state.pose.includes('جالس خلف المكتب')) {
    derived.contactPhysics.push('lower torso obscured by desk', 'forearms resting naturally on desk surface', 'office chair backrest visible behind shoulders');
  } else if (state.pose.includes('جالس في مقعد الراكب') || state.pose.includes('خلف المقود')) {
    derived.contactPhysics.push('torso realistically supported by car seat', 'clothing compressing against seat back');
  } else if (state.pose.includes('جالس على مقعد التمرين')) {
    derived.contactPhysics.push('weight distributed on gym bench', 'natural knee/hip angles grounded');
  } else if (state.pose.includes('مستند')) {
    derived.contactPhysics.push('clear physical contact point holding partial body weight');
  }

  if (state.lightingMode === 'إضاءة شاشة الهاتف فقط') {
    derived.environmentalLightBehavior = `stark rapid light falloff into darkness (${intensity}% ambient level), minimal ambient bounce; distant room elements completely obscure`;
    derived.shadowBehavior = `deep hard shadows radiating away from face, calibrated to ${depth}% shadow depth (${shadowDepthDescription})`;
    derived.realismConstraints.push('NO ceiling lights', 'NO impossible room-wide ambient illumination from phone');
  } else if (state.lightingMode === 'إضاءة مكتب فلورسنت') {
    derived.environmentalLightBehavior = `overhead flat fluorescent office lighting (${intensity}% ambient intensity), slightly sterile corporate/institutional atmosphere with diffused bounce`;
    derived.shadowBehavior = `multiple faint downward cast shadows with ${depth}% shadow depth (${shadowDepthDescription}), dark realistic eye sockets and under-chin shadows`;
  } else if (state.timeOfDay === 'midday' && (state.sceneFamily === 'saudi-outdoor' || state.sceneFamily === 'military-base')) {
    derived.environmentalLightBehavior = `hard directional sunlight (${intensity}% ambient bounce), bright realistic asphalt glare and hot diffuse radiosity`;
    derived.shadowBehavior = `strong, sharp, short shadows beneath objects and chin, calibrated at ${depth}% shadow hardness (${shadowDepthDescription})`;
  }

  // Retrieve micro-location metadata cleanly without hardcoded conditional chains
  const microLoc = getMicroLocation(state.sceneFamily, state.subScene);
  let baseDetails: string[] = microLoc ? [...microLoc.backgroundElements] : [];

  if (microLoc?.spatialBehavior) {
    derived.contactPhysics.push(microLoc.spatialBehavior);
  }
  if (microLoc?.lightingHints) {
    derived.environmentalLightBehavior += `, ambient environmental cues: ${microLoc.lightingHints}`;
  }

  if (state.environmentRealism.includes('نشط') && microLoc?.activity) {
    baseDetails.push(`secondary background activity: ${microLoc.activity}`);
  }

  if (state.framing === 'head-shoulders') derived.visibleBackgroundElements = baseDetails.slice(0, 2).map(d => `near-field: ${d}`);
  else if (state.framing === 'chest-up') derived.visibleBackgroundElements = baseDetails.slice(0, 3).map(d => `mid-field: ${d}`);
  else derived.visibleBackgroundElements = baseDetails;

  if (state.lensCondition === 'smudged-lens') {
    derived.lensEffects = 'photographed through a slightly smudged lens, oily finger smudge causing organic light bloom and streaks, soft glowing scattered glare around any light sources, localized loss of micro-contrast';
  } else {
    derived.lensEffects = 'clean standard smartphone lens capture without excessive professional sharpness';
  }

  if (state.clothingCondition === 'worn-all-day') {
    derived.fabricBehavior.push('fabric appears worn all day', 'irregular deep horizontal creases at joints like elbows or waist', 'random unsymmetrical bunching', 'loss of crisp ironing, localized wrinkles');
  } else if (state.clothingCondition === 'vintage-washed') {
    derived.fabricBehavior.push('faded fabric dye', 'slight wear and micro-fraying at the collar and sleeve edges', 'soft worn-in matte texture', 'pilling on surface');
  } else {
    derived.fabricBehavior.push('crisp clean fabric', 'natural tailored flow without excessive wrinkles');
  }

  // --- Atmospheric Condition Details ---
  if (state.atmosphericCondition === 'high-humidity') {
    derived.skinResponse += ', natural sweat sheen and subtle perspiration micro-droplets on forehead, temples, and bridge of nose due to heavy ambient humidity';
    derived.hairCondition += ', hair slightly damp and adhering to skin edges from high ambient moisture';
    derived.environmentalLightBehavior += ', soft ambient humidity bloom and gentle haloing around direct light sources';
    derived.atmosphericEffects = 'High ambient humidity atmosphere: visible moisture sheen on skin, subtle moisture clumping on hair tips, and soft optical light diffusion.';
  } else if (state.atmosphericCondition === 'dusty-haze') {
    derived.environmentalLightBehavior += ', authentic desert atmospheric dust haze reducing background contrast, warm amber-tan ambient tint, sunlight filtering through suspended fine dust micro-particles';
    derived.atmosphericEffects = 'Airborne desert dust haze: warm earthy micro-particulate atmospheric depth, softened distant contrast, and sunlight scattering through suspended dust.';
  } else if (state.atmosphericCondition === 'breezy') {
    derived.fabricBehavior.push('tangible gentle wind turbulence catching loose garment hems and creating authentic fabric flutter and tension ripples');
    derived.hairCondition += ', loose top and side hair strands subtly displaced and fluttering naturally with wind movement';
    derived.atmosphericEffects = 'Dynamic gentle breeze: visible wind motion catching clothing fabrics and naturally displacing loose hair strands.';
  } else {
    derived.atmosphericEffects = 'Clean natural atmospheric clarity without particulate haze or wind blur, realistic crisp depth separation.';
  }

  // --- Muscle & Ocular Fatigue (حالة الإرهاق العضلي وتفاصيل العين والبشرة) ---
  if (state.muscleFatigue === 'heavy-eyelids') {
    derived.muscleFatigueEffects = 'Heavy eyelid fatigue: visible eyelid ptosis with weakened levator palpebrae superioris causing relaxed, heavy upper eyelids that partially lower over the pupils, mild periorbital soft tissue sag, and subtle fluid puffiness in the inferior palpebral fold.';
    derived.skinResponse += ', authentic tired periorbital musculature with drooping heavy eyelids, natural lower eyelid sagging without cosmetic smoothing';
    derived.realismConstraints.push('upper eyelids must have authentic natural heaviness and slight downward droop from fatigue, strictly NO wide-eyed alert artificial gaze');
  } else if (state.muscleFatigue === 'bloodshot-sclera') {
    derived.muscleFatigueEffects = 'Bloodshot ocular sclera: realistic vascular dilation across the eye whites with delicate branching red micro-capillaries winding across the sclera from eye strain and prolonged wakefulness, authentic non-uniform corneal tear film reflecting physical tiredness.';
    derived.skinResponse += ', authentic ocular strain featuring fine branching blood vessels in eye sclera, realistic capillary engorgement in eye whites, subtle redness in the caruncle and lid margins';
    derived.realismConstraints.push('sclera of both eyes must display delicate realistic red blood vessels and faint strain, strictly NO sterile pure-white synthetic doll sclera');
  } else if (state.muscleFatigue === 'pale-fatigued-skin') {
    derived.muscleFatigueEffects = 'Fatigued pale skin & periorbital hollows: noticeable epidermal exhaustion pallor with decreased superficial capillary flush, subtle sallow undertone, authentic dark circles and mild tear-trough hollow shadows beneath the eyes, and slight loss of facial skin elasticity.';
    derived.skinResponse += ', drained skin complexion showing mild fatigue pallor, realistic subtle dark under-eye circles (infraorbital darkness), slightly uneven and dull epidermal micro-texture without artificial cheek blush';
    derived.realismConstraints.push('skin tone must display authentic fatigue-induced pallor and periorbital hollow shadows, strictly NO glowing porcelain cheeks or airbrushed under-eye circles');
  } else if (state.muscleFatigue === 'full-exhaustion') {
    derived.muscleFatigueEffects = 'Full muscle & facial exhaustion: combination of heavy drooping upper eyelids, prominent periorbital fatigue shadows beneath lower lids, delicate bloodshot branching micro-vessels in the ocular sclera, and a sallow, depleted facial skin complexion.';
    derived.skinResponse += ', complete facial exhaustion response: heavy drooping eyelids, subtle periorbital dark circles, delicate bloodshot capillaries in the sclera, and drained fatigued skin tone lacking superficial blush';
    derived.realismConstraints.push('subject must manifest authentic physical exhaustion: drooping eyelids, bloodshot sclera, and sallow drained skin texture');
  }

  if (state.foregroundObstruction === 'through-glass') {
    derived.visibleBackgroundElements.unshift('faint dirty window glass reflection in extreme foreground overlaying the image', 'environmental glare on the glass surface masking details');
    derived.realismConstraints.push('subject is seen THROUGH a pane of glass');
  } else if (state.foregroundObstruction === 'foreground-clutter') {
    derived.visibleBackgroundElements.unshift('a heavily out-of-focus random everyday object (e.g. edge of a cup, partial shoulder of a bystander, computer monitor edge) intruding in the extreme foreground edge, adding deep candid framing depth');
  }

  if (state.realismStyle === 'anti-ai-raw') {
    derived.skinResponse = `Untouched real human skin chemistry: microscopically visible vellus hair (peach fuzz) on jaw/cheeks illuminated by ambient light, uneven natural melanin distribution, subtle subsurface scattering on ears and nose, natural micro-blemishes, clearly visible natural pores. Asymmetrical environmental catchlights in both eyes (not perfectly matching), faint realistic blood vessels in sclera. ` + derived.skinResponse;
    derived.fabricBehavior.push('subtle fabric pilling', 'occasional stray microscopic threads', 'realistic color radiosity (bounce light) from clothing onto the lower jaw and neck');
    derived.lensEffects += ', subtle digital noise matching ISO 800, microscopic sensor grain, mild edge chromatic aberration (color fringing), microscopic motion blur on extremities (handshake)';
    derived.environmentalLightBehavior += ', non-ideal natural light bounce, mixed color temperatures from practical sources';
  }

  return derived;
};
