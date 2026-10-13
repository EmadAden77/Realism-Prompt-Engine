import type { SceneState, TimeOfDay } from './physicsEngine';
import { BEDROOM_INTERACTIVE_SELFIES, type BedroomSelfieActivity, type BedroomSelfieZone } from './bedroomSelfieAffordances';

export type BedroomBedding = 'everyday' | 'fresh' | 'slept-in' | 'loosely-unmade';
export type BedroomComposition = 'natural' | 'face-close' | 'bed-context' | 'room-depth';

export const BEDROOM_BEDDING_OPTIONS: readonly { id: BedroomBedding; labelAR: string; detailAR: string }[] = [
  { id: 'everyday', labelAR: 'طبيعي يومي', detailAR: 'ثنيات واقعية من استعمال الغرفة' },
  { id: 'fresh', labelAR: 'مرتب دون مثالية', detailAR: 'مفرش شبه مرتب وثنيات خفيفة' },
  { id: 'slept-in', labelAR: 'بعد النوم', detailAR: 'موضع رأس على الوسادة وغطاء منزاح' },
  { id: 'loosely-unmade', labelAR: 'غير مرتب قليلًا', detailAR: 'وسائد وغطاء غير متناظرين' }
];

export const BEDROOM_COMPOSITION_OPTIONS: readonly { id: BedroomComposition; labelAR: string; detailAR: string }[] = [
  { id: 'natural', labelAR: 'تلقائي واقعي', detailAR: 'حسب موضع الهاتف والوضعية' },
  { id: 'face-close', labelAR: 'الوجه أولًا', detailAR: 'خلفية جزئية بدون عدسة وهمية' },
  { id: 'bed-context', labelAR: 'السرير خلفي', detailAR: 'جزء من المرتبة والوسائد إن سمح الإطار' },
  { id: 'room-depth', labelAR: 'عمق الغرفة', detailAR: 'يظهر الممر أو الدولاب إذا أمكن بصريًا' }
];

export interface BedroomPreset {
  id: string;
  labelAR: string;
  detailAR: string;
  actionId: string;
  timeOfDay: TimeOfDay;
  lightingMode: string;
  bedding: BedroomBedding;
  composition: BedroomComposition;
}

/** Each preset sets a real action with one phone and one acting hand, not an invented photoshoot. */
export const BEDROOM_REALISM_PRESETS: readonly BedroomPreset[] = [
  { id: 'after-waking', labelAR: 'بعد الاستيقاظ', detailAR: 'سيلفي بسيط ووسادة مضغوطة', actionId: 'bed-waking', timeOfDay: 'morning', lightingMode: 'ضوء نهاري طبيعي', bedding: 'slept-in', composition: 'face-close' },
  { id: 'evening-bed', labelAR: 'استراحة على السرير', detailAR: 'جلسة مريحة وإضاءة سقف عادية', actionId: 'bed-seated-duvet', timeOfDay: 'night', lightingMode: 'إضاءة سقف دافئة 3000K', bedding: 'loosely-unmade', composition: 'bed-context' },
  { id: 'late-night', labelAR: 'قبل النوم', detailAR: 'اتكاء هادئ وضوء جانبي منخفض', actionId: 'bed-reclined', timeOfDay: 'night', lightingMode: 'إضاءة أباجورة دافئة', bedding: 'slept-in', composition: 'face-close' },
  { id: 'bed-edge', labelAR: 'عند حافة السرير', detailAR: 'جلوس طبيعي مع انضغاط المرتبة', actionId: 'bed-edge-sleeve', timeOfDay: 'night', lightingMode: 'إضاءة سقف محايدة 4000K', bedding: 'everyday', composition: 'bed-context' },
  { id: 'working', labelAR: 'عمل مسائي', detailAR: 'مكتب ولابتوب بلا إضاءة سينمائية', actionId: 'desk-trackpad', timeOfDay: 'night', lightingMode: 'إضاءة سقف أبيض 5000K', bedding: 'everyday', composition: 'room-depth' },
  { id: 'getting-ready', labelAR: 'تجهيز الملابس', detailAR: 'حركة بسيطة أمام الدولاب', actionId: 'wardrobe-shirt', timeOfDay: 'afternoon', lightingMode: 'ضوء نهاري طبيعي', bedding: 'fresh', composition: 'room-depth' },
  { id: 'mirror-check', labelAR: 'قبل الخروج', detailAR: 'انعكاس مرآة صحيح بهاتف واحد', actionId: 'mirror-collar', timeOfDay: 'afternoon', lightingMode: 'إضاءة سقف محايدة 4000K', bedding: 'fresh', composition: 'room-depth' },
  { id: 'curtain-light', labelAR: 'عند الستائر', detailAR: 'ضوء نافذة حقيقي من جانب الوجه', actionId: 'window-curtain', timeOfDay: 'morning', lightingMode: 'ضوء نهاري طبيعي', bedding: 'everyday', composition: 'natural' },
];

export function bedroomActionForPreset(id: string): BedroomSelfieActivity | undefined {
  const p = BEDROOM_REALISM_PRESETS.find(v => v.id === id);
  return BEDROOM_INTERACTIVE_SELFIES.find(a => a.id === p?.actionId);
}

export function getBedroomRecommendedActivities(zone: BedroomSelfieZone, time: TimeOfDay, selectedId?: string): BedroomSelfieActivity[] {
  const actions = BEDROOM_INTERACTIVE_SELFIES.filter(a => a.zone === zone);
  return [...actions].sort((a, b) => score(a, time, selectedId) - score(b, time, selectedId));
}

function score(a: BedroomSelfieActivity, time: TimeOfDay, selectedId?: string): number {
  let n = a.id === selectedId ? -20 : 0;
  if ((time === 'night' || time === 'sunset') && /waking|window-curtain|window-laptop/.test(a.id)) n += 5;
  if (time !== 'night' && /bed-reclined|bed-lying|bed-waking/.test(a.id)) n += 2;
  if (a.captureType === 'mirror-selfie') n += 1;
  return n;
}

/**
 * Architectural staging specification. Dimensions are design targets, NOT measurements of
 * the reference photo or proofs that furniture and windows are actually visible.
 */
export function buildBedroomRealismPrompt(state: Pick<SceneState,
  'sceneFamily' | 'subScene' | 'timeOfDay' | 'captureType' | 'pose' | 'lightingMode'
  | 'environmentRealism' | 'bedroomBedding' | 'bedroomComposition' | 'bedroomSelfieActionId'
>): string {
  if (state.sceneFamily !== 'bedroom') return '';
  const bedding: BedroomBedding = state.bedroomBedding ?? 'everyday';
  const composition: BedroomComposition = state.bedroomComposition ?? 'natural';
  const bedIsLoaded = /سرير|مرتبة|مستلقي|مستلق|reclin|bed|mattress/i.test(
    [state.subScene, state.pose].join(' ')
  ) || !!state.bedroomSelfieActionId && /^(bed-|bedside-)/.test(state.bedroomSelfieActionId);
  const beddingPhysics: Record<BedroomBedding, string> = {
    everyday: 'ordinary uneven fabric folds, one naturally displaced pillow and restrained daily-use creases; no theatrical mess',
    fresh: 'mostly smoothed cotton duvet with subtle irregular hand-made tucks, naturally puffed pillows, and slight residual wrinkles, never showroom-perfect',
    'slept-in': 'a shallow head-shaped pillow depression where used, unaligned pillow edges, a folded-back duvet and realistic fabric bunching only where people have been',
    'loosely-unmade': 'an uneven duvet partly pulled aside, one offset pillow and soft crumpling; floor stays mostly clear, no trash or random props'
  };
  const compositionRules: Record<BedroomComposition, string> = {
    natural: 'Allow whatever room details the actual camera pose and physical field of view would reveal. Do not widen the view or move walls.',
    'face-close': 'Prioritize unwarped facial identity and handheld framing. Crop bed and furniture naturally; do not forcibly show all furniture.',
    'bed-context': 'Include plausible partial bed edge, headboard or pillow behind or beneath the person only where phone direction and actual line of sight allow.',
    'room-depth': 'Suggest spatial depth toward wardrobe or bedroom door if the actual line of sight supports it; no impossible full 360-degree room inventory.'
  };
  const light = state.lightingMode;
  const isNight = state.timeOfDay === 'night';
  const phoneOnly = /شاشة الهاتف.*فقط|فلاش الشاشة الأمامية فقط/.test(light);
  const windowSource = /نهاري|نافذة|شمس/.test(light);
  const lampSource = /أباجورة|جانبية/.test(light);
  const ceilingSource = /سقف/.test(light);
  const lightGuard = phoneOnly
    ? 'ONLY the actual phone display is an intended luminous emitter. Keep ceiling spots and bedside lamp off, no invented fill/rim lighting; deep natural falloff and sensor noise are acceptable.'
    : windowSource
      ? isNight
        ? 'Do not generate daytime window rays at night. The requested window source is incompatible; resolve to a real switched-on practical room light.'
        : 'Daylight enters from the actual window opening only; blackout drapes attenuate it when drawn, never allow bright sun to shine through opaque curtains.'
      : lampSource
        ? 'A real bedside lamp placed next to the bed is the principal warm lateral practical; ceiling recessed spots are off unless specifically included in the selected light mode. Preserve directional falloff.'
        : ceilingSource
          ? 'Selected ceiling spotlights provide actual downward illumination; preserve nonuniform spread and shadowing underneath brow, jaw, duvet and nearby furniture. Do not invent a separate spotlight or halo.'
          : 'Use only actual selected room fixtures with believable falloff; no cinematic key/rim light or phantom window.';
  const timeGuard = isNight
    ? 'Outside the windows is dark; curtains cannot produce daylight. Night-time color and exposure come from selected practical fixtures only.'
    : 'Respect time-of-day daylight availability; bright exterior reflections occur only if a real window is in view.';
  const use = (state.environmentRealism || '').includes('مستخدمة')
    ? 'The room has subtle everyday use: uneven bedcover, one practical charging cable if a bedside device is selected, natural incidental wear, no random mess.'
    : 'No unnecessary clutter or showroom staging; room looks inhabited but not digitally perfected.';
  return [
    'COHERENT BEDROOM ARCHITECTURE (staging geometry, not reference-image measurements):',
    'One believable Saudi residential bedroom as a single continuous volume, nominally about 5.2m x 6.2m with 2.9m ceiling. Do not change room size or mirror the door and window positions between camera angles.',
    'Queen bed approximately 160cm x 200cm against ONE headboard wall; ordinary mattress thickness ~25-28cm, mattress upper surface about 50-58cm above floor. Upholstered/dark-wood headboard ~172-180cm wide; no gigantic floating headboard.',
    'Matte cream or neutral walls, dark-wood furniture, practical side-table beside headboard, realistic tile/rug transitions, one wardrobe, one sensible door opening, one curtained window where the chosen micro-location exposes it; recessed ceiling spots laid out as two rows of three.',
    'Allow ~75-95cm intended passage where the curtains/bed route is actually visible, not fictitious extra floor area. Keep door swing, walkway, wardrobe opening and furniture footprints non-overlapping. No duplicated windows, nightstands or beds caused by wide-angle selfie distortion.',
    'BEDDING: ' + beddingPhysics[bedding] + '. ' +
      (bedIsLoaded ? 'The mattress visibly compresses under hips/torso when supported; head indents a pillow only when actually resting on it, duvet is displaced by real contact and gravity.' : 'No unexplained deep mattress impressions without a body or prior contact.'),
    'COMPOSITION: ' + compositionRules[composition],
    'LIGHT ORIGIN: ' + lightGuard + ' ' + timeGuard,
    'MATERIAL PHYSICS: restrained fabric pile, cotton creases, pillow seams, subtle imperfect wall paint, natural shadow contact beneath furniture, sensible low-light noise and compression applied to face AND room equally.',
    'SELFIE TRUTH: ' + (state.captureType === 'mirror-selfie'
      ? 'Exactly one planar mirror, a single visible recording phone and one coherent reflection. No cloned face, second reflected phone or impossible mirror sightline.'
      : state.captureType === 'front-selfie'
        ? 'Camera physically held in one hand at reachable phone-to-face distance. No floating camera, no visible recording phone, no second capturing hand.'
        : 'Bystander camera perspective; both hands can naturally engage objects without pretending this is a selfie.'),
    use,
    'Do not invent signs, brand logos, decor collections, studio light rigs, unreal perfect bedding, luxury-hotel room scale or a second person without explicit user choice.'
  ].join(' ');
}
