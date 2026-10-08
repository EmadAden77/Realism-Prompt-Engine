import assert from 'node:assert/strict';
import {
  compileHomeBackgroundPeoplePrompt,
  resolveHomeBackgroundPeople,
  resolveHomeBackgroundPersonKinds,
} from './homeBackgroundPeople';

assert.deepEqual(
  resolveHomeBackgroundPersonKinds('mixed', 5),
  ['man', 'woman', 'child', 'man', 'woman'],
  'Mixed home background should deterministically include men, women, and children'
);

const profiles = resolveHomeBackgroundPeople(
  'men',
  2,
  ['thobe-white', 'casual-jeans-tee']
);

assert.equal(profiles.length, 2);
assert.notEqual(
  profiles[0].identityPrompt,
  profiles[1].identityPrompt,
  'Background people must receive distinct identity profiles'
);
assert.match(profiles[0].clothingPrompt, /thobe/i);
assert.match(profiles[1].clothingPrompt, /jeans/i);

const prompt = compileHomeBackgroundPeoplePrompt(profiles);
assert.match(prompt, /STRICT ANTI-CLONING/i);
assert.match(prompt, /Never clone the reference subject/i);
assert.match(prompt, /at least five independent identity dimensions/i);
assert.doesNotMatch(prompt, /100% different/i);

assert.equal(
  compileHomeBackgroundPeoplePrompt(resolveHomeBackgroundPeople('none', 0, [])),
  '',
  'Explicit no-people mode should not fabricate people'
);

console.log('homeBackgroundPeople tests passed');
