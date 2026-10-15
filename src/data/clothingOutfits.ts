// Canonical and refined Clothing Library for PhysFrame
// Follows standardized Arabic naming, unique IDs, complete outfits only, and color palette combos.

export type ClothingCategory =
  | 'casual'
  | 'smart_casual'
  | 'traditional'
  | 'sport'
  | 'home'
  | 'outerwear'
  | 'formal'
  | 'military';

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

export const CLOTHING_CATEGORIES = [
  { id: 'all', labelAR: 'الكل' },
  { id: 'smart_casual', labelAR: 'كاجوال أنيق' },
  { id: 'casual', labelAR: 'يومي' },
  { id: 'traditional', labelAR: 'سعودي' },
  { id: 'formal', labelAR: 'رسمي' },
  { id: 'outerwear', labelAR: 'جاكيتات وسترات' },
  { id: 'sport', labelAR: 'رياضي' },
  { id: 'home', labelAR: 'منزلي' },
  { id: 'military', labelAR: 'عسكري وتكتيكي' }
];

export const OUTFITS: OutfitItem[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. الكاجوال الأنيق (Smart Casual) - تتضمن الـ 15 تركيبة الأساسية
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. كاجوال ويومي (Daily Casual)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'cas_white_tee_blue_jeans',
    labelAR: 'تيشيرت أبيض مع جينز أزرق',
    labelAr: 'تيشيرت أبيض مع جينز أزرق',
    promptDescription: 'white crewneck T-shirt paired with classic blue denim jeans',
    prompt: 'heavyweight white crewneck cotton T-shirt paired with classic mid-wash blue denim jeans',
    category: ['casual', 'saudi-outdoor', 'living-room', 'car', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['thick boxy cotton drape', 'clean crewneck tension', 'stiff authentic blue denim twill weave with knee creases']
  },
  {
    id: 'cas_black_tee_grey_jeans',
    labelAR: 'تيشيرت أسود مع جينز رمادي',
    labelAr: 'تيشيرت أسود مع جينز رمادي',
    promptDescription: 'black crewneck T-shirt paired with grey denim jeans',
    prompt: 'fitted black crewneck cotton T-shirt paired with washed charcoal grey denim jeans',
    category: ['casual', 'saudi-outdoor', 'living-room', 'car', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['dense black cotton absorbing ambient light', 'washed grey denim texture', 'natural torso drape']
  },
  {
    id: 'cas_navy_polo_beige_chinos',
    labelAR: 'بولو كحلي مع بنطلون بيج',
    labelAr: 'بولو كحلي مع بنطلون بيج',
    promptDescription: 'navy pique polo shirt paired with beige chinos',
    prompt: 'classic navy blue pique cotton polo shirt with ribbed collar paired with straight-cut beige chino trousers',
    category: ['casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['textured honeycomb pique knit', 'unbuttoned structured flat-lying collar', 'clean chino trouser line']
  },
  {
    id: 'cas_olive_tee_black_chinos',
    labelAR: 'تيشيرت زيتي مع بنطلون أسود',
    labelAr: 'تيشيرت زيتي مع بنطلون أسود',
    promptDescription: 'olive crewneck T-shirt paired with black chinos',
    prompt: 'simple relaxed olive-green crewneck cotton T-shirt paired with straight black chino trousers',
    category: ['casual', 'saudi-outdoor', 'living-room', 'car', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['soft washed olive jersey', 'natural chest contouring', 'clean matte black trouser silhouette']
  },
  {
    id: 'cas_denim_shirt_khaki_trousers',
    labelAR: 'قميص جينز دنيم مع بنطلون كاكي',
    labelAr: 'قميص جينز دنيم مع بنطلون كاكي',
    promptDescription: 'denim button-up shirt paired with khaki trousers',
    prompt: 'washed blue cotton denim button-up shirt paired with straight khaki cotton trousers',
    category: ['casual', 'saudi-outdoor', 'car'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['heavy twill fading on denim seams', 'stiff pocket flaps', 'classic khaki cotton drape']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. الثياب والأزياء السعودية التراثية (Saudi Traditional)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'thobe_white_summer',
    labelAR: 'ثوب سعودي أبيض صيفي',
    labelAr: 'ثوب سعودي أبيض صيفي',
    promptDescription: 'traditional white Saudi thobe in lightweight summer fabric',
    prompt: 'traditional crisp white Saudi thobe in lightweight summer fabric with standing mandarin collar',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['clean vertical gravity drape from shoulders to ankles', 'rigid starched collar curve', 'subtle natural fabric fold lines']
  },
  {
    id: 'thobe_white_shemagh',
    labelAR: 'ثوب سعودي أبيض مع شماغ أحمر وعقال',
    labelAr: 'ثوب سعودي أبيض مع شماغ أحمر وعقال',
    promptDescription: 'white Saudi thobe with red-and-white checkered shemagh and black igal',
    prompt: 'traditional white Saudi thobe worn with an authentic red-and-white checkered cotton shemagh and black double-ring igal',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['shemagh fabric draped naturally over shoulders framing face', 'black igal resting with natural pressure on crown', 'flowing vertical thobe lines']
  },
  {
    id: 'thobe_white_ghutra',
    labelAR: 'ثوب سعودي أبيض مع غترة بيضاء وعقال',
    labelAr: 'ثوب سعودي أبيض مع غترة بيضاء وعقال',
    promptDescription: 'white Saudi thobe with pure white ghutra and black igal',
    prompt: 'pristine white Saudi thobe paired with a flowing pure white cotton ghutra and black double-ring igal headpiece',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['delicate lightweight white ghutra drape over back and shoulders', 'igal anchoring head fabric securely', 'fluid full-length thobe silhouette']
  },
  {
    id: 'thobe_navy_winter',
    labelAR: 'ثوب سعودي كحلي شتوي',
    labelAr: 'ثوب سعودي كحلي شتوي',
    promptDescription: 'winter navy Saudi thobe in heavy wool blend',
    prompt: 'traditional winter dark navy Saudi thobe in thick structured wool blend',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['heavy wool-blend gravity hang', 'deep matte navy light absorption', 'thick structural gravity folds', 'sharp shoulder definition']
  },
  {
    id: 'thobe_charcoal_winter',
    labelAR: 'ثوب سعودي رمادي فحمي شتوي',
    labelAr: 'ثوب سعودي رمادي فحمي شتوي',
    promptDescription: 'winter charcoal grey Saudi thobe in wool fabric',
    prompt: 'dark charcoal grey traditional Saudi thobe in medium-weight winter wool',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['medium-weight structured drape', 'subtle matte fabric sheen', 'sharp shoulder and pocket lines']
  },
  {
    id: 'thobe_brown_bisht',
    labelAR: 'ثوب أبيض مع بشت حساوي بني مذهب',
    labelAr: 'ثوب أبيض مع بشت حساوي بني مذهب',
    promptDescription: 'white Saudi thobe with sheer brown bisht cloak edged in gold embroidery',
    prompt: 'formal Saudi white thobe paired with a sheer brown bisht cloak edged in metallic gold zari embroidery',
    category: ['traditional', 'saudi-outdoor', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['sheer gossamer cloak outer layer', 'heavy metallic embroidered edge holding shape', 'flowing arm opening draping']
  },
  {
    id: 'thobe_winter_farwa',
    labelAR: 'ثوب زيتي مع فروة شتوية شمالية',
    labelAr: 'ثوب زيتي مع فروة شتوية شمالية',
    promptDescription: 'olive Saudi thobe with northern shearling winter farwa coat',
    prompt: 'olive Saudi thobe enveloped in a traditional warm heavy northern Farwa winter coat lined with plush shearling wool',
    category: ['traditional', 'saudi-outdoor', 'car'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['thick voluminous coat bulk', 'visible dense shearling collar roll', 'heavy gravity anchoring around legs']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. الرسمي والبدلات (Formal & Suits)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'suit_navy_white_shirt',
    labelAR: 'بدلة كحلية رسمية مع قميص أبيض',
    labelAr: 'بدلة كحلية رسمية مع قميص أبيض',
    promptDescription: 'tailored navy two-piece suit with white dress shirt',
    prompt: 'tailored navy blue two-piece formal suit worn with an open-collar crisp white dress shirt (no tie) and matching navy suit trousers',
    category: ['formal', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'رسمي',
    subCategoryAR: 'رسمي',
    physics: ['structured padded suit jacket shoulders', 'notched lapels laying flat', 'open relaxed dress shirt collar', 'pressed suit trouser creases']
  },
  {
    id: 'suit_charcoal_white_shirt',
    labelAR: 'بدلة رمادية داكنة مع قميص أبيض',
    labelAr: 'بدلة رمادية داكنة مع قميص أبيض',
    promptDescription: 'tailored charcoal grey two-piece suit with white dress shirt',
    prompt: 'tailored charcoal dark grey two-piece suit jacket and trousers worn with a crisp white dress shirt unbuttoned at neck (no tie)',
    category: ['formal', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'رسمي',
    subCategoryAR: 'رسمي',
    physics: ['heavy formal wool suiting drape', 'natural chest canvas contouring', 'clean unwrinkled suit trouser break over shoes']
  },
  {
    id: 'blazer_navy_sand_chinos',
    labelAR: 'بليزر كحلي مع بنطلون بيج رملي',
    labelAr: 'بليزر كحلي مع بنطلون بيج رملي',
    promptDescription: 'navy blazer jacket over white shirt with sand chinos',
    prompt: 'unlined navy smart-casual blazer jacket over a white collared shirt with straight sand chino trousers',
    category: ['formal', 'smart_casual', 'saudi-outdoor', 'living-room', 'car'],
    categoryAR: 'رسمي',
    subCategoryAR: 'رسمي',
    physics: ['tailored shoulder padding', 'subtle lapel roll', 'crisp cotton chino leg folds']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. الجاكيتات والسترات (Outerwear & Jackets)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'out_black_leather_jacket',
    labelAR: 'جاكيت جلد أسود مع تيشيرت رمادي وبنطلون أسود',
    labelAr: 'جاكيت جلد أسود مع تيشيرت رمادي وبنطلون أسود',
    promptDescription: 'black leather jacket over grey tee with black trousers',
    prompt: 'black distressed natural leather jacket worn over a heather grey t-shirt and straight black trousers',
    category: ['outerwear', 'saudi-outdoor', 'car'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['stiff genuine leather creases at elbows', 'specular highlights on leather surface', 'heavy structured shoulders']
  },
  {
    id: 'out_denim_jacket_white_tee',
    labelAR: 'جاكيت جينز أزرق مع تيشيرت أبيض وبنطلون بيج',
    labelAr: 'جاكيت جينز أزرق مع تيشيرت أبيض وبنطلون بيج',
    promptDescription: 'blue denim trucker jacket over white tee with beige chinos',
    prompt: 'rugged blue denim trucker jacket worn open over a clean white crewneck t-shirt, paired with beige chinos',
    category: ['outerwear', 'saudi-outdoor', 'car'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['rigid denim shell over soft cotton tee', 'metal shank buttons', 'stiff layered collar structure']
  },
  {
    id: 'out_black_hoodie_cargos',
    labelAR: 'هودي أوفرسايز أسود مع بنطلون كارقو',
    labelAr: 'هودي أوفرسايز أسود مع بنطلون كارقو',
    promptDescription: 'black oversized hoodie with olive cargo pants',
    prompt: 'black heavyweight oversized cotton hoodie paired with relaxed multi-pocket olive cargo pants',
    category: ['outerwear', 'casual', 'saudi-outdoor', 'car', 'gym'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['heavy cotton jersey gathering', 'thick double-layered hood resting around neck', 'gravity drape at cuffs']
  },
  {
    id: 'out_olive_bomber_black_tee',
    labelAR: 'بومبر جاكيت زيتي مع تيشيرت أسود وبنطلون أسود',
    labelAr: 'بومبر جاكيت زيتي مع تيشيرت أسود وبنطلون أسود',
    promptDescription: 'olive bomber jacket over black tee with black trousers',
    prompt: 'classic olive nylon bomber jacket (MA-1 style) over a black crewneck tee and black trousers',
    category: ['outerwear', 'saudi-outdoor', 'car'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['subtle sheen on nylon shell', 'puffy insulated gathering at seams', 'ribbed collar and cuffs']
  },
  {
    id: 'out_navy_down_gilet',
    labelAR: 'فيست منفوخ كحلي مع تيشيرت رمادي وبنطلون كحلي',
    labelAr: 'فيست منفوخ كحلي مع تيشيرت رمادي وبنطلون كحلي',
    promptDescription: 'navy down gilet vest over grey long-sleeve tee with navy trousers',
    prompt: 'lightweight quilted navy down gilet vest layered over a heather grey long-sleeve tee with straight navy trousers',
    category: ['outerwear', 'saudi-outdoor', 'car'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['channel-quilted down puff', 'armhole binding hugging long sleeves', 'clean front zipper run']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. الملابس الرياضية والأداء (Sport & Athletic)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'gym_black_tee_grey_shorts',
    labelAR: 'تيشيرت رياضي أسود مع شورت رمادي',
    labelAr: 'تيشيرت رياضي أسود مع شورت رمادي',
    promptDescription: 'black compression workout tee with grey training shorts',
    prompt: 'athletic performance black moisture-wicking compression t-shirt paired with charcoal technical workout shorts',
    category: ['sport', 'gym'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['stretchy elastane fabric tension', 'muscle-contouring fit across shoulders and chest', 'mesh ventilation texture']
  },
  {
    id: 'gym_grey_tank_black_shorts',
    labelAR: 'تانك توب رياضي رمادي مع شورت أسود',
    labelAr: 'تانك توب رياضي رمادي مع شورت أسود',
    promptDescription: 'grey athletic tank top with black shorts',
    prompt: 'heather grey ribbed athletic workout tank top paired with black performance workout shorts',
    category: ['sport', 'gym'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['deep armhole cut exposing shoulder dynamics', 'ribbed knit elasticity', 'natural workout sweat absorption']
  },
  {
    id: 'gym_tracksuit_darkgrey',
    labelAR: 'طقم رياضي بسحاب رمادي غامق',
    labelAr: 'طقم رياضي بسحاب رمادي غامق',
    promptDescription: 'dark grey athletic tracksuit with quarter-zip pullover',
    prompt: 'dark grey technical athletic tracksuit with quarter-zip pullover and matching tapered athletic pants',
    category: ['sport', 'gym', 'saudi-outdoor'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['water-resistant windbreaker material', 'zipper tension at neck', 'athletic gathering at joints']
  },
  {
    id: 'gym_blue_drifit_black_shorts',
    labelAR: 'تيشيرت دراي فيت أزرق مع شورت أسود',
    labelAr: 'تيشيرت دراي فيت أزرق مع شورت أسود',
    promptDescription: 'royal blue Dri-FIT performance tee with black training shorts',
    prompt: 'royal blue moisture-wicking Dri-FIT performance athletic t-shirt and black workout shorts',
    category: ['sport', 'gym'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['subtle synthetic performance sheen', 'lightweight athletic drape', 'fluid movement contours']
  },
  {
    id: 'gym_black_rashguard_tights',
    labelAR: 'تيشيرت ضاغط أسود طويل مع بنطلون تمرين',
    labelAr: 'تيشيرت ضاغط أسود طويل مع بنطلون تمرين',
    promptDescription: 'black long-sleeve compression rashguard with black training pants',
    prompt: 'all-black high-stretch long-sleeve athletic compression rashguard base layer with black tapered training pants',
    category: ['sport', 'gym'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['second-skin anatomical tension', 'flatlock ergonomic seam lines', 'shoulder musculature definition']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. المنزلي والاسترخاء (Home & Sleep)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'home_grey_tee_black_shorts',
    labelAR: 'تيشيرت رمادي مريح مع شورت قطني أسود',
    labelAr: 'تيشيرت رمادي مريح مع شورت قطني أسود',
    promptDescription: 'loose grey lounge tee with black cotton shorts',
    prompt: 'comfortable loose heather grey lounge t-shirt and black soft cotton shorts',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft relaxed modal-cotton drape', 'natural body-weight gravity folds', 'comfortable unstarched collar']
  },
  {
    id: 'home_white_undershirt_grey_pants',
    labelAR: 'فانيلة قطنية بيضاء مع بنطال قطني مريح',
    labelAr: 'فانيلة قطنية بيضاء مع بنطال قطني مريح',
    promptDescription: 'white ribbed sleeveless undershirt with grey lounge pants',
    prompt: 'classic ribbed white cotton sleeveless undershirt and grey melange soft lounge pants',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['ribbed stretch fabric hugging torso', 'soft cotton waist gathering', 'relaxed domestic posture drape']
  },
  {
    id: 'home_navy_pajama_set',
    labelAR: 'طقم بيجامة قطنية كحلية كلاسيكية',
    labelAr: 'طقم بيجامة قطنية كحلية كلاسيكية',
    promptDescription: 'navy cotton tailored pajama set with piping',
    prompt: 'navy blue tailored cotton lounge pajama set with subtle white piping and chest pocket',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft pajama drape', 'notched lapel collar resting flat', 'relaxed smooth bedtime fall']
  },
  {
    id: 'home_cozy_knit_joggers',
    labelAR: 'كنزة صوفية منزلية بيج مع بنطال قطني',
    labelAr: 'كنزة صوفية منزلية بيج مع بنطال قطني',
    promptDescription: 'slouchy oversized greige knit sweater with jersey joggers',
    prompt: 'slouchy oversized greige knit sweater paired with soft grey jersey joggers',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['relaxed extra-long sleeve stack over wrists', 'soft slumped shoulder line', 'plush cozy fabric weight']
  },
  {
    id: 'home_cotton_sleep_thobe',
    labelAR: 'ثوب منزلي قطني مريح للاسترخاء',
    labelAr: 'ثوب منزلي قطني مريح للاسترخاء',
    promptDescription: 'relaxed soft off-white cotton lounge thobe',
    prompt: 'relaxed soft off-white cotton lounge home thobe with comfortable unbuttoned collar',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['loose relaxed drape', 'organic soft wrinkles', 'unbuttoned comfortable collar line']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. العسكري والتكتيكي (Military & Duty)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'mil_admin_tan_shirt',
    labelAR: 'قميص عسكري إداري مكتبي بيج كاكي',
    labelAr: 'قميص عسكري إداري مكتبي بيج كاكي',
    promptDescription: 'Saudi administrative military uniform shirt with chest ribbons',
    prompt: 'Saudi administrative military uniform shirt (tan/khaki) with epaulets and chest ribbons',
    category: ['military', 'military-base', 'car'],
    categoryAR: 'عسكري وتكتيكي',
    subCategoryAR: 'عسكري وتكتيكي',
    physics: ['crisp starched fabric', 'structured rigid collar', 'chest pocket details holding shape', 'formal tailored fit across chest']
  },
  {
    id: 'mil_desert_camo_uniform',
    labelAR: 'بدلة عسكرية مموهة صحراوي رقمي',
    labelAr: 'بدلة عسكرية مموهة صحراوي رقمي',
    promptDescription: 'Saudi desert digital camouflage military tactical uniform',
    prompt: 'Saudi desert digital camouflage military tactical uniform with rank insignia and branch patch',
    category: ['military', 'military-base', 'saudi-outdoor', 'car'],
    categoryAR: 'عسكري وتكتيكي',
    subCategoryAR: 'عسكري وتكتيكي',
    physics: ['stiff thick tactical ripstop fabric', 'structured shoulder epaulets', 'velcro patches texture', 'heavy duty button tension']
  },
  {
    id: 'mil_woodland_camo_uniform',
    labelAR: 'بدلة عسكرية مموهة زيتي أخضر',
    labelAr: 'بدلة عسكرية مموهة زيتي أخضر',
    promptDescription: 'Saudi woodland green camouflage military tactical uniform',
    prompt: 'Saudi woodland green camouflage military tactical uniform with branch patches',
    category: ['military', 'military-base', 'saudi-outdoor', 'car'],
    categoryAR: 'عسكري وتكتيكي',
    subCategoryAR: 'عسكري وتكتيكي',
    physics: ['stiff thick fabric', 'structured shoulder epaulets', 'military insignia patches', 'heavy duty button tension']
  },
  {
    id: 'mil_black_tactical_plate_carrier',
    labelAR: 'سترة تكتيكية مدرعة فوق قميص بولو أسود',
    labelAr: 'سترة تكتيكية مدرعة فوق قميص بولو أسود',
    promptDescription: 'black tactical plate carrier vest over black performance polo',
    prompt: 'black tactical plate carrier vest worn over a black performance polo shirt with duty belt',
    category: ['military', 'military-base', 'car'],
    categoryAR: 'عسكري وتكتيكي',
    subCategoryAR: 'عسكري وتكتيكي',
    physics: ['heavy rigid nylon vest texture', 'molle webbing straps tension', 'fitted polo underneath with shoulder compression']
  },
  {
    id: 'mil_navy_ops_uniform',
    labelAR: 'بدلة عمليات كحلية مع شريط عاكس',
    labelAr: 'بدلة عمليات كحلية مع شريط عاكس',
    promptDescription: 'dark navy tactical operations uniform with reflective safety striping',
    prompt: 'dark navy tactical operations uniform with subtle reflective safety striping on sleeves',
    category: ['military', 'military-base', 'car', 'saudi-outdoor'],
    categoryAR: 'عسكري وتكتيكي',
    subCategoryAR: 'عسكري وتكتيكي',
    physics: ['heavyweight twill fabric', 'double-stitched seams', 'structured combat collar']
  },
  {
    id: 'mil_tactical_combat_shirt',
    labelAR: 'قميص قتالي تكتيكي مع أكمام مموهة',
    labelAr: 'قميص قتالي تكتيكي مع أكمام مموهة',
    promptDescription: 'tactical dual-fabric combat shirt with camouflage sleeves',
    prompt: 'tactical dual-fabric combat shirt with breathable moisture-wicking torso and reinforced camouflage sleeves',
    category: ['military', 'military-base', 'car'],
    categoryAR: 'عسكري وتكتيكي',
    subCategoryAR: 'عسكري وتكتيكي',
    physics: ['tight torso elastane stretch contours', 'stiff ripstop sleeves contrast', 'bicep pocket velcro pull']
  },

  // Permanent extended full-outfit library. Existing outfit IDs remain unchanged.
  {
    id: 'smart_sand_polo_navy',
    fixedCompleteOutfit: true,
    labelAR: 'بولو رملي مع بنطلون كحلي',
    labelAr: 'بولو رملي مع بنطلون كحلي',
    promptDescription: 'sand-beige cotton pique polo shirt with navy tailored chinos',
    prompt: 'sand-beige cotton pique polo shirt with navy tailored chinos',
    category: ['smart_casual', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['believable shirt hem and natural elbow creases', 'cotton trouser weight and waist tension']
  },
  {
    id: 'smart_burgundy_polo_cream',
    fixedCompleteOutfit: true,
    labelAR: 'بولو خمري مع بنطلون كريمي',
    labelAr: 'بولو خمري مع بنطلون كريمي',
    promptDescription: 'deep burgundy cotton polo shirt with cream straight-leg chinos',
    prompt: 'deep burgundy cotton polo shirt with cream straight-leg chinos',
    category: ['smart_casual', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['believable shirt hem and natural elbow creases', 'cotton trouser weight and waist tension']
  },
  {
    id: 'smart_cream_linen_olive',
    fixedCompleteOutfit: true,
    labelAR: 'قميص كتان كريمي مع بنطلون زيتي',
    labelAr: 'قميص كتان كريمي مع بنطلون زيتي',
    promptDescription: 'cream linen long-sleeve shirt with olive green tailored trousers',
    prompt: 'cream linen long-sleeve shirt with olive green tailored trousers',
    category: ['smart_casual', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['believable shirt hem and natural elbow creases', 'cotton trouser weight and waist tension']
  },
  {
    id: 'smart_chocolate_shirt_stone',
    fixedCompleteOutfit: true,
    labelAR: 'قميص بني شوكولاتة مع بنطلون حجري',
    labelAr: 'قميص بني شوكولاتة مع بنطلون حجري',
    promptDescription: 'chocolate-brown matte cotton shirt with stone-beige trousers',
    prompt: 'chocolate-brown matte cotton shirt with stone-beige trousers',
    category: ['smart_casual', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['believable shirt hem and natural elbow creases', 'cotton trouser weight and waist tension']
  },
  {
    id: 'smart_iceblue_shirt_black',
    fixedCompleteOutfit: true,
    labelAR: 'قميص أزرق ثلجي مع بنطلون أسود',
    labelAr: 'قميص أزرق ثلجي مع بنطلون أسود',
    promptDescription: 'ice-blue Oxford shirt with straight black tailored trousers',
    prompt: 'ice-blue Oxford shirt with straight black tailored trousers',
    category: ['smart_casual', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['believable shirt hem and natural elbow creases', 'cotton trouser weight and waist tension']
  },
  {
    id: 'smart_black_polo_stone',
    fixedCompleteOutfit: true,
    labelAR: 'بولو أسود مع بنطلون رملي',
    labelAr: 'بولو أسود مع بنطلون رملي',
    promptDescription: 'black cotton pique polo shirt with stone-colored chino trousers',
    prompt: 'black cotton pique polo shirt with stone-colored chino trousers',
    category: ['smart_casual', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['believable shirt hem and natural elbow creases', 'cotton trouser weight and waist tension']
  },
  {
    id: 'smart_olive_overshirt_cream',
    fixedCompleteOutfit: true,
    labelAR: 'أوفرشيرت زيتي فوق تيشيرت أبيض مع بنطلون كريمي',
    labelAr: 'أوفرشيرت زيتي فوق تيشيرت أبيض مع بنطلون كريمي',
    promptDescription: 'olive cotton overshirt worn open over a white crewneck tee with cream chinos',
    prompt: 'olive cotton overshirt worn open over a white crewneck tee with cream chinos',
    category: ['smart_casual', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'كاجوال أنيق',
    subCategoryAR: 'كاجوال أنيق',
    physics: ['believable shirt hem and natural elbow creases', 'cotton trouser weight and waist tension']
  },
  {
    id: 'cas_grey_tee_blue_jeans',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت رمادي مع جينز أزرق',
    labelAr: 'تيشيرت رمادي مع جينز أزرق',
    promptDescription: 'heather-grey cotton crewneck T-shirt with medium-blue denim jeans',
    prompt: 'heather-grey cotton crewneck T-shirt with medium-blue denim jeans',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'cas_beige_tee_black_jeans',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت بيج مع جينز أسود',
    labelAr: 'تيشيرت بيج مع جينز أسود',
    promptDescription: 'sand-beige cotton crewneck T-shirt with black denim jeans',
    prompt: 'sand-beige cotton crewneck T-shirt with black denim jeans',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'cas_white_tee_olive_cargo',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت أبيض مع بنطلون كارغو زيتي',
    labelAr: 'تيشيرت أبيض مع بنطلون كارغو زيتي',
    promptDescription: 'plain white heavyweight cotton T-shirt with olive cargo trousers',
    prompt: 'plain white heavyweight cotton T-shirt with olive cargo trousers',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'cas_navy_tee_grey_chino',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت كحلي مع بنطلون رمادي',
    labelAr: 'تيشيرت كحلي مع بنطلون رمادي',
    promptDescription: 'navy crewneck jersey T-shirt with medium-grey cotton chinos',
    prompt: 'navy crewneck jersey T-shirt with medium-grey cotton chinos',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'cas_maroon_tee_blue_denim',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت عنابي مع جينز أزرق غامق',
    labelAr: 'تيشيرت عنابي مع جينز أزرق غامق',
    promptDescription: 'maroon cotton T-shirt with dark indigo denim jeans',
    prompt: 'maroon cotton T-shirt with dark indigo denim jeans',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'cas_black_polo_darkdenim',
    fixedCompleteOutfit: true,
    labelAR: 'بولو أسود مع جينز أزرق غامق',
    labelAr: 'بولو أسود مع جينز أزرق غامق',
    promptDescription: 'black short-sleeve cotton pique polo with dark-blue denim jeans',
    prompt: 'black short-sleeve cotton pique polo with dark-blue denim jeans',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'cas_striped_tee_navy',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت أبيض مخطط مع بنطلون كحلي',
    labelAr: 'تيشيرت أبيض مخطط مع بنطلون كحلي',
    promptDescription: 'white cotton tee with thin navy horizontal stripes and navy chinos',
    prompt: 'white cotton tee with thin navy horizontal stripes and navy chinos',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'cas_cream_tee_khaki',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت كريمي مع بنطلون كاكي',
    labelAr: 'تيشيرت كريمي مع بنطلون كاكي',
    promptDescription: 'cream cotton crewneck tee with relaxed khaki cotton trousers',
    prompt: 'cream cotton crewneck tee with relaxed khaki cotton trousers',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'cas_sage_tee_stone',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت أخضر فاتح مع بنطلون حجري',
    labelAr: 'تيشيرت أخضر فاتح مع بنطلون حجري',
    promptDescription: 'muted sage green cotton T-shirt with stone-colored chinos',
    prompt: 'muted sage green cotton T-shirt with stone-colored chinos',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'cas_powderblue_polo_grey',
    fixedCompleteOutfit: true,
    labelAR: 'بولو أزرق فاتح مع بنطلون رمادي',
    labelAr: 'بولو أزرق فاتح مع بنطلون رمادي',
    promptDescription: 'powder-blue cotton pique polo shirt with charcoal-grey trousers',
    prompt: 'powder-blue cotton pique polo shirt with charcoal-grey trousers',
    category: ['casual', 'saudi-outdoor', 'car', 'living-room', 'bedroom'],
    categoryAR: 'يومي',
    subCategoryAR: 'يومي',
    physics: ['natural cotton jersey loops and subtle nonuniform folds', 'denim or chino seams with physically plausible wear']
  },
  {
    id: 'trad_thobe_sand',
    fixedCompleteOutfit: true,
    labelAR: 'ثوب سعودي بيج رملي',
    labelAr: 'ثوب سعودي بيج رملي',
    promptDescription: 'sand-beige lightweight cotton Saudi thobe with a closed standing collar',
    prompt: 'sand-beige lightweight cotton Saudi thobe with a closed standing collar',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['continuous gravity-led fabric drape with restrained cotton creases', 'standing collar and stitched front placket']
  },
  {
    id: 'trad_thobe_grey_summer',
    fixedCompleteOutfit: true,
    labelAR: 'ثوب سعودي رمادي فاتح صيفي',
    labelAr: 'ثوب سعودي رمادي فاتح صيفي',
    promptDescription: 'light dove-grey summer cotton Saudi thobe with neat standing collar',
    prompt: 'light dove-grey summer cotton Saudi thobe with neat standing collar',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['continuous gravity-led fabric drape with restrained cotton creases', 'standing collar and stitched front placket']
  },
  {
    id: 'trad_thobe_olive',
    fixedCompleteOutfit: true,
    labelAR: 'ثوب سعودي زيتي سادة',
    labelAr: 'ثوب سعودي زيتي سادة',
    promptDescription: 'plain muted olive-green Saudi thobe in medium-weight matte cotton',
    prompt: 'plain muted olive-green Saudi thobe in medium-weight matte cotton',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['continuous gravity-led fabric drape with restrained cotton creases', 'standing collar and stitched front placket']
  },
  {
    id: 'trad_thobe_black',
    fixedCompleteOutfit: true,
    labelAR: 'ثوب سعودي أسود سادة',
    labelAr: 'ثوب سعودي أسود سادة',
    promptDescription: 'plain matte black Saudi thobe in breathable cotton blend',
    prompt: 'plain matte black Saudi thobe in breathable cotton blend',
    category: ['traditional', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'سعودي',
    subCategoryAR: 'سعودي',
    physics: ['continuous gravity-led fabric drape with restrained cotton creases', 'standing collar and stitched front placket']
  },
  {
    id: 'formal_black_suit_white',
    fixedCompleteOutfit: true,
    labelAR: 'بدلة سوداء مع قميص أبيض',
    labelAr: 'بدلة سوداء مع قميص أبيض',
    promptDescription: 'matte black tailored two-piece suit with a white cotton dress shirt',
    prompt: 'matte black tailored two-piece suit with a white cotton dress shirt',
    category: ['formal', 'saudi-outdoor', 'car', 'living-room', 'military-base'],
    categoryAR: 'رسمي',
    subCategoryAR: 'رسمي',
    physics: ['tailored shoulders with natural lapel structure', 'pressed trouser folds and matte woven fabric']
  },
  {
    id: 'formal_grey_blazer_black',
    fixedCompleteOutfit: true,
    labelAR: 'بليزر رمادي مع قميص أسود وبنطلون أسود',
    labelAr: 'بليزر رمادي مع قميص أسود وبنطلون أسود',
    promptDescription: 'mid-grey structured blazer over a black dress shirt with black trousers',
    prompt: 'mid-grey structured blazer over a black dress shirt with black trousers',
    category: ['formal', 'saudi-outdoor', 'car', 'living-room', 'military-base'],
    categoryAR: 'رسمي',
    subCategoryAR: 'رسمي',
    physics: ['tailored shoulders with natural lapel structure', 'pressed trouser folds and matte woven fabric']
  },
  {
    id: 'formal_beige_blazer_white',
    fixedCompleteOutfit: true,
    labelAR: 'بليزر بيج مع قميص أبيض وبنطلون بني',
    labelAr: 'بليزر بيج مع قميص أبيض وبنطلون بني',
    promptDescription: 'sand-beige linen-blend blazer over a white shirt with warm-brown tailored trousers',
    prompt: 'sand-beige linen-blend blazer over a white shirt with warm-brown tailored trousers',
    category: ['formal', 'saudi-outdoor', 'car', 'living-room', 'military-base'],
    categoryAR: 'رسمي',
    subCategoryAR: 'رسمي',
    physics: ['tailored shoulders with natural lapel structure', 'pressed trouser folds and matte woven fabric']
  },
  {
    id: 'out_grey_ziphoodie_black',
    fixedCompleteOutfit: true,
    labelAR: 'هودي رمادي بسحاب مع تيشيرت أبيض وبنطلون أسود',
    labelAr: 'هودي رمادي بسحاب مع تيشيرت أبيض وبنطلون أسود',
    promptDescription: 'heather-grey zip hoodie over white cotton T-shirt with black jogger trousers',
    prompt: 'heather-grey zip hoodie over white cotton T-shirt with black jogger trousers',
    category: ['outerwear', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['independent weight and fold response for jacket and base layer', 'natural seam and cuff tension']
  },
  {
    id: 'out_sand_bomber_navy',
    fixedCompleteOutfit: true,
    labelAR: 'جاكيت بومبر رملي مع تيشيرت كحلي وجينز غامق',
    labelAr: 'جاكيت بومبر رملي مع تيشيرت كحلي وجينز غامق',
    promptDescription: 'sand-beige bomber jacket over a navy cotton tee with dark denim jeans',
    prompt: 'sand-beige bomber jacket over a navy cotton tee with dark denim jeans',
    category: ['outerwear', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['independent weight and fold response for jacket and base layer', 'natural seam and cuff tension']
  },
  {
    id: 'out_olive_field_jacket_cream',
    fixedCompleteOutfit: true,
    labelAR: 'جاكيت زيتي خفيف مع تيشيرت كريمي وبنطلون أسود',
    labelAr: 'جاكيت زيتي خفيف مع تيشيرت كريمي وبنطلون أسود',
    promptDescription: 'lightweight olive field jacket over a cream tee with black chinos',
    prompt: 'lightweight olive field jacket over a cream tee with black chinos',
    category: ['outerwear', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['independent weight and fold response for jacket and base layer', 'natural seam and cuff tension']
  },
  {
    id: 'out_charcoal_cardigan_grey',
    fixedCompleteOutfit: true,
    labelAR: 'كارديغان فحمي مع تيشيرت رمادي وبنطلون بيج',
    labelAr: 'كارديغان فحمي مع تيشيرت رمادي وبنطلون بيج',
    promptDescription: 'charcoal open-front cotton cardigan over heather-grey tee with beige chinos',
    prompt: 'charcoal open-front cotton cardigan over heather-grey tee with beige chinos',
    category: ['outerwear', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['independent weight and fold response for jacket and base layer', 'natural seam and cuff tension']
  },
  {
    id: 'out_brown_suede_black',
    fixedCompleteOutfit: true,
    labelAR: 'جاكيت شمواه بني مع تيشيرت أسود وجينز كحلي',
    labelAr: 'جاكيت شمواه بني مع تيشيرت أسود وجينز كحلي',
    promptDescription: 'brown suede casual jacket over a black tee with dark indigo jeans',
    prompt: 'brown suede casual jacket over a black tee with dark indigo jeans',
    category: ['outerwear', 'saudi-outdoor', 'car', 'living-room'],
    categoryAR: 'جاكيتات',
    subCategoryAR: 'جاكيتات',
    physics: ['independent weight and fold response for jacket and base layer', 'natural seam and cuff tension']
  },
  {
    id: 'gym_white_tee_black_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت رياضي أبيض مع شورت أسود',
    labelAr: 'تيشيرت رياضي أبيض مع شورت أسود',
    promptDescription: 'white breathable athletic T-shirt with plain black training shorts',
    prompt: 'white breathable athletic T-shirt with plain black training shorts',
    category: ['sport', 'gym', 'bedroom', 'living-room'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['breathable knit fabric with realistic sweat response only when scene calls for it', 'flexible garment tension without artificial texture']
  },
  {
    id: 'gym_graphite_tee_navy_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت رياضي فحمي مع شورت كحلي',
    labelAr: 'تيشيرت رياضي فحمي مع شورت كحلي',
    promptDescription: 'graphite-grey athletic crewneck tee with navy performance shorts',
    prompt: 'graphite-grey athletic crewneck tee with navy performance shorts',
    category: ['sport', 'gym', 'bedroom', 'living-room'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['breathable knit fabric with realistic sweat response only when scene calls for it', 'flexible garment tension without artificial texture']
  },
  {
    id: 'gym_olive_tank_grey_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'فانيلة رياضية زيتية مع شورت رمادي',
    labelAr: 'فانيلة رياضية زيتية مع شورت رمادي',
    promptDescription: 'olive green cotton athletic tank top with grey training shorts',
    prompt: 'olive green cotton athletic tank top with grey training shorts',
    category: ['sport', 'gym', 'bedroom', 'living-room'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['breathable knit fabric with realistic sweat response only when scene calls for it', 'flexible garment tension without artificial texture']
  },
  {
    id: 'gym_navy_tank_black_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تانك توب كحلي مع شورت أسود',
    labelAr: 'تانك توب كحلي مع شورت أسود',
    promptDescription: 'navy sleeveless performance tank with black sports shorts',
    prompt: 'navy sleeveless performance tank with black sports shorts',
    category: ['sport', 'gym', 'bedroom', 'living-room'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['breathable knit fabric with realistic sweat response only when scene calls for it', 'flexible garment tension without artificial texture']
  },
  {
    id: 'gym_darkgreen_tee_black_joggers',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت رياضي أخضر غامق مع بنطلون رياضي أسود',
    labelAr: 'تيشيرت رياضي أخضر غامق مع بنطلون رياضي أسود',
    promptDescription: 'dark green athletic tee with straight black training joggers',
    prompt: 'dark green athletic tee with straight black training joggers',
    category: ['sport', 'gym', 'bedroom', 'living-room'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['breathable knit fabric with realistic sweat response only when scene calls for it', 'flexible garment tension without artificial texture']
  },
  {
    id: 'gym_red_tee_charcoal',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت رياضي أحمر غامق مع شورت فحمي',
    labelAr: 'تيشيرت رياضي أحمر غامق مع شورت فحمي',
    promptDescription: 'muted brick-red workout tee with charcoal training shorts',
    prompt: 'muted brick-red workout tee with charcoal training shorts',
    category: ['sport', 'gym', 'bedroom', 'living-room'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['breathable knit fabric with realistic sweat response only when scene calls for it', 'flexible garment tension without artificial texture']
  },
  {
    id: 'gym_grey_tee_olive_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت رياضي رمادي مع شورت زيتي',
    labelAr: 'تيشيرت رياضي رمادي مع شورت زيتي',
    promptDescription: 'medium-grey moisture-wicking tee with olive-green athletic shorts',
    prompt: 'medium-grey moisture-wicking tee with olive-green athletic shorts',
    category: ['sport', 'gym', 'bedroom', 'living-room'],
    categoryAR: 'رياضي',
    subCategoryAR: 'رياضي',
    physics: ['breathable knit fabric with realistic sweat response only when scene calls for it', 'flexible garment tension without artificial texture']
  },
  {
    id: 'home_white_tee_grey_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت قطني أبيض مع شورت رمادي',
    labelAr: 'تيشيرت قطني أبيض مع شورت رمادي',
    promptDescription: 'plain white soft cotton jersey T-shirt with mid-grey lounge shorts',
    prompt: 'plain white soft cotton jersey T-shirt with mid-grey lounge shorts',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'home_grey_tee_white_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت رمادي قطني مع شورت أبيض',
    labelAr: 'تيشيرت رمادي قطني مع شورت أبيض',
    promptDescription: 'heather-grey soft cotton T-shirt with white cotton jersey lounge shorts',
    prompt: 'heather-grey soft cotton T-shirt with white cotton jersey lounge shorts',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'home_beige_tee_white_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت بيج فاتح مع شورت أبيض',
    labelAr: 'تيشيرت بيج فاتح مع شورت أبيض',
    promptDescription: 'light beige crewneck cotton T-shirt with white soft woven cotton shorts',
    prompt: 'light beige crewneck cotton T-shirt with white soft woven cotton shorts',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'home_black_tee_grey_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت قطني أسود مع شورت رمادي',
    labelAr: 'تيشيرت قطني أسود مع شورت رمادي',
    promptDescription: 'plain black cotton T-shirt with soft heather-grey lounge shorts',
    prompt: 'plain black cotton T-shirt with soft heather-grey lounge shorts',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'home_white_tank_black_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'فانيلة داخلية بيضاء مع شورت أسود',
    labelAr: 'فانيلة داخلية بيضاء مع شورت أسود',
    promptDescription: 'plain white ribbed cotton undershirt with black jersey lounge shorts',
    prompt: 'plain white ribbed cotton undershirt with black jersey lounge shorts',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'home_navy_tee_beige_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت كحلي مريح مع شورت بيج',
    labelAr: 'تيشيرت كحلي مريح مع شورت بيج',
    promptDescription: 'navy cotton sleep T-shirt with relaxed beige cotton shorts',
    prompt: 'navy cotton sleep T-shirt with relaxed beige cotton shorts',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'home_olive_tee_charcoal_shorts',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت زيتي مع شورت فحمي',
    labelAr: 'تيشيرت زيتي مع شورت فحمي',
    promptDescription: 'olive soft washed cotton tee with charcoal cotton shorts',
    prompt: 'olive soft washed cotton tee with charcoal cotton shorts',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'home_blue_tee_grey_joggers',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت أزرق فاتح مع بنطال قطني رمادي',
    labelAr: 'تيشيرت أزرق فاتح مع بنطال قطني رمادي',
    promptDescription: 'pale blue loose cotton T-shirt with grey cotton jersey joggers',
    prompt: 'pale blue loose cotton T-shirt with grey cotton jersey joggers',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'home_cream_long_sleeve_black',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت منزلي كريمي بأكمام طويلة مع بنطال أسود',
    labelAr: 'تيشيرت منزلي كريمي بأكمام طويلة مع بنطال أسود',
    promptDescription: 'cream long-sleeve jersey lounge shirt with plain black cotton joggers',
    prompt: 'cream long-sleeve jersey lounge shirt with plain black cotton joggers',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'home_white_sleep_tee_navy',
    fixedCompleteOutfit: true,
    labelAR: 'تيشيرت نوم أبيض مع بنطال قطني كحلي',
    labelAr: 'تيشيرت نوم أبيض مع بنطال قطني كحلي',
    promptDescription: 'soft white cotton sleep T-shirt with loose navy lounge trousers',
    prompt: 'soft white cotton sleep T-shirt with loose navy lounge trousers',
    category: ['home', 'bedroom', 'living-room'],
    categoryAR: 'منزلي',
    subCategoryAR: 'منزلي',
    physics: ['soft cotton jersey grain without synthetic repeated detail', 'relaxed fabric gravity and contact wrinkles']
  },
  {
    id: 'mil_olive_duty_shirt_black',
    fixedCompleteOutfit: true,
    labelAR: 'قميص عمل زيتي مع بنطلون أسود',
    labelAr: 'قميص عمل زيتي مع بنطلون أسود',
    promptDescription: 'plain olive green long-sleeve duty shirt with black utility trousers and simple belt, no rank insignia',
    prompt: 'plain olive green long-sleeve duty shirt with black utility trousers and simple belt, no rank insignia',
    category: ['military', 'military-base', 'car'],
    categoryAR: 'عسكري وتكتيكي',
    subCategoryAR: 'عسكري وتكتيكي',
    physics: ['utilitarian woven cotton with natural collar and pocket structure', 'realistic sleeve and trouser seam tension']
  },
  {
    id: 'mil_tan_duty_uniform',
    fixedCompleteOutfit: true,
    labelAR: 'طقم عمل كاكي سادة مع بنطلون مطابق',
    labelAr: 'طقم عمل كاكي سادة مع بنطلون مطابق',
    promptDescription: 'solid khaki long-sleeve duty shirt with matching khaki utility trousers, no badges or insignia',
    prompt: 'solid khaki long-sleeve duty shirt with matching khaki utility trousers, no badges or insignia',
    category: ['military', 'military-base', 'car'],
    categoryAR: 'عسكري وتكتيكي',
    subCategoryAR: 'عسكري وتكتيكي',
    physics: ['utilitarian woven cotton with natural collar and pocket structure', 'realistic sleeve and trouser seam tension']
  }
];

export function getClothingOutfit(id: string): OutfitItem {
  return OUTFITS.find(o => o.id === id) || OUTFITS[0];
}

/** Deterministic wardrobe filter, independent of place, activity, and time. */
export function filterClothingOutfits(categoryId = 'all', query = ''): OutfitItem[] {
  const needle = query.trim().toLocaleLowerCase();
  return OUTFITS.filter(outfit => {
    const categories = Array.isArray(outfit.category) ? outfit.category : [outfit.category];
    if (categoryId !== 'all' && !categories.includes(categoryId)) return false;
    return !needle || outfit.labelAR.toLocaleLowerCase().includes(needle) ||
      outfit.promptDescription.toLocaleLowerCase().includes(needle);
  });
}
