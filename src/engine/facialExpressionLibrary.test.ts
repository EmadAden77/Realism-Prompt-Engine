import assert from 'node:assert/strict';
import {
  ADVANCED_FACIAL_EXPRESSIONS,
  type FacialExpressionDefinition,
} from '../data/facialExpressionLibrary';

assert.equal(
  ADVANCED_FACIAL_EXPRESSIONS.length,
  32,
  'Expected 30 individual additions plus compact and full combined presets'
);

const ids = ADVANCED_FACIAL_EXPRESSIONS.map(item => item.id);
assert.equal(new Set(ids).size, ids.length, 'Advanced expression IDs must be unique');

for (const item of ADVANCED_FACIAL_EXPRESSIONS) {
  assert(item.labelAR.trim().length > 0, item.id + ': missing Arabic label');
  assert(item.categoryAR.trim().length > 0, item.id + ': missing category');
  assert(item.prompt.trim().length > 0, item.id + ': missing prompt');
  assert(item.anatomy.trim().length > 0, item.id + ': missing physical detail');
}

const get = (id: string): FacialExpressionDefinition => {
  const item = ADVANCED_FACIAL_EXPRESSIONS.find(entry => entry.id === id);
  assert(item, 'Missing advanced expression: ' + id);
  return item;
};

assert.match(get('fx01').anatomy, /2:13 AM/i);
assert.match(get('fx02').anatomy, /corrugator supercilii/i);
assert.match(get('fx03').anatomy, /orbicularis oculi/i);
assert.match(get('fx04').anatomy, /AU9 nose wrinkler/i);
assert.match(get('fx05').anatomy, /asymmetry 70\/30/i);
assert.match(get('fx06').anatomy, /bloodshot red veins sclera/i);
assert.match(get('fx07').anatomy, /alar flare 2mm/i);
assert.match(get('fx08').anatomy, /masseter bulging jaw clench/i);
assert.match(get('fx09').anatomy, /mole asymmetrical 3mm cheek/i);
assert.match(get('fx10').anatomy, /one crooked lower incisor/i);
assert.match(get('fx11').anatomy, /ptosis 1\.5mm/i);
assert.match(get('fx12').anatomy, /infraorbital fat herniation/i);
assert.match(get('fx13').anatomy, /left eyebrow 3mm higher/i);
assert.match(get('fx14').anatomy, /20% more squinted/i);
assert.match(get('fx15').anatomy, /right nostril flared more/i);
assert.match(get('fx16').anatomy, /mouth corner left lower/i);
assert.match(get('fx17').anatomy, /tear meniscus glossy/i);
assert.match(get('fx18').anatomy, /nose tip red vasoconstriction/i);
assert.match(get('fx19').anatomy, /Langer lines viscoelastic/i);
assert.match(get('fx20').anatomy, /platysma bands/i);
assert.match(get('fx21').anatomy, /skin pores sebaceous filaments/i);
assert.match(get('fx22').anatomy, /nose hair 2mm visible/i);
assert.match(get('fx23').anatomy, /vertical lines on lips/i);
assert.match(get('fx24').anatomy, /upper lip darker pigmentation/i);
assert.match(get('fx25').anatomy, /teeth not bleached yellowish/i);
assert.match(get('fx26').anatomy, /tongue pressing inside cheek/i);
assert.match(get('fx27').anatomy, /10 degrees off-camera/i);
assert.match(get('fx28').anatomy, /lateral canthus wrinkles/i);
assert.match(get('fx29').anatomy, /vertical glabella line/i);
assert.match(get('fx30').anatomy, /nose bridge wrinkled/i);

assert.match(get('fx_core10').anatomy, /FACS AU4 brow lowerer glare/i);
assert.match(get('fx_core10').anatomy, /one crooked lower incisor/i);
assert.match(get('fx_full').anatomy, /meibomian glands/i);
assert.match(get('fx_full').anatomy, /platysma neck bands visible/i);
assert.match(get('fx_full').anatomy, /tongue pressing inside cheek bulge/i);

const categories = new Set(
  ADVANCED_FACIAL_EXPRESSIONS.map(item => item.categoryAR)
);
for (const required of [
  'تعب وعيون',
  'حواجب وجفون',
  'الأنف',
  'عدم تناظر وحركة الوجه',
  'فك ورقبة',
  'جلد وتفاصيل دقيقة',
  'فم وأسنان',
  'حزم مركبة',
]) {
  assert(categories.has(required), 'Missing category: ' + required);
}

console.log('facialExpressionLibrary tests passed');
