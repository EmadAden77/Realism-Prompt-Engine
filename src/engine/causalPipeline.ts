import { resolveScene, type ResolvedScene, type SceneState } from './physicsEngine';
import { evaluateV20Knowledge, type KnowledgeRuleDecision } from './v20KnowledgeBase';
import {
  decideEffectActivation,
  type EffectPolicy,
  type EffectActivationInput,
  type EffectActivationDecision
} from './effectActivation';

export { decideEffectActivation };
export type { EffectPolicy, EffectActivationInput, EffectActivationDecision };

export type PlatformTarget = 'neutral' | 'chatgpt' | 'gemini';

export interface SceneManifest {
  schemaVersion: '1.0';
  sceneId: string;
  platformTarget: PlatformTarget;
  resolved: ResolvedScene;
  knowledgeDecisions: KnowledgeRuleDecision[];
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
    knowledgeDecisions: evaluateV20Knowledge(resolved.state, resolved.physicalState),
  };
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
