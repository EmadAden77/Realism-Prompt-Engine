import { decideEffectActivation, type EffectPolicy } from './effectActivation';
import type { DerivedPhysicalState, SceneState } from './physicsEngine';
import type { HomeContinuityContext } from './fixedHomeContinuity';
import { deriveSaudiStreetRealism } from './saudiStreetRealism';

export interface KnowledgeRuleDecision {
  id: string;
  source: 'V20_DISTILLED' | 'SAUDI_STREET_REALISM';
  scope: string[];
  priority: number;
  effectPolicy: EffectPolicy;
  causalTrigger: boolean;
  visible: boolean;
  relevant: boolean;
  active: boolean;
  activationReason: string;
  reason: string;
  visibleConsequence: string;
}

interface RuleInput {
  source?: KnowledgeRuleDecision['source'];
  id: string;
  scope: string[];
  priority: number;
  effectPolicy: EffectPolicy;
  causalTrigger: boolean;
  visible: boolean;
  relevant?: boolean;
  reason: string;
  visibleConsequence: string;
  emitGuardWhenProhibited?: boolean;
}

const finalize = (rule: RuleInput): KnowledgeRuleDecision => {
  const relevant = rule.relevant ?? true;
  const activation = decideEffectActivation({
    policy: rule.effectPolicy,
    causalTrigger: rule.causalTrigger,
    visible: rule.visible,
    relevant,
  });

  // A prohibited effect is intentionally emitted only as a guard sentence.
  // The prohibited visual effect itself is never emitted.
  const active = rule.effectPolicy === 'prohibited'
    ? Boolean(rule.emitGuardWhenProhibited && rule.causalTrigger && rule.visible && relevant)
    : activation.emit;

  return {
    id: rule.id,
    source: rule.source ?? 'V20_DISTILLED',
    scope: rule.scope,
    priority: rule.priority,
    effectPolicy: rule.effectPolicy,
    causalTrigger: rule.causalTrigger,
    visible: rule.visible,
    relevant,
    active,
    activationReason: rule.effectPolicy === 'prohibited' && active
      ? 'guard-emitted'
      : activation.reason,
    reason: rule.reason,
    visibleConsequence: rule.visibleConsequence,
  };
};

/**
 * Distilled from the user-supplied V20 realism guide.
 *
 * V20 is raw domain knowledge, never a paste-ready prompt.
 * Every effect must pass cause + visibility + relevance before prompt emission.
 */
export function evaluateV20Knowledge(
  state: SceneState,
  physical?: DerivedPhysicalState,
  continuityContext?: HomeContinuityContext | null
): KnowledgeRuleDecision[] {
  const family = state.sceneFamily || 'saudi-outdoor';
  const isOutdoor = family === 'saudi-outdoor';
  const isHomeInterior = family === 'bedroom' || family === 'living-room';
  const isNight = state.timeOfDay === 'night';
  const isFrontSelfie = state.captureType === 'front-selfie';
  const isMirrorSelfie = state.captureType === 'mirror-selfie';

  const visibleEnvironment = physical
    ? Boolean(physical.visibleEnvironment?.trim())
    : true;
  const visibleBackground = physical
    ? Boolean(
        physical.visibleEnvironment?.trim() ||
        physical.visibleVehicles.length ||
        physical.visiblePeople.length
      )
    : true;
  const hasLightSource = physical
    ? physical.lightSources.length > 0
    : true;
  const hasMultipleLightSources = physical
    ? physical.lightSources.length >= 2
    : false;
  const hasOcclusion = physical
    ? physical.occlusions.length > 0
    : isFrontSelfie;
  const hasReflectionState = physical
    ? physical.reflectionState.length > 0
    : isMirrorSelfie || state.foregroundObstruction === 'through-glass';

  const dustyOutdoor = isOutdoor && state.atmosphericCondition === 'dusty-haze';
  const breezy = state.atmosphericCondition === 'breezy';
  const throughGlass = state.foregroundObstruction === 'through-glass';
  const smudgedLens = state.lensCondition === 'smudged-lens';
  const visiblyWornClothing =
    state.clothingCondition === 'worn-all-day' ||
    state.clothingCondition === 'vintage-washed';

  const baseRules = [
    finalize({
      id: 'V20_FIXED_HOME_CONTINUITY',
      scope: ['home', 'continuity'],
      priority: 90,
      effectPolicy: 'required',
      causalTrigger: isHomeInterior,
      visible: isHomeInterior && visibleEnvironment,
      reason: continuityContext
        ? `Persistent home context active: ${continuityContext.continuityKey}.`
        : isHomeInterior
          ? 'Selected scene uses the persistent home interior.'
          : 'Scene is not a persistent home interior.',
      visibleConsequence: continuityContext
        ? continuityContext.promptConstraint
        : 'Preserve fixed room architecture, furniture identity, permanent decor, window and door positions, and previously established wear patterns; lighting may change without silently replacing the room.',
    }),
    finalize({
      id: 'V20_LIGHT_SOURCE_CAUSALITY',
      scope: ['lighting', 'shadow', 'reflection'],
      priority: 88,
      effectPolicy: 'required',
      causalTrigger: hasLightSource,
      visible: visibleEnvironment,
      reason: physical
        ? `Resolved scene contains ${physical.lightSources.length} physically available light source(s).`
        : 'Scene contains at least one selected lighting source.',
      visibleConsequence:
        'Every visible highlight, shadow, reflection, color spill, and brightness falloff must be attributable to an actual scene light source; do not invent invisible fill lights.',
    }),
    finalize({
      id: 'V20_MIXED_LIGHT_GUARD',
      scope: ['lighting', 'night', 'color-response'],
      priority: 72,
      effectPolicy: 'conditional',
      causalTrigger: isNight && hasMultipleLightSources,
      visible: visibleEnvironment,
      reason: isNight && hasMultipleLightSources
        ? 'Night scene has multiple resolved practical light sources.'
        : 'Mixed-light behavior requires multiple practical sources at night.',
      visibleConsequence:
        'When practical sources differ in color or direction, preserve localized mixed-light response and separate shadow influence; do not force a split-color face when the listed sources do not justify it.',
    }),
    finalize({
      id: 'V20_OUTDOOR_AEROSOL_SCATTERING',
      scope: ['outdoor', 'atmosphere', 'lighting'],
      priority: 65,
      effectPolicy: 'conditional',
      causalTrigger: dustyOutdoor && hasLightSource,
      visible: isOutdoor && visibleEnvironment,
      reason: dustyOutdoor
        ? 'Outdoor dusty-haze state supplies a plausible particle medium.'
        : 'No outdoor dusty particle medium is active.',
      visibleConsequence:
        'Allow faint localized aerosol scattering only where a plausible bright source intersects visible airborne particles; never force theatrical volumetric beams across the whole scene.',
    }),
    finalize({
      id: 'V20_INDOOR_MIE_GUARD',
      scope: ['indoor', 'atmosphere'],
      priority: 95,
      effectPolicy: 'prohibited',
      causalTrigger: isHomeInterior,
      visible: isHomeInterior && visibleEnvironment,
      reason: isHomeInterior
        ? 'Clean home interiors do not receive default volumetric or Mie haze.'
        : 'Guard is not relevant outside the home interior.',
      visibleConsequence:
        'Do not invent indoor volumetric haze, Tyndall beams, or floating dust shafts unless a separate explicit particulate source makes them visible.',
      emitGuardWhenProhibited: true,
    }),
    finalize({
      id: 'V20_WIND_DIRECTION_SYNC',
      scope: ['motion', 'hair', 'clothing', 'environment'],
      priority: 75,
      effectPolicy: 'conditional',
      causalTrigger: breezy,
      visible: visibleEnvironment,
      reason: breezy
        ? 'Breezy atmospheric state supplies one coherent airflow field.'
        : 'No meaningful wind trigger is active.',
      visibleConsequence:
        'Keep loose hair, garment edges, foliage, light debris, dust, and vapor responding to one coherent airflow direction and relative strength instead of moving independently.',
    }),
    finalize({
      id: 'V20_DEPTH_PARALLAX',
      scope: ['camera', 'depth', 'occlusion'],
      priority: 74,
      effectPolicy: 'required',
      causalTrigger: isFrontSelfie && visibleBackground,
      visible: isFrontSelfie && visibleBackground,
      reason: isFrontSelfie
        ? 'Front-selfie geometry contains a near subject plane and visible deeper scene planes.'
        : 'Depth-parallax rule is reserved for front-selfie geometry.',
      visibleConsequence:
        'Preserve believable near-to-far scale, overlap, and parallax: the selfie arm and subject occupy the near plane while vehicles, poles, walls, and buildings remain progressively farther away without collapsing into one flat depth.',
    }),
    finalize({
      id: 'V20_CONTACT_OCCLUSION',
      scope: ['anatomy', 'contact', 'occlusion'],
      priority: 82,
      effectPolicy: 'required',
      causalTrigger: hasOcclusion,
      visible: hasOcclusion,
      reason: hasOcclusion
        ? 'Resolved scene contains contact or occlusion relationships.'
        : 'No meaningful contact or occlusion relation is visible.',
      visibleConsequence:
        'Preserve contact shadows, body-object overlap, and physically correct occlusion ordering at every visible contact point; no floating hands, objects, or impossible intersections.',
    }),
    finalize({
      id: 'V20_GLASS_LAYERING',
      scope: ['glass', 'reflection', 'occlusion'],
      priority: 75,
      effectPolicy: 'conditional',
      causalTrigger: throughGlass,
      visible: throughGlass && hasReflectionState,
      reason: throughGlass
        ? 'A real foreground glass plane is explicitly present.'
        : 'No visible foreground glass plane exists.',
      visibleConsequence:
        'Use restrained angle-dependent glare and reflection tied to the actual glass plane while preserving transmission through it; reflections must not float independently of the pane.',
    }),
    finalize({
      id: 'V20_MIRROR_GEOMETRY',
      scope: ['mirror', 'reflection', 'camera'],
      priority: 86,
      effectPolicy: 'required',
      causalTrigger: isMirrorSelfie,
      visible: isMirrorSelfie && hasReflectionState,
      reason: isMirrorSelfie
        ? 'Capture topology is an explicit mirror selfie.'
        : 'Scene is not a mirror selfie.',
      visibleConsequence:
        'Keep mirror geometry coherent: reflected body, phone, gaze direction, camera position, handedness cues, and background alignment must agree with the same flat mirror plane.',
    }),
    finalize({
      id: 'V20_REFLECTION_CAUSALITY',
      scope: ['reflection', 'material', 'lighting'],
      priority: 70,
      effectPolicy: 'conditional',
      causalTrigger: hasReflectionState && hasLightSource,
      visible: hasReflectionState,
      reason: hasReflectionState
        ? 'Resolved scene contains visible reflective relationships.'
        : 'No visible reflection relationship is resolved.',
      visibleConsequence:
        'Keep reflections limited to visible reflective surfaces and actual light or scene content; reflection strength, blur, and distortion must follow the surface rather than appearing as decorative glow.',
    }),
    finalize({
      id: 'V20_MATERIAL_WEAR_RESPONSE',
      scope: ['clothing', 'material', 'wear'],
      priority: 58,
      effectPolicy: 'conditional',
      causalTrigger: visiblyWornClothing,
      visible: true,
      reason: visiblyWornClothing
        ? `Selected clothing condition is ${state.clothingCondition}.`
        : 'Clothing is not in a worn or washed state.',
      visibleConsequence:
        'Express garment age through restrained material consequences such as plausible fold memory, seam softening, pilling, fading, or localized wear appropriate to the selected fabric; do not invent unrelated damage.',
    }),
    finalize({
      id: 'V20_LENS_CONTAMINATION',
      scope: ['camera', 'lens'],
      priority: 40,
      effectPolicy: 'conditional',
      causalTrigger: smudgedLens,
      visible: smudgedLens,
      reason: smudgedLens
        ? 'User selected a smudged-lens condition.'
        : 'Lens contamination has no causal trigger.',
      visibleConsequence:
        'Allow only subtle localized loss of micro-contrast or source-adjacent flare caused by the lens contamination; never convert the whole image into haze.',
    }),
    finalize({
      id: 'V20_WET_SURFACE_REFLECTIONS',
      scope: ['ground', 'reflection', 'weather'],
      priority: 60,
      effectPolicy: 'omit_by_default',
      causalTrigger: false,
      visible: false,
      reason:
        'Current SceneState has no explicit wet-surface or water trigger, so V20 wet-ground reflections remain disabled.',
      visibleConsequence:
        'Only produce localized wet specular reflections when visible ground is explicitly wet and a relevant light source affects it.',
    }),
    finalize({
      id: 'V20_SAME_MOMENT_CONTINUITY',
      scope: ['series', 'continuity'],
      priority: 55,
      effectPolicy: 'omit_by_default',
      causalTrigger: false,
      visible: false,
      reason:
        'No same-moment series or continuity identifier exists in the current SceneState.',
      visibleConsequence:
        'Lock temporary details such as stains, lint, droplets, props, object positions, and transient lighting only for an explicitly linked image series.',
    }),
    finalize({
      id: 'V20_COMPRESSION_ARTIFACTS',
      scope: ['capture', 'output-channel', 'compression'],
      priority: 25,
      effectPolicy: 'omit_by_default',
      causalTrigger: false,
      visible: false,
      reason:
        'No screenshot, messaging-app recompression, or low-quality export state exists in the current SceneState.',
      visibleConsequence:
        'Introduce macroblocking, banding, moire, or recompression softness only when an explicit output-channel or screenshot trigger exists.',
    }),
    finalize({
      id: 'V20_SEASONAL_WEATHER',
      scope: ['weather', 'temperature', 'body-response'],
      priority: 25,
      effectPolicy: 'omit_by_default',
      causalTrigger: false,
      visible: false,
      reason:
        'No explicit seasonal temperature state exists in the current SceneState.',
      visibleConsequence:
        'Add cold breath, heat haze, shivering, heavy sweat, dew, or dust-storm behavior only when explicit weather and temperature states justify them.',
    }),
    finalize({
      id: 'V20_GENERIC_MICRO_IMPERFECTIONS',
      scope: ['subject', 'imperfections'],
      priority: 20,
      effectPolicy: 'omit_by_default',
      causalTrigger: false,
      visible: false,
      reason:
        'Micro-imperfections must come from a visible reference, scene cause, or explicit user state rather than a universal defect list.',
      visibleConsequence:
        'Preserve naturally supported asymmetry and texture without inventing dirt, injuries, bloodshot eyes, earwax, nose hair, scars, or other defects.',
    }),
  ];

  const street = deriveSaudiStreetRealism(state, physical);
  const streetVisible = street.active && visibleEnvironment;

  const streetRules: KnowledgeRuleDecision[] = [
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_GOLDEN_GUARDS',
      scope: ['saudi-outdoor', 'place', 'lighting', 'clothing', 'vehicles', 'crowd'],
      priority: 92,
      effectPolicy: 'required',
      causalTrigger: street.active,
      visible: streetVisible,
      reason: street.active
        ? 'Saudi street scene activates the user-supplied one-place, causal-light, one-outfit, one-background-vehicle and natural-crowd guards.'
        : 'Scene is not a Saudi outdoor street context.',
      visibleConsequence: street.guards.join(' '),
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_GROUND_SURFACE',
      scope: ['saudi-outdoor', 'ground', 'asphalt', 'interlock'],
      priority: 68,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.surface),
      visible: streetVisible,
      reason: street.surface
        ? street.facts[0]
        : 'No visible Saudi street ground surface is resolved.',
      visibleConsequence: street.surface || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_ARCHITECTURE_WEAR',
      scope: ['saudi-outdoor', 'architecture', 'wall', 'building'],
      priority: 62,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.architecture),
      visible: streetVisible,
      reason: street.architecture
        ? 'Selected Saudi micro-location exposes ordinary building or boundary-wall surfaces.'
        : 'No relevant architectural surface is visible.',
      visibleConsequence: street.architecture || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_LIVED_IN_DISORDER',
      scope: ['saudi-outdoor', 'disorder', 'wear'],
      priority: 55,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.disorder),
      visible: streetVisible,
      reason: street.disorder
        ? 'Background disorder controls and FOV allow mild place-appropriate lived-in detail.'
        : 'Disorder is disabled, outside FOV, or physically capped.',
      visibleConsequence: street.disorder || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_SINGLE_VEHICLE',
      scope: ['saudi-outdoor', 'vehicle', 'background'],
      priority: 70,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.vehicle),
      visible: streetVisible,
      reason: street.vehicle
        ? 'Resolved background permits a vehicle and the one-background-vehicle rule selects one coherent type.'
        : 'No background vehicle is physically allowed or visible.',
      visibleConsequence: street.vehicle || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_VEHICLE_MOTION',
      scope: ['saudi-outdoor', 'vehicle', 'motion', 'lighting'],
      priority: 57,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.vehicleMotion),
      visible: streetVisible,
      reason: street.vehicleMotion
        ? 'Background vehicle motion is active and remains secondary to the subject.'
        : 'No moving background vehicle is resolved.',
      visibleConsequence: street.vehicleMotion || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_LICENSE_PLATE',
      scope: ['saudi-outdoor', 'vehicle', 'license-plate'],
      priority: 46,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.licensePlate),
      visible: streetVisible,
      reason: street.licensePlate
        ? 'A background vehicle is visible at a framing scale where a plate may plausibly appear.'
        : 'No plate-scale vehicle detail is visible.',
      visibleConsequence: street.licensePlate || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_BACKGROUND_PEOPLE',
      scope: ['saudi-outdoor', 'people', 'behavior'],
      priority: 60,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.people),
      visible: streetVisible,
      reason: street.people
        ? 'Background controls permit sparse ordinary human activity inside the current FOV.'
        : 'Background people are disabled or outside the visible framing.',
      visibleConsequence: street.people || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_PEOPLE_CLOTHING',
      scope: ['saudi-outdoor', 'people', 'clothing'],
      priority: 44,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.peopleClothing),
      visible: streetVisible,
      reason: street.peopleClothing
        ? 'Visible background people receive one context-appropriate clothing description.'
        : 'No background person is visible.',
      visibleConsequence: street.peopleClothing || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_NIGHT_SKY',
      scope: ['saudi-outdoor', 'night', 'sky'],
      priority: 42,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.sky),
      visible: streetVisible,
      reason: street.sky
        ? 'Night Saudi outdoor scene may expose an urban light-pollution sky when the sky enters frame.'
        : 'Night sky is not relevant to the current scene.',
      visibleConsequence: street.sky || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_SECONDARY_LIGHT',
      scope: ['saudi-outdoor', 'lighting', 'secondary-light'],
      priority: 73,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.secondaryLight),
      visible: streetVisible,
      reason: street.secondaryLight
        ? 'Multiple resolved practical light sources justify localized secondary spill.'
        : 'No second physically resolved light source exists.',
      visibleConsequence: street.secondaryLight || '',
    }),
    finalize({
      source: 'SAUDI_STREET_REALISM',
      id: 'SAUDI_STREET_DEPTH_LAYERS',
      scope: ['saudi-outdoor', 'camera', 'depth', 'parallax'],
      priority: 71,
      effectPolicy: 'conditional',
      causalTrigger: Boolean(street.depth),
      visible: streetVisible,
      reason: street.depth
        ? 'Front-selfie geometry exposes near, mid, and far Saudi street planes.'
        : 'Depth-layer rule is not visible in the current framing.',
      visibleConsequence: street.depth || '',
    }),
  ];

  return [...baseRules, ...streetRules];
}
