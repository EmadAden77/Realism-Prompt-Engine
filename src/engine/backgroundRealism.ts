import { MicroLocation, SceneFamilyId } from '../data/microLocations';

export type BackgroundVisibilityClass = 'minimal' | 'limited' | 'moderate' | 'expanded';
export type BackgroundEntityDensity = 'none' | 'sparse' | 'light' | 'moderate';
export type BackgroundMode = 'auto' | 'restricted' | 'active' | 'off';
export type BackgroundControlDensity = 'auto' | 'none' | 'sparse' | 'light' | 'moderate' | 'high';
export type BackgroundDisorderControl = 'auto' | 'very-clean' | 'natural' | 'lived-in' | 'light' | 'moderate';
export type BackgroundDisorderLevel = 'none' | 'very-clean' | 'light' | 'moderate';
export type BackgroundActivityControl = 'auto' | 'calm' | 'natural' | 'active';
export type BackgroundPresenceControl = 'auto' | 'low' | 'balanced' | 'visible' | 'strong';
export type BackgroundCompositionGoal = 'auto' | 'face-priority' | 'balanced' | 'background-priority';

export interface BackgroundAngleIntent {
  preferredFramingBias: 'tight' | 'balanced' | 'wide';
  preferredAngleBias: 'centered' | 'off-axis' | 'slightly-high' | 'scene-aware';
  preferredDistanceBias: 'near' | 'neutral' | 'far';
  backgroundPriority: 'low' | 'medium' | 'high';
  facePriority: 'low' | 'medium' | 'high';
  reasonAR: string[];
}

export interface BackgroundAngleIntentInput {
  backgroundMode?: BackgroundMode;
  backgroundHumans?: BackgroundControlDensity;
  backgroundVehicles?: BackgroundControlDensity;
  backgroundDisorder?: BackgroundDisorderControl;
  backgroundActivity?: BackgroundActivityControl;
  backgroundPresence?: BackgroundPresenceControl;
  backgroundCompositionGoal?: BackgroundCompositionGoal;
}

export interface BackgroundGeminiAdvice {
  humanDensity: BackgroundEntityDensity;
  vehicleDensity: BackgroundEntityDensity;
  disorderLevel: BackgroundDisorderLevel;
  reasonAR: string[];
  confidence?: number;
  cacheKey?: string;
}

export interface BackgroundSceneContext {
  familyId: SceneFamilyId;
  subScene: string;
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
  framingClass: 'tight' | 'medium' | 'wide';
  cameraAngle: 'eye-level' | 'slightly-high' | 'slightly-low' | 'slightly-off-center';
  captureType: 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
  activityDensity: 'none' | 'minimal' | 'light' | 'moderate';
  isOutdoor: boolean;
  lightingMode: string;
  backgroundMode?: BackgroundMode;
  backgroundHumans?: BackgroundControlDensity;
  backgroundVehicles?: BackgroundControlDensity;
  backgroundDisorder?: BackgroundDisorderControl;
  backgroundActivity?: BackgroundActivityControl;
  backgroundPresence?: BackgroundPresenceControl;
  backgroundCompositionGoal?: BackgroundCompositionGoal;
  backgroundGeminiAssist?: boolean;
  backgroundGeminiAdvice?: BackgroundGeminiAdvice;
  microLoc?: MicroLocation;
}

export interface BackgroundRealismState {
  visibilityClass: BackgroundVisibilityClass;
  fovAllowsBackgroundLife: boolean;
  cappedByFraming: boolean;
  geminiApplied: boolean;
  requestedMode: BackgroundMode;
  requestedHumans: BackgroundControlDensity;
  requestedVehicles: BackgroundControlDensity;
  requestedDisorder: BackgroundDisorderControl;
  requestedActivity: BackgroundActivityControl;
  requestedPresence: BackgroundPresenceControl;
  requestedCompositionGoal: BackgroundCompositionGoal;
  activityLevel: Exclude<BackgroundActivityControl, 'auto'>;
  presenceLevel: Exclude<BackgroundPresenceControl, 'auto'>;
  compositionGoal: Exclude<BackgroundCompositionGoal, 'auto'>;
  angleIntent: BackgroundAngleIntent;
  allowsHumans: boolean;
  humanDensity: BackgroundEntityDensity;
  humanBehavior: string[];
  allowsVehicles: boolean;
  vehicleDensity: BackgroundEntityDensity;
  vehicleBehavior: string[];
  disorderLevel: BackgroundDisorderLevel;
  allowsMildDisorder: boolean;
  mildDisorderElements: string[];
  lightSources: string[];
  environmentalSurfaces: string[];
  depthLayers: string[];
  occlusionRules: string[];
  motionRules: string[];
  realismGuards: string[];
  decisionReasons: string[];
}

const containsAny = (value: string, terms: string[]) =>
  terms.some(term => value.includes(term));

const densityRank: Record<BackgroundEntityDensity, number> = {
  none: 0,
  sparse: 1,
  light: 2,
  moderate: 3
};

const disorderRank: Record<BackgroundDisorderLevel, number> = {
  none: 0,
  'very-clean': 1,
  light: 2,
  moderate: 3
};

const capDensity = (
  density: BackgroundEntityDensity,
  cap: BackgroundEntityDensity
): BackgroundEntityDensity => {
  return densityRank[density] <= densityRank[cap] ? density : cap;
};

const capDisorder = (
  level: BackgroundDisorderLevel,
  cap: BackgroundDisorderLevel
): BackgroundDisorderLevel => {
  return disorderRank[level] <= disorderRank[cap] ? level : cap;
};

const densityFromControl = (
  control: BackgroundControlDensity,
  fallback: BackgroundEntityDensity
): BackgroundEntityDensity => {
  if (control === 'auto') return fallback;
  if (control === 'none') return 'none';
  if (control === 'sparse') return 'sparse';
  if (control === 'light') return 'light';
  return 'moderate';
};

const disorderFromControl = (
  control: BackgroundDisorderControl,
  fallback: BackgroundDisorderLevel
): BackgroundDisorderLevel => {
  if (control === 'auto') return fallback;
  if (control === 'very-clean') return 'very-clean';
  if (control === 'natural' || control === 'light') return 'light';
  return 'moderate';
};

const densityControlRank: Record<BackgroundControlDensity, number> = {
  auto: 1,
  none: 0,
  sparse: 1,
  light: 2,
  moderate: 3,
  high: 4
};

export function deriveAngleIntentFromBackground(
  input: BackgroundAngleIntentInput
): BackgroundAngleIntent {
  const mode = input.backgroundMode ?? 'auto';
  const humans = input.backgroundHumans ?? 'auto';
  const vehicles = input.backgroundVehicles ?? 'auto';
  const activity = input.backgroundActivity ?? 'auto';
  const presence = input.backgroundPresence ?? 'auto';
  const goal = input.backgroundCompositionGoal ?? 'auto';

  let backgroundPriority: BackgroundAngleIntent['backgroundPriority'] = 'medium';
  let facePriority: BackgroundAngleIntent['facePriority'] = 'medium';
  let preferredFramingBias: BackgroundAngleIntent['preferredFramingBias'] = 'balanced';
  let preferredAngleBias: BackgroundAngleIntent['preferredAngleBias'] = 'scene-aware';
  let preferredDistanceBias: BackgroundAngleIntent['preferredDistanceBias'] = 'neutral';
  const reasonAR: string[] = [];

  if (mode === 'off' || goal === 'face-priority' || presence === 'low') {
    backgroundPriority = 'low';
    facePriority = 'high';
    preferredFramingBias = 'tight';
    preferredAngleBias = 'centered';
    preferredDistanceBias = 'near';
    reasonAR.push('أولوية الخلفية منخفضة، لذلك يُفضّل كادر أقرب وزاوية أبسط للوجه.');
  }

  const denseLife = Math.max(densityControlRank[humans], densityControlRank[vehicles]);
  if (
    goal === 'background-priority' ||
    presence === 'strong' ||
    (presence === 'visible' && denseLife >= 2)
  ) {
    backgroundPriority = 'high';
    facePriority = goal === 'background-priority' ? 'medium' : facePriority;
    preferredFramingBias = 'wide';
    preferredAngleBias = 'off-axis';
    preferredDistanceBias = 'far';
    reasonAR.push('الخلفية مطلوبة بوضوح، لذلك تُفضّل زاوية خارج المنتصف ومسافة تسمح بسياق أكبر.');
  } else if (
    presence === 'visible' ||
    activity === 'active' ||
    denseLife >= 3
  ) {
    backgroundPriority = 'medium';
    facePriority = facePriority === 'high' ? 'high' : 'medium';
    preferredFramingBias = 'balanced';
    preferredAngleBias = 'off-axis';
    preferredDistanceBias = 'neutral';
    reasonAR.push('نشاط الخلفية أعلى من المعتاد، لذلك تُفضّل زاوية تكشف جزءًا أكبر من المشهد دون خسارة الوجه.');
  }

  if (goal === 'balanced' || presence === 'balanced') {
    backgroundPriority = 'medium';
    facePriority = 'medium';
    preferredFramingBias = 'balanced';
    preferredDistanceBias = 'neutral';
    if (preferredAngleBias === 'scene-aware') preferredAngleBias = 'off-axis';
  }

  if (activity === 'calm' && humans === 'none' && vehicles === 'none') {
    preferredAngleBias = 'centered';
    preferredDistanceBias = 'near';
    if (goal === 'auto' && presence === 'auto') {
      backgroundPriority = 'low';
      facePriority = 'high';
    }
  }

  return {
    preferredFramingBias,
    preferredAngleBias,
    preferredDistanceBias,
    backgroundPriority,
    facePriority,
    reasonAR
  };
}

export function deriveBackgroundRealism(
  context: BackgroundSceneContext
): BackgroundRealismState {
  const {
    familyId,
    subScene,
    timeOfDay,
    framingClass,
    cameraAngle,
    captureType,
    activityDensity,
    isOutdoor,
    lightingMode,
    microLoc
  } = context;

  const backgroundMode = context.backgroundMode ?? 'auto';
  const backgroundHumans = context.backgroundHumans ?? 'auto';
  const backgroundVehicles = context.backgroundVehicles ?? 'auto';
  const backgroundDisorder = context.backgroundDisorder ?? 'auto';
  const backgroundActivity = context.backgroundActivity ?? 'auto';
  const backgroundPresence = context.backgroundPresence ?? 'auto';
  const backgroundCompositionGoal = context.backgroundCompositionGoal ?? 'auto';
  const backgroundGeminiAssist = context.backgroundGeminiAssist ?? true;
  const geminiAdvice = context.backgroundGeminiAdvice;

  const baseBg = microLoc?.backgroundElements ?? [];
  const activityText = microLoc?.activity ?? '';

  const isPrivateInterior = familyId === 'bedroom' || familyId === 'living-room';
  const isCarInterior = familyId === 'car' && !isOutdoor;
  const isCafe = containsAny(subScene, ['مقهى']);
  const isShop = containsAny(subScene, ['محلات', 'بقالة', 'تجاري']);
  const isParking = containsAny(subScene, ['موقف', 'مواقف']);
  const isPark = containsAny(subScene, ['حديقة', 'ممشى']);
  const isStreet = containsAny(subScene, ['شارع', 'طريق', 'رصيف', 'زاوية']);
  const isPassage = containsAny(subScene, ['ممر جانبي', 'بين المباني']);
  const isMilitaryPublic = familyId === 'military-base' &&
    containsAny(subScene, ['ممر', 'مدخل', 'انتظار', 'ساحة']);
  const isGymPublic = familyId === 'gym';

  let visibilityClass: BackgroundVisibilityClass = 'limited';
  if (framingClass === 'tight') {
    visibilityClass = 'minimal';
  } else if (framingClass === 'wide') {
    visibilityClass = (isOutdoor || isGymPublic || isMilitaryPublic) ? 'expanded' : 'moderate';
  } else if (cameraAngle === 'slightly-off-center') {
    visibilityClass = 'moderate';
  }

  if (framingClass !== 'tight') {
    if (backgroundPresence === 'low') {
      visibilityClass = framingClass === 'wide' ? 'moderate' : 'limited';
    } else if (backgroundPresence === 'visible' || backgroundPresence === 'strong') {
      visibilityClass = framingClass === 'wide' ? 'expanded' : 'moderate';
    }
  }

  const surfaceLimit =
    visibilityClass === 'minimal' ? 1 :
    visibilityClass === 'limited' ? 2 :
    visibilityClass === 'moderate' ? 3 : 4;

  const environmentalSurfaces = baseBg.slice(0, surfaceLimit);

  const publicScene =
    (!isPrivateInterior && isOutdoor) ||
    isMilitaryPublic ||
    isGymPublic;

  const autoActivityLevel: Exclude<BackgroundActivityControl, 'auto'> =
    activityDensity === 'moderate' ? 'active' :
    activityDensity === 'light' ? 'natural' : 'calm';

  const activityLevel: Exclude<BackgroundActivityControl, 'auto'> =
    backgroundMode === 'off'
      ? 'calm'
      : backgroundActivity === 'auto'
        ? autoActivityLevel
        : backgroundActivity;

  let autoHumanDensity: BackgroundEntityDensity = 'none';
  if (framingClass !== 'tight' && publicScene) {
    if (activityDensity === 'minimal') autoHumanDensity = framingClass === 'wide' ? 'sparse' : 'none';
    else if (activityDensity === 'light') autoHumanDensity = framingClass === 'wide' ? 'light' : 'sparse';
    else if (activityDensity === 'moderate') autoHumanDensity = framingClass === 'wide' ? 'moderate' : 'light';

    if (activityLevel === 'calm') {
      autoHumanDensity = capDensity(autoHumanDensity, 'sparse');
    } else if (activityLevel === 'active') {
      autoHumanDensity = framingClass === 'wide' ? 'moderate' : 'light';
    }
  }

  let physicalHumanMax: BackgroundEntityDensity =
    !publicScene || framingClass === 'tight'
      ? 'none'
      : framingClass === 'wide'
        ? 'moderate'
        : 'light';

  if (isPassage && familyId === 'saudi-outdoor') {
    autoHumanDensity = capDensity(autoHumanDensity, 'sparse');
    physicalHumanMax = capDensity(physicalHumanMax, 'sparse');
  }

  const vehicleCue = baseBg.some(item =>
    /car|vehicle|sedan|SUV|parking|road|asphalt|driveway|curb|street/i.test(item)
  ) || isParking || isStreet || isCafe || isShop;

  let autoVehicleDensity: BackgroundEntityDensity = 'none';
  let physicalVehicleMax: BackgroundEntityDensity = 'none';

  if (framingClass !== 'tight') {
    if (isCarInterior) {
      const exteriorWindowCue = baseBg.some(item => /window|windshield|street|parked car|side mirror/i.test(item));
      if (exteriorWindowCue) {
        autoVehicleDensity = 'sparse';
        physicalVehicleMax = 'sparse';
      }
    } else if (isOutdoor && vehicleCue) {
      autoVehicleDensity = activityDensity === 'moderate' && framingClass === 'wide' ? 'light' : 'sparse';
      physicalVehicleMax = framingClass === 'wide' ? 'light' : 'sparse';
    }
  }

  const defaultDisorder: BackgroundDisorderLevel =
    familyId === 'saudi-outdoor' || familyId === 'gym' || familyId === 'military-base'
      ? 'light'
      : 'very-clean';

  const physicalDisorderMax: BackgroundDisorderLevel =
    framingClass === 'tight'
      ? 'light'
      : (isPrivateInterior || isCarInterior)
        ? 'light'
        : 'moderate';

  let geminiApplied = false;

  const chooseAutoDensity = (
    localAuto: BackgroundEntityDensity,
    physicalMax: BackgroundEntityDensity,
    geminiValue: BackgroundEntityDensity | undefined,
    control: BackgroundControlDensity
  ): BackgroundEntityDensity => {
    if (backgroundMode === 'off') return 'none';

    if (control !== 'auto') {
      return capDensity(densityFromControl(control, localAuto), physicalMax);
    }

    let candidate = localAuto;

    if (backgroundMode === 'active') {
      candidate = physicalMax;
    } else if (backgroundGeminiAssist && geminiValue) {
      candidate = geminiValue;
      geminiApplied = true;
    }

    if (backgroundMode === 'restricted') {
      candidate = capDensity(candidate, 'sparse');
    }

    return capDensity(candidate, physicalMax);
  };

  const requestedAngleIntent = deriveAngleIntentFromBackground({
    backgroundMode,
    backgroundHumans,
    backgroundVehicles,
    backgroundDisorder,
    backgroundActivity,
    backgroundPresence,
    backgroundCompositionGoal
  });

  const humanDensity = chooseAutoDensity(
    autoHumanDensity,
    physicalHumanMax,
    geminiAdvice?.humanDensity,
    backgroundHumans
  );

  const vehicleDensity = chooseAutoDensity(
    autoVehicleDensity,
    physicalVehicleMax,
    geminiAdvice?.vehicleDensity,
    backgroundVehicles
  );

  let disorderLevel: BackgroundDisorderLevel;
  if (backgroundMode === 'off') {
    disorderLevel = 'none';
  } else if (backgroundDisorder !== 'auto') {
    disorderLevel = capDisorder(
      disorderFromControl(backgroundDisorder, defaultDisorder),
      physicalDisorderMax
    );
  } else if (backgroundMode === 'active') {
    disorderLevel = physicalDisorderMax;
  } else if (backgroundGeminiAssist && geminiAdvice?.disorderLevel) {
    disorderLevel = capDisorder(geminiAdvice.disorderLevel, physicalDisorderMax);
    geminiApplied = true;
  } else {
    disorderLevel = capDisorder(defaultDisorder, physicalDisorderMax);
  }

  if (backgroundMode === 'restricted') {
    disorderLevel = capDisorder(disorderLevel, 'light');
  }

  const presenceCap: Exclude<BackgroundPresenceControl, 'auto'> =
    framingClass === 'tight' ? 'low' :
    framingClass === 'medium' ? 'visible' : 'strong';

  const presenceOrder: Record<Exclude<BackgroundPresenceControl, 'auto'>, number> = {
    low: 0,
    balanced: 1,
    visible: 2,
    strong: 3
  };

  const autoPresence: Exclude<BackgroundPresenceControl, 'auto'> =
    visibilityClass === 'minimal' ? 'low' :
    visibilityClass === 'limited' ? 'balanced' :
    visibilityClass === 'moderate' ? 'visible' : 'strong';

  let presenceLevel: Exclude<BackgroundPresenceControl, 'auto'> =
    backgroundPresence === 'auto' ? autoPresence : backgroundPresence;

  if (presenceOrder[presenceLevel] > presenceOrder[presenceCap]) {
    presenceLevel = presenceCap;
  }

  let compositionGoal: Exclude<BackgroundCompositionGoal, 'auto'> =
    backgroundCompositionGoal === 'auto'
      ? (presenceLevel === 'strong' ? 'background-priority' : presenceLevel === 'low' ? 'face-priority' : 'balanced')
      : backgroundCompositionGoal;

  if (framingClass === 'tight' && compositionGoal === 'background-priority') {
    compositionGoal = 'balanced';
  }

  const humanBehavior: string[] = [];
  if (humanDensity !== 'none') {
    if (isCafe) {
      humanBehavior.push('one background café patron seated or entering naturally, secondary to the subject and not looking at the camera');
    } else if (isShop) {
      humanBehavior.push('one ordinary customer moving near the storefront or carrying a small shopping bag, naturally secondary and not camera-aware');
    } else if (isParking) {
      humanBehavior.push('one distant driver walking toward or away from a parked car, partially occluded by vehicles where appropriate');
    } else if (isPark) {
      humanBehavior.push('one or two distant neighborhood pedestrians using the path naturally, small in scale and not posing for the camera');
    } else if (familyId === 'military-base') {
      humanBehavior.push('one administrative colleague crossing the corridor or standing briefly near a doorway, not looking into the selfie lens');
    } else if (familyId === 'gym') {
      humanBehavior.push('one other gym member resting, walking between equipment, or adjusting a machine in the secondary background');
    } else {
      humanBehavior.push('one distant pedestrian engaged in ordinary place-appropriate activity, naturally cropped or partly occluded and not looking at the camera');
    }

    if (humanDensity === 'moderate') {
      humanBehavior.push('at most one additional distant person deeper in the scene, visually subordinate and never arranged as a crowd');
    }
  }

  const vehicleBehavior: string[] = [];
  if (vehicleDensity !== 'none') {
    if (isCarInterior) {
      vehicleBehavior.push('only a partial ordinary parked vehicle or street vehicle may appear through an actually visible window or windshield plane');
    } else if (isParking) {
      vehicleBehavior.push('one or two ordinary parked sedans or family SUVs aligned with real parking bays, with correct wheel contact and perspective scale');
    } else if (isStreet || isCafe || isShop) {
      vehicleBehavior.push('one ordinary parked car in the midground aligned with the curb or parking bay');
      if (vehicleDensity === 'light' || vehicleDensity === 'moderate') {
        vehicleBehavior.push('one distant slowly moving vehicle may occupy the far road lane, never dominating the selfie');
      }
    } else {
      vehicleBehavior.push('a sparse ordinary vehicle presence only where the selected micro-location physically exposes a road or parking edge');
    }
  }

  const mildDisorderElements: string[] = [];
  if (disorderLevel === 'light' || disorderLevel === 'moderate') {
    if (familyId === 'bedroom') {
      mildDisorderElements.push('slight lived-in bedding asymmetry or one small bedside object only if it falls inside the selfie frame');
    } else if (familyId === 'living-room') {
      mildDisorderElements.push('a slightly shifted cushion, small cable, or naturally imperfect furniture alignment without visible mess');
    } else if (familyId === 'military-base') {
      mildDisorderElements.push('a restrained document stack, cable, chair misalignment, or minor wall scuff appropriate to a functioning workplace');
    } else if (familyId === 'gym') {
      mildDisorderElements.push('one ordinary water bottle, towel edge, or subtle equipment wear mark, never staged toward the camera');
    } else if (familyId === 'car') {
      mildDisorderElements.push('a charging cable, faint dashboard dust, or small everyday cabin-use mark consistent with the visible cabin area');
    } else if (familyId === 'saudi-outdoor') {
      mildDisorderElements.push('minor curb dust, asphalt patching, paint fading, service hardware, or slight parking misalignment appropriate to the selected location');
    }

    if (disorderLevel === 'moderate' && framingClass === 'wide') {
      mildDisorderElements.push('one additional small place-appropriate imperfection deeper in frame, visually secondary and never chaotic');
    }
  }

  const lightSources: string[] = [];
  const phoneScreenOnly = lightingMode === 'إضاءة شاشة الهاتف فقط';

  if (!phoneScreenOnly) {
    if (timeOfDay === 'night') {
      if (isOutdoor) {
        lightSources.push('physically visible municipal or building practical light appropriate to the selected micro-location');
        if (isCafe || isShop) {
          lightSources.push('restrained storefront or café practical spill from the actual facade, subordinate to the main exposure');
        }
      } else if (isCarInterior) {
        lightSources.push('low-level dashboard or exterior street-light spill only through physically visible cabin surfaces and glazing');
      } else {
        lightSources.push('the actual room or corridor practical fixture implied by the selected micro-location');
      }
    } else if (isOutdoor) {
      lightSources.push('natural daylight with place-specific wall, pavement, vehicle, or storefront bounce');
    } else {
      lightSources.push('interior practical illumination plus any physically available window daylight');
    }
  }

  const depthLayers: string[] = [];
  if (visibilityClass === 'minimal') {
    depthLayers.push('near layer only: the nearest physically visible surface immediately behind the subject');
  } else if (visibilityClass === 'limited') {
    depthLayers.push('near layer: one immediate architectural or furnishing cue');
    depthLayers.push('mid layer: one restrained scene-specific object or surface within the selfie FOV');
  } else if (visibilityClass === 'moderate') {
    depthLayers.push('near layer: one edge, furnishing, curb, or cabin element that can naturally enter frame');
    depthLayers.push('mid layer: the main selected micro-location surfaces and restrained activity');
    depthLayers.push('far layer: limited depth cue only if the camera angle actually exposes it');
  } else {
    depthLayers.push('near layer: a naturally cropped edge such as curb, doorway, table edge, car trim, or wall plane');
    depthLayers.push('mid layer: primary scene surfaces plus sparse contextual life');
    depthLayers.push('far layer: physically scaled street, corridor, parking, or public-space depth toward the vanishing point');
  }

  const occlusionRules = [
    'background elements must be naturally hidden by the subject, foreground edges, furniture, vehicles, walls, or architectural planes when geometry requires it',
    'people and vehicles may be partially cropped or occluded; do not force full-body or full-vehicle visibility',
    isCarInterior
      ? 'exterior background can appear only through a physically visible window, windshield, mirror, or open door aperture'
      : 'do not place objects in front of the subject unless the selected foreground geometry explicitly allows it'
  ];

  const motionRules: string[] = [];
  if (humanDensity === 'none' && vehicleDensity === 'none') {
    motionRules.push('static resting scene, zero abrupt motion blur');
  } else {
    motionRules.push('background motion remains subtle and secondary, matching ordinary walking or low-speed vehicle movement');
    if (timeOfDay === 'night') {
      motionRules.push('low-light motion may show slight natural softness only on moving background subjects, never cinematic blur');
    } else {
      motionRules.push('daylight moving subjects remain mostly crisp with only physically plausible minor motion softness');
    }
  }

  const fovAllowsBackgroundLife = humanDensity !== 'none' || vehicleDensity !== 'none';
  const requestedPresenceLevel =
    backgroundPresence === 'auto' ? autoPresence : backgroundPresence;

  const cappedByFraming =
    densityRank[densityFromControl(backgroundHumans, autoHumanDensity)] > densityRank[physicalHumanMax] ||
    densityRank[densityFromControl(backgroundVehicles, autoVehicleDensity)] > densityRank[physicalVehicleMax] ||
    (backgroundDisorder !== 'auto' && disorderRank[disorderFromControl(backgroundDisorder, defaultDisorder)] > disorderRank[physicalDisorderMax]) ||
    presenceOrder[requestedPresenceLevel] > presenceOrder[presenceCap] ||
    (backgroundCompositionGoal === 'background-priority' && framingClass === 'tight');

  const decisionReasons: string[] = [];
  if (framingClass === 'tight') {
    decisionReasons.push('الكادر قريب جدًا، لذلك يمنع ظهور بشر أو سيارات كاملة في الخلفية.');
  } else {
    decisionReasons.push('تم تقييد الخلفية حسب مجال الرؤية الفعلي للكادر وزاوية الكاميرا.');
  }
  if (isPrivateInterior) {
    decisionReasons.push('المكان خاص، لذلك لا يسمح بأشخاص عشوائيين في الخلفية.');
  }
  if (backgroundMode === 'off') {
    decisionReasons.push('وضع الخلفية مغلق يدويًا.');
  } else if (backgroundMode === 'restricted') {
    decisionReasons.push('وضع الخلفية المقيّد يحد النشاط إلى الحد الأدنى.');
  } else if (backgroundMode === 'active') {
    decisionReasons.push('وضع الخلفية النشط يستخدم أعلى كثافة يسمح بها المشهد والـFOV.');
  }
  if (backgroundPresence !== 'auto') {
    decisionReasons.push(`حضور الخلفية المطلوب: ${presenceLevel}، وتم ضبطه حسب اتساع الكادر الفعلي.`);
  }
  if (backgroundCompositionGoal !== 'auto') {
    decisionReasons.push(`هدف التكوين: ${compositionGoal}.`);
  }
  if (backgroundActivity !== 'auto') {
    decisionReasons.push(`نشاط المشهد: ${activityLevel}.`);
  }

  if (geminiApplied) {
    decisionReasons.push('تم استخدام اقتراح Gemini فقط داخل الحدود الفيزيائية المحلية.');
    if (geminiAdvice?.reasonAR?.length) {
      decisionReasons.push(...geminiAdvice.reasonAR.slice(0, 2));
    }
  }
  if (cappedByFraming) {
    decisionReasons.push('تم خفض أحد اختيارات الخلفية لأن زاوية التصوير أو الكادر لا يسمحان به.');
  }

  const realismGuards = [
    'background realism is conditional on camera position, selfie distance, pitch, yaw, framing, and actual field of view',
    'user background controls have priority, but impossible density is automatically capped by framing and scene geometry',
    'Gemini background advice is advisory only and can never override physical FOV, lighting, occlusion, or private-space constraints',
    'no decorative crowding, no invented landmark, no tourist stereotype, and no background object added merely to make the image look busy',
    'all background humans, vehicles, furniture, and infrastructure must preserve correct perspective scale, ground contact, occlusion, and shadow direction',
    phoneScreenOnly
      ? 'phone-screen-only scenes keep the background predominantly dark; do not introduce bright independent background activity'
      : 'background light must come from a visible or physically implied source and remain consistent with subject illumination'
  ];

  if (activityText && visibilityClass !== 'minimal') {
    realismGuards.push(`micro-location activity cue: ${activityText}; use it only when compatible with the visible framing`);
  }

  if (captureType === 'front-selfie') {
    realismGuards.push('direct front-camera selfie background must remain subordinate to the subject and respect Xiaomi 15 Ultra 21mm selfie perspective');
  }

  return {
    visibilityClass,
    fovAllowsBackgroundLife,
    cappedByFraming,
    geminiApplied,
    requestedMode: backgroundMode,
    requestedHumans: backgroundHumans,
    requestedVehicles: backgroundVehicles,
    requestedDisorder: backgroundDisorder,
    requestedActivity: backgroundActivity,
    requestedPresence: backgroundPresence,
    requestedCompositionGoal: backgroundCompositionGoal,
    activityLevel,
    presenceLevel,
    compositionGoal,
    angleIntent: requestedAngleIntent,
    allowsHumans: humanDensity !== 'none',
    humanDensity,
    humanBehavior,
    allowsVehicles: vehicleDensity !== 'none',
    vehicleDensity,
    vehicleBehavior,
    disorderLevel,
    allowsMildDisorder: disorderLevel === 'light' || disorderLevel === 'moderate',
    mildDisorderElements,
    lightSources,
    environmentalSurfaces,
    depthLayers,
    occlusionRules,
    motionRules,
    realismGuards,
    decisionReasons
  };
}
