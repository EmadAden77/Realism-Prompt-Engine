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
  }
];

export function getBedroomSelfieActivity(id?: string): BedroomSelfieActivity | undefined {
  return BEDROOM_INTERACTIVE_SELFIES.find(activity => activity.id === id);
}

export function getBedroomSelfieActivities(zone: BedroomSelfieZone): BedroomSelfieActivity[] {
  return BEDROOM_INTERACTIVE_SELFIES.filter(activity => activity.zone === zone);
}

export type BedroomSelfieDecision =
  | { status: 'inactive'; prompt: ''; reasons: [] }
  | { status: 'blocked'; prompt: ''; reasons: string[] }
  | { status: 'ready'; prompt: string; reasons: []; activity: BedroomSelfieActivity };

export function resolveBedroomSelfieActivity(state: Pick<SceneState,
  'sceneFamily' | 'subScene' | 'captureType' | 'bedroomSelfieActionId'
>): BedroomSelfieDecision {
  if (!state.bedroomSelfieActionId) return { status: 'inactive', prompt: '', reasons: [] };
  const activity = getBedroomSelfieActivity(state.bedroomSelfieActionId);
  if (!activity) return { status: 'blocked', prompt: '', reasons: ['Unknown bedroom selfie activity'] };
  if (state.sceneFamily !== 'bedroom' || activity.captureType !== state.captureType ||
      activity.subScene !== state.subScene) {
    return { status: 'blocked', prompt: '', reasons: ['Interactive selfie zone, sub-location or capture mode mismatch'] };
  }
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
    'Illumination conditions: ' + activity.lighting + '.',
    phoneRule,
    'Do not add extra limbs, unsupported floating objects, forced glare or a staged symmetrical pose.'
  ].join(' ');
  return { status: 'ready', prompt, reasons: [], activity };
}
