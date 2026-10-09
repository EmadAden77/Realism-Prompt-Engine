import { getHairPhysicsPreset } from '../data/hairPhysicsLibrary';
import { ADVANCED_FACIAL_EXPRESSIONS } from '../data/facialExpressionLibrary';
import { resolveScene, type ResolvedScene, type SceneState } from './physicsEngine';
import { evaluateV20Knowledge, type KnowledgeRuleDecision } from './v20KnowledgeBase';
import { resolveHomeContinuity, type HomeContinuityContext } from './fixedHomeContinuity';
import { resolveReferencePlan, type ReferencePlan } from './referenceRouter';
import {
  decideEffectActivation,
  type EffectPolicy,
  type EffectActivationInput,
  type EffectActivationDecision
} from './effectActivation';

export { decideEffectActivation };
export type { EffectPolicy, EffectActivationInput, EffectActivationDecision };

export type PlatformTarget = 'neutral' | 'chatgpt' | 'gemini' | 'midjourney';

export interface SceneManifest {
  schemaVersion: '1.0';
  sceneId: string;
  platformTarget: PlatformTarget;
  resolved: ResolvedScene;
  continuityContext: HomeContinuityContext | null;
  referencePlan: ReferencePlan;
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
  section?: string;
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
  const continuityContext = resolveHomeContinuity(resolved.state);
  const referencePlan = resolveReferencePlan(resolved.state);

  return {
    schemaVersion: '1.0',
    sceneId: sceneId || buildSceneId(resolved.state),
    platformTarget,
    resolved,
    continuityContext,
    referencePlan,
    knowledgeDecisions: evaluateV20Knowledge(
      resolved.state,
      resolved.physicalState,
      continuityContext
    ),
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

export function deriveCausalHairExpression(state: SceneState): { hair: string[]; expression: string[] } {
  const hair = ['Keep the chosen hairstyle and natural strand texture without uniform artificial shine.'];
  const expression = ['Preserve the chosen facial expression and subtle natural skin detail.'];
  if (state.hairPhysicsPreset && state.hairPhysicsPreset !== 'hp_auto') {
    hair.push(getHairPhysicsPreset(state.hairPhysicsPreset).prompt);
  }
  const chosenExpression = ADVANCED_FACIAL_EXPRESSIONS.find(item => item.id === state.expression);
  if (chosenExpression) expression.push(chosenExpression.anatomy);
  if (state.atmosphericCondition === 'breezy') hair.push('Loose exposed strands respond naturally to the breeze.');
  // A selected rear/side source is needed; color temperature alone proves no rim light.
  const backlight = /(?:backlight|backlit|rim light|rear light|إضاءة خلفية|ضوء خلفي)/i.test(state.lightingMode) && !/(?:no backlight|without backlight|no rim light|بدون إضاءة خلفية)/i.test(state.lightingMode);
  if (backlight) {
    hair.push('Visible fine hair shafts receive directionally consistent rim transmission and scattering from the selected rear light; no invented dandruff.');
  }
  const directSun = state.timeOfDay !== 'night' && /(?:شمس مباشرة|direct sun|direct sunlight)/i.test(state.lightingMode) && !/(?:no direct sun|without direct sunlight|بدون شمس مباشرة)/i.test(state.lightingMode);
  if (directSun) {
    expression.push('Direct facial sunlight permits a restrained eyelid response consistent with the chosen expression; no fixed left-right squint ratio.');
  }
  if (state.captureType === 'mirror-selfie') {
    hair.push('Hair reflection follows the same planar mirror geometry as the face.');
    expression.push('Maintain expression and identity in the mirror reflection.');
  }
  return { hair, expression };
}
