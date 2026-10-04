export type SceneFamilyId = 'bedroom' | 'living-room' | 'saudi-outdoor' | 'gym' | 'car' | 'military-base';

export interface MicroLocation {
  id: string;
  labelAR: string;
  environmentPrompt: string;
  spatialBehavior: string;
  backgroundElements: string[];
  activity: string;
  lightingHints: string;
  isOutdoor: boolean;
}

export const MICRO_LOCATIONS: Record<SceneFamilyId, MicroLocation[]> = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. أماكن سعودية (saudi-outdoor) - EXACTLY 20
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'saudi-outdoor': [
    {
      id: 'so_villa_street',
      labelAR: 'شارع فلل سكني',
      environmentPrompt: 'ordinary residential Saudi villa street with boundary walls, metal vehicle gates, asphalt roadway, concrete curb edges, parked family SUV, exterior split AC compressor units mounted on walls, utility service box, and sparse residential planting',
      spatialBehavior: 'standing naturally on the side of the asphalt street near a residential wall, balanced camera height without wide-angle fish-eye distortion',
      backgroundElements: ['textured villa boundary wall with cream exterior finish', 'residential metal gate with subtle sun fading', 'concrete curb with mild pavement wear', 'ordinary parked family SUV in driveway bay', 'wall-mounted electrical service box'],
      activity: 'very low vehicular movement, quiet suburban residential rhythm',
      lightingHints: 'strong Saudi daylight with high sky illumination, sharp ground shadows, and pale wall bounce',
      isOutdoor: true
    },
    {
      id: 'so_modern_neighborhood',
      labelAR: 'حي سكني حديث',
      environmentPrompt: 'newer but ordinary Saudi residential neighborhood, contemporary low-rise houses, clean but not perfect paving, parked vehicles, boundary walls, simple landscaping, and realistic service infrastructure',
      spatialBehavior: 'natural eye-level street portrait framed against contemporary architectural planes with clean linear perspective',
      backgroundElements: ['contemporary low-rise villa facade with earth-tone finish', 'interlock paving sidewalk with subtle sand dusting', 'practical street light pole', 'asphalt residential roadway', 'underground utility service access cover'],
      activity: 'distant delivery motorcycle passing by slowly, calm everyday suburban rhythm',
      lightingHints: 'clear unsoftened Saudi daylight with soft bounce off warm-toned facade cladding',
      isOutdoor: true
    },
    {
      id: 'so_traditional_calm_street',
      labelAR: 'شارع سكني شعبي هادئ',
      environmentPrompt: 'older lived-in Saudi neighborhood street, mixed wall finishes, small signs of maintenance and aging, ordinary parked cars, uneven visual details, AC compressors, and surface utility infrastructure',
      spatialBehavior: 'grounded casual street posture against weathered wall, authentic neighborhood depth down the quiet road',
      backgroundElements: ['weathered plaster residential wall with surface utility conduits', 'wall-mounted exterior AC compressor unit', 'painted decorative metal door with minor paint wear', 'parked older sedan in shade', 'asphalt pavement with mild surface wear and dust marks'],
      activity: 'relaxed neighborhood street pace, quiet domestic stillness',
      lightingHints: 'diffused shadow zones cast by perimeter walls, warm ambient heat and sun-warmed surfaces',
      isOutdoor: true
    },
    {
      id: 'so_villa_entrance',
      labelAR: 'مدخل فيلا سكنية',
      environmentPrompt: 'realistic Saudi villa entrance with boundary wall, pedestrian door, vehicle gate, driveway transition, exterior light fixture, wall-mounted intercom panel, and believable material wear',
      spatialBehavior: 'subject positioned standing beside entrance threshold steps, framing includes door pillar and entrance light fixture',
      backgroundElements: ['residential metal pedestrian gate with brass handle', 'ceramic tile entrance threshold step', 'wall-mounted intercom and doorbell unit', 'practical exterior wall lantern', 'driveway transition to asphalt street'],
      activity: 'private residence frontage, calm domestic arrival moment',
      lightingHints: 'shielded ambient light under entrance overhang, contrasting with bright sunlit street beyond',
      isOutdoor: true
    },
    {
      id: 'so_house_perimeter_wall',
      labelAR: 'أمام سور منزل',
      environmentPrompt: 'ordinary residential boundary wall, gate details, pavement edge, utility and service elements, and physically plausible residential surroundings with textured Riyadh stone or stucco finish',
      spatialBehavior: 'standing comfortably beside the textured perimeter wall, linear vanishing lines of the wall extending into the background',
      backgroundElements: ['textured stone villa perimeter wall with neat mortar lines', 'narrow gravel ground strip along wall base', 'concrete curb border with tire scuffs', 'metal privacy louver screen topping wall', 'asphalt street lane with accumulated road dust'],
      activity: 'peaceful neighborhood perimeter, sparse background movement',
      lightingHints: 'direct directional sun raking across wall texture, casting crisp shadow lines',
      isOutdoor: true
    },
    {
      id: 'so_street_corner',
      labelAR: 'زاوية شارع داخل الحي',
      environmentPrompt: 'intersection of ordinary neighborhood streets with realistic curbs, asphalt transitions, parked vehicles, boundary walls, convex traffic mirror on pole, and believable neighborhood depth',
      spatialBehavior: 'subject angled slightly at the turn of the intersection, visual depth leading in two roadway directions',
      backgroundElements: ['corner curved concrete curb with yellow and black paint', 'convex road safety mirror on steel pole', 'villa compound walls framing corner', 'asphalt turn lane with dusty tire marks', 'parked sedan visible down the side street'],
      activity: 'distant car turning the corner at low speed, gentle suburban activity',
      lightingHints: 'unobstructed open sky illumination with cross-directional ground bounce',
      isOutdoor: true
    },
    {
      id: 'so_residential_sidewalk',
      labelAR: 'رصيف شارع سكني',
      environmentPrompt: 'Saudi residential pavement and curb edge with asphalt roadway, villa boundary walls, metal gates, parked vehicles, interlock paving, and ordinary neighborhood infrastructure',
      spatialBehavior: 'candid mid-stride or standing pause on sidewalk pavers, authentic arm-reach or candid bystander perspective',
      backgroundElements: ['interlock paving sidewalk with slight uneven settling', 'planted roadside tree in square soil opening with drip tube', 'concrete curb stone with asphalt transition', 'adjacent asphalt road lane with parked vehicle bumper', 'villa perimeter wall'],
      activity: 'occasional neighborhood resident walking in distance, quiet afternoon atmosphere',
      lightingHints: 'dappled sunlight filtering through sparse tree leaves onto pavers and clothing',
      isOutdoor: true
    },
    {
      id: 'so_local_commercial_street',
      labelAR: 'شارع تجاري محلي',
      environmentPrompt: 'ordinary local commercial street with small shopfronts, generic Arabic signage, parked vehicles, practical lighting, asphalt roadway, concrete curbs, and mild pedestrian activity',
      spatialBehavior: 'street-side perspective with commercial shopfront line running along the mid-ground, natural depth',
      backgroundElements: ['small neighborhood shop signboards with generic Arabic text', 'diagonal asphalt parking bays with painted white lines', 'parked compact utility car and sedan', 'concrete sidewalk step-up curb', 'external AC condenser rack on upper wall'],
      activity: 'customer entering a local store, delivery pickup truck idling nearby, everyday commercial rhythm',
      lightingHints: 'bright daytime reflection from storefront glass, or practical streetlights and shopfront signs at dusk',
      isOutdoor: true
    },
    {
      id: 'so_front_neighborhood_shops',
      labelAR: 'أمام محلات الحي',
      environmentPrompt: 'small neighborhood shops with realistic storefront glass, generic Arabic text, practical shop lighting, pavement walkway, rolled-down security shutters, and occasional customers or parked cars',
      spatialBehavior: 'standing in the shaded shopfront walkway, storefront reflections visible behind without distortion',
      backgroundElements: ['aluminum storefront glass frame with generic Arabic lettering', 'tiled commercial walkway with subtle wear', 'exterior split AC condenser units mounted above', 'parked compact car at storefront curb', 'window reflections of opposite street'],
      activity: 'store patron holding shopping bag in background, mundane neighborhood errands',
      lightingHints: 'shaded storefront canopy light with bright reflected street brightness outward',
      isOutdoor: true
    },
    {
      id: 'so_local_cafe_front',
      labelAR: 'أمام مقهى محلي',
      environmentPrompt: 'ordinary Saudi neighborhood café frontage, simple glazing, modest outdoor seating with small metal chairs and round table, customers secondary to the subject, parked vehicles, and practical lighting',
      spatialBehavior: 'positioned outside near the café entrance, casual relaxed posture, window reflection of the street opposite',
      backgroundElements: ['café glass facade with subtle dark frame and warm interior glow', 'simple dark metal outdoor bistro chair and compact table', 'disposable paper beverage cup', 'concrete planter with desert shrub', 'parked car in storefront bay'],
      activity: 'café patron enjoying drink at nearby table, relaxed informal neighborhood presence',
      lightingHints: 'warm interior practical lighting spilling through glass window contrasting with exterior ambient light',
      isOutdoor: true
    },
    {
      id: 'so_beside_baqala',
      labelAR: 'بجانب بقالة الحي',
      environmentPrompt: 'small Saudi neighborhood grocery frontage, generic Arabic signage, stacked ordinary commercial elements like water bottle crates, glass entry door with beverage decals, and parked delivery car',
      spatialBehavior: 'informal candid stance beside the grocery store entrance, ordinary authentic neighborhood life setting',
      backgroundElements: ['neighborhood grocery Arabic signboard above door', 'stacked plastic drinking water crates by entrance wall', 'glass sliding grocery entrance with beverage stickers', 'concrete entrance ramp with metal handrail', 'compact delivery car parked at curb'],
      activity: 'customer stepping out with grocery bag, everyday neighborhood routine',
      lightingHints: 'fluorescent shop signage glow combined with ambient daylight or street lighting',
      isOutdoor: true
    },
    {
      id: 'so_open_parking_lot',
      labelAR: 'موقف سيارات مفتوح',
      environmentPrompt: 'open Saudi parking area with asphalt, painted parking bays, ordinary vehicles (sedans and SUVs), wheel stops, surrounding ordinary buildings, dusty tire marks, and realistic sun or night lighting',
      spatialBehavior: 'open wide perspective, standing between parked vehicles, expansive sky visibility and genuine depth',
      backgroundElements: ['dark asphalt parking surface with faded painted bay lines', 'precast concrete wheel bumper stops with tire marks', 'parked family SUV and white sedan', 'tall commercial parking light pole with fixtures', 'ordinary surrounding building walls in distance'],
      activity: 'someone closing car trunk in distant parking row, driver starting vehicle',
      lightingHints: 'unobstructed full ambient daylight, specular highlights on car body panels and windshields',
      isOutdoor: true
    },
    {
      id: 'so_shaded_parking',
      labelAR: 'موقف مظلل',
      environmentPrompt: 'typical Saudi metal and fabric parking shade structures, asphalt roadway, painted parking bays, parked cars, structural canopy posts, strong daylight contrast outside the shade, and realistic dust',
      spatialBehavior: 'underneath tensile parking shade structure, dramatic shadow cut-off line on ground where shade meets direct sunlight',
      backgroundElements: ['arched beige fabric tensile parking canopy', 'cantilever steel support pole with mounting bolts', 'dark asphalt ground in cool shade', 'blinding sunlight glare on ground just outside canopy edge', 'adjacent parked car in bay'],
      activity: 'driver walking toward car with keys in hand, quiet sheltered parking area',
      lightingHints: 'soft diffused cool shade under canopy contrasting with intense blazing direct sunlight outside',
      isOutdoor: true
    },
    {
      id: 'so_service_side_road',
      labelAR: 'طريق خدمة جانبي',
      environmentPrompt: 'ordinary service road beside buildings with asphalt wear, loading and service access, curbs, service doors, AC equipment, electrical utility boxes, and sparse vehicle movement',
      spatialBehavior: 'standing on the elevated curb of the service lane, street vanishing point extending into background',
      backgroundElements: ['asphalt service road lane with asphalt patch lines', 'continuous concrete curb with painted yellow stripes', 'pad-mounted electrical utility box with warning sticker', 'rear commercial service door', 'low residential boundary wall in background'],
      activity: 'delivery van parked with hazard lights on, functional everyday urban activity',
      lightingHints: 'open road light, low atmospheric haze along the asphalt horizon',
      isOutdoor: true
    },
    {
      id: 'so_between_buildings_passage',
      labelAR: 'ممر جانبي بين المباني',
      environmentPrompt: 'narrow outdoor passage between buildings with textured walls, wall-mounted AC compressors, utility pipes, service doors, concrete paved ground, and constrained natural light',
      spatialBehavior: 'contained vertical perspective between two walls, restricted horizon, intimate architectural framing',
      backgroundElements: ['textured beige plaster building exterior walls', 'vertical PVC air-conditioning drainage pipe and conduits', 'wall-mounted exterior AC compressor unit on bracket', 'metal service utility door', 'narrow strip of desert sky overhead'],
      activity: 'quiet secluded residential alleyway, zero through-traffic',
      lightingHints: 'diffused bounced indirect daylight bouncing between walls, deep shadow floor with high wall highlights',
      isOutdoor: true
    },
    {
      id: 'so_public_neighborhood_park',
      labelAR: 'حديقة حي عامة',
      environmentPrompt: 'modest neighborhood park rather than a luxury landscaped park, interlocking paths, simple seating, grass or planted areas appropriate to Saudi maintenance conditions, date palms, and low perimeter fence',
      spatialBehavior: 'grounded outdoor park environment, subject standing beside walking track or bench, open park backdrop',
      backgroundElements: ['red interlock paver park walkway', 'maintained grass lawn patch with irrigation sprinkler head', 'ordinary date palm with trimmed lower fronds', 'painted metal municipal park bench', 'low green perimeter fence with villa walls beyond'],
      activity: 'families sitting on lawn in distance, quiet neighborhood recreational space',
      lightingHints: 'warm natural daylight, soft tree shadows across the interlocking brick path',
      isOutdoor: true
    },
    {
      id: 'so_neighborhood_walkway',
      labelAR: 'ممشى رياضي داخل الحي',
      environmentPrompt: 'ordinary neighborhood walking path with practical paving or rubberized surface, simple lighting, sparse landscaping, occasional walkers, distance markings, and surrounding residential context',
      spatialBehavior: 'candid athletic or walking stance on the dedicated pedestrian track, straight linear pathway perspective',
      backgroundElements: ['terracotta red rubberized running track with lane line', 'ground distance marker painted in Arabic', 'low solar pathway light bollards', 'sparse desert landscaping with gravel border', 'surrounding villa perimeter walls in distance'],
      activity: 'neighborhood resident in walking gear briskly walking in distance, active community rhythm',
      lightingHints: 'late afternoon golden hour light raking across track texture',
      isOutdoor: true
    },
    {
      id: 'so_small_neighborhood_plaza',
      labelAR: 'ساحة صغيرة داخل الحي',
      environmentPrompt: 'small everyday neighborhood open space surrounded by ordinary buildings, paving and asphalt transitions, parked vehicles, concrete seating blocks, and modest desert landscaping',
      spatialBehavior: 'subject standing within open paved plaza, architectural facades forming distant backdrop',
      backgroundElements: ['patterned concrete paving blocks with joint sand', 'low concrete seating cube', 'circular concrete planter with drought-tolerant desert shrub', 'surrounding residential wall and streetlamp', 'parked car at plaza perimeter'],
      activity: 'neighborhood residents gathering for casual evening chat, pleasant community space',
      lightingHints: 'wide open sky ambient radiosity bouncing off light concrete pavers',
      isOutdoor: true
    },
    {
      id: 'so_local_services_building',
      labelAR: 'أمام مبنى خدمات محلي',
      environmentPrompt: 'ordinary municipal or service-type building environment with practical entrance, parking stalls, accessibility ramp with stainless steel handrail, AC units, and pedestrian access without identifiable government branding',
      spatialBehavior: 'subject standing in front of entrance plaza or service ramp, civic public architecture background',
      backgroundElements: ['sand-colored tiled institutional facade with cream finish', 'concrete wheelchair ramp with stainless steel railing', 'automatic glass sliding entrance doors with privacy strip', 'designated parking stall with blue accessibility mark', 'exterior wall-mounted utility box'],
      activity: 'citizen walking out with official document folder, routine civic atmosphere',
      lightingHints: 'structured functional daylight, entrance overhang shadow with soft pale wall bounce',
      isOutdoor: true
    },
    {
      id: 'so_building_waiting_area',
      labelAR: 'منطقة انتظار أمام مبنى عادي',
      environmentPrompt: 'ordinary building frontage with simple entrance, shaded or exposed waiting area, metal waiting chairs, parked vehicles, pavement, and realistic daily activity',
      spatialBehavior: 'sitting or standing adjacent to public waiting seating, natural architectural enclosure',
      backgroundElements: ['perforated steel public waiting bench with grey paint', 'tiled exterior arcade floor with subtle foot traffic wear', 'bulletin notice board on wall', 'external electrical switch box and conduit', 'building entrance pillar with curb transition'],
      activity: 'person checking smartphone while seated on bench in background, routine municipal wait',
      lightingHints: 'shaded portico lighting with bright sunlit street glare in background',
      isOutdoor: true
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. مبنى عمل عسكري (military-base) - EXACTLY 20
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'military-base': [
    {
      id: 'mb_admin_office',
      labelAR: 'مكتب إداري عسكري',
      environmentPrompt: 'ordinary functional administrative office inside a Saudi government military facility, practical wood-laminate executive desk with desk blotter, desktop computer with wired keyboard, paper in-trays with correspondence, wall-mounted split AC unit, neutral cream walls with simple baseboard, and beige ceramic floor tiles with slight surface scuffs',
      spatialBehavior: 'seated behind or standing beside practical office desk, natural desk height in lower frame, realistic smartphone camera angle',
      backgroundElements: ['wood-laminate administrative desk with paper tray', 'desktop landline telephone with coiled handset cord', 'wall-mounted split AC unit with plastic conduit', 'grey metal 2-drawer side filing cabinet', 'beige tiled office floor with subtle scuffs'],
      activity: 'routine administrative paperwork, colleague walking past open doorway in background',
      lightingHints: 'recessed 60x60 fluorescent ceiling troffers providing neutral 4000K institutional light, subtle glare on desk laminate',
      isOutdoor: false
    },
    {
      id: 'mb_small_side_office',
      labelAR: 'مكتب جانبي صغير',
      environmentPrompt: 'compact subordinate administrative office, practical melamine computer workstation, standard LCD monitor and desktop tower, mousepad, desktop telephone, grey metal filing cabinet, cork bulletin board with duty rosters, and off-white walls',
      spatialBehavior: 'sitting at workstation desk, monitor corner and keyboard partially visible in near lower frame, authentic candid desk perspective',
      backgroundElements: ['compact melamine desk with desktop PC and realistic cabling', 'grey four-drawer metal filing cabinet with keys', 'cork pinboard with printed administrative schedules', 'office desk phone with coiled cord', 'suspended acoustic ceiling grid tiles'],
      activity: 'administrative paperwork processing, quiet desk routine',
      lightingHints: 'overhead fluorescent lighting combined with soft glow from computer screen',
      isOutdoor: false
    },
    {
      id: 'mb_interior_corridor',
      labelAR: 'ممر إداري داخلي',
      environmentPrompt: 'ordinary interior administrative corridor in a Saudi military headquarters, neutral beige 60x60 polished ceramic floor tiles, rows of closed wood-veneer office doors with aluminum room number plates, wall-mounted red fire extinguisher cabinet, and suspended acoustic ceiling tiles',
      spatialBehavior: 'standing in corridor with symmetric vanishing point receding down the hall, professional upright posture',
      backgroundElements: ['closed wood-veneer office doors with small aluminum number plates', 'polished beige ceramic floor tiles with faint reflections', 'wall-mounted fire hose cabinet', 'acoustic tile drop ceiling with recessed lighting troffers', 'recessed electrical utility panel'],
      activity: 'colleague walking away down the hallway in distance carrying paper folder, formal quiet institutional atmosphere',
      lightingHints: 'rhythmic overhead fluorescent panel illumination casting soft overlapping ground shadows',
      isOutdoor: false
    },
    {
      id: 'mb_office_front_hallway',
      labelAR: 'ممر أمام المكاتب',
      environmentPrompt: 'administrative hallway section right outside departmental office suites, printed paper administrative notices taped beside door frame, freestanding bottled water cooler unit with plastic cup dispenser, tiled floor, and baseboard moldings',
      spatialBehavior: 'standing near departmental entrance door, slight angular framing showing corridor wall',
      backgroundElements: ['department entrance door with simple aluminum handle', 'freestanding bottled water cooler with blue inverted bottle', 'administrative memo board with taped circulars', 'neutral painted wall with plastic conduit strip', 'ceramic floor tiles'],
      activity: 'person carrying paper folder entering adjacent door, everyday departmental rhythm',
      lightingHints: 'balanced interior fluorescent lighting, no harsh spotlighting',
      isOutdoor: false
    },
    {
      id: 'mb_in_front_office_door',
      labelAR: 'أمام باب المكتب',
      environmentPrompt: 'standing directly outside an administrative office door, standard brown solid-core door with brushed metal lever handle, small acrylic nameplate slot on wall with Arabic designation, light switch panel, and standard tiled corridor floor',
      spatialBehavior: 'subject standing squarely beside the door frame, vertical architectural lines framing the subject',
      backgroundElements: ['brown solid-core office door with aluminum kickplate', 'brushed metal door handle lever', 'small wall nameplate holder with Arabic text', 'light switch plate on wall', 'tiled floor with grouted seams'],
      activity: 'brief pause outside office before entering, quiet hallway ambiance',
      lightingHints: 'direct overhead corridor light, clear vertical door shadows',
      isOutdoor: false
    },
    {
      id: 'mb_beside_work_desk',
      labelAR: 'بجانب مكتب العمل',
      environmentPrompt: 'standing beside a functional administrative desk, standard black landline office phone with spiral cord, wire mesh pen cup with ballpoints, clear desk pad, stacked manila file folders, and edge of black fabric swivel desk chair',
      spatialBehavior: 'standing upright beside the desk edge, corner of desk and desktop accessories in lower third of frame',
      backgroundElements: ['desktop office landline phone with coiled cable', 'stacked beige and green administrative folders', 'mesh pencil holder with ballpoint pens and stapler', 'desktop calendar stand', 'office wall calendar'],
      activity: 'workday in progress, desk phone indicator light idling, authentic workplace clutter',
      lightingHints: 'overhead light reflecting faintly off desk varnish and phone screen',
      isOutdoor: false
    },
    {
      id: 'mb_admin_board',
      labelAR: 'أمام لوحة إدارية عامة',
      environmentPrompt: 'standing in front of a wall-mounted administrative announcement board in the hallway, aluminum frame with sliding glass panels, pinned duty schedules, printed circulars in Arabic, green felt backing, and institutional wall',
      spatialBehavior: 'subject standing centered or slightly off-center in front of the organizational display board',
      backgroundElements: ['aluminum-framed glass display case with pinned papers', 'duty roster printouts with Arabic headings', 'cream-painted hallway wall', 'floor baseboard skirting', 'light ceiling reflection on glass panel'],
      activity: 'quiet corridor setting, routine staff informational checkpoint',
      lightingHints: 'uniform ambient corridor light with faint glass reflection of opposing wall',
      isOutdoor: false
    },
    {
      id: 'mb_indoor_waiting_area',
      labelAR: 'منطقة انتظار داخلية',
      environmentPrompt: 'simple administrative waiting area near department reception, row of practical black faux-leather waiting chairs with chrome legs, small low wood-laminate coffee table with tissue box, ceramic tiled floor, and plain neutral wall',
      spatialBehavior: 'seated comfortably in armchair or standing in waiting lounge, relaxed yet respectful posture',
      backgroundElements: ['practical black faux-leather reception chairs', 'small square wood-laminate side table with tissue box', 'simple wall-mounted clock with Arabic numerals', 'ceramic floor tiles', 'reception counter corner in distance'],
      activity: 'visitor waiting quietly in distant chair, calm formal government lobby ambiance',
      lightingHints: 'ambient fluorescent lobby lighting with warm architectural downlights',
      isOutdoor: false
    },
    {
      id: 'mb_meeting_room',
      labelAR: 'غرفة اجتماعات عادية',
      environmentPrompt: 'ordinary administrative meeting room, rectangular wood-grain conference table, practical mesh-back swivel conference chairs, wall-mounted magnetic whiteboard with dry-erase markers in tray, and ceiling AC supply diffusers',
      spatialBehavior: 'sitting at the conference table or standing at the head of the room, spacious professional setting',
      backgroundElements: ['wood-grain conference table with center cable trough', 'black mesh-back swivel chairs', 'magnetic whiteboard with dry-erase markers', 'overhead square AC supply diffuser', 'neutral painted gypsum walls'],
      activity: 'empty meeting room between briefings, clean orderly state',
      lightingHints: 'recessed LED ceiling grid lighting providing crisp even illumination across the table',
      isOutdoor: false
    },
    {
      id: 'mb_office_window_corner',
      labelAR: 'زاوية بجانب نافذة المكتب',
      environmentPrompt: 'corner of an administrative office beside an aluminum-framed exterior window, beige horizontal venetian blinds partially tilted, view of courtyard and exterior AC compressor brackets outside, and plain desk corner',
      spatialBehavior: 'standing by the window, directional natural window daylight illuminating one side of the face and uniform',
      backgroundElements: ['aluminum window frame with beige horizontal venetian blinds', 'window sill with subtle dust layer', 'exterior building wall seen through blind slats', 'corner of office desk', 'textured cream wall'],
      activity: 'momentary pause looking toward window, quiet administrative contemplation',
      lightingHints: 'pronounced natural daylight entering through blinds creating horizontal light patterns and soft interior shadow falloff',
      isOutdoor: false
    },
    {
      id: 'mb_admin_building_entrance',
      labelAR: 'مدخل مبنى إداري',
      environmentPrompt: 'main entrance foyer of a Saudi administrative building, heavy double glass entrance doors with aluminum push-bars, polished granite entrance steps, ceiling security camera dome, and modest security scanner archway',
      spatialBehavior: 'standing in the entrance foyer, strong contrast between bright exterior outside glass and interior foyer',
      backgroundElements: ['double commercial glass entrance doors with frosted privacy band', 'granite floor tiles at threshold', 'entrance security metal detector frame', 'wall-mounted digital clock', 'exterior light flooding through doors'],
      activity: 'personnel arriving for shift with badge lanyard, routine entrance flow',
      lightingHints: 'intense bright natural outdoor sunlight backlighting through glass doors, balanced with interior overhead ceiling fixtures',
      isOutdoor: false
    },
    {
      id: 'mb_outdoor_building_walkway',
      labelAR: 'ممر خارجي للمبنى',
      environmentPrompt: 'shaded concrete colonnade walkway running along the side of the administrative building, square concrete pillars with light cream paint, outdoor interlocking concrete pavers, wall-mounted electrical conduit, and outdoor split AC compressor on steel bracket',
      spatialBehavior: 'walking or standing between exterior pillars, rhythm of repeated architectural columns in background',
      backgroundElements: ['square concrete support columns with light paint', 'concrete interlock paver walkway', 'wall-mounted outdoor AC compressor unit', 'curb transition to asphalt parking area', 'beige painted building exterior wall'],
      activity: 'uniformed personnel walking in adjacent covered walkway, calm official campus',
      lightingHints: 'shaded portico daylight with strong outdoor ambient brightness reflected from ground',
      isOutdoor: true
    },
    {
      id: 'mb_building_facade',
      labelAR: 'أمام واجهة المبنى',
      environmentPrompt: 'exterior in front of an ordinary Saudi administrative building facade, light cream stucco exterior finish, uniform rectangular windows with exterior aluminum sun-louvers, concrete curb, and asphalt access lane with painted yellow curb stripes',
      spatialBehavior: 'standing in open forecourt, building facade providing realistic administrative backdrop',
      backgroundElements: ['cream stucco institutional building facade', 'window frames with exterior aluminum sun louvers', 'concrete curb with yellow and black paint', 'smooth dark asphalt with slight dust marks', 'small utility electrical box on wall'],
      activity: 'parked staff car in driveway lane, calm official facility grounds',
      lightingHints: 'direct strong Saudi sunlight casting sharp diagonal shadows down building facade and ground',
      isOutdoor: true
    },
    {
      id: 'mb_beside_stairs',
      labelAR: 'بجانب درج المبنى',
      environmentPrompt: 'interior staircase landing of the administrative building, polished precast terrazzo stair treads with black anti-slip grooves, brushed aluminum handrail, cream wall, and service access panel under stairs',
      spatialBehavior: 'standing near the bottom or middle landing of the staircase, diagonal stair line adding architectural dynamic',
      backgroundElements: ['terrazzo stair steps with rubber tread strips', 'aluminum tubular staircase railing', 'under-stair storage door', 'tiled floor landing', 'stairwell wall light fixture'],
      activity: 'staff member descending stairs in background blur, clean functional government facility',
      lightingHints: 'recessed wall step lights and overhead foyer illumination',
      isOutdoor: false
    },
    {
      id: 'mb_entrance_canopy',
      labelAR: 'تحت مظلة المدخل',
      environmentPrompt: 'underneath the cantilevered entrance portico of the administrative facility, drop-off driveway with worn asphalt, concrete curb, yellow-painted wheel stops, automatic sliding entrance doors, and exterior LED downlights under canopy',
      spatialBehavior: 'sheltered under the wide architectural canopy, threshold between indoor and outdoor',
      backgroundElements: ['underside of concrete entrance canopy with recessed LED fixtures', 'drop-off lane asphalt with faint tire marks', 'concrete curb edge', 'glass automatic entrance doors', 'distant parking lot'],
      activity: 'official white sedan parked momentarily in drop-off bay, personnel entering',
      lightingHints: 'cool shaded ceiling canopy light contrasting with brilliant exterior daylight beyond',
      isOutdoor: true
    },
    {
      id: 'mb_admin_courtyard',
      labelAR: 'ساحة داخلية إدارية',
      environmentPrompt: 'inner open courtyard surrounded by administrative building wings, grey and beige interlocking concrete paving blocks, low concrete planter border with sparse drought-tolerant shrubs, and tinted office windows on surrounding walls',
      spatialBehavior: 'standing in the open courtyard space, surrounded by functional low-rise building wings',
      backgroundElements: ['interlocking concrete paver floor', 'surrounding administrative building walls with tinted glass', 'concrete garden bed curb with desert shrubs', 'outdoor utility junction box', 'clear sky overhead'],
      activity: 'colleagues conversing in shade of opposite wing, quiet campus atmosphere',
      lightingHints: 'direct overhead desert sunlight with rich ambient bounce from light-toned facade walls',
      isOutdoor: true
    },
    {
      id: 'mb_staff_parking',
      labelAR: 'موقف موظفين',
      environmentPrompt: 'designated employee asphalt parking area at a Saudi administrative facility, arched beige tensile fabric parking canopies, rows of parked white and silver sedans and SUVs, painted yellow stall lines, and concrete wheel stops with tyre marks',
      spatialBehavior: 'standing between parked employee vehicles in parking aisle, authentic workplace environment',
      backgroundElements: ['curved beige fabric parking shade canopy', 'painted yellow parking bay markings on asphalt', 'parked official white SUV and silver sedan', 'concrete wheel stops with tire scuffs', 'industrial light pole'],
      activity: 'employee walking toward vehicle with keys in hand, shift transition movement',
      lightingHints: 'harsh outdoor midday sun with deep shadow pools under parking canopies',
      isOutdoor: true
    },
    {
      id: 'mb_beside_parked_car',
      labelAR: 'بجانب سيارة متوقفة في الموقف',
      environmentPrompt: 'standing beside an ordinary parked white sedan in the facility parking lot, vehicle door panel with subtle road dust on lower rocker panel, yellow painted parking line on asphalt, and neighboring parking canopy post',
      spatialBehavior: 'casual stance leaning near or standing beside the car door, realistic everyday vehicle scale',
      backgroundElements: ['white sedan side door panel and exterior handle', 'dark tinted car window with sky reflection', 'asphalt pavement with yellow painted stall line', 'concrete wheel stop', 'steel shade structure pillar'],
      activity: 'routine moment after parking before heading into the office',
      lightingHints: 'specular reflection of bright sky on car hood, sharp contact shadow under car chassis',
      isOutdoor: true
    },
    {
      id: 'mb_passage_between_buildings',
      labelAR: 'ممر بين المباني الإدارية',
      environmentPrompt: 'exterior paved alleyway connecting two administrative wings, high textured beige walls, exterior wall-mounted split AC compressor units on steel brackets, asphalt paving with concrete curbs, and ground drainage channel',
      spatialBehavior: 'standing in the connecting thoroughfare, straight architectural perspective between structures',
      backgroundElements: ['textured beige exterior building walls', 'row of exterior split AC compressor units with conduit pipes', 'asphalt ground with concrete curb edge', 'service access metal door', 'overhead open sky strip'],
      activity: 'personnel walking between department blocks, routine work environment',
      lightingHints: 'channeled sunlight with distinct shadow boundary cast by the taller building wing',
      isOutdoor: true
    },
    {
      id: 'mb_staff_break_area',
      labelAR: 'منطقة استراحة موظفين',
      environmentPrompt: 'ordinary administrative break room, wood-laminate dining table with plastic chairs, kitchen counter with stainless steel sink, electric kettle, stainless steel Arabic thermal flask (Dallah/Thermos), box of teabags, white walls, and ceramic tiled floor',
      spatialBehavior: 'seated at break table or standing near countertop with warm beverage cup, relaxed off-duty demeanor',
      backgroundElements: ['wood-laminate break table with paper napkins', 'stainless steel tea flask and small glass cups', 'kitchenette counter with electric kettle and sink', 'wall clock with Arabic digits', 'notice pinboard on wall'],
      activity: 'tea brewing, colleague pouring tea in background, informal collegiate atmosphere',
      lightingHints: 'warm domestic-style overhead lighting, comforting contrast to formal office fluorescent',
      isOutdoor: false
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. السيارة (car) - EXACTLY 20
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'car': [
    {
      id: 'car_driver_parked',
      labelAR: 'مقعد السائق والسيارة متوقفة',
      environmentPrompt: 'interior driver seat of an ordinary modern sedan or SUV in Saudi Arabia, engine turned off, textured steering wheel with thumb grips, dashboard digital instrument cluster, center touchscreen display, textured seatbelt across chest, and front windshield showing ordinary Saudi residential street with boundary walls through glass',
      spatialBehavior: 'selfie arm reach (approx 45cm) from driver seat, smartphone held naturally at chest-to-eye level, steering wheel rim and dashboard visible in lower frame, headrest directly behind head',
      backgroundElements: ['textured steering wheel with thumb grips', 'dashboard digital gauge cluster screen', 'center console touchscreen with AC dials', 'seatbelt webbing across shoulder', 'windshield view of residential villa wall through glass'],
      activity: 'car parked in residential bay, complete vehicle stillness and private cabin moment',
      lightingHints: 'soft diffused daylight entering through front windshield and driver side window, subtle reflections on gauge glass',
      isOutdoor: false
    },
    {
      id: 'car_driver_behind_wheel',
      labelAR: 'مقعد السائق أمام المقود',
      environmentPrompt: 'classic driver perspective behind the steering wheel, hands resting naturally on the steering wheel rim, steering column stalks, padded vinyl dashboard with AC vents, rearview mirror at top edge, sun visor folded up, and windshield view of quiet Saudi neighborhood street',
      spatialBehavior: 'eye-level chest-up selfie from driver seat, authentic in-cabin geometry with headrest behind shoulders, no impossible floating camera angles',
      backgroundElements: ['steering wheel upper rim and center horn pad', 'rearview mirror in upper frame', 'soft-touch vinyl dashboard with AC vents', 'driver seat headrest behind shoulders', 'windshield view of quiet residential street and parked car'],
      activity: 'momentary pause before driving, focused calm posture behind wheel',
      lightingHints: 'directional sunlight through windshield creating highlights on steering wheel leather and driver shoulders',
      isOutdoor: false
    },
    {
      id: 'car_driver_near_window',
      labelAR: 'مقعد السائق قرب النافذة',
      environmentPrompt: 'driver seat positioned leaning slightly toward the driver side door, door armrest with power window controls, side view mirror visible through tinted door window glass, car A-pillar trim, and authentic door sill padding',
      spatialBehavior: 'slightly angled camera perspective from inside cabin toward driver window, left arm resting naturally near door panel, seated naturally within bucket seat',
      backgroundElements: ['driver door interior panel with window switches', 'exterior side mirror seen through side window glass', 'car A-pillar interior trim', 'driver seat headrest', 'side window tint edge with street view beyond'],
      activity: 'waiting inside parked car, relaxed elbow position by window',
      lightingHints: 'strong side-light from the driver window illuminating the profile, soft shadow falloff toward cabin center',
      isOutdoor: false
    },
    {
      id: 'car_driver_door_closed',
      labelAR: 'مقعد السائق والباب مغلق',
      environmentPrompt: 'fully enclosed vehicle cabin ambiance, all doors shut tight, tinted side window glass providing gentle privacy shade, dashboard air conditioning vents, overhead dome light console, and quiet insulated cabin interior',
      spatialBehavior: 'enclosed cockpit perspective, head and shoulders framed tightly within the cabin interior contours against seat back and B-pillar',
      backgroundElements: ['closed driver door interior with integrated grab handle', 'dashboard air conditioning circular vents', 'overhead dome light console and sunglasses holder', 'car B-pillar with seatbelt height adjuster', 'side window dark tint with faint exterior street blur'],
      activity: 'private quiet in-car environment, smartphone held at natural selfie distance',
      lightingHints: 'subtle light reduction from UV window tinting, balanced ambient interior enclosure',
      isOutdoor: false
    },
    {
      id: 'car_driver_door_open',
      labelAR: 'مقعد السائق والباب مفتوح',
      environmentPrompt: 'driver sitting in seat with the driver door swung wide open, visible vehicle door sill with scuff plate, open exterior Saudi asphalt and concrete curb visible right beside door, and natural unfiltered outdoor daylight',
      spatialBehavior: 'angled framing showing open door aperture, exterior daylight pouring in directly without window tint filtration, feet planted near door sill',
      backgroundElements: ['open driver door swung outward showing hinge check-strap', 'interior door jamb and weatherstripping seal', 'Saudi street asphalt and concrete curb right beside door', 'aluminum door sill scuff plate', 'steering wheel rim in near field'],
      activity: 'about to step out of vehicle after parking, natural transition between driving and walking',
      lightingHints: 'bright raw unfiltered natural sunlight entering freely through the door opening, eliminating window tint cast',
      isOutdoor: false
    },
    {
      id: 'car_front_passenger',
      labelAR: 'المقعد الأمامي للراكب',
      environmentPrompt: 'front passenger seat interior perspective, clean passenger dashboard with airbag seam, textured passenger seatbelt across shoulder, center console cup holders and transmission shifter visible to the right, and passenger door panel',
      spatialBehavior: 'camera held from front passenger position, diagonal view across cabin toward driver side or straight on passenger seat, natural in-seat perspective',
      backgroundElements: ['passenger front dashboard and glovebox seam', 'center console transmission selector and armrest', 'passenger sun visor with vanity mirror lid', 'passenger door armrest and air vent', 'front passenger headrest'],
      activity: 'passenger relaxing during drive or waiting while driver runs a quick errand',
      lightingHints: 'asymmetric light entering passenger window, soft interior ambient bounce from passenger floorwell',
      isOutdoor: false
    },
    {
      id: 'car_between_front_seats',
      labelAR: 'بين المقعدين الأماميين',
      environmentPrompt: 'camera perspective positioned over the central console armrest between driver and passenger seats, cup holders with water bottle, rear air conditioning vents behind, full dashboard width visible ahead through windshield',
      spatialBehavior: 'centered balanced view inside vehicle, capturing the space between driver and passenger seats with headrests on both sides',
      backgroundElements: ['center console leather armrest with cup holders', 'dashboard touchscreen display and dual AC vents', 'rearview mirror mounted on windshield', 'driver and passenger seat headrests framing composition', 'front windshield view of Saudi street'],
      activity: 'candid conversational vehicle atmosphere between friends or family members',
      lightingHints: 'balanced interior illumination filtering through front windshield and side glasses simultaneously',
      isOutdoor: false
    },
    {
      id: 'car_rear_seat',
      labelAR: 'المقعد الخلفي',
      environmentPrompt: 'sitting in the comfortable rear passenger bench seat of an ordinary sedan or SUV, back of front seat headrests in near field, side rear door panel with power window button, rear quarter window, and wide spacious cabin depth',
      spatialBehavior: 'camera positioned in the rear seat, front seatbacks creating natural interior framing and authentic depth layers',
      backgroundElements: ['back of front driver and passenger seats with storage pouches', 'rear door window with subtle sunshade or tint', 'center ceiling rear dome light fixture', 'rear seatbelt webbing across chest', 'front cabin dashboard seen in distance'],
      activity: 'rear passenger riding along or resting in back seat, relaxed commuter vibe',
      lightingHints: 'deep ambient cabin shade, light streaming in from front windshield far ahead and rear side windows',
      isOutdoor: false
    },
    {
      id: 'car_outside_beside_door_closed',
      labelAR: 'بجانب السيارة والباب مغلق',
      environmentPrompt: 'standing outside directly beside the vehicle, vehicle side bodywork and glossy paint reflecting the surrounding ordinary Saudi neighborhood, body-color door handles, tinted side glass, clean tires with alloy wheels, and asphalt ground',
      spatialBehavior: 'standing three-quarter turn outside the car, car body forming immediate background and contact plane',
      backgroundElements: ['car door panel reflecting residential street scene', 'exterior door handle and lock sensor', 'car roofline and tinted side glass', 'car alloy wheel and black tire with slight road dust', 'asphalt pavement with concrete curb'],
      activity: 'standing beside vehicle after parking, casual everyday candid snapshot',
      lightingHints: 'full outdoor daylight, glossy curved vehicle metal reflecting ambient sky and warm ground tones',
      isOutdoor: true
    },
    {
      id: 'car_beside_driver_door',
      labelAR: 'بجانب باب السائق',
      environmentPrompt: 'standing right at the exterior driver door handle, side view mirror assembly, front windshield pillar, residential street pavement underfoot, car roofline above shoulder height, and villa boundary wall in background',
      spatialBehavior: 'close contact with driver door exterior, vehicle geometry anchoring one side of frame',
      backgroundElements: ['driver exterior door handle and keyhole', 'driver side view mirror with turn signal blinker', 'front driver window glass with sky reflection', 'car front fender seam and hood line', 'pavement curbside with subtle accumulated sand'],
      activity: 'driver preparing to unlock vehicle or pausing after arrival',
      lightingHints: 'outdoor daylight with specular reflection on side glass and mirror casing',
      isOutdoor: true
    },
    {
      id: 'car_front_quarter_exterior',
      labelAR: 'أمام السيارة من الجانب',
      environmentPrompt: 'standing in front of vehicle at a three-quarter angle, modern car headlight cluster with clear lens, front radiator grille with emblem, sloping metal hood, front bumper and Saudi registration plate, with ordinary residential background',
      spatialBehavior: 'candid posture angled toward camera in front of vehicle hood and headlight, car extending diagonally behind',
      backgroundElements: ['car front headlight assembly with clear plastic lens', 'front grille and manufacturer emblem', 'sloping metal hood surface with subtle reflections', 'front bumper and Saudi registration plate', 'residential villa wall and asphalt backdrop'],
      activity: 'standing casually near vehicle after parking on neighborhood street',
      lightingHints: 'bright sun highlights glinting off headlight reflector and metallic hood paint',
      isOutdoor: true
    },
    {
      id: 'car_near_front_fender',
      labelAR: 'قرب الرفرف الأمامي',
      environmentPrompt: 'exterior standing close to the front wheel fender, curved wheel arch, tire with realistic tread and slight road dust, multi-spoke alloy rim, car front side panel, and asphalt ground',
      spatialBehavior: 'half-body or chest-up framing standing beside the front wheel arch, natural grounding and physical presence',
      backgroundElements: ['front wheel arch curve and fender cut-line', 'alloy wheel rim spoke design with tire tread edge', 'car hood crease line', 'asphalt pavement with faint white stall line', 'concrete curb in background'],
      activity: 'casual curbside pause beside own car, relaxed everyday stance',
      lightingHints: 'under-fender deep contact shadow contrasting with bright daylight on upper fender curve',
      isOutdoor: true
    },
    {
      id: 'car_beside_rear_quarter',
      labelAR: 'بجانب الجزء الخلفي للسيارة',
      environmentPrompt: 'standing by the rear quarter panel and taillight of the car, red taillight lens cluster, rear wheel well, fuel filler flap door, rear bumper corner, and ordinary Saudi parking bay',
      spatialBehavior: 'subject framed by the rear quarter of the car, taillight red accents in mid-ground',
      backgroundElements: ['red taillight assembly with faceted reflector pattern', 'rear vehicle fender contour', 'fuel filler door seam', 'rear bumper contour', 'neighboring parking stall with concrete wheel stop'],
      activity: 'standing near vehicle rear, ordinary parking situation',
      lightingHints: 'reflections on glossy paint, translucent refraction through red taillight plastic',
      isOutdoor: true
    },
    {
      id: 'car_in_front_trunk',
      labelAR: 'أمام صندوق السيارة',
      environmentPrompt: 'standing at the rear of the vehicle directly behind the trunk lid, rear Saudi license plate in recess, trunk release button, rear bumper sill, parking space asphalt with concrete curb, and villa wall in background',
      spatialBehavior: 'centered behind vehicle rear, vehicle width spanning behind subject with plausible depth',
      backgroundElements: ['car trunk lid and rear emblem', 'Saudi rear vehicle plate with Arabic and Latin characters', 'rear bumper sill protector', 'lower rear bumper and exhaust tip', 'parking bay line on asphalt'],
      activity: 'loading or unloading groceries or gym bag, routine everyday errand',
      lightingHints: 'overhead outdoor light casting shadow under rear bumper overhang',
      isOutdoor: true
    },
    {
      id: 'car_open_parking_lot',
      labelAR: 'بجانب السيارة في موقف مفتوح',
      environmentPrompt: 'vehicle parked in an open commercial or mosque parking lot in Saudi Arabia, expansive asphalt with white painted parking bays, rows of neighboring parked cars, open sky with distant buildings, and parking light pole',
      spatialBehavior: 'wide spatial depth, standing beside car with distant parking lot rows receding into background',
      backgroundElements: ['car parked in designated stall', 'adjacent parked family vehicle', 'white painted stall lines on asphalt', 'distant building boundary wall and minaret silhouette', 'open cloudless desert sky'],
      activity: 'returning to car after Friday prayer or supermarket run',
      lightingHints: 'full unimpeded 360-degree desert daylight, bright ground radiosity bounce from asphalt',
      isOutdoor: true
    },
    {
      id: 'car_shaded_parking_bay',
      labelAR: 'بجانب السيارة تحت مظلة',
      environmentPrompt: 'car parked beneath an arched tensile fabric parking shade, steel canopy frame, cool diffused blue-grey shadow under the shade, sunny asphalt with tire marks visible beyond, and concrete wheel stop',
      spatialBehavior: 'standing beside car under canopy structure, defined shade envelope surrounding subject',
      backgroundElements: ['curved tensile parking canopy overhead', 'steel support pillar with mounting bolts', 'car body bathed in soft shade', 'bright hot sunlight just past the canopy edge', 'concrete tire stop with tire scuffs'],
      activity: 'sheltered from summer sun beside car, comfortable outdoor pause',
      lightingHints: 'diffused cool skylight under canopy, no harsh facial squinting, bright background blowout',
      isOutdoor: true
    },
    {
      id: 'car_building_parking',
      labelAR: 'السيارة في موقف مبنى',
      environmentPrompt: 'vehicle parked in ground-floor covered parking bay beneath a Saudi apartment or office building, concrete ceiling slab with exposed utility conduits and drainage pipes, concrete structural pillars with painted hazard stripes, and smooth concrete floor',
      spatialBehavior: 'urban semi-enclosed environment, concrete pillar and ceiling framing the car and subject naturally',
      backgroundElements: ['reinforced concrete pillar with yellow and black safety paint', 'concrete ceiling with electrical conduit pipes', 'car parked against back wall', 'smooth concrete parking floor with faint oil spots', 'overhead fluorescent tube fixture'],
      activity: 'resident arriving home at apartment building ground-level parking',
      lightingHints: 'mixed artificial fluorescent tube overhead lighting with daylight spilling from parking entrance',
      isOutdoor: true
    },
    {
      id: 'car_beside_residential_curb',
      labelAR: 'السيارة بجانب رصيف سكني',
      environmentPrompt: 'car parked parallel along the concrete curb of an ordinary Saudi residential villa street, concrete sidewalk pavers, low boundary wall of a villa with iron gate, asphalt road with faint sand dusting, and quiet neighborhood atmosphere',
      spatialBehavior: 'standing between the curbside car door and the residential sidewalk, suburban intimacy',
      backgroundElements: ['curbside parked sedan', 'black and yellow painted concrete curb', 'residential sidewalk pavers', 'residential perimeter wall and metal gate', 'clean residential asphalt street'],
      activity: 'arriving at family home, calm neighborhood stillness',
      lightingHints: 'soft street daylight, natural wall bounce onto car and subject',
      isOutdoor: true
    },
    {
      id: 'car_front_residential_wall',
      labelAR: 'السيارة أمام سور سكني',
      environmentPrompt: 'car parked perpendicular facing a residential villa stone perimeter wall, car front bumper inches from the curb, textured stone wall background, concrete wheel stop, and domestic residential ambiance',
      spatialBehavior: 'standing between car and villa wall, intimate enclosed outdoor space with genuine contact',
      backgroundElements: ['front of car with grille and headlights', 'textured stone villa wall background', 'concrete wheel stop', 'low ground gravel strip along wall base', 'external water meter niche'],
      activity: 'parked at home, familiar routine domestic setting',
      lightingHints: 'indirect light bouncing between house wall and car hood',
      isOutdoor: true
    },
    {
      id: 'car_night_quiet_parking',
      labelAR: 'السيارة في موقف ليلي هادئ',
      environmentPrompt: 'car parked at nighttime in a peaceful neighborhood parking pocket, sodium-vapor or warm LED street lamps casting amber glow, car interior dashboard dials softly illuminated, and quiet night air',
      spatialBehavior: 'nighttime portrait beside or inside parked car, ambient night atmosphere with physically plausible illumination',
      backgroundElements: ['car exterior under warm street lamp', 'amber/yellow street light pool on asphalt', 'car illuminated dashboard glow visible through glass', 'dark residential silhouettes in distance', 'deep dark night sky'],
      activity: 'late night pause, quiet contemplative moment after evening drive',
      lightingHints: 'warm directional street lamp from above casting rich amber highlights and long dramatic night shadows, glowing car headlights or taillights',
      isOutdoor: true
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. صالة منزلية (living-room) - EXACTLY 20
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'living-room': [
    {
      id: 'lr_center_room',
      labelAR: 'منتصف الصالة',
      environmentPrompt: 'open central area of an authentic lived-in Saudi family living room, large patterned area rug over porcelain floor tiles, comfortable contemporary sofa set framing the room, neutral warm-beige painted walls, ceiling chandelier',
      spatialBehavior: 'standing or seated centrally in the living room, panoramic domestic background showing room dimensions',
      backgroundElements: ['patterned Persian or modern floor carpet', 'porcelain floor tiles around carpet edge', 'beige fabric sectional sofa', 'ceiling central light fixture with warm LED bulbs', 'wooden coffee table'],
      activity: 'quiet domestic family afternoon, subtle lived-in household objects',
      lightingHints: 'balanced warm overhead ambient room illumination mixed with soft daylight from side window',
      isOutdoor: false
    },
    {
      id: 'lr_beside_sofa',
      labelAR: 'بجانب الكنبة',
      environmentPrompt: 'standing or sitting right beside the armrest of a large comfortable fabric sofa, decorative throw pillow with geometric embroidery, side table with tissue box, polished tile floor',
      spatialBehavior: 'close contact framing with the sofa armrest, domestic furniture anchoring the lower corner',
      backgroundElements: ['plush fabric sofa armrest', 'embroidered decorative throw cushion', 'small wooden side table with acrylic tissue box', 'floor tile reflection', 'living room wall'],
      activity: 'relaxed home lounging, informal family environment',
      lightingHints: 'soft diffused indoor living room lighting, gentle fabric texture highlights',
      isOutdoor: false
    },
    {
      id: 'lr_front_sofa',
      labelAR: 'أمام الكنبة',
      environmentPrompt: 'standing in the open space directly in front of the main three-seater sofa, low rectangular wooden coffee table in front, carpet underfoot, living room backdrop',
      spatialBehavior: 'standing centered before the sofa, full living room layout visible behind',
      backgroundElements: ['three-seater upholstered sofa', 'rectangular wooden coffee table with tea coaster', 'patterned floor rug', 'wall artwork or Arabic calligraphy plaque', 'corner side table'],
      activity: 'casual home snapshot, relaxed domestic pause',
      lightingHints: 'even room illumination, natural soft shadows under coffee table and sofa base',
      isOutdoor: false
    },
    {
      id: 'lr_sitting_edge_sofa',
      labelAR: 'جالس على طرف الكنبة',
      environmentPrompt: 'seated casually on the front edge of the living room sofa, body weight compressing the soft fabric seat cushion, feet grounded on carpet, hands resting naturally on knees or holding smartphone',
      spatialBehavior: 'physically grounded seated posture, clear mattress/cushion compression physics, natural knee and torso angles',
      backgroundElements: ['compressed sofa cushion under body weight', 'sofa backrest and pillows', 'coffee table corner', 'living room carpet', 'soft domestic wall color'],
      activity: 'momentary pause while checking phone, authentic informal posture',
      lightingHints: 'soft downward ceiling light creating natural contact shadows under thighs and chin',
      isOutdoor: false
    },
    {
      id: 'lr_sitting_center_sofa',
      labelAR: 'جالس في منتصف الكنبة',
      environmentPrompt: 'deeply seated in the comfortable middle of the main living room sofa, back resting comfortably against plush cushions, arms resting on cushions, living room setting',
      spatialBehavior: 'relaxed seated posture, deep cushion sink, balanced domestic portrait framing',
      backgroundElements: ['deep sofa seat cushions', 'flanking decorative pillows', 'carpet floor', 'living room coffee table', 'living room background with TV cabinet in distance'],
      activity: 'watching TV or conversing with family members, restful home state',
      lightingHints: 'warm home interior lighting, soft ambient shadow around seat crevice',
      isOutdoor: false
    },
    {
      id: 'lr_beside_window',
      labelAR: 'بجانب النافذة',
      environmentPrompt: 'standing or seated next to a large living room window, sheer white voile inner curtain filtering daylight, thick decorative drape gathered at side with tassel tieback, window sill',
      spatialBehavior: 'asymmetric natural light pouring across subject from window side, soft gradient falloff across room',
      backgroundElements: ['sheer white voile window curtain', 'heavy gathered side drape with tassel', 'aluminum window frame', 'soft natural light wash on floor', 'sofa corner'],
      activity: 'looking out the window or enjoying morning natural light with coffee',
      lightingHints: 'luminous soft directional daylight through sheer curtain, gentle rim lighting on hair and shoulders',
      isOutdoor: false
    },
    {
      id: 'lr_front_window',
      labelAR: 'أمام النافذة',
      environmentPrompt: 'standing directly in front of the living room window with curtains partially drawn, bright natural backlight creating gentle silhouette or filled by warm ceiling light, indoor plant on sill',
      spatialBehavior: 'back or three-quarter profile to window, window framing the subject from behind',
      backgroundElements: ['translucent sheer curtains illuminated from behind', 'window sill with small potted succulent', 'floor baseboard', 'living room carpet edge', 'corner armchair'],
      activity: 'morning routine at home, welcoming daytime light',
      lightingHints: 'high-key natural window backlight with soft indoor room fill, no artificial HDR look',
      isOutdoor: false
    },
    {
      id: 'lr_front_tv',
      labelAR: 'أمام التلفاز',
      environmentPrompt: 'standing in the living room facing away from a large flat-screen smart TV mounted on a modern wooden media console unit, soundbar on shelf, subtle reflection of living room on TV screen',
      spatialBehavior: 'subject in mid-ground, sleek dark TV screen and media unit forming structured backdrop',
      backgroundElements: ['wall-mounted smart TV on dark screen', 'wooden low-profile media console table', 'soundbar unit', 'family photo frame on TV shelf', 'remote control on table'],
      activity: 'casual home recreation, modern family room ambiance',
      lightingHints: 'ambient ceiling lighting with faint specular highlight on television glass bezel',
      isOutdoor: false
    },
    {
      id: 'lr_beside_coffee_table',
      labelAR: 'بجانب طاولة الصالة',
      environmentPrompt: 'standing or seated near the central low living room coffee table, glass or polished wood table surface with decorative brass tray, ceramic incense burner (Mabkhara), small water bottle',
      spatialBehavior: 'coffee table in immediate near-ground or side, authentic domestic scale and reach',
      backgroundElements: ['low wooden coffee table', 'traditional brass or ceramic Mabkhara burner', 'acrylic tissue box cover', 'intricate carpet weave', 'sofa base'],
      activity: 'tea hospitality or relaxing at home, pleasant domestic fragrance atmosphere',
      lightingHints: 'warm ceiling chandelier light reflecting on polished table surface',
      isOutdoor: false
    },
    {
      id: 'lr_front_living_wall',
      labelAR: 'أمام جدار الصالة',
      environmentPrompt: 'standing against a featured neutral wall of the living room, warm greige or sand wall paint, framed modern Arabic calligraphy art piece, crown molding near ceiling, electrical outlet near baseboard',
      spatialBehavior: 'clean portrait backdrop against domestic wall, subject positioned slightly off-center',
      backgroundElements: ['neutral painted wall with subtle texture', 'framed Islamic calligraphy print with gold frame', 'decorative ceiling plaster crown molding', 'white electrical socket switch plate', 'edge of floor skirting board'],
      activity: 'calm poised home snapshot, uncluttered domestic setting',
      lightingHints: 'soft downlight washing down the wall surface, gentle subject drop shadow',
      isOutdoor: false
    },
    {
      id: 'lr_beside_entrance',
      labelAR: 'بجانب مدخل الصالة',
      environmentPrompt: 'standing near the wide open archway entrance connecting the entrance foyer to the main family living room, wooden door casing, change in floor tile pattern at threshold',
      spatialBehavior: 'framed in the domestic architectural threshold between entrance foyer and living room',
      backgroundElements: ['open architectural archway frame', 'transition strip on floor tiles', 'wall-mounted digital AC thermostat control', 'shoe cabinet edge in foyer beyond', 'living room sofa'],
      activity: 'entering living room, natural transition movement',
      lightingHints: 'mixed lighting between foyer downlight and living room chandelier',
      isOutdoor: false
    },
    {
      id: 'lr_near_interior_door',
      labelAR: 'قرب باب داخلي',
      environmentPrompt: 'standing near a closed interior wooden panel door leading to bedrooms or kitchen, decorative brass lever handle, door frame trim, painted baseboard along wall',
      spatialBehavior: 'standing beside closed interior domestic door, intimate hallway/room corner',
      backgroundElements: ['white or oak painted interior wooden door', 'brass door lever handle', 'wall light switch panel', 'tile skirting board', 'side table corner'],
      activity: 'routine indoor movement inside the house',
      lightingHints: 'even indoor ambient light with soft shadow under door trim',
      isOutdoor: false
    },
    {
      id: 'lr_beside_curtain',
      labelAR: 'بجانب الستارة',
      environmentPrompt: 'standing right next to the gathered folds of a heavy textured living room curtain, deep vertical fabric drape folds, curtain tieback cord, soft textile backdrop',
      spatialBehavior: 'curtain fabric immediately adjacent to shoulder, rich tactile cloth texture in near field',
      backgroundElements: ['heavy jacquard or velvet curtain fabric folds', 'curtain braided tieback cord', 'window frame edge', 'floor skirting', 'carpet corner'],
      activity: 'casual resting posture beside the window drape',
      lightingHints: 'light filtering around curtain edge, rich tactile micro-shadows in fabric folds',
      isOutdoor: false
    },
    {
      id: 'lr_room_corner',
      labelAR: 'في زاوية الصالة',
      environmentPrompt: 'cozy corner of the living room, meeting of two beige walls, tall floor-standing lamp with fabric shade, tall potted indoor palm in brass pot, wooden corner shelf unit',
      spatialBehavior: 'nested in the 90-degree corner of the room, architectural corner lines giving depth',
      backgroundElements: ['two converging interior walls', 'floor-standing corner reading lamp', 'indoor potted Areca palm', 'small corner side table with Quran stand', 'carpet corner'],
      activity: 'quiet reading or resting corner of the home',
      lightingHints: 'warm glow from floor standing lamp creating cozy intimate corner illumination',
      isOutdoor: false
    },
    {
      id: 'lr_beside_single_armchair',
      labelAR: 'بجانب كرسي منفرد',
      environmentPrompt: 'standing or resting an arm on a solitary upholstered accent armchair (single sofa), high tufted backrest, plush fabric, small side table with coaster',
      spatialBehavior: 'casual lean on armchair backrest or standing beside it, asymmetric furniture framing',
      backgroundElements: ['tufted accent armchair with fabric texture', 'small wooden side table', 'living room carpet', 'wall picture frame', 'main sofa in background'],
      activity: 'relaxed conversation in living room, informal home posture',
      lightingHints: 'soft warm room light highlighting the tufted upholstery buttons and fabric weave',
      isOutdoor: false
    },
    {
      id: 'lr_near_ac_unit',
      labelAR: 'قرب وحدة التكييف',
      environmentPrompt: 'standing in the living room beneath a wall-mounted modern split-unit air conditioner, white AC casing with subtle digital temperature display (22°C), subtle airflow vent louvers open',
      spatialBehavior: 'standing in room with upper wall showing split AC unit, authentic Saudi home climate detail',
      backgroundElements: ['wall-mounted split air conditioning unit', 'digital LED temperature readout (22°C)', 'air deflector flap open', 'painted wall', 'living room furniture below'],
      activity: 'cooling off indoors during hot afternoon, everyday comfort',
      lightingHints: 'smooth ambient room lighting, subtle green/white LED glow from AC display',
      isOutdoor: false
    },
    {
      id: 'lr_beside_hallway',
      labelAR: 'بجانب ممر المنزل',
      environmentPrompt: 'standing at the edge of the living room where it opens into the central residential distribution corridor, polished hallway floor tiles extending into depth, family bathroom door in distance',
      spatialBehavior: 'depth perspective looking down the internal hallway from the living room edge',
      backgroundElements: ['living room carpet meeting bare corridor tile', 'long interior hallway perspective', 'closed bedroom doors down the hall', 'recessed hallway ceiling downlights', 'sofa back'],
      activity: 'family members moving quietly down hallway in distance, lived-in household',
      lightingHints: 'corridor downlights creating pools of light on floor tile receding in distance',
      isOutdoor: false
    },
    {
      id: 'lr_front_simple_tv_unit',
      labelAR: 'أمام وحدة تلفاز بسيطة',
      environmentPrompt: 'standing near a modest living room TV setup, TV on a wooden stand with open shelving, satellite receiver decoder with green channel number display, router with blinking lights, gaming console',
      spatialBehavior: 'informal domestic technology setup in background, authentic everyday realism',
      backgroundElements: ['smart TV on stand', 'satellite receiver with green LED display', 'Wi-Fi router with subtle lights', 'coaxial and power cables neatly bundled', 'carpet floor'],
      activity: 'everyday modern domestic life, genuine home reality',
      lightingHints: 'balanced warm indoor lighting with subtle colored LED indicators from electronics',
      isOutdoor: false
    },
    {
      id: 'lr_beside_side_table',
      labelAR: 'بجانب طاولة جانبية',
      environmentPrompt: 'standing next to a small wooden end table beside the couch, decorative ceramic lamp on table with beige fabric shade, phone charging cable resting on table, small glass of water',
      spatialBehavior: 'end-table and lamp in mid-ground beside subject, comfortable domestic proportion',
      backgroundElements: ['wooden end table', 'table lamp with linen shade', 'phone charging cable curling on surface', 'water glass on coaster', 'sofa armrest'],
      activity: 'resting at home, recharging phone, relaxed everyday presence',
      lightingHints: 'warm golden light emitting downward and upward from the table lamp shade',
      isOutdoor: false
    },
    {
      id: 'lr_between_living_and_hall',
      labelAR: 'بين الصالة والممر',
      environmentPrompt: 'intermediate zone between the spacious living room and the private bedroom corridor, wall intersection with light switch panel, wall mirror with decorative frame, soft carpet boundary',
      spatialBehavior: 'standing in transition space, split view showing living room warmth on one side and quiet corridor on other',
      backgroundElements: ['wall corner dividing living room and corridor', 'decorative framed wall mirror', 'multiple electrical light rocker switches', 'tile and carpet floor boundary', 'foyer arch'],
      activity: 'moving between domestic zones, natural home cadence',
      lightingHints: 'soft multi-directional room lighting with faint mirror reflection',
      isOutdoor: false
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. غرفة نوم (bedroom) - EXACTLY 20
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'bedroom': [
    {
      id: 'br_beside_bed',
      labelAR: 'بجانب السرير',
      environmentPrompt: 'standing on the soft floor rug immediately beside the queen/king-sized bed, neatly made quilted duvet bedspread with subtle everyday wrinkles, upholstered headboard, wooden nightstand',
      spatialBehavior: 'standing right beside the bed mattress edge, bed spanning across the mid-ground, intimate bedroom space',
      backgroundElements: ['quilted duvet bedspread with natural folds', 'upholstered fabric headboard', 'wooden bedside nightstand', 'table lamp', 'patterned bedside rug over tiles'],
      activity: 'morning rising or preparing to rest, calm private room stillness',
      lightingHints: 'warm bedroom table lamp lighting mixed with soft daylight filtering through curtains',
      isOutdoor: false
    },
    {
      id: 'br_front_bed',
      labelAR: 'أمام السرير',
      environmentPrompt: 'standing at the foot of the bed, footboard or bench at bed end, duvet draped smoothly across mattress with natural sleeping creases, full bedroom perspective visible',
      spatialBehavior: 'standing centered at the foot of the bed, bed extending straight back to headboard',
      backgroundElements: ['foot of the bed with draped duvet', 'flanking matching nightstands', 'plush sleeping pillows propped against headboard', 'bedroom floor tiles', 'wall wardrobe edge'],
      activity: 'casual standing bedroom snapshot, private restful ambiance',
      lightingHints: 'central ceiling fixture with warm diffused light casting soft shadows across bed folds',
      isOutdoor: false
    },
    {
      id: 'br_at_bed_edge',
      labelAR: 'عند حافة السرير',
      environmentPrompt: 'standing immediately against the long edge of the mattress, hand touching or resting near the bed surface, layered bed linen with white sheets and warm coverlet',
      spatialBehavior: 'close physical proximity to bed, bed surface dominating the mid-ground',
      backgroundElements: ['bed mattress edge with fitted sheet', 'cotton coverlet with natural crease lines', 'bedside table with digital clock', 'bedroom wall', 'carpet border'],
      activity: 'pausing beside bed while getting dressed, quiet personal routine',
      lightingHints: 'soft warm directional light from bedside lamp highlighting textile weave',
      isOutdoor: false
    },
    {
      id: 'br_sitting_bed_edge',
      labelAR: 'جالس على حافة السرير',
      environmentPrompt: 'seated naturally on the long side edge of the mattress, body weight causing localized realistic compression of mattress spring and foam, feet resting on the bedside floor rug, hands on lap',
      spatialBehavior: 'physically grounded sitting pose, distinct visible mattress depression under hips, realistic human gravity physics',
      backgroundElements: ['compressed mattress edge holding body weight', 'wrinkled bedsheet around thighs', 'bedside rug under feet', 'nightstand with phone charger', 'headboard in background'],
      activity: 'waking up or resting after a long day, reflective calm posture',
      lightingHints: 'soft downward ambient bedroom light, gentle contact shadow on rug beneath legs',
      isOutdoor: false
    },
    {
      id: 'br_sitting_on_bed',
      labelAR: 'جالس فوق السرير',
      environmentPrompt: 'seated further up on top of the mattress with legs extended or crossed on the duvet, pillows bunched behind back against headboard, relaxed personal sanctuary environment',
      spatialBehavior: 'elevated seated posture completely on the bed surface, natural fabric bunching around body',
      backgroundElements: ['soft pillows supporting lower back', 'duvet gathered naturally around legs', 'wooden headboard panel', 'side table lamp in frame', 'warm bedroom wall'],
      activity: 'relaxing in bed during quiet evening hours, casual personal downtime',
      lightingHints: 'intimate bedside lamp illumination creating warm amber glow across bedsheets',
      isOutdoor: false
    },
    {
      id: 'br_reclining_on_bed',
      labelAR: 'مستلقٍ على السرير',
      environmentPrompt: 'reclining comfortably half-propped on pillows on the bed, head and shoulders supported by plush sleeping pillows, duvet covering lower body with organic gravity drape',
      spatialBehavior: 'semi-horizontal or reclining pose, authentic relaxed headrest anatomy, relaxed neck tension',
      backgroundElements: ['plush sleeping pillows cradling shoulders', 'textured duvet folding organically over body', 'headboard detail', 'nightstand with reading glasses or phone', 'bedroom ceiling'],
      activity: 'resting before sleep or lounging on a weekend morning, absolute relaxation',
      lightingHints: 'dim bedside table lamp, cozy low-lumen bedroom ambiance with soft falloff',
      isOutdoor: false
    },
    {
      id: 'br_beside_headboard',
      labelAR: 'بجانب رأس السرير',
      environmentPrompt: 'standing right next to the tall padded headboard, bedside wall with double electrical socket and light switches, bedside nightstand with illuminated lamp',
      spatialBehavior: 'tight corner perspective beside headboard, wall and headboard framing the subject closely',
      backgroundElements: ['padded faux-leather or wood headboard', 'bedside table lamp with cloth shade', 'wall-mounted master light switches', 'propped pillows', 'bedroom wall'],
      activity: 'turning on or off bedside light, intimate private bedroom setting',
      lightingHints: 'close-range warm lamp radiance washing over one side of face and shoulder',
      isOutdoor: false
    },
    {
      id: 'br_front_wardrobe',
      labelAR: 'أمام الدولاب',
      environmentPrompt: 'standing in front of a wide wooden multi-door clothes wardrobe, melamine or finished wood doors with modern vertical metal handles, polished bedroom floor tiles',
      spatialBehavior: 'standing centered before the wardrobe doors, vertical cabinet lines forming structured background',
      backgroundElements: ['multi-door wooden wardrobe closet', 'long modern aluminum door handles', 'closet top shadow near ceiling', 'bedroom floor tiles', 'side of bed visible in reflection or edge'],
      activity: 'deciding on outfit or standing after dressing, everyday personal routine',
      lightingHints: 'even room ceiling light casting soft shadow on wardrobe door panels',
      isOutdoor: false
    },
    {
      id: 'br_beside_wardrobe',
      labelAR: 'بجانب الدولاب',
      environmentPrompt: 'standing at the narrow side panel of the large wardrobe cabinet, side end-panel showing wood veneer grain, space between wardrobe and adjacent bedroom wall',
      spatialBehavior: 'side profile to wardrobe, architectural furniture depth framing one side',
      backgroundElements: ['wardrobe side exterior panel', 'gap between wardrobe and wall', 'bedroom wall with light switch', 'floor tile skirting', 'bedroom doorway edge in distance'],
      activity: 'casual unposed standing moment in bedroom',
      lightingHints: 'diffused room light with soft shadow in the wardrobe corner recess',
      isOutdoor: false
    },
    {
      id: 'br_front_mirror',
      labelAR: 'أمام المرآة',
      environmentPrompt: 'standing in front of a vanity dressing table mirror or full-length wall mirror, perfume bottles and watch tray neatly placed on vanity glass top, geometrically accurate mirror reflection',
      spatialBehavior: 'mirror selfie or direct front portrait before the mirror, reflection rules strictly applied with visible smartphone or candid gaze',
      backgroundElements: ['framed vanity mirror with beveled glass edge', 'perfume bottles and watch tray on dresser', 'reflection showing opposite bedroom wall and bed', 'dresser drawers with metal pulls', 'dressing stool'],
      activity: 'checking appearance or taking casual mirror selfie, authentic daily grooming',
      lightingHints: 'warm vanity bulb illumination framing mirror, crisp reflection highlights',
      isOutdoor: false
    },
    {
      id: 'br_beside_nightstand',
      labelAR: 'بجانب طاولة السرير',
      environmentPrompt: 'standing right beside the small bedside nightstand drawer unit, bedside lamp with linen shade, charging cable connected to smartphone on nightstand, tissue box, drinking glass',
      spatialBehavior: 'nightstand furniture at waist height, intimate bedroom corner perspective',
      backgroundElements: ['wooden bedside nightstand with drawer', 'table lamp with warm light bulb', 'phone charger cable coiled on wood surface', 'glass of water on coaster', 'bed mattress edge'],
      activity: 'reaching for personal belongings on nightstand, lived-in authentic detail',
      lightingHints: 'warm directional downward cone of light from bedside lamp',
      isOutdoor: false
    },
    {
      id: 'br_front_curtains',
      labelAR: 'أمام الستائر',
      environmentPrompt: 'standing in front of bedroom blackout curtains drawn together, thick textured fabric blocking exterior daylight, subtle slit of sunlight leaking at top rod and bottom hem',
      spatialBehavior: 'standing directly in front of vertical curtain fabric folds, rich textile background',
      backgroundElements: ['floor-to-ceiling bedroom blackout drapes', 'soft horizontal curtain rod rings', 'subtle daylight glow leaking around curtain hem', 'bedroom floor tiles', 'corner of nightstand'],
      activity: 'morning wake-up or preparing room for afternoon nap, private sanctuary',
      lightingHints: 'dim ambient room illumination with subtle bright leak line of natural daylight along curtain perimeter',
      isOutdoor: false
    },
    {
      id: 'br_beside_curtains',
      labelAR: 'بجانب الستائر',
      environmentPrompt: 'standing beside the edge of the bedroom window curtain pulled slightly open, gentle beam of natural exterior daylight entering room, window frame and glass visible',
      spatialBehavior: 'asymmetric daylight illuminating one side of the subject, dark bedroom interior on other side',
      backgroundElements: ['curtain fabric pulled to the side', 'aluminum bedroom window frame', 'soft daylight beam hitting floor tile', 'bedroom wall corner', 'bed edge in background'],
      activity: 'peeking out through window in the morning, natural spontaneous gesture',
      lightingHints: 'sharp natural daylight key light from window contrasted against darker bedroom interior',
      isOutdoor: false
    },
    {
      id: 'br_center_bedroom',
      labelAR: 'وسط الغرفة',
      environmentPrompt: 'open central walking space of the bedroom between bed, wardrobe, and door, clean floor tiles with central geometric rug, complete bedroom layout visible around subject',
      spatialBehavior: 'standing centered in open floor space, wide bedroom perspective showing spatial balance',
      backgroundElements: ['bed with made duvet in background', 'wardrobe cabinet on one side', 'central bedroom floor rug', 'ceiling light fixture overhead', 'closed bedroom door in far view'],
      activity: 'standing casually in bedroom, natural full-figure or half-body framing',
      lightingHints: 'overhead ceiling flush-mount fixture casting uniform warm light across room',
      isOutdoor: false
    },
    {
      id: 'br_beside_door',
      labelAR: 'بجانب باب الغرفة',
      environmentPrompt: 'standing right next to the interior bedroom door, door frame architrave, brass door lock and handle, wall light switch cluster, door hook with light jacket hanging',
      spatialBehavior: 'standing near room entrance, architectural door frame providing vertical grounding',
      backgroundElements: ['interior wooden bedroom door', 'brass lever door handle', 'jacket hanging on back-of-door hook', 'light switch plate', 'tiled floor transition'],
      activity: 'about to leave bedroom or just entering, everyday domestic movement',
      lightingHints: 'subtle light spill from outside corridor under door seam mixed with bedroom light',
      isOutdoor: false
    },
    {
      id: 'br_front_door',
      labelAR: 'أمام باب الغرفة',
      environmentPrompt: 'standing directly facing away from the closed bedroom door inside the room, door panel forming immediate backdrop, brass handle visible at waist height',
      spatialBehavior: 'clean vertical door panel background, subject positioned close to entrance boundary',
      backgroundElements: ['closed panel bedroom door', 'metal door handle and lock cylinder', 'painted wall trim', 'floor baseboard', 'bedroom floor tiles'],
      activity: 'quiet enclosed bedroom privacy, authentic personal space',
      lightingHints: 'even room ceiling light illuminating subject and door face',
      isOutdoor: false
    },
    {
      id: 'br_room_corner',
      labelAR: 'في زاوية الغرفة',
      environmentPrompt: 'quiet corner of the bedroom away from bed, small laundry hamper basket with fabric liner in corner, wall-mounted AC unit above, peaceful domestic corner',
      spatialBehavior: 'standing in the architectural 90-degree room corner, intimate domestic framing',
      backgroundElements: ['two converging bedroom walls', 'woven laundry hamper with lid', 'wall split AC unit high up', 'floor tile baseboard', 'edge of wardrobe'],
      activity: 'casual everyday bedroom moments, natural unposed authenticity',
      lightingHints: 'soft corner ambient lighting with gentle shadow gradient into corner seam',
      isOutdoor: false
    },
    {
      id: 'br_beside_chair',
      labelAR: 'بجانب الكرسي',
      environmentPrompt: 'standing next to a comfortable bedroom side chair or dressing chair, clothes neatly folded over chair backrest, small side rug under chair legs',
      spatialBehavior: 'hand resting naturally on chair back or standing beside it, realistic furniture scale',
      backgroundElements: ['upholstered bedroom accent chair', 'folded everyday garment on chair back', 'bedroom floor tiles', 'adjacent wall with family frame', 'bedside view in distance'],
      activity: 'dressing or unwinding in bedroom, familiar domestic routine',
      lightingHints: 'soft bedroom ambient light highlighting chair fabric texture and clothing folds',
      isOutdoor: false
    },
    {
      id: 'br_opposite_wall',
      labelAR: 'قرب الجدار المقابل للسرير',
      environmentPrompt: 'standing against the wall opposite the bed, low chest of drawers with mirror or flat wall, view looking back toward the bed and headboard in the distance',
      spatialBehavior: 'standing with back to far wall, reverse perspective showing entire bed setup in deep background',
      backgroundElements: ['chest of drawers surface with grooming items', 'rear view showing made bed with pillows in deep focus', 'bedroom window curtains in distance', 'floor tiles', 'ceiling line'],
      activity: 'casual candid portrait looking across bedroom, deep spatial perspective',
      lightingHints: 'balanced room illumination showing depth between foreground and bed background',
      isOutdoor: false
    },
    {
      id: 'br_between_bed_and_wardrobe',
      labelAR: 'بين السرير والدولاب',
      environmentPrompt: 'standing in the functional walking aisle between the long side of the bed and the front of the wardrobe doors, intimate everyday bedroom corridor',
      spatialBehavior: 'contained aisle perspective, bed on one side and wardrobe on the other, authentic domestic spacing',
      backgroundElements: ['quilted duvet bed on left', 'wardrobe door handles on right', 'floor runner rug in aisle', 'bedroom window in far end', 'room lighting above'],
      activity: 'routine passage in bedroom while dressing, authentic spatial intimacy',
      lightingHints: 'filtered light bouncing between wooden wardrobe and fabric bed surfaces',
      isOutdoor: false
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. نادي رياضي (gym) - EXACTLY 20
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'gym': [
    {
      id: 'gym_beside_weights',
      labelAR: 'بجانب الأثقال',
      environmentPrompt: 'heavy free-weight section of an authentic modern commercial gym in Saudi Arabia, black rubber shock-absorbing flooring with interlocking puzzle seams, Olympic barbell rack with cast iron plates, chalk powder traces on knurling',
      spatialBehavior: 'standing firmly on rubber gym floor beside weight tree rack, grounded athletic stance',
      backgroundElements: ['heavy-duty Olympic weight tree with black rubberized plates', 'barbell knurling with faint chalk dust', 'interlocking black rubber floor tiles', 'gym mirror wall in background', 'steel rack uprights'],
      activity: 'gym user resting between heavy sets, subtle gym activity in background',
      lightingHints: 'bright industrial gym ceiling fluorescent tubes, hard direct highlights on steel chrome barbells',
      isOutdoor: false
    },
    {
      id: 'gym_front_dumbbell_rack',
      labelAR: 'أمام رف الدمبل',
      environmentPrompt: 'standing right in front of a long dual-tier polyurethane dumbbell rack, pairs of dumbbells arranged in ascending weight order, full-length mirror wall immediately behind the rack',
      spatialBehavior: 'facing camera with the organized rack of dumbbells spanning horizontally behind at waist height',
      backgroundElements: ['two-tier commercial dumbbell rack with clear kg weight markings', 'rubber-coated hex and round dumbbells', 'full-height gym mirror reflecting opposite training area', 'chalk smudge on rack', 'black gym floor'],
      activity: 'athlete selecting dumbbells or pausing after a working set, focused workout environment',
      lightingHints: 'overhead gym strip lights reflecting off dumbbell chrome handles and mirror glass',
      isOutdoor: false
    },
    {
      id: 'gym_front_mirror',
      labelAR: 'أمام المرآة',
      environmentPrompt: 'standing directly in front of the giant floor-to-ceiling training mirror, full reflection of gym interior with training benches and cable towers behind, clean mirror surface with faint fingerprint smudges',
      spatialBehavior: 'mirror selfie or direct front portrait before gym mirror, geometrically authentic reflection mechanics',
      backgroundElements: ['floor-to-ceiling mirror with bevel edge', 'reflection showing cable machines and other equipment in background', 'black rubber floor meeting mirror baseboard', 'water bottle on floor', 'gym ceiling AC duct'],
      activity: 'checking post-workout physical form or taking candid training selfie, athletic dedication',
      lightingHints: 'direct overhead fluorescent lighting emphasizing shoulder muscularity and clavicle shadows',
      isOutdoor: false
    },
    {
      id: 'gym_beside_mirror',
      labelAR: 'بجانب المرآة',
      environmentPrompt: 'standing at the edge corner of the mirror wall where it meets a concrete or branded drywall, corner angle reflecting partial gym machines, textured gym wall surface',
      spatialBehavior: 'standing three-quarter profile near mirror corner, one side reflecting in mirror and other against wall',
      backgroundElements: ['mirror glass edge with silicon seal seam', 'gym painted accent wall (charcoal or dark grey)', 'partial reflection of dumbbell zone', 'wall-mounted disinfectant wipe dispenser', 'rubber floor'],
      activity: 'resting against wall between sets, catching breath',
      lightingHints: 'asymmetric gym lighting with mirror reflection bounce filling side profile',
      isOutdoor: false
    },
    {
      id: 'gym_machines_zone',
      labelAR: 'منطقة الأجهزة',
      environmentPrompt: 'pin-select selectorized machine training zone of the gym, rows of plate-loaded and selectorized chest press and lat pulldown machines, black vinyl padded seats, yellow weight selector pins, pulley cables',
      spatialBehavior: 'standing in the aisle between high-end resistance machines, mechanical gym infrastructure background',
      backgroundElements: ['selectorized chest press machine with weight stack', 'pulley steel cable and pulleys', 'black vinyl machine upholstery with sweat-resistant sheen', 'weight stack pin', 'gym signage'],
      activity: 'other gym members operating machines in background blur, active dynamic training venue',
      lightingHints: 'uniform bright commercial ceiling LED troffers, industrial gym illumination',
      isOutdoor: false
    },
    {
      id: 'gym_beside_treadmill',
      labelAR: 'بجانب جهاز مشي',
      environmentPrompt: 'cardio section standing immediately beside a commercial motorized treadmill, digital LED console display showing distance and heart rate, safety clip cord, textured black running belt',
      spatialBehavior: 'standing beside treadmill console or handrails, athletic post-cardio or warm-up demeanor',
      backgroundElements: ['commercial treadmill console with LED screen', 'handrails with heart rate contact sensors', 'textured black running belt', 'row of matching treadmills in line', 'gym window view'],
      activity: 'cardio runner in adjacent treadmill in background blur, rhythmic fitness energy',
      lightingHints: 'cool console screen glow combined with overhead gym daylight-balanced lighting',
      isOutdoor: false
    },
    {
      id: 'gym_beside_stationary_bike',
      labelAR: 'بجانب جهاز دراجة',
      environmentPrompt: 'stationary cycling zone, standing beside an upright commercial exercise bike, flywheel casing, ergonomic padded seat, water bottle cage holding plastic water bottle, pedal straps',
      spatialBehavior: 'standing or resting hand on bike handlebar, casual athletic stance',
      backgroundElements: ['stationary exercise bike with flywheel', 'plastic water bottle in bottle cage', 'cardio floor mat under bike', 'speedometer console screen', 'adjacent elliptical machine'],
      activity: 'finishing cycling interval session, mild post-cardio exertion',
      lightingHints: 'bright overhead gym illumination, subtle reflection on bike frame paint',
      isOutdoor: false
    },
    {
      id: 'gym_front_cable_machine',
      labelAR: 'أمام جهاز كابل',
      environmentPrompt: 'standing in the center of a dual-pulley functional trainer / cable crossover station, overhead crossbar with multi-grip pull-up handles, steel cables descending through swivel pulleys, weight stacks on both sides',
      spatialBehavior: 'centered between the two cable towers, athletic framing with overhead pull-up bar',
      backgroundElements: ['dual cable crossover tower columns', 'swivel pulley carabiner attachments', 'overhead multi-grip pull-up handles', 'weight stack weight plates with yellow pins', 'gym floor'],
      activity: 'preparing for cable flies or tricep pushdowns, focused training routine',
      lightingHints: 'overhead light catching steel cables and chrome guide rods',
      isOutdoor: false
    },
    {
      id: 'gym_beside_workout_bench',
      labelAR: 'بجانب مقعد تمارين',
      environmentPrompt: 'standing right beside an adjustable incline/flat workout bench, thick black vinyl foam padding with subtle red stitching, heavy steel support frame, small gym towel resting on headrest',
      spatialBehavior: 'standing over or beside the gym bench, bench anchoring the lower frame',
      backgroundElements: ['adjustable workout bench with inclinable backrest', 'gym microfiber sweat towel on bench', 'pair of dumbbells on floor beside bench', 'rubber floor texture', 'mirror wall in distance'],
      activity: 'resting between dumbbell pressing sets, athletic breather',
      lightingHints: 'overhead industrial gym lights creating highlight sheen on clean vinyl bench pad',
      isOutdoor: false
    },
    {
      id: 'gym_free_weight_area',
      labelAR: 'منطقة تمارين حرة',
      environmentPrompt: 'open floor space dedicated to functional and free-weight movements, kettlebells lined on rubber mat, foam rollers in corner, plyometric wooden box, open rubber floor area',
      spatialBehavior: 'standing in open gym floor area with ample personal clearance, dynamic athletic presence',
      backgroundElements: ['cast iron kettlebells of various weights on floor', 'high-density foam roller', 'plyometric jump box', 'rubber flooring seams', 'gym training zone border'],
      activity: 'functional fitness training, active workout environment',
      lightingHints: 'even open gym ceiling lights, no harsh shadows, high clarity',
      isOutdoor: false
    },
    {
      id: 'gym_equipment_aisle',
      labelAR: 'ممر بين الأجهزة',
      environmentPrompt: 'main circulation walkway cutting through the fitness center floor, clean rubber flooring with directional walkway markings, rows of machines and weight stations on either flank',
      spatialBehavior: 'standing in the open central gym aisle, linear perspective framed by equipment rows on both sides',
      backgroundElements: ['gym central walking aisle', 'rows of selectorized fitness machines on left and right', 'overhead exposed spiral air conditioning ductwork', 'high ceiling beams', 'gym users in distance'],
      activity: 'gym members walking between exercise stations, vibrant athletic environment',
      lightingHints: 'high-bay industrial gym lights suspended from exposed ceiling, bright athletic atmosphere',
      isOutdoor: false
    },
    {
      id: 'gym_warmup_zone',
      labelAR: 'منطقة إحماء',
      environmentPrompt: 'calisthenics and warm-up corner of the facility, wall-mounted resistance bands, yoga exercise mats stacked in rack, dynamic mobility space, large wall digital workout timer clock',
      spatialBehavior: 'relaxed pre-workout stance, stretching posture or standing ready for training',
      backgroundElements: ['hanging rubber resistance workout bands', 'stacked exercise mats in metal caddy', 'large red LED workout timer on wall (00:00)', 'smooth floor surface', 'warm-up area sign'],
      activity: 'athlete preparing for heavy training session, focused mindset',
      lightingHints: 'bright functional lighting, red digital LED numbers reflecting on wall surface',
      isOutdoor: false
    },
    {
      id: 'gym_stretching_area',
      labelAR: 'منطقة تمدد',
      environmentPrompt: 'quiet dedicated post-workout stretching section, thicker blue and black padded stretching mats on floor, stretching cage bars on wall, Swiss exercise ball in corner, peaceful cool-down zone',
      spatialBehavior: 'sitting or standing on padded stretching mat, post-exercise relaxed muscle tone',
      backgroundElements: ['padded floor stretching mats', 'wall wooden stretching stall bars', 'silver Swiss stability ball', 'foam recovery roller', 'disinfectant spray bottle on shelf'],
      activity: 'post-workout cool-down and stretching, tranquil physical relief',
      lightingHints: 'slightly softer ceiling lighting in stretching area to aid cool-down relaxation',
      isOutdoor: false
    },
    {
      id: 'gym_entrance_lobby',
      labelAR: 'قرب مدخل النادي',
      environmentPrompt: 'reception entrance lobby of the fitness center, electronic barcode turnstile barrier, modern reception desk with gym logo branding, refrigerator display of protein shakes and hydration drinks',
      spatialBehavior: 'standing in modern gym reception area, civic entrance architecture',
      backgroundElements: ['stainless steel entry turnstile gate', 'reception counter with digital check-in scanner', 'glass-door beverage refrigerator glowing with sports drinks', 'branded gym wall logo', 'clean tiled lobby floor'],
      activity: 'member scanning keytag at turnstile, staff member greeting at desk',
      lightingHints: 'contemporary architectural reception downlights and glowing cold drinks fridge',
      isOutdoor: false
    },
    {
      id: 'gym_lockers_area',
      labelAR: 'بجانب خزائن النادي',
      environmentPrompt: 'gym locker area, rows of modern wood-grain or charcoal electronic lock lockers with digital number keypads, wooden dressing bench in front of lockers, clean tiled floor',
      spatialBehavior: 'standing beside tall locker column with hand resting on locker door or holding gym bag',
      backgroundElements: ['tall lockers with digital keypad locks and engraved numbers', 'hardwood dressing bench', 'gym duffel bag on bench', 'clean porcelain floor tiles', 'recessed ceiling spotlights'],
      activity: 'athlete putting away bag or getting ready for workout, quiet locker room atmosphere',
      lightingHints: 'warm residential-style locker room recessed lighting, private clean ambiance',
      isOutdoor: false
    },
    {
      id: 'gym_changing_corridor',
      labelAR: 'ممر غرفة الملابس',
      environmentPrompt: 'hallway leading between locker zone and shower facilities, full-length dressing mirror on wall, grooming vanity counter with hair dryers, clean neutral ceramic wall tiles',
      spatialBehavior: 'standing in grooming hallway, vertical wall mirror and tiles in background',
      backgroundElements: ['tiled corridor walls with modern grey ceramics', 'grooming counter with wall-mounted hair dryer', 'large vertical mirror', 'recessed downlights', 'clean floor with anti-slip mats'],
      activity: 'post-shower or pre-workout personal grooming',
      lightingHints: 'flattering vanity mirror downlights providing balanced facial illumination',
      isOutdoor: false
    },
    {
      id: 'gym_rest_lounge',
      labelAR: 'منطقة استراحة النادي',
      environmentPrompt: 'social lounge corner of the fitness club, high cocktail counter with barstools, protein shake blender station, wall-mounted television playing sports channel, community notice board',
      spatialBehavior: 'seated on high stool or leaning against counter holding shaker bottle, relaxed athletic demeanor',
      backgroundElements: ['high-top lounge counter', 'barstool with metal footrest', 'protein shaker bottle on counter', 'wall TV screen showing sports', 'health snack display shelf'],
      activity: 'members drinking post-workout protein shakes, friendly casual fitness community vibe',
      lightingHints: 'warm contemporary cafe-style pendant lighting over counter',
      isOutdoor: false
    },
    {
      id: 'gym_near_window',
      labelAR: 'قرب نافذة النادي',
      environmentPrompt: 'standing near the gym floor-to-ceiling panoramic glass facade overlooking the Saudi city street or plaza outside, cardio machines adjacent, bright natural daylight flooding the gym floor',
      spatialBehavior: 'standing by the wide glass window, natural outdoor light contrasting with gym interior equipment',
      backgroundElements: ['large exterior glass curtain wall with street view outside', 'adjacent treadmill row', 'silver air conditioning duct overhead', 'gym rubber floor edge', 'water bottle on window sill'],
      activity: 'resting between sets while looking out at daytime city traffic',
      lightingHints: 'dramatic natural outdoor daylight washing in from window side, high natural clarity',
      isOutdoor: false
    },
    {
      id: 'gym_quiet_corner',
      labelAR: 'زاوية هادئة بين الأجهزة',
      environmentPrompt: 'secluded quiet corner tucked behind heavy machine selector stacks, acoustic sound-absorbing wall paneling, spare weight plates stacked neatly, secluded focused sanctuary',
      spatialBehavior: 'tucked into quiet corner away from the main gym traffic, intense focused personal zone',
      backgroundElements: ['rear of weight stack selector tower', 'sound-absorbing dark wall panel', 'clean rubber flooring corner', 'wall electrical conduit', 'gym water bottle resting on floor'],
      activity: 'deep breath and mental preparation before heavy set, undisturbed concentration',
      lightingHints: 'subdued indirect gym illumination, focused quiet atmosphere',
      isOutdoor: false
    },
    {
      id: 'gym_equipment_wall',
      labelAR: 'بجانب جدار معدات التدريب',
      environmentPrompt: 'standing in front of a functional fitness storage pegboard wall, organized black wall racks holding resistance bands, jump ropes, lifting belts, medicine balls, and lifting straps',
      spatialBehavior: 'standing directly in front of the wall gear rack, organized athletic equipment creating textured backdrop',
      backgroundElements: ['metal wall pegboard holding leather weightlifting belts', 'speed jump ropes coiled on hooks', 'rubber medicine balls in wall rack', 'gym safety poster', 'textured black floor'],
      activity: 'athlete strapping on gym gear or selecting lifting accessories, serious gym dedication',
      lightingHints: 'direct overhead spotlighting highlighting leather belts and metallic gear hooks',
      isOutdoor: false
    }
  ]
};

// Helper lookup to get micro-location by ID or by Arabic label
export function getMicroLocation(familyId: SceneFamilyId | null, subSceneIdentifier: string): MicroLocation | undefined {
  if (!familyId || !MICRO_LOCATIONS[familyId]) return undefined;
  const list = MICRO_LOCATIONS[familyId];
  return list.find(m => m.id === subSceneIdentifier || m.labelAR === subSceneIdentifier) || list[0];
}

export function getMicroLocationsForFamily(familyId: SceneFamilyId): MicroLocation[] {
  return MICRO_LOCATIONS[familyId] || [];
}
