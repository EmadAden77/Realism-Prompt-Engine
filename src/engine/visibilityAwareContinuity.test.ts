import assert from 'node:assert/strict';
import { createSceneManifest } from './causalPipeline';
import { compileKnowledgeFragments } from './promptCompiler';
import type { SceneState } from './physicsEngine';

const baseBedroom: SceneState = {
  referenceImageId: 'ref.jpg',
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  activity: 'جالس',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'جالس على حافة السرير',
  outfitId: 'burgundy_shirt_grey_trousers',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'night',
  lightingMode: 'إضاءة أباجورة دافئة',
  environmentRealism: 'طبيعية',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'match_reference',
  lightingIntensity: 35,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const bed = createSceneManifest(baseBedroom, 'neutral');
assert.equal(bed.continuityContext?.visibilityProfile, 'bed-zone');
assert(
  bed.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('180 cm master bed'))
);
assert(
  bed.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('bedside lamp'))
);
assert(
  !bed.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('sliding-door wardrobe')),
  'Bed-zone prompt must not pull an off-frame wardrobe into view'
);
assert(
  bed.continuityContext?.permanentAnchors.some(anchor => anchor.includes('sliding-door wardrobe')),
  'Wardrobe must remain locked internally even when omitted from prompt'
);
assert((bed.continuityContext?.hiddenPermanentAnchorCount || 0) > 0);

const bedRule = bed.knowledgeDecisions.find(rule => rule.id === 'V20_FIXED_HOME_CONTINUITY');
assert.match(bedRule?.visibleConsequence || '', /already compiled in the environment description/i);
assert.doesNotMatch(bedRule?.visibleConsequence || '', /180 cm master bed/);
assert.doesNotMatch(bedRule?.visibleConsequence || '', /sliding-door wardrobe/);
assert.match(bedRule?.visibleConsequence || '', /remain internally locked/i);
assert.match(bed.resolved.physicalState.visibleEnvironment, /180 cm master bed/);
assert.doesNotMatch(bed.resolved.physicalState.visibleEnvironment, /sliding-door wardrobe/);

const wardrobe = createSceneManifest(
  {
    ...baseBedroom,
    subScene: 'أمام الدولاب',
    pose: 'واقف بثبات',
  },
  'neutral'
);
assert.equal(wardrobe.continuityContext?.visibilityProfile, 'wardrobe-zone');
assert(
  wardrobe.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('sliding-door wardrobe'))
);
assert(
  !wardrobe.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('180 cm master bed')),
  'Wardrobe-zone prompt must not force the bed into frame'
);

const wideBedroom = createSceneManifest(
  {
    ...baseBedroom,
    subScene: 'وسط الغرفة',
    pose: 'واقف بثبات',
  },
  'neutral'
);
assert.equal(wideBedroom.continuityContext?.visibilityProfile, 'bedroom-wide-zone');
assert(
  wideBedroom.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('180 cm master bed'))
);
assert(
  wideBedroom.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('sliding-door wardrobe'))
);
assert(
  wideBedroom.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('blackout curtain'))
);

const livingTv = createSceneManifest(
  {
    ...baseBedroom,
    sceneFamily: 'living-room',
    subScene: 'أمام التلفاز',
    pose: 'واقف بثبات',
    lightingMode: 'إضاءة سقف',
  },
  'neutral'
);
assert.equal(livingTv.continuityContext?.visibilityProfile, 'living-tv-zone');
assert(
  livingTv.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('55-inch television'))
);
assert(
  !livingTv.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('white sheer curtain')),
  'TV-zone prompt must not introduce an unrelated curtain'
);

const livingWindow = createSceneManifest(
  {
    ...baseBedroom,
    sceneFamily: 'living-room',
    subScene: 'بجانب النافذة',
    pose: 'واقف بثبات',
    lightingMode: 'ضوء نهاري طبيعي',
    timeOfDay: 'morning',
  },
  'neutral'
);
assert.equal(livingWindow.continuityContext?.visibilityProfile, 'living-window-zone');
assert(
  livingWindow.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('white sheer curtain'))
);
assert(
  !livingWindow.continuityContext?.visiblePermanentAnchors.some(anchor => anchor.includes('55-inch television')),
  'Window-zone prompt must not drag the TV into view'
);

const changedLighting = createSceneManifest(
  {
    ...baseBedroom,
    lightingMode: 'إضاءة شاشة الهاتف فقط',
    lightingIntensity: 8,
  },
  'neutral'
);
assert.deepEqual(
  changedLighting.continuityContext?.visiblePermanentAnchors,
  bed.continuityContext?.visiblePermanentAnchors,
  'Lighting changes must not alter which fixed furniture belongs to the current visibility profile'
);

const fragments = compileKnowledgeFragments(bed.knowledgeDecisions);
const homeFragment = fragments.find(fragment =>
  fragment.provenance.ruleIds.includes('V20_FIXED_HOME_CONTINUITY')
);
assert(homeFragment);
assert.match(homeFragment?.text || '', /already compiled in the environment description/i);
assert.doesNotMatch(homeFragment?.text || '', /180 cm master bed/);
assert.doesNotMatch(homeFragment?.text || '', /sliding-door wardrobe/);

console.log('visibilityAwareContinuity tests passed');
