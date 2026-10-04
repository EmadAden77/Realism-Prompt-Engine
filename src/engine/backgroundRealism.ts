import { MicroLocation, SceneFamilyId } from '../data/microLocations';

export type BackgroundVisibilityClass = 'minimal' | 'limited' | 'moderate' | 'expanded';
export type BackgroundEntityDensity = 'none' | 'sparse' | 'light' | 'moderate';

export interface BackgroundSceneContext {
  familyId: SceneFamilyId;
  subScene: string;
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
  framingClass: 'tight' | 'medium' | 'wide';
  activityDensity: 'none' | 'minimal' | 'light' | 'moderate';
  isOutdoor: boolean;
  lightingMode: string;
  microLoc?: MicroLocation;
}

export interface BackgroundRealismState {
  visibilityClass: BackgroundVisibilityClass;
  allowsHumans: boolean;
  humanDensity: BackgroundEntityDensity;
  humanBehavior: string[];
  allowsVehicles: boolean;
  vehicleDensity: BackgroundEntityDensity;
  vehicleBehavior: string[];
  allowsMildDisorder: boolean;
  mildDisorderElements: string[];
  lightSources: string[];
  environmentalSurfaces: string[];
  depthLayers: string[];
  occlusionRules: string[];
  motionRules: string[];
  realismGuards: string[];
}

const containsAny = (value: string, terms: string[]) =>
  terms.some(term => value.includes(term));

const densityRank: Record<BackgroundEntityDensity, number> = {
  none: 0,
  sparse: 1,
  light: 2,
  moderate: 3
};

const capDensity = (
  density: BackgroundEntityDensity,
  cap: BackgroundEntityDensity
): BackgroundEntityDensity => {
  return densityRank[density] <= densityRank[cap] ? density : cap;
};

export function deriveBackgroundRealism(
  context: BackgroundSceneContext
): BackgroundRealismState {
  const {
    familyId,
    subScene,
    timeOfDay,
    framingClass,
    activityDensity,
    isOutdoor,
    lightingMode,
    microLoc
  } = context;

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
  if (framingClass === 'tight') visibilityClass = 'minimal';
  else if (framingClass === 'wide') visibilityClass = (isOutdoor || isGymPublic || isMilitaryPublic) ? 'expanded' : 'moderate';

  const surfaceLimit =
    visibilityClass === 'minimal' ? 1 :
    visibilityClass === 'limited' ? 2 :
    visibilityClass === 'moderate' ? 3 : 4;

  const environmentalSurfaces = baseBg.slice(0, surfaceLimit);

  const publicScene =
    (!isPrivateInterior && isOutdoor) ||
    isMilitaryPublic ||
    isGymPublic;

  let humanDensity: BackgroundEntityDensity = 'none';
  if (framingClass !== 'tight' && publicScene) {
    if (activityDensity === 'minimal') humanDensity = framingClass === 'wide' ? 'sparse' : 'none';
    else if (activityDensity === 'light') humanDensity = framingClass === 'wide' ? 'light' : 'sparse';
    else if (activityDensity === 'moderate') humanDensity = framingClass === 'wide' ? 'moderate' : 'light';
  }

  if (isPassage && familyId === 'saudi-outdoor') {
    humanDensity = capDensity(humanDensity, 'sparse');
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

  const vehicleCue = baseBg.some(item =>
    /car|vehicle|sedan|SUV|parking|road|asphalt|driveway|curb|street/i.test(item)
  ) || isParking || isStreet || isCafe || isShop;

  let vehicleDensity: BackgroundEntityDensity = 'none';
  if (framingClass !== 'tight') {
    if (isCarInterior) {
      const exteriorWindowCue = baseBg.some(item => /window|windshield|street|parked car|side mirror/i.test(item));
      if (exteriorWindowCue) vehicleDensity = 'sparse';
    } else if (isOutdoor && vehicleCue) {
      vehicleDensity = activityDensity === 'moderate' && framingClass === 'wide' ? 'light' : 'sparse';
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
      if (vehicleDensity === 'light') {
        vehicleBehavior.push('one distant slowly moving vehicle may occupy the far road lane, never dominating the selfie');
      }
    } else {
      vehicleBehavior.push('a sparse ordinary vehicle presence only where the selected micro-location physically exposes a road or parking edge');
    }
  }

  const mildDisorderElements: string[] = [];
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

  const realismGuards = [
    'background realism is conditional on camera position, selfie distance, pitch, yaw, framing, and actual field of view',
    'no decorative crowding, no invented landmark, no tourist stereotype, and no background object added merely to make the image look busy',
    'all background humans, vehicles, furniture, and infrastructure must preserve correct perspective scale, ground contact, occlusion, and shadow direction',
    phoneScreenOnly
      ? 'phone-screen-only scenes keep the background predominantly dark; do not introduce bright independent background activity'
      : 'background light must come from a visible or physically implied source and remain consistent with subject illumination'
  ];

  if (activityText && visibilityClass !== 'minimal') {
    realismGuards.push(`micro-location activity cue: ${activityText}; use it only when compatible with the visible framing`);
  }

  return {
    visibilityClass,
    allowsHumans: humanDensity !== 'none',
    humanDensity,
    humanBehavior,
    allowsVehicles: vehicleDensity !== 'none',
    vehicleDensity,
    vehicleBehavior,
    allowsMildDisorder: mildDisorderElements.length > 0,
    mildDisorderElements,
    lightSources,
    environmentalSurfaces,
    depthLayers,
    occlusionRules,
    motionRules,
    realismGuards
  };
}
