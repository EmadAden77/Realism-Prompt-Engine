import assert from 'node:assert/strict';
import { deriveLightingCausality } from './lightingCausality';

const base = {
  familyId: 'living-room' as const,
  subScene: 'منتصف الصالة',
  timeOfDay: 'night' as const,
  lightingIntensity: 55,
  shadowDepth: 60,
  isOutdoor: false,
  cameraExposureBehavior: 'restrained smartphone auto-exposure',
};

const neutral5000 = deriveLightingCausality({
  ...base,
  lightingMode: 'إضاءة سقف أبيض 5000K',
});
assert.match(neutral5000.primarySource.name, /5000K neutral-cool white/i);
assert.match(neutral5000.primarySource.distanceBehavior, /physically plausible distance falloff/i);
assert.doesNotMatch(neutral5000.sourceSummary.join(' '), /front display flash/i);
assert(
  neutral5000.consistencyGuards.some(guard => /do not invent fluorescent flicker/i.test(guard)),
  'White LED ceiling mode must not automatically invent fluorescent flicker or volumetric beams'
);

const displayOnly = deriveLightingCausality({
  ...base,
  lightingMode: 'فلاش الشاشة الأمامية فقط',
  lightingIntensity: 30,
  shadowDepth: 80,
});
assert.match(displayOnly.primarySource.name, /front display flash/i);
assert.match(displayOnly.primarySource.physicalOrigin, /smartphone display/i);
assert.match(displayOnly.primarySource.distanceBehavior, /40-60cm/i);
assert.doesNotMatch(displayOnly.primarySource.physicalOrigin, /LED flash/i);
assert(
  displayOnly.consistencyGuards.some(guard => /never a separate point LED/i.test(guard)),
  'Front display flash must never be modeled as a separate point LED'
);
assert(
  displayOnly.consistencyGuards.some(guard => /do not force red-eye/i.test(guard)),
  'Red-eye must remain conditional, not mandatory'
);

const combined = deriveLightingCausality({
  ...base,
  lightingMode: 'إضاءة سقف أبيض 5000K + فلاش الشاشة الأمامية',
});
assert.match(combined.primarySource.name, /5000K neutral-cool white/i);
assert(
  combined.secondarySources.some(source => /front display flash/i.test(source.name)),
  'Combined mode must keep the ceiling source primary and add display fill secondarily'
);
assert.match(combined.shadowBehavior, /preserve ceiling direction/i);

console.log('lightingCausality tests passed');

assert(neutral5000.consistencyGuards.some(rule => /low light preserve exposure-dependent/i.test(rule)));
const dayLighting = deriveLightingCausality({
  ...base,
  timeOfDay: 'midday',
  isOutdoor: true,
  lightingMode: 'daylight',
});
assert(dayLighting.consistencyGuards.some(rule => /do not mandate ISO grain/i.test(rule)));
