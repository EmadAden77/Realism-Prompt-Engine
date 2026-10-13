import type { SceneState } from './physicsEngine';

export type BedroomSelfieZone = 'desk' | 'chair' | 'window' | 'floor' | 'wardrobe' | 'mirror' | 'bedside' | 'bed';
export type BedroomSelfieCapture = 'front-selfie' | 'mirror-selfie';

export interface BedroomSelfieActivity {
  id: string;
  zone: BedroomSelfieZone;
  subScene: string;
  labelAR: string;
  poseAR: string;
  prop: string;
  contact: string;
  gaze: string;
  camera: string;
  lighting: string;
  captureType: BedroomSelfieCapture;
}

export const BEDROOM_SELFIE_ZONE_LABELS: Record<BedroomSelfieZone, string> = {
  desk: 'المكتب', chair: 'الكرسي', window: 'النافذة', floor: 'الأرض',
  wardrobe: 'الدولاب', mirror: 'المرآة', bedside: 'الطاولة الجانبية', bed: 'السرير'
};

/** User-selected scene arrangement, not proof an object was observed in a photo. */
export const BEDROOM_INTERACTIVE_SELFIES: readonly BedroomSelfieActivity[] = [
  {
    "id": "desk-trackpad",
    "zone": "desk",
    "subScene": "قرب الجدار المقابل للسرير",
    "labelAR": "يعمل على اللابتوب عند المكتب",
    "poseAR": "جالس على كرسي المكتب",
    "prop": "a compact bedroom work desk, sturdy chair and open laptop",
    "contact": "seated with weight supported by the chair; free hand on laptop trackpad; other arm holds the capture phone",
    "gaze": "brief natural glance between laptop display and phone lens; modest independent neck movement",
    "camera": "phone at comfortable arm distance, screen and face both plausibly visible; avoid close wide-angle chin distortion",
    "lighting": "screen glow is secondary only if visibly bright; use existing ambient light as the main face illumination",
    "captureType": "front-selfie"
  },
  {
    "id": "desk-notebook",
    "zone": "desk",
    "subScene": "قرب الجدار المقابل للسرير",
    "labelAR": "يدوّن ملاحظة بجانب اللابتوب",
    "poseAR": "جالس أمام المكتب",
    "prop": "bedroom writing desk, open laptop, small notebook and pen",
    "contact": "free hand writes a short note with pen on supported notebook; capture hand remains occupied",
    "gaze": "eyes can glance up briefly toward phone instead of simultaneously reading the page",
    "camera": "slightly raised handheld camera only if arm reach allows notebook and face in shot",
    "lighting": "task light must be sourced from existing desk lamp or room fixture; do not invent color temperature",
    "captureType": "front-selfie"
  },
  {
    "id": "desk-coffee",
    "zone": "desk",
    "subScene": "قرب الجدار المقابل للسرير",
    "labelAR": "استراحة قهوة أثناء العمل على اللابتوب",
    "poseAR": "جالس على كرسي المكتب",
    "prop": "compact desk with open laptop and stable coffee mug",
    "contact": "one hand holds selfie phone, free hand raises coffee mug safely above the work surface",
    "gaze": "casual glance to lens with relaxed shoulders and natural lip shape",
    "camera": "handheld chest-up perspective with laptop remaining on desk; no second phone",
    "lighting": "coffee mug and laptop receive realistic shadows from available bedroom lighting",
    "captureType": "front-selfie"
  },
  {
    "id": "desk-screen",
    "zone": "desk",
    "subScene": "قرب الجدار المقابل للسرير",
    "labelAR": "يعدل شاشة اللابتوب عند المكتب",
    "poseAR": "جالس أمام المكتب",
    "prop": "open laptop on a solid desk",
    "contact": "free hand gently tilts laptop lid by its upper edge, phone hand captures the instant",
    "gaze": "gaze toward screen, slight upward eye movement to phone allowed",
    "camera": "no impossible shoulder reach across desk; maintain front-camera perspective",
    "lighting": "no forced bright screen spill on face",
    "captureType": "front-selfie"
  },
  {
    "id": "chair-laptop",
    "zone": "chair",
    "subScene": "بجانب الكرسي",
    "labelAR": "لابتوب على الفخذ فوق كرسي الغرفة",
    "poseAR": "جالس على كرسي جانبي",
    "prop": "bedroom lounge chair with laptop supported on thighs",
    "contact": "seated with back and thighs supported; free fingertip resting on trackpad; phone in opposite hand",
    "gaze": "intermittent glance from screen to lens, head largely upright",
    "camera": "natural one-arm selfie viewpoint preserving visible chair and lap",
    "lighting": "use actual room lamps or window bounce without synthetic laptop glow",
    "captureType": "front-selfie"
  },
  {
    "id": "chair-reading",
    "zone": "chair",
    "subScene": "بجانب الكرسي",
    "labelAR": "يقرأ كتابًا وهو يلتقط السيلفي",
    "poseAR": "جالس على كرسي جانبي",
    "prop": "comfortable side chair and open paperback book",
    "contact": "book rests on lap, free hand holds a page open, other hand holds smartphone",
    "gaze": "brief glance toward phone from reading page",
    "camera": "upper-body front selfie with book corner visible if field of view allows",
    "lighting": "soft room exposure without mandatory reading lamp",
    "captureType": "front-selfie"
  },
  {
    "id": "window-laptop",
    "zone": "window",
    "subScene": "بجانب الستائر",
    "labelAR": "يعمل على اللابتوب بجوار النافذة",
    "poseAR": "جالس عند طاولة النافذة",
    "prop": "stable narrow console desk and open laptop beside bedroom window",
    "contact": "chair and desk support body/laptop; free hand uses trackpad, capture arm holds phone",
    "gaze": "eyes glancing briefly to camera; natural independent head and eye movement",
    "camera": "compose with window to the side when backlit contrast exceeds sensor range; no fixed 45-degree requirement",
    "lighting": "daylight as side key or bounced fill when window is open and bright; preserve highlight detail if exposure allows",
    "captureType": "front-selfie"
  },
  {
    "id": "window-curtain",
    "zone": "window",
    "subScene": "بجانب الستائر",
    "labelAR": "يفتح الستارة أثناء السيلفي",
    "poseAR": "واقف بجانب النافذة",
    "prop": "existing window curtain and reachable fabric edge",
    "contact": "free hand gently grips curtain edge; other hand holds capture phone; stance stable",
    "gaze": "eyes momentarily toward camera or the curtain edge",
    "camera": "keep window frame perspective straight without forced wide-angle distortion",
    "lighting": "avoid obligatory blown-out window highlights; adjust exposure only when brightness requires",
    "captureType": "front-selfie"
  },
  {
    "id": "floor-laptop",
    "zone": "floor",
    "subScene": "وسط الغرفة",
    "labelAR": "جلسة عمل أرضية على اللابتوب",
    "poseAR": "جالس على الأرض",
    "prop": "bedroom rug and low stable laptop table",
    "contact": "hips supported by floor cushion or rug, laptop on low table, free hand on trackpad; capture hand holds phone",
    "gaze": "eyes shift between display and phone without extreme neck flexion",
    "camera": "camera at reachable front-selfie distance, low table visible in frame if possible",
    "lighting": "light follows actual fixtures and plausible floor bounce, not fictitious rim lighting",
    "captureType": "front-selfie"
  },
  {
    "id": "floor-papers",
    "zone": "floor",
    "subScene": "وسط الغرفة",
    "labelAR": "يراجع أوراقًا في جلسة أرضية",
    "poseAR": "جالس على السجادة",
    "prop": "rug, low tray and a few papers",
    "contact": "free hand separates one document on stable tray; other hand holds phone; no duplicated fingers",
    "gaze": "eyes glance from page to phone at shutter moment",
    "camera": "natural seated perspective, plausible wrist and shoulder alignment",
    "lighting": "paper receives contact shadow from hand and ambient room light",
    "captureType": "front-selfie"
  },
  {
    "id": "wardrobe-shirt",
    "zone": "wardrobe",
    "subScene": "أمام الدولاب",
    "labelAR": "يختار قميصًا من الدولاب أثناء السيلفي",
    "poseAR": "واقف أمام الدولاب",
    "prop": "bedroom wardrobe with reachable clothing hanger",
    "contact": "free hand holds a single shirt hanger while phone hand captures selfie; weight balanced",
    "gaze": "look briefly toward lens with wardrobe in side/background",
    "camera": "three-quarter view only if it preserves one-arm clearance and wardrobe depth",
    "lighting": "use actual ceiling/closet lighting if present, do not invent LED strips",
    "captureType": "front-selfie"
  },
  {
    "id": "wardrobe-bag",
    "zone": "wardrobe",
    "subScene": "أمام الدولاب",
    "labelAR": "يرتب حقيبة السفر أثناء السيلفي",
    "poseAR": "واقف قرب الدولاب",
    "prop": "open travel bag on nearby stable bench or chair",
    "contact": "free hand places one small item in the bag, capturing phone hand stays clear",
    "gaze": "downward glance toward item with brief gaze back to camera",
    "camera": "phone position permits hands, bag and face to remain plausible",
    "lighting": "ordinary indoor lighting; natural local object shadows",
    "captureType": "front-selfie"
  },
  {
    "id": "mirror-collar",
    "zone": "mirror",
    "subScene": "أمام المرآة",
    "labelAR": "سيلفي مرآة أثناء تعديل الياقة",
    "poseAR": "واقف أمام المرآة",
    "prop": "single full-length bedroom mirror and shirt collar",
    "contact": "free hand straightens collar; capture hand holds exactly one phone visible in reflection",
    "gaze": "eyes check the mirror image or phone display",
    "camera": "one optical mirror plane, coherent line of sight and phone reflection",
    "lighting": "reflected room light follows physical fixtures; no extra rim light",
    "captureType": "mirror-selfie"
  },
  {
    "id": "mirror-laptop",
    "zone": "mirror",
    "subScene": "أمام المرآة",
    "labelAR": "سيلفي مرآة يظهر اللابتوب خلفه",
    "poseAR": "واقف أمام المرآة",
    "prop": "one real laptop on a work desk positioned within the mirror sightline",
    "contact": "free hand rests by side or adjusts sleeve; other hand holds one reflected phone",
    "gaze": "gaze into mirror or at phone screen",
    "camera": "single physically placed laptop reflected once where visible; no duplicate second laptop or mirror phone",
    "lighting": "laptop display is only a secondary practical light if bright enough",
    "captureType": "mirror-selfie"
  },
  {
    "id": "bedside-lamp",
    "zone": "bedside",
    "subScene": "بجانب طاولة السرير",
    "labelAR": "يشغّل الأباجورة أثناء السيلفي",
    "poseAR": "واقف بجانب طاولة السرير",
    "prop": "existing bedside lamp and stable nightstand",
    "contact": "free hand touches reachable lamp switch; selfie phone hand stays off the lamp",
    "gaze": "quick glance toward camera while reaching naturally",
    "camera": "show reachable nightstand, avoid two simultaneous active hands",
    "lighting": "lamp illuminates surfaces only after it is switched on; plausible falloff",
    "captureType": "front-selfie"
  },
  {
    "id": "bed-pillow",
    "zone": "bed",
    "subScene": "جالس على حافة السرير",
    "labelAR": "يعدل الوسادة أثناء السيلفي",
    "poseAR": "جالس على حافة السرير",
    "prop": "bed with pillow and duvet",
    "contact": "free hand adjusts nearby pillow; one hand holds camera phone; mattress compresses beneath hips",
    "gaze": "casual glance toward lens",
    "camera": "face and pillow within one-arm selfie range",
    "lighting": "bedside ambient light only, preserve textile shadows",
    "captureType": "front-selfie"
  },
  {
    "id": "bed-laptop",
    "zone": "bed",
    "subScene": "جالس فوق السرير",
    "labelAR": "يستخدم اللابتوب على السرير أثناء السيلفي",
    "poseAR": "جالس فوق السرير",
    "prop": "open laptop supported on a stable lap tray above duvet",
    "contact": "free hand on trackpad, other hand holds selfie phone; tray prevents sinking into bedding",
    "gaze": "natural glance between screen and camera",
    "camera": "phone held at reachable angle, no second camera",
    "lighting": "no forced screen glare or invented light source",
    "captureType": "front-selfie"
  },
  {
    "id": "bed-waking",
    "zone": "bed",
    "subScene": "مستلقٍ على السرير",
    "labelAR": "سيلفي بعد الاستيقاظ على الوسادة",
    "poseAR": "مستلقٍ على السرير",
    "prop": "one real pillow supporting head and an ordinary displaced duvet",
    "contact": "head presses the pillow naturally, torso and hips load the mattress; one raised arm holds the phone over face within reach, free arm rests on bedding without creating a second phone",
    "gaze": "sleepy neutral gaze toward the actual phone lens; no invented permanent eye bags",
    "camera": "reachable above-face smartphone selfie with natural perspective and upper arm visible only if within 21mm front-camera view",
    "lighting": "window daylight only if curtains admit it; otherwise selected existing bedroom practical lighting",
    "captureType": "front-selfie"
  },
  {
    "id": "bed-reclined",
    "zone": "bed",
    "subScene": "مستلقٍ على السرير",
    "labelAR": "سيلفي متكئ على المخدات قبل النوم",
    "poseAR": "مستلقٍ على السرير",
    "prop": "one or two real pillows against the same upholstered headboard and partially folded duvet",
    "contact": "upper back and head supported by pillows, hips compress mattress; phone-holding arm bends naturally at shoulder, free hand rests on duvet",
    "gaze": "relaxed glance at phone with head fully supported, no forced twist",
    "camera": "chest-up selfie from a physically reachable arm position, bed headboard visible only where the field of view permits",
    "lighting": "a real selected bedside or ceiling fixture illuminates the face unevenly without studio fill",
    "captureType": "front-selfie"
  },
  {
    "id": "bed-side-rest",
    "zone": "bed",
    "subScene": "مستلقٍ على السرير",
    "labelAR": "سيلفي مستلقٍ على الجانب",
    "poseAR": "مستلقٍ على الجانب فوق السرير",
    "prop": "single bed pillow, fitted sheet and duvet following body contour",
    "contact": "side of cheek and shoulder rest on pillow and mattress, hips load the bedding; upper arm holds the capturing phone in front of face with safe shoulder reach while lower arm rests close to chest",
    "gaze": "eyes relaxed toward phone, head remains aligned with neck and pillow",
    "camera": "slightly oblique one-arm 21mm front selfie, no aerial camera or impossible bed-wide view",
    "lighting": "practical light tracks head orientation and real pillow shadows, preserve darker mattress side",
    "captureType": "front-selfie"
  },
  {
    "id": "bed-seated-duvet",
    "zone": "bed",
    "subScene": "جالس فوق السرير",
    "labelAR": "جالس على السرير ويرتّب الغطاء",
    "poseAR": "جالس فوق السرير",
    "prop": "ordinary cotton duvet and pillows with believable seam scale",
    "contact": "pelvis compresses mattress and duvet gathers around thighs; one hand pulls nearby duvet corner, opposite hand holds the phone",
    "gaze": "quick natural glance at phone with loose shoulders",
    "camera": "held at reachable arm distance, bedding corner partially visible in lower frame if framing permits",
    "lighting": "selected ambient ceiling/bedside fixture causes shadows inside folds, no blanket glow",
    "captureType": "front-selfie"
  },
  {
    "id": "bed-edge-sleeve",
    "zone": "bed",
    "subScene": "جالس على حافة السرير",
    "labelAR": "جالس على الحافة يعدّل الكم",
    "poseAR": "جالس على حافة السرير",
    "prop": "real mattress edge, rug and ordinary clothes on the subject",
    "contact": "hips press mattress rim causing localized sag; feet rest on floor, free hand straightens other sleeve without reaching across impossible angles, opposite hand holds phone",
    "gaze": "brief neutral eye contact with phone",
    "camera": "one arm raised for selfie with mattress edge and upper legs visible only within actual crop",
    "lighting": "ceiling/downward practical fixture with soft contact shadows under thighs and feet",
    "captureType": "front-selfie"
  },
  {
    "id": "bed-edge-lean",
    "zone": "bed",
    "subScene": "جالس على حافة السرير",
    "labelAR": "سيلفي جلسة مائلة عند طرف السرير",
    "poseAR": "جالس على حافة السرير",
    "prop": "bed edge and nearby nightstand visible only from relevant camera side",
    "contact": "slight lateral lean supported by mattress and one planted foot; selfie arm extended from corresponding shoulder, other hand naturally rests on knee",
    "gaze": "calm eye contact, eyelids natural",
    "camera": "slight handheld tilt, visible mattress compression not fake edge-floating posture",
    "lighting": "existing ceiling or bedside light casts coherent wall and fabric shadows",
    "captureType": "front-selfie"
  },
  {
    "id": "bedside-water",
    "zone": "bedside",
    "subScene": "بجانب طاولة السرير",
    "labelAR": "يمسك كوب ماء من الطاولة الجانبية",
    "poseAR": "واقف بجانب طاولة السرير",
    "prop": "single bedside table with glass of water on a stable coaster",
    "contact": "free hand picks up one glass from real tabletop, capturing phone hand remains occupied, glass not floating",
    "gaze": "short glance from water glass to phone lens",
    "camera": "upper torso and near table edge in view only if the phone yaw permits",
    "lighting": "room practical creates accurate refraction and a small table contact shadow",
    "captureType": "front-selfie"
  },
  {
    "id": "wardrobe-hanger",
    "zone": "wardrobe",
    "subScene": "أمام الدولاب",
    "labelAR": "يعلق القميص داخل الدولاب",
    "poseAR": "واقف أمام الدولاب",
    "prop": "real hinged or sliding wardrobe at reachable chest-level rod and one hanger",
    "contact": "free arm hooks hanger to reachable closet rail, other arm holds selfie phone without crossing doors",
    "gaze": "brief look toward clothes then toward phone",
    "camera": "camera may crop hanging rail; never fake transparent cupboard or multiply wardrobe doors",
    "lighting": "existing ceiling light, closet interior darker unless actual practical lamp is selected",
    "captureType": "front-selfie"
  },
  {
    "id": "window-air",
    "zone": "window",
    "subScene": "بجانب الستائر",
    "labelAR": "واقف بجانب النافذة ينظر للخارج",
    "poseAR": "واقف بجانب الستائر",
    "prop": "real curtain edge, window frame and plausible floor clearance",
    "contact": "one hand loosely touches curtain edge, smartphone held in opposite hand, shoulders relaxed",
    "gaze": "eyes glance momentarily through window without visible gaze outside photo frame beyond neck range",
    "camera": "side-light front selfie only if window is to side of face, no invisible exterior camera",
    "lighting": "daylight if open during daytime; nocturnal glass otherwise dark or with weak real reflections",
    "captureType": "front-selfie"
  },
  {
    "id": "chair-rest",
    "zone": "chair",
    "subScene": "بجانب الكرسي",
    "labelAR": "استراحة جالس على كرسي الغرفة",
    "poseAR": "جالس على كرسي جانبي",
    "prop": "one real upholstered side chair with nearby small floor rug",
    "contact": "seat takes hip weight, backrest supports upper back and feet rest on floor; non-camera hand rests on chair arm",
    "gaze": "natural relaxed resting expression toward phone",
    "camera": "handheld comfortable camera distance with partial chair edge, no studio tripod",
    "lighting": "practical room light and ordinary chair-fabric contact shading",
    "captureType": "front-selfie"
  },
  {
    "id": "mirror-watch",
    "zone": "mirror",
    "subScene": "أمام المرآة",
    "labelAR": "سيلفي مرآة وهو يضبط الساعة",
    "poseAR": "واقف أمام المرآة",
    "prop": "one real flat vertical mirror and watch on free wrist",
    "contact": "phone hand holds a single device with its lens directed toward mirror; free hand adjusts wristwatch but does not hold another phone",
    "gaze": "looks to actual reflected wrist or at one phone display",
    "camera": "one planar reflection and correct wrist/phone handedness; torso and mirror boundary stay physically aligned",
    "lighting": "real ceiling/side lamp reflected with no additional imaginary lamp array",
    "captureType": "mirror-selfie"
  },
  {
    "id": "floor-slippers",
    "zone": "floor",
    "subScene": "وسط الغرفة",
    "labelAR": "يجلس على السجادة قرب النعل",
    "poseAR": "جالس على الأرض",
    "prop": "ordinary bedside floor rug and one pair of slippers within easy reach",
    "contact": "hips supported on rug, bent legs comfortably placed; free hand nudges a slipper while phone hand holds camera",
    "gaze": "natural downward glance, head not simultaneously facing two targets",
    "camera": "phone framed at one-arm distance without making floor appear larger than room",
    "lighting": "real ceiling light with rug texture and slippers cast local contact shadows",
    "captureType": "front-selfie"
  },
  {
    "id": "bedside-charger",
    "zone": "bedside",
    "subScene": "بجانب طاولة السرير",
    "labelAR": "يرتّب سلك الشاحن بجانب السرير",
    "poseAR": "واقف بجانب طاولة السرير",
    "prop": "one real unplugged charging lead routed safely at bedside and a stable nightstand",
    "contact": "free hand gathers a short reachable length of cable, other hand holds recording phone; no second handheld smartphone",
    "gaze": "brief gaze at cable and back to phone",
    "camera": "partial nightstand cropped naturally at the bottom of front selfie",
    "lighting": "ambient practical light with small local shadows, no luminous glowing cable",
    "captureType": "front-selfie"
  }
];

export function getBedroomSelfieActivity(id?: string): BedroomSelfieActivity | undefined {
  return BEDROOM_INTERACTIVE_SELFIES.find(activity => activity.id === id);
}

export function getBedroomSelfieActivities(zone: BedroomSelfieZone): BedroomSelfieActivity[] {
  return BEDROOM_INTERACTIVE_SELFIES.filter(activity => activity.zone === zone);
}

/** Optional user-supplied measurements; absent values are never treated as verified. */
export interface CaptureFrameEvidence {
  phoneToFaceCm?: number;
  usablePhoneArmReachCm?: number;
  horizontalFovDeg?: number;
  targetBearingDeg?: number;
  targetHalfWidthDeg?: number;
  faceBearingDeg?: number;
  faceHalfWidthDeg?: number;
  freeHandBearingDeg?: number;
  freeHandHalfWidthDeg?: number;
  freeHandTargetDistanceCm?: number;
  usableFreeHandReachCm?: number;
}
export type CaptureFeasibility = { status: 'feasible' | 'blocked' | 'unverified'; reasons: string[] };
/** Check measurable geometry without assuming that the scene was photographed or measured. */
export function evaluateCaptureFeasibility(e: CaptureFrameEvidence): CaptureFeasibility {
  const reasons: string[] = [];
  const positive = (n: number | undefined) => n !== undefined && Number.isFinite(n) && n > 0;
  const relevant = Object.values(e).filter(v => v !== undefined);
  if (relevant.some(v => typeof v !== 'number' || !Number.isFinite(v)))
    return { status: 'blocked', reasons: ['Invalid non-finite capture measurement'] };
  const camera = positive(e.phoneToFaceCm) && positive(e.usablePhoneArmReachCm);
  const field = positive(e.horizontalFovDeg) && e.horizontalFovDeg! <= 180 &&
    e.targetBearingDeg !== undefined && e.targetHalfWidthDeg !== undefined &&
    e.targetHalfWidthDeg >= 0 && e.targetHalfWidthDeg <= 90;
  const hand = positive(e.freeHandTargetDistanceCm) && positive(e.usableFreeHandReachCm);
  const angularFits = (bearing: number | undefined, halfWidth: number | undefined) =>
    bearing === undefined || halfWidth === undefined || !positive(e.horizontalFovDeg) ||
    (halfWidth >= 0 && Math.abs(bearing) + halfWidth <= e.horizontalFovDeg! / 2);
  const faceKnown = e.faceBearingDeg !== undefined && e.faceHalfWidthDeg !== undefined;
  const handKnown = e.freeHandBearingDeg !== undefined && e.freeHandHalfWidthDeg !== undefined;
  if (faceKnown && !angularFits(e.faceBearingDeg, e.faceHalfWidthDeg))
    reasons.push('Face lies outside measured horizontal camera frame');
  if (handKnown && !angularFits(e.freeHandBearingDeg, e.freeHandHalfWidthDeg))
    reasons.push('Interacting hand lies outside measured horizontal camera frame');
  if (camera && e.phoneToFaceCm! > e.usablePhoneArmReachCm!)
    reasons.push('Capturing phone exceeds measured usable arm reach');
  if (field && Math.abs(e.targetBearingDeg!) + e.targetHalfWidthDeg! > e.horizontalFovDeg! / 2)
    reasons.push('Required target falls outside measured horizontal camera field of view');
  if (hand && e.freeHandTargetDistanceCm! > e.usableFreeHandReachCm!)
    reasons.push('Action target exceeds measured free-hand reach');
  if (reasons.length) return { status: 'blocked', reasons };
  return { status: camera && field && hand && faceKnown && handKnown ? 'feasible' : 'unverified',
    reasons: camera && field && hand ? [] : ['Capture geometry has not been fully measured'] };
}

/** Categorical shot layout only: this is a staging suggestion, never inferred image coordinates. */
export function estimateSelfieSubjectLayout(activity: BedroomSelfieActivity): {
  confidence: 'heuristic';
  face: string;
  interactingHand: string;
  target: string;
  guidance: string;
} {
  if (activity.captureType === 'mirror-selfie') {
    return {
      confidence: 'heuristic',
      face: 'within the single reflected view',
      interactingHand: 'near the torso or collar in the same reflection',
      target: 'visible only if the actual mirror sightline permits',
      guidance: 'Estimate a coherent one-mirror composition: show one reflected face, one phone and the acting hand only where optically possible; verify target visibility from mirror placement. No inferred pixel coordinates.'
    };
  }
  const lowTarget = activity.zone === 'bed' || activity.zone === 'floor' || activity.zone === 'desk';
  const target = lowTarget ? 'lower side of frame only if comfortably reachable' : 'beside the shoulder or torso only if comfortably reachable';
  return {
    confidence: 'heuristic',
    face: 'near the central upper field without forced alignment',
    interactingHand: lowTarget ? 'naturally descending into the lower field' : 'beside the face or torso when the action allows',
    target,
    guidance: 'Estimated layout, not measured visibility: face near upper center; free hand ' +
      (lowTarget ? 'naturally lowers toward the action' : 'stays near its reachable object') +
      '; action prop may enter the ' + (lowTarget ? 'lower' : 'side') +
      ' frame if camera clearance allows. Prefer cropping nonessential portions over exceeding arm reach, adding hands or inventing a wider lens. Confirm actual subject bearings before declaring all three visible.'
  };
}

/** Conservative design assumptions, NOT observations or verified distances. */
export function estimateBedroomCapture(activity: BedroomSelfieActivity): {
  evidence: CaptureFrameEvidence; confidence: 'heuristic'; guidance: string;
} {
  const mirror = activity.captureType === 'mirror-selfie';
  const closeAction = activity.zone === 'bed' || activity.zone === 'bedside';
  const phoneToFaceCm = mirror ? undefined : closeAction ? 48 : 52;
  return {
    evidence: {
      phoneToFaceCm,
      usablePhoneArmReachCm: mirror ? undefined : 60,
      horizontalFovDeg: mirror ? undefined : 70,
      // Face, hand and target bearings, angular widths and free-hand reach depend on actual
      // scene layout. Never manufacture these from a textual zone label.
    },
    confidence: 'heuristic',
    guidance: mirror
      ? 'Mirror sightline, reflected phone position and target visibility require actual mirror geometry.'
      : 'Suggested starting phone-to-face distance ~' + phoneToFaceCm +
        ' cm, not a measurement; place the action target naturally within arm reach and frame. ' +
        'Do not claim visibility until face, acting hand and target bearings and angular sizes are established.'
  };
}

export type BedroomSelfieDecision =
  | { status: 'inactive'; prompt: ''; reasons: [] }
  | { status: 'blocked'; prompt: ''; reasons: string[] }
  | { status: 'ready'; prompt: string; reasons: []; activity: BedroomSelfieActivity };

export function resolveBedroomSelfieActivity(state: Pick<SceneState,
  'sceneFamily' | 'subScene' | 'captureType' | 'bedroomSelfieActionId'
> & { captureFrameEvidence?: CaptureFrameEvidence }): BedroomSelfieDecision {
  if (!state.bedroomSelfieActionId) return { status: 'inactive', prompt: '', reasons: [] };
  const activity = getBedroomSelfieActivity(state.bedroomSelfieActionId);
  if (!activity) return { status: 'blocked', prompt: '', reasons: ['Unknown bedroom selfie activity'] };
  if (state.sceneFamily !== 'bedroom' || activity.captureType !== state.captureType ||
      activity.subScene !== state.subScene) {
    return { status: 'blocked', prompt: '', reasons: ['Interactive selfie zone, sub-location or capture mode mismatch'] };
  }
  const estimate = estimateBedroomCapture(activity);
  const subjectLayout = estimateSelfieSubjectLayout(activity);
  const geometry = state.captureFrameEvidence
    ? evaluateCaptureFeasibility(state.captureFrameEvidence)
    : { status: 'unverified' as const, reasons: ['No capture measurements supplied'] };
  if (geometry.status === 'blocked') return { status: 'blocked', prompt: '', reasons: geometry.reasons };
  const phoneRule = activity.captureType === 'front-selfie'
    ? 'The capturing smartphone remains outside the image; exactly one arm operates it while the other hand performs the action.'
    : 'Mirror selfie with exactly one real capturing smartphone and its coherent reflection; no duplicated objects, reversed hands or invented second laptop.';
  const prompt = [
    'INTERACTIVE BEDROOM SELFIE AT SHUTTER TIME:',
    'Zone: ' + BEDROOM_SELFIE_ZONE_LABELS[activity.zone] + ' (' + activity.subScene + ').',
    'User-selected activity: ' + activity.labelAR + '.',
    'Arrange the selected prop with physical support: ' + activity.prop + '. This is a requested arrangement, not an observed existing object.',
    'Contact and body mechanics: ' + activity.contact + '.',
    'Gaze and cervical comfort: ' + activity.gaze + '.',
    'Camera constraints: ' + activity.camera + '.',
    state.captureFrameEvidence ? '' : 'Automatic subject layout: ' + subjectLayout.guidance,
    'Composition: the face, the free hand performing the action, and its contacted object must occupy a coherent single camera view when visibility is requested. Never widen the front camera frame or move the phone beyond one-arm reach merely to include an object; allow natural partial occlusion rather than fabricating visibility.',
    state.captureFrameEvidence ? '' : 'Heuristic framing: ' + estimate.guidance,
    geometry.status === 'feasible' ? 'Supplied capture measurements place the face, interacting hand and action target inside usable reach and horizontal frame.' : 'Do not assert measured field-of-view or reach clearance without verified measurements.',
    'Illumination conditions: ' + activity.lighting + '.',
    phoneRule,
    'Do not add extra limbs, unsupported floating objects, forced glare or a staged symmetrical pose.'
  ].join(' ');
  return { status: 'ready', prompt, reasons: [], activity };
}
