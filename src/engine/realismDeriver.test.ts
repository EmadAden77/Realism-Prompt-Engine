import assert from 'node:assert/strict';
import {
  deriveRealismState,
  type RealismDerivationState,
} from './realismDeriver';

const base: RealismDerivationState = {
  sceneFamily: 'saudi-outdoor',
  subScene: 'شارع فلل سكني',
  activity: 'واقف بشكل طبيعي',
  captureType: 'front-selfie',
  framing: 'chest-up',
  pose: 'واقف بثبات',
  timeOfDay: 'night',
  lightingMode: 'إنارة شارع دافئة',
  environmentRealism: 'طبيعي',
  realismStyle: 'anti-ai-raw',
  lightingIntensity: 55,
  shadowDepth: 60,
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
};

const neutral = deriveRealismState(base);
assert.match(neutral.cameraDistance, /40-60cm/);
assert(neutral.contactPhysics.some(rule => rule.includes('one arm clearly extended')));
assert(neutral.realismConstraints.some(rule => rule.includes('camera MUST NOT be floating freely')));
assert.match(neutral.lightingIntensityDescription, /55%/);
assert.match(neutral.shadowDepthDescription, /60%/);
assert.match(neutral.lensEffects, /clean standard smartphone lens capture/);
assert.match(neutral.lensEffects, /sensor grain/i, 'anti-ai raw should retain capture imperfections');

const repeat = deriveRealismState(base);
assert.deepEqual(repeat, neutral, 'Derivation must be deterministic');

const closeSelfie = deriveRealismState({ ...base, framing: 'head-shoulders' });
assert.match(closeSelfie.cameraDistance, /40cm/);
assert(closeSelfie.visibleBackgroundElements.length <= 2);

const halfBody = deriveRealismState({ ...base, framing: 'half-body' });
assert.match(halfBody.cameraDistance, /65cm/);

const mirror = deriveRealismState({
  ...base,
  sceneFamily: 'bedroom',
  subScene: 'أمام المرآة',
  captureType: 'mirror-selfie',
  framing: 'half-body',
});
assert(mirror.reflectionRules.some(rule => rule.includes('geometrically accurate mirror reflection')));
assert(mirror.reflectionRules.some(rule => rule.includes('smartphone clearly visible')));

const candid = deriveRealismState({
  ...base,
  captureType: 'third-person-candid',
});
assert.match(candid.cameraDistance, /1\.5 - 3 meters/);
assert(candid.realismConstraints.some(rule => rule.includes('candid framing without selfie-arm mechanics')));

const phoneLight = deriveRealismState({
  ...base,
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  lightingMode: 'إضاءة شاشة الهاتف فقط',
  lightingIntensity: 12,
  shadowDepth: 82,
});
assert.match(phoneLight.environmentalLightBehavior, /stark rapid light falloff/i);
assert(phoneLight.realismConstraints.includes('NO ceiling lights'));
assert(phoneLight.realismConstraints.includes('NO impossible room-wide ambient illumination from phone'));
assert.match(phoneLight.skinResponse, /low-light noise/i);

const bedContact = deriveRealismState({
  ...base,
  sceneFamily: 'bedroom',
  subScene: 'بجانب السرير',
  pose: 'جالس على حافة السرير',
});
assert(bedContact.contactPhysics.some(rule => rule.includes('pelvis supported by mattress')));
assert(bedContact.contactPhysics.some(rule => rule.includes('localized mattress compression')));

const dusty = deriveRealismState({
  ...base,
  atmosphericCondition: 'dusty-haze',
});
assert.match(dusty.atmosphericEffects, /Airborne desert dust haze/i);
assert.match(dusty.environmentalLightBehavior, /dust haze/i);
assert.equal(
  dusty.cameraDistance,
  neutral.cameraDistance,
  'Atmosphere must not mutate camera distance'
);

const breezy = deriveRealismState({
  ...base,
  atmosphericCondition: 'breezy',
});
assert.match(breezy.hairCondition, /fluttering naturally with wind movement/i);
assert(breezy.fabricBehavior.some(rule => rule.includes('wind turbulence')));

const smudged = deriveRealismState({
  ...base,
  lensCondition: 'smudged-lens',
});
assert.match(smudged.lensEffects, /oily finger smudge/i);
assert.deepEqual(
  smudged.contactPhysics,
  neutral.contactPhysics,
  'Lens condition must not change anatomy/contact physics'
);
assert.equal(
  smudged.cameraDistance,
  neutral.cameraDistance,
  'Lens condition must not change camera distance'
);

const worn = deriveRealismState({
  ...base,
  clothingCondition: 'worn-all-day',
});
assert(worn.fabricBehavior.some(rule => rule.includes('worn all day')));
assert(worn.fabricBehavior.some(rule => rule.includes('localized wrinkles')));

const fatigued = deriveRealismState({
  ...base,
  muscleFatigue: 'heavy-eyelids',
});
assert.match(fatigued.muscleFatigueEffects, /Heavy eyelid fatigue/i);
assert.match(fatigued.skinResponse, /drooping heavy eyelids/i);
assert(fatigued.realismConstraints.some(rule => rule.includes('NO wide-eyed alert artificial gaze')));

const throughGlass = deriveRealismState({
  ...base,
  foregroundObstruction: 'through-glass',
});
assert(throughGlass.visibleBackgroundElements.some(item => item.includes('window glass reflection')));
assert(throughGlass.realismConstraints.includes('subject is seen THROUGH a pane of glass'));

const styleOnly = deriveRealismState({
  ...base,
  realismStyle: 'raw-candid',
});
assert.doesNotMatch(styleOnly.lensEffects, /ISO 800/i);
assert.equal(
  styleOnly.cameraDistance,
  neutral.cameraDistance,
  'Realism style must not change camera geometry'
);

console.log('realismDeriver tests passed');
