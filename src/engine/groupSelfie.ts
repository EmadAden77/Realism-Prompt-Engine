import type { Framing } from './physicsEngine';
import type { MicroLocation, SceneFamilyId } from '../data/microLocations';

export type GroupSelfieSize = 2 | 3 | 4 | 5;
export type GroupSelfieRelationship = 'auto' | 'coworkers' | 'friends' | 'family' | 'gym-friends';
export type GroupClothingDiversity = 'low' | 'natural' | 'high';
export type GroupUniformConsistency = 'unified' | 'mostly-unified' | 'naturally-varied';
export type GroupClothingPresetId =
  | 'auto'
  | 'saudi-military-realistic'
  | 'saudi-military-admin'
  | 'saudi-military-daily'
  | 'saudi-military-field'
  | 'saudi-military-winter'
  | 'civil-admin'
  | 'saudi-thobe'
  | 'business-casual'
  | 'saudi-casual'
  | 'mixed-natural'
  | 'gym-training'
  | 'gym-post-workout'
  | 'home-casual'
  | 'everyday-casual';

export interface GroupCompanionProfile {
  id: string;
  ageBand: string;
  heightCm: number;
  bodyBuild: string;
  faceShape: string;
  jawShape: string;
  eyeShape: string;
  noseShape: string;
  hair: string;
  facialHair: string;
  eyewear: string;
  complexion: string;
  outfit: string;
  position: string;
  gaze: string;
  interaction: string;
}

export interface GroupSelfieInput {
  enabled?: boolean;
  requestedSize?: GroupSelfieSize;
  relationship?: GroupSelfieRelationship;
  familyId: SceneFamilyId;
  subScene: string;
  framing: Framing;
  microLoc?: MicroLocation;
  clothingPreset?: GroupClothingPresetId;
  clothingDiversity?: GroupClothingDiversity;
  uniformConsistency?: GroupUniformConsistency;
}

export interface ResolvedGroupSelfie {
  enabled: boolean;
  requestedSize: GroupSelfieSize;
  resolvedSize: GroupSelfieSize;
  companionCount: number;
  maxByLocation: GroupSelfieSize;
  relationship: Exclude<GroupSelfieRelationship, 'auto'>;
  clothingPreset: GroupClothingPresetId;
  clothingPresetLabelAR: string;
  clothingDiversity: GroupClothingDiversity;
  uniformConsistency: GroupUniformConsistency;
  arrangement: string;
  requiredFraming: Framing;
  recommendedDistanceCm: number;
  profiles: GroupCompanionProfile[];
  antiCloningPassed: boolean;
  uniquenessScore: number;
  validationNotes: string[];
  prompt: string;
  physicsGuards: string[];
}

const FACE_SHAPES = [
  'long oval face with a narrow lower third',
  'broad rectangular face with a wide mandibular plane',
  'rounder face with fuller lateral cheek volume',
  'square face with a compact lower third',
  'diamond-shaped face with prominent zygomatic width',
  'soft triangular face with a narrower forehead',
  'oblong face with a tall mid-face',
  'heart-shaped face with a tapered chin'
];

const JAWS = [
  'narrow angular jaw with a pointed chin',
  'broad straight jaw with a blunt chin',
  'soft rounded jawline',
  'square compact jaw with a short chin',
  'defined V-shaped jaw with a longer chin',
  'wide jaw angle with a rounded chin tip',
  'slender jaw with mild asymmetry',
  'heavy lower jaw with a flat chin line'
];

const EYES = [
  'deep-set narrow almond eyes',
  'rounder medium-set eyes',
  'hooded almond eyes',
  'slightly downturned eyes',
  'slightly upturned almond eyes',
  'wide-set oval eyes',
  'close-set deep-set eyes',
  'heavy-lidded medium-set eyes'
];

const NOSES = [
  'straight narrow nose with a defined bridge',
  'broader nose with a softer rounded tip',
  'slightly convex bridge with a narrow tip',
  'shorter straight nose with a wider alar base',
  'long narrow nose with a high bridge',
  'medium-width nose with a subtle dorsal irregularity',
  'compact nose with a rounded tip',
  'prominent straight bridge with a broader tip'
];

const HAIR = [
  'short straight black hair with a low natural side part',
  'short coarse wavy dark hair with a slightly uneven hairline',
  'close-cropped dark hair with modest temple recession',
  'medium-short curly dark hair with natural volume',
  'short brushed-back dark hair with a visible mature hairline',
  'very short buzzed dark hair with natural scalp density',
  'short textured dark-brown hair with a forward fringe',
  'short loose-wave black hair with low side volume'
];

const FACIAL_HAIR = [
  'clean-shaven face with visible natural beard shadow',
  'short boxed beard with moderate cheek density',
  'moustache with light jaw stubble',
  'short goatee with sparse cheek growth',
  'fuller short beard with a naturally uneven cheek line',
  'very light stubble with no connected moustache',
  'trimmed moustache and chin stubble',
  'short beard concentrated along jaw and chin'
];

const BUILDS = [
  'slim narrow-shouldered build',
  'average medium build',
  'stockier broad-torso build',
  'compact athletic build',
  'lanky long-limbed build',
  'broad-shouldered average build',
  'short compact sturdy build',
  'lean medium-shouldered build'
];

const HEIGHTS = [169, 174, 179, 184, 188, 172, 181, 186];
const AGE_BANDS = ['mid-20s', 'late-20s', 'early-30s', 'mid-30s', 'late-30s', 'early-40s', 'early-30s', 'late-20s'];
const EYEWEAR = [
  'no eyewear',
  'thin rectangular prescription glasses',
  'no eyewear',
  'subtle metal-frame prescription glasses',
  'no eyewear',
  'no eyewear',
  'dark rectangular prescription glasses',
  'no eyewear'
];
const COMPLEXIONS = [
  'medium olive complexion',
  'light-medium warm complexion',
  'deeper olive complexion',
  'medium neutral complexion',
  'light olive complexion',
  'medium tan complexion',
  'warm medium complexion',
  'light-medium neutral complexion'
];

const OUTFITS: Record<SceneFamilyId, string[]> = {
  'military-base': [
    'plain dark-navy administrative work uniform, non-tactical, simple matte fabric, no duplicated insignia',
    'sand-khaki administrative shirt with charcoal trousers and black work shoes',
    'light-blue long-sleeve administrative shirt with dark navy trousers',
    'plain white Saudi thobe worn neatly as ordinary civilian administrative attire',
    'medium-grey work shirt with black trousers, sleeves naturally down'
  ],
  'saudi-outdoor': [
    'plain white Saudi thobe with understated everyday styling',
    'beige linen shirt with off-white trousers',
    'dark navy polo shirt with stone chinos',
    'charcoal casual T-shirt with dark jeans',
    'olive overshirt over a plain cream T-shirt with black trousers'
  ],
  'car': [
    'plain charcoal T-shirt with black trousers',
    'light-grey polo with dark trousers',
    'navy casual shirt with sleeves naturally down',
    'white thobe worn in an ordinary everyday way',
    'black lightweight hoodie with dark casual trousers'
  ],
  'living-room': [
    'soft heather-grey T-shirt with dark lounge trousers',
    'plain navy polo with relaxed cotton trousers',
    'lightweight cream sweatshirt with charcoal joggers',
    'white thobe worn casually at home',
    'dark green casual shirt with black trousers'
  ],
  'bedroom': [
    'plain dark T-shirt with relaxed lounge trousers',
    'heather-grey T-shirt with black shorts',
    'lightweight hoodie with dark joggers',
    'plain white T-shirt with charcoal lounge trousers',
    'soft navy sleep/lounge shirt with dark trousers'
  ],
  'gym': [
    'black training T-shirt with charcoal athletic shorts',
    'grey performance top with black training trousers',
    'olive athletic T-shirt with dark shorts',
    'navy lightweight training top with black joggers',
    'dark maroon sports T-shirt with grey training trousers'
  ]
};

export interface GroupClothingOption {
  id: GroupClothingPresetId;
  labelAR: string;
  families: SceneFamilyId[];
  zones?: string[];
  outfits: string[];
  realismRules: string[];
}

const MILITARY_ADMIN_OUTFITS = [
  'realistic Saudi military administrative duty uniform in a restrained olive tone, neat tucked duty shirt with matching trousers, practical black duty shoes, subtle non-readable name/role patches, no ceremonial decoration',
  'realistic Saudi military office-duty uniform in a sand-khaki tone, structured long-sleeve shirt with matching duty trousers and practical black footwear, restrained workplace presentation',
  'realistic Saudi military administrative uniform in a darker olive duty variation, clean matte fabric, matching trousers, ordinary service footwear, minimal non-readable insignia',
  'realistic Saudi military office uniform with a lightweight duty overshirt over matching trousers, practical footwear, subtle person-specific fit differences and no theatrical styling'
];

const MILITARY_DAILY_OUTFITS = [
  'realistic Saudi military daily-duty uniform in an olive duty tone, structured shirt and trousers, practical boots, natural work creases, restrained non-readable patches',
  'realistic Saudi military daily-duty uniform in a sand-toned variation, practical cargo-cut trousers, matte duty shirt, ordinary service boots, no combat posing',
  'realistic Saudi military everyday duty uniform with sleeves naturally down, practical belt, matching trousers and work boots, slight lived-in fabric creasing',
  'realistic Saudi military daily-duty clothing with a neat duty shirt, matching trousers, practical boots and a subtle cap variation appropriate to routine work'
];

const MILITARY_FIELD_OUTFITS = [
  'realistic Saudi military field-duty camouflage uniform with practical cargo pockets and service boots, restrained everyday field presentation, no special-forces exaggeration',
  'realistic Saudi military field-style duty uniform in a plausible desert-oriented camouflage variation, practical boots, matte fabric and mild natural work wear',
  'realistic Saudi military field-duty uniform with a practical cap, cargo trousers and ordinary service boots, restrained equipment load and no ceremonial elements',
  'realistic Saudi military field-duty clothing with slightly different camouflage tonal balance, practical boots and natural fabric wear appropriate to an outdoor work area'
];

const MILITARY_WINTER_OUTFITS = [
  'realistic Saudi military duty uniform with a lightweight olive field jacket layered over the standard uniform, practical trousers and boots',
  'realistic Saudi military cold-weather duty variation with a darker service jacket, matching duty trousers and practical black footwear',
  'realistic Saudi military layered duty uniform with a lightweight sand-toned jacket, ordinary service trousers and boots, natural jacket folds',
  'realistic Saudi military winter-duty variation with a restrained field jacket over daily-duty clothing, practical footwear and no theatrical tactical accessories'
];

const CIVIL_ADMIN_OUTFITS = [
  'sand-khaki civilian administrative shirt with charcoal trousers and black work shoes',
  'light-blue long-sleeve office shirt with dark navy trousers and simple black shoes',
  'medium-grey work shirt with black trousers, sleeves naturally down and ordinary office shoes',
  'white business shirt with charcoal trousers and understated black footwear'
];

const SAUDI_THOBE_OUTFITS = [
  'plain white Saudi thobe with understated everyday styling and ordinary footwear',
  'off-white Saudi thobe with natural fabric drape and simple everyday sandals or shoes',
  'clean white Saudi thobe with subtle person-specific collar and fabric variation, no ceremonial styling'
];

const BUSINESS_CASUAL_OUTFITS = [
  'navy long-sleeve casual shirt with stone chinos and understated leather shoes',
  'beige button-up shirt with dark trousers and simple everyday shoes',
  'medium-grey polo with charcoal trousers and clean casual footwear',
  'olive overshirt over a plain cream T-shirt with black trousers'
];

const SAUDI_CASUAL_OUTFITS = [
  'plain charcoal T-shirt with dark jeans and ordinary sneakers',
  'navy polo shirt with stone chinos and casual shoes',
  'beige linen shirt with off-white trousers and understated footwear',
  'olive overshirt over a cream T-shirt with black trousers and casual shoes'
];

const GYM_TRAINING_OUTFITS = [
  'black training T-shirt with charcoal athletic shorts and practical training shoes',
  'grey performance top with black training trousers and neutral gym shoes',
  'olive athletic T-shirt with dark shorts and practical trainers',
  'navy lightweight training top with black joggers and ordinary gym footwear'
];

const GYM_POST_OUTFITS = [
  'dark training T-shirt with lightweight zip hoodie, black joggers and gym shoes after a workout',
  'grey performance top with a towel over one shoulder, dark training trousers and practical gym shoes',
  'navy sports T-shirt with relaxed black joggers and ordinary trainers, mild post-workout fabric wear'
];

const HOME_CASUAL_OUTFITS = [
  'soft heather-grey T-shirt with dark lounge trousers',
  'plain navy polo with relaxed cotton trousers',
  'lightweight cream sweatshirt with charcoal joggers',
  'plain dark T-shirt with relaxed lounge trousers'
];

export const GROUP_CLOTHING_OPTIONS: GroupClothingOption[] = [
  { id:'auto', labelAR:'تلقائي حسب المكان', families:['military-base','saudi-outdoor','car','living-room','bedroom','gym'], outfits:[], realismRules:['derive companion clothing only from the selected place and micro-location'] },
  { id:'saudi-military-realistic', labelAR:'لباس عسكري سعودي واقعي', families:['military-base'], outfits:[...MILITARY_ADMIN_OUTFITS,...MILITARY_DAILY_OUTFITS,...MILITARY_FIELD_OUTFITS,...MILITARY_WINTER_OUTFITS], realismRules:['use realistic Saudi military workplace variations','no fantasy uniform','no ceremonial excess','no duplicated exact outfit in naturally-varied mode'] },
  { id:'saudi-military-admin', labelAR:'زي عسكري سعودي إداري', families:['military-base'], zones:['office','meeting','waiting','break','corridor','entrance'], outfits:MILITARY_ADMIN_OUTFITS, realismRules:['administrative workplace presentation','avoid heavy field styling'] },
  { id:'saudi-military-daily', labelAR:'زي عسكري سعودي يومي', families:['military-base'], zones:['office','meeting','waiting','break','corridor','entrance','exterior','parking'], outfits:MILITARY_DAILY_OUTFITS, realismRules:['ordinary daily-duty presentation','restrained work wear'] },
  { id:'saudi-military-field', labelAR:'زي عسكري سعودي ميداني', families:['military-base'], zones:['corridor','entrance','exterior','parking'], outfits:MILITARY_FIELD_OUTFITS, realismRules:['field-duty styling only where context supports it','no cinematic special-forces styling'] },
  { id:'saudi-military-winter', labelAR:'زي عسكري سعودي شتوي / جاكيت', families:['military-base'], zones:['corridor','entrance','exterior','parking','office','meeting'], outfits:MILITARY_WINTER_OUTFITS, realismRules:['layer only where plausible','natural jacket weight and folds'] },
  { id:'civil-admin', labelAR:'ملابس موظفين إدارية مدنية', families:['military-base'], zones:['office','meeting','waiting','break','corridor','entrance'], outfits:CIVIL_ADMIN_OUTFITS, realismRules:['ordinary civilian administrative clothing'] },
  { id:'saudi-thobe', labelAR:'ثوب سعودي', families:['military-base','saudi-outdoor','car','living-room','bedroom'], outfits:SAUDI_THOBE_OUTFITS, realismRules:['ordinary Saudi everyday styling'] },
  { id:'business-casual', labelAR:'Business casual', families:['military-base','saudi-outdoor','car'], outfits:BUSINESS_CASUAL_OUTFITS, realismRules:['ordinary non-staged workplace or street styling'] },
  { id:'saudi-casual', labelAR:'كاجوال سعودي يومي', families:['saudi-outdoor','car'], outfits:SAUDI_CASUAL_OUTFITS, realismRules:['ordinary everyday Saudi casual clothing'] },
  { id:'mixed-natural', labelAR:'مزيج طبيعي حسب المكان', families:['military-base','saudi-outdoor','car','living-room','bedroom','gym'], outfits:[], realismRules:['mix compatible clothing categories without clone repetition'] },
  { id:'gym-training', labelAR:'ملابس تمرين', families:['gym'], outfits:GYM_TRAINING_OUTFITS, realismRules:['practical gym clothing only'] },
  { id:'gym-post-workout', labelAR:'ملابس ما بعد التمرين', families:['gym'], outfits:GYM_POST_OUTFITS, realismRules:['mild post-workout wear without theatrical sweat'] },
  { id:'home-casual', labelAR:'ملابس منزلية يومية', families:['living-room','bedroom'], outfits:HOME_CASUAL_OUTFITS, realismRules:['comfortable everyday home clothing'] },
  { id:'everyday-casual', labelAR:'كاجوال يومي', families:['saudi-outdoor','car','living-room','bedroom'], outfits:SAUDI_CASUAL_OUTFITS, realismRules:['ordinary casual clothing appropriate to the place'] }
];

export function getGroupClothingOptions(
  familyId: SceneFamilyId,
  microLoc?: MicroLocation
): GroupClothingOption[] {
  const zone = microLoc?.zone;
  return GROUP_CLOTHING_OPTIONS.filter(option => {
    if (!option.families.includes(familyId)) return false;
    if (!option.zones || option.zones.length === 0 || !zone) return true;
    return option.zones.includes(zone);
  });
}

function getMilitaryAutoPool(microLoc?: MicroLocation): string[] {
  const zone = microLoc?.zone;
  if (zone === 'office' || zone === 'meeting' || zone === 'waiting') {
    return [...MILITARY_ADMIN_OUTFITS, ...MILITARY_DAILY_OUTFITS];
  }
  if (zone === 'parking' || zone === 'exterior') {
    return [...MILITARY_DAILY_OUTFITS, ...MILITARY_FIELD_OUTFITS, ...MILITARY_WINTER_OUTFITS];
  }
  if (zone === 'corridor' || zone === 'entrance') {
    return [...MILITARY_ADMIN_OUTFITS, ...MILITARY_DAILY_OUTFITS, ...MILITARY_FIELD_OUTFITS];
  }
  if (zone === 'break' || zone === 'service') {
    return [...MILITARY_ADMIN_OUTFITS, ...MILITARY_DAILY_OUTFITS];
  }
  return [...MILITARY_ADMIN_OUTFITS, ...MILITARY_DAILY_OUTFITS];
}

function resolveClothingOption(
  familyId: SceneFamilyId,
  microLoc: MicroLocation | undefined,
  requested: GroupClothingPresetId
): GroupClothingOption {
  const available = getGroupClothingOptions(familyId, microLoc);
  const explicit = available.find(option => option.id === requested);
  if (
    explicit &&
    explicit.id !== 'auto' &&
    explicit.id !== 'mixed-natural' &&
    explicit.id !== 'saudi-military-realistic'
  ) return explicit;

  if (familyId === 'military-base') {
    const isRealisticMilitary = requested === 'saudi-military-realistic';
    return {
      id: isRealisticMilitary
        ? 'saudi-military-realistic'
        : requested === 'mixed-natural'
          ? 'mixed-natural'
          : 'auto',
      labelAR: isRealisticMilitary
        ? 'لباس عسكري سعودي واقعي'
        : requested === 'mixed-natural'
          ? 'مزيج طبيعي حسب المكان'
          : 'تلقائي حسب المكان',
      families:[familyId],
      outfits:getMilitaryAutoPool(microLoc),
      realismRules:[
        'micro-location-aware Saudi military/workplace clothing',
        'administrative interiors favor office/daily-duty variations',
        'outdoor and parking areas may use restrained field/jacket variations',
        'avoid cloned outfit silhouettes'
      ]
    };
  }

  if (familyId === 'gym') return {
    id: requested === 'mixed-natural' ? 'mixed-natural' : 'auto',
    labelAR: requested === 'mixed-natural' ? 'مزيج طبيعي حسب المكان' : 'تلقائي حسب المكان',
    families:[familyId],
    outfits:[...GYM_TRAINING_OUTFITS,...GYM_POST_OUTFITS],
    realismRules:['gym-appropriate clothing only']
  };

  if (familyId === 'living-room' || familyId === 'bedroom') return {
    id: requested === 'mixed-natural' ? 'mixed-natural' : 'auto',
    labelAR: requested === 'mixed-natural' ? 'مزيج طبيعي حسب المكان' : 'تلقائي حسب المكان',
    families:[familyId],
    outfits:[...HOME_CASUAL_OUTFITS,...SAUDI_THOBE_OUTFITS],
    realismRules:['ordinary home clothing']
  };

  return {
    id: requested === 'mixed-natural' ? 'mixed-natural' : 'auto',
    labelAR: requested === 'mixed-natural' ? 'مزيج طبيعي حسب المكان' : 'تلقائي حسب المكان',
    families:[familyId],
    outfits:[...SAUDI_CASUAL_OUTFITS,...SAUDI_THOBE_OUTFITS,...BUSINESS_CASUAL_OUTFITS],
    realismRules:['ordinary place-compatible everyday clothing']
  };
}


const hash = (value: string): number => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
};

const pickDistinct = <T>(pool: T[], offset: number, index: number): T =>
  pool[(offset + index) % pool.length];

function inferRelationship(familyId: SceneFamilyId, requested: GroupSelfieRelationship): Exclude<GroupSelfieRelationship, 'auto'> {
  if (requested !== 'auto') return requested;
  if (familyId === 'military-base') return 'coworkers';
  if (familyId === 'gym') return 'gym-friends';
  if (familyId === 'living-room' || familyId === 'bedroom') return 'family';
  return 'friends';
}

export function getGroupSelfieLocationLimit(
  familyId: SceneFamilyId,
  microLoc?: MicroLocation
): GroupSelfieSize {
  if (familyId === 'bedroom') return 2;
  if (familyId === 'living-room') return 4;
  if (familyId === 'gym') return 4;
  if (familyId === 'car') return microLoc?.isOutdoor ? 4 : 3;
  if (familyId === 'saudi-outdoor') return 5;

  switch (microLoc?.zone) {
    case 'office': return 3;
    case 'corridor': return 3;
    case 'entrance': return 4;
    case 'waiting': return 3;
    case 'meeting': return 4;
    case 'break': return 3;
    case 'service': return 2;
    case 'stairs': return 2;
    case 'exterior': return 5;
    case 'parking': return 5;
    default: return 3;
  }
}

export function getRequiredGroupFraming(size: GroupSelfieSize): Framing {
  if (size <= 2) return 'head-shoulders';
  if (size === 3) return 'chest-up';
  return 'half-body';
}

const framingRank: Record<Framing, number> = {
  'head-shoulders': 0,
  'chest-up': 1,
  'half-body': 2
};

export function widenFramingForGroup(current: Framing, size: GroupSelfieSize): Framing {
  const required = getRequiredGroupFraming(size);
  return framingRank[current] >= framingRank[required] ? current : required;
}

function resolveArrangement(familyId: SceneFamilyId, microLoc: MicroLocation | undefined, size: GroupSelfieSize): string {
  const zone = microLoc?.zone;
  if (familyId === 'car' && !microLoc?.isOutdoor) {
    return size === 2
      ? 'two-person in-cabin composition with the reference subject closest to the phone and one companion in the adjacent visible seat'
      : 'three-person in-cabin cluster using physically occupied seats only, with no floating head between seats';
  }
  if (zone === 'meeting' || zone === 'break' || zone === 'waiting' || familyId === 'living-room') {
    return size === 2
      ? 'side-by-side seated/standing pair with unequal shoulder depth'
      : 'staggered seated cluster around the available furniture, not a symmetrical row';
  }
  if (zone === 'corridor' || zone === 'stairs') {
    return size === 2
      ? 'two-person diagonal shoulder stagger following the passage depth'
      : 'three-person staggered diagonal line following the corridor perspective, never blocking the full passage';
  }
  if (zone === 'parking' || zone === 'exterior' || familyId === 'saudi-outdoor') {
    if (size >= 5) return 'shallow irregular semicircle with the reference subject slightly forward and companions distributed at unequal depths';
    if (size === 4) return 'asymmetric shallow arc, two companions slightly deeper and one nearer the reference subject';
    return size === 3
      ? 'loose triangular cluster with unequal shoulder overlap'
      : 'shoulder-to-shoulder pair with a small natural depth offset';
  }
  if (size === 2) return 'organic shoulder-to-shoulder pair with slight depth asymmetry';
  if (size === 3) return 'compact triangular cluster with the reference subject closest to the phone';
  return 'compact asymmetric cluster with staggered shoulders and non-uniform depth';
}

function relationshipLabel(r: Exclude<GroupSelfieRelationship, 'auto'>): string {
  if (r === 'coworkers') return 'ordinary workplace colleagues';
  if (r === 'family') return 'family members';
  if (r === 'gym-friends') return 'gym friends';
  return 'friends';
}

function buildProfiles(
  familyId: SceneFamilyId,
  subScene: string,
  companionCount: number,
  relationship: Exclude<GroupSelfieRelationship, 'auto'>,
  arrangement: string,
  outfitPool: string[],
  clothingDiversity: GroupClothingDiversity,
  uniformConsistency: GroupUniformConsistency
): GroupCompanionProfile[] {
  const safePool = outfitPool.length > 0 ? outfitPool : OUTFITS[familyId];
  const seed = hash(`${familyId}|${subScene}|${relationship}|${clothingDiversity}|${uniformConsistency}`);
  const offsets = {
    face: seed % FACE_SHAPES.length,
    jaw: (seed + 1) % JAWS.length,
    eyes: (seed + 2) % EYES.length,
    nose: (seed + 3) % NOSES.length,
    hair: (seed + 4) % HAIR.length,
    beard: (seed + 5) % FACIAL_HAIR.length,
    build: (seed + 6) % BUILDS.length,
    height: (seed + 7) % HEIGHTS.length,
    outfit: (seed + 2) % safePool.length
  };

  const outfitFor = (index: number): string => {
    if (uniformConsistency === 'unified') return safePool[offsets.outfit];
    if (uniformConsistency === 'mostly-unified') {
      const width = Math.min(2, safePool.length);
      return safePool[(offsets.outfit + (index % width)) % safePool.length];
    }
    if (clothingDiversity === 'low') {
      const width = Math.min(2, safePool.length);
      return safePool[(offsets.outfit + (index % width)) % safePool.length];
    }
    const step = clothingDiversity === 'high' ? 2 : 1;
    return safePool[(offsets.outfit + index * step) % safePool.length];
  };

  return Array.from({ length: companionCount }, (_, i) => ({
    id: `companion-${i + 1}`,
    ageBand: pickDistinct(AGE_BANDS, seed % AGE_BANDS.length, i),
    heightCm: pickDistinct(HEIGHTS, offsets.height, i),
    bodyBuild: pickDistinct(BUILDS, offsets.build, i),
    faceShape: pickDistinct(FACE_SHAPES, offsets.face, i),
    jawShape: pickDistinct(JAWS, offsets.jaw, i),
    eyeShape: pickDistinct(EYES, offsets.eyes, i),
    noseShape: pickDistinct(NOSES, offsets.nose, i),
    hair: pickDistinct(HAIR, offsets.hair, i),
    facialHair: pickDistinct(FACIAL_HAIR, offsets.beard, i),
    eyewear: pickDistinct(EYEWEAR, seed % EYEWEAR.length, i),
    complexion: pickDistinct(COMPLEXIONS, (seed + 3) % COMPLEXIONS.length, i),
    outfit: outfitFor(i),
    position: `position ${i + 1} within: ${arrangement}; each face occupies a distinct depth/side slot`,
    gaze: i % 3 === 0
      ? 'looking naturally toward the phone lens'
      : i % 3 === 1
        ? 'eyes slightly offset toward the reference subject'
        : 'brief candid gaze just beside the lens',
    interaction: i === 0
      ? 'closest companion leans in slightly without covering the reference subject'
      : i % 2 === 0
        ? 'relaxed hands remain low or naturally supported by nearby furniture'
        : 'one arm may rest naturally behind another companion or near the shoulder line without duplicate hand poses'
  }));
}

export function evaluateAntiCloning(
  profiles: GroupCompanionProfile[],
  allowSharedOutfit = false
): { passed: boolean; score: number; notes: string[] } {
  let penalty = 0;
  const notes: string[] = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const a = profiles[i];
      const b = profiles[j];
      const same = [
        a.faceShape === b.faceShape,
        a.jawShape === b.jawShape,
        a.eyeShape === b.eyeShape,
        a.noseShape === b.noseShape,
        a.hair === b.hair,
        a.facialHair === b.facialHair,
        a.bodyBuild === b.bodyBuild,
        a.heightCm === b.heightCm,
        !allowSharedOutfit && a.outfit === b.outfit
      ].filter(Boolean).length;

      if (same >= 3) {
        penalty += same * 8;
        notes.push(`${a.id} and ${b.id} share too many visual attributes (${same}).`);
      }
      if (Math.abs(a.heightCm - b.heightCm) < 3) {
        penalty += 4;
        notes.push(`${a.id} and ${b.id} are too close in height.`);
      }
    }
  }

  const score = Math.max(0, 100 - penalty);
  return { passed: score >= 88 && notes.length === 0, score, notes };
}

export function resolveGroupSelfie(input: GroupSelfieInput): ResolvedGroupSelfie {
  const requestedSize = input.requestedSize ?? 2;
  const relationship = inferRelationship(input.familyId, input.relationship ?? 'auto');
  const maxByLocation = getGroupSelfieLocationLimit(input.familyId, input.microLoc);
  const resolvedSize = Math.min(requestedSize, maxByLocation) as GroupSelfieSize;
  const companionCount = resolvedSize - 1;
  const requiredFraming = getRequiredGroupFraming(resolvedSize);
  const arrangement = resolveArrangement(input.familyId, input.microLoc, resolvedSize);
  const requestedClothingPreset = input.clothingPreset ?? 'auto';
  const clothingDiversity = input.clothingDiversity ?? 'natural';
  const uniformConsistency = input.uniformConsistency ?? 'naturally-varied';
  const clothingOption = resolveClothingOption(input.familyId, input.microLoc, requestedClothingPreset);
  const profiles = buildProfiles(
    input.familyId,
    input.subScene,
    companionCount,
    relationship,
    clothingPreset: clothingOption.id,
    clothingPresetLabelAR: clothingOption.labelAR,
    clothingDiversity,
    uniformConsistency,
    arrangement,
    clothingOption.outfits,
    clothingDiversity,
    uniformConsistency
  );
  const uniqueness = evaluateAntiCloning(profiles, uniformConsistency === 'unified');

  const recommendedDistanceCm =
    resolvedSize === 2 ? 46 :
    resolvedSize === 3 ? 56 :
    resolvedSize === 4 ? 65 : 69;

  const validationNotes: string[] = [];
  if (requestedSize > maxByLocation) {
    validationNotes.push(`Requested group size ${requestedSize} was capped to ${resolvedSize} because the selected micro-location cannot physically hold a larger selfie cluster.`);
  }
  if (framingRank[input.framing] < framingRank[requiredFraming]) {
    validationNotes.push(`Framing must widen from ${input.framing} to ${requiredFraming} for ${resolvedSize} people.`);
  }
  validationNotes.push(...uniqueness.notes);

  const cast = profiles.map((p, i) =>
    `Companion ${i + 1}: adult male, ${p.ageBand}, ${p.heightCm}cm, ${p.bodyBuild}; ${p.faceShape}; ${p.jawShape}; ${p.eyeShape}; ${p.noseShape}; ${p.hair}; ${p.facialHair}; ${p.eyewear}; ${p.complexion}. Clothing: ${p.outfit}. Position/gaze: ${p.position}; ${p.gaze}. Interaction: ${p.interaction}.`
  ).join('\n');

  const prompt = input.enabled
    ? `GROUP SELFIE MODE: total people=${resolvedSize}. The reference-image subject remains the only identity-locked person and the only person holding the Xiaomi 15 Ultra front-camera phone. The main subject's outfit remains controlled exclusively by the main clothing selector and MUST NOT be changed by group clothing controls. Relationship: ${relationshipLabel(relationship)}. Arrangement: ${arrangement}. Camera distance should be about ${recommendedDistanceCm}cm, remaining within real one-arm reach. GROUP COMPANION CLOTHING: preset=${clothingOption.labelAR}; diversity=${clothingDiversity}; consistency=${uniformConsistency}. ${clothingOption.realismRules.join('; ')}.\n${cast}\nANTI-CLONING: every companion must be a genuinely different individual. Do not reuse the reference subject's face, skull shape, hairline, beard pattern, body proportions, height, or outfit. Do not reuse one companion's face on another companion. Preserve the listed differences in face geometry, height, body build, hair, facial hair, complexion, eyewear, and clothing. Faces must not look like siblings, twins, clones, face-swaps, or variations of one latent identity.`
    : '';

  const physicsGuards = input.enabled ? [
    'only the reference subject holds the capturing phone; companions do not duplicate the selfie arm',
    'all heads occupy separate physical positions with plausible shoulder and torso overlap',
    'nearer faces are slightly larger according to 21mm perspective; deeper companions scale down naturally',
    'no duplicated hands, mirrored poses, repeated facial geometry, or identical clothing silhouettes',
    'all feet/hips/shoulders obey the furniture, floor, seat, corridor, vehicle, or wall geometry of the selected micro-location',
    'group width and depth must remain inside the Xiaomi 15 Ultra front-camera field of view and real arm reach',
    'background people generated by the background engine are separate secondary extras and must not be mistaken for group members'
  ] : [];

  return {
    enabled: Boolean(input.enabled),
    requestedSize,
    resolvedSize,
    companionCount,
    maxByLocation,
    relationship,
    arrangement,
    requiredFraming,
    recommendedDistanceCm,
    profiles,
    antiCloningPassed: uniqueness.passed,
    uniquenessScore: uniqueness.score,
    validationNotes,
    prompt,
    physicsGuards
  };
}
