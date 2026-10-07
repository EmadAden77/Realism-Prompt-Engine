import assert from 'node:assert/strict';
import {
  createSceneManifest,
  decideEffectActivation,
  resolveRuleConflict,
  type RuleCandidate,
} from './causalPipeline';
import { adaptPromptToPlatform, PLATFORM_CAPABILITY_REGISTRY } from './platformAdapter';
import type { SceneState } from './physicsEngine';

const baseState: SceneState = {
  referenceImageId: 'ref.jpg',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'واقف بشكل طبيعي',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف بثبات',
  outfitId: 'thobe1',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إنارة شارع دافئة',
  environmentRealism: 'عادية وطبيعية',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 55,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const manifest = createSceneManifest(baseState, 'neutral');
assert.equal(manifest.schemaVersion, '1.0');
assert.equal(manifest.platformTarget, 'neutral');
assert.equal(manifest.resolved.state.sceneFamily, 'saudi-outdoor');
assert.ok(manifest.sceneId.includes('saudi-outdoor'));
assert.equal(manifest.referencePlan.hasReference, true);
assert.equal(manifest.referencePlan.routes[0]?.intent, 'identity_or_object_preservation');

assert.deepEqual(
  decideEffectActivation({
    policy: 'required',
    causalTrigger: false,
    visible: true,
    relevant: true,
  }),
  { emit: false, reason: 'no-causal-trigger' }
);

assert.deepEqual(
  decideEffectActivation({
    policy: 'required',
    causalTrigger: true,
    visible: false,
    relevant: true,
  }),
  { emit: false, reason: 'not-visible' }
);

assert.deepEqual(
  decideEffectActivation({
    policy: 'required',
    causalTrigger: true,
    visible: true,
    relevant: true,
  }),
  { emit: true, reason: 'emit' }
);

const broad: RuleCandidate = { id: 'NIGHT_GENERIC', priority: 50, scope: ['night'] };
const narrow: RuleCandidate = {
  id: 'BEDROOM_LAMP',
  priority: 50,
  scope: ['night', 'bedroom', 'bedside-lamp'],
};
const specificity = resolveRuleConflict(broad, narrow);
assert.equal(specificity.status, 'winner');
if (specificity.status === 'winner') {
  assert.equal(specificity.winner.id, 'BEDROOM_LAMP');
  assert.equal(specificity.reason, 'specificity');
}

const ambiguous = resolveRuleConflict(
  { id: 'A', priority: 10, scope: ['night'] },
  { id: 'B', priority: 10, scope: ['outdoor'] }
);
assert.equal(ambiguous.status, 'ambiguous');

const neutral = 'Generate a realistic photograph.';
assert.match(adaptPromptToPlatform(neutral, 'chatgpt'), /attached reference photo/);
assert.match(adaptPromptToPlatform(neutral, 'gemini'), /sole identity reference/);
assert.equal(PLATFORM_CAPABILITY_REGISTRY.chatgpt.defaultModel, 'gpt-image-2.5-flare');
assert.equal(PLATFORM_CAPABILITY_REGISTRY.gemini.defaultModel, 'gemini-nano-banana-2.1');
assert.equal(PLATFORM_CAPABILITY_REGISTRY.midjourney.defaultVersion, '8.2');
assert.match(adaptPromptToPlatform(neutral, 'midjourney'), /--v 8\.2 --raw$/);

console.log('causalPipeline tests passed');
