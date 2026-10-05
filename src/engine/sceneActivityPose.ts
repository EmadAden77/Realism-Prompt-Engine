import type { MicroLocation, SceneFamilyId } from '../data/microLocations';

export type FurnitureId =
  | 'office-chair'
  | 'meeting-chair'
  | 'waiting-chair'
  | 'visitor-chair'
  | 'cafe-chair'
  | 'outdoor-bench'
  | 'sofa'
  | 'bed'
  | 'desk'
  | 'meeting-table'
  | 'side-table'
  | 'cafe-table'
  | 'break-table'
  | 'counter'
  | 'driver-seat'
  | 'passenger-seat'
  | 'rear-seat'
  | 'gym-bench'
  | 'gym-equipment'
  | 'parked-car';

export type SurfaceId =
  | 'desk-surface'
  | 'meeting-table-surface'
  | 'side-table-surface'
  | 'counter-surface'
  | 'bed-edge'
  | 'wall-support'
  | 'car-door'
  | 'steering-wheel'
  | 'center-console'
  | 'gym-machine'
  | 'stair-railing';

export type SpatialFeatureId =
  | 'office-room'
  | 'meeting-room'
  | 'waiting-zone'
  | 'corridor'
  | 'doorway'
  | 'stairs'
  | 'stair-landing'
  | 'break-area'
  | 'parking'
  | 'street'
  | 'sidewalk'
  | 'cafe-zone'
  | 'shop-zone'
  | 'park-zone'
  | 'vehicle-interior'
  | 'bedroom-zone'
  | 'living-room-zone'
  | 'gym-zone'
  | 'window-side'
  | 'exterior-open'
  | 'service-zone';

export interface SceneCapabilityProfile {
  familyId: SceneFamilyId;
  subScene: string;
  furniture: FurnitureId[];
  surfaces: SurfaceId[];
  spatialFeatures: SpatialFeatureId[];
  source: 'explicit-metadata' | 'semantic-inference';
  explanationAR: string;
}

export interface SceneActivityDefinition {
  id: string;
  labelAR: string;
  prompt: string;
  mechanics: string;
  gaze: string;
  handBehavior: string;
  families?: SceneFamilyId[];
  requiresFurnitureAny?: FurnitureId[];
  requiresFurnitureAll?: FurnitureId[];
  requiresSurfacesAny?: SurfaceId[];
  requiresFeaturesAny?: SpatialFeatureId[];
  compatiblePoseIds: string[];
  tags: string[];
}

export interface ScenePoseDefinition {
  id: string;
  labelAR: string;
  prompt: string;
  bodyMechanics: string;
  contactPoints: string[];
  cameraImplications: string[];
  requiresFurnitureAny?: FurnitureId[];
  requiresFurnitureAll?: FurnitureId[];
  requiresSurfacesAny?: SurfaceId[];
  requiresFeaturesAny?: SpatialFeatureId[];
}

export interface SceneActivityPoseResolution {
  activity: string;
  pose: string;
  activityChanged: boolean;
  poseChanged: boolean;
  capabilities: SceneCapabilityProfile;
  activities: SceneActivityDefinition[];
  poses: ScenePoseDefinition[];
}

const dedupe = <T>(items: T[]): T[] => Array.from(new Set(items));

const containsAny = (text: string, tokens: string[]): boolean =>
  tokens.some(token => text.includes(token));

const hasAny = <T>(actual: T[], required?: T[]): boolean =>
  !required?.length || required.some(item => actual.includes(item));

const hasAll = <T>(actual: T[], required?: T[]): boolean =>
  !required?.length || required.every(item => actual.includes(item));

const isCompatible = (
  capabilities: SceneCapabilityProfile,
  requirements: Pick<
    SceneActivityDefinition,
    'requiresFurnitureAny' | 'requiresFurnitureAll' | 'requiresSurfacesAny' | 'requiresFeaturesAny'
  >
): boolean =>
  hasAny(capabilities.furniture, requirements.requiresFurnitureAny) &&
  hasAll(capabilities.furniture, requirements.requiresFurnitureAll) &&
  hasAny(capabilities.surfaces, requirements.requiresSurfacesAny) &&
  hasAny(capabilities.spatialFeatures, requirements.requiresFeaturesAny);

const isPoseCompatible = (
  capabilities: SceneCapabilityProfile,
  pose: ScenePoseDefinition
): boolean =>
  hasAny(capabilities.furniture, pose.requiresFurnitureAny) &&
  hasAll(capabilities.furniture, pose.requiresFurnitureAll) &&
  hasAny(capabilities.surfaces, pose.requiresSurfacesAny) &&
  hasAny(capabilities.spatialFeatures, pose.requiresFeaturesAny);

export function getSceneCapabilities(
  familyId: SceneFamilyId,
  subScene: string,
  microLoc?: MicroLocation
): SceneCapabilityProfile {
  const text = [
    subScene,
    microLoc?.labelAR,
    microLoc?.environmentPrompt,
    microLoc?.spatialBehavior,
    ...(microLoc?.backgroundElements ?? [])
  ].filter(Boolean).join(' ').toLowerCase();

  const furniture = new Set<FurnitureId>();
  const surfaces = new Set<SurfaceId>();
  const spatialFeatures = new Set<SpatialFeatureId>();

  const addFurniture = (...items: FurnitureId[]) => items.forEach(item => furniture.add(item));
  const addSurfaces = (...items: SurfaceId[]) => items.forEach(item => surfaces.add(item));
  const addFeatures = (...items: SpatialFeatureId[]) => items.forEach(item => spatialFeatures.add(item));

  // Family defaults establish only furniture/features that are structurally inherent to the family.
  if (familyId === 'bedroom') {
    addFeatures('bedroom-zone');
    if (containsAny(text, ['bed', 'سرير', 'mattress', 'headboard', 'pillow'])) {
      addFurniture('bed');
      addSurfaces('bed-edge');
    }
    if (containsAny(text, ['chair', 'كرسي'])) addFurniture('visitor-chair');
    if (containsAny(text, ['wall', 'جدار'])) addSurfaces('wall-support');
    if (containsAny(text, ['window', 'نافذة'])) addFeatures('window-side');
  }

  if (familyId === 'living-room') {
    addFeatures('living-room-zone');
    if (containsAny(text, ['sofa', 'couch', 'كنبة', 'أريكة'])) addFurniture('sofa');
    if (containsAny(text, ['table', 'طاولة'])) {
      addFurniture('side-table');
      addSurfaces('side-table-surface');
    }
    if (containsAny(text, ['chair', 'كرسي'])) addFurniture('visitor-chair');
    if (containsAny(text, ['wall', 'جدار'])) addSurfaces('wall-support');
  }

  if (familyId === 'gym') {
    addFeatures('gym-zone');
    if (containsAny(text, ['bench', 'مقعد'])) addFurniture('gym-bench');
    if (containsAny(text, ['machine', 'equipment', 'جهاز', 'أجهزة', 'rack', 'treadmill'])) {
      addFurniture('gym-equipment');
      addSurfaces('gym-machine');
    }
  }

  if (familyId === 'car') {
    if (!microLoc?.isOutdoor) addFeatures('vehicle-interior');
    if (containsAny(text, ['driver', 'السائق', 'steering', 'مقود'])) {
      addFurniture('driver-seat');
      addSurfaces('steering-wheel', 'center-console');
    }
    if (containsAny(text, ['passenger', 'الراكب'])) addFurniture('passenger-seat');
    if (containsAny(text, ['rear seat', 'المقعد الخلفي', 'rear-seat'])) addFurniture('rear-seat');
    if (containsAny(text, ['door', 'باب'])) addSurfaces('car-door');

    // Do not treat a parked car merely visible through the windshield/window as
    // the subject's physical car-side location. Exterior car interaction must
    // come from the selected micro-location itself.
    const carSubScene = (subScene || microLoc?.labelAR || '').toLowerCase();
    const isExteriorCarLocation = Boolean(
      microLoc?.isOutdoor ||
      containsAny(carSubScene, ['بجانب السيارة', 'خارج السيارة', 'عند باب السيارة', 'موقف', 'parking', 'outside'])
    );
    if (isExteriorCarLocation) {
      addFurniture('parked-car');
      addFeatures('parking', 'exterior-open');
      addSurfaces('car-door');
    }
  }

  if (familyId === 'saudi-outdoor') {
    addFeatures('exterior-open');
    if (containsAny(text, ['street', 'شارع', 'road', 'طريق'])) addFeatures('street');
    if (containsAny(text, ['sidewalk', 'رصيف', 'walkway', 'ممشى'])) addFeatures('sidewalk');
    if (containsAny(text, ['cafe', 'coffee', 'مقهى'])) {
      addFeatures('cafe-zone');
      if (containsAny(text, ['chair', 'كرسي', 'seating'])) addFurniture('cafe-chair');
      if (containsAny(text, ['table', 'طاولة'])) {
        addFurniture('cafe-table');
        addSurfaces('side-table-surface');
      }
      if (containsAny(text, ['counter', 'كاونتر'])) {
        addFurniture('counter');
        addSurfaces('counter-surface');
      }
    }
    if (containsAny(text, ['shop', 'store', 'محل', 'بقالة', 'صيدلية'])) addFeatures('shop-zone');
    if (containsAny(text, ['park', 'حديقة'])) {
      addFeatures('park-zone');
      if (containsAny(text, ['bench', 'مقعد'])) addFurniture('outdoor-bench');
    }
    if (containsAny(text, ['parking', 'موقف', 'parked car', 'سيارة متوقفة', 'سيارات'])) {
      addFeatures('parking');
      addFurniture('parked-car');
      addSurfaces('car-door');
    }
    if (containsAny(text, ['entrance', 'مدخل', 'door', 'باب', 'gate', 'بوابة'])) addFeatures('doorway');
    if (containsAny(text, ['wall', 'سور', 'جدار'])) addSurfaces('wall-support');
  }

  if (familyId === 'military-base') {
    const zone = microLoc?.zone;
    if (zone === 'office') addFeatures('office-room');
    if (zone === 'corridor') addFeatures('corridor');
    if (zone === 'entrance') addFeatures('doorway');
    if (zone === 'waiting') addFeatures('waiting-zone');
    if (zone === 'meeting') addFeatures('meeting-room');
    if (zone === 'break') addFeatures('break-area');
    if (zone === 'service') addFeatures('service-zone');
    if (zone === 'stairs') addFeatures('stairs', 'stair-landing');
    if (zone === 'parking') addFeatures('parking', 'exterior-open');
    if (zone === 'exterior') addFeatures('exterior-open');

    if (containsAny(text, ['desk', 'مكتب', 'workstation'])) {
      addFurniture('desk');
      addSurfaces('desk-surface');
    }
    if (containsAny(text, ['office chair', 'task chair', 'swivel chair', 'كرسي مكتب'])) addFurniture('office-chair');
    if (containsAny(text, ['visitor chair', 'visitor chairs', 'كرسي زائر'])) addFurniture('visitor-chair');

    if (containsAny(text, ['meeting', 'conference', 'اجتماع'])) addFeatures('meeting-room');
    if (containsAny(text, ['conference table', 'meeting table', 'طاولة الاجتماعات', 'طاولة اجتماع'])) {
      addFurniture('meeting-table');
      addSurfaces('meeting-table-surface');
    }
    if (containsAny(text, ['conference chair', 'meeting chair', 'conference chairs', 'كرسي الاجتماع', 'كراسي الاجتماع'])) addFurniture('meeting-chair');

    if (containsAny(text, ['waiting chair', 'waiting chairs', 'كراسي انتظار', 'كرسي انتظار'])) {
      addFurniture('waiting-chair');
      addFeatures('waiting-zone');
    }

    if (containsAny(text, ['break table', 'laminate table', 'استراحة', 'break room'])) {
      addFurniture('break-table');
      addSurfaces('side-table-surface');
      addFeatures('break-area');
    }
    if (containsAny(text, ['kitchenette counter', 'counter', 'كاونتر', 'ركن قهوة'])) {
      addFurniture('counter');
      addSurfaces('counter-surface');
    }
    if (containsAny(text, ['chair', 'كرسي']) && zone === 'break') addFurniture('visitor-chair');

    if (containsAny(text, ['corridor', 'hallway', 'ممر'])) addFeatures('corridor');
    if (containsAny(text, ['door', 'doorway', 'entrance', 'باب', 'مدخل'])) addFeatures('doorway');
    if (containsAny(text, ['window', 'نافذة'])) addFeatures('window-side');
    if (containsAny(text, ['stairs', 'stair', 'درج'])) addFeatures('stairs');
    if (containsAny(text, ['landing', 'بسطة'])) addFeatures('stair-landing');
    if (containsAny(text, ['railing', 'درابزين'])) addSurfaces('stair-railing');
    if (containsAny(text, ['wall', 'جدار'])) addSurfaces('wall-support');

    if (containsAny(text, ['parking', 'موقف', 'parked vehicle', 'parked car', 'سيارة متوقفة', 'السيارات'])) {
      addFeatures('parking');
      addFurniture('parked-car');
      addSurfaces('car-door');
    }
  }

  // Semantic inference shared across all families.
  if (containsAny(text, ['chair', 'كرسي']) && !furniture.size) addFurniture('visitor-chair');
  if (containsAny(text, ['wall', 'جدار', 'سور'])) addSurfaces('wall-support');
  if (containsAny(text, ['window', 'نافذة'])) addFeatures('window-side');
  if (containsAny(text, ['door', 'باب', 'entrance', 'مدخل'])) addFeatures('doorway');
  if (containsAny(text, ['corridor', 'hallway', 'ممر'])) addFeatures('corridor');

  return {
    familyId,
    subScene,
    furniture: Array.from(furniture),
    surfaces: Array.from(surfaces),
    spatialFeatures: Array.from(spatialFeatures),
    source: 'semantic-inference',
    explanationAR: 'الاقتراحات مبنية على الأثاث والأسطح والمساحة الموجودة فعليًا في الزاوية الفرعية المختارة.'
  };
}

const ACTIVITY_CATALOG: SceneActivityDefinition[] = [
  {
    id: 'standing-natural',
    labelAR: 'واقف بشكل طبيعي',
    prompt: 'standing naturally without staging a formal pose',
    mechanics: 'weight rests asymmetrically through both feet with relaxed shoulders and subtle postural sway',
    gaze: 'natural lens or nearby environmental gaze',
    handBehavior: 'free hand hangs naturally or rests near the torso without a duplicated gesture',
    compatiblePoseIds: ['stand-relaxed','stand-upright','stand-weight-shift','stand-near-desk','stand-beside-meeting-table','stand-near-car','stand-near-doorway','stand-near-window','stand-by-gym-equipment'],
    tags: ['standing','static']
  },
  {
    id: 'waiting',
    labelAR: 'ينتظر',
    prompt: 'waiting naturally in the selected place',
    mechanics: 'small weight shifts and low-energy posture consistent with waiting',
    gaze: 'intermittent gaze toward the relevant doorway, road, counter, or surrounding space',
    handBehavior: 'hands remain relaxed; phone use is optional only if separately selected',
    compatiblePoseIds: ['stand-relaxed','stand-weight-shift','sit-waiting-chair','sit-office-chair','sit-meeting-chair','sit-cafe-chair','sit-sofa','sit-gym-bench'],
    tags: ['waiting']
  },
  {
    id: 'look-around',
    labelAR: 'ينظر حوله',
    prompt: 'quietly observing the surrounding place',
    mechanics: 'small head turn while torso remains naturally settled',
    gaze: 'eyes track an off-camera environmental cue',
    handBehavior: 'hands remain passive and unposed',
    compatiblePoseIds: ['stand-relaxed','stand-upright','sit-office-chair','sit-meeting-chair','sit-waiting-chair','sit-cafe-chair','sit-sofa','sit-bed-edge','driver-seat','passenger-seat','sit-gym-bench'],
    tags: ['gaze','ambient']
  },
  {
    id: 'use-phone',
    labelAR: 'يستخدم الهاتف',
    prompt: 'using the phone casually for an ordinary task',
    mechanics: 'phone grip, thumb motion, wrist angle, and neck flexion stay anatomically plausible',
    gaze: 'attention naturally alternates between screen and surroundings',
    handBehavior: 'one hand supports the phone while the other remains free unless needed for typing',
    compatiblePoseIds: ['stand-relaxed','stand-weight-shift','sit-office-chair','sit-meeting-chair','sit-waiting-chair','sit-cafe-chair','sit-sofa','sit-bed-edge','driver-seat','passenger-seat','rear-seat','sit-gym-bench'],
    tags: ['phone']
  },
  {
    id: 'read-message',
    labelAR: 'يقرأ رسالة',
    prompt: 'reading a message on the phone',
    mechanics: 'phone held at a believable reading distance with slight neck flexion',
    gaze: 'eyes focus on the phone display',
    handBehavior: 'phone supported securely without floating fingers',
    compatiblePoseIds: ['stand-relaxed','sit-office-chair','sit-meeting-chair','sit-waiting-chair','sit-cafe-chair','sit-sofa','sit-bed-edge','driver-seat','passenger-seat','rear-seat'],
    tags: ['phone','reading']
  },
  {
    id: 'write-message',
    labelAR: 'يكتب رسالة',
    prompt: 'typing a short message on the phone',
    mechanics: 'thumb and wrist movement match casual texting',
    gaze: 'eyes remain on the screen',
    handBehavior: 'one- or two-handed grip stays physically consistent with the capture mode',
    compatiblePoseIds: ['stand-relaxed','sit-office-chair','sit-meeting-chair','sit-waiting-chair','sit-cafe-chair','sit-sofa','sit-bed-edge','passenger-seat','rear-seat'],
    tags: ['phone','typing']
  },
  {
    id: 'phone-call',
    labelAR: 'يجري مكالمة',
    prompt: 'making a short casual phone call',
    mechanics: 'phone reaches the ear with natural elbow bend and shoulder separation',
    gaze: 'unfixed conversational gaze away from the lens',
    handBehavior: 'one hand holds the phone at the ear while the other stays relaxed',
    compatiblePoseIds: ['stand-relaxed','stand-weight-shift','sit-office-chair','sit-waiting-chair','sit-cafe-chair','sit-sofa','passenger-seat','rear-seat'],
    tags: ['phone','call']
  },
  {
    id: 'walk-corridor',
    labelAR: 'يمشي داخل الممر',
    prompt: 'walking naturally through the corridor',
    mechanics: 'ordinary alternating gait with correct floor contact and passage clearance',
    gaze: 'forward attention along the walking path',
    handBehavior: 'free arm counter-swings naturally; carried items stay close to the body',
    requiresFeaturesAny: ['corridor'],
    compatiblePoseIds: ['walk-corridor'],
    tags: ['walking','motion']
  },
  {
    id: 'walk-outdoor',
    labelAR: 'يمشي بهدوء',
    prompt: 'walking at a relaxed everyday pace',
    mechanics: 'natural gait cycle with grounded step timing and mild arm counter-swing',
    gaze: 'forward or slightly off-camera environmental gaze',
    handBehavior: 'arms swing naturally unless one hand is occupied',
    requiresFeaturesAny: ['street','sidewalk','exterior-open','parking'],
    compatiblePoseIds: ['walk-outdoor','walk-parking'],
    tags: ['walking','motion']
  },
  {
    id: 'desk-work',
    labelAR: 'عمل مكتبي',
    prompt: 'performing ordinary administrative desk work',
    mechanics: 'torso, chair, desk, forearms, and documents share realistic support relationships',
    gaze: 'attention directed toward work surface, file, or monitor',
    handBehavior: 'forearms rest naturally near the work surface without intersecting the desk',
    families: ['military-base'],
    requiresFurnitureAll: ['desk','office-chair'],
    compatiblePoseIds: ['sit-office-chair','sit-at-desk'],
    tags: ['work','seated']
  },
  {
    id: 'review-file',
    labelAR: 'يراجع ملفًا',
    prompt: 'reviewing an ordinary administrative file',
    mechanics: 'file is supported by the desk, table, or hands with natural page handling',
    gaze: 'eyes follow the file pages',
    handBehavior: 'fingers support page edges without duplicated or impossible grips',
    families: ['military-base'],
    requiresFurnitureAny: ['desk','meeting-table'],
    compatiblePoseIds: ['sit-at-desk','sit-front-meeting-table','sit-meeting-chair','stand-near-desk','stand-beside-meeting-table'],
    tags: ['work','reading']
  },
  {
    id: 'hold-papers',
    labelAR: 'يحمل أوراقًا',
    prompt: 'holding a small stack of ordinary work papers',
    mechanics: 'paper stack is supported against gravity close to the torso',
    gaze: 'forward workplace gaze',
    handBehavior: 'one forearm or hand supports the papers naturally',
    families: ['military-base'],
    compatiblePoseIds: ['stand-relaxed','stand-upright','stand-near-desk','stand-near-doorway','walk-corridor'],
    tags: ['work','standing']
  },
  {
    id: 'enter-room',
    labelAR: 'يدخل المكان',
    prompt: 'entering the selected room naturally',
    mechanics: 'one foot advances through the doorway while shoulders clear the frame',
    gaze: 'attention directed inside the room',
    handBehavior: 'hands stay clear of the doorway unless touching the handle is physically visible',
    requiresFeaturesAny: ['doorway'],
    compatiblePoseIds: ['cross-doorway'],
    tags: ['walking','transition']
  },
  {
    id: 'leave-room',
    labelAR: 'خارج من المكان',
    prompt: 'leaving the selected room naturally',
    mechanics: 'body crosses the doorway with correct shoulder and foot clearance',
    gaze: 'attention directed toward the destination outside the room',
    handBehavior: 'arms remain natural and do not clip the door frame',
    requiresFeaturesAny: ['doorway'],
    compatiblePoseIds: ['cross-doorway'],
    tags: ['walking','transition']
  },
  {
    id: 'wait-appointment',
    labelAR: 'ينتظر موعدًا',
    prompt: 'waiting quietly for an appointment',
    mechanics: 'low-energy waiting posture matched to the waiting furniture or doorway',
    gaze: 'attention occasionally shifts toward the relevant office or corridor',
    handBehavior: 'hands rest naturally on lap, chair edge, or near the torso',
    requiresFeaturesAny: ['waiting-zone','doorway'],
    compatiblePoseIds: ['sit-waiting-chair','stand-relaxed','stand-near-doorway'],
    tags: ['waiting']
  },
  {
    id: 'meeting-sit',
    labelAR: 'جالس في اجتماع',
    prompt: 'sitting naturally in an ordinary administrative meeting',
    mechanics: 'pelvis is fully supported by the meeting chair while torso orientation respects the table edge',
    gaze: 'attention directed toward a participant or the table, not rigidly at the lens',
    handBehavior: 'hands rest on lap or near the table edge with realistic clearance',
    families: ['military-base'],
    requiresFurnitureAll: ['meeting-chair','meeting-table'],
    compatiblePoseIds: ['sit-meeting-chair','sit-front-meeting-table','sit-head-meeting-table'],
    tags: ['meeting','seated','work']
  },
  {
    id: 'review-table-docs',
    labelAR: 'يراجع أوراقًا على الطاولة',
    prompt: 'reviewing ordinary papers laid on the meeting table',
    mechanics: 'upper torso leans only slightly toward the tabletop while chair and table support remain realistic',
    gaze: 'eyes focus on the papers',
    handBehavior: 'one hand may stabilize a page while the other rests near the table edge',
    families: ['military-base'],
    requiresFurnitureAll: ['meeting-chair','meeting-table'],
    compatiblePoseIds: ['sit-front-meeting-table','sit-head-meeting-table'],
    tags: ['meeting','reading','seated']
  },
  {
    id: 'write-notes',
    labelAR: 'يكتب ملاحظات',
    prompt: 'writing a short note at the meeting table',
    mechanics: 'writing forearm rests naturally on the tabletop with mild forward torso inclination',
    gaze: 'eyes follow the paper while writing',
    handBehavior: 'writing hand grips a pen naturally while the other stabilizes the page',
    families: ['military-base'],
    requiresFurnitureAll: ['meeting-chair','meeting-table'],
    compatiblePoseIds: ['sit-front-meeting-table','sit-head-meeting-table'],
    tags: ['meeting','writing','seated']
  },
  {
    id: 'stand-meeting-table',
    labelAR: 'واقف بجانب طاولة الاجتماعات',
    prompt: 'standing naturally beside the meeting table',
    mechanics: 'body remains clear of chair backs and table edge',
    gaze: 'natural room or lens-adjacent gaze',
    handBehavior: 'one hand may rest lightly near a chair back while the other remains relaxed',
    families: ['military-base'],
    requiresFurnitureAny: ['meeting-table'],
    compatiblePoseIds: ['stand-beside-meeting-table','stand-behind-meeting-chair'],
    tags: ['meeting','standing']
  },
  {
    id: 'prepare-to-sit',
    labelAR: 'يسحب الكرسي ليجلس',
    prompt: 'pulling a chair back slightly to sit down',
    mechanics: 'chair translates a short realistic distance while body weight remains on the feet before sitting',
    gaze: 'brief task-focused gaze toward the chair or table',
    handBehavior: 'one hand grips the chair back at a plausible height',
    requiresFurnitureAny: ['meeting-chair','office-chair','waiting-chair','cafe-chair','visitor-chair'],
    compatiblePoseIds: ['pull-chair'],
    tags: ['transition','chair']
  },
  {
    id: 'sit-waiting',
    labelAR: 'جالس ينتظر',
    prompt: 'sitting naturally while waiting',
    mechanics: 'pelvis and back are supported by the waiting chair with feet grounded',
    gaze: 'relaxed waiting gaze toward the room or phone',
    handBehavior: 'hands rest on thighs, lap, or chair edges naturally',
    requiresFurnitureAny: ['waiting-chair'],
    compatiblePoseIds: ['sit-waiting-chair'],
    tags: ['waiting','seated']
  },
  {
    id: 'coffee-break',
    labelAR: 'يشرب قهوة',
    prompt: 'taking an ordinary coffee break',
    mechanics: 'cup is supported by the hand with believable wrist alignment',
    gaze: 'brief gaze toward the cup or surrounding space',
    handBehavior: 'cup remains close to the torso or table and follows gravity',
    requiresFeaturesAny: ['cafe-zone','break-area'],
    compatiblePoseIds: ['sit-cafe-chair','sit-break-chair','stand-counter','stand-relaxed'],
    tags: ['drink','break']
  },
  {
    id: 'sit-cafe',
    labelAR: 'جالس في المقهى',
    prompt: 'sitting naturally in the café area',
    mechanics: 'chair supports the pelvis while the table remains at a believable distance',
    gaze: 'relaxed café gaze',
    handBehavior: 'hands rest on lap, chair, cup, or table edge without clipping',
    requiresFurnitureAny: ['cafe-chair'],
    compatiblePoseIds: ['sit-cafe-chair'],
    tags: ['seated','cafe']
  },
  {
    id: 'sit-sofa',
    labelAR: 'جالس على الكنبة',
    prompt: 'sitting naturally on the sofa',
    mechanics: 'hips and back compress sofa cushions asymmetrically',
    gaze: 'relaxed room gaze',
    handBehavior: 'hands rest naturally on lap, cushion, or armrest',
    requiresFurnitureAny: ['sofa'],
    compatiblePoseIds: ['sit-sofa'],
    tags: ['seated','relaxed']
  },
  {
    id: 'sit-bed-edge',
    labelAR: 'جالس على حافة السرير',
    prompt: 'sitting naturally on the edge of the bed',
    mechanics: 'mattress edge compresses beneath the pelvis while feet remain grounded',
    gaze: 'relaxed bedroom gaze',
    handBehavior: 'hands rest on thighs or mattress edge naturally',
    requiresFurnitureAny: ['bed'],
    compatiblePoseIds: ['sit-bed-edge'],
    tags: ['seated','bed']
  },
  {
    id: 'recline-bed',
    labelAR: 'مسترخٍ على السرير',
    prompt: 'resting naturally on the bed',
    mechanics: 'body weight visibly deforms mattress and pillows',
    gaze: 'soft relaxed gaze',
    handBehavior: 'arms rest with gravity rather than symmetrical posing',
    requiresFurnitureAny: ['bed'],
    compatiblePoseIds: ['recline-bed','lie-bed'],
    tags: ['reclined','bed']
  },
  {
    id: 'gym-rest',
    labelAR: 'يستريح بين الجولات',
    prompt: 'resting naturally between exercise sets',
    mechanics: 'body weight is supported by the gym bench or nearby equipment with mild exertion posture',
    gaze: 'downward or distant recovery gaze',
    handBehavior: 'hands rest on thighs, bottle, towel, or bench without staged symmetry',
    families: ['gym'],
    requiresFurnitureAny: ['gym-bench','gym-equipment'],
    compatiblePoseIds: ['sit-gym-bench','stand-by-gym-equipment'],
    tags: ['sport','seated','fatigue']
  },
  {
    id: 'stand-near-car',
    labelAR: 'واقف قرب السيارة',
    prompt: 'standing naturally beside a parked car',
    mechanics: 'body remains clear of the vehicle body with correct human-to-car scale',
    gaze: 'casual parking-area gaze',
    handBehavior: 'one hand may remain near the door handle only if physically visible',
    requiresFurnitureAny: ['parked-car'],
    compatiblePoseIds: ['stand-near-car','hand-on-car-door'],
    tags: ['car','standing']
  },
  {
    id: 'walk-parking',
    labelAR: 'يمشي بين السيارات',
    prompt: 'walking naturally through the parking area',
    mechanics: 'gait follows the parking aisle with safe clearance from parked vehicles',
    gaze: 'forward attention along the parking path',
    handBehavior: 'free arm swings naturally; phone or keys remain secondary',
    requiresFeaturesAny: ['parking'],
    compatiblePoseIds: ['walk-parking'],
    tags: ['walking','parking','motion']
  },
  {
    id: 'driver-parked',
    labelAR: 'جالس خلف المقود والسيارة متوقفة',
    prompt: 'sitting naturally in the driver seat of a fully stationary vehicle',
    mechanics: 'back and pelvis are seat-supported with steering-wheel clearance',
    gaze: 'road-ahead or brief lens-adjacent gaze',
    handBehavior: 'hands rest naturally near the wheel or console without driving-motion tension',
    families: ['car'],
    requiresFurnitureAny: ['driver-seat'],
    compatiblePoseIds: ['driver-seat'],
    tags: ['car','driver','seated']
  },
  {
    id: 'passenger-seated',
    labelAR: 'جالس في مقعد الراكب',
    prompt: 'sitting naturally in the front passenger seat',
    mechanics: 'back and pelvis are supported by the passenger seat with dashboard clearance',
    gaze: 'relaxed forward or side-window gaze',
    handBehavior: 'hands rest near lap, door armrest, or phone naturally',
    families: ['car'],
    requiresFurnitureAny: ['passenger-seat'],
    compatiblePoseIds: ['passenger-seat'],
    tags: ['car','passenger','seated']
  }
];

const POSE_CATALOG: ScenePoseDefinition[] = [
  {
    id: 'stand-relaxed',
    labelAR: 'واقف باسترخاء طبيعي',
    prompt: 'standing in a relaxed natural posture',
    bodyMechanics: 'weight shifted slightly toward one leg, knees unlocked, shoulders non-symmetrical',
    contactPoints: ['both feet grounded on the actual floor or ground surface'],
    cameraImplications: ['compatible with standard handheld selfie geometry']
  },
  {
    id: 'stand-upright',
    labelAR: 'واقف باستقامة',
    prompt: 'standing upright with restrained professional posture',
    bodyMechanics: 'spine upright, feet grounded, shoulders relaxed rather than rigidly squared',
    contactPoints: ['both feet grounded with realistic stance width'],
    cameraImplications: ['eye-level or slightly off-center selfie remains natural']
  },
  {
    id: 'stand-weight-shift',
    labelAR: 'واقف مع نقل الوزن على قدم واحدة',
    prompt: 'standing with a subtle natural weight shift',
    bodyMechanics: 'pelvis shifts slightly over the supporting leg while the free knee softens',
    contactPoints: ['supporting foot fully grounded', 'other foot lightly loaded'],
    cameraImplications: ['mild off-axis framing is preferred']
  },
  {
    id: 'stand-near-desk',
    labelAR: 'واقف بجانب المكتب',
    prompt: 'standing naturally beside the desk',
    bodyMechanics: 'torso stays clear of the desktop while one hip may align near the desk edge',
    contactPoints: ['feet grounded beside workstation'],
    cameraImplications: ['desk edge may occupy lower side of frame'],
    requiresFurnitureAny: ['desk']
  },
  {
    id: 'sit-office-chair',
    labelAR: 'جالس على كرسي المكتب',
    prompt: 'sitting naturally on the office chair',
    bodyMechanics: 'pelvis and lower back are supported by the chair; knees remain naturally bent',
    contactPoints: ['pelvis on office-chair seat', 'back lightly supported', 'feet grounded'],
    cameraImplications: ['camera height should adapt to seated eye level'],
    requiresFurnitureAny: ['office-chair']
  },
  {
    id: 'sit-at-desk',
    labelAR: 'جالس خلف المكتب',
    prompt: 'sitting behind the administrative desk',
    bodyMechanics: 'chair supports the pelvis and back while the desk naturally occludes part of the lower torso',
    contactPoints: ['pelvis on office chair', 'feet grounded beneath desk', 'forearms may contact desktop'],
    cameraImplications: ['tabletop occlusion and seated camera height must be preserved'],
    requiresFurnitureAll: ['desk','office-chair']
  },
  {
    id: 'lean-desk',
    labelAR: 'مستند بخفة على المكتب',
    prompt: 'leaning lightly against the desk without sitting on it',
    bodyMechanics: 'small share of body weight transfers to the desk edge while feet retain primary support',
    contactPoints: ['feet grounded', 'hip or hand lightly contacting desk edge'],
    cameraImplications: ['avoid impossible desk penetration'],
    requiresFurnitureAny: ['desk'],
    requiresSurfacesAny: ['desk-surface']
  },
  {
    id: 'sit-meeting-chair',
    labelAR: 'جالس على كرسي الاجتماع',
    prompt: 'sitting naturally on a meeting chair',
    bodyMechanics: 'pelvis fully supported with relaxed lumbar posture and grounded feet',
    contactPoints: ['pelvis on meeting-chair seat', 'feet grounded'],
    cameraImplications: ['seated eye level must replace standing camera assumptions'],
    requiresFurnitureAny: ['meeting-chair']
  },
  {
    id: 'sit-front-meeting-table',
    labelAR: 'جالس أمام طاولة الاجتماعات',
    prompt: 'sitting on a meeting chair directly in front of the conference table',
    bodyMechanics: 'chair-to-table spacing allows knees under the table while torso stays a natural distance from the edge',
    contactPoints: ['pelvis on meeting chair', 'feet grounded beneath or ahead of table', 'forearms may rest on tabletop'],
    cameraImplications: ['conference table should occlude the lower torso naturally'],
    requiresFurnitureAll: ['meeting-chair','meeting-table']
  },
  {
    id: 'sit-head-meeting-table',
    labelAR: 'جالس عند رأس طاولة الاجتماعات',
    prompt: 'sitting naturally at the head of the meeting table',
    bodyMechanics: 'chair centered near the table end with realistic elbow and knee clearance',
    contactPoints: ['pelvis on meeting chair', 'feet grounded', 'hands may rest near table end'],
    cameraImplications: ['table vanishing lines should extend away from the subject'],
    requiresFurnitureAll: ['meeting-chair','meeting-table']
  },
  {
    id: 'stand-beside-meeting-table',
    labelAR: 'واقف بجانب طاولة الاجتماعات',
    prompt: 'standing beside the meeting table',
    bodyMechanics: 'body remains outside chair backs and table footprint',
    contactPoints: ['feet grounded beside table'],
    cameraImplications: ['table context should remain visible without dominating the face'],
    requiresFurnitureAny: ['meeting-table']
  },
  {
    id: 'stand-behind-meeting-chair',
    labelAR: 'واقف خلف كرسي الاجتماع',
    prompt: 'standing naturally behind a meeting chair',
    bodyMechanics: 'torso remains behind chair back with correct shoulder and hand clearance',
    contactPoints: ['feet grounded behind chair', 'one hand may touch chair back lightly'],
    cameraImplications: ['chair back becomes a real foreground contact cue'],
    requiresFurnitureAny: ['meeting-chair']
  },
  {
    id: 'pull-chair',
    labelAR: 'يسحب الكرسي للجلوس',
    prompt: 'pulling the chair back slightly before sitting',
    bodyMechanics: 'body remains standing while chair moves a short realistic distance',
    contactPoints: ['feet grounded', 'one hand gripping chair back'],
    cameraImplications: ['capture should preserve action clearance around the chair'],
    requiresFurnitureAny: ['meeting-chair','office-chair','waiting-chair','cafe-chair','visitor-chair']
  },
  {
    id: 'sit-waiting-chair',
    labelAR: 'جالس على كرسي انتظار',
    prompt: 'sitting naturally on a waiting chair',
    bodyMechanics: 'pelvis and back are supported with feet grounded and no desk/table interaction invented',
    contactPoints: ['pelvis on waiting-chair seat', 'feet grounded'],
    cameraImplications: ['seated camera height and waiting-area background should remain coherent'],
    requiresFurnitureAny: ['waiting-chair']
  },
  {
    id: 'stand-near-doorway',
    labelAR: 'واقف قرب المدخل',
    prompt: 'standing beside the doorway without blocking circulation',
    bodyMechanics: 'shoulders and feet remain clear of the door swing path',
    contactPoints: ['feet grounded beside doorway'],
    cameraImplications: ['door frame can provide vertical context'],
    requiresFeaturesAny: ['doorway']
  },
  {
    id: 'cross-doorway',
    labelAR: 'يعبر المدخل',
    prompt: 'crossing the doorway naturally',
    bodyMechanics: 'one foot leads through the threshold while shoulders clear the frame',
    contactPoints: ['leading foot at or beyond threshold', 'trailing foot grounded behind'],
    cameraImplications: ['motion phase must remain compatible with handheld framing'],
    requiresFeaturesAny: ['doorway']
  },
  {
    id: 'walk-corridor',
    labelAR: 'يمشي في الممر',
    prompt: 'walking naturally along the corridor',
    bodyMechanics: 'gait follows corridor axis with correct step phase and wall clearance',
    contactPoints: ['one foot in active ground contact', 'other foot transitioning'],
    cameraImplications: ['slight off-axis framing can reveal corridor depth'],
    requiresFeaturesAny: ['corridor']
  },
  {
    id: 'walk-outdoor',
    labelAR: 'يمشي بخطوات طبيعية',
    prompt: 'walking naturally through the outdoor scene',
    bodyMechanics: 'ordinary gait with grounded foot contact and mild arm counter-swing',
    contactPoints: ['alternating foot contact on actual pavement or ground'],
    cameraImplications: ['handheld camera must respect motion and arm reach'],
    requiresFeaturesAny: ['street','sidewalk','exterior-open']
  },
  {
    id: 'walk-parking',
    labelAR: 'يمشي بين صفوف السيارات',
    prompt: 'walking naturally through the parking aisle',
    bodyMechanics: 'gait follows the open aisle while maintaining vehicle clearance',
    contactPoints: ['foot contact on asphalt or paving'],
    cameraImplications: ['wider context may be needed to show parking geometry'],
    requiresFeaturesAny: ['parking']
  },
  {
    id: 'sit-cafe-chair',
    labelAR: 'جالس على كرسي المقهى',
    prompt: 'sitting naturally on the café chair',
    bodyMechanics: 'pelvis supported by chair with comfortable table clearance',
    contactPoints: ['pelvis on café chair', 'feet grounded'],
    cameraImplications: ['table edge may appear only if physically present'],
    requiresFurnitureAny: ['cafe-chair']
  },
  {
    id: 'stand-counter',
    labelAR: 'واقف بجانب الكاونتر',
    prompt: 'standing naturally beside the counter',
    bodyMechanics: 'torso remains clear of counter edge with relaxed stance',
    contactPoints: ['feet grounded', 'one hand may rest lightly on counter'],
    cameraImplications: ['counter line should remain physically aligned'],
    requiresFurnitureAny: ['counter']
  },
  {
    id: 'sit-break-chair',
    labelAR: 'جالس في منطقة الاستراحة',
    prompt: 'sitting naturally in the staff break area',
    bodyMechanics: 'chair supports pelvis and back with relaxed work-break posture',
    contactPoints: ['pelvis on chair', 'feet grounded'],
    cameraImplications: ['camera height adapts to seated posture'],
    requiresFeaturesAny: ['break-area']
  },
  {
    id: 'sit-sofa',
    labelAR: 'جالس على الكنبة',
    prompt: 'sitting naturally on the sofa',
    bodyMechanics: 'hips and back compress cushions asymmetrically',
    contactPoints: ['pelvis and back supported by sofa', 'feet grounded or naturally extended'],
    cameraImplications: ['seated eye level and cushion deformation remain visible'],
    requiresFurnitureAny: ['sofa']
  },
  {
    id: 'sit-bed-edge',
    labelAR: 'جالس على حافة السرير',
    prompt: 'sitting naturally on the bed edge',
    bodyMechanics: 'mattress edge compresses beneath pelvis while knees bend naturally',
    contactPoints: ['pelvis on mattress edge', 'feet grounded'],
    cameraImplications: ['camera angle follows seated eye level'],
    requiresFurnitureAny: ['bed']
  },
  {
    id: 'recline-bed',
    labelAR: 'نصف مستلقٍ على السرير',
    prompt: 'resting in a semi-reclined position on the bed',
    bodyMechanics: 'upper torso supported by mattress or pillows with realistic spine and hip angles',
    contactPoints: ['back and pelvis supported by bed', 'head may contact pillow'],
    cameraImplications: ['phone height and pitch adapt to reclined geometry'],
    requiresFurnitureAny: ['bed']
  },
  {
    id: 'lie-bed',
    labelAR: 'مستلقي على السرير',
    prompt: 'lying naturally on the bed',
    bodyMechanics: 'body weight visibly compresses mattress and pillow surfaces',
    contactPoints: ['back or side body supported by mattress', 'head supported by pillow if present'],
    cameraImplications: ['selfie geometry must remain reachable from a reclined arm position'],
    requiresFurnitureAny: ['bed']
  },
  {
    id: 'lean-wall',
    labelAR: 'مستند على الجدار',
    prompt: 'leaning lightly against the wall',
    bodyMechanics: 'small portion of upper-body weight transfers to the wall while feet stay grounded',
    contactPoints: ['shoulder or upper back touching wall', 'feet grounded'],
    cameraImplications: ['wall plane must not intersect body'],
    requiresSurfacesAny: ['wall-support']
  },
  {
    id: 'stand-near-window',
    labelAR: 'واقف بجانب النافذة',
    prompt: 'standing naturally beside the window',
    bodyMechanics: 'body remains clear of frame and sill',
    contactPoints: ['feet grounded beside window'],
    cameraImplications: ['side-light direction should follow window position'],
    requiresFeaturesAny: ['window-side']
  },
  {
    id: 'stand-near-car',
    labelAR: 'واقف بجانب السيارة',
    prompt: 'standing naturally beside a parked car',
    bodyMechanics: 'body remains outside vehicle bodywork with realistic clearance',
    contactPoints: ['feet grounded beside vehicle'],
    cameraImplications: ['vehicle scale and reflections must match camera position'],
    requiresFurnitureAny: ['parked-car']
  },
  {
    id: 'hand-on-car-door',
    labelAR: 'واقف ويده على باب السيارة',
    prompt: 'standing beside the parked car with one hand resting naturally on the closed door or handle area',
    bodyMechanics: 'shoulder, elbow, wrist, and hand align with the actual door surface',
    contactPoints: ['feet grounded', 'one hand contacting door or handle area'],
    cameraImplications: ['door reflection and contact shadow must respond to hand position'],
    requiresFurnitureAny: ['parked-car'],
    requiresSurfacesAny: ['car-door']
  },
  {
    id: 'driver-seat',
    labelAR: 'جالس في مقعد السائق',
    prompt: 'sitting naturally in the driver seat',
    bodyMechanics: 'seat supports pelvis and back with steering-wheel and console clearance',
    contactPoints: ['pelvis and back on driver seat', 'feet in footwell'],
    cameraImplications: ['phone remains inside cabin and clear of steering wheel'],
    requiresFurnitureAny: ['driver-seat']
  },
  {
    id: 'passenger-seat',
    labelAR: 'جالس في مقعد الراكب',
    prompt: 'sitting naturally in the front passenger seat',
    bodyMechanics: 'seat supports pelvis and back with dashboard and door clearance',
    contactPoints: ['pelvis and back on passenger seat', 'feet in footwell'],
    cameraImplications: ['phone remains inside cabin and respects dashboard geometry'],
    requiresFurnitureAny: ['passenger-seat']
  },
  {
    id: 'rear-seat',
    labelAR: 'جالس في المقعد الخلفي',
    prompt: 'sitting naturally in the rear seat',
    bodyMechanics: 'rear seat supports the body while front seats create plausible depth occlusion',
    contactPoints: ['pelvis and back on rear seat'],
    cameraImplications: ['phone stays inside cabin with front-seat clearance'],
    requiresFurnitureAny: ['rear-seat']
  },
  {
    id: 'sit-gym-bench',
    labelAR: 'جالس على مقعد التمرين',
    prompt: 'sitting naturally on the gym bench',
    bodyMechanics: 'pelvis supported by bench with mild post-exertion posture',
    contactPoints: ['pelvis on gym bench', 'feet grounded'],
    cameraImplications: ['seated camera height with gym equipment secondary'],
    requiresFurnitureAny: ['gym-bench']
  },
  {
    id: 'stand-by-gym-equipment',
    labelAR: 'واقف بجانب الأجهزة',
    prompt: 'standing naturally beside the gym equipment',
    bodyMechanics: 'body remains clear of moving equipment parts and handles',
    contactPoints: ['feet grounded beside equipment'],
    cameraImplications: ['equipment should remain secondary and correctly scaled'],
    requiresFurnitureAny: ['gym-equipment']
  },
  {
    id: 'stair-landing',
    labelAR: 'واقف على بسطة الدرج',
    prompt: 'standing naturally on the flat stair landing',
    bodyMechanics: 'both feet remain on the flat landing rather than balancing on a step edge',
    contactPoints: ['both feet grounded on landing'],
    cameraImplications: ['stair flights may create diagonal depth lines'],
    requiresFeaturesAny: ['stair-landing']
  },
  {
    id: 'stair-railing',
    labelAR: 'واقف بجانب درابزين الدرج',
    prompt: 'standing beside the stair railing',
    bodyMechanics: 'body stays on the landing or safe stair area with realistic railing clearance',
    contactPoints: ['feet grounded', 'one hand may rest lightly on railing'],
    cameraImplications: ['railing perspective must remain consistent'],
    requiresSurfacesAny: ['stair-railing']
  }
];

export function getSuggestedActivities(
  familyId: SceneFamilyId,
  subScene: string,
  microLoc?: MicroLocation
): SceneActivityDefinition[] {
  const capabilities = getSceneCapabilities(familyId, subScene, microLoc);

  const candidates = ACTIVITY_CATALOG.filter(activity => {
    if (activity.families?.length && !activity.families.includes(familyId)) return false;
    return isCompatible(capabilities, activity);
  });

  const priority = (activity: SceneActivityDefinition): number => {
    let score = 0;
    const features = capabilities.spatialFeatures;
    const furniture = capabilities.furniture;
    if (features.includes('meeting-room') && activity.tags.includes('meeting')) score += 50;
    if (features.includes('waiting-zone') && activity.tags.includes('waiting')) score += 35;
    if (features.includes('corridor') && activity.tags.includes('walking')) score += 35;
    if (features.includes('parking') && activity.tags.includes('parking')) score += 45;
    if (features.includes('break-area') && activity.tags.includes('break')) score += 40;
    if (features.includes('vehicle-interior') && activity.tags.includes('car')) score += 50;
    if (features.includes('gym-zone') && activity.tags.includes('sport')) score += 40;
    if (features.includes('bedroom-zone') && activity.tags.includes('bed')) score += 40;
    if (features.includes('living-room-zone') && activity.tags.includes('relaxed')) score += 30;
    if (furniture.includes('desk') && activity.tags.includes('work')) score += 35;
    if (activity.id === 'standing-natural') score += 5;
    return score;
  };

  return [...candidates].sort((a, b) => priority(b) - priority(a));
}

export function getSceneActivityDefinition(
  familyId: SceneFamilyId,
  subScene: string,
  activityLabel: string,
  microLoc?: MicroLocation
): SceneActivityDefinition {
  const suggestions = getSuggestedActivities(familyId, subScene, microLoc);
  return suggestions.find(item => item.labelAR === activityLabel)
    ?? suggestions[0]
    ?? ACTIVITY_CATALOG[0];
}

export function getSuggestedPoses(
  familyId: SceneFamilyId,
  subScene: string,
  activityLabel: string,
  microLoc?: MicroLocation
): ScenePoseDefinition[] {
  const capabilities = getSceneCapabilities(familyId, subScene, microLoc);
  const activity = getSceneActivityDefinition(familyId, subScene, activityLabel, microLoc);

  const compatible = POSE_CATALOG.filter(pose => {
    if (!isPoseCompatible(capabilities, pose)) return false;
    return activity.compatiblePoseIds.includes(pose.id);
  });

  if (compatible.length) return compatible;

  const sceneValid = POSE_CATALOG.filter(pose => isPoseCompatible(capabilities, pose));
  if (sceneValid.length) return sceneValid.slice(0, 8);

  return POSE_CATALOG.filter(pose => ['stand-relaxed','stand-upright','stand-weight-shift'].includes(pose.id));
}

export function getScenePoseDefinition(
  familyId: SceneFamilyId,
  subScene: string,
  activityLabel: string,
  poseLabel: string,
  microLoc?: MicroLocation
): ScenePoseDefinition {
  const poses = getSuggestedPoses(familyId, subScene, activityLabel, microLoc);
  return poses.find(item => item.labelAR === poseLabel)
    ?? poses[0]
    ?? POSE_CATALOG[0];
}

export function resolveSceneActivityPose(input: {
  familyId: SceneFamilyId;
  subScene: string;
  activity: string;
  pose: string;
  microLoc?: MicroLocation;
}): SceneActivityPoseResolution {
  const capabilities = getSceneCapabilities(input.familyId, input.subScene, input.microLoc);
  const activities = getSuggestedActivities(input.familyId, input.subScene, input.microLoc);
  const activity = activities.some(item => item.labelAR === input.activity)
    ? input.activity
    : activities[0]?.labelAR ?? 'واقف بشكل طبيعي';

  const poses = getSuggestedPoses(input.familyId, input.subScene, activity, input.microLoc);
  const pose = poses.some(item => item.labelAR === input.pose)
    ? input.pose
    : poses[0]?.labelAR ?? 'واقف باسترخاء طبيعي';

  return {
    activity,
    pose,
    activityChanged: activity !== input.activity,
    poseChanged: pose !== input.pose,
    capabilities,
    activities,
    poses
  };
}

export function getSceneActivityPosePrompt(input: {
  familyId: SceneFamilyId;
  subScene: string;
  activity: string;
  pose: string;
  microLoc?: MicroLocation;
}): {
  activity: SceneActivityDefinition;
  pose: ScenePoseDefinition;
  prompt: string;
} {
  const activity = getSceneActivityDefinition(input.familyId, input.subScene, input.activity, input.microLoc);
  const pose = getScenePoseDefinition(input.familyId, input.subScene, activity.labelAR, input.pose, input.microLoc);

  return {
    activity,
    pose,
    prompt: [
      `Activity: ${activity.prompt}.`,
      `Activity mechanics: ${activity.mechanics}.`,
      `Gaze: ${activity.gaze}.`,
      `Hands: ${activity.handBehavior}.`,
      `Pose/contact: ${pose.prompt}.`,
      `Body mechanics: ${pose.bodyMechanics}.`,
      `Contact points: ${pose.contactPoints.join('; ')}.`,
      `Camera implications: ${pose.cameraImplications.join('; ')}.`
    ].join(' ')
  };
}
