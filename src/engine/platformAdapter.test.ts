import assert from 'node:assert/strict';
import {
  buildPlatformAdapterPlan,
  getPlatformCapability,
} from './platformAdapter';
import { resolveReferencePlan } from './referenceRouter';

const withRef = resolveReferencePlan({ referenceImageId: 'face.jpg' });
const noRef = resolveReferencePlan({ referenceImageId: null });
const neutral = 'Generate a realistic photograph.';

const chatRef = buildPlatformAdapterPlan(neutral, 'chatgpt', withRef);
assert.equal(chatRef.recommendedModel, 'gpt-image-2.5-sunburst');
assert.equal(chatRef.referenceWorkflow, 'openai_image_input');
assert.equal(chatRef.requiresReferenceAttachment, true);
assert.match(chatRef.prompt, /attached image input only to preserve/i);
assert.doesNotMatch(chatRef.prompt, /--v/);

const chatNoRef = buildPlatformAdapterPlan(neutral, 'chatgpt', noRef);
assert.equal(chatNoRef.recommendedModel, 'gpt-image-2.5-flare');
assert.equal(chatNoRef.referenceWorkflow, 'none');
assert.equal(chatNoRef.prompt, neutral);

const gemini = buildPlatformAdapterPlan(neutral, 'gemini', withRef);
assert.equal(gemini.recommendedModel, 'gemini-nano-banana-2.1');
assert.equal(gemini.referenceWorkflow, 'gemini_multimodal_image_input');
assert.equal(gemini.referenceLimit, 14);
assert.equal(gemini.characterReferenceLimit, 4);
assert.match(gemini.prompt, /provided image input only to preserve/i);

const midjourney = buildPlatformAdapterPlan(neutral, 'midjourney', withRef);
assert.equal(midjourney.version, '8.2');
assert.equal(midjourney.referenceWorkflow, 'midjourney_edit_model');
assert.equal(midjourney.referenceLimit, 4);
assert.deepEqual(midjourney.parameters, ['--v 8.2', '--raw']);
assert.match(midjourney.prompt, /Edit Model reference/i);
assert.match(midjourney.prompt, /--v 8\.2 --raw$/);
assert.doesNotMatch(midjourney.prompt, /--oref|--cref/i);

const midjourneyNoRef = buildPlatformAdapterPlan(neutral, 'midjourney', noRef);
assert.equal(midjourneyNoRef.referenceWorkflow, 'none');
assert.doesNotMatch(midjourneyNoRef.prompt, /Edit Model reference/i);
assert.match(midjourneyNoRef.prompt, /--v 8\.2 --raw$/);

assert.equal(getPlatformCapability('chatgpt').verifiedAt, '2026-10-08');
assert.equal(getPlatformCapability('gemini').verifiedAt, '2026-10-08');
assert.equal(getPlatformCapability('midjourney').verifiedAt, '2026-10-08');

console.log('platformAdapter tests passed');
