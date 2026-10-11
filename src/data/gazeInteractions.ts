// Optional still-frame gaze and conversation behavior; unchanged when none is selected.
export const GAZE_INTERACTIONS = [
  {
    "id": "g1",
    "labelAR": "نظر مباشر للعدسة",
    "prompt": "Eyes looking directly into the front camera lens; natural eye convergence."
  },
  {
    "id": "g2",
    "labelAR": "نظر يمين خارج الكاميرا",
    "prompt": "Eyes looking slightly to the subject's right, without exaggerated head rotation."
  },
  {
    "id": "g3",
    "labelAR": "نظر يسار خارج الكاميرا",
    "prompt": "Eyes looking slightly to the subject's left, without exaggerated head rotation."
  },
  {
    "id": "g4",
    "labelAR": "نظر للأعلى قليلًا",
    "prompt": "Eyes looking subtly upward, natural eyelid positions."
  },
  {
    "id": "g5",
    "labelAR": "نظر للأسفل قليلًا",
    "prompt": "Eyes looking subtly downward with realistic upper eyelid coverage."
  },
  {
    "id": "g6",
    "labelAR": "النظر إلى شاشة الهاتف",
    "prompt": "Eyes focused on the phone screen rather than the lens, at reachable selfie distance."
  },
  {
    "id": "g7",
    "labelAR": "النظر بطرف العين",
    "prompt": "Sideways eye glance while the head remains nearly still; no extreme ocular rotation."
  },
  {
    "id": "g8",
    "labelAR": "إمالة الرأس يمينًا",
    "prompt": "Head tilted slightly toward subject's right shoulder with natural neck anatomy."
  },
  {
    "id": "g9",
    "labelAR": "إمالة الرأس يسارًا",
    "prompt": "Head tilted slightly toward subject's left shoulder with natural neck anatomy."
  },
  {
    "id": "g10",
    "labelAR": "تدوير الرأس والعينان للعدسة",
    "prompt": "Head turned subtly sideways while eyes naturally return toward the lens."
  },
  {
    "id": "g11",
    "labelAR": "النظر لشيء قريب خارج الإطار",
    "prompt": "Attention aimed at a nearby off-frame object with believable focal distance."
  },
  {
    "id": "g12",
    "labelAR": "النظر لشيء بعيد في الخلفية",
    "prompt": "Eyes focused on a distant visible or plausibly off-frame background point."
  },
  {
    "id": "g13",
    "labelAR": "النظر أثناء تعديل الياقة",
    "prompt": "Brief glance toward the shirt collar while the free hand adjusts it, keeping the phone supported."
  },
  {
    "id": "g14",
    "labelAR": "النظر أثناء تعديل الكم",
    "prompt": "Gaze lowered toward a sleeve as the free hand adjusts it, maintaining selfie grip."
  },
  {
    "id": "g15",
    "labelAR": "الالتفات العفوي للكاميرا",
    "prompt": "A naturally timed glance back toward the lens with a small head turn."
  },
  {
    "id": "g16",
    "labelAR": "التحدث والنظر للعدسة",
    "prompt": "Frozen mid-sentence, gaze into the lens, subtle anatomically accurate jaw and lip separation."
  },
  {
    "id": "g17",
    "labelAR": "التحدث والنظر للشاشة",
    "prompt": "Mid-speech glance at the phone screen instead of the lens, natural mouth articulation."
  },
  {
    "id": "g18",
    "labelAR": "التحدث والنظر يمينًا",
    "prompt": "Speaking with eyes looking slightly right, subtle speech-shaped lips."
  },
  {
    "id": "g19",
    "labelAR": "التحدث والنظر يسارًا",
    "prompt": "Speaking with eyes looking slightly left, naturally relaxed neck."
  },
  {
    "id": "g20",
    "labelAR": "التحدث وتحويل النظر بين العدسة والمحيط",
    "prompt": "Single still instant during a natural gaze shift between lens and surroundings, not multiple gazes."
  },
  {
    "id": "g21",
    "labelAR": "التحدث مع إمالة الرأس",
    "prompt": "Mid-conversation with a small relaxed head tilt and realistic jaw movement."
  },
  {
    "id": "g22",
    "labelAR": "التحدث ورفع حاجب خفيف",
    "prompt": "Speaking with a subtly raised eyebrow, retaining reference facial geometry."
  },
  {
    "id": "g23",
    "labelAR": "التحدث والفم مفتوح قليلًا",
    "prompt": "Frozen within a spoken syllable, lips parted slightly with anatomically plausible teeth visibility."
  },
  {
    "id": "g24",
    "labelAR": "التحدث بحركة شفاه دون ابتسامة",
    "prompt": "Natural neutral speech articulation, no smile and no exaggerated mouth shape."
  },
  {
    "id": "g25",
    "labelAR": "التحدث مع ظهور الأسنان",
    "prompt": "A spoken phoneme briefly revealing natural teeth, without forced grin."
  },
  {
    "id": "g26",
    "labelAR": "التحدث والالتفات لشخص خارج الإطار",
    "prompt": "Mid-sentence looking toward an off-frame listener with plausible head rotation."
  },
  {
    "id": "g27",
    "labelAR": "الاستماع والنظر للمتحدث",
    "prompt": "Attentively listening to an off-frame speaker, lips resting and eyes directed toward them."
  },
  {
    "id": "g28",
    "labelAR": "التوقف أثناء الحديث والنظر بعيدًا",
    "prompt": "A brief pause between words, mouth naturally settling while gaze drifts away."
  },
  {
    "id": "g29",
    "labelAR": "النظر للأعلى أثناء التفكير",
    "prompt": "Thinking between spoken phrases with a mild upward glance, no theatrical expression."
  },
  {
    "id": "g30",
    "labelAR": "التحدث بهدوء والنظر للأسفل",
    "prompt": "Quiet mid-sentence articulation with gaze cast slightly downward."
  },
  {
    "id": "g31",
    "labelAR": "التحدث وإيماءة رأس خفيفة",
    "prompt": "Mid-sentence small affirmative head movement frozen in a plausible instant."
  },
  {
    "id": "g32",
    "labelAR": "التحدث ورفع اليد للتوضيح",
    "prompt": "Speaking while the free hand is raised modestly to explain, the other hand retaining the phone."
  },
  {
    "id": "g33",
    "labelAR": "التحدث والإشارة لخارج الإطار",
    "prompt": "Speaking and pointing toward an off-frame object with the free hand, correct arm anatomy."
  },
  {
    "id": "g34",
    "labelAR": "التحدث باستغراب طبيعي",
    "prompt": "Speaking with restrained surprise, subtle brow lift and natural mouth motion."
  },
  {
    "id": "g35",
    "labelAR": "التحدث بجدية للعدسة",
    "prompt": "Speaking seriously while focusing on the lens, modest articulation, no forced smile."
  }
] as const;
export function gazeInteractionPrompt(id?: string): string {
  const item = GAZE_INTERACTIONS.find(option => option.id === id);
  return item ? `Shutter-time gaze and interaction: ${item.prompt} One physically plausible still instant. Preserve the reference identity and existing camera/lighting/scene constraints.` : '';
}
