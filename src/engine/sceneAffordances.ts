import { getMicroLocation, type SceneFamilyId } from '../data/microLocations';

export type Stance = 'standing' | 'sitting' | 'lying' | 'reclined' | 'walking';

export interface PoseSuggestion {
  id: string;
  labelAR: string;
  stance: Stance;
  supportSurface?: string;
  contactObject?: string;
  action: string;
  physics: string;
  promptAddon: string;
}

export interface MicroPhysicsState {
  stance: Stance;
  poseSuggestion: PoseSuggestion;
  fabricTension: string[];
  contactPhysics: string[];
  eyeConvergence: string;
  sensorArtifacts: string[];
  realismGuards: string[];
}

type PoseRule = {
  family: SceneFamilyId;
  match: RegExp;
  suggestions: PoseSuggestion[];
};

type MicroPhysicsInput = {
  familyId: SceneFamilyId;
  subScene: string;
  pose: string;
  captureType: 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
  timeOfDay: string;
  lightingIntensity?: number;
};

const pose = (
  id: string,
  labelAR: string,
  stance: Stance,
  supportSurface: string | undefined,
  contactObject: string | undefined,
  action: string,
  physics: string,
  promptAddon: string
): PoseSuggestion => ({
  id,
  labelAR,
  stance,
  supportSurface,
  contactObject,
  action,
  physics,
  promptAddon
});

const FAMILY_FALLBACKS: Record<SceneFamilyId, PoseSuggestion[]> = {
  bedroom: [
    pose(
      'bedroom_stand',
      'واقف بثبات',
      'standing',
      'bedroom floor',
      undefined,
      'standing naturally',
      'both feet grounded on the bedroom floor with a small natural left-right weight asymmetry',
      'standing naturally on the bedroom floor with relaxed knees and ordinary weight distribution'
    ),
    pose(
      'bedroom_bed_edge',
      'جالس على حافة السرير',
      'sitting',
      'mattress edge',
      'bed',
      'sitting quietly',
      'pelvis compresses the mattress edge, feet remain grounded, knees flex naturally, and the bed edge occludes the upper thighs',
      'sitting naturally on the mattress edge with visible mattress compression, grounded feet, bent knees, and realistic bedding displacement'
    )
  ],
  'living-room': [
    pose(
      'living_sofa_sit',
      'جالس على الكنبة',
      'sitting',
      'sofa cushion',
      'sofa',
      'sitting casually',
      'hips and back are supported by the sofa with localized cushion compression and asymmetric relaxed posture',
      'sitting naturally on the sofa with believable cushion compression under the hips and back'
    ),
    pose(
      'living_stand',
      'واقف بثبات',
      'standing',
      'living-room floor',
      undefined,
      'standing naturally',
      'feet remain grounded with relaxed knees and no mannequin symmetry',
      'standing naturally in the living room with grounded feet and relaxed asymmetrical posture'
    )
  ],
  'saudi-outdoor': [
    pose(
      'outdoor_stand',
      'واقف بثبات',
      'standing',
      'pavement',
      undefined,
      'standing naturally',
      'both feet contact the pavement with a mild weight shift and realistic shoe-ground contact shadows',
      'standing naturally on ordinary pavement with grounded feet, slight weight asymmetry, and realistic contact shadows'
    ),
    pose(
      'outdoor_walk',
      'يمشي بخطوات طبيعية',
      'walking',
      'pavement',
      undefined,
      'walking casually',
      'one foot is load-bearing while the other advances, with natural counter-swing of the arms and no frozen runway pose',
      'walking at an ordinary everyday pace with realistic gait phase, grounded foot contact, and restrained arm swing'
    )
  ],
  gym: [
    pose(
      'gym_bench_sit',
      'جالس على مقعد التمرين',
      'sitting',
      'gym bench',
      'training bench',
      'resting between sets',
      'pelvis is supported by the bench, feet are planted, torso relaxes slightly forward, and the bench remains correctly occluded by the body',
      'sitting naturally on a gym bench between sets with planted feet, supported pelvis, and mild post-exertion posture'
    ),
    pose(
      'gym_equipment_stand',
      'واقف بجانب الأجهزة',
      'standing',
      'gym floor',
      'nearby exercise equipment',
      'standing beside equipment',
      'feet remain clear of equipment bases and cables while the torso stays naturally upright',
      'standing naturally beside gym equipment with realistic floor contact and safe clearance from machine frames and cables'
    )
  ],
  car: [
    pose(
      'car_driver_sit',
      'جالس في مقعد السائق',
      'sitting',
      'driver seat',
      'steering wheel',
      'sitting in the stationary driver seat',
      'back and pelvis are supported by the driver seat, knees remain below the steering rim, and hands never intersect the wheel or dashboard',
      'sitting naturally in the stationary driver seat with seat-supported torso, realistic steering-wheel clearance, and correct dashboard occlusion'
    ),
    pose(
      'car_passenger_sit',
      'جالس في مقعد الراكب',
      'sitting',
      'front passenger seat',
      'dashboard',
      'sitting in the front passenger seat',
      'back and pelvis are supported by the passenger seat with natural door, dashboard, and footwell clearance',
      'sitting naturally in the front passenger seat with believable seat support and dashboard clearance'
    )
  ],
  'military-base': [
    pose(
      'workplace_stand',
      'واقف باستقامة',
      'standing',
      'institutional floor',
      undefined,
      'standing professionally',
      'feet remain grounded with restrained upright posture and no theatrical or combat stance',
      'standing naturally with calm professional posture, grounded feet, and ordinary workplace body mechanics'
    ),
    pose(
      'workplace_desk_sit',
      'جالس خلف المكتب',
      'sitting',
      'office chair',
      'administrative desk',
      'doing routine desk work',
      'pelvis and back are supported by the chair, forearms stay near the desk surface, and the desk correctly occludes the waist and lap',
      'sitting naturally behind an ordinary administrative desk with chair support, forearms near the tabletop, and physically correct desk occlusion'
    )
  ]
};

const RULES: PoseRule[] = [
  // Bedroom.
  {
    family: 'bedroom',
    match: /مستلق|مستلقي/,
    suggestions: [
      pose(
        'bedroom_lying',
        'مستلقي على السرير',
        'lying',
        'mattress',
        'pillow and bedding',
        'resting flat on the bed',
        'head weight deforms the pillow, torso and hips compress the mattress, and bedding folds redirect around the body mass',
        'lying naturally on the bed with head sinking into the pillow, mattress compression under torso and hips, and physically displaced bedding'
      ),
      pose(
        'bedroom_reclined',
        'نصف مستلقٍ على السرير',
        'reclined',
        'mattress and pillows',
        'headboard-side pillows',
        'resting semi-reclined',
        'upper back is supported by pillows while hips remain loaded into the mattress, producing realistic spine and hip angles',
        'resting in a semi-reclined position with upper back supported by pillows and hips visibly loading the mattress'
      )
    ]
  },
  {
    family: 'bedroom',
    match: /حافة السرير|فوق السرير|بجانب السرير|أمام السرير|رأس السرير/,
    suggestions: [
      FAMILY_FALLBACKS.bedroom[1],
      pose(
        'bedroom_bed_sit',
        'جالس فوق السرير',
        'sitting',
        'mattress',
        'bedding',
        'sitting casually on the bed',
        'body weight compresses the mattress beneath the pelvis and bedding bunches around the thighs',
        'sitting casually on the bed with localized mattress compression and natural bedding folds around the legs'
      ),
      pose(
        'bedroom_bedside_stand',
        'واقف بجانب السرير',
        'standing',
        'bedroom floor',
        'bed edge',
        'standing beside the bed',
        'feet remain on the floor with believable clearance from the mattress edge',
        'standing naturally beside the bed with correct floor contact and realistic clearance from the mattress edge'
      )
    ]
  },
  {
    family: 'bedroom',
    match: /مرآة/,
    suggestions: [
      pose(
        'bedroom_mirror_stand',
        'واقف أمام المرآة',
        'standing',
        'bedroom floor',
        'mirror plane',
        'taking or checking a mirror selfie',
        'body remains in front of the mirror plane while the phone and reflected anatomy obey one consistent reflection geometry',
        'standing naturally in front of a flat mirror with physically consistent phone, hand, body, and reflection alignment'
      ),
      FAMILY_FALLBACKS.bedroom[0]
    ]
  },
  {
    family: 'bedroom',
    match: /كرسي/,
    suggestions: [
      pose(
        'bedroom_chair_sit',
        'جالس على كرسي',
        'sitting',
        'bedroom chair',
        'chair backrest',
        'sitting quietly',
        'pelvis is centered on the seat, backrest contact is plausible, and feet remain grounded with realistic knee angle',
        'sitting naturally on the bedroom chair with supported pelvis, believable backrest contact, and grounded feet'
      ),
      pose(
        'bedroom_chair_stand',
        'واقف بجانب الكرسي',
        'standing',
        'bedroom floor',
        'chair',
        'standing beside the chair',
        'body remains clear of chair legs and seat while one arm may rest nearby without floating contact',
        'standing naturally beside the chair with realistic clearance from its seat and legs'
      )
    ]
  },

  // Living room.
  {
    family: 'living-room',
    match: /كنبة/,
    suggestions: [
      FAMILY_FALLBACKS['living-room'][0],
      pose(
        'living_sofa_relaxed',
        'مسترخٍ على الكنبة',
        'reclined',
        'sofa cushion and backrest',
        'sofa',
        'relaxing on the sofa',
        'back and shoulders sink into the backrest while hips compress the seat cushion asymmetrically',
        'relaxing naturally into the sofa with realistic cushion compression under the hips, back, and shoulder'
      )
    ]
  },
  {
    family: 'living-room',
    match: /طاولة/,
    suggestions: [
      pose(
        'living_table_sit',
        'جالس على كرسي أمام طاولة الصالة',
        'sitting',
        'chair',
        'living-room table',
        'sitting at the table',
        'chair supports the pelvis while forearms can approach the tabletop without elbow or wrist intersection',
        'sitting naturally on a chair in front of the living-room table with realistic tabletop clearance and forearm placement'
      ),
      pose(
        'living_table_lean',
        'مستند على طاولة',
        'standing',
        'floor',
        'table edge',
        'leaning lightly on the table',
        'only a small fraction of upper-body weight transfers through one forearm or hand to the table edge',
        'standing beside the table with a light believable forearm or hand lean, without excessive body weight loading the furniture'
      )
    ]
  },
  {
    family: 'living-room',
    match: /كرسي منفرد/,
    suggestions: [
      pose(
        'living_chair_sit',
        'جالس على كرسي',
        'sitting',
        'single chair',
        'chair backrest',
        'sitting casually',
        'pelvis and back are supported by the chair and both feet remain naturally grounded',
        'sitting naturally on the single chair with correct seat support, backrest contact, and grounded feet'
      ),
      FAMILY_FALLBACKS['living-room'][1]
    ]
  },

  // Saudi everyday outdoor places.
  {
    family: 'saudi-outdoor',
    match: /مقهى/,
    suggestions: [
      pose(
        'cafe_table_sit',
        'جالس على كرسي أمام طاولة المقهى',
        'sitting',
        'cafe chair',
        'cafe table',
        'sitting casually at the table',
        'pelvis is supported by the chair, forearms can rest near the tabletop, and the table edge naturally occludes part of the lower torso',
        'sitting naturally on a cafe chair in front of a small table, with believable forearm placement and correct table-edge occlusion'
      ),
      pose(
        'cafe_chair_sit',
        'جالس على كرسي',
        'sitting',
        'cafe chair',
        'table edge',
        'sitting casually',
        'chair supports body weight while legs fit beneath or beside the table without intersecting furniture',
        'sitting casually on a cafe chair with grounded feet and realistic leg clearance around the table'
      ),
      pose(
        'cafe_entrance_stand',
        'واقف بجانب مدخل المقهى',
        'standing',
        'pavement',
        'cafe entrance',
        'waiting near the entrance',
        'feet remain clear of the door swing and pedestrian path',
        'standing casually beside the cafe entrance without blocking the doorway or pedestrian path'
      )
    ]
  },
  {
    family: 'saudi-outdoor',
    match: /موقف|مظلل/,
    suggestions: [
      pose(
        'parking_car_stand',
        'واقف بجانب سيارة متوقفة',
        'standing',
        'parking pavement',
        'parked car',
        'standing beside a parked car',
        'body remains outside the vehicle envelope with realistic door and mirror clearance and grounded contact shadows',
        'standing naturally beside a parked car with believable clearance from the door, mirror, and bodywork'
      ),
      FAMILY_FALLBACKS['saudi-outdoor'][0],
      FAMILY_FALLBACKS['saudi-outdoor'][1]
    ]
  },
  {
    family: 'saudi-outdoor',
    match: /حديقة|ممشى|ساحة/,
    suggestions: [
      FAMILY_FALLBACKS['saudi-outdoor'][1],
      pose(
        'outdoor_bench_sit',
        'جالس على مقعد خارجي',
        'sitting',
        'outdoor bench',
        'bench back or seat',
        'resting briefly',
        'pelvis is supported by the bench with grounded feet and natural knee spacing',
        'sitting naturally on an outdoor bench with believable seat support, grounded feet, and ordinary relaxed posture'
      ),
      FAMILY_FALLBACKS['saudi-outdoor'][0]
    ]
  },
  {
    family: 'saudi-outdoor',
    match: /سور|جدار/,
    suggestions: [
      pose(
        'outdoor_wall_lean',
        'مستند بظهره على الجدار',
        'standing',
        'pavement',
        'wall',
        'leaning lightly against the wall',
        'upper back or one shoulder makes broad low-pressure wall contact while both feet remain load-bearing',
        'standing with a light natural back or shoulder lean against the wall while both feet continue to carry most body weight'
      ),
      FAMILY_FALLBACKS['saudi-outdoor'][0]
    ]
  },
  {
    family: 'saudi-outdoor',
    match: /شارع|رصيف|طريق|ممر جانبي/,
    suggestions: [
      FAMILY_FALLBACKS['saudi-outdoor'][1],
      FAMILY_FALLBACKS['saudi-outdoor'][0]
    ]
  },

  // Gym.
  {
    family: 'gym',
    match: /مقعد تمارين|استراحة/,
    suggestions: [
      FAMILY_FALLBACKS.gym[0],
      pose(
        'gym_rest_sit',
        'جالس للاستراحة',
        'sitting',
        'rest bench or chair',
        undefined,
        'resting after exertion',
        'body weight is fully supported and shoulders settle naturally after exercise',
        'sitting naturally for a short gym rest with supported body weight and mild post-exertion posture'
      )
    ]
  },
  {
    family: 'gym',
    match: /أثقال|دمبل|جهاز|تمارين حرة|معدات/,
    suggestions: [
      FAMILY_FALLBACKS.gym[1],
      pose(
        'gym_equipment_lean',
        'مستند على جهاز',
        'standing',
        'gym floor',
        'exercise machine frame',
        'leaning lightly on equipment',
        'one forearm or hand makes light contact with a stable machine frame while feet remain load-bearing and clear of moving components',
        'standing beside a stable exercise machine with a light hand or forearm lean and safe clearance from moving parts'
      ),
      FAMILY_FALLBACKS.gym[0]
    ]
  },
  {
    family: 'gym',
    match: /مرآة/,
    suggestions: [
      pose(
        'gym_mirror_stand',
        'واقف أمام المرآة',
        'standing',
        'gym floor',
        'mirror plane',
        'taking or reviewing a mirror selfie',
        'phone, reflected hand, face, and body share one physically consistent mirror geometry',
        'standing naturally in front of the gym mirror with optically consistent phone and body reflection geometry'
      ),
      FAMILY_FALLBACKS.gym[1]
    ]
  },

  // Vehicle interior versus exterior.
  {
    family: 'car',
    match: /مقعد السائق|أمام المقود|قرب النافذة|الباب مغلق/,
    suggestions: [
      FAMILY_FALLBACKS.car[0],
      pose(
        'car_driver_wheel',
        'مستند على المقود',
        'sitting',
        'driver seat',
        'steering wheel',
        'resting lightly near the steering wheel while parked',
        'seat carries body weight; only forearms or hands contact the steering wheel, never the torso',
        'sitting in the parked driver seat with seat-supported body weight and only light hand or forearm contact on the steering wheel'
      )
    ]
  },
  {
    family: 'car',
    match: /المقعد الأمامي للراكب/,
    suggestions: [
      FAMILY_FALLBACKS.car[1],
      pose(
        'car_passenger_relaxed',
        'جالس باسترخاء في المقعد',
        'sitting',
        'front passenger seat',
        'door armrest',
        'sitting relaxed',
        'seat and backrest support the body while one forearm may rest naturally on the door armrest',
        'sitting relaxed in the passenger seat with natural backrest support and optional forearm contact on the door armrest'
      )
    ]
  },
  {
    family: 'car',
    match: /المقعد الخلفي|بين المقعدين/,
    suggestions: [
      pose(
        'car_rear_sit',
        'جالس في المقعد الخلفي',
        'sitting',
        'rear seat',
        'front-seat backrest in depth',
        'sitting in the rear seat',
        'back and pelvis are supported by the rear seat while front-seat backs create correct depth occlusion',
        'sitting naturally in the rear seat with believable seat support and correct front-seat depth occlusion'
      ),
      pose(
        'car_rear_relaxed',
        'جالس باسترخاء في المقعد',
        'sitting',
        'rear seat',
        undefined,
        'sitting relaxed',
        'body remains within the rear-seat envelope with natural shoulder and knee clearance',
        'sitting relaxed in the rear seat with realistic cabin clearance and supported posture'
      )
    ]
  },
  {
    family: 'car',
    match: /بجانب السيارة|باب السائق|أمام السيارة|الرفرف|الجزء الخلفي|صندوق السيارة|موقف|رصيف|سور/,
    suggestions: [
      pose(
        'car_exterior_stand',
        'واقف بجانب السيارة',
        'standing',
        'pavement',
        'vehicle body',
        'standing beside the parked car',
        'feet remain outside the vehicle footprint with natural clearance from doors, mirrors, wheels, and body panels',
        'standing naturally beside the parked car with grounded feet and believable clearance from the vehicle body'
      ),
      pose(
        'car_exterior_door',
        'واقف عند باب السائق',
        'standing',
        'pavement',
        'driver door',
        'standing near the driver door',
        'hand may contact the door handle or upper door frame while the body remains outside the door swing path',
        'standing naturally at the driver door with optional hand contact on the handle and physically valid door clearance'
      ),
      pose(
        'car_exterior_lean',
        'مستند بخفة على السيارة',
        'standing',
        'pavement',
        'vehicle body',
        'leaning very lightly on the parked car',
        'only a small shoulder or hip contact transfers minimal load to the body panel; feet remain the primary support',
        'standing with a very light shoulder or hip contact against the parked car while both feet carry nearly all body weight'
      )
    ]
  },

  // Administrative military workplace.
  {
    family: 'military-base',
    match: /غرفة اجتماعات|طاولة الاجتماعات/,
    suggestions: [
      pose(
        'meeting_table_sit',
        'جالس على كرسي أمام طاولة الاجتماعات',
        'sitting',
        'conference chair',
        'meeting table',
        'reviewing documents or waiting',
        'pelvis and back are supported by the conference chair, forearms align naturally near the tabletop, and the table edge occludes the lap',
        'sitting naturally on a conference chair in front of the meeting table with realistic chair support, forearm placement, and table-edge occlusion'
      ),
      pose(
        'meeting_table_stand',
        'واقف بجانب طاولة الاجتماعات',
        'standing',
        'meeting-room floor',
        'meeting table',
        'standing beside the table',
        'body remains clear of chair backs while one hand may rest lightly on the table edge',
        'standing naturally beside the meeting table with realistic chair clearance and optional light hand contact on the tabletop'
      ),
      FAMILY_FALLBACKS['military-base'][0]
    ]
  },
  {
    family: 'military-base',
    match: /منطقة انتظار|كراسي انتظار/,
    suggestions: [
      pose(
        'waiting_chair_sit',
        'جالس على كرسي انتظار',
        'sitting',
        'waiting chair',
        'chair backrest',
        'waiting quietly',
        'pelvis and back are supported by the waiting chair, feet remain grounded, and adjacent chairs stay unoccupied unless explicitly requested',
        'sitting naturally on a waiting chair with supported back and pelvis, grounded feet, and realistic spacing from adjacent chairs'
      ),
      pose(
        'waiting_chair_stand',
        'واقف بجانب كراسي الانتظار',
        'standing',
        'waiting-area floor',
        'row of waiting chairs',
        'standing beside the chairs',
        'body remains clear of chair legs and the circulation aisle',
        'standing naturally beside the waiting chairs without intersecting chair legs or blocking the aisle'
      )
    ]
  },
  {
    family: 'military-base',
    match: /خلف مكتب العمل|مكتب إداري|مكتب موظف|مكتب مشترك|مكتب جانبي|بجانب مكتب العمل/,
    suggestions: [
      pose(
        'office_chair_table_sit',
        'جالس على كرسي المكتب أمام سطح المكتب',
        'sitting',
        'office chair',
        'administrative desk',
        'doing routine desk work',
        'chair supports pelvis and back, feet fit beneath the desk, forearms align to the work surface, and the tabletop occludes the lap',
        'sitting naturally on an office chair at the administrative desk with correct chair support, under-desk leg clearance, and tabletop occlusion'
      ),
      FAMILY_FALLBACKS['military-base'][1],
      pose(
        'office_desk_stand',
        'واقف بجانب المكتب',
        'standing',
        'office floor',
        'administrative desk',
        'standing beside the desk',
        'body remains clear of the chair and desk edge while one hand may rest lightly on the tabletop',
        'standing naturally beside the administrative desk with realistic chair clearance and optional light hand contact on the tabletop'
      )
    ]
  },
  {
    family: 'military-base',
    match: /ممر/,
    suggestions: [
      pose(
        'work_corridor_walk',
        'يمشي في الممر',
        'walking',
        'corridor floor',
        'corridor geometry',
        'walking through the corridor',
        'stride follows the corridor axis with grounded step phase and sufficient wall and doorway clearance',
        'walking naturally through the administrative corridor with realistic stride, floor contact, and doorway clearance'
      ),
      pose(
        'work_corridor_stand',
        'واقف في الممر',
        'standing',
        'corridor floor',
        'nearby wall or doorway',
        'standing briefly in the corridor',
        'body remains outside door swing paths and leaves believable circulation clearance',
        'standing naturally in the corridor without blocking door swing paths or the circulation route'
      )
    ]
  },
  {
    family: 'military-base',
    match: /درج|بسطة|درابزين/,
    suggestions: [
      pose(
        'work_stair_rail',
        'واقف عند درابزين الدرج',
        'standing',
        'stair landing',
        'handrail',
        'pausing at the stair landing',
        'feet remain fully supported by one landing plane while one hand may contact the handrail at natural elbow height',
        'standing naturally on the stair landing with full foot support and optional light hand contact on the rail'
      ),
      pose(
        'work_stair_walk',
        'يمشي على الدرج',
        'walking',
        'stair treads',
        'handrail',
        'moving on the stairs',
        'each foot occupies a real tread with believable vertical step transition and optional light handrail contact',
        'walking naturally on the stairs with each foot placed on a real tread and physically plausible handrail clearance'
      )
    ]
  },
  {
    family: 'military-base',
    match: /موقف|سيارة متوقفة|صفوف السيارات/,
    suggestions: [
      pose(
        'work_parking_car',
        'واقف بجانب سيارة متوقفة',
        'standing',
        'parking pavement',
        'parked vehicle',
        'standing beside a parked car',
        'feet remain grounded outside the vehicle envelope with realistic mirror and door clearance',
        'standing naturally beside a parked vehicle with grounded feet and believable door and mirror clearance'
      ),
      pose(
        'work_parking_walk',
        'يمشي بين صفوف السيارات',
        'walking',
        'parking pavement',
        'parked vehicle rows',
        'walking between parked cars',
        'stride stays inside the pedestrian clearance between vehicles without intersecting bumpers or mirrors',
        'walking naturally between parked vehicles with realistic pedestrian clearance from bumpers and mirrors'
      )
    ]
  },
  {
    family: 'military-base',
    match: /استراحة|قهوة|شاي/,
    suggestions: [
      pose(
        'work_break_chair',
        'جالس على كرسي الاستراحة',
        'sitting',
        'break-room chair',
        'small table or coffee station',
        'taking a short break',
        'chair supports body weight while hands interact only with reachable table or cup positions',
        'sitting naturally on a break-room chair with believable support and reachable coffee-table or cup interaction'
      ),
      pose(
        'work_coffee_stand',
        'واقف بجانب ركن القهوة',
        'standing',
        'break-room floor',
        'coffee station',
        'standing near the coffee station',
        'body remains clear of cabinet doors and hot appliance surfaces while one hand may hold a cup naturally',
        'standing naturally beside the coffee station with safe cabinet clearance and believable cup handling'
      )
    ]
  }
];

const uniqueByLabel = (items: PoseSuggestion[]): PoseSuggestion[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    if (!item.labelAR || seen.has(item.labelAR)) return false;
    seen.add(item.labelAR);
    return true;
  });
};

function inferStance(label: string): Stance {
  if (/مستلق|مستلقي/.test(label)) return 'lying';
  if (/نصف مستلق|مسترخٍ/.test(label)) return 'reclined';
  if (/يمشي|خطوات|يعبر/.test(label)) return 'walking';
  if (/جالس/.test(label)) return 'sitting';
  return 'standing';
}

function inferSupportSurface(familyId: SceneFamilyId, subScene: string, label: string, stance: Stance): string | undefined {
  if (stance === 'standing' || stance === 'walking') {
    if (familyId === 'car' && /بجانب|باب|موقف|رصيف|سور|أمام السيارة|الرفرف|الخلفي|صندوق/.test(subScene)) return 'pavement';
    if (familyId === 'saudi-outdoor') return 'pavement';
    if (familyId === 'gym') return 'gym floor';
    return 'floor';
  }
  if (familyId === 'bedroom' && /سرير|مستلق/.test(`${subScene} ${label}`)) return 'mattress';
  if (familyId === 'living-room' && /كنبة/.test(`${subScene} ${label}`)) return 'sofa cushion';
  if (familyId === 'gym' && /مقعد/.test(`${subScene} ${label}`)) return 'gym bench';
  if (familyId === 'car') {
    if (/راكب/.test(`${subScene} ${label}`)) return 'front passenger seat';
    if (/الخلفي|الخلفي/.test(`${subScene} ${label}`)) return 'rear seat';
    return 'driver seat';
  }
  if (familyId === 'military-base' && /انتظار/.test(`${subScene} ${label}`)) return 'waiting chair';
  if (familyId === 'military-base') return 'office chair';
  return 'chair';
}

function inferContactObject(familyId: SceneFamilyId, subScene: string, label: string): string | undefined {
  const text = `${subScene} ${label}`;
  if (/طاولة الاجتماعات|غرفة اجتماعات/.test(text)) return 'meeting table';
  if (/مكتب/.test(text)) return 'administrative desk';
  if (/كنبة/.test(text)) return 'sofa';
  if (/مقهى/.test(text)) return 'cafe table';
  if (/جدار|سور/.test(text)) return 'wall';
  if (/درابزين/.test(text)) return 'handrail';
  if (/سيارة|باب السائق|مقود/.test(text)) return familyId === 'car' ? 'vehicle structure' : 'parked vehicle';
  if (/جهاز|أثقال|دمبل/.test(text)) return 'exercise equipment';
  if (/سرير/.test(text)) return 'bed and bedding';
  return undefined;
}

function inferPoseSuggestion(familyId: SceneFamilyId, subScene: string, labelAR: string): PoseSuggestion {
  const stance = inferStance(labelAR);
  const supportSurface = inferSupportSurface(familyId, subScene, labelAR, stance);
  const contactObject = inferContactObject(familyId, subScene, labelAR);
  const physicsByStance: Record<Stance, string> = {
    standing: 'body weight remains primarily through both feet with relaxed knees and natural left-right asymmetry',
    sitting: 'pelvis is fully supported by the selected seat with grounded feet and realistic knee and hip flexion',
    lying: 'body mass is distributed across the support surface with visible compression under head, torso, and hips',
    reclined: 'upper torso and hips are visibly supported with believable spine angle and localized cushion or mattress compression',
    walking: 'one foot is load-bearing while the opposite foot advances with natural counter-swing and grounded step timing'
  };

  return pose(
    `inferred_${familyId}_${labelAR.replace(/\s+/g, '_')}`,
    labelAR,
    stance,
    supportSurface,
    contactObject,
    labelAR,
    physicsByStance[stance],
    `${labelAR}; ${physicsByStance[stance]}`
  );
}

export function getStructuredPoseSuggestions(familyId: SceneFamilyId, subScene = ''): PoseSuggestion[] {
  const rule = RULES.find(item => item.family === familyId && item.match.test(subScene));
  const microLoc = subScene ? getMicroLocation(familyId, subScene) : undefined;
  const legacy = (microLoc?.recommendedPoses || []).map(label => inferPoseSuggestion(familyId, subScene, label));
  return uniqueByLabel([
    ...(rule?.suggestions || []),
    ...legacy,
    ...FAMILY_FALLBACKS[familyId]
  ]).slice(0, 5);
}

export function resolveStructuredPoseSuggestion(
  familyId: SceneFamilyId,
  subScene: string,
  selectedPose: string
): PoseSuggestion {
  const suggestions = getStructuredPoseSuggestions(familyId, subScene);
  return suggestions.find(item => item.labelAR === selectedPose)
    ?? inferPoseSuggestion(familyId, subScene, selectedPose || suggestions[0]?.labelAR || 'واقف بثبات');
}

export function deriveMicroPhysics(input: MicroPhysicsInput): MicroPhysicsState {
  const poseSuggestion = resolveStructuredPoseSuggestion(input.familyId, input.subScene, input.pose);
  const fabricTension: string[] = [];
  const contactPhysics: string[] = [poseSuggestion.physics];
  const sensorArtifacts: string[] = [];
  const realismGuards: string[] = [
    'preserve physically plausible support, pressure, clearance, and occlusion at every body-object contact',
    'no floating limbs, no body-object intersections, no impossible furniture penetration'
  ];

  if (poseSuggestion.supportSurface) {
    contactPhysics.push(`support surface: ${poseSuggestion.supportSurface}`);
  }
  if (poseSuggestion.contactObject) {
    contactPhysics.push(`contact object: ${poseSuggestion.contactObject}`);
  }

  if (poseSuggestion.stance === 'sitting') {
    fabricTension.push(
      'fabric bunches and compresses naturally around the waist, hips, lap, and bent elbows according to the seated joint angles'
    );
  } else if (poseSuggestion.stance === 'lying') {
    fabricTension.push(
      'garment panels flatten and pull backward where body weight presses them into the mattress while loose fabric remains gravity-driven away from contact zones'
    );
  } else if (poseSuggestion.stance === 'reclined') {
    fabricTension.push(
      'fabric compresses at supported back and hip contact zones while the abdomen and chest retain relaxed gravity-driven folds'
    );
  } else if (poseSuggestion.stance === 'walking') {
    fabricTension.push(
      'fabric folds shift subtly with gait phase, alternating leg motion, and restrained arm counter-swing without frozen symmetry'
    );
  } else {
    fabricTension.push(
      'fabric hangs vertically under gravity with natural local creases at shoulders, elbows, waist, and garment seams'
    );
  }

  let eyeConvergence = 'natural relaxed binocular convergence appropriate to the selected activity and camera distance';
  if (input.captureType === 'front-selfie') {
    fabricTension.push(
      'the phone-holding side shows a small believable shoulder elevation plus sleeve and upper-torso fabric tension caused by the extended arm'
    );
    eyeConvergence = 'natural near-camera binocular convergence toward the Xiaomi 15 Ultra front-camera lens area, avoiding a dead parallel AI stare';
    realismGuards.push('front-selfie perspective must preserve the Xiaomi 15 Ultra approx 21mm equivalent geometry and restrained peripheral expansion');
  } else if (input.captureType === 'mirror-selfie') {
    eyeConvergence = 'gaze converges naturally toward either the reflected phone screen or reflected lens position, consistent with flat-mirror geometry';
  } else {
    eyeConvergence = 'gaze follows the scene activity or photographer position without forced direct-to-lens symmetry';
  }

  const intensity = typeof input.lightingIntensity === 'number' ? input.lightingIntensity : 70;
  if ((input.timeOfDay === 'night' && intensity <= 65) || intensity <= 35) {
    sensorArtifacts.push(
      'fine low-light luminance noise in darker regions with restrained chroma speckle and realistic mobile computational noise reduction'
    );
  } else {
    sensorArtifacts.push(
      'natural smartphone micro-contrast with restrained sharpening and no beauty-filter skin smoothing'
    );
  }

  return {
    stance: poseSuggestion.stance,
    poseSuggestion,
    fabricTension,
    contactPhysics,
    eyeConvergence,
    sensorArtifacts,
    realismGuards
  };
}
