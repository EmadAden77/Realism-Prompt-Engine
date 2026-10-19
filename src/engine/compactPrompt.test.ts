import assert from 'node:assert/strict';
import { compileUnifiedPromptPipeline } from './unifiedPromptPipeline';
import { compileCompactPrompt, compileCompactNegativePrompt } from './compactPrompt';
import { resolveScene, validateScene, type SceneState } from './physicsEngine';
import { getStructuredPoseSuggestions } from './sceneAffordances';

const base: SceneState = {
  referenceImageId: 'reference-face.png',
  sceneFamily: 'car',
  subScene: 'بجانب السيارة والباب مغلق',
  activity: 'خلف المقود والسيارة متوقفة',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: 'جالس باسترخاء في المقعد',
  outfitId: 'navy_shirt_grey_trousers',
  hairStyle: 'h1',
  expression: 'e1',
  timeOfDay: 'midday',
  lightingMode: 'ضوء نهاري طبيعي',
  environmentRealism: 'طبيعية',
  realismStyle: 'anti-ai-raw',
  glassesMode: 'no_glasses',
  lightingIntensity: 55,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};
const outside = resolveScene(base);
assert.equal(outside.state.pose, 'واقف بجانب السيارة');
assert.equal(outside.state.activity, 'ينتظر بجانب السيارة');
assert.equal(validateScene(outside.state).issues.some(issue => issue.field === 'pose' || issue.field === 'activity'), false);
assert(getStructuredPoseSuggestions('car', base.subScene).every(item => item.stance !== 'sitting'));
const outsidePipeline = compileUnifiedPromptPipeline(base);
const short = compileCompactPrompt(outsidePipeline, 'gemini');
assert.match(short, /Outside beside the parked car/);
assert.match(short, /navy button-up shirt paired with grey trousers/);
assert.match(short, /No glasses/);
assert.match(short, /exact facial identity/);
assert.doesNotMatch(short, /Inside the vehicle cabin/);
assert(!/driver seat with seat-supported torso/.test(short));
assert(short.length < 1300, 'Short prompt should remain genuinely compact');
assert(short.length < outsidePipeline.platforms.gemini.prompt.length / 2, 'Compact view should reduce prompt length by at least half');
assert(compileCompactNegativePrompt(outsidePipeline).length < 240);
assert.equal(short, compileCompactPrompt(compileUnifiedPromptPipeline(base), 'gemini'));

const insideScene: SceneState = {
  ...base,
  subScene: 'مقعد السائق والسيارة متوقفة',
  pose: 'واقف بجانب السيارة',
  activity: 'واقف بجانب السيارة',
};
const inside = resolveScene(insideScene);
assert.equal(inside.state.pose, 'جالس في مقعد السائق');
assert.equal(inside.state.activity, 'ينتظر داخل السيارة');
assert(getStructuredPoseSuggestions('car', insideScene.subScene).every(item => item.stance === 'sitting' || item.stance === 'reclined'));
assert.equal(validateScene(inside.state).issues.some(issue => issue.field === 'pose' || issue.field === 'activity'), false);
const insidePipeline = compileUnifiedPromptPipeline(insideScene);
const insideShort = compileCompactPrompt(insidePipeline, 'chatgpt');
assert.match(insideShort, /Inside the vehicle cabin/);
assert.doesNotMatch(insideShort, /Outside beside the parked car/);
assert(insideShort.length < 1300);
assert.match(compileCompactPrompt(insidePipeline, 'midjourney'), /--v 8\.2 --raw$/);

const noRef = compileUnifiedPromptPipeline({ ...base, referenceImageId: null });
assert.doesNotMatch(compileCompactPrompt(noRef, 'gemini'), /provided reference image/);
assert.equal(compileCompactPrompt(insidePipeline, 'gemini').length > 0, true);

console.log('compactPrompt and car topology tests passed');
