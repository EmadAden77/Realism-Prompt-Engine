import { resolveBedroomSelfieActivity } from './bedroomSelfieAffordances';
import { getMicroLocation } from '../data/microLocations';
import { OUTFITS } from '../data/clothingOutfits';
import {
  ADVANCED_FACIAL_EXPRESSIONS,
  type FacialExpressionDefinition,
} from '../data/facialExpressionLibrary';
import { getHairPhysicsPreset } from '../data/hairPhysicsLibrary';
import {
  compileHomeBackgroundPeoplePrompt,
  isHomeBackgroundScene,
  resolveHomeBackgroundPeople,
  type HomeBackgroundClothing,
  type HomeBackgroundPeopleMode,
} from './homeBackgroundPeople';
import { HOME_SECTION_LABEL_AR } from './homeYard';
import type { DerivedPhysicalState, SceneState } from './physicsEngine';

export type SemanticSceneState = Omit<SceneState, 'realismStyle'> & {
  // UI migration still exposes legacy display styles. The semantic compiler
  // only interprets this as descriptive wording and must not narrow UI state.
  realismStyle: string;
};
import type { SemanticPromptScene } from './promptCompiler';
import type { DerivedSceneState } from './realismDeriver';
export type { DerivedSceneState } from './realismDeriver';
import {
  describeAttireControls,
  getAttireAwareBasePhysics,
  getAttireAwareOutfitPrompt,
  getActivityDefinition,
} from './activityAttire';

const SCENE_FAMILY_LABELS: Record<string, string> = {
  'military-base': 'مبنى عمل عسكري',
  'saudi-outdoor': 'أماكن سعودية',
  car: 'السيارة',
  'living-room': HOME_SECTION_LABEL_AR,
  bedroom: 'غرفة نوم',
  gym: 'نادي رياضي',
};

export const BASE_IDENTITY_LOCK = `Preserve exact facial identity from the reference image. 193cm height, 83kg weight, tall lean-athletic male build. DO NOT alter facial proportions, head geometry, hairline, or natural hair density. DO NOT artificially beautify, de-age, or smooth skin. Preserve natural facial asymmetry and existing beard/moustache growth pattern.`;

export const HAIRSTYLES = [
  { id: 'h1', labelAR: 'طبيعي', prompt: 'natural everyday hair', physics: 'maintains original natural density and texture' },
  { id: 'h2', labelAR: 'مرتب للخلف', prompt: 'neatly styled back hair', physics: 'styled but retaining natural hairline and volume' },
  { id: 'h3', labelAR: 'جانبي مرتب', prompt: 'neatly parted to the side hair', physics: 'clean part, natural resting volume' },
  { id: 'h4', labelAR: 'فوضوي خفيف', prompt: 'slightly messy casual hair', physics: 'natural unstyled resting state' },
  { id: 'h5', labelAR: 'بعد التمرين (مبلل قليلًا)', prompt: 'slightly sweat-dampened post-workout hair', physics: 'clumping slightly from mild moisture, retaining natural base density' },
  { id: 'h6', labelAR: 'عسكري (قصير جداً ومحدد)', prompt: 'very short neat military regulation haircut', physics: 'tight fade on sides, minimal volume on top, sharp natural hairline' }
];

const BASE_EXPRESSIONS: FacialExpressionDefinition[] = [
  {
    id: 'e1',
    labelAR: 'محايد استرخائي (Resting Neutral)',
    categoryAR: 'هدوء واسترخاء',
    prompt: 'completely neutral relaxed resting facial expression',
    anatomy: 'orbicularis oris relaxed, jaw unclasped with tongue resting naturally at palate, smooth unfurrowed forehead, eyelids resting at upper pupil border, masseter muscle loose'
  },
  {
    id: 'e2',
    labelAR: 'هادئ مستكين ومطمئن (Calm & Serene)',
    categoryAR: 'هدوء واسترخاء',
    prompt: 'calm, serene and contemplative expression',
    anatomy: 'frontalis muscle fully relaxed, soft eye focal convergence with natural corneal moisture, slight softening of philtrum and lip vermilion without muscular tension'
  },
  {
    id: 'e3',
    labelAR: 'ابتسامة طفيفة مغلقة (Duchenne Micro-Smile)',
    categoryAR: 'ابتسامات وود',
    prompt: 'subtle closed-mouth genuine micro-smile',
    anatomy: 'bilateral zygomaticus major engagement elevating mouth corners subtly, gentle crinkling at orbicularis oculi pars lateralis outer corners (crow feet micro-furrows), completely relaxed jaw'
  },
  {
    id: 'e4',
    labelAR: 'ابتسامة عفوية نصف مفتوحة (Candid Half-Smile)',
    categoryAR: 'ابتسامات وود',
    prompt: 'spontaneous candid natural half-smile showing partial upper teeth',
    anatomy: 'levator labii superioris gently elevating upper lip, natural glimpse of upper dental edge, authentic asymmetric nasolabial creases with organic facial tension'
  },
  {
    id: 'e5',
    labelAR: 'مركز ومنتبه ذهنياً (Deep Cognitive Focus)',
    categoryAR: 'تركيز وحزم',
    prompt: 'intensely focused and cognitively engaged expression',
    anatomy: 'slight corrugator supercilii contraction creating faint vertical glabella tension lines, pupils locked on subject with lower eyelids subtly drawn upward (AU7 lid tightener)'
  },
  {
    id: 'e6',
    labelAR: 'حازم ورسمي وقور (Commanding Gravitas)',
    categoryAR: 'تركيز وحزم',
    prompt: 'firm, serious, dignified professional expression',
    anatomy: 'subtly engaged masseter defining clean mandibular angle, horizontal level brows, direct unwavering gaze, firm lip seal without strain or pursing'
  },
  {
    id: 'e7',
    labelAR: 'تحديق خفيف ضد الشمس/الضوء (Sun Squint)',
    categoryAR: 'تعب وإجهاد',
    prompt: 'subtle natural squint reacting to daylight glare',
    anatomy: 'orbicularis oculi contraction narrowing eye apertures (AU6 + AU7), realistic micro-creasing radiating from temples, natural squint response to daylight'
  },
  {
    id: 'e8',
    labelAR: 'مجهد بعد يوم طويل/مناوبة (Post-Shift Fatigue)',
    categoryAR: 'تعب وإجهاد',
    prompt: 'weary fatigued expression after a long work shift',
    anatomy: 'mild ptosis-like heavy upper eyelids covering top 25% of iris, faint fatigue shadows in infraorbital hollows, relaxed mouth corners with slight downward gravity tilt'
  },
  {
    id: 'e9',
    labelAR: 'متأمل وسارح في الأفق (Distant Pensive Gaze)',
    categoryAR: 'هدوء واسترخاء',
    prompt: 'pensive unposed expression staring thoughtfully into the distance',
    anatomy: 'soft infinity focal convergence, relaxed mentalis muscle, lips parted by half a millimeter, natural unselfconscious facial plane balance'
  },
  {
    id: 'e10',
    labelAR: 'متفحص أو متشكك طفيف (Skeptical Brow Lift)',
    categoryAR: 'تفاعلات عفوية',
    prompt: 'subtly skeptical or curious expression with one brow slightly cocked',
    anatomy: 'unilateral frontalis contraction elevating the left eyebrow (AU2), slight asymmetric tilt of head, subtle amused unilateral risorius tension'
  },
  {
    id: 'e11',
    labelAR: 'متحفز بعد التمرين والتقاط الأنفاس (Post-Workout Breathing)',
    categoryAR: 'تعب وإجهاد',
    prompt: 'alert energized post-workout expression catching breath',
    anatomy: 'slightly parted lips with visible breathing intake, subtle dilation of alar base (nostril flaring AU38), heightened vascular flush and ocular radiance'
  },
  {
    id: 'e12',
    labelAR: 'ابتسامة ودودة خفية على زاوية الفم (Subtle Friendly Smirk)',
    categoryAR: 'ابتسامات وود',
    prompt: 'subtle suppressed amused smirk on one side of mouth',
    anatomy: 'unilateral risorius pulling right mouth corner sideways, spark in eyes, slight asymmetric cheek rise breaking artificial AI symmetry'
  },
  {
    id: 'e13',
    labelAR: 'دهشة خفيفة أو فضول فجائي (Inquisitive Surprise)',
    categoryAR: 'تفاعلات عفوية',
    prompt: 'mild spontaneous inquisitive surprise',
    anatomy: 'medial frontalis bellies gently contracted raising eyebrow arches (AU1+AU2), widened palpebral fissure exposing clear upper sclera, parted lips with relaxed jaw drop'
  },
  {
    id: 'e14',
    labelAR: 'ابتسامة عريضة ضاحكة بأسنان ظاهرة (Full Genuine Laugh)',
    categoryAR: 'ابتسامات وود',
    prompt: 'genuine burst of candid laughter showing full smile',
    anatomy: 'strong bilateral zygomaticus major and levator labii contraction, anterior teeth and gums naturally visible, cheeks bunched high causing deep infraorbital crescents'
  },
  {
    id: 'e15',
    labelAR: 'تحديق استطلاعي وحواجب مقطبة بجدية (Intense Analytical Brow Furrow)',
    categoryAR: 'تركيز وحزم',
    prompt: 'intense analytical scrutiny with deeply furled brow',
    anatomy: 'corrugator supercilii pulling brow heads together and down, procerus creating horizontal skin folds at nasal bridge root, narrowed piercing focal gaze'
  },
  {
    id: 'e16',
    labelAR: 'ابتسامة رضا وتنهيدة ارتياح (Contented Sigh of Relief)',
    categoryAR: 'هدوء واسترخاء',
    prompt: 'contented serene expression exhaling relief after a completed task',
    anatomy: 'subtle upturned labial commissures, released orbicularis oculi tension, softly lowered chin, smooth chin pad with complete absence of mentalis dimpling'
  },
  {
    id: 'e17',
    labelAR: 'نظرة استغراب أو عدم تصديق هادئة (Bemused Incredulity)',
    categoryAR: 'تفاعلات عفوية',
    prompt: 'bemused quiet incredulity reacting to something surprising',
    anatomy: 'asymmetric head cant, left eyebrow arched while right remains flat, slight lateral compression of lips (buccinator AU14), wry asymmetric nasolabial groove'
  },
  {
    id: 'e18',
    labelAR: 'إرهاق النعاس والتثاؤب المكبوت (Drowsy Heavy Eyelids)',
    categoryAR: 'تعب وإجهاد',
    prompt: 'heavy drowsy exhaustion suppressing a sleepy yawn',
    anatomy: 'levator palpebrae superioris fatigue causing heavy hooded lids, subtle moist meniscus along lower lid margin, slack jaw muscles, slight nostril flare'
  },
  {
    id: 'e19',
    labelAR: 'نظرة ترقب وتوجس حذر (Guarded Alertness & Vigilance)',
    categoryAR: 'تفاعلات عفوية',
    prompt: 'cautious alert expression tracking surroundings quietly',
    anatomy: 'widened palpebral aperture with visible white sclera ring, slight horizontal tightening of lips by risorius, lateral jaw tension, alert head positioning'
  },
  {
    id: 'e20',
    labelAR: 'ابتسامة فخر واعتزاز متواضعة (Quiet Dignified Pride)',
    categoryAR: 'ابتسامات وود',
    prompt: 'subtle dignified proud facial expression with composed posture',
    anatomy: 'head held erect with slightly elevated chin, lips sealed firmly with a subtle 1mm upward arc at corners, direct grounded gaze, calm bilateral cheek contour'
  },
  {
    id: 'e21',
    labelAR: 'انزعاج طفيف عابر أو امتعاض خفيف (Mild Discontent & Pebble Chin)',
    categoryAR: 'تفاعلات عفوية',
    prompt: 'fleeting mild irritation or slight discontent',
    anatomy: 'depressor anguli oris pulling mouth corners down (AU15), mentalis contraction elevating lower lip and creating distinctive natural pebble-skin dimpling on chin'
  },
  {
    id: 'e22',
    labelAR: 'تركيز حركي مع عض خفيف للشفة (Subtle Lip Bite in Concentration)',
    categoryAR: 'تركيز وحزم',
    prompt: 'unconscious subtle bite of lower lip during deep concentration',
    anatomy: 'lower lip vermilion gently drawn between upper incisors, orbicularis oris asymmetry, narrowed pupils focused downward at task, smoothed forehead'
  },
  {
    id: 'e23',
    labelAR: 'نطق وتحدث عفوي أثناء حوار (Mid-Conversation Speech Articulation)',
    categoryAR: 'تفاعلات عفوية',
    prompt: 'candid capture frozen mid-conversation while speaking naturally',
    anatomy: 'mouth caught mid-syllable with lips dynamically parted, asymmetric jaw opening, active levator anguli oris, lively eye-tracking gaze towards conversational partner'
  },
  {
    id: 'e24',
    labelAR: 'هدوء وخشوع وسكينة (Spiritual Tranquility & Reverence)',
    categoryAR: 'هدوء واسترخاء',
    prompt: 'deep peaceful spiritual calm and serene inward contemplation',
    anatomy: 'gaze cast downward at a peaceful 30-degree angle, eyelids half-lowered softly, frontalis and corrugator muscles completely devoid of tension, relaxed jaw'
  },
  {
    id: 'e25',
    labelAR: 'نظرة استسلام مضحكة أو تعجب ودود (Playful Eye-Roll / Amused Resignation)',
    categoryAR: 'تفاعلات عفوية',
    prompt: 'humorous affectionate eye-roll and playful amused resignation',
    anatomy: 'superior rectus pulling pupils upward and slightly off-center, subtle suppressed smirk on lips, slight backward head tilt, relaxed crow feet'
  },
  {
    id: 'e26',
    labelAR: 'نظرة حزم عسكرية تكتيكية صارمة (Stoic Tactical Vigilance)',
    categoryAR: 'تركيز وحزم',
    prompt: 'stoic military intensity and unyielding tactical focus',
    anatomy: 'firm masseter contraction defining sharp jawline contour, level unyielding brow, unblinking ocular focus, perfectly straight horizontal lip seal'
  },
  {
    id: 'e27',
    labelAR: 'استنشاق هواء نقي باسترخاء (Deep Inhale of Fresh Air)',
    categoryAR: 'هدوء واسترخاء',
    prompt: 'blissful relaxed expression taking a deep fresh breath outdoors',
    anatomy: 'chin lifted toward the sky, eyelids gently closed or slit, expanded alar cartilages (nostril dilation), relaxed facial planes bathed in ambient air'
  },
  {
    id: 'e28',
    labelAR: 'نظرة عتاب ودودة وتسائل هادئ (Gentle Quizzical Inquisitiveness)',
    categoryAR: 'تفاعلات عفوية',
    prompt: 'gentle affectionate quizzical expression asking a silent question',
    anatomy: 'head cocked slightly to the side, inner brow corners elevated (AU1), soft questioning eye gaze, neutral relaxed lips with faint asymmetric curve'
  }
];

export const EXPRESSIONS: FacialExpressionDefinition[] = [
  ...BASE_EXPRESSIONS,
  ...ADVANCED_FACIAL_EXPRESSIONS,
];

const sanitizeExpressionIdentityClaims = (value: string): string =>
  value
    .replace(/facial skin microdetails with sebaceous filaments, mole, nasal and ear hair/gi, 'facial skin microdetails limited to reference-supported persistent traits')
    .replace(/visible pores with asymmetric 3mm cheek mole/gi, 'visible pores with reference-supported skin marks only')
    .replace(/visible 2mm nasal hair and natural ear hair/gi, 'reference-supported nasal and ear hair only')
    .replace(/left eyebrow 3mm higher than right/gi, 'temporary mild eyebrow asymmetry without changing baseline eyebrow geometry')
    .replace(/left eye 20% more squinted than right/gi, 'temporary mild asymmetric squint without changing baseline eye geometry')
    .replace(/right nostril flared more than left/gi, 'temporary asymmetric alar flare without changing baseline nostril geometry')
    .replace(/upper lip darker than lower lip/gi, 'reference-consistent natural lip pigmentation')
    .replace(/natural non-bleached teeth with one crooked lower incisor/gi, 'natural non-bleached teeth with reference-consistent alignment')
    .replace(/mole asymmetrical irregular border 3mm on cheek/gi, 'reference-supported skin mark only')
    .replace(/asymmetrical mole irregular border 3mm diameter cheek/gi, 'reference-supported skin mark only')
    .replace(/mole asymmetrical 3mm cheek/gi, 'reference-supported skin mark only')
    .replace(/nose hair 2mm visible nostril ear hair/gi, 'nasal and ear hair only if visibly supported by reference')
    .replace(/nose hair 2mm visible ear hair/gi, 'nasal and ear hair only if visibly supported by reference')
    .replace(/left eyebrow 3mm higher(?: than right eyebrow)?/gi, 'reference-consistent natural eyebrow asymmetry')
    .replace(/left eye 20% more squinted(?: than right eye)?/gi, 'temporary mild expression squint without altering reference eye geometry')
    .replace(/right nostril flared more(?: than left nostril)?/gi, 'temporary alar flare asymmetry without altering baseline nostril geometry')
    .replace(/upper lip darker pigmentation than lower/gi, 'reference-consistent lip pigmentation')
    .replace(/upper darker than lower/gi, 'reference-consistent lip pigmentation')
    .replace(/one crooked lower incisor/gi, 'reference-consistent tooth alignment')
    .replace(/asymmetrical teeth not white/gi, 'natural reference-consistent teeth')
    .replace(/\bsodium\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const resolveExpressionDetails = (
  expression: FacialExpressionDefinition,
  muscleFatigue: string,
  muscleFatigueEffects: string
): string => {
  const safePrompt = sanitizeExpressionIdentityClaims(expression.prompt);
  const safeAnatomy = sanitizeExpressionIdentityClaims(expression.anatomy);
  const identityGuard =
    safePrompt !== expression.prompt || safeAnatomy !== expression.anatomy
      ? ' Reference identity guard: persistent facial traits, skin marks, tooth alignment, baseline asymmetry, pigmentation, and grooming details must match the reference image exactly; never invent them from an expression preset.'
      : '';

  return `${safePrompt}. ${expression.detailLabel || 'Facial muscle anatomy'}: ${safeAnatomy}${identityGuard}${muscleFatigue !== 'none' ? `. Muscle fatigue & ocular state: ${muscleFatigueEffects}` : ''}`;
};

const resolveHairPhysicsPrompt = (
  prompt: string,
  lightingMode: string
): string => {
  if (!/شاشة الهاتف.*فقط|phone[- ]?screen.*only/i.test(lightingMode)) {
    return prompt;
  }

  const safePrompt = prompt
    .replace(/baby hairs sodium backlight orange rim translucent micro-shadows/gi, 'baby hairs with subtle micro-shadows caused only by the phone-screen light')
    .replace(/sodium backlight orange rim translucent micro-shadows/gi, 'fine-strand micro-shadows caused only by the phone-screen light')
    .replace(/hair backlit translucent tips orange rim/gi, 'fine hair strand tips')
    .replace(/translucent orange rim/gi, 'fine-strand edge translucency')
    .replace(/sodium backlight/gi, '')
    .replace(/orange rim/gi, '')
    .replace(/\bbacklit\b/gi, '')
    .replace(/translucent tips/gi, 'fine strand tips')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return `${safePrompt}. Phone-screen-only lighting guard: no sodium, rear, rim, or other secondary light may be invented.`;
};

/**
 * Platform-neutral semantic scene compiler.
 *
 * Converts canonical SceneState + derived physical state into semantic prompt
 * sections. React/UI code must not reimplement these decisions.
 */
export const buildSemanticScene = (
  state: SemanticSceneState,
  derived: DerivedSceneState,
  physicalState?: DerivedPhysicalState
): SemanticPromptScene => {
  const outfit = OUTFITS.find(o => o.id === state.outfitId);
  const attire = describeAttireControls(outfit, state);
  const attireBasePrompt = getAttireAwareOutfitPrompt(outfit, state);
  const attireBasePhysics = getAttireAwareBasePhysics(outfit, state);
  const activityDefinition = getActivityDefinition(state.activity);
  const interactiveSelfie = resolveBedroomSelfieActivity(state);
  const hair = HAIRSTYLES.find(h => h.id === state.hairStyle);
  const hairPhysics = getHairPhysicsPreset(state.hairPhysicsPreset);
  const expression = EXPRESSIONS.find(e => e.id === state.expression);

  let captureMechanics = '';
  if (state.captureType === 'front-selfie') {
    const opticsText = physicalState?.opticalPerspective || '21mm wide-angle mobile front-camera perspective';
    const distText = physicalState?.cameraDistance || derived.cameraDistance;
    const posText = physicalState?.cameraPosition || state.cameraAngle;
    const directionText = physicalState
      ? `${physicalState.cameraPitch}, ${physicalState.cameraYaw}, ${physicalState.cameraRoll}`
      : state.cameraAngle;
    const smartAngleText = physicalState?.selfieAngle
      ? ` Selected selfie geometry: ${physicalState.selfieAngle.presetLabelAR} (${physicalState.selfieAngle.source}), ${physicalState.selfieAngle.cameraDirection}.`
      : '';
    captureMechanics = `Smartphone front-camera capture. Camera profile: ${opticsText}. Framing: ${state.framing} (distance: ${distText}). Position: ${posText}. Direction: ${directionText}.${smartAngleText} Handheld mechanics: ${physicalState?.armReach || derived.contactPhysics.find(p => p.includes('arm')) || 'dominant arm holding smartphone off-camera'}. Capturing phone is NOT visible in frame.`;
  } else if (state.captureType === 'mirror-selfie') {
    captureMechanics = `Smartphone mirror selfie. Framing: ${state.framing}. Distance: ${physicalState?.cameraDistance || 'approx 85cm'}. ${physicalState?.opticalPerspective || ''} ${derived.reflectionRules.join('. ')}`;
  } else {
    captureMechanics = `Third-person candid photograph. Framing: ${state.framing}. Angle: ${state.cameraAngle}. Distance: ${physicalState?.cameraDistance || 'approx 2.4m'}. Hands free without selfie arm posture.`;
  }

  let cameraRealism = `Style: ${state.realismStyle.replace('-', ' ')}. ${derived.lensEffects}. Avoid CGI glossy look.`;
  if (state.realismStyle === 'anti-ai-raw') {
     cameraRealism = `Style: Absolute raw hyper-realism. Unedited, unfiltered mobile capture. ${derived.lensEffects}. Designed to mimic raw physical photography perfectly.`;
  }

  const cleanIdentityText = (text: string): string => {
    return text
      .replace(/Dark rectangular eyeglasses visible in reference MUST be worn\.\s*/gi, '')
      .replace(/Dark rectangular eyeglasses visible in reference MUST be worn/gi, '')
      .replace(/Dark rectangular eyeglasses MUST be worn\.\s*/gi, '')
      .replace(/eyeglasses visible in reference MUST be worn\.\s*/gi, '')
      .replace(/Must wear dark rectangular eyeglasses\.\s*/gi, '')
      .trim();
  };

  const rawIdentity = state.customIdentityPrompt?.trim() || BASE_IDENTITY_LOCK;
  const identityText = cleanIdentityText(rawIdentity);

  let glassesText = '';
  if (state.glassesMode === 'wear_glasses') {
    glassesText = 'wearing black rectangular full-rim eyeglasses';
  } else if (state.glassesMode === 'no_glasses') {
    glassesText = 'not wearing glasses';
  } else {
    // match_reference: do not force glasses unless the reference indicates them
    glassesText = 'eyewear naturally follows reference image (preserve glasses if worn in reference, do not add if absent)';
  }

  const expressionDetails = expression
    ? resolveExpressionDetails(expression, state.muscleFatigue, derived.muscleFatigueEffects)
    : (state.muscleFatigue !== 'none' ? `Neutral resting expression with muscle fatigue: ${derived.muscleFatigueEffects}` : 'neutral resting expression');

  const hairPhysicsPrompt = resolveHairPhysicsPrompt(hairPhysics.prompt, state.lightingMode);

  const microLoc = getMicroLocation(state.sceneFamily, state.subScene);
  const locationLabel = state.sceneFamily ? SCENE_FAMILY_LABELS[state.sceneFamily] || '' : '';
  const groupSelfieText = physicalState?.groupSelfie?.enabled
    ? physicalState.groupSelfie.prompt
    : '';

  let visibleEnvironmentText = '';
  if (physicalState?.visibleEnvironment) {
    visibleEnvironmentText = `Location: ${locationLabel ? `${locationLabel} - ` : ''}${state.subScene || ''}. Physically visible scene: ${physicalState.visibleEnvironment}.`;
    if (physicalState.foregroundElements && physicalState.foregroundElements.length > 0) {
      visibleEnvironmentText += ` Foreground framing: ${physicalState.foregroundElements.join('; ')}.`;
    }
    if (physicalState.visibleVehicles && physicalState.visibleVehicles.length > 0) {
      visibleEnvironmentText += ` Background vehicles: ${physicalState.visibleVehicles.join('; ')}.`;
    }
    if (physicalState.visiblePeople && physicalState.visiblePeople.length > 0) {
      visibleEnvironmentText += ` Secondary background people: ${physicalState.visiblePeople.join('; ')}.`;
    }
    if (physicalState.motionBehavior && physicalState.motionBehavior !== 'static resting scene, zero abrupt motion blur') {
      visibleEnvironmentText += ` Ambient motion: ${physicalState.motionBehavior}.`;
    }
  } else {
    const microDetails = microLoc
      ? `${microLoc.environmentPrompt}. Spatial mechanics: ${microLoc.spatialBehavior}.`
      : `Ordinary realistic setting in Saudi Arabia.`;
    visibleEnvironmentText = `Location: ${locationLabel ? `${locationLabel} - ` : ''}${state.subScene || ''}. Environmental setting: ${microDetails} Visible background elements: ${derived.visibleBackgroundElements.join(', ')}.`;
  }
  if (physicalState?.backgroundRealism) {
    visibleEnvironmentText += ` Background control: humans=${physicalState.backgroundRealism.humanDensity}, vehicles=${physicalState.backgroundRealism.vehicleDensity}, disorder=${physicalState.backgroundRealism.disorderLevel}. User controls remain subject to physical FOV limits.`;
  }

  if (isHomeBackgroundScene(state.sceneFamily)) {
    const homeProfiles = resolveHomeBackgroundPeople(
      state.homeBackgroundPeopleMode as HomeBackgroundPeopleMode | undefined,
      state.homeBackgroundCount,
      state.homeBackgroundClothing as HomeBackgroundClothing[] | undefined
    );
    const homePeoplePrompt = compileHomeBackgroundPeoplePrompt(homeProfiles);
    if (homePeoplePrompt) {
      visibleEnvironmentText += ` ${homePeoplePrompt}`;
    } else if (state.homeBackgroundPeopleMode === 'none') {
      visibleEnvironmentText += ' USER-SELECTED HOME BACKGROUND PEOPLE: none. Do not add background people.';
    }
  }

  visibleEnvironmentText += ` Authentic everyday Saudi life, strictly NO iconic landmarks or tourist stereotypes.`;

  const styleConstraintsList = [...derived.realismConstraints];
  if (physicalState?.disorderBehavior) {
    styleConstraintsList.push(`Lived-in physical reality: ${physicalState.disorderBehavior}`);
  }

  return {
    identity: identityText,
    body: '193cm, 83kg, tall lean-athletic male build.',
    glasses: glassesText,
    captureMechanics,
    hair: `${hair?.prompt}. Base hair physics: ${hair?.physics}. Scene hair condition: ${derived.hairCondition}. Hair physics preset: ${hairPhysicsPrompt}.`,
    expression: expressionDetails,
    outfit: `${attireBasePrompt}. Wear configuration: ${attire.prompt}`,
    outfitPhysics: [...attireBasePhysics, ...derived.fabricBehavior, ...attire.physics].join(', '),
    poseAndContact: `Pose: ${state.pose}. Activity: ${activityDefinition.prompt}. Activity mechanics: ${activityDefinition.mechanics}. Gaze behavior: ${activityDefinition.gaze}. Contact rules: ${derived.contactPhysics.filter(p => !p.includes('arm')).join('. ')}. ${interactiveSelfie.prompt}`,
    visibleEnvironment: visibleEnvironmentText,
    lighting: `Time: ${state.timeOfDay}. Lighting source: ${state.lightingMode}. Lighting Intensity: ${state.lightingIntensity}% (${derived.lightingIntensityDescription}). Ambient bounce: ${derived.environmentalLightBehavior}. Shadow Depth: ${state.shadowDepth}% (${derived.shadowDepthDescription}). Shadows: ${derived.shadowBehavior}.`,
    atmosphere: derived.atmosphericEffects,
    skinResponse: derived.skinResponse,
    cameraRealism: cameraRealism,
    styleConstraints: styleConstraintsList.join('. '),
    groupSelfie: groupSelfieText
  };
};
