import type { KnowledgeRuleDecision } from './v20KnowledgeBase';
import type { PromptFragment } from './causalPipeline';

export interface SemanticPromptScene {
  identity: string;
  body: string;
  glasses: string;
  captureMechanics: string;
  hair: string;
  expression: string;
  outfit: string;
  outfitPhysics: string;
  poseAndContact: string;
  visibleEnvironment: string;
  lighting: string;
  atmosphere: string;
  skinResponse: string;
  cameraRealism: string;
  styleConstraints: string;
  groupSelfie?: string;
}

export interface CompiledNeutralPrompt {
  text: string;
  knowledgeFragments: PromptFragment[];
}

/**
 * Translate active causal knowledge decisions into visible prompt language.
 * Inactive rules never leak into the prompt.
 *
 * A prohibited rule may still emit a guard sentence, because the prohibited
 * physical effect itself is omitted while the guard explains what must not be invented.
 */
export function compileKnowledgeFragments(
  decisions: KnowledgeRuleDecision[] = []
): PromptFragment[] {
  return decisions
    .filter(decision => decision.active)
    .sort((a, b) => b.priority - a.priority)
    .map(decision => ({
      id: `knowledge:${decision.id}`,
      text: decision.visibleConsequence,
      provenance: {
        sceneFacts: [decision.reason],
        ruleIds: [decision.id],
      },
    }));
}

/**
 * Platform-neutral prompt compiler.
 * Platform wrappers belong in platformAdapter.ts only.
 */
export function compileNeutralPrompt(
  semantic: SemanticPromptScene,
  decisions: KnowledgeRuleDecision[] = []
): CompiledNeutralPrompt {
  const knowledgeFragments = compileKnowledgeFragments(decisions);

  let prompt = `Generate a realistic photograph with the following strict constraints:\n\n`;
  prompt += `[SUBJECT & IDENTITY LOCK]\n${semantic.identity}\nBody: ${semantic.body}\nEyeglasses: ${semantic.glasses}\nExpression: ${semantic.expression}\nHair: ${semantic.hair}\n\n`;
  prompt += `[ATTIRE & PHYSICS]\nOutfit: ${semantic.outfit}\nFabric Behavior: ${semantic.outfitPhysics}\nSkin State: ${semantic.skinResponse}\n\n`;

  if (semantic.groupSelfie) {
    prompt += `[GROUP SELFIE CAST & ANTI-CLONING]\n${semantic.groupSelfie}\n\n`;
  }

  prompt += `[CAMERA & FRAMING]\n${semantic.captureMechanics}\n${semantic.cameraRealism}\n\n`;
  prompt += `[ENVIRONMENT & ATMOSPHERE]\nLocation: ${semantic.visibleEnvironment}\nAtmospheric Condition: ${semantic.atmosphere}\nLighting: ${semantic.lighting}\n\n`;
  prompt += `[POSE & CONTACT]\n${semantic.poseAndContact}\n\n`;
  prompt += `[PHYSICS CONSTRAINTS]\n${semantic.styleConstraints}`;

  if (knowledgeFragments.length > 0) {
    prompt += `\n\n[CAUSAL REALISM CONSTRAINTS]\n`;
    prompt += knowledgeFragments.map(fragment => fragment.text).join('\n');
  }

  return {
    text: prompt,
    knowledgeFragments,
  };
}
