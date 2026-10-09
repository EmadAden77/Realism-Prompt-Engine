import type { Framing } from './physicsEngine';
import type { MicroLocation, SceneFamilyId } from '../data/microLocations';

export type GroupSelfieSize = 2 | 3 | 4 | 5;
export type GroupSelfieRelationship = 'auto' | 'coworkers' | 'friends' | 'family' | 'gym-friends';

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
  measuredSpaceWidthMeters?: number;
}

export interface ResolvedGroupSelfie {
  enabled: boolean;
  requestedSize: GroupSelfieSize;
  resolvedSize: GroupSelfieSize;
  companionCount: number;
  maxByLocation: GroupSelfieSize;
  relationship: Exclude<GroupSelfieRelationship, 'auto'>;
  arrangement: string;
  requiredFraming: Framing;
  recommendedDistanceCm: number;
  profiles: GroupCompanionProfile[];
  antiCloningPassed: boolean;
  uniquenessScore: number;
  validationNotes: string[];
  prompt: string;
  physicsGuards: string[];
  shoulderClearance?: ReturnType<typeof estimateShoulderClearance>;
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
  arrangement: string
): GroupCompanionProfile[] {
  const seed = hash(`${familyId}|${subScene}|${relationship}`);
  const offsets = {
    face: seed % FACE_SHAPES.length,
    jaw: (seed + 1) % JAWS.length,
    eyes: (seed + 2) % EYES.length,
    nose: (seed + 3) % NOSES.length,
    hair: (seed + 4) % HAIR.length,
    beard: (seed + 5) % FACIAL_HAIR.length,
    build: (seed + 6) % BUILDS.length,
    height: (seed + 7) % HEIGHTS.length,
    outfit: (seed + 2) % OUTFITS[familyId].length
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
    outfit: pickDistinct(OUTFITS[familyId], offsets.outfit, i),
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

export function evaluateAntiCloning(profiles: GroupCompanionProfile[]): { passed: boolean; score: number; notes: string[] } {
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
        a.outfit === b.outfit
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
  const profiles = buildProfiles(input.familyId, input.subScene, companionCount, relationship, arrangement);
  const uniqueness = evaluateAntiCloning(profiles);

  const recommendedDistanceCm =
    resolvedSize === 2 ? 46 :
    resolvedSize === 3 ? 56 :
    resolvedSize === 4 ? 59 : 60;

  const shoulderClearance = estimateShoulderClearance({spaceWidthMeters: input.measuredSpaceWidthMeters,personCount:resolvedSize});
  const validationNotes: string[] = [];
  if (shoulderClearance.clearanceConstraint === 'tight') validationNotes.push('Lateral group clearance is tight; no particular person or shoulder is assumed cropped.');
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
    ? `GROUP SELFIE MODE: total people=${resolvedSize}. The reference-image subject remains the only identity-locked person and the only person holding the Xiaomi 15 Ultra front-camera phone. Relationship: ${relationshipLabel(relationship)}. Arrangement: ${arrangement}. Camera distance should be about ${recommendedDistanceCm}cm, remaining within real one-arm reach.\n${cast}\nANTI-CLONING: every companion must be a genuinely different individual. Do not reuse the reference subject's face, skull shape, hairline, beard pattern, body proportions, height, or outfit. Do not reuse one companion's face on another companion. Preserve the listed differences in face geometry, height, body build, hair, facial hair, complexion, eyewear, and clothing. Faces must not look like siblings, twins, clones, face-swaps, or variations of one latent identity.`
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
    physicsGuards,
    shoulderClearance
  };
}

/** Clearance estimate, not a per-person projection or proof of a cropped shoulder. */
export function estimateShoulderClearance(input: {
  spaceWidthMeters?: number; personCount: number; shoulderWidthCm?: number;
}): { clearanceConstraint: 'tight' | 'open' | 'unknown'; maxSideBySide: number | null; overlapProbable: boolean; evidence: string[] } {
  const {spaceWidthMeters,personCount,shoulderWidthCm=47}=input;
  if (!Number.isFinite(spaceWidthMeters) || !spaceWidthMeters || spaceWidthMeters <= 0 ||
      !Number.isFinite(shoulderWidthCm) || shoulderWidthCm <= 0 || !Number.isInteger(personCount) || personCount < 1) {
    return {clearanceConstraint:'unknown',maxSideBySide:null,overlapProbable:false,evidence:['insufficient measured lateral clearance']};
  }
  const maxSideBySide = Math.max(0,Math.floor(spaceWidthMeters*100/shoulderWidthCm));
  const tight = personCount > maxSideBySide;
  return {clearanceConstraint:tight?'tight':'open',maxSideBySide,overlapProbable:tight,
    evidence:[`spaceWidthMeters=${spaceWidthMeters}`,`personCount=${personCount}`,`assumedShoulderWidthCm=${shoulderWidthCm}`,
      'lateral occupancy estimate only; no specific cropped shoulder is inferred']};
}
