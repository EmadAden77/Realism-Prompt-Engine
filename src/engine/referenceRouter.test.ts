import assert from 'node:assert/strict';
import { createSceneManifest } from './causalPipeline';
import { adaptPromptToPlatform } from './platformAdapter';
import {
  hasReferenceIntent,
  resolveReferencePlan,
  type ReferenceIntent,
} from './referenceRouter';
import type { SceneState } from './physicsEngine';

const base: SceneState = {
  referenceImageId: 'face-reference.jpg',
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'واقف بشكل طبيعي',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'واقف بثبات',
  outfitId: 'burgundy_shirt_grey_trousers',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إنارة شارع دافئة',
  environmentRealism: 'طبيعي',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 50,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const defaultPlan = resolveReferencePlan(base);
assert.equal(defaultPlan.hasReference, true);
assert.equal(defaultPlan.mode, 'single-reference');
assert.equal(defaultPlan.sourceCount, 1);
assert.equal(defaultPlan.primaryReferenceId, 'face-reference.jpg');
assert.equal(defaultPlan.routes.length, 1);
assert.equal(defaultPlan.routes[0].intent, 'identity_or_object_preservation');
assert.equal(defaultPlan.routes[0].requiredCapability, 'identity_or_object_reference');
assert.equal(defaultPlan.routes[0].role, 'primary_identity');
assert.equal(hasReferenceIntent(defaultPlan, 'identity_or_object_preservation'), true);
assert.equal(hasReferenceIntent(defaultPlan, 'composition_guidance'), false);
assert.equal(hasReferenceIntent(defaultPlan, 'visual_style_guidance'), false);

const noReferencePlan = resolveReferencePlan({ referenceImageId: null });
assert.equal(noReferencePlan.hasReference, false);
assert.equal(noReferencePlan.mode, 'none');
assert.equal(noReferencePlan.routes.length, 0);

const explicitIntents: ReferenceIntent[] = [
  'identity_or_object_preservation',
  'composition_guidance',
  'visual_style_guidance',
  'composition_guidance',
];
const multiIntent = resolveReferencePlan(base, explicitIntents);
assert.equal(multiIntent.routes.length, 3, 'Duplicate intents must be removed');
assert.equal(hasReferenceIntent(multiIntent, 'composition_guidance'), true);
assert.equal(hasReferenceIntent(multiIntent, 'visual_style_guidance'), true);

const neutralPrompt = 'Generate a realistic photograph.';
const chatgptIdentity = adaptPromptToPlatform(neutralPrompt, 'chatgpt', defaultPlan);
assert.match(chatgptIdentity, /attached reference image only to preserve/i);
assert.match(chatgptIdentity, /Do not copy the reference image composition/i);
assert.doesNotMatch(chatgptIdentity, /composition guidance only where explicitly requested/i);

const geminiIdentity = adaptPromptToPlatform(neutralPrompt, 'gemini', defaultPlan);
assert.match(geminiIdentity, /provided reference image only to preserve/i);
assert.match(geminiIdentity, /Do not copy the reference image composition/i);

const noReferencePrompt = adaptPromptToPlatform(neutralPrompt, 'chatgpt', noReferencePlan);
assert.equal(noReferencePrompt, neutralPrompt);
assert.doesNotMatch(noReferencePrompt, /attached reference/i);

const multiIntentPrompt = adaptPromptToPlatform(neutralPrompt, 'chatgpt', multiIntent);
assert.match(multiIntentPrompt, /composition guidance only where explicitly requested/i);
assert.match(multiIntentPrompt, /visual-style guidance only where explicitly requested/i);
assert.doesNotMatch(
  multiIntentPrompt,
  /Do not copy the reference image composition/,
  'Explicit composition/style intent must not receive the identity-only guard'
);

const withReference = createSceneManifest(base, 'neutral');
const withoutReference = createSceneManifest(
  { ...base, referenceImageId: null },
  'neutral'
);

assert.equal(withReference.referencePlan.hasReference, true);
assert.equal(withoutReference.referencePlan.hasReference, false);
assert.deepEqual(
  withReference.resolved.physicalState,
  withoutReference.resolved.physicalState,
  'Reference availability must not change camera/environment/light physics'
);
assert.deepEqual(
  withReference.knowledgeDecisions,
  withoutReference.knowledgeDecisions,
  'Reference availability must not change realism knowledge decisions'
);
assert.deepEqual(
  withReference.continuityContext,
  withoutReference.continuityContext,
  'Reference availability must not change fixed environment continuity'
);

const chatgptManifest = createSceneManifest(base, 'chatgpt');
const geminiManifest = createSceneManifest(base, 'gemini');
assert.deepEqual(
  chatgptManifest.referencePlan,
  geminiManifest.referencePlan,
  'Platform target must not mutate reference intent'
);

console.log('referenceRouter tests passed');
