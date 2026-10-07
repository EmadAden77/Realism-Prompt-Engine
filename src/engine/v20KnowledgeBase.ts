import type { EffectPolicy } from './causalPipeline';
import type { SceneState } from './physicsEngine';

export interface KnowledgeRuleDecision {
  id: string;
  source: 'V20_DISTILLED';
  scope: string[];
  priority: number;
  effectPolicy: EffectPolicy;
  active: boolean;
  reason: string;
  visibleConsequence: string;
}

/**
 * Distilled from the user-supplied V20 realism guide.
 *
 * Important: V20 is treated as raw domain knowledge, never as a prompt to paste.
 * Effects are activated only when a scene cause exists and the result is relevant.
 */
export function evaluateV20Knowledge(state: SceneState): KnowledgeRuleDecision[] {
  const family = state.sceneFamily || 'saudi-outdoor';
  const isOutdoor = family === 'saudi-outdoor';
  const isHomeInterior = family === 'bedroom' || family === 'living-room';
  const dustyOutdoor = isOutdoor && state.atmosphericCondition === 'dusty-haze';
  const breezy = state.atmosphericCondition === 'breezy';
  const throughGlass = state.foregroundObstruction === 'through-glass';
  const smudgedLens = state.lensCondition === 'smudged-lens';

  return [
    {
      id: 'V20_FIXED_HOME_CONTINUITY',
      source: 'V20_DISTILLED',
      scope: ['home', 'continuity'],
      priority: 90,
      effectPolicy: 'required',
      active: isHomeInterior,
      reason: isHomeInterior
        ? 'Selected scene uses the persistent home interior.'
        : 'Scene is not a persistent home interior.',
      visibleConsequence:
        'Preserve fixed room architecture, furniture identity, permanent decor, window/door positions, and approved wear patterns.',
    },
    {
      id: 'V20_OUTDOOR_AEROSOL_SCATTERING',
      source: 'V20_DISTILLED',
      scope: ['outdoor', 'atmosphere', 'lighting'],
      priority: 65,
      effectPolicy: 'conditional',
      active: dustyOutdoor,
      reason: dustyOutdoor
        ? 'Outdoor dusty-haze state supplies a plausible particle medium.'
        : 'No outdoor dusty particle medium is active.',
      visibleConsequence:
        'Allow faint localized aerosol scattering only around physically plausible bright sources; never force theatrical volumetric beams.',
    },
    {
      id: 'V20_INDOOR_MIE_GUARD',
      source: 'V20_DISTILLED',
      scope: ['indoor', 'atmosphere'],
      priority: 95,
      effectPolicy: 'prohibited',
      active: isHomeInterior,
      reason: isHomeInterior
        ? 'Clean home interiors do not receive default volumetric/Mie haze.'
        : 'Guard is not relevant outside the home interior.',
      visibleConsequence:
        'Do not invent indoor volumetric haze or dust beams unless a separate explicit particulate trigger exists.',
    },
    {
      id: 'V20_WIND_DIRECTION_SYNC',
      source: 'V20_DISTILLED',
      scope: ['motion', 'hair', 'clothing', 'environment'],
      priority: 75,
      effectPolicy: 'conditional',
      active: breezy,
      reason: breezy
        ? 'Breezy atmospheric state supplies one coherent airflow field.'
        : 'No meaningful wind trigger is active.',
      visibleConsequence:
        'Keep hair tips, loose garment edges, foliage, dust, and other lightweight elements moving in one physically coherent wind direction.',
    },
    {
      id: 'V20_GLASS_LAYERING',
      source: 'V20_DISTILLED',
      scope: ['glass', 'reflection', 'occlusion'],
      priority: 75,
      effectPolicy: 'conditional',
      active: throughGlass,
      reason: throughGlass
        ? 'A real foreground glass plane is explicitly present.'
        : 'No visible glass plane exists.',
      visibleConsequence:
        'Use restrained angle-dependent glare/reflection tied to the actual glass plane, while preserving visibility through the glass.',
    },
    {
      id: 'V20_LENS_CONTAMINATION',
      source: 'V20_DISTILLED',
      scope: ['camera', 'lens'],
      priority: 40,
      effectPolicy: 'conditional',
      active: smudgedLens,
      reason: smudgedLens
        ? 'User selected a smudged-lens condition.'
        : 'Lens contamination has no causal trigger.',
      visibleConsequence:
        'Allow only subtle localized loss of micro-contrast or flare near strong practical lights; never apply global haze.',
    },
    {
      id: 'V20_WET_SURFACE_REFLECTIONS',
      source: 'V20_DISTILLED',
      scope: ['ground', 'reflection', 'weather'],
      priority: 60,
      effectPolicy: 'omit_by_default',
      active: false,
      reason:
        'Current SceneState has no explicit wet-surface or water trigger, so V20 wet-ground reflections remain disabled.',
      visibleConsequence:
        'Only produce localized wet specular reflections when visible ground is explicitly wet and a relevant light source affects it.',
    },
    {
      id: 'V20_SAME_MOMENT_CONTINUITY',
      source: 'V20_DISTILLED',
      scope: ['series', 'continuity'],
      priority: 55,
      effectPolicy: 'omit_by_default',
      active: false,
      reason:
        'No same-moment series/continuity identifier exists in the current SceneState.',
      visibleConsequence:
        'Lock temporary details such as stains, lint, droplets, props, and object positions only for an explicitly linked image series.',
    },
    {
      id: 'V20_GENERIC_MICRO_IMPERFECTIONS',
      source: 'V20_DISTILLED',
      scope: ['subject', 'imperfections'],
      priority: 20,
      effectPolicy: 'omit_by_default',
      active: false,
      reason:
        'Micro-imperfections must come from a visible reference, scene cause, or explicit user state rather than a universal defect list.',
      visibleConsequence:
        'Preserve naturally supported asymmetry and texture without inventing dirt, injuries, bloodshot eyes, earwax, nose hair, or other defects.',
    },
  ];
}
