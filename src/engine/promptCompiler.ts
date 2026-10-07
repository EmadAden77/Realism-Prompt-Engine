import type { KnowledgeRuleDecision } from './v20KnowledgeBase';
import type { PromptFragment } from './causalPipeline';
import {
  compressPromptFragments,
  type CompressionStats,
} from './promptCompression';

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
  fragments: PromptFragment[];
  knowledgeFragments: PromptFragment[];
  compression: CompressionStats;
}

export interface PromptFragmentDiff {
  changedIds: string[];
  addedIds: string[];
  removedIds: string[];
  unchangedIds: string[];
}

const fragment = (
  id: string,
  section: string,
  text: string,
  sceneFacts: string[],
  ruleIds: string[]
): PromptFragment => ({
  id,
  section,
  text,
  provenance: {
    sceneFacts,
    ruleIds,
  },
});

/**
 * Stable semantic prompt sections with explicit provenance.
 *
 * These fragments are platform-neutral. They describe what the scene means,
 * not how any specific image model expects reference syntax.
 */
export function compileBasePromptFragments(
  semantic: SemanticPromptScene
): PromptFragment[] {
  const fragments: PromptFragment[] = [
    fragment(
      'prompt:subject',
      'SUBJECT & IDENTITY LOCK',
      [
        semantic.identity,
        `Body: ${semantic.body}`,
        `Eyeglasses: ${semantic.glasses}`,
        `Expression: ${semantic.expression}`,
        `Hair: ${semantic.hair}`,
      ].join('\n'),
      [
        'semantic.identity',
        'semantic.body',
        'semantic.glasses',
        'semantic.expression',
        'semantic.hair',
      ],
      ['PROMPT_SUBJECT_IDENTITY']
    ),
    fragment(
      'prompt:attire',
      'ATTIRE & PHYSICS',
      [
        `Outfit: ${semantic.outfit}`,
        `Fabric Behavior: ${semantic.outfitPhysics}`,
        `Skin State: ${semantic.skinResponse}`,
      ].join('\n'),
      [
        'semantic.outfit',
        'semantic.outfitPhysics',
        'semantic.skinResponse',
      ],
      ['PROMPT_ATTIRE_PHYSICS']
    ),
  ];

  if (semantic.groupSelfie) {
    fragments.push(
      fragment(
        'prompt:group-selfie',
        'GROUP SELFIE CAST & ANTI-CLONING',
        semantic.groupSelfie,
        ['semantic.groupSelfie'],
        ['PROMPT_GROUP_SELFIE']
      )
    );
  }

  fragments.push(
    fragment(
      'prompt:camera',
      'CAMERA & FRAMING',
      [semantic.captureMechanics, semantic.cameraRealism].join('\n'),
      ['semantic.captureMechanics', 'semantic.cameraRealism'],
      ['PROMPT_CAMERA_FRAMING']
    ),
    fragment(
      'prompt:environment',
      'ENVIRONMENT & ATMOSPHERE',
      [
        semantic.visibleEnvironment.trim().startsWith('Location:')
          ? semantic.visibleEnvironment
          : `Location: ${semantic.visibleEnvironment}`,
        `Atmosphere: ${semantic.atmosphere}`,
        `Lighting: ${semantic.lighting}`,
      ].join('\n'),
      [
        'semantic.visibleEnvironment',
        'semantic.atmosphere',
        'semantic.lighting',
      ],
      ['PROMPT_ENVIRONMENT_ATMOSPHERE']
    ),
    fragment(
      'prompt:pose-contact',
      'POSE & CONTACT',
      semantic.poseAndContact,
      ['semantic.poseAndContact'],
      ['PROMPT_POSE_CONTACT']
    ),
    fragment(
      'prompt:physics',
      'PHYSICS CONSTRAINTS',
      semantic.styleConstraints,
      ['semantic.styleConstraints'],
      ['PROMPT_PHYSICS_CONSTRAINTS']
    )
  );

  return fragments;
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
      section: 'CAUSAL REALISM CONSTRAINTS',
      text: decision.visibleConsequence,
      provenance: {
        sceneFacts: [decision.reason],
        ruleIds: [decision.id],
      },
    }));
}

export function diffPromptFragments(
  before: PromptFragment[],
  after: PromptFragment[]
): PromptFragmentDiff {
  const beforeById = new Map(before.map(item => [item.id, item]));
  const afterById = new Map(after.map(item => [item.id, item]));

  const changedIds: string[] = [];
  const addedIds: string[] = [];
  const removedIds: string[] = [];
  const unchangedIds: string[] = [];

  for (const [id, afterFragment] of afterById) {
    const beforeFragment = beforeById.get(id);
    if (!beforeFragment) {
      addedIds.push(id);
    } else if (
      beforeFragment.text !== afterFragment.text ||
      beforeFragment.section !== afterFragment.section
    ) {
      changedIds.push(id);
    } else {
      unchangedIds.push(id);
    }
  }

  for (const id of beforeById.keys()) {
    if (!afterById.has(id)) {
      removedIds.push(id);
    }
  }

  return {
    changedIds,
    addedIds,
    removedIds,
    unchangedIds,
  };
}

/**
 * Platform-neutral prompt compiler.
 * Platform wrappers belong in platformAdapter.ts only.
 */
export function compileNeutralPrompt(
  semantic: SemanticPromptScene,
  decisions: KnowledgeRuleDecision[] = []
): CompiledNeutralPrompt {
  const baseFragments = compileBasePromptFragments(semantic);
  const knowledgeFragments = compileKnowledgeFragments(decisions);
  const rawFragments = [...baseFragments, ...knowledgeFragments];

  const compressed = compressPromptFragments(rawFragments);
  const baseIds = new Set(baseFragments.map(item => item.id));
  const knowledgeIds = new Set(knowledgeFragments.map(item => item.id));

  const compressedBaseFragments = compressed.fragments.filter(item =>
    baseIds.has(item.id)
  );
  const compressedKnowledgeFragments = compressed.fragments.filter(item =>
    knowledgeIds.has(item.id)
  );

  const renderedBaseSections = compressedBaseFragments.map(
    item => `[${item.section}]\n${item.text}`
  );

  if (compressedKnowledgeFragments.length > 0) {
    renderedBaseSections.push(
      `[CAUSAL REALISM CONSTRAINTS]\n${compressedKnowledgeFragments
        .map(item => item.text)
        .join('\n')}`
    );
  }

  const text = [
    'Generate a realistic photograph. Follow these constraints:',
    ...renderedBaseSections,
  ].join('\n\n');

  return {
    text,
    fragments: compressed.fragments,
    knowledgeFragments: compressedKnowledgeFragments,
    compression: compressed.stats,
  };
}
