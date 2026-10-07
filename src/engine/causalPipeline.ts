import { resolveScene, type ResolvedScene, type SceneState } from './physicsEngine';

export type PlatformTarget = 'neutral' | 'chatgpt' | 'gemini';

export type EffectPolicy =
  | 'required'
  | 'allowed'
  | 'conditional'
  | 'prohibited'
  | 'omit_by_default';

export interface SceneManifest {
  schemaVersion: '1.0';
  sceneId: string;
  platformTarget: PlatformTarget;
  resolved: ResolvedScene;
}

export interface EffectActivationInput {
  policy: EffectPolicy;
  causalTrigger: boolean;
  visible: boolean;
  relevant: boolean;
}

export interface EffectActivationDecision {
  emit: boolean;
  reason:
    | 'prohibited'
    | 'no-causal-trigger'
    | 'not-visible'
    | 'not-relevant'
    | 'omit-by-default'
    | 'emit';
}

export interface RuleCandidate {
  id: string;
  priority: number;
  scope: string[];
}

export type RuleConflictResolution =
  | { status: 'winner'; winner: RuleCandidate; loser: RuleCandidate; reason: 'priority' | 'specificity' }
  | { status: 'ambiguous'; candidates: [RuleCandidate, RuleCandidate] };

export interface PromptProvenance {
  sceneFacts: string[];
  ruleIds: string[];
}

export interface PromptFragment {
  id: string;
  text: string;
  provenance: PromptProvenance;
}

const buildSceneId = (state: SceneState): string => {
  const parts = [
    state.sceneFamily || 'unselected',
    state.subScene || 'default',
    state.captureType,
    state.timeOfDay,
  ];
  return parts.map(part => String(part).trim().replace(/\s+/g, '-')).join(':');
};

export function createSceneManifest(
  rawState: SceneState,
  platformTarget: PlatformTarget = 'neutral',
  sceneId?: string
): SceneManifest {
  const resolved = resolveScene(rawState);

  return {
    schemaVersion: '1.0',
    sceneId: sceneId || buildSceneId(resolved.state),
    platformTarget,
    resolved,
  };
}

export function decideEffectActivation(
  input: EffectActivationInput
): EffectActivationDecision {
  if (input.policy === 'prohibited') {
    return { emit: false, reason: 'prohibited' };
  }
  if (!input.causalTrigger) {
    return { emit: false, reason: 'no-causal-trigger' };
  }
  if (!input.visible) {
    return { emit: false, reason: 'not-visible' };
  }
  if (!input.relevant) {
    return { emit: false, reason: 'not-relevant' };
  }
  if (input.policy === 'omit_by_default') {
    return { emit: false, reason: 'omit-by-default' };
  }

  return { emit: true, reason: 'emit' };
}

export function resolveRuleConflict(
  first: RuleCandidate,
  second: RuleCandidate
): RuleConflictResolution {
  if (first.priority !== second.priority) {
    const winner = first.priority > second.priority ? first : second;
    const loser = winner === first ? second : first;
    return { status: 'winner', winner, loser, reason: 'priority' };
  }

  if (first.scope.length !== second.scope.length) {
    const winner = first.scope.length > second.scope.length ? first : second;
    const loser = winner === first ? second : first;
    return { status: 'winner', winner, loser, reason: 'specificity' };
  }

  return { status: 'ambiguous', candidates: [first, second] };
}
