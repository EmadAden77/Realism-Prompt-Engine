import assert from 'node:assert/strict';
import { deriveSurfaceRealism } from './surfaceRealism';
import type { LightingCausalityState } from './lightingCausality';

const baseLighting: LightingCausalityState = {
  primarySource: {
    name: 'window daylight',
    role: 'primary',
    direction: 'lateral',
    distanceBehavior: 'room-scale',
    contribution: 'main exposure',
    physicalOrigin: 'real window'
  },
  secondarySources: [],
  bounceSurfaces: ['wall'],
  sourceSummary: ['window daylight'],
  shadowBehavior: 'directional shadows',
  falloffBehavior: 'moderate falloff',
  inverseSquareBehavior: 'local sources only',
  exposureBehavior: 'natural exposure',
  contrastBehavior: 'natural contrast',
  consistencyGuards: []
};

{
  const result = deriveSurfaceRealism({
    familyId: 'bedroom',
    isOutdoor: false,
    timeOfDay: 'morning',
    captureType: 'front-selfie',
    glassesMode: 'no_glasses',
    clothingCondition: 'worn-all-day',
    atmosphericCondition: 'neutral',
    lighting: baseLighting
  });

  assert.equal(result.score, 100);
  assert.match(result.skinResponse, /microtexture/);
  assert.match(result.fabricResponse, /compression creases/);
  assert.equal(result.issues.length, 0);
}

{
  const result = deriveSurfaceRealism({
    familyId: 'car',
    isOutdoor: false,
    timeOfDay: 'night',
    captureType: 'front-selfie',
    glassesMode: 'wear_glasses',
    clothingCondition: 'crisp',
    atmosphericCondition: 'neutral',
    lighting: {
      ...baseLighting,
      primarySource: {
        ...baseLighting.primarySource,
        name: 'smartphone display glow'
      },
      secondarySources: [{
        name: 'impossible room fill',
        role: 'secondary',
        direction: 'frontal',
        distanceBehavior: 'room-scale',
        contribution: 'fills everything',
        physicalOrigin: 'none'
      }]
    }
  });

  assert.equal(result.score, 76);
  assert.equal(result.issues[0]?.severity, 'contradiction');
  assert.ok(result.reflectionRules.some(rule => rule.includes('automotive glass')));
  assert.ok(result.reflectionRules.some(rule => rule.includes('eyeglass')));
}

{
  const result = deriveSurfaceRealism({
    familyId: 'car',
    isOutdoor: true,
    timeOfDay: 'night',
    captureType: 'front-selfie',
    glassesMode: 'no_glasses',
    clothingCondition: 'crisp',
    atmosphericCondition: 'dusty-haze',
    lighting: baseLighting
  });

  assert.equal(result.score, 70);
  assert.match(result.issues[0]?.message ?? '', /night outdoor scene/);
  assert.ok(result.environmentalSurfaceResponse.some(rule => rule.includes('dust')));
}

console.log('surfaceRealism tests passed');

{
  const result = deriveSurfaceRealism({
    familyId: 'bedroom',
    isOutdoor: false,
    timeOfDay: 'morning',
    captureType: 'front-selfie',
    glassesMode: 'no_glasses',
    clothingCondition: 'crisp',
    atmosphericCondition: 'neutral',
    lighting: baseLighting,
  });
  assert(result.consistencyGuards.some(rule => rule.includes('subsurface color response')));
  assert(result.consistencyGuards.some(rule => rule.includes('automotive glass')));
}

{
  const midday = deriveSurfaceRealism({
    familyId: 'saudi-outdoor', isOutdoor: true, timeOfDay: 'midday',
    captureType: 'front-selfie', glassesMode: 'no_glasses',
    clothingCondition: 'crisp', atmosphericCondition: 'neutral', lighting: { ...baseLighting, primarySource: { ...baseLighting.primarySource, name: 'midday sun' } }
  });
  assert.ok(midday.consistencyGuards.some(text => text.includes('localized skin flush')));
  const neutral = deriveSurfaceRealism({
    familyId: 'bedroom', isOutdoor: false, timeOfDay: 'night',
    captureType: 'front-selfie', glassesMode: 'no_glasses',
    clothingCondition: 'crisp', atmosphericCondition: 'neutral', lighting: baseLighting
  });
  assert.ok(neutral.consistencyGuards.some(text => text.includes('no mandatory heat flush')));
}

{
  const shade = deriveSurfaceRealism({
    familyId: 'saudi-outdoor', isOutdoor: true, timeOfDay: 'midday',
    captureType: 'front-selfie', glassesMode: 'no_glasses',
    clothingCondition: 'crisp', atmosphericCondition: 'neutral', lighting: baseLighting
  });
  assert.ok(shade.consistencyGuards.some(text => text.includes('no mandatory heat flush')));
}
