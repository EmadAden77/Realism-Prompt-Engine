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
  }
];

export function getClothingOutfit(id: string): OutfitItem {
  return OUTFITS.find(o => o.id === id) || OUTFITS[0];
}
