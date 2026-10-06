import { MicroLocation, SceneFamilyId } from '../data/microLocations';

export type LightingSourceRole = 'primary' | 'secondary' | 'bounce' | 'practical';

export interface LightingSourceDescriptor {
  name: string;
  role: LightingSourceRole;
  direction: string;
  distanceBehavior: string;
  contribution: string;
  physicalOrigin: string;
}

export interface LightingCausalityInput {
  familyId: SceneFamilyId;
  subScene: string;
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
  lightingMode: string;
  lightingIntensity: number;
  shadowDepth: number;
  isOutdoor: boolean;
  microLoc?: MicroLocation;
  backgroundLightSources?: string[];
  cameraExposureBehavior: string;
}

export interface LightingCausalityState {
  primarySource: LightingSourceDescriptor;
  secondarySources: LightingSourceDescriptor[];
  bounceSurfaces: string[];
  sourceSummary: string[];
  shadowBehavior: string;
  falloffBehavior: string;
  inverseSquareBehavior: string;
  exposureBehavior: string;
  contrastBehavior: string;
  consistencyGuards: string[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const includesAny = (value: string, terms: string[]) =>
  terms.some(term => value.includes(term));

export function deriveLightingCausality(input: LightingCausalityInput): LightingCausalityState {
  const {
    familyId,
    subScene,
    timeOfDay,
    lightingMode,
    isOutdoor,
    microLoc,
    cameraExposureBehavior
  } = input;

  const intensity = clamp(input.lightingIntensity, 0, 100);
  const shadowDepth = clamp(input.shadowDepth, 0, 100);
  const isNight = timeOfDay === 'night';
  const isMidday = timeOfDay === 'midday';
  const phoneOnly = lightingMode === 'إضاءة شاشة الهاتف فقط';
  const isCarInterior = familyId === 'car' && !isOutdoor;
  const isCafeOrShop = includesAny(subScene, ['مقهى', 'محلات', 'بقالة', 'تجاري']);

  let primarySource: LightingSourceDescriptor;
  const secondarySources: LightingSourceDescriptor[] = [];
  const bounceSurfaces: string[] = [];

  if (phoneOnly) {
    primarySource = {
      name: 'smartphone display glow',
      role: 'primary',
      direction: 'from the phone plane toward the face, slightly below or near eye level depending on grip',
      distanceBehavior: 'very short-range source approximately 35-50cm from the face',
      contribution: 'localized facial illumination with rapid falloff toward ears, neck, torso, and room background',
      physicalOrigin: 'the active OLED/LCD phone display held by the subject'
    };
    bounceSurfaces.push('small local bounce from shirt fabric and immediately adjacent bedding or wall only');
  } else if (isNight && isOutdoor) {
    primarySource = {
      name: 'nearby municipal or building practical light',
      role: 'primary',
      direction: 'predominantly downward and slightly lateral from the nearest real fixture',
      distanceBehavior: 'medium-distance practical source with broad falloff across subject and nearby pavement',
      contribution: 'main night exposure on face and upper body with visible directional shadowing',
      physicalOrigin: 'streetlamp, gate lantern, storefront fixture, or parking canopy light physically present in the selected micro-location'
    };
    secondarySources.push({
      name: isCafeOrShop ? 'storefront spill' : 'distant ambient street spill',
      role: 'secondary',
      direction: 'lateral fill from the visible facade or roadway side',
      distanceBehavior: 'weaker contribution due to greater distance and partial occlusion',
      contribution: 'subtle edge fill and background separation without flattening the face',
      physicalOrigin: isCafeOrShop ? 'actual café/shop practical lighting' : 'adjacent ordinary outdoor practical lighting'
    });
    bounceSurfaces.push('asphalt and concrete pavement', 'nearby pale wall or facade finish');
  } else if (isCarInterior && isNight) {
    primarySource = {
      name: 'exterior practical spill through vehicle glazing',
      role: 'primary',
      direction: 'lateral through the nearest side window or windshield',
      distanceBehavior: 'external medium-distance light attenuated by automotive glass and cabin geometry',
      contribution: 'soft side illumination on face with cabin surfaces remaining substantially darker',
      physicalOrigin: 'streetlamp or parking fixture outside the stationary vehicle'
    };
    secondarySources.push({
      name: 'dashboard and infotainment glow',
      role: 'practical',
      direction: 'low frontal/upward fill from dashboard height',
      distanceBehavior: 'short-range low-output source',
      contribution: 'restrained low-level fill on lower face, hands, and steering-wheel surfaces',
      physicalOrigin: 'vehicle instrument cluster and infotainment display'
    });
    bounceSurfaces.push('matte dashboard trim', 'seat upholstery', 'door trim');
  } else if (isNight) {
    primarySource = {
      name: 'interior practical fixture',
      role: 'primary',
      direction: includesAny(lightingMode, ['أباجورة', 'جانبية'])
        ? 'lateral from the selected lamp side'
        : 'downward from a real ceiling or wall fixture',
      distanceBehavior: 'room-scale practical source with moderate falloff and soft surface bounce',
      contribution: 'localized indoor night exposure without impossible room-wide daylight brightness',
      physicalOrigin: 'the selected real room, corridor, office, or bedside fixture'
    };
    bounceSurfaces.push('nearby matte wall', 'ceiling plane', 'floor and furniture surfaces');
  } else if (isOutdoor && isMidday) {
    primarySource = {
      name: 'high-angle Saudi midday sun',
      role: 'primary',
      direction: 'steep downward solar direction from high sky angle',
      distanceBehavior: 'effectively collimated distant source; intensity does not use near-field inverse-square falloff across the scene',
      contribution: 'hard direct illumination with short strong cast shadows and bright specular highlights',
      physicalOrigin: 'direct unobstructed sunlight'
    };
    secondarySources.push({
      name: 'open-sky fill',
      role: 'secondary',
      direction: 'broad hemispherical fill from the visible sky dome',
      distanceBehavior: 'diffuse environmental illumination',
      contribution: 'lifts deep facial shadows without erasing directional sunlight',
      physicalOrigin: 'atmospheric sky scattering'
    });
    bounceSurfaces.push('pale villa or storefront walls', 'asphalt roadway', 'concrete curb or paving');
  } else if (isOutdoor) {
    primarySource = {
      name: timeOfDay === 'sunset'
        ? 'low-angle warm sunset sunlight'
        : 'directional natural daylight',
      role: 'primary',
      direction: timeOfDay === 'sunset'
        ? 'low lateral solar angle'
        : 'oblique daylight from the open sky/sun direction',
      distanceBehavior: 'distant directional source with scene-wide consistency',
      contribution: 'natural directional face light with realistic environmental fill',
      physicalOrigin: 'sun and open sky'
    };
    secondarySources.push({
      name: 'open-sky ambient fill',
      role: 'secondary',
      direction: 'broad fill from unobstructed sky hemisphere',
      distanceBehavior: 'diffuse scene-wide illumination',
      contribution: 'softens but does not erase the primary directional shadow structure',
      physicalOrigin: 'atmospheric sky scattering'
    });
    bounceSurfaces.push('nearby walls', 'pavement or asphalt', 'parked vehicle paint only when actually visible');
  } else if (isCarInterior) {
    primarySource = {
      name: 'exterior daylight through vehicle glazing',
      role: 'primary',
      direction: 'through windshield and nearest side window, strongest from the brighter exterior side',
      distanceBehavior: 'distant daylight shaped and attenuated by cabin apertures',
      contribution: 'directional cabin illumination with believable windshield/side-window gradients',
      physicalOrigin: 'sun and sky outside the vehicle'
    };
    secondarySources.push({
      name: 'cabin surface bounce',
      role: 'bounce',
      direction: 'low diffuse return from dashboard, seats, and door trim',
      distanceBehavior: 'short-range weak secondary reflection',
      contribution: 'subtle fill under chin and on shadow-side facial planes',
      physicalOrigin: 'real cabin materials reflecting exterior daylight'
    });
    bounceSurfaces.push('dashboard', 'seat upholstery', 'door trim');
  } else {
    primarySource = {
      name: includesAny(lightingMode, ['فلورسنت', 'ممرات', 'سقف'])
        ? 'overhead fluorescent/LED fixture'
        : 'window daylight',
      role: 'primary',
      direction: includesAny(lightingMode, ['فلورسنت', 'ممرات', 'سقف'])
        ? 'downward from ceiling plane'
        : 'lateral from the actual window opening',
      distanceBehavior: 'room-scale source with moderate geometric falloff and surface bounce',
      contribution: 'main indoor exposure with physically coherent socket, nose, chin, and neck shadows',
      physicalOrigin: includesAny(lightingMode, ['فلورسنت', 'ممرات', 'سقف'])
        ? 'installed ceiling luminaire'
        : 'daylight entering through a real window'
    };

    if (microLoc?.lightingHints) {
      secondarySources.push({
        name: 'location-specific ambient contribution',
        role: 'secondary',
        direction: 'from the physically implied opening or practical surface in the selected micro-location',
        distanceBehavior: 'weaker than the primary source',
        contribution: microLoc.lightingHints,
        physicalOrigin: 'selected micro-location architecture and practical fixtures'
      });
    }

    bounceSurfaces.push('matte wall plane', 'ceiling', 'floor and nearby furniture');
  }

  // Phone-screen-only is a hard single-source mode. Background realism may
  // describe fixtures, but those fixtures must not become active emitters.
  if (!phoneOnly) {
    for (const source of input.backgroundLightSources ?? []) {
      secondarySources.push({
        name: source,
        role: 'practical',
        direction: 'background-local direction only',
        distanceBehavior: 'secondary contribution attenuated by distance and occlusion',
        contribution: 'background realism cue that must remain weaker than the subject-driving primary source',
        physicalOrigin: 'physically visible or strongly implied background practical'
      });
    }
  }

  let shadowBehavior: string;
  if (phoneOnly) {
    shadowBehavior = 'rapid localized falloff with deeper shadow on ear, jaw, neck, and torso planes farther from the phone; background remains predominantly dark';
  } else if (isOutdoor && isMidday) {
    shadowBehavior = 'short hard-edged downward cast shadows under brow, nose, chin, collar, vehicles, and curb edges, softened only slightly by open-sky fill';
  } else if (isNight && isOutdoor) {
    shadowBehavior = 'directional downward/lateral practical-light shadows with soft-to-medium penumbra and darker unlit background zones';
  } else if (isCarInterior) {
    shadowBehavior = 'window-shaped directional gradients with cabin occlusion, dashboard fill, and no uniform front-facing studio illumination';
  } else if (includesAny(lightingMode, ['فلورسنت', 'ممرات', 'سقف'])) {
    shadowBehavior = 'soft downward ceiling-light occlusion in eye sockets, under nose, chin, and collar, with restrained multi-fixture overlap';
  } else {
    shadowBehavior = 'directional but softened natural shadows consistent with the primary opening or practical source';
  }

  const falloffBehavior = phoneOnly
    ? 'very rapid near-field falloff; illumination should visibly decay across the face-to-neck-to-background distance'
    : primarySource.role === 'primary' && primarySource.distanceBehavior.includes('distant')
      ? 'direction remains consistent across the visible scene; local brightness changes come mainly from angle, occlusion, and surface reflectance'
      : 'brightness decreases with source distance and occlusion; secondary surfaces receive visibly weaker illumination than the subject-facing planes';

  const inverseSquareBehavior = phoneOnly
    ? 'apply strong near-field inverse-square intuition: small changes in phone-to-face distance materially change facial brightness, while room-scale illumination stays weak'
    : isNight && !isOutdoor
      ? 'apply practical-light distance falloff to nearby surfaces; do not make distant walls as bright as the subject without an additional real source'
      : 'do not misuse inverse-square falloff for the sun; apply it only to local practical fixtures and reflected secondary light';

  const contrastBehavior =
    shadowDepth >= 75
      ? 'high local contrast with deep but information-preserving shadows'
      : shadowDepth <= 35
        ? 'soft low-contrast shadow transitions without eliminating form'
        : 'moderate natural contrast preserving facial volume and environmental depth';

  const intensityGuard =
    phoneOnly
      ? 'phone-screen-only illumination must remain localized and cannot brighten an entire room'
      : intensity >= 85
        ? 'high requested intensity must still preserve highlight roll-off and source direction rather than flattening the scene'
        : 'requested illumination level must remain subordinate to the actual source geometry';

  const consistencyGuards = [
    'every visible highlight and cast shadow must trace back to the primary source, a listed secondary source, or a listed bounce surface',
    'subject and background must share the same light direction, color family, and occlusion logic',
    'reflections may not invent light sources that do not exist in the scene',
    intensityGuard,
    phoneOnly
      ? 'background practical lights must remain off or negligible unless explicitly part of the selected lighting mode'
      : 'secondary practicals may enrich the background but cannot override the primary subject exposure'
  ];

  const sourceSummary = [
    primarySource.name,
    ...secondarySources.map(source => source.name)
  ];

  return {
    primarySource,
    secondarySources,
    bounceSurfaces,
    sourceSummary,
    shadowBehavior,
    falloffBehavior,
    inverseSquareBehavior,
    exposureBehavior: cameraExposureBehavior,
    contrastBehavior,
    consistencyGuards
  };
}
