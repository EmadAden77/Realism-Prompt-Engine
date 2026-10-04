import { SceneFamilyId } from '../data/microLocations';
import { BackgroundRealismState } from './backgroundRealism';
import { LightingCausalityState } from './lightingCausality';

export type PlausibilityStatus = 'plausible' | 'constrained' | 'impossible';

export interface PlausibilityDimension {
  status: PlausibilityStatus;
  score: number;
  reasons: string[];
}

export interface ScenePlausibilityState {
  overallStatus: PlausibilityStatus;
  overallScore: number;
  captureTopology: PlausibilityDimension;
  bodyMechanics: PlausibilityDimension;
  lighting: PlausibilityDimension;
  background: PlausibilityDimension;
  spatialOcclusion: PlausibilityDimension;
  blockers: string[];
  constraints: string[];
}

export interface ScenePlausibilityInput {
  familyId: SceneFamilyId;
  subScene: string;
  captureType: 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
  framingClass: 'tight' | 'medium' | 'wide';
  cameraAngle: 'eye-level' | 'slightly-high' | 'slightly-low' | 'slightly-off-center';
  pose: string;
  foregroundObstruction: string;
  isOutdoor: boolean;
  visibleBodyRegion: string;
  occlusions: string[];
  foregroundElements: string[];
  backgroundRealism: BackgroundRealismState;
  lightingCausality: LightingCausalityState;
}

const dimension = (
  status: PlausibilityStatus,
  score: number,
  reasons: string[]
): PlausibilityDimension => ({
  status,
  score: Math.max(0, Math.min(100, Math.round(score))),
  reasons
});

const worstStatus = (statuses: PlausibilityStatus[]): PlausibilityStatus => {
  if (statuses.includes('impossible')) return 'impossible';
  if (statuses.includes('constrained')) return 'constrained';
  return 'plausible';
};

export function evaluateScenePlausibility(
  input: ScenePlausibilityInput
): ScenePlausibilityState {
  const {
    familyId,
    subScene,
    captureType,
    framingClass,
    pose,
    foregroundObstruction,
    isOutdoor,
    occlusions,
    foregroundElements,
    backgroundRealism,
    lightingCausality
  } = input;

  const blockers: string[] = [];
  const constraints: string[] = [];

  let captureTopology: PlausibilityDimension;
  if (captureType === 'front-selfie' && foregroundObstruction === 'through-glass') {
    captureTopology = dimension(
      'impossible',
      0,
      ['direct handheld front selfie cannot place a separate glass plane between camera and face']
    );
    blockers.push('front-selfie foreground topology is impossible');
  } else if (
    captureType === 'mirror-selfie' &&
    isOutdoor &&
    !subScene.includes('مقهى') &&
    !subScene.includes('محلات') &&
    !subScene.includes('خدمات')
  ) {
    captureTopology = dimension(
      'impossible',
      0,
      ['mirror selfie requires a real reflective plane in the selected micro-location']
    );
    blockers.push('mirror-selfie lacks a physically supported reflective surface');
  } else if (captureType === 'front-selfie' && framingClass === 'wide') {
    captureTopology = dimension(
      'constrained',
      88,
      ['wide front selfie is physically possible but requires near-maximum arm reach and stronger peripheral perspective']
    );
    constraints.push('wide front selfie requires near-maximum functional arm extension');
  } else {
    captureTopology = dimension(
      'plausible',
      100,
      ['capture topology is physically compatible with the selected scene']
    );
  }

  let bodyMechanics: PlausibilityDimension;
  if (
    familyId === 'car' &&
    !isOutdoor &&
    (pose.includes('واقف') || pose.includes('يمشي'))
  ) {
    bodyMechanics = dimension(
      'impossible',
      0,
      ['standing or walking pose cannot fit inside a closed vehicle cabin']
    );
    blockers.push('body pose conflicts with vehicle cabin geometry');
  } else if (pose.includes('مستند') && foregroundElements.length === 0 && occlusions.length === 0) {
    bodyMechanics = dimension(
      'constrained',
      82,
      ['leaning pose is allowed but visible contact support is weakly specified']
    );
    constraints.push('leaning pose should preserve a visible or strongly implied support surface');
  } else {
    bodyMechanics = dimension(
      'plausible',
      100,
      ['pose, visible body region, and contact geometry are mutually compatible']
    );
  }

  let lightingStatus: PlausibilityStatus = 'plausible';
  let lightingScore = 100;
  const lightingReasons: string[] = [
    `primary source: ${lightingCausality.primarySource.name}`,
    lightingCausality.shadowBehavior
  ];

  if (lightingCausality.sourceSummary.length === 0) {
    lightingStatus = 'impossible';
    lightingScore = 0;
    lightingReasons.push('no physically supported light source exists');
    blockers.push('scene has no physically supported light source');
  } else if (
    lightingCausality.primarySource.name === 'smartphone display glow' &&
    !lightingCausality.falloffBehavior.includes('rapid')
  ) {
    lightingStatus = 'impossible';
    lightingScore = 0;
    lightingReasons.push('phone-screen-only illumination lacks required near-field falloff');
    blockers.push('phone-screen-only light violates falloff physics');
  } else if (lightingCausality.secondarySources.length >= 4) {
    lightingStatus = 'constrained';
    lightingScore = 84;
    lightingReasons.push('many secondary sources increase risk of flattened or contradictory illumination');
    constraints.push('secondary light sources should remain subordinate to one clear primary source');
  }

  const backgroundReasons: string[] = [...backgroundRealism.decisionReasons];
  let backgroundStatus: PlausibilityStatus = 'plausible';
  let backgroundScore = 100;

  if (framingClass === 'tight' && (
    backgroundRealism.humanDensity !== 'none' ||
    backgroundRealism.vehicleDensity !== 'none'
  )) {
    backgroundStatus = 'impossible';
    backgroundScore = 0;
    backgroundReasons.push('tight selfie framing cannot support visible secondary people or vehicles');
    blockers.push('background population exceeds tight-selfie FOV');
  } else if (backgroundRealism.cappedByFraming) {
    backgroundStatus = 'constrained';
    backgroundScore = 86;
    backgroundReasons.push('requested background density was reduced to remain inside actual field of view');
    constraints.push('background activity was capped by selfie framing/FOV');
  } else if (backgroundRealism.visibilityClass === 'minimal') {
    backgroundStatus = 'constrained';
    backgroundScore = 92;
    backgroundReasons.push('background detail is intentionally limited by close framing');
  }

  let spatialOcclusion: PlausibilityDimension;
  if (familyId === 'car' && !isOutdoor && occlusions.length === 0) {
    spatialOcclusion = dimension(
      'impossible',
      0,
      ['vehicle cabin requires door/console/seat occlusion on lower body']
    );
    blockers.push('vehicle scene lacks required cabin occlusion');
  } else if (framingClass === 'wide' && foregroundElements.length === 0 && isOutdoor) {
    spatialOcclusion = dimension(
      'constrained',
      90,
      ['wide outdoor framing is plausible but lacks a near-field edge cue that would strengthen depth']
    );
    constraints.push('wide outdoor scene can benefit from one restrained foreground depth cue');
  } else {
    spatialOcclusion = dimension(
      'plausible',
      100,
      ['foreground, body occlusion, and background depth remain spatially coherent']
    );
  }

  const background = dimension(backgroundStatus, backgroundScore, backgroundReasons);
  const lighting = dimension(lightingStatus, lightingScore, lightingReasons);

  const dimensions = [
    captureTopology,
    bodyMechanics,
    lighting,
    background,
    spatialOcclusion
  ];

  const overallStatus = worstStatus(dimensions.map(item => item.status));

  const weightedScore = (
    captureTopology.score * 0.22 +
    bodyMechanics.score * 0.20 +
    lighting.score * 0.24 +
    background.score * 0.20 +
    spatialOcclusion.score * 0.14
  );

  const overallScore = overallStatus === 'impossible'
    ? Math.min(59, Math.round(weightedScore))
    : Math.round(weightedScore);

  return {
    overallStatus,
    overallScore,
    captureTopology,
    bodyMechanics,
    lighting,
    background,
    spatialOcclusion,
    blockers,
    constraints
  };
}
