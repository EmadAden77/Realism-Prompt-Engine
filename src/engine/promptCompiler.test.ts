import assert from 'node:assert/strict';
import { compileNeutralPrompt } from './promptCompiler';
import type { KnowledgeRuleDecision } from './v20KnowledgeBase';

const semantic = {
  identity: 'preserve identity',
  body: 'tall lean-athletic build',
  glasses: 'match reference',
  captureMechanics: 'front selfie at realistic arm reach',
  hair: 'natural hair',
  expression: 'neutral expression',
  outfit: 'white thobe',
  outfitPhysics: 'natural cotton folds',
  poseAndContact: 'standing naturally',
  visibleEnvironment: 'ordinary Saudi residential street',
  lighting: 'practical street lighting',
  atmosphere: 'clear air',
  skinResponse: 'natural skin texture',
  cameraRealism: 'raw smartphone capture',
  styleConstraints: 'physically plausible shadows',
};

const activeRule: KnowledgeRuleDecision = {
  id: 'ACTIVE_RULE',
  source: 'V20_DISTILLED',
  scope: ['lighting'],
  priority: 80,
  effectPolicy: 'conditional',
  active: true,
  reason: 'A visible practical light causes the effect.',
  visibleConsequence: 'Keep the practical light response localized and physically causal.',
};

const inactiveRule: KnowledgeRuleDecision = {
  id: 'INACTIVE_RULE',
  source: 'V20_DISTILLED',
  scope: ['wet-ground'],
  priority: 90,
  effectPolicy: 'omit_by_default',
  active: false,
  reason: 'No wet-surface trigger exists.',
  visibleConsequence: 'Invent wet reflections everywhere.',
};

const compiled = compileNeutralPrompt(semantic, [inactiveRule, activeRule]);

assert.match(compiled.text, /\[CAUSAL REALISM CONSTRAINTS\]/);
assert.match(compiled.text, /Keep the practical light response localized/);
assert.doesNotMatch(compiled.text, /Invent wet reflections everywhere/);
assert.equal(compiled.knowledgeFragments.length, 1);
assert.deepEqual(compiled.knowledgeFragments[0].provenance.ruleIds, ['ACTIVE_RULE']);
assert.deepEqual(compiled.knowledgeFragments[0].provenance.sceneFacts, [
  'A visible practical light causes the effect.',
]);

const noRules = compileNeutralPrompt(semantic, []);
assert.doesNotMatch(noRules.text, /CAUSAL REALISM CONSTRAINTS/);
assert.equal(noRules.knowledgeFragments.length, 0);

console.log('promptCompiler tests passed');
