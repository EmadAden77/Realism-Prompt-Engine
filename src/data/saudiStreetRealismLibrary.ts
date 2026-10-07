export type SaudiStreetRuleCategory =
  | 'asphalt'
  | 'sidewalk'
  | 'buildings'
  | 'disorder'
  | 'car-movement'
  | 'car-types'
  | 'license-plates'
  | 'people'
  | 'people-clothing'
  | 'golden-rules';

export interface SaudiStreetRuleItem {
  id: string;
  category: SaudiStreetRuleCategory;
  labelAR: string;
  prompt: string;
  autoEligible?: boolean;
}

export const SAUDI_STREET_REALISM_LIBRARY: SaudiStreetRuleItem[] = [
  { id:'ss_asphalt_general', category:'asphalt', labelAR:'اسفلت عام', autoEligible:true, prompt:'asphalt black oil stain rainbow sheen tire marks black skid marks cracked asphalt pothole small 5cm filled with dust water pooling low spots gravity speed bump yellow paint faded 50% worn tire rubber black streaks lane marking white faded chipped 30% dust layer 2mm sand accumulation gum black flattened old cigarette butt crushed filter bottle cap green tissue dirty' },
  { id:'ss_asphalt_detailed', category:'asphalt', labelAR:'اسفلت تفصيلي فيزيائي', prompt:'asphalt oil stain rainbow sheen tire marks black interlock at edge pump dusty hose price sign LED car headlight 6000K volumetric dust Mie brake 630nm bleed onto asphalt red convenience store fluorescent 6500K worker not looking car passing motion blur light trails 1/15s asphalt hot heat haze shimmer 45C summer' },
  { id:'ss_asphalt_internal_street', category:'asphalt', labelAR:'اسفلت حارة داخلي', autoEligible:true, prompt:'interior street asphalt speed bump wall fence modern AC unit steam light pollution dome orange-brown no stars asphalt cracked weed growing between cracks gum black flattened cigarette butt bottle cap' },
  { id:'ss_asphalt_interlock_parking', category:'asphalt', labelAR:'اسفلت مواقف انترلوك', autoEligible:true, prompt:'interlock uneven one lifted 5mm cracked tile with weed small green growing between grooves gum black flattened old cigarette butt crushed filter bottle cap green tissue dirty dust accumulation grooves water pooling low spots gravity reflecting sodium orange streaks elongated distorted tile edges oil stain rainbow sheen footprint dust sandal pattern AC water stain dark streak wall electricity meter box green water meter interlock compressed under car tire weight 2mm lower wall paint peeling chipped cement shoe rack broom dust layer 2mm' },

  { id:'ss_sidewalk_interlock', category:'sidewalk', labelAR:'رصيف انترلوك عام', autoEligible:true, prompt:'interlock parking uneven one lifted 5mm cracked tile with weed small green growing between grooves gum black flattened old cigarette butt crushed filter bottle cap green tissue dirty dust accumulation grooves water pooling low spots gravity reflecting sodium orange streaks elongated distorted tile edges oil stain rainbow sheen footprint dust sandal pattern AC water stain dark streak wall' },
  { id:'ss_sidewalk_tactile', category:'sidewalk', labelAR:'رصيف بلاط أصفر للمكفوفين', prompt:'yellow tactile tiles for blind with grey interlock around, gum black flattened, cigarette butt, bottle cap, metal bench with light rust, palm dust frond, overflowing trash bin, mixed LED 4000K and sodium 2700K only when both fixtures are physically present, double shadows crossing ground, localized wet reflection, weed between tiles, background walker and child scooter motion blur' },
  { id:'ss_sidewalk_walkway', category:'sidewalk', labelAR:'رصيف ممشى - تفاصيل أرضية', autoEligible:true, prompt:'ground micro-topography interlock uneven one lifted 5mm compressed under car tire weight 2mm lower cracked tile with weed small green growing between grooves gum black flattened old cigarette butt crushed filter bottle cap green tissue dirty dust accumulation grooves water pooling low spots gravity reflecting sodium orange streaks elongated distorted tile edges oil stain rainbow sheen footprint dust sandal pattern' },
  { id:'ss_sidewalk_building_entry', category:'sidewalk', labelAR:'رصيف مدخل عمارة', prompt:'building entrance interlock tiles shoe rack outside broom elevator tiles beige glossy wall paint peeling motion sensor LED 4000K emergency green 520nm box' },
  { id:'ss_sidewalk_broken_tile', category:'sidewalk', labelAR:'رصيف مع بلاط مكسور', autoEligible:true, prompt:'interlock cracked tile with weed small green growing between grooves gum black flattened old cigarette butt crushed filter bottle cap green tissue dirty dust accumulation grooves water pooling low spots gravity reflecting sodium orange streaks elongated distorted tile edges oil stain rainbow sheen footprint dust sandal pattern' },

  { id:'ss_building_peeling_wall', category:'buildings', labelAR:'جدار متقشر عام', autoEligible:true, prompt:'wall paint peeling chipped near AC exposing cement AC water stain dark streak wall rust electricity box green outside interlock parking uneven one lifted 5mm weed small green growing between grooves dust layer 2mm sand accumulation shoe rack broom' },
  { id:'ss_building_villa', category:'buildings', labelAR:'جدار فيلا', autoEligible:true, prompt:'villa private 2 floors off-white walls paint peeling chipped near AC exposing cement AC water stain dark streak wall rust floor tiles 60x60 beige glossy grout dust accumulation grooves garage ceiling white paint cracked hairline AC outdoor units vibration blur 2mm electricity box green outside interlock parking dust layer 2mm sand accumulation' },
  { id:'ss_building_apartment', category:'buildings', labelAR:'عمارة سكنية', autoEligible:true, prompt:'building apartment 3 floors off-white walls paint peeling chipped near AC exposing cement AC water stain dark streak wall rust electricity box green outside interlock parking uneven one lifted 5mm weed small green growing between grooves dust layer 2mm sand accumulation shoe rack outside broom elevator tiles beige glossy' },
  { id:'ss_building_modern_wall_ac', category:'buildings', labelAR:'سور حديث + مكيف', autoEligible:true, prompt:'wall fence modern AC unit wall paint peeling chipped near AC exposing cement AC water stain dark streak wall rust AC outdoor units vibration blur 2mm' },
  { id:'ss_building_rooftop', category:'buildings', labelAR:'سطح - خزان وستالايت', prompt:'rooftop water tank plastic white dusty satellite dishes dusty AC outdoor units vibration blur 2mm rust on metal antenna wall paint peeling chipped city light pollution dome orange-brown distant LED 4000K from street below sodium 2700K cone distant wind 8km/h stronger tips 15deg breath vapor 20cm only when cold weather exists' },
  { id:'ss_building_rooftop_antenna', category:'buildings', labelAR:'سطح - صدأ انتينا', prompt:'rooftop rust on metal antenna wall paint peeling chipped city light pollution dome orange-brown distant LED 4000K from street below sodium 2700K cone distant AC outdoor units vibration blur 2mm' },
  { id:'ss_building_balcony', category:'buildings', labelAR:'بلكونة', prompt:'balcony tiles beige railing metal rust palm tree outside dust frond interlock outside dusty wall paint peeling dust layer 2mm old HPS sodium 2700K outside plus warm decorative 3000K under eaves only when both sources are visible' },
  { id:'ss_building_garage', category:'buildings', labelAR:'كراج داخلي', prompt:'garage indoor closed concrete floor oil stain rainbow sheen tire marks black dust layer 2mm ordinary white sedan with sun-faded dust and wiper arcs fine scratches tire compression license plate dusty tools wall single warm bulb 2700K' },
  { id:'ss_building_gas_station', category:'buildings', labelAR:'محطة بنزين مبنى', prompt:'gas station building LED 4500K bright even with separate sodium 2700K only where fixtures are visible, asphalt oil stain rainbow sheen tire marks black interlock at edge pump dusty hose price sign LED' },
  { id:'ss_building_baqala', category:'buildings', labelAR:'بقالة واجهة', autoEligible:true, prompt:'baqala entrance fluorescent 6500K inside fridge hum light flicker glass door reflection street behind shopping carts rust plastic crates poster faded tape peeling AC water stain interlock oily bottle caps tissue floor mat dirty sandy half-closed shutter delivery bike' },

  { id:'ss_disorder_general', category:'disorder', labelAR:'فوضى عامة شارع سعودي', autoEligible:true, prompt:'street chaos restrained to visible frame: trash bin overflowing plastic crates poster faded tape peeling shopping carts rust AC water stain dark streak wall interlock oily bottle caps tissue floor mat dirty sandy gum black flattened old cigarette butt crushed filter bottle cap green tissue dirty dust accumulation grooves weed small green growing between grooves plastic bag white stuck fence flapping in wind' },
  { id:'ss_disorder_parking', category:'disorder', labelAR:'زبالة مواقف', autoEligible:true, prompt:'parking disorder restrained to one or two visible cues: gum black flattened, old cigarette butt, crushed filter, bottle cap, green tissue, dust in grooves, localized oil stain rainbow sheen, footprint dust sandal pattern, AC water stain dark streak wall' },
  { id:'ss_disorder_baqala', category:'disorder', labelAR:'بقالة فوضى', autoEligible:true, prompt:'baqala lived-in disorder: shopping cart rust, plastic crates, faded poster with peeling tape, AC water stain, oily interlock, bottle caps, tissue, dirty sandy floor mat, half-closed shutter, delivery bike' },
  { id:'ss_disorder_tire_shop', category:'disorder', labelAR:'بنشر + بوفيه حي + مغسلة', prompt:'tire shop buffet car wash interlock oily bottle caps tissue floor mat dirty sandy tire shop tools oil stain rainbow sheen car jack dusty' },
  { id:'ss_disorder_vegetable_kiosk', category:'disorder', labelAR:'كشك خضار', prompt:'vegetable kiosk plastic crates poster faded tape peeling AC water stain interlock oily vegetable boxes dusty' },
  { id:'ss_disorder_park', category:'disorder', labelAR:'حديقة حي فوضى', autoEligible:true, prompt:'neighborhood park rest area bench interlock dusty palm tree dust frond trash bin overflowing palm frond dust interlock dusty' },
  { id:'ss_disorder_playground', category:'disorder', labelAR:'ملعب حارة', prompt:'playground interlock dusty goal posts palm tree dust frond trash bin bench metal rust' },

  { id:'ss_car_motion_general', category:'car-movement', labelAR:'حركة سيارات عامة', autoEligible:true, prompt:'background car movement with physically local motion blur around 1/15s only when shutter and low light justify it, headlight 6000K low-beam cutoff, brake red 630nm localized spill on nearby asphalt, airborne dust visible in the beam only when dusty haze exists' },
  { id:'ss_car_motion_fast', category:'car-movement', labelAR:'سيارة تمر بسرعة - ضوء طويل', prompt:'car passing motion blur light trails 1/15s car headlight 6000K low beam cutoff red brake 630nm localized spill on asphalt and nearby surfaces only when geometry permits' },
  { id:'ss_car_motion_idle', category:'car-movement', labelAR:'سيارة واقفة - محرك شغال', autoEligible:true, prompt:'car parked engine running, faint exhaust heat shimmer over asphalt when temperature differential permits, subtle body vibration, AC humming, restrained alarm indicator reflection if visible' },
  { id:'ss_car_motion_brake', category:'car-movement', labelAR:'سيارة تفرمل - بريك أحمر', prompt:'brake light 630nm red localized spill onto asphalt and nearby lower garments only when the braking vehicle is behind or beside the subject' },
  { id:'ss_car_motion_headlight', category:'car-movement', labelAR:'إضاءة سيارة أمامية', prompt:'car LED headlight 6000K low beam cutoff, dust particles visible in beam only with explicit dusty haze, light reaching only surfaces inside the beam footprint' },
  { id:'ss_car_motion_pollution', category:'car-movement', labelAR:'إضاءة سيارة + تلوث ضوئي', prompt:'car headlight 6000K plus orange-brown urban light-pollution dome; phone fill only when the phone screen is actually an active visible source' },
  { id:'ss_car_motion_dust', category:'car-movement', labelAR:'حركة + غبار', prompt:'moving vehicle may disturb dust in the same resolved wind direction; plastic bag, light fabric, foliage and visible dust must share one coherent airflow direction' },

  { id:'ss_car_camry_2021', category:'car-types', labelAR:'كامري 2021 أبيض', autoEligible:true, prompt:'one white 2021 Toyota Camry, ordinary Saudi-market sedan, restrained sun fade, dust layer, wiper arc contrast, fine swirl scratches, realistic tire bulge and suspension load, dusty Saudi plate; never duplicate the same car' },
  { id:'ss_car_camry_dust', category:'car-types', labelAR:'كامري تفاصيل غبار وخدوش', prompt:'Camry dust layer and sand accumulation, wiper arc marks dusty versus clean, fine scratches and swirl marks, realistic tire bulge, suspension compression, dusty white Saudi plate' },
  { id:'ss_car_corolla', category:'car-types', labelAR:'كورولا', prompt:'one white Toyota Corolla with ordinary dust, restrained sun fading, wiper arcs, fine scratches, realistic tire compression and dusty Saudi plate' },
  { id:'ss_car_hilux', category:'car-types', labelAR:'هايلوكس غمارتين', autoEligible:true, prompt:'one white Hilux double cab, dusty bed and ordinary work-use wear, dust and sand accumulation, wiper arc contrast, fine scratches, realistic tire bulge and suspension load, dusty Saudi plate' },
  { id:'ss_car_landcruiser', category:'car-types', labelAR:'لاندكروزر', prompt:'one white Land Cruiser with ordinary road dust, restrained sun fade, wiper arcs, fine scratches, realistic tire compression and dusty Saudi plate' },
  { id:'ss_car_yaris', category:'car-types', labelAR:'يارس', prompt:'one small white Toyota Yaris with ordinary dust, restrained sun fading, wiper arc contrast and fine scratches' },
  { id:'ss_car_accent', category:'car-types', labelAR:'اكسنت', prompt:'one small white Hyundai Accent sedan with ordinary dust, restrained sun fading and wiper arc contrast' },
  { id:'ss_car_delivery_bike', category:'car-types', labelAR:'دباب توصيل', autoEligible:true, prompt:'one dusty neighborhood delivery motorcycle with rear delivery box, secondary to subject and correctly grounded' },
  { id:'ss_car_wash_vehicle', category:'car-types', labelAR:'سيارة مغسلة', prompt:'car wash vehicle over interlock with localized soapy water and foam, water pooling only in low spots, sodium or practical reflection only from actual light sources' },

  { id:'ss_plate_general', category:'license-plates', labelAR:'لوحة سعودية بيضاء', autoEligible:true, prompt:'Saudi license plate: white plate with Arabic and English fields, green Saudi emblem/border treatment, dusty surface, black plastic frame and realistic mounting screws; do not force perfectly legible generated text' },
  { id:'ss_plate_detailed', category:'license-plates', labelAR:'لوحة سعودية تفصيلية', prompt:'dusty white Saudi plate with Arabic and English field layout, green emblem/border treatment, sand accumulation, black frame, mounting screws and restrained wear' },
  { id:'ss_plate_camry', category:'license-plates', labelAR:'لوحة كامري 2021', prompt:'dusty white Saudi plate on the Camry with Arabic/English field layout, green emblem/border treatment, black frame and dim plate illumination when night lighting permits' },
  { id:'ss_plate_dusty', category:'license-plates', labelAR:'لوحة مغبرة', prompt:'dusty Saudi plate with restrained sand accumulation and sun-faded surface; text need not be perfectly legible' },
  { id:'ss_plate_front_rear', category:'license-plates', labelAR:'لوحة أمامية + خلفية', prompt:'front and rear plates belong to the same vehicle and preserve the same plate identity when both are actually visible' },

  { id:'ss_people_general', category:'people', labelAR:'سلوك جمهور عام', autoEligible:true, prompt:'background people behave independently and are not camera-aware: one person may look at a phone, another may walk with slight motion softness, a worker may sweep, a pedestrian may react to an off-camera sound; avoid staged crowd symmetry' },
  { id:'ss_people_phone', category:'people', labelAR:'رجل يطالع جواله', autoEligible:true, prompt:'one background man looking at a phone, cool screen glow localized on face, not looking at the camera' },
  { id:'ss_people_child_camera', category:'people', labelAR:'طفل يطالع الكاميرا مباشر', prompt:'one child may briefly look directly at camera only when explicitly selected; do not make every background person camera-aware' },
  { id:'ss_people_woman_walk', category:'people', labelAR:'امرأة تمشي موشن بلور', autoEligible:true, prompt:'one background woman walking naturally, slight physically plausible motion softness, one foot briefly off ground, black abaya with gravity folds' },
  { id:'ss_people_worker_sweep', category:'people', labelAR:'عامل يكنس غبار', autoEligible:true, prompt:'one worker sweeping dust with broom, localized dust motes only where sweeping actually disturbs the ground' },
  { id:'ss_people_cat', category:'people', labelAR:'قطة تعبر انترلوك', autoEligible:true, prompt:'one cat crossing interlock with tail up, slight motion softness only if moving' },
  { id:'ss_people_sound', category:'people', labelAR:'شخص يلتفت لصوت', prompt:'one background person looking toward an off-camera sound rather than toward the camera' },
  { id:'ss_people_shop_worker', category:'people', labelAR:'عامل بقالة', autoEligible:true, prompt:'one store worker looking at shelf or task, not at camera, under actual shop fluorescent lighting' },
  { id:'ss_people_baqala', category:'people', labelAR:'ناس في بقالة', autoEligible:true, prompt:'small grocery background life: one customer on phone or moving through entrance, restrained secondary activity, no staged crowd' },
  { id:'ss_people_walkway_dog', category:'people', labelAR:'ممشى - كلب يمشي', prompt:'dog walking in background with handler, person not looking at camera, leash geometry physically connected, optional child scooter motion farther away' },
  { id:'ss_people_playground', category:'people', labelAR:'ملعب حارة - أطفال يلعبون', prompt:'children playing in distant background with ordinary motion softness, dusty interlock, goal posts and park fixtures secondary to subject' },
  { id:'ss_people_park', category:'people', labelAR:'حديقة حي - ناس جالسة', autoEligible:true, prompt:'neighborhood park people sitting or walking naturally, not looking at camera, small in scale and secondary' },
  { id:'ss_people_mosque_parking', category:'people', labelAR:'مواقف مسجد - ناس طالعة', prompt:'people exiting through parking naturally, footwear and entrance activity remain small background cues, no staged camera awareness' },
  { id:'ss_people_internal_street', category:'people', labelAR:'شارع داخلي - سيارة + شخص', autoEligible:true, prompt:'one person walking naturally and not looking at camera while one vehicle may pass in the road plane with restrained motion blur' },

  { id:'ss_clothing_thobe', category:'people-clothing', labelAR:'ثوب أبيض سعودي', autoEligible:true, prompt:'background white thobe with visible cotton micro-weave, natural gravity folds, mild button tension, seam puckering and restrained dust/lint appropriate to distance; no factory-perfect fabric' },
  { id:'ss_clothing_farwa', category:'people-clothing', labelAR:'ثوب شتوي + فروة', prompt:'heavy winter farwa with thick drape, gravity folds, fur trim and restrained lint; breath vapor or cold redness only when temperature state supports it' },
  { id:'ss_clothing_abaya', category:'people-clothing', labelAR:'عباية سوداء', autoEligible:true, prompt:'background black abaya, lightweight flowing fabric with natural gravity folds, subtle seam tension and restrained lint/dust, motion follows actual walking and wind direction' },
  { id:'ss_clothing_youth_jeans', category:'people-clothing', labelAR:'جينز + تيشيرت شباب', autoEligible:true, prompt:'background youth in dark slim jeans with natural ankle stacking, knee creases and pocket volume plus heavyweight cotton T-shirt with realistic collar ribbing, drape and mild wear' },
  { id:'ss_clothing_sports', category:'people-clothing', labelAR:'شورت + تيشيرت رياضي', prompt:'background athletic clothing: lightweight running shorts and polyester sports T-shirt with realistic mesh, sweat response and fabric motion only if the person is active' },
  { id:'ss_clothing_formal', category:'people-clothing', labelAR:'قميص رسمي + بنطلون', autoEligible:true, prompt:'background office worker in formal shirt and grey trousers with natural weave, button tension, pocket volume, crease and belt-loop tension' },
  { id:'ss_clothing_tracksuit', category:'people-clothing', labelAR:'بدلة رياضية', prompt:'background tracksuit with lightweight polyester drape, zipper, elastic waistband, ankle stacking and restrained logo wear' },
  { id:'ss_clothing_hoodie', category:'people-clothing', labelAR:'هودي + جينز + كاب', prompt:'background youth in heavyweight hoodie, dark jeans and baseball cap with believable fleece bulk, lint, denim creases and brim wear' },
  { id:'ss_clothing_worker', category:'people-clothing', labelAR:'ملابس عامل', autoEligible:true, prompt:'background worker uniform in lightweight blue polyester with gravity folds, pocket volume, ordinary dust and localized work wear' },
  { id:'ss_clothing_children', category:'people-clothing', labelAR:'ملابس أطفال', prompt:'background child clothing with ordinary cotton T-shirt and shorts, natural collar/hem deformation and movement-appropriate folds' },

  { id:'ss_gold_place', category:'golden-rules', labelAR:'مكان واحد فقط', autoEligible:true, prompt:'PLACE: keep exactly one selected physical place; never merge unrelated villa parking, grocery, gas station, park, or garage environments into one scene' },
  { id:'ss_gold_light', category:'golden-rules', labelAR:'إضاءة سببية فقط', autoEligible:true, prompt:'LIGHTING: use one dominant lighting system; multiple color temperatures are allowed only as physically separate visible practical sources with localized effects' },
  { id:'ss_gold_clothing', category:'golden-rules', labelAR:'لبس رئيسي واحد', autoEligible:true, prompt:'CLOTHING: the main subject wears one selected outfit only; never merge incompatible thobe, jeans, shorts, uniform, or sportswear sets' },
  { id:'ss_gold_car', category:'golden-rules', labelAR:'سيارة خلفية واحدة', autoEligible:true, prompt:'CAR: use at most one named background vehicle type unless scene controls explicitly request more; do not create a vehicle catalog in one frame' },
  { id:'ss_gold_crowd', category:'golden-rules', labelAR:'البشر غير واعين بالكاميرا', autoEligible:true, prompt:'CROWD: background people behave naturally and remain camera-unaware unless an explicit selected behavior says otherwise' },
  { id:'ss_gold_plate', category:'golden-rules', labelAR:'لوحة سعودية', autoEligible:true, prompt:'LICENSE PLATE: when a vehicle plate is visible, use a plausible dusty Saudi white plate layout with Arabic/English fields and green emblem treatment; do not rely on perfect generated text' },
  { id:'ss_gold_chaos', category:'golden-rules', labelAR:'فوضى وغبار مشروطان', autoEligible:true, prompt:'CHAOS: add only one or two visible place-appropriate dust, wear, litter, weed, oil, footprint, or service-hardware cues when disorder level and framing permit; never coat every surface uniformly' },
  { id:'ss_gold_sky', category:'golden-rules', labelAR:'سماء ليلية بتلوث ضوئي', autoEligible:true, prompt:'SKY: urban night sky may show orange-brown light-pollution haze with weak or absent stars when the sky is actually in frame' },
  { id:'ss_gold_secondary_light', category:'golden-rules', labelAR:'إضاءة ثانوية سببية', autoEligible:true, prompt:'SECONDARY LIGHT: secondary phone, headlight, brake, storefront, or LED spill affects only body/surfaces inside the actual light path and geometry' },
  { id:'ss_gold_depth', category:'golden-rules', labelAR:'بارالاكس عمق', autoEligible:true, prompt:'DEPTH: preserve real near/mid/far parallax; selfie hand/subject occupy near plane, any vehicle remains midground, poles/storefronts/buildings progressively farther, sky effectively at infinity' },
];

export const getSaudiStreetRule = (id: string): SaudiStreetRuleItem | undefined =>
  SAUDI_STREET_REALISM_LIBRARY.find(item => item.id === id);

export const getSaudiStreetRulesByCategory = (
  category: SaudiStreetRuleCategory
): SaudiStreetRuleItem[] =>
  SAUDI_STREET_REALISM_LIBRARY.filter(item => item.category === category);

export const SAUDI_STREET_RAW_FULL_EXAMPLE_REFERENCE = `
SAME FIXED HOME + LIGHTING + PLACE + CAR + PEOPLE + CLOTHING + FACE/HAIR/HAND + PHYSICS example supplied by the user.
This raw example is stored as source reference only and is NEVER auto-emitted because it intentionally contains multiple places, vehicles and light systems that conflict with the same source's golden one-place/one-car/causal-light rules.
`;
