import { compileUnifiedPromptPipeline } from './unifiedPromptPipeline';
import assert from 'node:assert/strict';
import {
  createSceneManifest,
  deriveCausalHairExpression,
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
assert.equal(adaptPromptToPlatform(neutral, 'chatgpt'), neutral);
assert.equal(adaptPromptToPlatform(neutral, 'gemini'), neutral);
assert.equal(PLATFORM_CAPABILITY_REGISTRY.chatgpt.defaultModel, 'gpt-image-2.5-flare');
assert.equal(PLATFORM_CAPABILITY_REGISTRY.gemini.defaultModel, 'gemini-nano-banana-2.1');
assert.equal(PLATFORM_CAPABILITY_REGISTRY.midjourney.defaultVersion, '8.2');
assert.match(adaptPromptToPlatform(neutral, 'midjourney'), /--v 8\.2 --raw$/);

console.log('causalPipeline tests passed');

const causalNormal = deriveCausalHairExpression(baseState);
assert.ok(causalNormal.hair.some(text => text.includes('chosen hairstyle')));
assert.ok(!causalNormal.hair.some(text => text.includes('breeze')));
const causalBreeze = deriveCausalHairExpression({ ...baseState, atmosphericCondition: 'breezy' });
assert.ok(causalBreeze.hair.some(text => text.includes('breeze')));
const causalMirror = deriveCausalHairExpression({ ...baseState, captureType: 'mirror-selfie' });
assert.ok(causalMirror.hair.some(text => text.includes('planar mirror')));

const selectedFace = deriveCausalHairExpression({ ...baseState, expression: 'fx02' });
assert.ok(selectedFace.expression.some(rule => rule.includes('corrugator')));
const selectedHair = deriveCausalHairExpression({ ...baseState, hairPhysicsPreset: 'hp01' });
assert.ok(selectedHair.hair.some(rule => rule.includes('scalp')));
const endToEnd = compileUnifiedPromptPipeline({ ...baseState, atmosphericCondition: 'breezy', expression: 'fx02' });
assert.ok(endToEnd.neutral.text.includes('Loose exposed strands respond naturally to the breeze.'));
assert.ok(endToEnd.neutral.text.includes('corrugator'));

const rearLitHair = deriveCausalHairExpression({ ...baseState, lightingMode: 'backlit rim light 6500K' });
assert.ok(rearLitHair.hair.some(text => text.includes('Back-facing fine strands')));
const coolCeiling = deriveCausalHairExpression({ ...baseState, lightingMode: '6500K ceiling light' });
assert.ok(!coolCeiling.hair.some(text => text.includes('Back-facing fine strands')));
const harshSunEyes = deriveCausalHairExpression({ ...baseState, timeOfDay: 'midday', lightingMode: 'direct sunlight' });
assert.ok(harshSunEyes.expression.some(text => text.includes('eyelid response')));

const negatedRearLight = deriveCausalHairExpression({ ...baseState, lightingMode: 'no backlight, ambient ceiling light 6500K' });
assert.ok(!negatedRearLight.hair.some(text => text.includes('Back-facing fine strands')));
const negatedDirectSun = deriveCausalHairExpression({ ...baseState, timeOfDay: 'midday', lightingMode: 'without direct sunlight, open shade' });
assert.ok(!negatedDirectSun.expression.some(text => text.includes('eyelid response')));
const rearLightFinal = compileUnifiedPromptPipeline({ ...baseState, lightingMode: 'rear light behind head' });
assert.ok(rearLightFinal.neutral.text.includes('Back-facing fine strands'));

const frontalOnly = deriveCausalHairExpression({ ...baseState, lightingMode: 'front-only lighting, no rear light' });
assert.ok(!frontalOnly.hair.some(text => text.includes('Back-facing fine strands')));
const noBacklightFinal = compileUnifiedPromptPipeline({ ...baseState, lightingMode: 'no backlight, white ceiling 6500K' });
assert.ok(!noBacklightFinal.neutral.text.includes('Back-facing fine strands'));

const noRimFromTemperature = compileUnifiedPromptPipeline({ ...baseState, lightingMode: '6500K cool white ceiling light' });
assert.ok(!noRimFromTemperature.neutral.text.includes('Back-facing fine strands'));
const explicitBacklight = compileUnifiedPromptPipeline({ ...baseState, lightingMode: 'rear light behind head' });
assert.ok(explicitBacklight.neutral.text.includes('Back-facing fine strands'));
