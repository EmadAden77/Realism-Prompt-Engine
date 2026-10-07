import assert from 'node:assert/strict';
import {
  HAIR_PHYSICS_PRESETS,
  getHairPhysicsPreset,
} from '../data/hairPhysicsLibrary';

assert.equal(
  HAIR_PHYSICS_PRESETS.length,
  38,
  'Expected auto + 35 physical hair rules + compact/full bundles'
);

const ids = HAIR_PHYSICS_PRESETS.map(item => item.id);
assert.equal(new Set(ids).size, ids.length);

for (const item of HAIR_PHYSICS_PRESETS) {
  assert(item.labelAR.trim().length > 0, item.id + ': missing Arabic label');
  assert(item.categoryAR.trim().length > 0, item.id + ': missing category');
  assert(item.prompt.trim().length > 0, item.id + ': missing prompt');
}

assert.match(getHairPhysicsPreset('hp01').prompt, /scalp visible/i);
assert.match(getHairPhysicsPreset('hp03').prompt, /2-3cm halo/i);
assert.match(getHairPhysicsPreset('hp04').prompt, /lag 0\.2s inertia/i);
assert.match(getHairPhysicsPreset('hp05').prompt, /mustache lifting 1mm/i);
assert.match(getHairPhysicsPreset('hp21').prompt, /agal crease/i);
assert.match(getHairPhysicsPreset('hp23').prompt, /beard delayed inertia 0\.2s/i);
assert.match(getHairPhysicsPreset('hp35').prompt, /micro-shadows on forehead/i);
assert.match(getHairPhysicsPreset('hp_core7').prompt, /friction tangle/i);
assert.match(getHairPhysicsPreset('hp_full').prompt, /sodium backlight orange rim/i);
assert.equal(getHairPhysicsPreset('missing').id, 'hp_auto');

console.log('hairPhysicsLibrary tests passed');
