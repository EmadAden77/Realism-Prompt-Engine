import type { OutfitItem } from '../data/clothingOutfits';
import { getMicroLocation, type SceneFamilyId } from '../data/microLocations';

export type OutfitWearStyle =
  | 'natural-neat'
  | 'very-neat'
  | 'casual-relaxed'
  | 'comfortable'
  | 'formal'
  | 'home-relaxed'
  | 'sporty';

export type GarmentWearContext =
  | 'auto'
  | 'neutral'
  | 'after-sitting'
  | 'after-walking'
  | 'post-workout'
  | 'light-breeze'
  | 'light-sweat';

export type ShirtTuck = 'auto' | 'tucked' | 'untucked' | 'half-tuck';
export type SleeveStyle = 'auto' | 'down' | 'rolled-once' | 'rolled-forearm';
export type ShirtButtons = 'auto' | 'fully-buttoned' | 'top-one-open' | 'top-two-open';
export type CollarStyle = 'auto' | 'neat' | 'relaxed';
export type OuterwearClosure = 'auto' | 'open' | 'closed' | 'half-open';
export type HoodPosition = 'auto' | 'down' | 'up';
export type ThobeCollar = 'auto' | 'closed' | 'slightly-open';

export interface AttireControls {
  outfitWearStyle?: OutfitWearStyle;
  garmentWearContext?: GarmentWearContext;
  shirtTuck?: ShirtTuck;
  sleeveStyle?: SleeveStyle;
  shirtButtons?: ShirtButtons;
  collarStyle?: CollarStyle;
  outerwearClosure?: OuterwearClosure;
  hoodPosition?: HoodPosition;
  thobeCollar?: ThobeCollar;
}

export interface OutfitCapabilities {
  isShirt: boolean;
  isThobe: boolean;
  isTee: boolean;
  isOuterwear: boolean;
  isHoodie: boolean;
  supportsTuck: boolean;
  supportsSleeves: boolean;
  supportsShirtButtons: boolean;
  supportsCollar: boolean;
  supportsOuterwearClosure: boolean;
  supportsHood: boolean;
  supportsThobeCollar: boolean;
}

export interface ActivityDefinition {
  labelAR: string;
  prompt: string;
  mechanics: string;
  gaze: string;
  tags: string[];
  families: SceneFamilyId[];
}

const COMMON_ACTIVITIES: ActivityDefinition[] = [
  {
    labelAR: 'واقف بشكل طبيعي',
    prompt: 'standing naturally without performing a staged action',
    mechanics: 'weight distributed naturally with slight left-right asymmetry, arms resting without mannequin stiffness',
    gaze: 'casual gaze toward the phone lens or slightly past it',
    tags: ['standing', 'static'],
    families: ['military-base','saudi-outdoor','living-room','bedroom','gym']
  },
  {
    labelAR: 'واقف فقط',
    prompt: 'standing naturally without performing a staged action',
    mechanics: 'weight distributed naturally with slight left-right asymmetry, arms resting without mannequin stiffness',
    gaze: 'casual gaze toward the phone lens or slightly past it',
    tags: ['standing', 'static'],
    families: ['military-base','saudi-outdoor','living-room','bedroom','gym']
  },
  {
    labelAR: 'ينتظر',
    prompt: 'waiting casually for something off-camera',
    mechanics: 'subtle weight shift, one shoulder fractionally lower, relaxed hands',
    gaze: 'intermittent unfixed gaze rather than a posed stare',
    tags: ['standing', 'waiting'],
    families: ['military-base','saudi-outdoor','car','gym']
  },
  {
    labelAR: 'ينظر حوله',
    prompt: 'quietly looking around the surrounding space',
    mechanics: 'small natural head turn with torso remaining mostly settled',
    gaze: 'eyes tracking something outside the lens',
    tags: ['gaze', 'ambient'],
    families: ['military-base','saudi-outdoor','living-room','bedroom','gym']
  },
  {
    labelAR: 'ينظر بعيدًا',
    prompt: 'looking naturally into the distance rather than posing at the camera',
    mechanics: 'head and eyes offset slightly from the phone while shoulders remain relaxed',
    gaze: 'distant off-camera gaze',
    tags: ['gaze'],
    families: ['military-base','saudi-outdoor','car','living-room','bedroom','gym']
  },
  {
    labelAR: 'ينظر للهاتف',
    prompt: 'looking down at the phone screen naturally',
    mechanics: 'small cervical flexion with realistic eye convergence toward the screen',
    gaze: 'eyes focused on the phone screen, not the viewer',
    tags: ['phone', 'gaze'],
    families: ['military-base','saudi-outdoor','car','living-room','bedroom','gym']
  },
  {
    labelAR: 'يستخدم الهاتف',
    prompt: 'using the smartphone casually',
    mechanics: 'thumb and wrist posture consistent with one-handed phone use, shoulders relaxed',
    gaze: 'attention naturally divided between screen and surroundings',
    tags: ['phone'],
    families: ['military-base','saudi-outdoor','car','living-room','bedroom','gym']
  },
  {
    labelAR: 'يقرأ رسالة',
    prompt: 'reading a message on the phone',
    mechanics: 'phone held at a believable reading distance with small downward eye angle',
    gaze: 'focused on screen content',
    tags: ['phone', 'reading'],
    families: ['military-base','saudi-outdoor','car','living-room','bedroom','gym']
  },
  {
    labelAR: 'يكتب رسالة',
    prompt: 'typing a short message on the phone',
    mechanics: 'thumb movement and grip consistent with casual texting, no impossible finger pose',
    gaze: 'eyes fixed on the screen',
    tags: ['phone', 'typing'],
    families: ['military-base','saudi-outdoor','car','living-room','bedroom','gym']
  },
  {
    labelAR: 'يجري مكالمة',
    prompt: 'making a casual phone call',
    mechanics: 'phone held to the ear with natural elbow bend and shoulder separation',
    gaze: 'unfocused conversational gaze away from camera',
    tags: ['phone', 'call'],
    families: ['military-base','saudi-outdoor','car','living-room','bedroom']
  },
  {
    labelAR: 'يراجع الصورة',
    prompt: 'reviewing a just-taken photo on the phone',
    mechanics: 'phone held slightly below eye line with relaxed wrist rotation',
    gaze: 'eyes focused on the display',
    tags: ['phone', 'camera'],
    families: ['military-base','saudi-outdoor','car','living-room','bedroom','gym']
  },
  {
    labelAR: 'يلتقط سيلفي',
    prompt: 'actively taking a casual front-camera selfie',
    mechanics: 'one arm extends toward the phone with realistic shoulder, elbow, and wrist mechanics',
    gaze: 'eyes naturally aim near the front-camera lens rather than dead-center at the screen',
    tags: ['phone', 'selfie'],
    families: ['military-base','saudi-outdoor','car','living-room','bedroom','gym']
  }
];

const FAMILY_ACTIVITIES: Record<SceneFamilyId, ActivityDefinition[]> = {
  'bedroom': [
    { labelAR:'جالس', prompt:'sitting naturally in the bedroom', mechanics:'pelvis fully supported with relaxed posture and grounded limbs', gaze:'relaxed natural gaze', tags:['seated'], families:['bedroom'] },
    { labelAR:'مسترخٍ', prompt:'relaxing naturally in the room', mechanics:'reduced muscular tension with body weight visibly supported by furniture or bed', gaze:'soft unfixed gaze', tags:['relaxed'], families:['bedroom'] },
    { labelAR:'جالس بهدوء', prompt:'sitting quietly in the bedroom', mechanics:'pelvis fully supported with relaxed lumbar posture', gaze:'relaxed natural gaze', tags:['seated'], families:['bedroom'] },
    { labelAR:'جالس على حافة السرير', prompt:'sitting naturally on the edge of the bed', mechanics:'pelvis compresses mattress edge with feet grounded and knees naturally bent', gaze:'casual lens or off-camera gaze', tags:['seated','bed'], families:['bedroom'] },
    { labelAR:'مسترخٍ', prompt:'relaxing quietly in the room', mechanics:'reduced muscular tension with supported body weight', gaze:'soft unfixed gaze', tags:['relaxed'], families:['bedroom'] },
    { labelAR:'نصف مستلقٍ', prompt:'resting in a semi-reclined position', mechanics:'upper torso supported by mattress or pillows with believable hip and spine angles', gaze:'relaxed gaze toward phone or ceiling-side direction', tags:['reclined'], families:['bedroom'] },
    { labelAR:'مستلقي بشكل طبيعي', prompt:'lying naturally on the bed without posing', mechanics:'body weight visibly compresses mattress and pillow surfaces', gaze:'soft relaxed gaze', tags:['reclined','bed'], families:['bedroom'] },
    { labelAR:'ينهض من الجلسة', prompt:'caught naturally while rising from a seated position', mechanics:'forward torso shift with legs beginning to accept body weight', gaze:'attention directed toward movement', tags:['transition','motion'], families:['bedroom'] },
    { labelAR:'يقرأ كتابًا', prompt:'reading a book casually', mechanics:'book supported by hands or lap with relaxed elbows', gaze:'eyes focused downward on the page', tags:['reading'], families:['bedroom'] },
    { labelAR:'يرتب أغراضه', prompt:'casually arranging small personal items', mechanics:'one hand interacts with nearby objects while body remains naturally supported', gaze:'eyes directed toward the task', tags:['task'], families:['bedroom'] }
  ],
  'living-room': [
    { labelAR:'جالس على الكنبة', prompt:'sitting naturally on the sofa', mechanics:'hips and back visibly supported by sofa cushions with organic compression', gaze:'relaxed gaze', tags:['seated'], families:['living-room'] },
    { labelAR:'مسترخٍ على الكنبة', prompt:'relaxing back into the sofa', mechanics:'back and shoulders supported with cushion compression and asymmetrical lounging posture', gaze:'soft unfixed gaze', tags:['seated','relaxed'], families:['living-room'] },
    { labelAR:'يشرب قهوة', prompt:'taking a casual sip of coffee', mechanics:'cup held with believable finger grip and elbow bend, wrist aligned under cup weight', gaze:'brief gaze toward cup or ahead', tags:['drink'], families:['living-room','saudi-outdoor'] },
    { labelAR:'يمسك كوبًا', prompt:'holding a coffee cup casually', mechanics:'cup weight supported naturally by fingers and wrist near torso', gaze:'relaxed ambient gaze', tags:['drink'], families:['living-room','saudi-outdoor'] },
    { labelAR:'يقرأ', prompt:'reading something casually while seated', mechanics:'reading material supported at comfortable distance', gaze:'eyes focused on reading material', tags:['reading'], families:['living-room'] },
    { labelAR:'يستخدم لابتوب', prompt:'using a laptop casually', mechanics:'forearms and wrists supported near keyboard with torso oriented toward screen', gaze:'eyes focused on laptop screen', tags:['work','screen'], families:['living-room','military-base'] },
    { labelAR:'يتحدث مع شخص خارج الكادر', prompt:'speaking casually to someone just outside the frame', mechanics:'subtle conversational head turn and natural hand gesture without posing', gaze:'eyes directed toward the unseen conversation partner', tags:['conversation'], families:['living-room','military-base','saudi-outdoor'] }
  ],
  'saudi-outdoor': [
    { labelAR:'يمشي بهدوء', prompt:'walking at a relaxed everyday pace', mechanics:'natural alternating gait with mild arm swing and realistic step phase', gaze:'forward or slightly off-camera gaze', tags:['walking','motion'], families:['saudi-outdoor'] },
    { labelAR:'واقف على الرصيف', prompt:'standing casually on the sidewalk', mechanics:'feet grounded to pavement with natural weight shift', gaze:'ambient street gaze', tags:['standing','street'], families:['saudi-outdoor'] },
    { labelAR:'يقف بجانب مدخل', prompt:'standing beside an ordinary entrance', mechanics:'body positioned near door plane without blocking it unnaturally', gaze:'casual forward or side gaze', tags:['standing'], families:['saudi-outdoor','military-base'] },
    { labelAR:'ينتظر الطلب', prompt:'waiting casually for a café or shop order', mechanics:'relaxed standing or seated posture with small idle hand movement', gaze:'attention alternating between counter and surroundings', tags:['waiting','cafe'], families:['saudi-outdoor'] },
    { labelAR:'جالس في المقهى', prompt:'sitting naturally at a local café', mechanics:'hips supported by chair with table-edge occlusion where physically visible', gaze:'relaxed café gaze', tags:['seated','cafe'], families:['saudi-outdoor'] },
    { labelAR:'يمسك كوب قهوة', prompt:'holding a takeaway or café coffee cup naturally', mechanics:'cup supported close to torso with realistic wrist and finger load', gaze:'casual surrounding gaze', tags:['drink','cafe'], families:['saudi-outdoor'] },
    { labelAR:'يراقب الحركة', prompt:'quietly observing ordinary street activity', mechanics:'body mostly still with subtle head tracking', gaze:'eyes tracking background activity', tags:['ambient'], families:['saudi-outdoor'] },
    { labelAR:'ينتظر السيارة', prompt:'waiting casually for a car to arrive', mechanics:'standing near curb or pickup point with realistic spatial clearance', gaze:'looking intermittently toward the road', tags:['waiting','street'], families:['saudi-outdoor'] },
    { labelAR:'يعبر الممر', prompt:'walking through a pedestrian passage', mechanics:'mid-step body mechanics with grounded foot contact and natural arm counter-swing', gaze:'forward attention to path', tags:['walking','motion'], families:['saudi-outdoor'] },
    { labelAR:'يقف في طابور', prompt:'waiting naturally in a short queue', mechanics:'compact standing posture respecting personal space with subtle weight shift', gaze:'forward toward service point', tags:['waiting'], families:['saudi-outdoor'] }
  ],
  'military-base': [
    { labelAR:'واقف بثبات واعتزاز', prompt:'standing with calm dignified professional composure', mechanics:'upright posture with grounded feet and restrained shoulder tension, no theatrical stance', gaze:'steady professional gaze', tags:['standing','work'], families:['military-base'] },
    { labelAR:'عمل مكتبي', prompt:'performing ordinary administrative desk work', mechanics:'forearms naturally supported by desk with chair and desk occlusion', gaze:'attention on documents or screen', tags:['work','seated'], families:['military-base'] },
    { labelAR:'يراجع ملفًا', prompt:'reviewing an administrative file', mechanics:'file supported by desk or one hand with natural page handling', gaze:'eyes directed to file pages', tags:['work','reading'], families:['military-base'] },
    { labelAR:'يحمل أوراقًا', prompt:'carrying a small stack of work papers', mechanics:'papers supported against gravity with one forearm or hand', gaze:'forward corridor gaze', tags:['work','standing'], families:['military-base'] },
    { labelAR:'يدخل المكتب', prompt:'entering the office naturally', mechanics:'one foot advancing through doorway with torso following path', gaze:'attention inside room', tags:['walking','transition'], families:['military-base'] },
    { labelAR:'خارج من المكتب', prompt:'walking out of the office naturally', mechanics:'doorway traversal with realistic step and shoulder clearance', gaze:'attention toward corridor', tags:['walking','transition'], families:['military-base'] },
    { labelAR:'يقف في الممر', prompt:'standing casually in the corridor', mechanics:'feet grounded with corridor wall/door clearance', gaze:'alert but unposed corridor gaze', tags:['standing'], families:['military-base'] },
    { labelAR:'يمشي داخل المبنى', prompt:'walking naturally through the building', mechanics:'ordinary gait matched to corridor depth and floor contact', gaze:'forward path-focused gaze', tags:['walking','motion'], families:['military-base'] },
    { labelAR:'ينتظر موعدًا', prompt:'waiting quietly for an appointment or instruction', mechanics:'relaxed waiting posture with mild weight shift', gaze:'attention toward nearby doorway or corridor', tags:['waiting'], families:['military-base'] },
    { labelAR:'استراحة قصيرة', prompt:'taking a brief work break', mechanics:'reduced posture tension while maintaining ordinary workplace body mechanics', gaze:'relaxed off-task gaze', tags:['relaxed'], families:['military-base'] },
    { labelAR:'مناوبة', prompt:'on a routine administrative duty shift', mechanics:'upright attentive posture without theatrical combat stance', gaze:'calm alert gaze', tags:['work'], families:['military-base'] }
  ],
  'gym': [
    { labelAR:'قبل التمرين', prompt:'preparing casually before a workout', mechanics:'upright low-fatigue posture with hands near bottle, towel, or phone if visible', gaze:'focused but relaxed gaze', tags:['sport'], families:['gym'] },
    { labelAR:'يستريح بين الجولات', prompt:'resting naturally between exercise sets', mechanics:'body weight supported by bench or equipment with mild exertion posture', gaze:'downward or distant recovery gaze', tags:['sport','seated'], families:['gym'] },
    { labelAR:'بعد التمرين', prompt:'recovering immediately after a workout', mechanics:'mild post-exertion chest movement and relaxed shoulders', gaze:'tired but alert gaze', tags:['sport','fatigue'], families:['gym'] },
    { labelAR:'يلتقط أنفاسه', prompt:'catching his breath after exertion', mechanics:'subtle thoracic breathing expansion with slight shoulder movement', gaze:'soft recovery gaze', tags:['sport','fatigue'], families:['gym'] },
    { labelAR:'يمسح العرق', prompt:'wiping perspiration naturally', mechanics:'forearm reaches forehead or neck with believable elbow and shoulder range', gaze:'brief downward or closed-eye reaction', tags:['sport','task'], families:['gym'] },
    { labelAR:'يشرب ماء', prompt:'drinking water after exercise', mechanics:'bottle lifted with realistic grip and elbow flexion', gaze:'brief gaze toward bottle or ahead', tags:['sport','drink'], families:['gym'] },
    { labelAR:'يمسك منشفة', prompt:'holding a gym towel casually', mechanics:'towel hangs under gravity from relaxed hand or shoulder', gaze:'relaxed post-workout gaze', tags:['sport'], families:['gym'] },
    { labelAR:'يتمدد بخفة', prompt:'doing a light recovery stretch', mechanics:'gentle joint range without exaggerated flexibility or bodybuilding pose', gaze:'attention on stretch', tags:['sport','motion'], families:['gym'] }
  ],
  'car': [
    { labelAR:'خلف المقود والسيارة متوقفة', prompt:'sitting behind the steering wheel while the vehicle is fully stationary', mechanics:'seat-supported torso with natural steering-wheel clearance and no driving-motion pose', gaze:'road-ahead or brief lens glance', tags:['car','driver'], families:['car'] },
    { labelAR:'جالس بهدوء داخل السيارة', prompt:'sitting quietly inside the stationary vehicle', mechanics:'back supported by seat with relaxed hands and natural cabin contact', gaze:'relaxed cabin or exterior gaze', tags:['car','relaxed'], families:['car'] },
    { labelAR:'جالس في مقعد السائق', prompt:'sitting naturally in the driver seat while the vehicle is stationary', mechanics:'back supported by seat with steering-wheel clearance and grounded lower body', gaze:'natural lens, dashboard, or road-ahead gaze', tags:['car','driver'], families:['car'] },
    { labelAR:'جالس في مقعد الراكب', prompt:'sitting naturally in the front passenger seat', mechanics:'back supported by passenger seat with dashboard and door clearance', gaze:'relaxed forward or side-window gaze', tags:['car','passenger'], families:['car'] },
    { labelAR:'جالس في المقعد الخلفي', prompt:'sitting naturally in the rear seat', mechanics:'back supported by rear seat with front-seat occlusion in depth', gaze:'relaxed cabin gaze', tags:['car','rear'], families:['car'] },
    { labelAR:'ممسك المقود', prompt:'resting one or both hands naturally on the steering wheel while parked', mechanics:'hands contact steering wheel rim without crossing or floating through it', gaze:'road-ahead or brief camera gaze', tags:['car','driver'], families:['car'] },
    { labelAR:'متوقف عند الإشارة', prompt:'waiting inside the stationary car at a traffic signal', mechanics:'driver remains seated with realistic steering-wheel and seat contact', gaze:'attention mostly forward with brief selfie glance', tags:['car','driver','waiting'], families:['car'] },
    { labelAR:'ينتظر داخل السيارة', prompt:'waiting quietly inside the parked vehicle', mechanics:'relaxed seated posture supported by seat and armrest/console where visible', gaze:'ambient cabin or exterior gaze', tags:['car','waiting'], families:['car'] },
    { labelAR:'ينظر للطريق', prompt:'looking naturally toward the road through the windshield', mechanics:'head turns only slightly while torso remains seat-supported', gaze:'eyes focused through windshield', tags:['car','gaze'], families:['car'] },
    { labelAR:'متكئ قليلًا على المقعد', prompt:'leaning back slightly into the car seat', mechanics:'upper back and shoulders compress seat upholstery naturally', gaze:'relaxed lens or side gaze', tags:['car','relaxed'], families:['car'] },
    { labelAR:'يضع الذراع على الكونسول', prompt:'resting one forearm naturally on the center console', mechanics:'forearm receives real support from console with relaxed shoulder angle', gaze:'casual forward or lens gaze', tags:['car','contact'], families:['car'] }
  ]
};

const POSE_OPTIONS: Record<SceneFamilyId, string[]> = {
  'bedroom': [
    'واقف بثبات',
    'جالس على حافة السرير',
    'جالس على كرسي',
    'مستند على الجدار',
    'نصف مستلقٍ',
    'مستلقي على الظهر',
    'مستلقي على الجانب'
  ],
  'living-room': [
    'واقف بثبات',
    'جالس على الكنبة',
    'مسترخٍ على الكنبة',
    'مستند على طاولة',
    'جالس على كرسي',
    'مستند على الجدار'
  ],
  'saudi-outdoor': [
    'واقف بثبات',
    'يمشي بخطوات طبيعية',
    'مستند على جدار',
    'مستند بظهره على الجدار',
    'واقف بجانب مدخل',
    'جالس على كرسي',
    'جالس على مقعد خارجي'
  ],
  'military-base': [
    'واقف باستقامة',
    'واقف بثبات',
    'جالس خلف المكتب',
    'مستند بظهره على مكتب',
    'واقف في الممر',
    'جالس على كرسي انتظار',
    'يمشي في الممر'
  ],
  'gym': [
    'واقف بجانب الأجهزة',
    'جالس على مقعد التمرين',
    'يحمل زجاجة ماء',
    'مستند على جهاز',
    'واقف ممسكًا بزجاجة ماء',
    'جالس للاستراحة'
  ],
  'car': [
    'جالس باسترخاء في المقعد',
    'جالس في مقعد السائق',
    'جالس في مقعد الراكب',
    'جالس في المقعد الخلفي',
    'مستند على المقود',
    'متكئ على مسند المقعد'
  ]
};

export interface SceneRecommendations {
  activities: string[];
  poses: string[];
}

type SceneRecommendationRule = {
  family: SceneFamilyId;
  match: RegExp;
  activities: string[];
  poses: string[];
};

const FAMILY_SCENE_RECOMMENDATIONS: Record<SceneFamilyId, SceneRecommendations> = {
  'bedroom': {
    activities: ['جالس بهدوء', 'يستخدم الهاتف', 'يقرأ رسالة'],
    poses: ['واقف بثبات', 'جالس على حافة السرير', 'جالس على كرسي']
  },
  'living-room': {
    activities: ['جالس بهدوء', 'يشرب قهوة', 'يستخدم الهاتف'],
    poses: ['جالس على الكنبة', 'جالس على كرسي', 'واقف بثبات']
  },
  'saudi-outdoor': {
    activities: ['واقف بشكل طبيعي', 'يمشي بهدوء', 'يستخدم الهاتف'],
    poses: ['واقف بثبات', 'يمشي بخطوات طبيعية', 'واقف بجانب مدخل']
  },
  'gym': {
    activities: ['يستريح بين الجولات', 'يشرب ماء', 'بعد التمرين'],
    poses: ['واقف بجانب الأجهزة', 'جالس على مقعد التمرين', 'جالس للاستراحة']
  },
  'car': {
    activities: ['جالس بهدوء داخل السيارة', 'ينظر للطريق', 'يستخدم الهاتف'],
    poses: ['جالس باسترخاء في المقعد', 'جالس في مقعد السائق', 'متكئ على مسند المقعد']
  },
  'military-base': {
    activities: ['عمل مكتبي', 'يستخدم الهاتف', 'ينتظر'],
    poses: ['واقف باستقامة', 'جالس خلف المكتب', 'واقف بثبات']
  }
};

const SCENE_RECOMMENDATION_RULES: SceneRecommendationRule[] = [
  // Bedroom: furniture/contact surface drives the suggestion.
  { family: 'bedroom', match: /مستلق|مستلقي/, activities: ['مستلقي بشكل طبيعي', 'يقرأ رسالة', 'ينظر للهاتف'], poses: ['مستلقي على السرير', 'نصف مستلقٍ على السرير', 'جالس على حافة السرير'] },
  { family: 'bedroom', match: /حافة السرير|فوق السرير|بجانب السرير|أمام السرير|رأس السرير/, activities: ['جالس على حافة السرير', 'يقرأ رسالة', 'يستخدم الهاتف'], poses: ['جالس على حافة السرير', 'جالس فوق السرير', 'نصف مستلقٍ على السرير'] },
  { family: 'bedroom', match: /مرآة/, activities: ['يلتقط سيلفي', 'يراجع الصورة', 'يرتب أغراضه'], poses: ['واقف أمام المرآة', 'واقف بثبات'] },
  { family: 'bedroom', match: /كرسي/, activities: ['جالس بهدوء', 'يقرأ رسالة', 'يستخدم الهاتف'], poses: ['جالس على كرسي', 'واقف بجانب الكرسي'] },
  { family: 'bedroom', match: /دولاب/, activities: ['يرتب أغراضه', 'واقف فقط', 'ينظر للهاتف'], poses: ['واقف أمام الدولاب', 'واقف بجانب الدولاب'] },
  { family: 'bedroom', match: /ستائر|باب|جدار|زاوية|وسط الغرفة|بين السرير والدولاب/, activities: ['واقف بشكل طبيعي', 'ينظر حوله', 'يستخدم الهاتف'], poses: ['واقف بثبات', 'مستند على الجدار', 'واقف بجانب السرير'] },

  // Living room.
  { family: 'living-room', match: /كنبة/, activities: ['جالس على الكنبة', 'مسترخٍ على الكنبة', 'يشرب قهوة'], poses: ['جالس على الكنبة', 'مسترخٍ على الكنبة', 'جالس على طرف الكنبة'] },
  { family: 'living-room', match: /طاولة/, activities: ['يشرب قهوة', 'يستخدم لابتوب', 'يقرأ'], poses: ['جالس على كرسي أمام طاولة الصالة', 'مستند على طاولة', 'واقف بجانب طاولة الصالة'] },
  { family: 'living-room', match: /نافذة|ستارة/, activities: ['ينظر بعيدًا', 'يشرب قهوة', 'يستخدم الهاتف'], poses: ['واقف بجانب النافذة', 'جالس على كرسي', 'واقف بثبات'] },
  { family: 'living-room', match: /كرسي منفرد/, activities: ['جالس بهدوء', 'يقرأ', 'يستخدم الهاتف'], poses: ['جالس على كرسي', 'واقف بجانب الكرسي'] },
  { family: 'living-room', match: /تلفاز/, activities: ['جالس بهدوء', 'يستخدم الهاتف', 'ينظر حوله'], poses: ['جالس على الكنبة', 'جالس على كرسي', 'واقف بثبات'] },
  { family: 'living-room', match: /مدخل|باب|ممر|منتصف|زاوية|جدار|تكييف/, activities: ['واقف بشكل طبيعي', 'يمشي بهدوء', 'يستخدم الهاتف'], poses: ['واقف بثبات', 'يمشي بخطوات طبيعية', 'مستند على الجدار'] },

  // Ordinary Saudi places.
  { family: 'saudi-outdoor', match: /مقهى/, activities: ['جالس في المقهى', 'يمسك كوب قهوة', 'ينتظر الطلب'], poses: ['جالس على كرسي أمام طاولة المقهى', 'جالس على كرسي', 'واقف بجانب مدخل المقهى'] },
  { family: 'saudi-outdoor', match: /محلات|بقالة|خدمات/, activities: ['ينتظر الطلب', 'يستخدم الهاتف', 'ينظر حوله'], poses: ['واقف بجانب المدخل', 'واقف بثبات', 'جالس على كرسي انتظار'] },
  { family: 'saudi-outdoor', match: /مدخل فيلا|سور منزل|أمام سور/, activities: ['واقف بشكل طبيعي', 'يستخدم الهاتف', 'ينظر بعيدًا'], poses: ['واقف بجانب مدخل', 'مستند بظهره على الجدار', 'واقف بثبات'] },
  { family: 'saudi-outdoor', match: /موقف|مظلل/, activities: ['ينتظر السيارة', 'يستخدم الهاتف', 'ينظر حوله'], poses: ['واقف بثبات', 'واقف بجانب سيارة متوقفة', 'يمشي بخطوات طبيعية'] },
  { family: 'saudi-outdoor', match: /حديقة|ممشى|ساحة/, activities: ['يمشي بهدوء', 'ينظر حوله', 'يستخدم الهاتف'], poses: ['يمشي بخطوات طبيعية', 'جالس على مقعد خارجي', 'واقف بثبات'] },
  { family: 'saudi-outdoor', match: /شارع|رصيف|طريق|ممر جانبي/, activities: ['يمشي بهدوء', 'واقف على الرصيف', 'يراقب الحركة'], poses: ['يمشي بخطوات طبيعية', 'واقف بثبات', 'مستند بظهره على الجدار'] },
  { family: 'saudi-outdoor', match: /منطقة انتظار/, activities: ['ينتظر', 'يقرأ رسالة', 'يستخدم الهاتف'], poses: ['جالس على كرسي انتظار', 'واقف بثبات'] },

  // Gym.
  { family: 'gym', match: /مرآة/, activities: ['يلتقط سيلفي', 'يراجع الصورة', 'بعد التمرين'], poses: ['واقف أمام المرآة', 'واقف بجانب المرآة'] },
  { family: 'gym', match: /مقعد تمارين|استراحة/, activities: ['يستريح بين الجولات', 'يشرب ماء', 'يلتقط أنفاسه'], poses: ['جالس على مقعد التمرين', 'جالس للاستراحة', 'واقف بجانب الأجهزة'] },
  { family: 'gym', match: /أثقال|دمبل|جهاز|تمارين حرة|معدات/, activities: ['قبل التمرين', 'يستريح بين الجولات', 'بعد التمرين'], poses: ['واقف بجانب الأجهزة', 'مستند على جهاز', 'جالس على مقعد التمرين'] },
  { family: 'gym', match: /إحماء|تمدد/, activities: ['يتمدد بخفة', 'قبل التمرين', 'يلتقط أنفاسه'], poses: ['واقف بجانب الأجهزة', 'جالس للاستراحة'] },
  { family: 'gym', match: /خزائن|غرفة الملابس|مدخل|نافذة|ممر/, activities: ['يشرب ماء', 'يمسك منشفة', 'يستخدم الهاتف'], poses: ['واقف بثبات', 'جالس للاستراحة', 'واقف ممسكًا بزجاجة ماء'] },

  // Vehicle: distinguish cabin seats from exterior positions.
  { family: 'car', match: /مقعد السائق|أمام المقود|قرب النافذة|الباب مغلق|الباب مفتوح/, activities: ['جالس في مقعد السائق', 'ممسك المقود', 'ينظر للطريق'], poses: ['جالس في مقعد السائق', 'مستند على المقود', 'متكئ على مسند المقعد'] },
  { family: 'car', match: /المقعد الأمامي للراكب/, activities: ['جالس في مقعد الراكب', 'يستخدم الهاتف', 'ينظر للطريق'], poses: ['جالس في مقعد الراكب', 'جالس باسترخاء في المقعد', 'متكئ على مسند المقعد'] },
  { family: 'car', match: /المقعد الخلفي|بين المقعدين/, activities: ['جالس في المقعد الخلفي', 'يقرأ رسالة', 'ينظر للطريق'], poses: ['جالس في المقعد الخلفي', 'جالس باسترخاء في المقعد'] },
  { family: 'car', match: /بجانب السيارة|باب السائق|أمام السيارة|الرفرف|الجزء الخلفي|صندوق السيارة|موقف|رصيف|سور/, activities: ['واقف بشكل طبيعي', 'يستخدم الهاتف', 'ينظر حوله'], poses: ['واقف بجانب السيارة', 'واقف عند باب السائق', 'مستند بخفة على السيارة'] },

  // Military workplace: make furniture/contact explicit instead of generic.
  { family: 'military-base', match: /غرفة اجتماعات|طاولة الاجتماعات/, activities: ['يراجع ملفًا', 'ينتظر', 'يتحدث مع شخص خارج الكادر'], poses: ['جالس على كرسي أمام طاولة الاجتماعات', 'واقف بجانب طاولة الاجتماعات', 'واقف باستقامة'] },
  { family: 'military-base', match: /منطقة انتظار|كراسي انتظار/, activities: ['ينتظر موعدًا', 'يقرأ رسالة', 'يستخدم الهاتف'], poses: ['جالس على كرسي انتظار', 'واقف بجانب كراسي الانتظار', 'واقف بثبات'] },
  { family: 'military-base', match: /خلف مكتب العمل|مكتب إداري|مكتب موظف|مكتب مشترك|مكتب جانبي|بجانب مكتب العمل/, activities: ['عمل مكتبي', 'يراجع ملفًا', 'يستخدم الهاتف'], poses: ['جالس على كرسي المكتب أمام سطح المكتب', 'جالس خلف المكتب', 'واقف بجانب المكتب'] },
  { family: 'military-base', match: /ممر/, activities: ['يمشي داخل المبنى', 'يقف في الممر', 'يستخدم الهاتف'], poses: ['يمشي في الممر', 'واقف في الممر', 'واقف بثبات'] },
  { family: 'military-base', match: /درج|بسطة|درابزين/, activities: ['يمشي داخل المبنى', 'ينتظر', 'ينظر حوله'], poses: ['واقف عند درابزين الدرج', 'يمشي على الدرج', 'واقف بثبات'] },
  { family: 'military-base', match: /موقف|سيارة متوقفة|صفوف السيارات/, activities: ['ينتظر السيارة', 'يستخدم الهاتف', 'ينظر حوله'], poses: ['واقف بجانب سيارة متوقفة', 'يمشي بين صفوف السيارات', 'واقف بثبات'] },
  { family: 'military-base', match: /استراحة|قهوة|شاي/, activities: ['استراحة قصيرة', 'يشرب قهوة', 'يستخدم الهاتف'], poses: ['جالس على كرسي الاستراحة', 'واقف بجانب ركن القهوة', 'واقف بثبات'] },
  { family: 'military-base', match: /باب|مدخل|واجهة|رصيف|ساحة|جانب المبنى|سور/, activities: ['ينتظر', 'واقف فقط', 'يستخدم الهاتف'], poses: ['واقف بجانب المدخل', 'واقف باستقامة', 'واقف بثبات'] }
];

const uniqueStrings = (items: string[]): string[] => [...new Set(items.filter(Boolean))];

export function getSceneRecommendations(familyId: SceneFamilyId, subScene = ''): SceneRecommendations {
  const microLoc = subScene ? getMicroLocation(familyId, subScene) : undefined;
  const rule = SCENE_RECOMMENDATION_RULES.find(item => item.family === familyId && item.match.test(subScene));
  const fallback = FAMILY_SCENE_RECOMMENDATIONS[familyId];

  return {
    activities: uniqueStrings([
      ...(rule?.activities || []),
      ...(microLoc?.recommendedActivities || []),
      ...fallback.activities
    ]).slice(0, 5),
    poses: uniqueStrings([
      ...(rule?.poses || []),
      ...(microLoc?.recommendedPoses || []),
      ...fallback.poses
    ]).slice(0, 5)
  };
}

export function getActivityOptions(familyId: SceneFamilyId, subScene = ''): ActivityDefinition[] {
  const base = [...COMMON_ACTIVITIES.filter(item => item.families.includes(familyId)), ...FAMILY_ACTIVITIES[familyId]];
  const recommended = getSceneRecommendations(familyId, subScene).activities.map(labelAR => {
    const definition = getActivityDefinition(labelAR);
    return definition.families.length > 0 ? definition : { ...definition, families: [familyId] };
  });

  const seen = new Set<string>();
  return [...recommended, ...base].filter(item => {
    if (seen.has(item.labelAR)) return false;
    seen.add(item.labelAR);
    return true;
  });
}

export function getActivityDefinition(activity: string): ActivityDefinition {
  const all = [...COMMON_ACTIVITIES, ...Object.values(FAMILY_ACTIVITIES).flat()];
  return all.find(item => item.labelAR === activity) ?? {
    labelAR: activity || 'نشاط طبيعي',
    prompt: activity ? `performing the selected activity naturally: ${activity}` : 'resting naturally without a staged action',
    mechanics: 'body mechanics remain anatomically plausible and consistent with the selected pose and contact surfaces',
    gaze: 'natural unforced gaze appropriate to the activity',
    tags: [],
    families: []
  };
}

export function getPoseOptions(familyId: SceneFamilyId, subScene = ''): string[] {
  const recommended = getSceneRecommendations(familyId, subScene).poses;
  return uniqueStrings([...recommended, ...(POSE_OPTIONS[familyId] ?? ['واقف بثبات'])]);
}

export function getOutfitCapabilities(outfit?: OutfitItem): OutfitCapabilities {
  const text = `${outfit?.id || ''} ${outfit?.labelAR || ''} ${outfit?.prompt || ''} ${outfit?.promptDescription || ''}`.toLowerCase();

  const isTee = /t-shirt|\btee\b|تيشيرت/.test(text);
  const isShirt = !isTee && /shirt|button-up|button-down|oxford|قميص/.test(text);
  const isThobe = /thobe|ثوب/.test(text);
  const isHoodie = /hoodie|هودي/.test(text);
  const isOuterwear = /jacket|blazer|coat|bisht|farwa|جاكيت|بليزر|بشت|فروة/.test(text);

  return {
    isShirt,
    isThobe,
    isTee,
    isOuterwear,
    isHoodie,
    supportsTuck: isShirt,
    supportsSleeves: isShirt || isThobe,
    supportsShirtButtons: isShirt,
    supportsCollar: isShirt,
    supportsOuterwearClosure: isOuterwear,
    supportsHood: isHoodie,
    supportsThobeCollar: isThobe
  };
}

const wearStylePrompt: Record<OutfitWearStyle, string> = {
  'natural-neat': 'worn in a naturally neat everyday way, tidy but not over-styled',
  'very-neat': 'carefully arranged and very neat with deliberate clean alignment',
  'casual-relaxed': 'worn casually with mild natural asymmetry and relaxed drape',
  comfortable: 'worn for comfort with relaxed ease and no artificial tailoring tension',
  formal: 'worn in a restrained formal manner with clean alignment and controlled drape',
  'home-relaxed': 'worn in a relaxed at-home manner with soft natural looseness',
  sporty: 'worn functionally for movement with practical ease and natural athletic drape'
};

const wearContextPrompt: Record<Exclude<GarmentWearContext, 'auto'>, string> = {
  neutral: 'neutral garment state with ordinary gravity drape',
  'after-sitting': 'subtle compression folds at hips, waist, elbows, and lower torso from recent sitting',
  'after-walking': 'small movement-set folds and slight hem displacement from recent walking',
  'post-workout': 'mild post-workout fabric adhesion and localized moisture only where physically plausible',
  'light-breeze': 'loose fabric edges displaced slightly by a gentle breeze',
  'light-sweat': 'very light localized perspiration darkening at realistic high-contact areas without soaking the garment'
};

export function inferGarmentWearContext(activity: string): Exclude<GarmentWearContext, 'auto'> {
  const definition = getActivityDefinition(activity);
  if (definition.tags.includes('sport') || definition.tags.includes('fatigue')) return 'post-workout';
  if (definition.tags.includes('walking') || definition.tags.includes('motion') || definition.tags.includes('transition')) return 'after-walking';
  if (definition.tags.includes('seated') || definition.tags.includes('reclined')) return 'after-sitting';
  return 'neutral';
}

export function getAttireAwareOutfitPrompt(
  outfit: OutfitItem | undefined,
  controls: AttireControls
): string {
  let base = outfit?.prompt || '';

  if (controls.shirtButtons && controls.shirtButtons !== 'auto') {
    base = base
      .replace(/\bopen-collar\b/gi, '')
      .replace(/\bunbuttoned at neck\b/gi, '')
      .replace(/\bopen relaxed dress shirt collar\b/gi, 'dress shirt collar');
  }

  if (
    controls.outerwearClosure &&
    controls.outerwearClosure !== 'auto' &&
    controls.outerwearClosure !== 'open'
  ) {
    base = base.replace(/\bworn open\b/gi, 'worn');
  }

  return base.replace(/\s{2,}/g, ' ').trim();
}

export function getAttireAwareBasePhysics(
  outfit: OutfitItem | undefined,
  controls: AttireControls
): string[] {
  const base = [...(outfit?.physics || [])];

  return base.filter(rule => {
    if (controls.shirtButtons && controls.shirtButtons !== 'auto' && /open.*collar|unbutton/i.test(rule)) {
      return false;
    }
    if (controls.hoodPosition === 'up' && /hood resting|hood.*neck/i.test(rule)) {
      return false;
    }
    if (
      controls.outerwearClosure &&
      controls.outerwearClosure !== 'auto' &&
      controls.outerwearClosure !== 'open' &&
      /open.*jacket|worn open/i.test(rule)
    ) {
      return false;
    }
    return true;
  });
}

export function describeAttireControls(
  outfit: OutfitItem | undefined,
  controls: AttireControls & { activity?: string }
): { prompt: string; physics: string[]; resolvedWearContext: Exclude<GarmentWearContext, 'auto'> } {
  const capabilities = getOutfitCapabilities(outfit);
  const resolvedWearContext =
    !controls.garmentWearContext || controls.garmentWearContext === 'auto'
      ? inferGarmentWearContext(controls.activity || '')
      : controls.garmentWearContext;

  const prompt: string[] = [
    wearStylePrompt[controls.outfitWearStyle ?? 'natural-neat'],
    wearContextPrompt[resolvedWearContext]
  ];
  const physics: string[] = [];

  if (capabilities.supportsTuck && controls.shirtTuck && controls.shirtTuck !== 'auto') {
    const map: Record<Exclude<ShirtTuck,'auto'>, string> = {
      tucked: 'shirt tucked naturally into the trousers around the full waistband',
      untucked: 'shirt worn untucked with the hem hanging naturally over the trousers',
      'half-tuck': 'shirt worn with a restrained half-tuck, one front section tucked while the rest falls naturally'
    };
    prompt.push(map[controls.shirtTuck]);
    physics.push('shirt hem and waistband interaction must match the selected tuck state without clipping');
  }

  if (capabilities.supportsSleeves && controls.sleeveStyle && controls.sleeveStyle !== 'auto') {
    const map: Record<Exclude<SleeveStyle,'auto'>, string> = {
      down: 'sleeves worn fully down to the wrists',
      'rolled-once': 'sleeves turned up once with a single natural cuff fold',
      'rolled-forearm': 'sleeves rolled naturally to mid-forearm with irregular realistic fold thickness'
    };
    prompt.push(map[controls.sleeveStyle]);
    physics.push('sleeve folds must follow elbow flexion and forearm volume');
  }

  if (capabilities.supportsShirtButtons && controls.shirtButtons && controls.shirtButtons !== 'auto') {
    const map: Record<Exclude<ShirtButtons,'auto'>, string> = {
      'fully-buttoned': 'shirt fully buttoned at the front',
      'top-one-open': 'shirt with exactly the top button open',
      'top-two-open': 'shirt with exactly the top two buttons open'
    };
    prompt.push(map[controls.shirtButtons]);
    physics.push('shirt placket opening and collar spread must physically match the selected number of open buttons');
  }

  if (capabilities.supportsCollar && controls.collarStyle && controls.collarStyle !== 'auto') {
    prompt.push(
      controls.collarStyle === 'neat'
        ? 'collar sitting neatly and symmetrically around the neck'
        : 'collar resting casually with slight natural asymmetry'
    );
  }

  if (capabilities.supportsOuterwearClosure && controls.outerwearClosure && controls.outerwearClosure !== 'auto') {
    const map: Record<Exclude<OuterwearClosure,'auto'>, string> = {
      open: 'outer layer worn open, revealing the underlying garment naturally',
      closed: 'outer layer worn closed in its normal fastening configuration',
      'half-open': 'outer layer worn partially open with a natural incomplete closure'
    };
    prompt.push(map[controls.outerwearClosure]);
    physics.push('outerwear front panels, lapels, zipper/buttons, and gravity drape must match closure state');
  }

  if (capabilities.supportsHood && controls.hoodPosition && controls.hoodPosition !== 'auto') {
    prompt.push(controls.hoodPosition === 'up' ? 'hood worn up naturally around the head' : 'hood resting down behind the neck and shoulders');
    physics.push('hood fabric must contact head/neck/shoulders according to selected position');
  }

  if (capabilities.supportsThobeCollar && controls.thobeCollar && controls.thobeCollar !== 'auto') {
    prompt.push(
      controls.thobeCollar === 'closed'
        ? 'thobe collar closed neatly'
        : 'thobe collar opened slightly at the neck in a restrained everyday manner'
    );
    physics.push('thobe collar opening must remain consistent with front placket geometry');
  }

  return {
    prompt: prompt.join('; '),
    physics,
    resolvedWearContext
  };
}
