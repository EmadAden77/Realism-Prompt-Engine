// Wardrobe: 15 reference colour pairings, 4 Saudi thobes and bedroom sleepwear; optional outerwear is independent.
export type ClothingCategory = 'smart_casual' | 'traditional' | 'sleepwear';

export interface OutfitItem {
  id: string;
  /** Outfit description is an indivisible selection, not independent editable garments. */
  readonly fixedCompleteOutfit?: true;
  labelAR: string;
  labelAr: string; // compatibility alias
  promptDescription: string;
  prompt: string; // compatibility alias with App.tsx
  category: string | string[]; // compatibility with scene family arrays and category strings
  categoryAR: string;
  subCategoryAR: string;
  physics: string[];
}


export type JacketId = 'none' | 'long_black_puffer' | 'short_black_puffer' | 'camel_quilted_vest';
export interface JacketItem { id: Exclude<JacketId, 'none'>; labelAR: string; prompt: string; physics: string[]; }
export const JACKETS: JacketItem[] = [
  {
    id: 'long_black_puffer', labelAR: 'جاكيت أسود طويل بغطاء رأس',
    prompt: 'the exact style of the supplied long matte-black insulated puffer parka, extending close to the knees, broad attached padded hood, tall padded collar, long sleeves, horizontal quilted insulation panels, front zipper covered by snap-button storm flap, and vertical zippered hand pockets; worn naturally over the selected base outfit',
    physics: ['realistic padded insulation volume and stitching', 'long coat hem falling by gravity', 'zipper, snap and hood construction remain physically consistent']
  },
  {
    id: 'short_black_puffer', labelAR: 'جاكيت أسود قصير مبطن',
    prompt: 'the exact style of the supplied hip-length matte-black puffer jacket, tall upright stand collar without a hood, broad horizontal padded baffles, long slightly elasticated sleeves, front zip beneath a snap-button placket, and two side pockets; worn naturally over the selected base outfit',
    physics: ['hip-length padded jacket follows natural body volume', 'horizontal insulated baffles and collar seams remain visible']
  },
  {
    id: 'camel_quilted_vest', labelAR: 'صديري جملي مبطن بدون أكمام',
    prompt: 'the exact style of the supplied warm camel-brown suede-like sleeveless padded vest, standing collar, full central zip and horizontal quilted channels across the torso; worn over the selected base outfit, with its sleeves remaining fully visible',
    physics: ['sleeveless armholes accurately expose the base garments sleeves', 'soft camel textile nap, quilting and genuine zipper tension']
  }
];
export const getJacket = (id: string | undefined): JacketItem | undefined => JACKETS.find(j => j.id === id);

export const CLOTHING_CATEGORIES = [
  { id: 'all', labelAR: 'الكل' },
  { id: 'smart_casual', labelAR: 'قمصان وبناطيل' },
  { id: 'traditional', labelAR: 'ثياب سعودية' },
  { id: 'sleepwear', labelAR: 'ملابس نوم ومنزل' }
];

export const OUTFITS: OutfitItem[] = [
  {
    id: 'navy_shirt_grey_trousers',
    labelAR: 'قميص كحلي مع بنطلون رمادي',
    labelAr: 'قميص كحلي مع بنطلون رمادي',
    promptDescription: 'navy button-up shirt paired with grey trousers',
    prompt: 'tailored navy blue button-up shirt paired with structured grey trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['crisp cotton poplin weave', 'natural sleeve creases at elbows', 'sharp placket tension', 'straight tailored trouser leg fall']
  },
  {
    id: 'lightblue_shirt_navy_trousers',
    labelAR: 'قميص أزرق فاتح مع بنطلون كحلي',
    labelAr: 'قميص أزرق فاتح مع بنطلون كحلي',
    promptDescription: 'light blue button-up shirt paired with navy trousers',
    prompt: 'light blue Oxford cotton button-down shirt paired with tailored dark navy trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['fine pinpoint Oxford weave', 'soft collar roll', 'clean contrast between light blue torso and deep navy trousers']
  },
  {
    id: 'white_shirt_beige_trousers',
    labelAR: 'قميص أبيض مع بنطلون بيج',
    labelAr: 'قميص أبيض مع بنطلون بيج',
    promptDescription: 'crisp white button-up shirt paired with beige trousers',
    prompt: 'crisp white long-sleeve cotton button-up shirt paired with tailored beige chino trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['structured buttoned collar', 'natural sleeve creases at elbows', 'clean straight beige chino drape']
  },
  {
    id: 'olive_shirt_brown_trousers',
    labelAR: 'قميص زيتي مع بنطلون بني',
    labelAr: 'قميص زيتي مع بنطلون بني',
    promptDescription: 'olive green button-up shirt paired with brown trousers',
    prompt: 'olive green casual cotton button-up shirt paired with warm brown tailored trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['matte olive twill texture', 'natural fold lines over shoulders', 'rich earthy brown cotton trouser drape']
  },
  {
    id: 'black_shirt_charcoal_trousers',
    labelAR: 'قميص أسود مع بنطلون فحمي',
    labelAr: 'قميص أسود مع بنطلون فحمي',
    promptDescription: 'black button-up shirt paired with charcoal trousers',
    prompt: 'matte black button-up shirt paired with dark charcoal grey tailored trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['deep black cotton absorbing ambient light', 'subtle tonal contrast with charcoal fabric', 'clean tailored cuffs']
  },
  {
    id: 'beige_shirt_white_trousers',
    labelAR: 'قميص بيج مع بنطلون أبيض',
    labelAr: 'قميص بيج مع بنطلون أبيض',
    promptDescription: 'beige button-up shirt paired with white trousers',
    prompt: 'warm sand-beige button-up shirt paired with relaxed white cotton-linen trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['soft cotton-linen blend texture', 'gentle organic wrinkles', 'lightweight breezy fabric fall']
  },
  {
    id: 'grey_shirt_black_trousers',
    labelAR: 'قميص رمادي مع بنطلون أسود',
    labelAr: 'قميص رمادي مع بنطلون أسود',
    promptDescription: 'grey button-up shirt paired with black trousers',
    prompt: 'medium grey tailored long-sleeve shirt paired with flat-front black trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['smooth grey poplin surface', 'crisp collar points', 'matte black trouser fabric absorbing light']
  },
  {
    id: 'sage_shirt_cream_trousers',
    labelAR: 'قميص سيج أخضر فاتح مع بنطلون كريمي',
    labelAr: 'قميص سيج أخضر فاتح مع بنطلون كريمي',
    promptDescription: 'sage green button-up shirt paired with cream trousers',
    prompt: 'soft sage light green button-up shirt paired with off-white cream tailored trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['gentle muted pastel sheen', 'fluid breathable drape', 'natural cream fabric leg folds']
  },
  {
    id: 'pink_shirt_grey_trousers',
    labelAR: 'قميص وردي فاتح مع بنطلون رمادي',
    labelAr: 'قميص وردي فاتح مع بنطلون رمادي',
    promptDescription: 'light pink button-up shirt paired with grey trousers',
    prompt: 'subtle pastel light pink cotton shirt paired with medium-grey tailored trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['soft fine-count cotton weave', 'neat collar contouring', 'balanced contrast with heather grey trousers']
  },
  {
    id: 'white_shirt_navy_trousers',
    labelAR: 'قميص أبيض مع بنطلون كحلي',
    labelAr: 'قميص أبيض مع بنطلون كحلي',
    promptDescription: 'crisp white button-up shirt paired with navy trousers',
    prompt: 'crisp white cotton button-up shirt tucked neatly into classic navy blue tailored trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['crisp starched cotton chest tension', 'high contrast against dark navy trousers', 'clean waistline belt fold']
  },
  {
    id: 'burgundy_shirt_grey_trousers',
    labelAR: 'قميص خمري مع بنطلون رمادي',
    labelAr: 'قميص خمري مع بنطلون رمادي',
    promptDescription: 'burgundy button-up shirt paired with grey trousers',
    prompt: 'deep burgundy wine button-up shirt paired with cool grey tailored trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['rich saturated wine cotton tone', 'subtle shadow depth around button placket', 'clean grey trouser fall']
  },
  {
    id: 'black_shirt_beige_trousers',
    labelAR: 'قميص أسود مع بنطلون بيج',
    labelAr: 'قميص أسود مع بنطلون بيج',
    promptDescription: 'black button-up shirt paired with beige trousers',
    prompt: 'fitted black button-up shirt paired with straight-cut sand beige chino trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['matte black light absorption on upper body', 'sharp collar profile', 'warm beige cotton trouser contrast']
  },
  {
    id: 'steelblue_shirt_khaki_trousers',
    labelAR: 'قميص أزرق فولاذي مع بنطلون كاكي',
    labelAr: 'قميص أزرق فولاذي مع بنطلون كاكي',
    promptDescription: 'steel blue button-up shirt paired with khaki trousers',
    prompt: 'muted steel blue cotton shirt paired with classic khaki trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['contemporary industrial blue-grey hue', 'durable cotton weave', 'straight khaki trouser drape over shoes']
  },
  {
    id: 'white_shirt_olive_trousers',
    labelAR: 'قميص أبيض مع بنطلون زيتي',
    labelAr: 'قميص أبيض مع بنطلون زيتي',
    promptDescription: 'white button-up shirt paired with olive trousers',
    prompt: 'clean white button-up shirt paired with earthy olive green chino trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['pure white upper body reflection', 'organic olive green fabric folds at knees', 'natural waistline fit']
  },
  {
    id: 'charcoal_shirt_lightgrey_trousers',
    labelAR: 'قميص فحمي مع بنطلون رمادي فاتح',
    labelAr: 'قميص فحمي مع بنطلون رمادي فاتح',
    promptDescription: 'charcoal button-up shirt paired with light grey trousers',
    prompt: 'dark charcoal button-up shirt paired with light heather grey tailored trousers',
    category: ['smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['monochromatic grayscale gradient', 'charcoal cotton shadow depth', 'soft light grey trouser drape']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━,
  {
    id: 'thobe_navy', fixedCompleteOutfit: true, labelAR: 'ثوب سعودي كحلي', labelAr: 'ثوب سعودي كحلي',
    promptDescription: 'deep navy traditional Saudi thobe, full-length straight tailored silhouette, long sleeves, structured pointed collar, visible front buttons and chest pocket', prompt: 'deep navy traditional Saudi thobe, full-length straight tailored silhouette, long sleeves, structured pointed collar, visible front buttons and chest pocket',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'ثياب سعودية', subCategoryAR: 'ثوب سعودي',
    physics: ['natural long thobe fabric gravity folds', 'accurate full-length drape with no trousers substituted', 'visible collar and cuff seams']
  },
  {
    id: 'thobe_beige', fixedCompleteOutfit: true, labelAR: 'ثوب سعودي بيج', labelAr: 'ثوب سعودي بيج',
    promptDescription: 'sand-beige traditional Saudi thobe, full-length straight tailored silhouette, long sleeves, pointed standing collar, visible front buttons and single chest pocket', prompt: 'sand-beige traditional Saudi thobe, full-length straight tailored silhouette, long sleeves, pointed standing collar, visible front buttons and single chest pocket',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'ثياب سعودية', subCategoryAR: 'ثوب سعودي',
    physics: ['natural long thobe fabric gravity folds', 'accurate full-length drape with no trousers substituted', 'visible collar and cuff seams']
  },
  {
    id: 'thobe_black', fixedCompleteOutfit: true, labelAR: 'ثوب سعودي أسود', labelAr: 'ثوب سعودي أسود',
    promptDescription: 'matte black traditional Saudi thobe, full-length straight tailored silhouette, long sleeves, upright band collar with visible black buttons, front placket and chest pocket', prompt: 'matte black traditional Saudi thobe, full-length straight tailored silhouette, long sleeves, upright band collar with visible black buttons, front placket and chest pocket',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'ثياب سعودية', subCategoryAR: 'ثوب سعودي',
    physics: ['natural long thobe fabric gravity folds', 'accurate full-length drape with no trousers substituted', 'visible collar and cuff seams']
  },
  {
    id: 'thobe_light_grey', fixedCompleteOutfit: true, labelAR: 'ثوب سعودي رمادي فاتح', labelAr: 'ثوب سعودي رمادي فاتح',
    promptDescription: 'light cool-grey traditional Saudi thobe, full-length straight tailored silhouette, long sleeves, structured standing collar, visible front buttons and chest pocket', prompt: 'light cool-grey traditional Saudi thobe, full-length straight tailored silhouette, long sleeves, structured standing collar, visible front buttons and chest pocket',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'ثياب سعودية', subCategoryAR: 'ثوب سعودي',
    physics: ['natural long thobe fabric gravity folds', 'accurate full-length drape with no trousers substituted', 'visible collar and cuff seams']
  },
  // Bedroom and home lounge outfits, locked as complete sets.
  {
    "id": "sleep_white_tee_black_shorts",
    "fixedCompleteOutfit": true,
    "labelAR": "تيشيرت أبيض + شورت أسود",
    "labelAr": "تيشيرت أبيض + شورت أسود",
    "promptDescription": "plain white short-sleeve crew-neck cotton T-shirt paired with black knee-length cotton lounge shorts with an elastic waistband",
    "prompt": "plain white short-sleeve crew-neck cotton T-shirt paired with black knee-length cotton lounge shorts with an elastic waistband",
    "category": [
      "sleepwear",
      "home",
      "bedroom"
    ],
    "categoryAR": "ملابس نوم ومنزل",
    "subCategoryAR": "طقم نوم",
    "physics": [
      "soft matte opaque cotton knit with visible seams",
      "natural relaxed fit, gravity folds and contact creases at shoulders, waist and supported body areas",
      "realistic elastic waistband and shorts hems above or around the knees",
      "short sleeves follow arm position without distortion"
    ]
  },
  {
    "id": "sleep_white_tee_navy_shorts",
    "fixedCompleteOutfit": true,
    "labelAR": "تيشيرت أبيض + شورت كحلي",
    "labelAr": "تيشيرت أبيض + شورت كحلي",
    "promptDescription": "plain white short-sleeve crew-neck cotton T-shirt paired with dark navy knee-length cotton lounge shorts with an elastic waistband",
    "prompt": "plain white short-sleeve crew-neck cotton T-shirt paired with dark navy knee-length cotton lounge shorts with an elastic waistband",
    "category": [
      "sleepwear",
      "home",
      "bedroom"
    ],
    "categoryAR": "ملابس نوم ومنزل",
    "subCategoryAR": "طقم نوم",
    "physics": [
      "soft matte opaque cotton knit with visible seams",
      "natural relaxed fit, gravity folds and contact creases at shoulders, waist and supported body areas",
      "realistic elastic waistband and shorts hems above or around the knees",
      "short sleeves follow arm position without distortion"
    ]
  },
  {
    "id": "sleep_white_tank_white_pants",
    "fixedCompleteOutfit": true,
    "labelAR": "تيشيرت علاقي أبيض + بنطال منزلي أبيض",
    "labelAr": "تيشيرت علاقي أبيض + بنطال منزلي أبيض",
    "promptDescription": "plain white sleeveless cotton tank top with natural shoulder straps and a round neckline paired with opaque white relaxed-fit cotton lounge trousers with an elastic waistband",
    "prompt": "plain white sleeveless cotton tank top with natural shoulder straps and a round neckline paired with opaque white relaxed-fit cotton lounge trousers with an elastic waistband",
    "category": [
      "sleepwear",
      "home",
      "bedroom"
    ],
    "categoryAR": "ملابس نوم ومنزل",
    "subCategoryAR": "طقم نوم",
    "physics": [
      "soft matte opaque cotton knit with visible seams",
      "natural relaxed fit, gravity folds and contact creases at shoulders, waist and supported body areas",
      "realistic elastic waistband and loose full-length trouser drape",
      "natural sleeveless armholes and strap tension"
    ]
  },
  {
    "id": "sleep_white_tank_beige_pants",
    "fixedCompleteOutfit": true,
    "labelAR": "تيشيرت علاقي أبيض + بنطال منزلي بيج",
    "labelAr": "تيشيرت علاقي أبيض + بنطال منزلي بيج",
    "promptDescription": "plain white sleeveless cotton tank top with natural shoulder straps and a round neckline paired with light beige relaxed-fit cotton lounge trousers with an elastic waistband",
    "prompt": "plain white sleeveless cotton tank top with natural shoulder straps and a round neckline paired with light beige relaxed-fit cotton lounge trousers with an elastic waistband",
    "category": [
      "sleepwear",
      "home",
      "bedroom"
    ],
    "categoryAR": "ملابس نوم ومنزل",
    "subCategoryAR": "طقم نوم",
    "physics": [
      "soft matte opaque cotton knit with visible seams",
      "natural relaxed fit, gravity folds and contact creases at shoulders, waist and supported body areas",
      "realistic elastic waistband and loose full-length trouser drape",
      "natural sleeveless armholes and strap tension"
    ]
  },
  {
    "id": "sleep_black_tank_white_pants",
    "fixedCompleteOutfit": true,
    "labelAR": "تيشيرت علاقي أسود + بنطال منزلي أبيض",
    "labelAr": "تيشيرت علاقي أسود + بنطال منزلي أبيض",
    "promptDescription": "plain black sleeveless cotton tank top with natural shoulder straps and a round neckline paired with opaque white relaxed-fit cotton lounge trousers with an elastic waistband",
    "prompt": "plain black sleeveless cotton tank top with natural shoulder straps and a round neckline paired with opaque white relaxed-fit cotton lounge trousers with an elastic waistband",
    "category": [
      "sleepwear",
      "home",
      "bedroom"
    ],
    "categoryAR": "ملابس نوم ومنزل",
    "subCategoryAR": "طقم نوم",
    "physics": [
      "soft matte opaque cotton knit with visible seams",
      "natural relaxed fit, gravity folds and contact creases at shoulders, waist and supported body areas",
      "realistic elastic waistband and loose full-length trouser drape",
      "natural sleeveless armholes and strap tension"
    ]
  },
  {
    "id": "sleep_black_tank_beige_pants",
    "fixedCompleteOutfit": true,
    "labelAR": "تيشيرت علاقي أسود + بنطال منزلي بيج",
    "labelAr": "تيشيرت علاقي أسود + بنطال منزلي بيج",
    "promptDescription": "plain black sleeveless cotton tank top with natural shoulder straps and a round neckline paired with light beige relaxed-fit cotton lounge trousers with an elastic waistband",
    "prompt": "plain black sleeveless cotton tank top with natural shoulder straps and a round neckline paired with light beige relaxed-fit cotton lounge trousers with an elastic waistband",
    "category": [
      "sleepwear",
      "home",
      "bedroom"
    ],
    "categoryAR": "ملابس نوم ومنزل",
    "subCategoryAR": "طقم نوم",
    "physics": [
      "soft matte opaque cotton knit with visible seams",
      "natural relaxed fit, gravity folds and contact creases at shoulders, waist and supported body areas",
      "realistic elastic waistband and loose full-length trouser drape",
      "natural sleeveless armholes and strap tension"
    ]
  }
];

export function getClothingOutfit(id: string): OutfitItem { return OUTFITS.find(o => o.id === id) || OUTFITS[0]; }
export function filterClothingOutfits(categoryId = 'all', query = ''): OutfitItem[] {
  const needle = query.trim().toLocaleLowerCase();
  return OUTFITS.filter(outfit => {
    const categories = Array.isArray(outfit.category) ? outfit.category : [outfit.category];
    if (categoryId !== 'all' && !categories.includes(categoryId)) return false;
    return !needle || outfit.labelAR.toLocaleLowerCase().includes(needle) || outfit.promptDescription.toLocaleLowerCase().includes(needle);
  });
}
