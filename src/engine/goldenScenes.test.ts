import assert from 'node:assert/strict';
import { createSceneManifest } from './causalPipeline';
import { GOLDEN_SCENES } from './goldenScenes';

const containsCI = (value: string, needle: string) =>
  value.toLowerCase().includes(needle.toLowerCase());

const sceneIds = new Set<string>();

for (const golden of GOLDEN_SCENES) {
  const manifest = createSceneManifest(golden.state, 'neutral');
  const resolved = manifest.resolved;
  const physical = resolved.physicalState;
  const activeRules = manifest.knowledgeDecisions
    .filter(rule => rule.active)
    .map(rule => rule.id);

  assert(
    resolved.validation.isValid,
    golden.label + ': resolved scene must remain physically valid'
  );
  assert.equal(
    physical.framingClass,
    golden.expected.framingClass,
    golden.label + ': framing class changed unexpectedly'
  );
  assert(
    physical.visibleEnvironment.trim().length > 0,
    golden.label + ': visible environment must never be empty'
  );
  assert(
    physical.lightSources.length > 0,
    golden.label + ': at least one causal light source is required'
  );

  if (golden.expected.continuityProfile) {
    assert(
      manifest.continuityContext,
      golden.label + ': expected fixed-home continuity context'
    );
    assert.equal(
      manifest.continuityContext?.visibilityProfile,
      golden.expected.continuityProfile,
      golden.label + ': fixed-home visibility profile drifted'
    );
  } else {
    assert.equal(
      manifest.continuityContext,
      null,
      golden.label + ': non-home scene inherited fixed-home continuity'
    );
  }

  for (const required of golden.expected.environmentIncludes || []) {
    assert(
      containsCI(physical.visibleEnvironment, required),
      golden.label + ': missing expected visible environment anchor "' + required + '"'
    );
  }

  for (const forbidden of golden.expected.environmentExcludes || []) {
    assert(
      !containsCI(physical.visibleEnvironment, forbidden),
      golden.label + ': forbidden environment detail leaked: "' + forbidden + '"'
    );
  }

  for (const ruleId of golden.expected.activeRules || []) {
    assert(
      activeRules.includes(ruleId),
      golden.label + ': expected active rule ' + ruleId
    );
  }

  if (golden.expected.minReflections !== undefined) {
    assert(
      physical.reflectionState.length >= golden.expected.minReflections,
      golden.label + ': reflection topology regressed'
    );
  }

  if (golden.expected.motionIncludes) {
    assert(
      containsCI(physical.motionBehavior, golden.expected.motionIncludes),
      golden.label + ': expected low-light motion behavior is missing'
    );
  }

  const chatgptManifest = createSceneManifest(golden.state, 'chatgpt');
  assert.deepEqual(
    chatgptManifest.resolved.physicalState,
    manifest.resolved.physicalState,
    golden.label + ': platform target must not mutate physics'
  );
  assert.deepEqual(
    chatgptManifest.knowledgeDecisions,
    manifest.knowledgeDecisions,
    golden.label + ': platform target must not mutate domain knowledge'
  );

  assert(!sceneIds.has(manifest.sceneId), golden.label + ': duplicate golden sceneId');
  sceneIds.add(manifest.sceneId);
}

assert.equal(GOLDEN_SCENES.length, 10);
assert.equal(sceneIds.size, 10);

console.log('goldenScenes tests passed (' + GOLDEN_SCENES.length + ' canonical scenes)');
