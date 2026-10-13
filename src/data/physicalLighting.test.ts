import assert from 'node:assert/strict';
import type { SceneFamilyId } from './microLocations';
import {
  LIGHTING_CATALOG,
  compatiblePhysicalLighting,
  getPhysicalLightingOption,
  isPhysicalLightingCompatible,
  type LightingClock
} from './physicalLighting';
import { buildSmartSceneOptions } from '../engine/smartSceneOptions';
import { deriveLightingCausality } from '../engine/lightingCausality';

const families: SceneFamilyId[] = ['military-base', 'saudi-outdoor', 'car', 'living-room', 'bedroom', 'gym'];
const times: LightingClock[] = ['morning', 'midday', 'afternoon', 'sunset', 'night'];
let total = 0;

for (const family of families) {
  const options = LIGHTING_CATALOG[family];
  assert.equal(options.length, 10, `${family} must have ten distinct lighting modes`);
  assert.equal(new Set(options.map(p => p.labelAR)).size, 10, `${family} contains duplicate labels`);
  for (const option of options) {
    total++;
    assert.equal(getPhysicalLightingOption(family, option.labelAR), option);
    assert(option.detail.length > 45, 'Every lighting mode must describe its real source constraints');
    assert(!isPhysicalLightingCompatible(option, 'night', option.space === 'outdoor') || option.time !== 'day');
    assert(!isPhysicalLightingCompatible(option, 'midday', option.space === 'outdoor') || option.time !== 'night');
    for (const clock of times) {
      if (!isPhysicalLightingCompatible(option, clock, option.space === 'outdoor')) continue;
      const result = deriveLightingCausality({
        familyId: family,
        subScene: family === 'car' ? (option.space === 'outdoor' ? 'بجانب السيارة' : 'مقعد السائق والسيارة متوقفة')
          : family === 'saudi-outdoor' ? 'شارع فلل سكني' : 'منتصف المكان',
        timeOfDay: clock,
        lightingMode: option.labelAR,
        lightingIntensity: 65, shadowDepth: 55,
        isOutdoor: option.space === 'outdoor',
        cameraExposureBehavior: 'restrained smartphone exposure'
      });
      assert(result.primarySource.physicalOrigin.length > 25);
      assert(result.primarySource.direction.length > 25);
      assert(result.primarySource.distanceBehavior.length > 25);
      assert(result.shadowBehavior.length > 25);
      assert(result.bounceSurfaces.length > 0);
      assert(result.consistencyGuards.some(c => c.includes(option.detail)));
    }
  }
  for (const time of times) {
    const scopes = new Set(options.map(o => o.space));
    for (const outdoor of [false, true]) {
      if (!scopes.has(outdoor ? 'outdoor' : 'indoor')) continue;
      const choices = compatiblePhysicalLighting(family, time, outdoor);
      assert(choices.length > 0, `${family} at ${time} / outdoor=${outdoor} has no valid lighting`);
      assert(choices.every(o => isPhysicalLightingCompatible(o, time, outdoor)));
    }
  }
}
assert.equal(total, 60, 'Catalog must expose sixty physical lighting modes');

const outdoorPlan = buildSmartSceneOptions({
  familyId: 'saudi-outdoor', subScene: 'شارع فلل سكني', timeOfDay: 'night',
  captureType: 'front-selfie', activity: 'واقف', selectedOutfitId: 'none',
  allowedLighting: LIGHTING_CATALOG['saudi-outdoor'].map(p => p.labelAR)
});
assert(outdoorPlan.compatibleLighting.includes('إنارة شارع دافئة'));
assert(!outdoorPlan.compatibleLighting.includes('شمس الظهر المباشرة'));

const carNight = compatiblePhysicalLighting('car', 'night', false).map(p => p.labelAR);
assert(carNight.includes('إضاءة الشارع عبر زجاج السيارة'));
assert(!carNight.includes('شمس الظهر عبر زجاج السيارة'));
assert(!compatiblePhysicalLighting('car', 'night', true).some(o => o.model === 'vehicle-dashboard'));

console.log('60 physical lighting modes: catalog, time, geometry and causal physics tests passed');
