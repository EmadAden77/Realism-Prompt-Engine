import assert from 'node:assert/strict';
import {
  compileBasePromptFragments,
  compileNeutralPrompt,
  diffPromptFragments,
  type SemanticPromptScene,
} from './promptCompiler';
import type { KnowledgeRuleDecision } from './v20KnowledgeBase';

const semantic: SemanticPromptScene = {
  identity: 'preserve exact identity',
  body: 'tall lean-athletic build',
  glasses: 'match reference',
  captureMechanics: 'front selfie at realistic arm reach',
  hair: 'natural hair',
  expression: 'neutral expression',
  outfit: 'burgundy shirt and grey trousers',
  outfitPhysics: 'natural fabric folds',
  poseAndContact: 'standing naturally with grounded contact',
  visibleEnvironment: 'ordinary Saudi residential street',
  lighting: 'warm practical street lighting',
  atmosphere: 'clear night air',
  skinResponse: 'natural skin texture',
  cameraRealism: 'raw smartphone capture',
  styleConstraints: 'physically plausible shadows and reflections',
};

const compiled = compileNeutralPrompt(semantic, []);
const ids = compiled.fragments.map(item => item.id);

assert.equal(new Set(ids).size, ids.length, 'Prompt fragment IDs must be unique');
assert(ids.includes('prompt:subject'));
assert(ids.includes('prompt:attire'));
assert(ids.includes('prompt:camera'));
assert(ids.includes('prompt:environment'));
assert(ids.includes('prompt:pose-contact'));
assert(ids.includes('prompt:physics'));

for (const fragment of compiled.fragments) {
  assert(fragment.provenance.sceneFacts.length > 0, fragment.id + ': missing scene-fact provenance');
  assert(fragment.provenance.ruleIds.length > 0, fragment.id + ': missing rule provenance');
}

assert.doesNotMatch(compiled.text, /semantic\./, 'Internal provenance keys must not leak into user prompt');
assert.doesNotMatch(compiled.text, /PROMPT_[A-Z_]+/, 'Internal rule IDs must not leak into user prompt');

const subject = compiled.fragments.find(item => item.id === 'prompt:subject')!;
assert.deepEqual(subject.provenance.ruleIds, ['PROMPT_SUBJECT_IDENTITY']);
assert(subject.provenance.sceneFacts.includes('semantic.identity'));
assert(subject.provenance.sceneFacts.includes('semantic.expression'));

const attireChanged = compileNeutralPrompt(
  {
    ...semantic,
    outfit: 'white thobe',
    outfitPhysics: 'soft cotton drape',
  },
  []
);
const attireDiff = diffPromptFragments(compiled.fragments, attireChanged.fragments);
assert.deepEqual(attireDiff.changedIds, ['prompt:attire']);
assert.equal(attireDiff.addedIds.length, 0);
assert.equal(attireDiff.removedIds.length, 0);

const cameraChanged = compileNeutralPrompt(
  {
    ...semantic,
    captureMechanics: 'mirror selfie with visible phone',
    cameraRealism: 'rear-camera mirror geometry',
  },
  []
);
const cameraDiff = diffPromptFragments(compiled.fragments, cameraChanged.fragments);
assert.deepEqual(cameraDiff.changedIds, ['prompt:camera']);

const environmentChanged = compileNeutralPrompt(
  {
    ...semantic,
    visibleEnvironment: 'same fixed master bedroom beside the bed',
    atmosphere: 'quiet indoor air',
    lighting: 'single warm bedside lamp',
  },
  []
);
const environmentDiff = diffPromptFragments(compiled.fragments, environmentChanged.fragments);
assert.deepEqual(environmentDiff.changedIds, ['prompt:environment']);

const groupChanged = compileNeutralPrompt(
  {
    ...semantic,
    groupSelfie: 'two distinct companions, no cloned identity',
  },
  []
);
const groupDiff = diffPromptFragments(compiled.fragments, groupChanged.fragments);
assert.deepEqual(groupDiff.addedIds, ['prompt:group-selfie']);
assert.equal(groupDiff.changedIds.length, 0);

const activeRule: KnowledgeRuleDecision = {
  id: 'TEST_CAUSAL_RULE',
  source: 'V20_DISTILLED',
  scope: ['lighting'],
  priority: 80,
  effectPolicy: 'conditional',
  causalTrigger: true,
  visible: true,
  relevant: true,
  active: true,
  activationReason: 'emit',
  reason: 'A practical source is visible.',
  visibleConsequence: 'Keep highlight direction tied to the practical source.',
};

const withKnowledge = compileNeutralPrompt(semantic, [activeRule]);
const knowledgeDiff = diffPromptFragments(compiled.fragments, withKnowledge.fragments);
assert.deepEqual(knowledgeDiff.addedIds, ['knowledge:TEST_CAUSAL_RULE']);
assert.match(withKnowledge.text, /Keep highlight direction tied to the practical source/);

const baseFragments = compileBasePromptFragments(semantic);
assert.equal(baseFragments.length, 6);
assert.equal(
  baseFragments.filter(item => item.section === 'ENVIRONMENT & ATMOSPHERE').length,
  1
);

console.log('promptProvenance tests passed');
