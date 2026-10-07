import type { DerivedPhysicalState, SceneState } from './physicsEngine';
import { getSaudiStreetRule } from '../data/saudiStreetRealismLibrary';

export interface SaudiStreetRealismSelection {
  active: boolean;
  surface?: string;
  architecture?: string;
  disorder?: string;
  vehicle?: string;
  vehicleMotion?: string;
  licensePlate?: string;
  people?: string;
  peopleClothing?: string;
  sky?: string;
  secondaryLight?: string;
  depth?: string;
  guards: string[];
  facts: string[];
}

const ruleText = (id: string): string | undefined =>
  getSaudiStreetRule(id)?.prompt;

const containsAny = (value: string, terms: string[]): boolean =>
  terms.some(term => value.includes(term));

const chooseSurface = (subScene: string): string => {
  if (containsAny(subScene, ['موقف', 'مواقف'])) {
    return 'interlock parking surface with subtle uneven settlement, occasional tile lifted about 5mm where plausible, groove dust and sand accumulation, realistic tire-load compression and restrained wear';
  }
  if (containsAny(subScene, ['رصيف', 'ممشى', 'حديقة', 'ساحة'])) {
    return 'interlock or paved walkway with ground micro-topography, slight uneven settlement, fine dust in joints, occasional small weed between grooves, realistic curb transitions and foot-contact wear';
  }
  if (containsAny(subScene, ['شارع سكني شعبي', 'زاوية شارع'])) {
    return 'ordinary neighborhood asphalt with restrained cracking, faded speed-bump or curb paint where present, tire wear marks and fine accumulated road dust';
  }
  return 'ordinary Saudi asphalt with fine aggregate texture, restrained cracks and patching, faded lane or parking paint where present, realistic tire marks and thin sand-dust accumulation';
};

const chooseArchitecture = (subScene: string): string | undefined => {
  if (containsAny(subScene, ['بقالة'])) return ruleText('ss_building_baqala');
  if (containsAny(subScene, ['فيلا', 'سور منزل', 'فلل'])) return ruleText('ss_building_villa');
  if (containsAny(subScene, ['مبنى', 'عمارة'])) return ruleText('ss_building_apartment');
  if (containsAny(subScene, ['ممر جانبي', 'بين المباني'])) return ruleText('ss_building_modern_wall_ac');
  return ruleText('ss_building_peeling_wall');
};

const chooseDisorder = (subScene: string): string | undefined => {
  if (containsAny(subScene, ['بقالة'])) return ruleText('ss_disorder_baqala');
  if (containsAny(subScene, ['موقف', 'مواقف'])) return ruleText('ss_disorder_parking');
  if (containsAny(subScene, ['حديقة'])) return ruleText('ss_disorder_park');
  return ruleText('ss_disorder_general');
};

const chooseVehicle = (
  subScene: string,
  physical?: DerivedPhysicalState
): string | undefined => {
  const visible = [
    ...(physical?.visibleVehicles || []),
    physical?.visibleEnvironment || '',
  ].join(' ');

  if (/pickup|Hilux|truck/i.test(visible) || containsAny(subScene, ['طريق خدمة'])) {
    return ruleText('ss_car_hilux');
  }
  if (/SUV|Land Cruiser/i.test(visible)) {
    return ruleText('ss_car_landcruiser');
  }
  if (/delivery|دباب/i.test(visible) || containsAny(subScene, ['بقالة'])) {
    return ruleText('ss_car_delivery_bike');
  }
  return ruleText('ss_car_camry_2021');
};

const choosePeople = (subScene: string): string | undefined => {
  if (containsAny(subScene, ['بقالة'])) return ruleText('ss_people_baqala');
  if (containsAny(subScene, ['محلات', 'تجاري'])) return ruleText('ss_people_shop_worker');
  if (containsAny(subScene, ['حديقة'])) return ruleText('ss_people_park');
  if (containsAny(subScene, ['ممشى'])) return ruleText('ss_people_phone');
  return ruleText('ss_people_general');
};

const choosePeopleClothing = (subScene: string): string | undefined => {
  if (containsAny(subScene, ['ممشى', 'حديقة'])) return ruleText('ss_clothing_sports');
  if (containsAny(subScene, ['محلات', 'تجاري', 'بقالة'])) return ruleText('ss_clothing_worker');
  return ruleText('ss_clothing_thobe');
};

export function deriveSaudiStreetRealism(
  state: SceneState,
  physical?: DerivedPhysicalState
): SaudiStreetRealismSelection {
  if (state.sceneFamily !== 'saudi-outdoor') {
    return { active: false, guards: [], facts: [] };
  }

  const background = physical?.backgroundRealism;
  const frameAllowsContext = physical
    ? Boolean(physical.visibleEnvironment?.trim())
    : true;
  const allowsVehicles = physical
    ? Boolean(
        physical.visibleVehicles.length ||
        background?.allowsVehicles
      )
    : state.framing !== 'head-shoulders';
  const allowsHumans = physical
    ? Boolean(
        physical.visiblePeople.length ||
        background?.allowsHumans
      )
    : state.framing !== 'head-shoulders';
  const allowsDisorder = physical
    ? Boolean(background?.allowsMildDisorder)
    : true;
  const movingBackground = physical
    ? physical.motionBehavior !== 'static resting scene, zero abrupt motion blur'
    : state.backgroundActivity === 'active';
  const multipleLights = physical
    ? physical.lightSources.length >= 2
    : false;
  const wideEnoughForPlate = physical
    ? physical.framingClass !== 'tight'
    : state.framing !== 'head-shoulders';

  const guards = [
    ruleText('ss_gold_place'),
    ruleText('ss_gold_light'),
    ruleText('ss_gold_clothing'),
    ruleText('ss_gold_car'),
    allowsHumans ? ruleText('ss_gold_crowd') : undefined,
  ].filter((item): item is string => Boolean(item));

  const facts = [
    `Saudi outdoor micro-location: ${state.subScene || 'unspecified'}.`,
    `Framing: ${state.framing}; background context visible=${frameAllowsContext}.`,
    `Background humans allowed=${allowsHumans}; vehicles allowed=${allowsVehicles}; disorder allowed=${allowsDisorder}.`,
    `Time of day: ${state.timeOfDay}; resolved light count=${physical?.lightSources.length ?? 'unknown'}.`,
  ];

  return {
    active: true,
    surface: frameAllowsContext ? chooseSurface(state.subScene) : undefined,
    architecture: frameAllowsContext ? chooseArchitecture(state.subScene) : undefined,
    disorder: frameAllowsContext && allowsDisorder
      ? [ruleText('ss_gold_chaos'), chooseDisorder(state.subScene)]
          .filter((item): item is string => Boolean(item))
          .join(' ')
      : undefined,
    vehicle: frameAllowsContext && allowsVehicles
      ? chooseVehicle(state.subScene, physical)
      : undefined,
    vehicleMotion: frameAllowsContext && allowsVehicles && movingBackground
      ? ruleText('ss_car_motion_general')
      : undefined,
    licensePlate: frameAllowsContext && allowsVehicles && wideEnoughForPlate
      ? ruleText('ss_plate_general')
      : undefined,
    people: frameAllowsContext && allowsHumans
      ? choosePeople(state.subScene)
      : undefined,
    peopleClothing: frameAllowsContext && allowsHumans
      ? choosePeopleClothing(state.subScene)
      : undefined,
    sky: frameAllowsContext && state.timeOfDay === 'night'
      ? ruleText('ss_gold_sky')
      : undefined,
    secondaryLight: frameAllowsContext && multipleLights
      ? ruleText('ss_gold_secondary_light')
      : undefined,
    depth: frameAllowsContext && state.captureType === 'front-selfie'
      ? ruleText('ss_gold_depth')
      : undefined,
    guards,
    facts,
  };
}
