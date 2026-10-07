import assert from 'node:assert/strict';
import {
  compileBasePromptFragments,
  compileKnowledgeFragments,
  compileNeutralPrompt,
  type SemanticPromptScene,
} from './promptCompiler';
import {
  compressNegativePromptText,
  compressPromptFragments,
} from './promptCompression';
import type { KnowledgeRuleDecision } from './v20KnowledgeBase';

const semantic: SemanticPromptScene = {
  identity: 'Preserve exact facial identity, natural asymmetry, hairline, beard pattern, and skin texture.',
  body: '193cm, 83kg, tall lean-athletic male build.',
  glasses: 'not wearing glasses',
  captureMechanics:
    'Smartphone front-camera capture. Camera profile: approx 21mm equivalent. Framing: chest-up. Handheld mechanics: one arm extended holding smartphone off-camera. Capturing phone is NOT visible in frame.',
  hair: 'natural side-parted hair with original density and hairline',
  expression: 'neutral resting expression',
  outfit: 'burgundy shirt and grey trousers',
  outfitPhysics: 'natural gravity folds, restrained seam tension, subtle fabric pilling',
  poseAndContact:
    'standing naturally with grounded feet and believable shoulder-elbow-wrist alignment',
  visibleEnvironment:
    'Location: ordinary Saudi residential street. Physically visible scene: asphalt, villa wall, parked everyday car. User controls remain subject to physical FOV limits. Authentic everyday Saudi life, strictly NO iconic landmarks or tourist stereotypes.',
  lighting:
    'Time: night. Lighting source: warm practical street light. Highlights, shadows, reflections, and falloff follow visible sources.',
  atmosphere: 'clear ordinary night air',
  skinResponse: 'natural pores, vellus hair, subtle uneven microtexture',
  cameraRealism:
    'Style: Absolute raw hyper-realism. Unedited, unfiltered mobile capture. clean standard smartphone lens capture without excessive professional sharpness. Designed to mimic raw physical photography perfectly.',
  styleConstraints:
    'physically plausible shadows. no invisible fill light. correct contact shadows and occlusion. no floating objects.',
};

const rule = (
  id: string,
  priority: number,
  visibleConsequence: string
): KnowledgeRuleDecision => ({
  id,
  source: 'V20_DISTILLED',
  scope: ['test'],
  priority,
  effectPolicy: 'required',
  causalTrigger: true,
  visible: true,
  relevant: true,
  active: true,
  activationReason: 'emit',
  reason: 'test causal reason',
  visibleConsequence,
});

const decisions: KnowledgeRuleDecision[] = [
  rule(
    'V20_LIGHT_SOURCE_CAUSALITY',
    88,
    'Every visible highlight, shadow, reflection, color spill, and brightness falloff must be attributable to an actual scene light source; do not invent invisible fill lights.'
  ),
  rule(
    'V20_DEPTH_PARALLAX',
    74,
    'Preserve believable near-to-far scale, overlap, and parallax: the selfie arm and subject occupy the near plane while vehicles, poles, walls, and buildings remain progressively farther away without collapsing into one flat depth.'
  ),
  rule(
    'V20_CONTACT_OCCLUSION',
    82,
    'Preserve contact shadows, body-object overlap, and physically correct occlusion ordering at every visible contact point; no floating hands, objects, or impossible intersections.'
  ),
  rule(
    'V20_REFLECTION_CAUSALITY',
    70,
    'Keep reflections limited to visible reflective surfaces and actual light or scene content; reflection strength, blur, and distortion must follow the surface rather than appearing as decorative glow.'
  ),
];

const rawFragments = [
  ...compileBasePromptFragments(semantic),
  ...compileKnowledgeFragments(decisions),
];
const compressedDirect = compressPromptFragments(rawFragments);

assert.equal(compressedDirect.fragments.length, rawFragments.length);
assert.deepEqual(
  compressedDirect.fragments.map(item => item.id),
  rawFragments.map(item => item.id),
  'Compression must preserve every fragment ID and order'
);

for (let i = 0; i < rawFragments.length; i += 1) {
  assert.deepEqual(
    compressedDirect.fragments[i].provenance,
    rawFragments[i].provenance,
    rawFragments[i].id + ': provenance changed during compression'
  );
}

assert(compressedDirect.stats.savedChars > 0);
assert(
  compressedDirect.stats.reductionRatio > 0.08,
  'Representative prompt fragments should achieve a measurable safe reduction'
);
assert(
  compressedDirect.stats.transformedFragmentIds.includes(
    'knowledge:V20_LIGHT_SOURCE_CAUSALITY'
  )
);
assert(
  compressedDirect.stats.transformedFragmentIds.includes(
    'knowledge:V20_DEPTH_PARALLAX'
  )
);

const compiled = compileNeutralPrompt(semantic, decisions);
assert.equal(compiled.fragments.length, rawFragments.length);
assert(compiled.compression.savedChars > 0);
assert.equal(
  compiled.compression.compressedChars,
  compressedDirect.stats.compressedChars
);

assert.match(compiled.text, /actual scene light/i);
assert.match(compiled.text, /near-to-far scale/i);
assert.match(compiled.text, /correct occlusion order/i);
assert.match(compiled.text, /visible reflective surfaces/i);
assert.match(compiled.text, /exact facial identity/i);
assert.match(compiled.text, /21mm equivalent/i);
assert.match(compiled.text, /burgundy shirt/i);
assert.match(compiled.text, /ordinary Saudi residential street/i);
assert.doesNotMatch(
  compiled.text,
  /Designed to mimic raw physical photography perfectly/i,
  'Redundant camera boilerplate should be removed'
);
assert.doesNotMatch(
  compiled.text,
  /User controls remain subject to physical FOV limits/i,
  'Verbose FOV boilerplate should be compacted'
);
assert.match(compiled.text, /Background controls obey physical FOV limits/i);


const dynamicHomeRule = rule(
  'V20_FIXED_HOME_CONTINUITY',
  90,
  'Fixed-home continuity key: home/bedroom. Current visibility profile: bed-zone. Visible home facts are already compiled in the environment description; do not duplicate them as extra furniture. All hidden fixed-home anchors remain internally locked and must not be pulled into frame merely to prove continuity. Allowed to vary: lighting state; subject pose and activity; camera angle and framing; bed-linen compression caused by current body contact.'
);
const homeCompressed = compressPromptFragments(
  compileKnowledgeFragments([dynamicHomeRule])
);
assert.match(
  homeCompressed.fragments[0].text,
  /Allowed to vary: lighting state; subject pose and activity; camera angle and framing/i,
  'Dynamic fixed-home mutable properties must survive compression'
);
assert.match(
  homeCompressed.fragments[0].text,
  /bed-zone/i,
  'Dynamic fixed-home visibility profile must survive compression'
);

const repeated = compileNeutralPrompt(semantic, decisions);
assert.deepEqual(repeated, compiled, 'Compression must be deterministic');

const negativeSource =
  'plastic skin, CGI appearance, floating objects. plastic skin, waxy skin, floating camera. floating camera, impossible selfie arm length.';
const negative = compressNegativePromptText(negativeSource);

assert(negative.stats.savedChars > 0);
assert.equal(
  (negative.text.match(/plastic skin/gi) || []).length,
  1,
  'Exact negative clause should be emitted once'
);
assert.equal(
  (negative.text.match(/floating camera/gi) || []).length,
  1,
  'Repeated negative camera clause should be emitted once'
);
assert.match(negative.text, /CGI appearance/i);
assert.match(negative.text, /waxy skin/i);
assert.match(negative.text, /impossible selfie arm length/i);

const noDuplicate = compressNegativePromptText(
  'identity drift, altered face. floating camera, impossible arm.'
);
assert.equal(noDuplicate.stats.savedChars, 0);
assert.equal(
  noDuplicate.text,
  'identity drift, altered face. floating camera, impossible arm.'
);

console.log('promptCompression tests passed');
