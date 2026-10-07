import type { FramingClass, SceneState } from './physicsEngine';

export interface GoldenSceneExpectation {
  framingClass: FramingClass;
  continuityProfile?: string;
  environmentIncludes?: string[];
  environmentExcludes?: string[];
  activeRules?: string[];
  minReflections?: number;
  motionIncludes?: string;
}

export interface GoldenSceneCase {
  id: string;
  label: string;
  state: SceneState;
  expected: GoldenSceneExpectation;
}

const baseState: SceneState = {
  referenceImageId: 'golden-ref.jpg',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'واقف بشكل طبيعي',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف بثبات',
  outfitId: 'burgundy_shirt_grey_trousers',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'afternoon',
  lightingMode: 'ضوء نهاري طبيعي',
  environmentRealism: 'طبيعي',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 60,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

export const GOLDEN_SCENES: GoldenSceneCase[] = [
  {
    id: 'bedroom-day-selfie',
    label: 'Bedroom Day Selfie',
    state: {
      ...baseState,
      sceneFamily: 'bedroom',
      subScene: 'بجانب الستائر',
      activity: 'واقف بجانب النافذة',
      timeOfDay: 'morning',
      lightingMode: 'ضوء نهاري طبيعي',
    },
    expected: {
      framingClass: 'medium',
      continuityProfile: 'curtain-window-zone',
      environmentIncludes: ['same fixed master bedroom', 'blackout curtain'],
      environmentExcludes: ['55-inch television'],
      activeRules: ['V20_FIXED_HOME_CONTINUITY', 'V20_LIGHT_SOURCE_CAUSALITY'],
    },
  },
  {
    id: 'bedroom-night-selfie',
    label: 'Bedroom Night Selfie',
    state: {
      ...baseState,
      sceneFamily: 'bedroom',
      subScene: 'بجانب السرير',
      activity: 'جالس بهدوء',
      pose: 'جالس على حافة السرير',
      timeOfDay: 'night',
      lightingMode: 'إضاءة أباجورة دافئة',
      lightingIntensity: 30,
    },
    expected: {
      framingClass: 'medium',
      continuityProfile: 'bed-zone',
      environmentIncludes: ['same fixed master bedroom', '180 cm master bed', 'bedside lamp'],
      environmentExcludes: ['sliding-door wardrobe'],
      activeRules: ['V20_FIXED_HOME_CONTINUITY', 'V20_INDOOR_MIE_GUARD'],
    },
  },
  {
    id: 'saudi-street-day',
    label: 'Saudi Street Day',
    state: {
      ...baseState,
      sceneFamily: 'saudi-outdoor',
      subScene: 'شارع فلل سكني',
      activity: 'يمشي بهدوء',
      framing: 'half-body',
      timeOfDay: 'afternoon',
      lightingMode: 'ضوء نهاري طبيعي',
    },
    expected: {
      framingClass: 'wide',
      activeRules: ['V20_LIGHT_SOURCE_CAUSALITY', 'V20_DEPTH_PARALLAX'],
      environmentExcludes: ['same fixed master bedroom', 'same fixed family living room'],
    },
  },
  {
    id: 'saudi-street-night',
    label: 'Saudi Street Night',
    state: {
      ...baseState,
      sceneFamily: 'saudi-outdoor',
      subScene: 'شارع فلل سكني',
      timeOfDay: 'night',
      lightingMode: 'إنارة شارع دافئة',
      lightingIntensity: 45,
    },
    expected: {
      framingClass: 'medium',
      activeRules: ['V20_LIGHT_SOURCE_CAUSALITY', 'V20_DEPTH_PARALLAX'],
      environmentExcludes: ['same fixed master bedroom', 'same fixed family living room'],
    },
  },
  {
    id: 'car-interior-night',
    label: 'Car Interior Night',
    state: {
      ...baseState,
      sceneFamily: 'car',
      subScene: 'مقعد السائق والسيارة متوقفة',
      activity: 'استراحة هادئة',
      pose: 'جالس باسترخاء في المقعد',
      framing: 'head-shoulders',
      timeOfDay: 'night',
      lightingMode: 'إضاءة داخل السيارة',
      clothingCondition: 'worn-all-day',
    },
    expected: {
      framingClass: 'tight',
      activeRules: ['V20_LIGHT_SOURCE_CAUSALITY', 'V20_MATERIAL_WEAR_RESPONSE'],
      environmentExcludes: ['same fixed master bedroom', 'same fixed family living room'],
    },
  },
  {
    id: 'standing-beside-vehicle',
    label: 'Standing Beside Vehicle',
    state: {
      ...baseState,
      sceneFamily: 'car',
      subScene: 'بجانب السيارة والباب مغلق',
      activity: 'واقف بجانب السيارة',
      pose: 'واقف بثبات بجانب السيارة',
      timeOfDay: 'afternoon',
      lightingMode: 'ضوء نهاري طبيعي',
    },
    expected: {
      framingClass: 'medium',
      activeRules: ['V20_LIGHT_SOURCE_CAUSALITY', 'V20_DEPTH_PARALLAX'],
      environmentExcludes: ['same fixed master bedroom', 'same fixed family living room'],
    },
  },
  {
    id: 'mirror-selfie',
    label: 'Mirror Selfie',
    state: {
      ...baseState,
      sceneFamily: 'bedroom',
      subScene: 'أمام المرآة',
      activity: 'يتحقق من مظهره',
      captureType: 'mirror-selfie',
      framing: 'half-body',
      pose: 'واقف أمام المرآة',
      timeOfDay: 'night',
      lightingMode: 'إضاءة سقف',
    },
    expected: {
      framingClass: 'wide',
      continuityProfile: 'mirror-wardrobe-zone',
      environmentIncludes: ['same fixed master bedroom', 'sliding-door wardrobe'],
      environmentExcludes: ['perfume bottles', 'watch tray'],
      activeRules: ['V20_FIXED_HOME_CONTINUITY', 'V20_MIRROR_GEOMETRY'],
      minReflections: 1,
    },
  },
  {
    id: 'cafe-selfie',
    label: 'Cafe Selfie',
    state: {
      ...baseState,
      sceneFamily: 'saudi-outdoor',
      subScene: 'أمام مقهى محلي',
      activity: 'واقف أمام المقهى',
      timeOfDay: 'night',
      lightingMode: 'إنارة نيون تجارية متناثرة',
      backgroundHumans: 'sparse',
      backgroundVehicles: 'sparse',
      backgroundPresence: 'balanced',
    },
    expected: {
      framingClass: 'medium',
      activeRules: ['V20_LIGHT_SOURCE_CAUSALITY', 'V20_DEPTH_PARALLAX'],
      environmentExcludes: ['same fixed master bedroom', 'same fixed family living room'],
    },
  },
  {
    id: 'night-mode-motion',
    label: 'Night Mode Motion',
    state: {
      ...baseState,
      sceneFamily: 'saudi-outdoor',
      subScene: 'شارع تجاري محلي',
      activity: 'يمشي بهدوء',
      framing: 'half-body',
      cameraAngle: 'slightly-off-center',
      timeOfDay: 'night',
      lightingMode: 'إنارة نيون تجارية متناثرة',
      backgroundMode: 'active',
      backgroundHumans: 'light',
      backgroundVehicles: 'light',
      backgroundActivity: 'active',
      backgroundPresence: 'visible',
      backgroundCompositionGoal: 'balanced',
    },
    expected: {
      framingClass: 'wide',
      activeRules: ['V20_LIGHT_SOURCE_CAUSALITY', 'V20_DEPTH_PARALLAX'],
      motionIncludes: 'low-light motion may show slight natural softness',
    },
  },
  {
    id: 'indoor-window-scene',
    label: 'Indoor Window Scene',
    state: {
      ...baseState,
      sceneFamily: 'living-room',
      subScene: 'بجانب النافذة',
      activity: 'واقف بجانب النافذة',
      timeOfDay: 'morning',
      lightingMode: 'ضوء نهاري طبيعي',
    },
    expected: {
      framingClass: 'medium',
      continuityProfile: 'living-window-zone',
      environmentIncludes: ['same fixed family living room', 'white sheer curtain'],
      environmentExcludes: ['55-inch television'],
      activeRules: ['V20_FIXED_HOME_CONTINUITY', 'V20_LIGHT_SOURCE_CAUSALITY'],
    },
  },
];
