export type HomeBackgroundPeopleMode = 'none' | 'men' | 'women' | 'children' | 'mixed';

export type HomeBackgroundClothing =
  | 'auto'
  | 'thobe-white'
  | 'casual-jeans-tee'
  | 'formal-shirt-trousers'
  | 'navy-suit'
  | 'sports'
  | 'abaya-black'
  | 'abaya-colored-hijab'
  | 'casual-jeans-blouse'
  | 'home-dress'
  | 'women-tracksuit'
  | 'kids-tee-shorts'
  | 'kids-thobe'
  | 'kids-dress'
  | 'kids-tracksuit'
  | 'kids-jeans-tee';

export type HomeBackgroundPersonKind = 'man' | 'woman' | 'child';

export interface HomeBackgroundPersonProfile {
  index: number;
  kind: HomeBackgroundPersonKind;
  clothing: HomeBackgroundClothing;
  identityPrompt: string;
  clothingPrompt: string;
}

const MAN_CLOTHING: Record<HomeBackgroundClothing, string> = {
  auto: 'scene-appropriate ordinary home clothing selected without matching the main subject',
  'thobe-white': 'white Saudi thobe with visible natural cotton micro-weave and restrained gravity folds',
  'casual-jeans-tee': 'dark-wash jeans with a heavyweight casual T-shirt and natural seated or standing fabric creases',
  'formal-shirt-trousers': 'navy formal shirt with grey trousers, natural button tension and restrained textile texture',
  'navy-suit': 'navy wool suit with ordinary dress-shirt styling and realistic lapel, trouser and shoe wear',
  sports: 'modest sports shorts or track trousers with a breathable Dri-FIT style top',
  'abaya-black': 'ordinary black abaya',
  'abaya-colored-hijab': 'ordinary colored shoulder abaya with hijab',
  'casual-jeans-blouse': 'casual jeans with lightweight blouse',
  'home-dress': 'lightweight cotton home dress',
  'women-tracksuit': 'modest women\'s tracksuit',
  'kids-tee-shorts': 'children\'s cotton T-shirt and knee-length shorts',
  'kids-thobe': 'children\'s thobe',
  'kids-dress': 'children\'s cotton dress',
  'kids-tracksuit': 'children\'s tracksuit',
  'kids-jeans-tee': 'children\'s jeans and T-shirt',
};

const WOMAN_CLOTHING: Record<HomeBackgroundClothing, string> = {
  ...MAN_CLOTHING,
  auto: 'scene-appropriate modest home clothing selected without matching any other background person',
};

const CHILD_CLOTHING: Record<HomeBackgroundClothing, string> = {
  ...MAN_CLOTHING,
  auto: 'age-appropriate ordinary children\'s home clothing selected without matching any other background person',
};

const MAN_IDENTITIES = [
  'adult man in his late 20s, oval face, short straight nose, almond eyes, medium brows, clean-shaven, short wavy dark hair, calm neutral expression',
  'adult man around 40, rectangular face, long straight nose, deep-set brown eyes, thick straight brows, short beard, short dark hair, relaxed attentive expression',
  'adult man in his early 50s, broad face, mildly aquiline nose, smaller eyes, sparse brows, moustache with light beard stubble, receding dark hair, quiet serious expression',
  'older man around 65, longer face, prominent nose bridge, deep-set eyes, full grey beard, thinning grey hair, composed tired expression',
  'adult man in his mid 30s, rounder face, shorter nose, wider-set eyes, arched brows, trimmed moustache, curly dark hair, mild conversational expression',
];

const WOMAN_IDENTITIES = [
  'adult woman in her late 20s, oval face, small straight nose, large almond eyes, softly arched brows, natural complexion, calm neutral expression',
  'adult woman around 40, longer face, defined nose bridge, medium deep-set eyes, straight brows, natural complexion, attentive expression',
  'adult woman in her early 50s, rounder face, short nose, smaller eyes, gently arched brows, natural age lines, relaxed serious expression',
  'adult woman in her mid 30s, heart-shaped face, narrow nose, wide-set eyes, medium brows, natural complexion, faint conversational smile',
  'older woman around 60, broad oval face, prominent nose bridge, deep-set eyes, sparse brows, natural age texture, composed expression',
];

const CHILD_IDENTITIES = [
  'boy around 6 years old, round face, small button nose, large brown eyes, soft straight brows, short dark hair, curious neutral expression',
  'girl around 9 years old, oval face, small straight nose, almond eyes, fine brows, long dark hair, calm expression',
  'boy around 11 years old, narrow oval face, slightly longer nose, medium eyes, straight brows, short curly hair, focused expression',
  'girl around 7 years old, rounder face, small nose, wide-set eyes, softly arched brows, shoulder-length dark hair, mild smile',
  'child around 12 years old, longer face, straight nose, smaller deep-set eyes, medium brows, short dark hair, neutral expression',
];

export const HOME_BACKGROUND_MODE_LABELS: Record<HomeBackgroundPeopleMode, string> = {
  none: 'بدون أشخاص',
  men: 'رجال',
  women: 'نساء',
  children: 'أطفال',
  mixed: 'مختلط',
};

export const HOME_BACKGROUND_CLOTHING_OPTIONS: Record<HomeBackgroundPersonKind, Array<{ id: HomeBackgroundClothing; labelAR: string }>> = {
  man: [
    { id: 'auto', labelAR: 'اختيار تلقائي مناسب' },
    { id: 'thobe-white', labelAR: 'ثوب أبيض' },
    { id: 'casual-jeans-tee', labelAR: 'جينز + تيشيرت' },
    { id: 'formal-shirt-trousers', labelAR: 'قميص كحلي + بنطلون رمادي' },
    { id: 'navy-suit', labelAR: 'بدلة كحلية' },
    { id: 'sports', labelAR: 'ملابس رياضية' },
  ],
  woman: [
    { id: 'auto', labelAR: 'اختيار تلقائي مناسب' },
    { id: 'abaya-black', labelAR: 'عباية سوداء' },
    { id: 'abaya-colored-hijab', labelAR: 'عباية ملونة + حجاب' },
    { id: 'casual-jeans-blouse', labelAR: 'جينز + بلوزة' },
    { id: 'home-dress', labelAR: 'فستان بيت' },
    { id: 'women-tracksuit', labelAR: 'بدلة رياضية' },
  ],
  child: [
    { id: 'auto', labelAR: 'اختيار تلقائي مناسب' },
    { id: 'kids-tee-shorts', labelAR: 'تيشيرت + شورت' },
    { id: 'kids-thobe', labelAR: 'ثوب أطفال' },
    { id: 'kids-dress', labelAR: 'فستان أطفال' },
    { id: 'kids-tracksuit', labelAR: 'بدلة رياضية أطفال' },
    { id: 'kids-jeans-tee', labelAR: 'جينز أطفال + تيشيرت' },
  ],
};

export const isHomeBackgroundScene = (sceneFamily: string | null | undefined): boolean =>
  sceneFamily === 'bedroom' || sceneFamily === 'living-room';

export const resolveHomeBackgroundPersonKinds = (
  mode: HomeBackgroundPeopleMode,
  count: number
): HomeBackgroundPersonKind[] => {
  const safeCount = Math.max(0, Math.min(5, Math.round(count || 0)));
  if (mode === 'none' || safeCount === 0) return [];
  if (mode === 'men') return Array.from({ length: safeCount }, () => 'man' as const);
  if (mode === 'women') return Array.from({ length: safeCount }, () => 'woman' as const);
  if (mode === 'children') return Array.from({ length: safeCount }, () => 'child' as const);
  const cycle: HomeBackgroundPersonKind[] = ['man', 'woman', 'child'];
  return Array.from({ length: safeCount }, (_, index) => cycle[index % cycle.length]);
};

const getIdentity = (kind: HomeBackgroundPersonKind, index: number): string => {
  const pool = kind === 'man' ? MAN_IDENTITIES : kind === 'woman' ? WOMAN_IDENTITIES : CHILD_IDENTITIES;
  return pool[index % pool.length];
};

const getClothingPrompt = (kind: HomeBackgroundPersonKind, clothing: HomeBackgroundClothing): string => {
  const map = kind === 'man' ? MAN_CLOTHING : kind === 'woman' ? WOMAN_CLOTHING : CHILD_CLOTHING;
  return map[clothing] || map.auto;
};

export const resolveHomeBackgroundPeople = (
  mode: HomeBackgroundPeopleMode | undefined,
  count: number | undefined,
  clothing: HomeBackgroundClothing[] | undefined
): HomeBackgroundPersonProfile[] => {
  const resolvedMode = mode ?? 'none';
  const kinds = resolveHomeBackgroundPersonKinds(resolvedMode, count ?? 0);
  return kinds.map((kind, index) => {
    const selectedClothing = clothing?.[index] ?? 'auto';
    return {
      index,
      kind,
      clothing: selectedClothing,
      identityPrompt: getIdentity(kind, index),
      clothingPrompt: getClothingPrompt(kind, selectedClothing),
    };
  });
};

export const compileHomeBackgroundPeoplePrompt = (
  profiles: HomeBackgroundPersonProfile[]
): string => {
  if (!profiles.length) return '';

  const people = profiles.map((person, index) =>
    `Background person ${index + 1}: ${person.identityPrompt}. Clothing: ${person.clothingPrompt}. They remain secondary to the main subject and do not deliberately pose for the selfie unless the selected activity requires it.`
  ).join(' ');

  return `USER-SELECTED HOME BACKGROUND PEOPLE: ${people} STRICT ANTI-CLONING: every background person must be a genuinely different identity. Never clone the reference subject. Never reuse one background face for another. Every pair must differ across at least five independent identity dimensions such as face shape, nose geometry, eye geometry, brow structure, jaw/chin structure, hair/facial-hair profile, age range, expression, body build, or clothing. Natural family resemblance is allowed only when explicitly requested. Background people may be partially cropped or occluded by the subject, sofa, doorway, or furniture to preserve real selfie FOV; the physics engine may reduce visible count but must not silently convert an explicit people selection to no people.`;
};
