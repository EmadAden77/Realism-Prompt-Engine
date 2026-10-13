import type { SceneFamilyId } from './microLocations';

/**
 * Ten distinct, ordinary real-world illumination choices per scene family.
 * All physically specific claims originate from a selected fixture/opening,
 * not from an imagined reference-image analysis.
 */
export type PhysicalLightModel =
  | 'sun-hard' | 'sun-low' | 'sky-shade' | 'wall-bounce'
  | 'window' | 'ceiling' | 'fluorescent' | 'local-lamp'
  | 'outdoor-practical' | 'shop-spill'
  | 'vehicle-day' | 'vehicle-exterior' | 'vehicle-dashboard' | 'phone-screen';

export type LightingClock = 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
export type LightingSpace = 'indoor' | 'outdoor' | 'either';
type TimeBand = 'day' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night' | 'evening' | 'any';
type LightingRow = readonly [labelAR: string, model: PhysicalLightModel, time: TimeBand, space: LightingSpace, detail: string];

export interface PhysicalLightingOption {
  readonly familyId: SceneFamilyId;
  readonly labelAR: string;
  readonly model: PhysicalLightModel;
  readonly time: TimeBand;
  readonly space: LightingSpace;
  readonly detail: string;
}

const PHYSICAL_LIGHTING_LIBRARY = {
  'military-base': [
    ['ضوء نهاري من النافذة', 'window', 'day', 'indoor', 'Actual office window, lateral illumination across desk and face; avoid sunbeams in windowless rooms.'],
    ['ضوء نافذة الممر المنتشر', 'window', 'day', 'indoor', 'Side-lit administrative corridor with a real exterior-facing window opening.'],
    ['إضاءة مكتب فلورسنت', 'fluorescent', 'any', 'indoor', 'Ordinary operational office tube or panel, no dramatic flicker.'],
    ['إنارة LED مكتبية محايدة 4000K', 'ceiling', 'any', 'indoor', 'Neutral-white suspended or recessed office luminaire; color is fixture-dependent.'],
    ['إضاءة ممرات متوازية', 'fluorescent', 'any', 'indoor', 'Repeated overhead corridor fixtures with physically separated pools of light.'],
    ['إنارة غرفة اجتماعات سقفية', 'ceiling', 'any', 'indoor', 'Usual meeting room ceiling fixtures casting table and chair contact shadows.'],
    ['مصباح عمل جانبي فوق المكتب', 'local-lamp', 'any', 'indoor', 'One practical desk lamp; concentrated light on nearby hands and documents.'],
    ['إنارة غرفة انتظار دافئة', 'ceiling', 'any', 'indoor', 'Warm general indoor lighting without theatrical accents.'],
    ['ظل مظلة المدخل بضوء السماء', 'sky-shade', 'day', 'outdoor', 'Covered administrative entrance: skylight and floor/wall bounce from outside the canopy.'],
    ['مصباح جداري عند مدخل المبنى ليلاً', 'outdoor-practical', 'night', 'outdoor', 'A real mounted entrance luminaire, not floating fill.']
  ],
  'saudi-outdoor': [
    ['شمس الظهر المباشرة', 'sun-hard', 'midday', 'outdoor', 'High sun, short pavement/face shadows, ordinary Saudi midday exposure.'],
    ['شمس صباح جانبية', 'sun-low', 'morning', 'outdoor', 'Morning sunlight from one consistent horizonward side with a real sky fill.'],
    ['ضوء العصر المائل', 'sun-low', 'afternoon', 'outdoor', 'Oblique afternoon sun and uneven facade shade.'],
    ['ضوء الغروب الطبيعي', 'sun-low', 'sunset', 'outdoor', 'Low solar direction only while the sun remains above the horizon; no false orange filter.'],
    ['ظل مبنى مفتوح على السماء', 'sky-shade', 'day', 'outdoor', 'Shade under genuine building occlusion, filled by visible sky.'],
    ['ارتداد الشمس من سور فاتح', 'wall-bounce', 'day', 'outdoor', 'Nearby pale plaster wall reflects sunlight into the shaded side of the face.'],
    ['إنارة شارع دافئة', 'outdoor-practical', 'night', 'outdoor', 'Actual overhead streetlight at plausible distance, asphalt markedly darker away from it.'],
    ['إنارة موقف سيارات LED بيضاء', 'outdoor-practical', 'night', 'outdoor', 'Visible parking or canopy-mounted white LED with downward cutoff.'],
    ['إنارة واجهة محل متسربة للرصيف', 'shop-spill', 'night', 'outdoor', 'Actual illuminated shop entrance casting a lateral pool on the pavement.'],
    ['مصباح بوابة منزل ليلي', 'outdoor-practical', 'night', 'outdoor', 'Wall-mounted residential gate light with strong localized falloff.']
  ],
  'car': [
    ['ضوء نهاري طبيعي', 'vehicle-day', 'day', 'indoor', 'Daylight enters a stationary cabin via windscreen and side windows.'],
    ['شمس الظهر عبر زجاج السيارة', 'vehicle-day', 'midday', 'indoor', 'High midday sun is cut by roof and window pillars, not uniformly frontal.'],
    ['ضوء موقف مظلل عبر النوافذ', 'vehicle-day', 'day', 'indoor', 'Car under real shade; diffuse skylight enters through glazing.'],
    ['ضوء الغروب عبر النافذة الجانبية', 'vehicle-day', 'sunset', 'indoor', 'Low lateral sun through one side window with plausible pillar occlusion.'],
    ['إضاءة الشارع عبر زجاج السيارة', 'vehicle-exterior', 'night', 'indoor', 'Nearby streetlamp spills through side glass of parked car.'],
    ['إنارة سقف موقف عبر الزجاج', 'vehicle-exterior', 'night', 'indoor', 'Overhead parking-canopy lamp enters windshield and windows.'],
    ['إضاءة داخل السيارة', 'vehicle-dashboard', 'night', 'indoor', 'Dashboard and instrument illumination stays weak and local to cabin surfaces.'],
    ['وهج شاشة العدادات الخافت', 'vehicle-dashboard', 'night', 'indoor', 'Instrument cluster is a weak, low frontal source, not broad studio fill.'],
    ['ظل نهاري بجانب السيارة من الخارج', 'sky-shade', 'day', 'outdoor', 'Subject physically outside near a parked vehicle, lit by sky in real shade.'],
    ['إنارة موقف ليلي بجانب السيارة', 'outdoor-practical', 'night', 'outdoor', 'Subject outside by parked vehicle, illuminated by actual parking fixture.'],
    ['إضاءة شاشة الهاتف فقط', 'phone-screen', 'night', 'indoor', 'Only the active smartphone screen illuminates the face and nearest fingers at selfie distance. All ceiling, bedside, dashboard and exterior lights stay off; background is very dark, with weak nearby fabric bounce and rapid falloff, not a bright room.']
  ],
  'living-room': [
    ['ضوء نافذة الصالة النهاري', 'window', 'day', 'indoor', 'Window daylight falls directionally on sofa and subject.'],
    ['ضوء نهاري طبيعي', 'window', 'day', 'indoor', 'Soft open-sky light enters through an actual exterior opening.'],
    ['إضاءة سقف دافئة 3000K', 'ceiling', 'any', 'indoor', 'Warm domestic ceiling LED with ordinary face and furniture shadows.'],
    ['إضاءة سقف محايدة 4000K', 'ceiling', 'any', 'indoor', 'Neutral overhead fixture preserves natural skin color without retouching.'],
    ['إضاءة سقف أبيض 5000K', 'ceiling', 'any', 'indoor', 'Cool-neutral ceiling fixture; no artificial blue color grade.'],
    ['مصباح جانبي قرب الكنبة', 'local-lamp', 'any', 'indoor', 'One side-table lamp emits locally with predictable shade occlusion.'],
    ['إنارة جدارية دافئة', 'local-lamp', 'any', 'indoor', 'Wall sconce produces localized falloff and wall bounce.'],
    ['إنارة سقفية غير مباشرة', 'ceiling', 'any', 'indoor', 'Existing coving or diffused ceiling light, no floating strip without installed fixture.'],
    ['وهج تلفاز منخفض ليلاً', 'local-lamp', 'night', 'indoor', 'Subtle changing TV luminance only on nearby skin and upholstery; room stays dim.'],
    ['إنارة ليلية مختلطة', 'ceiling', 'night', 'indoor', 'A real ceiling fixture with weaker adjacent domestic lamp; no unexplained colored rim.'],
    ['إضاءة شاشة الهاتف فقط', 'phone-screen', 'night', 'indoor', 'Only the active smartphone screen illuminates the face and nearest fingers at selfie distance. All ceiling, bedside, dashboard and exterior lights stay off; background is very dark, with weak nearby fabric bounce and rapid falloff, not a bright room.']
  ],
  'bedroom': [
    ['ضوء نافذة غرفة النوم', 'window', 'day', 'indoor', 'Daylight enters a real bedroom window, partly softened by curtains if present.'],
    ['ضوء صباح منتشر من الستارة', 'window', 'morning', 'indoor', 'Morning light diffused through an actual curtain, not a glowing wall.'],
    ['إضاءة سقف دافئة 3000K', 'ceiling', 'any', 'indoor', 'Warm ceiling fixture casts modest shadow under brow and bed edge.'],
    ['إضاءة سقف محايدة 4000K', 'ceiling', 'any', 'indoor', 'Installed neutral-white ceiling light with plausible room bounce.'],
    ['إضاءة سقف أبيض 5000K', 'ceiling', 'any', 'indoor', 'Cool-neutral ceiling LED with realistic facial direction and bedding texture.'],
    ['إضاءة سقف باردة 6500K', 'ceiling', 'any', 'indoor', 'Cool daylight-white LED, no exaggerated blue skin or CGI smoothness.'],
    ['إضاءة أباجورة دافئة', 'local-lamp', 'any', 'indoor', 'Bedside shade creates warm local pool and rapid falloff across mattress.'],
    ['مصباح قراءة قرب السرير', 'local-lamp', 'any', 'indoor', 'Real reading lamp angled downward over pillow and hands.'],
    ['إنارة ممر متسربة من باب الغرفة', 'local-lamp', 'night', 'indoor', 'Light spills through a genuinely open bedroom door, sharply bounded by jamb.'],
    ['سقف غرفة النوم مع أباجورة جانبية', 'ceiling', 'night', 'indoor', 'Existing ceiling luminaire leads while a weaker bedside practical adds local warm fill.'],
    ['إضاءة شاشة الهاتف فقط', 'phone-screen', 'night', 'indoor', 'Only the active smartphone screen illuminates the face and nearest fingers at selfie distance. All ceiling, bedside, dashboard and exterior lights stay off; background is very dark, with weak nearby fabric bounce and rapid falloff, not a bright room.']
  ],
  gym: [
    ['ضوء نهاري طبيعي', 'window', 'day', 'indoor', 'Daylight enters from an actual gym exterior opening, not a synthetic softbox.'],
    ['ضوء نافذة النادي المائل', 'window', 'afternoon', 'indoor', 'Real side window creates angled daylight and equipment shadows.'],
    ['إضاءة النادي الرياضي', 'ceiling', 'any', 'indoor', 'Ordinary high-bay or recessed gym fixtures with top-down shadows.'],
    ['LED محايد فوق منطقة الأثقال', 'ceiling', 'any', 'indoor', 'White LED fixtures overhead, ordinary matte metal and rubber reflections.'],
    ['إنارة موزعة فوق الأجهزة', 'ceiling', 'any', 'indoor', 'Multiple installed ceiling units separated in space, no floating highlights.'],
    ['إنارة فلورسنت داخلية', 'fluorescent', 'any', 'indoor', 'Real overhead tube units with ordinary indoor color response.'],
    ['ضوء علوي فوق مقعد التمرين', 'ceiling', 'any', 'indoor', 'Existing luminaire above training bench, occluded by body and equipment.'],
    ['إنارة ممر النادي الجانبية', 'fluorescent', 'any', 'indoor', 'Ceiling corridor lighting spills through a visible gym doorway.'],
    ['LED سقفي ينعكس في المرآة', 'ceiling', 'any', 'indoor', 'Mirror reflects installed fixtures; the mirror is not a second light emitter.'],
    ['ضوء النادي المسائي المحايد', 'ceiling', 'night', 'indoor', 'Neutral installed lamps dominate a gym after dark; exterior windows stay dark.']
  ]
} as const satisfies Record<SceneFamilyId, readonly LightingRow[]>;

// Materialize records with one coherent representation across UI, validation and prompt physics.
const materialize = (familyId: SceneFamilyId): readonly PhysicalLightingOption[] =>
  PHYSICAL_LIGHTING_LIBRARY[familyId].map(([labelAR, model, time, space, detail]) =>
    ({ familyId, labelAR, model, time, space, detail }));

export const LIGHTING_CATALOG: Record<SceneFamilyId, readonly PhysicalLightingOption[]> = {
  'military-base': materialize('military-base'),
  'saudi-outdoor': materialize('saudi-outdoor'),
  car: materialize('car'),
  'living-room': materialize('living-room'),
  bedroom: materialize('bedroom'),
  gym: materialize('gym')
};

export function getPhysicalLightingOption(familyId: SceneFamilyId, label: string): PhysicalLightingOption | undefined {
  return LIGHTING_CATALOG[familyId].find(option => option.labelAR === label);
}

export function isPhysicalLightingCompatible(
  option: PhysicalLightingOption,
  time: LightingClock,
  isOutdoor?: boolean
): boolean {
  if (isOutdoor !== undefined && option.space !== 'either' &&
    (isOutdoor ? option.space !== 'outdoor' : option.space !== 'indoor')) return false;
  if (option.time === 'any') return true;
  if (option.time === 'day') return time !== 'night';
  if (option.time === 'evening') return time === 'sunset' || time === 'night';
  return option.time === time;
}

export function compatiblePhysicalLighting(
  familyId: SceneFamilyId, time: LightingClock, isOutdoor?: boolean
): readonly PhysicalLightingOption[] {
  return LIGHTING_CATALOG[familyId].filter(option => isPhysicalLightingCompatible(option, time, isOutdoor));
}
