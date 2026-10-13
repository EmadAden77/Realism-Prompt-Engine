import type { DerivedPhysicalState, SceneState } from './physicsEngine';

/**
 * Prompt-only spatial planning. This is deliberately not a 3D renderer or a
 * projection solver: the physical resolver remains authoritative for FOV,
 * visible objects, group capacity and occlusion. No new scene facts are made up.
 */
export type SpatialRegionRole =
  | 'subject'
  | 'near-background'
  | 'far-background'
  | 'foreground-occlusion';

export interface SpatialCompositionRegion {
  role: SpatialRegionRole;
  placement: string;
  depthOrder: 'foreground' | 'subject-plane' | 'behind-subject' | 'far-background';
  visibility: 'dominant' | 'visible' | 'limited';
}

export interface SpatialCompositionPlan {
  backgroundCapacity: DerivedPhysicalState['backgroundRealism']['visibilityClass'];
  regions: SpatialCompositionRegion[];
  promptInstruction: string;
}

type SpatialPhysicalInput = Pick<
  DerivedPhysicalState,
  | 'framingClass'
  | 'backgroundDepth'
  | 'backgroundRealism'
  | 'visibleEnvironment'
  | 'visiblePeople'
  | 'visibleVehicles'
  | 'foregroundElements'
  | 'occlusions'
  | 'selfieAngle'
  | 'groupSelfie'
>;

type SpatialSceneInput = Pick<SceneState, 'captureType' | 'cameraAngle'>;

/**
 * Create semantic regions from an already physically resolved scene.
 * Placements are qualitative composition hints, never fabricated bounding
 * boxes or promises that a text-to-image model can enforce precise pixels.
 */
export function planSpatialComposition(
  scene: SpatialSceneInput,
  physical: SpatialPhysicalInput
): SpatialCompositionPlan {
  const backgroundCapacity = physical.backgroundRealism.visibilityClass;
  const view = physical.backgroundRealism.viewGeometry;
  const tightView = physical.framingClass === 'tight' || backgroundCapacity === 'minimal';
  const extendedView =
    physical.framingClass === 'wide' &&
    (backgroundCapacity === 'moderate' || backgroundCapacity === 'expanded');
  const offAxis =
    scene.cameraAngle === 'slightly-off-center' ||
    Math.abs(physical.selfieAngle?.yawDeg ?? 0) > 6;
  const isGroup = Boolean(physical.groupSelfie?.enabled);
  const hasVisibleBackground = physical.visibleEnvironment.trim().length > 0;
  const hasBackgroundActors =
    physical.visiblePeople.length > 0 || physical.visibleVehicles.length > 0;
  const hasForegroundObstruction =
    physical.foregroundElements.length > 0 ||
    physical.occlusions.some(item =>
      !/capturing smartphone is positioned off-camera/i.test(item)
    );

  const subjectPlacement =
    scene.captureType === 'mirror-selfie'
      ? 'inside the same physically consistent mirror view'
      : tightView
        ? 'dominant near-camera central field'
        : offAxis
          ? 'slightly off-center with one available background margin'
          : 'near the image center with natural handheld asymmetry';

  const regions: SpatialCompositionRegion[] = [
    {
      role: 'subject',
      placement: subjectPlacement,
      depthOrder: 'subject-plane',
      visibility: 'dominant',
    },
  ];

  if (hasVisibleBackground) {
    regions.push({
      role: 'near-background',
      placement: view.wallDominated && !view.streetVisible
        ? 'the wall, threshold or entrance plane immediately behind the subject, with no impossible view through it'
        : tightView
          ? 'only narrow physically visible margins beyond the subject'
          : view.horizontalBias === 'centered'
            ? 'narrow scene-appropriate space behind the shoulders, without a fabricated wide panorama'
            : `the physically open ${view.horizontalBias} side margin behind the subject, with natural cropping opposite`,
      depthOrder: 'behind-subject',
      visibility: tightView ? 'limited' : 'visible',
    });
  }

  if (
    extendedView &&
    /deep street|medium outdoor/i.test(physical.backgroundDepth) &&
    (!view.wallDominated || view.streetVisible)
  ) {
    regions.push({
      role: 'far-background',
      placement: 'distant depth already supported by the resolved environment',
      depthOrder: 'far-background',
      visibility: 'limited',
    });
  }

  if (hasForegroundObstruction) {
    regions.push({
      role: 'foreground-occlusion',
      placement: 'only at existing resolved contact and frame-boundary occlusions',
      depthOrder: 'foreground',
      visibility: 'limited',
    });
  }

  const subjectGuidance = isGroup
    ? 'Keep the identity-locked phone holder and the already resolved companions within one shared camera field; do not multiply the phone-holding arm.'
    : tightView
      ? 'Keep the reference subject dominant in the close foreground.'
      : offAxis
        ? 'Place the reference subject slightly off-center, preserving a natural free side of the frame.'
        : 'Keep the reference subject near the foreground center, without artificial perfect symmetry.';

  const instructions = [
    'Spatial composition: ' + subjectGuidance,
    tightView
      ? 'Background may occupy only the narrow areas actually visible past the subject and camera field of view.'
      : 'Place only already resolved visible environmental details in the available background; maintain believable relative scale, depth and overlap.',
  ];

  if (hasBackgroundActors) {
    instructions.push(
      'Place each already permitted person or vehicle ONLY inside an unobstructed background side margin or visible glazing aperture, at the right scale for its depth; keep heads, feet, tires and shadows on consistent planes. Never add extra actors to fill space.'
    );
  } else {
    instructions.push('Do not add background people or vehicles when the resolved camera view leaves no physical sightline for them.');
  }

  if (view.wallDominated && !view.streetVisible) {
    instructions.push('This selfie is backed by a wall or doorway: no road traffic, pedestrians or parked cars may appear through the opaque surface.');
  }

  if (view.verticalBias === 'upperward') {
    instructions.push('The raised camera sightline naturally crops lower streets, curbs, tires and shoes; do not force them into the picture.');
  } else if (view.verticalBias === 'groundward') {
    instructions.push('The lowered sightline may show actual floor or pavement detail, not unrelated high rooftops or far skyline.');
  }

  if (view.windowVisible) {
    instructions.push('Only the existing cabin window/windshield opening may transmit small exterior views; preserve trim/glass edges and exposure differences.');
  }

  if (hasForegroundObstruction) {
    instructions.push(
      'Preserve the pre-existing foreground and body occlusions; do not reveal hidden surfaces or create intersecting objects.'
    );
  }

  if (scene.captureType === 'mirror-selfie') {
    instructions.push(
      'Maintain one coherent flat mirror plane, with the handheld phone appearing in the reflection, not as a separate floating camera.'
    );
  } else if (scene.captureType === 'front-selfie') {
    instructions.push(
      'Keep the capturing smartphone outside the direct selfie image.'
    );
  }

  instructions.push(
    'Do not introduce off-frame objects or landmarks solely to satisfy a composition plan.'
  );

  return {
    backgroundCapacity,
    regions,
    promptInstruction: instructions.join(' '),
  };
}
