import { SceneFamilyId } from '../data/microLocations';

export type SelfieAngleMode = 'manual' | 'gemini-smart';
export type SelfieAngleRisk = 'low' | 'medium' | 'high';
export type SelfieLegacyAngle = 'eye-level' | 'slightly-high' | 'slightly-low' | 'slightly-off-center';
export type SelfieFraming = 'head-shoulders' | 'chest-up' | 'half-body';

export interface SelfieAnglePreset {
  id: string;
  labelAR: string;
  family: 'natural' | 'high' | 'low' | 'off-axis' | 'seated' | 'reclined' | 'walking' | 'vehicle' | 'environmental';
  legacyAngle: SelfieLegacyAngle;
  pitchDeg: number;
  yawDeg: number;
  rollDeg: number;
  heightOffsetCm: number;
  distanceCm: number;
  variation: {
    pitchDeg: number;
    yawDeg: number;
    rollDeg: number;
    distanceCm: number;
  };
  framings: SelfieFraming[];
  sceneFamilies?: SceneFamilyId[];
  poseKeywords?: string[];
  subSceneKeywords?: string[];
  risk: SelfieAngleRisk;
  intent: string;
}

export interface SelfieAngleAdvice {
  angleId: string;
  pitchOffsetDeg: number;
  yawOffsetDeg: number;
  rollOffsetDeg: number;
  distanceOffsetCm: number;
  reasonAR: string[];
  confidence?: number;
  cacheKey?: string;
}

export interface SelfieAngleContext {
  captureType: 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
  sceneFamily: SceneFamilyId | null;
  subScene: string;
  pose: string;
  activity: string;
  framing: SelfieFraming;
  manualAngle: SelfieLegacyAngle;
  mode?: SelfieAngleMode;
  advice?: SelfieAngleAdvice;
}

export interface ResolvedSelfieAngle {
  mode: SelfieAngleMode;
  presetId: string | null;
  presetLabelAR: string;
  legacyAngle: SelfieLegacyAngle;
  pitchDeg: number;
  yawDeg: number;
  rollDeg: number;
  heightOffsetCm: number;
  distanceCm: number;
  armMechanics: string;
  cameraPosition: string;
  cameraDirection: string;
  risk: SelfieAngleRisk;
  source: 'manual' | 'gemini' | 'local-fallback';
  adviceAccepted: boolean;
  reasonAR: string[];
}

const A = (
  id: string,
  labelAR: string,
  family: SelfieAnglePreset['family'],
  legacyAngle: SelfieLegacyAngle,
  pitchDeg: number,
  yawDeg: number,
  rollDeg: number,
  heightOffsetCm: number,
  distanceCm: number,
  framings: SelfieFraming[],
  risk: SelfieAngleRisk,
  intent: string,
  extras: Partial<Pick<SelfieAnglePreset, 'sceneFamilies' | 'poseKeywords' | 'subSceneKeywords' | 'variation'>> = {}
): SelfieAnglePreset => ({
  id,
  labelAR,
  family,
  legacyAngle,
  pitchDeg,
  yawDeg,
  rollDeg,
  heightOffsetCm,
  distanceCm,
  framings,
  risk,
  intent,
  variation: extras.variation ?? { pitchDeg: 2, yawDeg: 3, rollDeg: 2, distanceCm: 4 },
  sceneFamilies: extras.sceneFamilies,
  poseKeywords: extras.poseKeywords,
  subSceneKeywords: extras.subSceneKeywords
});

export const SELFIE_ANGLE_LIBRARY: SelfieAnglePreset[] = [
  A('eye_natural_center', 'مستوى العين الطبيعي', 'natural', 'eye-level', 0, 0, 0, 0, 52, ['head-shoulders','chest-up'], 'low', 'neutral everyday selfie with minimal perspective bias'),
  A('eye_natural_left', 'مستوى العين بانحراف يسار خفيف', 'natural', 'slightly-off-center', -1, -8, -1, 1, 52, ['head-shoulders','chest-up'], 'low', 'subtle left-side handheld asymmetry'),
  A('eye_natural_right', 'مستوى العين بانحراف يمين خفيف', 'natural', 'slightly-off-center', -1, 8, 1, 1, 52, ['head-shoulders','chest-up'], 'low', 'subtle right-side handheld asymmetry'),
  A('eye_close_relaxed', 'قريب طبيعي للوجه', 'natural', 'eye-level', -1, 3, 0, 2, 42, ['head-shoulders'], 'low', 'close face selfie without macro or fisheye exaggeration'),
  A('eye_close_asymmetric', 'قريب عفوي خارج المنتصف', 'off-axis', 'slightly-off-center', -2, 11, 2, 2, 43, ['head-shoulders'], 'low', 'tight candid selfie with mild asymmetry'),

  A('high_soft_center', 'أعلى قليلًا ناعم', 'high', 'slightly-high', -8, 0, 0, 10, 49, ['head-shoulders','chest-up'], 'low', 'gentle elevated phone position with natural downward pitch'),
  A('high_soft_left', 'أعلى قليلًا من اليسار', 'high', 'slightly-high', -9, -9, -1, 11, 49, ['head-shoulders','chest-up'], 'low', 'soft elevated diagonal selfie from left'),
  A('high_soft_right', 'أعلى قليلًا من اليمين', 'high', 'slightly-high', -9, 9, 1, 11, 49, ['head-shoulders','chest-up'], 'low', 'soft elevated diagonal selfie from right'),
  A('high_seated_relaxed', 'علوي مريح أثناء الجلوس', 'seated', 'slightly-high', -11, 7, 1, 14, 48, ['head-shoulders','chest-up'], 'low', 'comfortable seated selfie that reveals a little more lap/background', { poseKeywords:['جالس','مسترخ'] }),
  A('high_environment_soft', 'علوي خفيف مع خلفية', 'environmental', 'slightly-high', -7, 5, 1, 9, 62, ['half-body'], 'medium', 'wider environmental selfie with restrained elevated phone', { variation:{pitchDeg:2,yawDeg:3,rollDeg:1,distanceCm:3} }),

  A('low_soft_center', 'أسفل قليلًا طبيعي', 'low', 'slightly-low', 7, 0, 0, -9, 52, ['head-shoulders','chest-up'], 'low', 'mild low-angle selfie without heroic exaggeration'),
  A('low_soft_left', 'أسفل قليلًا من اليسار', 'low', 'slightly-low', 8, -8, -1, -10, 53, ['chest-up'], 'low', 'mild low diagonal selfie from left'),
  A('low_soft_right', 'أسفل قليلًا من اليمين', 'low', 'slightly-low', 8, 8, 1, -10, 53, ['chest-up'], 'low', 'mild low diagonal selfie from right'),
  A('low_standing_environment', 'أسفل خفيف مع نصف الجسم', 'environmental', 'slightly-low', 6, 7, 1, -8, 67, ['half-body'], 'medium', 'wide standing selfie with subtle upward camera direction'),

  A('offaxis_left_12', 'خارج المنتصف يسار 12°', 'off-axis', 'slightly-off-center', -3, -12, -1, 3, 52, ['head-shoulders','chest-up'], 'low', 'natural one-handed left-biased phone placement'),
  A('offaxis_right_12', 'خارج المنتصف يمين 12°', 'off-axis', 'slightly-off-center', -3, 12, 1, 3, 52, ['head-shoulders','chest-up'], 'low', 'natural one-handed right-biased phone placement'),
  A('offaxis_left_18', 'خارج المنتصف يسار 18°', 'off-axis', 'slightly-off-center', -4, -18, -2, 4, 54, ['chest-up'], 'medium', 'stronger but still plausible handheld three-quarter selfie'),
  A('offaxis_right_18', 'خارج المنتصف يمين 18°', 'off-axis', 'slightly-off-center', -4, 18, 2, 4, 54, ['chest-up'], 'medium', 'stronger but still plausible handheld three-quarter selfie'),

  A('seated_eye_relaxed', 'جلوس بمستوى العين', 'seated', 'eye-level', -2, 6, 1, 1, 50, ['head-shoulders','chest-up'], 'low', 'natural seated selfie with relaxed shoulder mechanics', { poseKeywords:['جالس','مسترخ'] }),
  A('seated_low_casual', 'جلوس من مستوى منخفض خفيف', 'seated', 'slightly-low', 5, 7, 1, -7, 50, ['chest-up'], 'low', 'casual seated selfie from slightly lower phone height', { poseKeywords:['جالس'] }),
  A('cafe_seated_diagonal', 'جلوس مقهى بزاوية قطرية', 'seated', 'slightly-off-center', -5, 13, 1, 6, 51, ['chest-up'], 'low', 'café seated selfie with natural diagonal framing', { sceneFamilies:['saudi-outdoor'], subSceneKeywords:['مقهى'], poseKeywords:['جالس'] }),
  A('bed_edge_high', 'حافة السرير من أعلى قليلًا', 'seated', 'slightly-high', -12, 6, 1, 15, 47, ['head-shoulders','chest-up'], 'low', 'bed-edge selfie showing believable mattress/background geometry', { sceneFamilies:['bedroom'], poseKeywords:['حافة السرير','جالس'] }),
  A('bed_edge_side', 'حافة السرير جانبية عفوية', 'seated', 'slightly-off-center', -6, 15, 2, 7, 49, ['chest-up'], 'low', 'bed-edge selfie with mild lateral shoulder lead', { sceneFamilies:['bedroom'], poseKeywords:['حافة السرير','جالس'] }),

  A('reclined_high_soft', 'استلقاء جزئي من أعلى', 'reclined', 'slightly-high', -15, 5, 1, 17, 44, ['head-shoulders','chest-up'], 'medium', 'semi-reclined selfie with phone naturally above face plane', { sceneFamilies:['bedroom','living-room'], poseKeywords:['مستلقي','مسترخ','نصف مستلق'] }),
  A('reclined_side_soft', 'استلقاء جانبي خفيف', 'reclined', 'slightly-off-center', -10, 14, 2, 12, 45, ['head-shoulders'], 'medium', 'reclined side-biased selfie with realistic wrist rotation', { sceneFamilies:['bedroom','living-room'], poseKeywords:['مستلقي','مسترخ'] }),
  A('lying_overhead_restrained', 'استلقاء علوي مضبوط', 'reclined', 'slightly-high', -20, 2, 0, 20, 43, ['head-shoulders'], 'high', 'highest practical handheld overhead-like selfie without impossible bird-eye geometry', { sceneFamilies:['bedroom'], poseKeywords:['مستلقي'], variation:{pitchDeg:2,yawDeg:2,rollDeg:1,distanceCm:2} }),

  A('walking_forward_soft', 'سيلفي مشي أمامي', 'walking', 'eye-level', -2, 5, 2, 1, 56, ['chest-up'], 'medium', 'walking selfie with slightly longer reach and mild frame roll', { sceneFamilies:['saudi-outdoor','military-base'], poseKeywords:['يمشي'] }),
  A('walking_side_dynamic', 'سيلفي مشي جانبي خفيف', 'walking', 'slightly-off-center', -3, 14, 3, 2, 57, ['chest-up'], 'medium', 'walking selfie with natural lateral phone displacement, not cinematic dutch tilt', { sceneFamilies:['saudi-outdoor','military-base'], poseKeywords:['يمشي'] }),
  A('wall_lean_relaxed', 'استناد على جدار بزاوية خفيفة', 'off-axis', 'slightly-off-center', -4, 15, 2, 4, 53, ['chest-up','half-body'], 'low', 'selfie aligned with a natural wall-lean torso rotation', { poseKeywords:['مستند','جدار'] }),

  A('car_driver_eye', 'مقعد السائق مستوى العين', 'vehicle', 'eye-level', -2, 7, 1, 1, 48, ['head-shoulders','chest-up'], 'low', 'driver-seat selfie respecting steering-wheel and cabin clearance', { sceneFamilies:['car'], subSceneKeywords:['السائق','داخل السيارة','المقود'] }),
  A('car_driver_offaxis', 'مقعد السائق خارج المنتصف', 'vehicle', 'slightly-off-center', -5, 14, 1, 5, 49, ['chest-up'], 'low', 'driver-seat selfie angled away from steering-wheel obstruction', { sceneFamilies:['car'], subSceneKeywords:['السائق','داخل السيارة','المقود'] }),
  A('car_passenger_high_soft', 'مقعد الراكب أعلى قليلًا', 'vehicle', 'slightly-high', -8, -8, -1, 9, 49, ['head-shoulders','chest-up'], 'low', 'passenger-seat selfie with natural cabin and side-window inclusion', { sceneFamilies:['car'], subSceneKeywords:['الراكب'] }),

  A('corridor_offaxis', 'ممر داخلي خارج المنتصف', 'environmental', 'slightly-off-center', -3, 12, 1, 3, 54, ['chest-up'], 'low', 'corridor selfie preserving depth lines without architectural distortion', { sceneFamilies:['military-base'], subSceneKeywords:['ممر'] }),
  A('corridor_wide', 'ممر واسع مع عمق', 'environmental', 'slightly-off-center', -2, 9, 1, 2, 66, ['half-body'], 'medium', 'wider corridor selfie with strong but plausible depth visibility', { sceneFamilies:['military-base'], subSceneKeywords:['ممر'] }),
  A('gym_postworkout_high', 'بعد التمرين أعلى قليلًا', 'high', 'slightly-high', -9, 8, 2, 11, 50, ['head-shoulders','chest-up'], 'low', 'post-workout front selfie with natural fatigue-friendly elevated grip', { sceneFamilies:['gym'] }),
  A('standing_environment_left', 'وقوف بخلفية أوسع يسار', 'environmental', 'slightly-off-center', -3, -10, -1, 2, 67, ['half-body'], 'medium', 'wide environmental selfie preserving ordinary background context'),
  A('standing_environment_right', 'وقوف بخلفية أوسع يمين', 'environmental', 'slightly-off-center', -3, 10, 1, 2, 67, ['half-body'], 'medium', 'wide environmental selfie preserving ordinary background context')
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const containsAny = (value: string, terms: string[] | undefined) =>
  !terms?.length || terms.some(term => value.includes(term));

const framingDistanceLimits: Record<SelfieFraming, [number, number]> = {
  'head-shoulders': [39, 47],
  'chest-up': [47, 58],
  'half-body': [62, 70]
};

export function getEligibleSelfieAngles(context: SelfieAngleContext): SelfieAnglePreset[] {
  if (context.captureType !== 'front-selfie') return [];

  return SELFIE_ANGLE_LIBRARY.filter(preset => {
    if (!preset.framings.includes(context.framing)) return false;
    if (preset.sceneFamilies?.length && context.sceneFamily && !preset.sceneFamilies.includes(context.sceneFamily)) return false;
    if (preset.poseKeywords?.length && !containsAny(context.pose, preset.poseKeywords)) return false;
    if (preset.subSceneKeywords?.length && !containsAny(context.subScene, preset.subSceneKeywords)) return false;
    return true;
  });
}

function compatibilityScore(preset: SelfieAnglePreset, context: SelfieAngleContext): number {
  let score = preset.risk === 'low' ? 30 : preset.risk === 'medium' ? 20 : 10;

  if (preset.sceneFamilies?.includes(context.sceneFamily as SceneFamilyId)) score += 30;
  if (preset.poseKeywords?.some(k => context.pose.includes(k))) score += 25;
  if (preset.subSceneKeywords?.some(k => context.subScene.includes(k))) score += 25;

  if (context.pose.includes('يمشي') && preset.family === 'walking') score += 35;
  if ((context.pose.includes('جالس') || context.pose.includes('مسترخ')) && preset.family === 'seated') score += 25;
  if ((context.pose.includes('مستلقي') || context.pose.includes('نصف مستلق')) && preset.family === 'reclined') score += 40;
  if (context.sceneFamily === 'car' && preset.family === 'vehicle') score += 40;
  if (context.framing === 'half-body' && preset.family === 'environmental') score += 25;
  if (context.framing === 'head-shoulders' && preset.id.includes('close')) score += 20;

  return score;
}

export function chooseDeterministicSelfieAngle(context: SelfieAngleContext): SelfieAnglePreset {
  const eligible = getEligibleSelfieAngles(context);
  const pool = eligible.length
    ? eligible
    : SELFIE_ANGLE_LIBRARY.filter(preset => preset.framings.includes(context.framing));

  return [...pool].sort((a, b) => compatibilityScore(b, context) - compatibilityScore(a, context))[0]
    ?? SELFIE_ANGLE_LIBRARY[0];
}

export function resolveSelfieAngleGeometry(context: SelfieAngleContext): ResolvedSelfieAngle | null {
  if (context.captureType !== 'front-selfie') return null;

  // Manual mode is intentionally left to the legacy physics path so this feature
  // cannot change established camera distances/angles for existing users.
  if ((context.mode ?? 'manual') === 'manual') return null;

  const fallback = chooseDeterministicSelfieAngle(context);
  const eligibleIds = new Set(getEligibleSelfieAngles(context).map(x => x.id));
  const advisedPreset = context.advice?.angleId
    ? SELFIE_ANGLE_LIBRARY.find(x => x.id === context.advice?.angleId)
    : undefined;

  const adviceAccepted = Boolean(advisedPreset && eligibleIds.has(advisedPreset.id));
  const preset = adviceAccepted ? advisedPreset! : fallback;
  const advice = adviceAccepted ? context.advice : undefined;

  const pitchDeg = preset.pitchDeg + clamp(advice?.pitchOffsetDeg ?? 0, -preset.variation.pitchDeg, preset.variation.pitchDeg);
  const yawDeg = preset.yawDeg + clamp(advice?.yawOffsetDeg ?? 0, -preset.variation.yawDeg, preset.variation.yawDeg);
  const rollDeg = preset.rollDeg + clamp(advice?.rollOffsetDeg ?? 0, -preset.variation.rollDeg, preset.variation.rollDeg);

  const [minDistance, maxDistance] = framingDistanceLimits[context.framing];
  const rawDistance = preset.distanceCm + clamp(advice?.distanceOffsetCm ?? 0, -preset.variation.distanceCm, preset.variation.distanceCm);
  const distanceCm = clamp(rawDistance, minDistance, maxDistance);

  const reasonAR = adviceAccepted
    ? (context.advice?.reasonAR?.slice(0, 2) ?? ['اختار Gemini زاوية متوافقة مع المشهد.'])
    : ['تم اختيار أفضل زاوية محليًا لأن اقتراح Gemini غير متوفر أو غير متوافق مع الفيزياء.'];

  return {
    mode: 'gemini-smart',
    presetId: preset.id,
    presetLabelAR: preset.labelAR,
    legacyAngle: preset.legacyAngle,
    pitchDeg,
    yawDeg,
    rollDeg,
    heightOffsetCm: preset.heightOffsetCm,
    distanceCm,
    armMechanics: describeArmMechanics(distanceCm, context.pose),
    cameraPosition: describeCameraPosition(preset.heightOffsetCm),
    cameraDirection: describeDirection(pitchDeg, yawDeg, rollDeg),
    risk: preset.risk,
    source: adviceAccepted ? 'gemini' : 'local-fallback',
    adviceAccepted,
    reasonAR
  };
}

function describeArmMechanics(distanceCm: number, pose: string): string {
  const posture = pose.includes('مستلقي') || pose.includes('نصف مستلق')
    ? 'with shoulder supported by the reclined body posture'
    : pose.includes('جالس') || pose.includes('مسترخ')
      ? 'with relaxed seated shoulder elevation'
      : 'with natural standing shoulder elevation';

  if (distanceCm <= 46) {
    return `dominant arm held at close selfie reach (~${Math.round(distanceCm)}cm), elbow flexed roughly 60°-75° ${posture}, wrist only mildly rotated`;
  }
  if (distanceCm <= 58) {
    return `dominant arm at comfortable selfie reach (~${Math.round(distanceCm)}cm), elbow flexed roughly 35°-50° ${posture}, no shoulder overextension`;
  }
  return `dominant arm near functional maximum selfie reach (~${Math.round(distanceCm)}cm), elbow close to extension ${posture}, subtle torso compensation allowed but no impossible floating camera`;
}

function describeCameraPosition(heightOffsetCm: number): string {
  if (heightOffsetCm >= 8) return `phone center approximately ${Math.round(heightOffsetCm)}cm above eye line`;
  if (heightOffsetCm <= -8) return `phone center approximately ${Math.abs(Math.round(heightOffsetCm))}cm below eye line`;
  return `phone center within approximately ${Math.abs(Math.round(heightOffsetCm))}cm of eye line`;
}

function describeDirection(pitchDeg: number, yawDeg: number, rollDeg: number): string {
  const pitch = pitchDeg < -1 ? `${Math.abs(Math.round(pitchDeg))}° downward pitch` : pitchDeg > 1 ? `${Math.round(pitchDeg)}° upward pitch` : 'near-zero pitch';
  const yaw = yawDeg < -1 ? `${Math.abs(Math.round(yawDeg))}° left yaw` : yawDeg > 1 ? `${Math.round(yawDeg)}° right yaw` : 'near-zero yaw';
  const roll = Math.abs(rollDeg) > 0.5 ? `${Math.abs(Math.round(rollDeg))}° natural frame roll` : 'near-zero roll';
  return `${pitch}, ${yaw}, ${roll}`;
}
