import { SceneFamilyId } from '../data/microLocations';
import {
  BackgroundMode,
  BackgroundControlDensity,
  BackgroundDisorderControl,
  BackgroundActivityControl,
  BackgroundPresenceControl,
  BackgroundCompositionGoal,
  deriveAngleIntentFromBackground
} from './backgroundRealism';

export type SelfieAngleMode = 'manual' | 'gemini-smart';
export type SelfieAngleRisk = 'low' | 'medium' | 'high';
export type SelfieLegacyAngle = 'eye-level' | 'slightly-high' | 'slightly-low' | 'slightly-off-center';
export type SelfieFraming = 'head-shoulders' | 'chest-up' | 'half-body';
export type CarSelfieFocus = 'face-priority' | 'cabin-context' | 'balanced';
export type CarSeatRole = 'driver' | 'front-passenger' | 'rear-passenger' | 'either';

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
  lightingKeywords?: string[];
  carFocus?: CarSelfieFocus;
  carSeat?: CarSeatRole;
  phonePlacement?: string;
  cabinGuards?: string[];
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
  carFocus?: CarSelfieFocus;
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
  timeOfDay?: 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
  lightingMode?: string;
  backgroundAutoAngle?: boolean;
  backgroundMode?: BackgroundMode;
  backgroundHumans?: BackgroundControlDensity;
  backgroundVehicles?: BackgroundControlDensity;
  backgroundDisorder?: BackgroundDisorderControl;
  backgroundActivity?: BackgroundActivityControl;
  backgroundPresence?: BackgroundPresenceControl;
  backgroundCompositionGoal?: BackgroundCompositionGoal;
  groupSelfieEnabled?: boolean;
  groupSelfieSize?: 2 | 3 | 4 | 5;
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
  carFocus?: CarSelfieFocus;
  carSeat?: CarSeatRole;
  phonePlacement?: string;
  cabinGuards?: string[];
  carClearanceAdjusted?: boolean;
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
  extras: Partial<Pick<SelfieAnglePreset, 'sceneFamilies' | 'poseKeywords' | 'subSceneKeywords' | 'lightingKeywords' | 'carFocus' | 'carSeat' | 'phonePlacement' | 'cabinGuards' | 'variation'>> = {}
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
  subSceneKeywords: extras.subSceneKeywords,
  lightingKeywords: extras.lightingKeywords,
  carFocus: extras.carFocus,
  carSeat: extras.carSeat,
  phonePlacement: extras.phonePlacement,
  cabinGuards: extras.cabinGuards
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
  A('high_environment_soft', 'علوي خفيف مع خلفية', 'environmental', 'slightly-high', -7, 5, 1, 9, 60, ['half-body'], 'medium', 'wider environmental selfie with restrained elevated phone', { variation:{pitchDeg:2,yawDeg:3,rollDeg:1,distanceCm:3} }),

  A('low_soft_center', 'أسفل قليلًا طبيعي', 'low', 'slightly-low', 7, 0, 0, -9, 52, ['head-shoulders','chest-up'], 'low', 'mild low-angle selfie without heroic exaggeration'),
  A('low_soft_left', 'أسفل قليلًا من اليسار', 'low', 'slightly-low', 8, -8, -1, -10, 53, ['chest-up'], 'low', 'mild low diagonal selfie from left'),
  A('low_soft_right', 'أسفل قليلًا من اليمين', 'low', 'slightly-low', 8, 8, 1, -10, 53, ['chest-up'], 'low', 'mild low diagonal selfie from right'),
  A('low_standing_environment', 'أسفل خفيف مع نصف الجسم', 'environmental', 'slightly-low', 6, 7, 1, -8, 60, ['half-body'], 'medium', 'wide standing selfie with subtle upward camera direction'),

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

  A('car_driver_eye', 'مقعد السائق مستوى العين', 'vehicle', 'eye-level', -2, 7, 1, 1, 48, ['head-shoulders','chest-up'], 'low', 'face-priority driver-seat selfie with minimal cabin distortion', {
    sceneFamilies:['car'],
    carFocus:'face-priority',
    carSeat:'driver',
    phonePlacement:'slightly above the steering-wheel upper rim, fully inside the driver-side cabin',
    cabinGuards:['keep phone clear of steering-wheel rim','keep phone below roof/headliner plane','do not place camera through windshield or side glass']
  }),
  A('car_driver_offaxis', 'مقعد السائق خارج المنتصف', 'vehicle', 'slightly-off-center', -5, 14, 1, 5, 49, ['chest-up'], 'low', 'balanced driver-seat selfie angled toward the center console while preserving face prominence', {
    sceneFamilies:['car'],
    carFocus:'balanced',
    carSeat:'driver',
    phonePlacement:'slightly toward the center console, above steering-wheel level',
    cabinGuards:['maintain clearance from steering wheel and gear selector','keep camera inside cabin','avoid rearview-mirror collision']
  }),
  A('car_driver_window_side', 'مقعد السائق باتجاه النافذة', 'vehicle', 'slightly-off-center', -3, -10, -1, 3, 49, ['head-shoulders','chest-up'], 'low', 'driver-side window-biased selfie using natural side-light and door context', {
    sceneFamilies:['car'],
    carFocus:'balanced',
    carSeat:'driver',
    phonePlacement:'near the driver-side window line but still clearly inside the glass',
    cabinGuards:['never move camera outside side window','preserve A-pillar clearance','keep elbow clear of door glass']
  }),
  A('car_driver_high_relaxed', 'مقعد السائق أعلى قليلًا باسترخاء', 'vehicle', 'slightly-high', -8, 6, 1, 9, 48, ['head-shoulders','chest-up'], 'low', 'slightly elevated relaxed driver-seat selfie that avoids steering-wheel dominance', {
    sceneFamilies:['car'],
    carFocus:'face-priority',
    carSeat:'driver',
    phonePlacement:'above steering-wheel line and below sun-visor/headliner zone',
    cabinGuards:['keep phone below sun visor','avoid roof/headliner collision','retain realistic shoulder and wrist range']
  }),
  A('car_driver_screen_light', 'مقعد السائق بإضاءة شاشة الهاتف', 'vehicle', 'eye-level', -3, 6, 0, 2, 47, ['head-shoulders','chest-up'], 'low', 'close night driver selfie optimized for physically plausible phone-screen facial illumination', {
    sceneFamilies:['car'],
    lightingKeywords:['شاشة الهاتف'],
    carFocus:'face-priority',
    carSeat:'driver',
    phonePlacement:'close to eye line, slightly above the steering wheel and inside cabin',
    cabinGuards:['keep screen close enough to plausibly illuminate face','do not use windshield as camera plane','background must remain substantially darker']
  }),
  A('car_driver_cabin_context', 'مقعد السائق مع سياق المقصورة', 'vehicle', 'slightly-off-center', -4, 12, 1, 4, 55, ['chest-up'], 'medium', 'driver selfie prioritizing visible steering wheel, dashboard, and side-window context without losing the face', {
    sceneFamilies:['car'],
    carFocus:'cabin-context',
    carSeat:'driver',
    phonePlacement:'toward the center-console side at comfortable arm reach',
    cabinGuards:['steering wheel may enter lower frame only','keep camera forward of face but behind windshield plane','avoid gear-selector and rearview-mirror collision']
  }),
  A('car_driver_cabin_wide', 'مقعد السائق بزاوية مقصورة أوسع', 'vehicle', 'slightly-off-center', -3, 9, 1, 3, 60, ['half-body'], 'high', 'widest physically defensible driver selfie for cabin context with strong occlusion constraints', {
    sceneFamilies:['car'],
    carFocus:'cabin-context',
    carSeat:'driver',
    phonePlacement:'near maximum arm reach toward cabin center, still behind windshield and below headliner',
    cabinGuards:['maximum cabin reach only','do not pass through windshield','keep phone below rearview mirror and roof console','steering wheel/console must naturally occlude lower torso'],
    variation:{pitchDeg:1,yawDeg:2,rollDeg:1,distanceCm:2}
  }),
  A('car_passenger_high_soft', 'مقعد الراكب أعلى قليلًا', 'vehicle', 'slightly-high', -8, -8, -1, 9, 49, ['head-shoulders','chest-up'], 'low', 'face-priority passenger-seat selfie with natural side-window inclusion', {
    sceneFamilies:['car'],
    carFocus:'face-priority',
    carSeat:'front-passenger',
    phonePlacement:'slightly above eye line on passenger side, clear of roof and visor',
    cabinGuards:['keep phone below sun visor','keep camera inside passenger-side window plane','no dashboard penetration']
  }),
  A('car_passenger_window_side', 'مقعد الراكب باتجاه النافذة', 'vehicle', 'slightly-off-center', -4, 11, 1, 4, 50, ['head-shoulders','chest-up'], 'low', 'passenger selfie biased toward the side window for natural exterior light and glass context', {
    sceneFamilies:['car'],
    carFocus:'balanced',
    carSeat:'front-passenger',
    phonePlacement:'near passenger-side window while remaining fully inside the cabin',
    cabinGuards:['do not move camera outside glass','preserve door-panel clearance','avoid visor and A-pillar collision']
  }),
  A('car_passenger_cabin_context', 'مقعد الراكب مع سياق المقصورة', 'vehicle', 'slightly-off-center', -4, -12, -1, 4, 55, ['chest-up'], 'medium', 'passenger selfie looking diagonally across center console to reveal dashboard and driver-side depth', {
    sceneFamilies:['car'],
    carFocus:'cabin-context',
    carSeat:'front-passenger',
    phonePlacement:'toward the center console from passenger seat',
    cabinGuards:['keep phone above console surfaces','do not intersect dashboard','preserve windshield plane ahead of camera']
  }),
  A('car_rear_eye', 'المقعد الخلفي مستوى العين', 'vehicle', 'eye-level', -2, 5, 1, 1, 49, ['head-shoulders','chest-up'], 'low', 'face-priority rear-seat selfie with front seatbacks forming natural depth', {
    sceneFamilies:['car'],
    carFocus:'face-priority',
    carSeat:'rear-passenger',
    phonePlacement:'in front of rear passenger at eye level, clear of front-seat headrest',
    cabinGuards:['do not intersect front-seat headrest','keep camera inside rear side-window plane','preserve seatbelt and seatback occlusion']
  }),
  A('car_rear_window_side', 'المقعد الخلفي باتجاه النافذة', 'vehicle', 'slightly-off-center', -4, 12, 1, 3, 50, ['head-shoulders','chest-up'], 'low', 'rear-seat window-biased selfie with plausible side-light and cabin depth', {
    sceneFamilies:['car'],
    carFocus:'balanced',
    carSeat:'rear-passenger',
    phonePlacement:'near rear side-window line but fully inside cabin',
    cabinGuards:['never place camera outside rear glass','avoid B/C-pillar collision','keep front seatback as natural midground occluder']
  }),
  A('car_rear_cabin_context', 'المقعد الخلفي مع عمق المقصورة', 'vehicle', 'slightly-off-center', -3, -10, -1, 3, 56, ['chest-up'], 'medium', 'rear-seat selfie revealing front seatbacks and dashboard depth while retaining natural face scale', {
    sceneFamilies:['car'],
    carFocus:'cabin-context',
    carSeat:'rear-passenger',
    phonePlacement:'slightly toward cabin center from rear seat',
    cabinGuards:['keep camera behind front seatbacks','do not float camera between front seats','preserve realistic rear-seat arm reach']
  }),
  A('car_front_center_context', 'زاوية أمامية متوازنة للمقصورة', 'vehicle', 'slightly-off-center', -3, 8, 1, 3, 54, ['chest-up'], 'medium', 'balanced front-cabin selfie for ambiguous front-seat positions or between-seat context', {
    sceneFamilies:['car'],
    carFocus:'cabin-context',
    carSeat:'either',
    phonePlacement:'toward the front cabin centerline without crossing the windshield plane',
    cabinGuards:['keep camera behind windshield','keep clear of rearview mirror','do not float above center console']
  }),

  A('corridor_offaxis', 'ممر داخلي خارج المنتصف', 'environmental', 'slightly-off-center', -3, 12, 1, 3, 54, ['chest-up'], 'low', 'corridor selfie preserving depth lines without architectural distortion', { sceneFamilies:['military-base'], subSceneKeywords:['ممر'] }),
  A('corridor_wide', 'ممر واسع مع عمق', 'environmental', 'slightly-off-center', -2, 9, 1, 2, 60, ['half-body'], 'medium', 'wider corridor selfie with strong but plausible depth visibility', { sceneFamilies:['military-base'], subSceneKeywords:['ممر'] }),
  A('gym_postworkout_high', 'بعد التمرين أعلى قليلًا', 'high', 'slightly-high', -9, 8, 2, 11, 50, ['head-shoulders','chest-up'], 'low', 'post-workout front selfie with natural fatigue-friendly elevated grip', { sceneFamilies:['gym'] }),
  A('standing_environment_left', 'وقوف بخلفية أوسع يسار', 'environmental', 'slightly-off-center', -3, -10, -1, 2, 60, ['half-body'], 'medium', 'wide environmental selfie preserving ordinary background context'),
  A('standing_environment_right', 'وقوف بخلفية أوسع يمين', 'environmental', 'slightly-off-center', -3, 10, 1, 2, 60, ['half-body'], 'medium', 'wide environmental selfie preserving ordinary background context')
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const containsAny = (value: string, terms: string[] | undefined) =>
  !terms?.length || terms.some(term => value.includes(term));

export function isCarInteriorSelfieContext(context: Pick<SelfieAngleContext, 'sceneFamily' | 'subScene' | 'activity' | 'pose'>): boolean {
  if (context.sceneFamily !== 'car') return false;
  const sub = context.subScene || '';
  return [
    'مقعد السائق',
    'المقعد الأمامي للراكب',
    'بين المقعدين الأماميين',
    'المقعد الخلفي'
  ].some(term => sub.includes(term));
}

export function inferCarSeatRole(context: Pick<SelfieAngleContext, 'sceneFamily' | 'subScene' | 'activity' | 'pose'>): CarSeatRole {
  if (!isCarInteriorSelfieContext(context)) return 'either';
  const text = `${context.subScene} ${context.activity} ${context.pose}`;
  if (/المقعد الخلفي|خلفي/.test(text)) return 'rear-passenger';
  if (/الراكب/.test(text)) return 'front-passenger';
  if (/السائق|المقود|خلف المقود/.test(text)) return 'driver';
  return 'either';
}

const framingDistanceLimits: Record<SelfieFraming, [number, number]> = {
  'head-shoulders': [39, 47],
  'chest-up': [47, 58],
  'half-body': [56, 60]
};

export function getEligibleSelfieAngles(context: SelfieAngleContext): SelfieAnglePreset[] {
  if (context.captureType !== 'front-selfie') return [];

  const carInterior = isCarInteriorSelfieContext(context);
  const carSeat = inferCarSeatRole(context);

  return SELFIE_ANGLE_LIBRARY.filter(preset => {
    if (!preset.framings.includes(context.framing)) return false;
    if (preset.sceneFamilies?.length && context.sceneFamily && !preset.sceneFamilies.includes(context.sceneFamily)) return false;
    if (preset.poseKeywords?.length && !containsAny(context.pose, preset.poseKeywords)) return false;
    if (preset.subSceneKeywords?.length && !containsAny(context.subScene, preset.subSceneKeywords)) return false;
    if (preset.lightingKeywords?.length && !containsAny(context.lightingMode || '', preset.lightingKeywords)) return false;

    if (carInterior) {
      if (preset.family !== 'vehicle') return false;
      if (carSeat !== 'either' && preset.carSeat && preset.carSeat !== 'either' && preset.carSeat !== carSeat) return false;
    }

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

  if (isCarInteriorSelfieContext(context) && preset.family === 'vehicle') {
    const seat = inferCarSeatRole(context);
    if (seat !== 'either' && (preset.carSeat === seat || preset.carSeat === 'either')) score += 35;
    if ((context.lightingMode || '').includes('شاشة الهاتف') && preset.lightingKeywords?.includes('شاشة الهاتف')) score += 50;
    if ((context.lightingMode || '').includes('شاشة الهاتف') && preset.carFocus === 'face-priority') score += 25;
    if (context.framing === 'head-shoulders' && preset.carFocus === 'face-priority') score += 20;
    if (context.framing === 'half-body' && preset.carFocus === 'cabin-context') score += 45;
    if (context.subScene.includes('قرب النافذة') && preset.phonePlacement?.includes('window')) score += 25;
    if (context.subScene.includes('بين المقعدين') && preset.carFocus === 'cabin-context') score += 30;
  }

  if (context.framing === 'half-body' && preset.family === 'environmental') score += 25;
  if (context.framing === 'head-shoulders' && preset.id.includes('close')) score += 20;

  if (context.groupSelfieEnabled) {
    const size = context.groupSelfieSize ?? 2;
    if (size === 2) {
      if (preset.distanceCm >= 45) score += 24;
      if (preset.family === 'off-axis' || preset.legacyAngle === 'slightly-off-center') score += 18;
      if (preset.id.includes('close') && preset.distanceCm < 44) score -= 30;
    } else if (size === 3) {
      if (preset.distanceCm >= 53) score += 35;
      if (preset.family === 'off-axis' || preset.family === 'environmental') score += 28;
      if (preset.id.includes('close')) score -= 45;
    } else {
      if (preset.family === 'environmental') score += 55;
      if (preset.distanceCm >= 59) score += 45;
      if (preset.legacyAngle === 'slightly-off-center') score += 20;
      if (preset.family === 'high' || preset.id.includes('close')) score -= 55;
    }
  }

  if (context.backgroundAutoAngle !== false) {
    const backgroundIntent = deriveAngleIntentFromBackground({
      backgroundMode: context.backgroundMode,
      backgroundHumans: context.backgroundHumans,
      backgroundVehicles: context.backgroundVehicles,
      backgroundDisorder: context.backgroundDisorder,
      backgroundActivity: context.backgroundActivity,
      backgroundPresence: context.backgroundPresence,
      backgroundCompositionGoal: context.backgroundCompositionGoal
    });

    if (backgroundIntent.preferredAngleBias === 'off-axis') {
      if (preset.family === 'off-axis' || preset.family === 'environmental') score += 35;
      if (preset.legacyAngle === 'slightly-off-center') score += 20;
    } else if (backgroundIntent.preferredAngleBias === 'centered') {
      if (preset.family === 'natural' || preset.legacyAngle === 'eye-level') score += 30;
      if (preset.family === 'environmental') score -= 20;
    } else if (backgroundIntent.preferredAngleBias === 'slightly-high') {
      if (preset.legacyAngle === 'slightly-high') score += 25;
    }

    if (backgroundIntent.backgroundPriority === 'high') {
      if (preset.family === 'environmental' || preset.family === 'off-axis') score += 25;
      if (preset.distanceCm >= 53) score += 15;
      if (preset.id.includes('close')) score -= 30;
    } else if (backgroundIntent.backgroundPriority === 'low') {
      if (preset.id.includes('close') || preset.family === 'natural') score += 25;
      if (preset.distanceCm <= 50) score += 10;
    }

    if (backgroundIntent.preferredDistanceBias === 'far' && preset.distanceCm >= 53) score += 18;
    if (backgroundIntent.preferredDistanceBias === 'near' && preset.distanceCm <= 50) score += 18;

    if (isCarInteriorSelfieContext(context) && preset.family === 'vehicle') {
      if (backgroundIntent.backgroundPriority === 'high' && preset.carFocus === 'cabin-context') score += 45;
      if (backgroundIntent.facePriority === 'high' && preset.carFocus === 'face-priority') score += 45;
      if (backgroundIntent.backgroundPriority === 'low' && preset.carFocus === 'cabin-context') score -= 25;
    }
  }

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

  let pitchDeg = preset.pitchDeg + clamp(advice?.pitchOffsetDeg ?? 0, -preset.variation.pitchDeg, preset.variation.pitchDeg);
  let yawDeg = preset.yawDeg + clamp(advice?.yawOffsetDeg ?? 0, -preset.variation.yawDeg, preset.variation.yawDeg);
  let rollDeg = preset.rollDeg + clamp(advice?.rollOffsetDeg ?? 0, -preset.variation.rollDeg, preset.variation.rollDeg);

  const [minDistance, maxDistance] = framingDistanceLimits[context.framing];
  const rawDistance = preset.distanceCm + clamp(advice?.distanceOffsetCm ?? 0, -preset.variation.distanceCm, preset.variation.distanceCm);
  let distanceCm = clamp(rawDistance, minDistance, maxDistance);
  let heightOffsetCm = preset.heightOffsetCm;
  let carClearanceAdjusted = false;

  if (isCarInteriorSelfieContext(context)) {
    const seat = inferCarSeatRole(context);
    const original = { pitchDeg, yawDeg, rollDeg, distanceCm, heightOffsetCm };

    pitchDeg = clamp(pitchDeg, -12, seat === 'rear-passenger' ? 8 : 6);
    yawDeg = clamp(yawDeg, seat === 'rear-passenger' ? -18 : -16, seat === 'rear-passenger' ? 18 : 16);
    rollDeg = clamp(rollDeg, -2.5, 2.5);
    heightOffsetCm = clamp(heightOffsetCm, -8, 12);

    if (context.framing === 'half-body') {
      distanceCm = clamp(distanceCm, 56, 60);
    } else {
      distanceCm = clamp(distanceCm, minDistance, Math.min(maxDistance, 58));
    }

    carClearanceAdjusted =
      original.pitchDeg !== pitchDeg ||
      original.yawDeg !== yawDeg ||
      original.rollDeg !== rollDeg ||
      original.distanceCm !== distanceCm ||
      original.heightOffsetCm !== heightOffsetCm;
  }

  const backgroundIntent = context.backgroundAutoAngle !== false
    ? deriveAngleIntentFromBackground({
        backgroundMode: context.backgroundMode,
        backgroundHumans: context.backgroundHumans,
        backgroundVehicles: context.backgroundVehicles,
        backgroundDisorder: context.backgroundDisorder,
        backgroundActivity: context.backgroundActivity,
        backgroundPresence: context.backgroundPresence,
        backgroundCompositionGoal: context.backgroundCompositionGoal
      })
    : null;

  const reasonAR = adviceAccepted
    ? (context.advice?.reasonAR?.slice(0, 2) ?? ['اختار Gemini زاوية متوافقة مع المشهد.'])
    : [
        'تم اختيار أفضل زاوية محليًا لأن اقتراح Gemini غير متوفر أو غير متوافق مع الفيزياء.',
        ...(backgroundIntent?.reasonAR.slice(0, 1) ?? [])
      ].slice(0, 2);

  return {
    mode: 'gemini-smart',
    presetId: preset.id,
    presetLabelAR: preset.labelAR,
    legacyAngle: preset.legacyAngle,
    pitchDeg,
    yawDeg,
    rollDeg,
    heightOffsetCm,
    distanceCm,
    armMechanics: isCarInteriorSelfieContext(context)
      ? `${describeArmMechanics(distanceCm, context.pose)}; cabin-constrained elbow/wrist path kept clear of steering wheel, dashboard, glass, and roof trim`
      : describeArmMechanics(distanceCm, context.pose),
    cameraPosition: describeCameraPosition(heightOffsetCm),
    cameraDirection: describeDirection(pitchDeg, yawDeg, rollDeg),
    risk: preset.risk,
    source: adviceAccepted ? 'gemini' : 'local-fallback',
    adviceAccepted,
    reasonAR,
    carFocus: preset.carFocus,
    carSeat: preset.carSeat,
    phonePlacement: preset.phonePlacement,
    cabinGuards: preset.cabinGuards,
    carClearanceAdjusted
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

/** One-pass ranking: no invented photographer or mirror, no false validation. */
export interface AngleEvidence {
  mode: 'auto' | 'manual';
  manualCapture?: 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
  frontClearanceCm?: number;
  requiredFrontClearanceCm?: number;
  mirrorPathConfirmed?: boolean;
  photographerAvailable?: boolean;
  supportAvailable?: boolean;
}
export type AngleCapture = 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
export interface AngleCandidate {
  type: AngleCapture;
  feasible: boolean;
  score: number;
  reasons: string[];
}
export interface ValidatedAngleDecision {
  captureType: AngleCapture | null;
  status: 'validated' | 'insufficient-evidence';
  rankedCandidates: AngleCandidate[];
  decisionAuditTrail: string[];
}
export function resolveValidatedSmartAngle(input: AngleEvidence): ValidatedAngleDecision {
  const frontKnown = Number.isFinite(input.frontClearanceCm) &&
    Number.isFinite(input.requiredFrontClearanceCm) &&
    (input.requiredFrontClearanceCm ?? 0) > 0;
  const candidates: AngleCandidate[] = [
    { type: 'front-selfie', feasible: frontKnown &&
      input.frontClearanceCm! >= input.requiredFrontClearanceCm!, score: 60,
      reasons: [frontKnown ? 'measured selfie clearance' : 'missing selfie clearance measurement'] },
    { type: 'mirror-selfie', feasible: input.mirrorPathConfirmed === true, score: 75,
      reasons: [input.mirrorPathConfirmed === true ? 'mirror optical path confirmed' : 'mirror geometry unconfirmed'] },
    { type: 'third-person-candid', feasible: input.photographerAvailable === true || input.supportAvailable === true,
      score: 55, reasons: ['requires independent photographer or camera support'] },
  ];
  const rankedCandidates = candidates
    .sort((a, b) => Number(b.feasible) - Number(a.feasible) || b.score - a.score);
  const manual = input.mode === 'manual' && input.manualCapture
    ? rankedCandidates.find(c => c.type === input.manualCapture)
    : undefined;
  const chosen = manual?.feasible ? manual : rankedCandidates.find(c => c.feasible);
  const decisionAuditTrail = rankedCandidates.map(c =>
    c.type + ': feasible=' + c.feasible + ', score=' + c.score + ', ' + c.reasons.join('; '));
  if (manual && !manual.feasible) decisionAuditTrail.push('Manual selection rejected: ' + manual.reasons.join('; '));
  return {
    captureType: chosen?.type ?? null,
    status: chosen ? 'validated' : 'insufficient-evidence',
    rankedCandidates,
    decisionAuditTrail,
  };
}
