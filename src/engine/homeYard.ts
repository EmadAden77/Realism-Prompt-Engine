export const HOME_SECTION_LABEL_AR = 'المنزل' as const;

export const HOME_YARD_MICRO_LOCATION_IDS = [
  'hy_yard_center',
  'hy_beside_range_rover',
  'hy_behind_range_rover',
  'hy_near_gate_inside',
  'hy_outside_gate',
  'hy_front_door',
  'hy_between_door_parking',
  'hy_side_wall',
] as const;

export type HomeYardMicroLocationId = typeof HOME_YARD_MICRO_LOCATION_IDS[number];
export type YardVehicleVisibility = 'none' | 'partial' | 'full';

export const HOME_YARD_BLUEPRINT = {
  id: 'fixed-home-yard-v1',
  sectionLabelAR: HOME_SECTION_LABEL_AR,
  permanentAnchors: [
    'private Saudi villa courtyard connected to the same fixed home',
    'off-white perimeter walls with restrained localized weathering only',
    'large black sliding vehicle gate with one fixed motor-side orientation',
    'interlock-paved courtyard with consistent joint pattern and one fixed parking bay along the right-side wall',
    'main house entrance door facing the courtyard',
    'outdoor AC/service infrastructure only where architecturally plausible',
  ],
  parkingBay: {
    relation: 'fixed parking bay along the right-side courtyard wall, approximately 3m inside the vehicle gate and approximately 2m clear of the side wall',
    orientation: 'vehicle parked diagonally at approximately 45 degrees facing toward the gate',
  },
  vehicle: {
    identity: '2017 Range Rover Sport L494 pre-facelift, Fuji White, ordinary privately-owned Saudi-spec appearance',
    baselineCondition: 'light ordinary courtyard dust, restrained brake dust and close-range paint micro-swirls only; no forced major damage, oil leak, peeling roof, yellowed lamps, or body dents',
    lightingState: 'headlights, fog lights and brake lights OFF by default unless explicitly activated by the selected scene',
  },
  disorderBudget: [
    'slight dust accumulation in interlock joints and low-contact edges',
    'mild ordinary tire traces at the fixed parking bay',
    'subtle wall/weather wear around service areas',
    'optionally choose at most one to three small causal imperfections: one slightly raised paver, one tiny weed in a joint, one flattened gum mark, one dry leaf/debris cluster, one faint old tire mark, or one minor water stain near drainage/AC',
  ],
} as const;

export function isHomeYardMicroLocationId(id?: string | null): id is HomeYardMicroLocationId {
  return Boolean(id && (HOME_YARD_MICRO_LOCATION_IDS as readonly string[]).includes(id));
}

export interface HomeYardVisibilityInput {
  microLocationId?: string | null;
  framingClass: 'tight' | 'medium' | 'wide';
  cameraAngle: string;
  captureType: string;
}

export interface HomeYardVisibilityDecision {
  vehicleVisibility: YardVehicleVisibility;
  visibleGroundEffects: boolean;
  vehiclePrompt: string[];
  geometryGuards: string[];
}

export function resolveHomeYardVisibility(
  input: HomeYardVisibilityInput
): HomeYardVisibilityDecision | null {
  if (!isHomeYardMicroLocationId(input.microLocationId)) return null;

  const { microLocationId, framingClass, cameraAngle, captureType } = input;
  const offAxis = cameraAngle.includes('off-center');
  const wideEnough = framingClass === 'wide' || offAxis;
  const selfie = captureType === 'front-selfie';

  let vehicleVisibility: YardVehicleVisibility = 'none';
  let visibleGroundEffects = false;

  switch (microLocationId) {
    case 'hy_beside_range_rover':
      vehicleVisibility = framingClass === 'wide' ? 'full' : 'partial';
      visibleGroundEffects = framingClass !== 'tight';
      break;
    case 'hy_behind_range_rover':
      vehicleVisibility = framingClass === 'wide' ? 'full' : 'partial';
      visibleGroundEffects = framingClass === 'wide';
      break;
    case 'hy_between_door_parking':
      vehicleVisibility = framingClass === 'tight' ? 'partial' : 'full';
      visibleGroundEffects = framingClass !== 'tight';
      break;
    case 'hy_yard_center':
      vehicleVisibility = framingClass === 'tight' ? 'none' : 'partial';
      visibleGroundEffects = framingClass === 'wide';
      break;
    case 'hy_near_gate_inside':
      vehicleVisibility = wideEnough ? 'partial' : 'none';
      visibleGroundEffects = framingClass === 'wide';
      break;
    case 'hy_outside_gate':
      vehicleVisibility = wideEnough ? 'partial' : 'none';
      visibleGroundEffects = framingClass === 'wide';
      break;
    case 'hy_front_door':
      vehicleVisibility = wideEnough ? 'partial' : 'none';
      visibleGroundEffects = framingClass === 'wide';
      break;
    case 'hy_side_wall':
      vehicleVisibility = framingClass === 'wide' ? 'partial' : 'none';
      visibleGroundEffects = framingClass === 'wide';
      break;
  }

  const vehiclePrompt: string[] = [];
  if (vehicleVisibility !== 'none') {
    vehiclePrompt.push(
      `${HOME_YARD_BLUEPRINT.vehicle.identity}; ${HOME_YARD_BLUEPRINT.vehicle.baselineCondition}; parked in the fixed courtyard bay; render only the physically visible ${vehicleVisibility === 'full' ? 'vehicle body' : 'portion of the vehicle'} within the resolved camera FOV`
    );
  }
  if (visibleGroundEffects) {
    vehiclePrompt.push(
      'only the actually visible part of the fixed parking-bay ground may show restrained tire traces and slight interlock compression; do not reveal hidden parking marks merely to prove continuity'
    );
  }

  const geometryGuards = [
    'the Range Rover exists in the persistent yard state even when outside the camera field of view',
    'compile the vehicle body only when its projected region intersects the resolved camera FOV and is not fully occluded',
    microLocationId === 'hy_outside_gate'
      ? 'a closed solid gate fully occludes the vehicle; partial vehicle visibility is allowed only through a physically open gate aperture or side sightline, never through solid metal'
      : 'walls, gate planes, subject body and architecture must occlude the vehicle whenever geometry requires it',
    'if only a small portion is visible, describe only that portion; never force the full SUV into frame',
    'parking-bay wear, tire traces and reflections appear only when that exact ground region is inside the frame',
    HOME_YARD_BLUEPRINT.vehicle.lightingState,
    selfie
      ? 'use the existing Xiaomi 15 Ultra front-camera geometry and resolved 40-60cm handheld reach; never hardcode a 65cm selfie arm'
      : 'do not inject selfie-arm mechanics into non-selfie captures',
  ];

  return {
    vehicleVisibility,
    visibleGroundEffects,
    vehiclePrompt,
    geometryGuards,
  };
}

export function compileHomeYardEnvironment(
  decision: HomeYardVisibilityDecision
): string {
  const base = [
    'same fixed private Saudi villa courtyard',
    ...HOME_YARD_BLUEPRINT.permanentAnchors,
    `fixed vehicle bay: ${HOME_YARD_BLUEPRINT.parkingBay.relation}; ${HOME_YARD_BLUEPRINT.parkingBay.orientation}`,
    `realism budget: ${HOME_YARD_BLUEPRINT.disorderBudget.join('; ')}`,
  ];

  if (decision.vehiclePrompt.length > 0) {
    base.push(...decision.vehiclePrompt);
  }
  base.push(...decision.geometryGuards);
  return base.join('. ');
}
