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
    'gym': ['sport', 'casual']
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

export function buildSmartSceneOptions(input: SmartOptionInput): SmartOptionResult {
  const { familyId, subScene, timeOfDay, captureType, activity, viewGeometry } = input;
  const loc = getMicroLocation(familyId, subScene);
  const allActivities = getActivityOptions(familyId, subScene).map(a => a.labelAR);
  const allPoses = getPoseOptions(familyId, subScene);
  const recommended = getSceneRecommendations(familyId, subScene);
  const recommendedActivities = unique([...recommended.activities.filter(a => allActivities.includes(a)), ...allActivities]).slice(0, 5);
  const recommendedPoses = unique([...recommended.poses.filter(p => allPoses.includes(p)), ...allPoses]).slice(0, 5);
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
  return {
    activity: plan.recommendedActivities[0] || input.activity,
    pose: plan.recommendedPoses[0] || getPoseOptions(input.familyId, input.subScene)[0] || '',
    lightingMode: plan.recommendedLighting[0] || input.allowedLighting[0] || ''
  };
}
