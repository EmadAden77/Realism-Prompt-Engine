import { getMicroLocation, type SceneFamilyId } from '../data/microLocations';
import { OUTFITS, type OutfitItem } from '../data/clothingOutfits';
import { GAZE_INTERACTIONS } from '../data/gazeInteractions';
import { getPhysicalLightingOption, isPhysicalLightingCompatible } from '../data/physicalLighting';
import { getActivityOptions, getPoseOptions, getSceneRecommendations } from './activityAttire';
import type { BackgroundViewGeometry } from './backgroundRealism';

export type SceneClock = 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
export type SceneCapture = 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
export type EntityDensityOption = 'auto' | 'none' | 'sparse' | 'light' | 'moderate' | 'high';
export type DisorderOption = 'auto' | 'very-clean' | 'natural' | 'lived-in' | 'light' | 'moderate';

export interface SmartOptionInput {
  familyId: SceneFamilyId;
  subScene: string;
  timeOfDay: SceneClock;
  captureType: SceneCapture;
  activity: string;
  selectedOutfitId: string;
  selectedPose?: string;
  allowedLighting: string[];
  viewGeometry?: BackgroundViewGeometry;
}

export interface SmartOptionResult {
  recommendedActivities: string[];
  recommendedPoses: string[];
  recommendedOutfits: OutfitItem[];
  recommendedGazeIds: string[];
  recommendedLighting: string[];
  compatibleLighting: string[];
  availableHumanDensities: EntityDensityOption[];
  availableVehicleDensities: EntityDensityOption[];
  availableDisorder: DisorderOption[];
  rationale: string;
  blockedActivities: Record<string, string>;
  blockedPoses: Record<string, string>;
}

const unique = <T>(items: T[]): T[] => [...new Set(items)];
const DENSITIES: EntityDensityOption[] = ['auto', 'none', 'sparse', 'light', 'moderate', 'high'];
const DISORDER: DisorderOption[] = ['auto', 'very-clean', 'natural', 'lived-in', 'light', 'moderate'];

/** Classify the literal lighting library, not guesses about a future image. */
export function isLightingCompatible(
  light: string, time: SceneClock, familyId?: SceneFamilyId, isOutdoor?: boolean
): boolean {
  const preset = familyId ? getPhysicalLightingOption(familyId, light) : undefined;
  if (preset) return isPhysicalLightingCompatible(preset, time, isOutdoor);
  if (/ضوء نهاري|شمس الظهر/.test(light)) return time !== 'night' && time !== 'sunset';
  if (/ساعة ذهبية|شروق\/غروب/.test(light)) return time === 'morning' || time === 'afternoon' || time === 'sunset';
  if (/إنارة شارع|إضاءة الشارع|نيون تجارية|إنارة ليلية/.test(light)) return time === 'night' || time === 'sunset';
  return true; // Indoor ceiling lamps and vehicle cabin lights can be switched on at any time.
}

function outfitScore(outfit: OutfitItem, family: SceneFamilyId, activity: string): number {
  const categories = Array.isArray(outfit.category) ? outfit.category : [outfit.category];
  const category = categories.join(' ').toLowerCase();
  let score = categories.includes(family) ? 20 : 0;
  const familyPreferences: Record<SceneFamilyId, string[]> = {
    'military-base': ['military', 'formal', 'smart_casual', 'traditional'],
    'saudi-outdoor': ['traditional', 'smart_casual', 'casual', 'formal'],
    'car': ['smart_casual', 'casual', 'traditional', 'formal'],
    'living-room': ['home', 'casual', 'smart_casual', 'traditional'],
    'bedroom': ['home', 'casual', 'smart_casual'],
    'gym': ['sport', 'athlet', 'gym', 'casual', 'smart_casual']
  };
  const preference = familyPreferences[family].findIndex(c => category.includes(c));
  if (preference >= 0) score += 12 - preference * 2;
  if (family === 'gym' && /sport|athlet|gym/.test(category)) score += 14;
  if (family === 'military-base' && /military/.test(category)) score += 12;
  if (/تمرين|رياض|عرق|جولات/.test(activity) && /sport/.test(category)) score += 9;
  if (/نوم|مستلق|سرير/.test(activity) && /home/.test(category)) score += 8;
  return score;
}

function gazeSuggestions(activity: string, capture: SceneCapture, subScene: string): string[] {
  if (/يتحدث|يتكلم|يتحاور|يتناقش|يشرح|المحادثة/.test(activity)) return ['g16', 'g17', 'g18', 'g19', 'g20', 'g1'];
  if (/يقرأ|رسالة|لابتوب|هاتف|شاشة|ملف|أوراق|مكتب/.test(activity)) return ['g5', 'g6', 'g11', 'g1', 'g15'];
  if (/يمشي|يعبر|يدخل|يخرج|الطريق|الحركة/.test(activity)) return ['g11', 'g12', 'g2', 'g3', 'g15'];
  if (capture === 'mirror-selfie' || /مرآة/.test(subScene)) return ['g6', 'g1', 'g15', 'g2', 'g3'];
  return ['g1', 'g2', 'g3', 'g6', 'g11', 'g12', 'g15'];
}

function densityChoices(cap: 'none' | 'sparse' | 'light' | 'moderate'): EntityDensityOption[] {
  const rank: Record<string, number> = { none: 0, sparse: 1, light: 2, moderate: 3, high: 4 };
  return DENSITIES.filter(level => level === 'auto' || rank[level] <= rank[cap]);
}

/** Hard context rules, independent from aesthetic ranking. Unknown choices
 * remain editable rather than being rejected on unsupported assumptions. */
export function contextOptionBlock(
  input: Pick<SmartOptionInput, 'familyId' | 'subScene' | 'captureType'>,
  label: string,
  kind: 'activity' | 'pose',
  activity = ''
): string | undefined {
  const loc = getMicroLocation(input.familyId, input.subScene);
  const driver = /مقعد السائق|خلف المقود|أمام المقود|ممسك المقود|مستند على المقود|متوقف عند الإشارة/i;
  const passenger = /مقعد الراكب|الأمامي للراكب/i;
  const rear = /المقعد الخلفي|مقعد خلفي/i;
  const walking = /يمشي|يعبر|خطوات/;
  const standing = /^(واقف|يقف)/;
  const seated = /^(جالس|يجلس)/;
  const lying = /مستلق|مستلقي/;
  if (input.familyId === 'car' && loc) {
    if (loc.isOutdoor && (driver.test(label) || passenger.test(label) || rear.test(label) ||
      /داخل السيارة|المقعد|الكونسول|المقود/.test(label))) return 'هذا الخيار يتطلب وجود الشخص داخل السيارة.';
    if (!loc.isOutdoor) {
      if (standing.test(label) || walking.test(label) || lying.test(label))
        return 'داخل المقصورة يلزم وضعية مدعومة بمقعد.';
      const seat = loc.id;
      if (seat.startsWith('car_driver_') && (passenger.test(label) || rear.test(label)))
        return 'الموقع الحالي هو مقعد السائق الأيسر.';
      if (seat === 'car_front_passenger' && (driver.test(label) || rear.test(label)))
        return 'الموقع الحالي هو مقعد الراكب الأمامي الأيمن.';
      if (seat === 'car_rear_seat' && (driver.test(label) || passenger.test(label) || /الكونسول/.test(label)))
        return 'الموقع الحالي هو المقعد الخلفي.';
    }
  }
  if (kind === 'pose') {
    if (walking.test(activity) && (seated.test(label) || lying.test(label)))
      return 'نشاط المشي يتطلب الوقوف والحركة، لا الجلوس أو الاستلقاء.';
    if ((seated.test(activity) || lying.test(activity)) && walking.test(label))
      return 'الوضعية المتحركة تتعارض مع النشاط المحدد.';
    if (seated.test(activity) && (standing.test(label) || lying.test(label)))
      return 'النشاط المحدد يتطلب الجلوس.';
    if (lying.test(activity) && (standing.test(label) || seated.test(label)))
      return 'النشاط المحدد يتطلب الاستلقاء.';
    if (standing.test(activity) && (seated.test(label) || lying.test(label)))
      return 'النشاط المحدد يتطلب الوقوف.';
  }
  return undefined;
}

export function buildSmartSceneOptions(input: SmartOptionInput): SmartOptionResult {
  const { familyId, subScene, timeOfDay, captureType, activity, viewGeometry } = input;
  const loc = getMicroLocation(familyId, subScene);
  const allActivities = getActivityOptions(familyId, subScene).map(a => a.labelAR);
  const allPoses = getPoseOptions(familyId, subScene);
  const recommended = getSceneRecommendations(familyId, subScene);
  const activityCandidates = unique([...recommended.activities.filter(a => allActivities.includes(a)), ...allActivities]);
  const poseCandidates = unique([...recommended.poses.filter(p => allPoses.includes(p)), ...allPoses]);
  const blockedActivities: Record<string, string> = {};
  const blockedPoses: Record<string, string> = {};
  for (const label of activityCandidates) {
    const reason = contextOptionBlock(input, label, 'activity');
    if (reason) blockedActivities[label] = reason;
  }
  const recommendedActivities = activityCandidates.filter(a => !blockedActivities[a]).slice(0, 5);
  const activeActivity = blockedActivities[activity] ? (recommendedActivities[0] || '') : activity;
  for (const label of poseCandidates) {
    const reason = contextOptionBlock(input, label, 'pose', activeActivity);
    if (reason) blockedPoses[label] = reason;
  }
  const recommendedPoses = poseCandidates.filter(p => !blockedPoses[p]).slice(0, 5);
  const scoredOutfits = OUTFITS.map((outfit, index) => ({ outfit, score: outfitScore(outfit, familyId, activity), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const recommendedOutfits = scoredOutfits.filter(v => v.score >= 10).slice(0, 12).map(v => v.outfit);
  if (!recommendedOutfits.length) recommendedOutfits.push(...scoredOutfits.slice(0, 8).map(v => v.outfit));

  const compatibleLighting = input.allowedLighting.filter(light => isLightingCompatible(light, timeOfDay, familyId, loc?.isOutdoor));
  const recommendedLighting = compatibleLighting.slice(0, 4);
  const availableGaze = new Set<string>(GAZE_INTERACTIONS.map(g => g.id));
  const recommendedGazeIds = unique(gazeSuggestions(activity, captureType, subScene).filter(id => availableGaze.has(id)));

  let maxHuman: 'none' | 'sparse' | 'light' | 'moderate' = loc?.humanDensityCap ?? 'moderate';
  let maxVehicle: 'none' | 'sparse' | 'light' | 'moderate' = loc?.vehicleDensityCap ??
    (loc?.isOutdoor ? 'moderate' : 'none');
  if (viewGeometry) {
    if (viewGeometry.aperture === 'narrow' && familyId !== 'bedroom' && familyId !== 'living-room') maxHuman = 'none';
    if (!viewGeometry.peripheralActorsAllowed && familyId !== 'bedroom' && familyId !== 'living-room') maxHuman = 'none';
    if (!viewGeometry.streetVisible && !viewGeometry.windowVisible) maxVehicle = 'none';
    if (viewGeometry.aperture === 'narrow') maxVehicle = 'none';
  }
  const disorderCap = loc?.disorderCap ?? 'moderate';
  const availableDisorder = DISORDER.filter(value =>
    value === 'auto' || value === 'very-clean' || value === 'natural' || value === 'lived-in' ||
    (value === 'light' && disorderCap !== 'very-clean') ||
    (value === 'moderate' && disorderCap === 'moderate' && viewGeometry?.aperture !== 'narrow')
  );

  const timeLabel = timeOfDay === 'night' ? 'الليل' : timeOfDay === 'sunset' ? 'الغروب' : 'النهار';
  const visibility = viewGeometry?.aperture === 'narrow' ? 'الخلفية محدودة بالكادر القريب'
    : viewGeometry?.wallDominated && !viewGeometry.streetVisible ? 'السور أو الجدار يحجب الشارع'
    : 'الخلفية تخضع لمجال رؤية الكاميرا';
  return {
    recommendedActivities, recommendedPoses, recommendedOutfits, recommendedGazeIds,
    blockedActivities, blockedPoses,
    recommendedLighting, compatibleLighting,
    availableHumanDensities: densityChoices(maxHuman),
    availableVehicleDensities: densityChoices(maxVehicle),
    availableDisorder,
    rationale: 'اقتراحات ' + timeLabel + ' لهذا الموقع: ' + visibility + '. الاختيار اليدوي محفوظ ويُراجع فيزيائيًا.'
  };
}

/** Only reset dependent fields; identity, outfit, hairstyle and user camera choices stay intact. */
export function smartDependentPatch(input: SmartOptionInput): {
  activity: string; pose: string; lightingMode: string;
} {
  const plan = buildSmartSceneOptions(input);
  const activity = plan.recommendedActivities.includes(input.activity) ? input.activity : (plan.recommendedActivities[0] || '');
  const paired = buildSmartSceneOptions({ ...input, activity });
  const pose = input.selectedPose && paired.recommendedPoses.includes(input.selectedPose)
    ? input.selectedPose : (paired.recommendedPoses[0] || '');
  return {
    activity,
    pose,
    lightingMode: paired.recommendedLighting[0] || ''
  };
}
