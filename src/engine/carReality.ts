/**
 * Canonical model and physical topology for the owner's fixed car scene.
 * Keep vehicle identity separate from the person's facial reference photo.
 * 2017 is pre-facelift L494, not the 2018+ Touch Pro Duo / restyled body.
 */
export type CarView = 'driver' | 'front-passenger' | 'rear-passenger' | 'front-center';

export function isCarExteriorSubScene(subScene: string, knownOutdoor?: boolean): boolean {
  if (typeof knownOutdoor === 'boolean') return knownOutdoor;
  const text = subScene.trim();
  if (/^(?:car_)/i.test(text)) {
    return /^(?:car_(?:outside_|beside_|front_quarter_|near_front_fender|in_front_trunk|open_parking_|shaded_parking_|building_parking|night_quiet_parking|front_residential_wall))/i.test(text);
  }
  // An occupied seat remains INSIDE even if its door is open or a parking lot is mentioned.
  if (/مقعد|المقعدين|داخل السيارة|داخل المركبة|خلف المقود|driver seat|passenger seat|inside (?:the )?car/i.test(text)) return false;
  return /خارج|بجانب|عند باب|قرب الرفرف|أمام السيارة|خلف السيارة|صندوق السيارة|موقف|مواقف|رصيف|تحت مظلة|outside|beside|parking|front fender/i.test(text);
}

export function carSeatView(subScene: string, pose = ''): CarView {
  const text = subScene + ' ' + pose;
  if (/rear_seat|المقعد الخلفي|rear seat/i.test(text)) return 'rear-passenger';
  if (/front_passenger|الراكب|passenger/i.test(text)) return 'front-passenger';
  if (/between_front_seats|بين المقعدين|front center/i.test(text)) return 'front-center';
  return 'driver';
}

export function describe2017RangeRoverSport(input: {
  subScene: string;
  outdoor: boolean;
  timeOfDay: string;
  lightingMode: string;
  pose?: string;
}): string {
  const { subScene, outdoor, timeOfDay, lightingMode } = input;
  const night = timeOfDay === 'night';
  const model = 'Exact stock 2017 Range Rover Sport L494 pre-facelift, factory Fuji White paint, never a later-generation or 2018+ facelift.';
  const cameraRule = 'Show only vehicle surfaces in this real camera field of view, at consistent scale and perspective; no floating camera, impossible full-car view or repeated parts.';
  if (!outdoor) {
    const seat = carSeatView(subScene, input.pose);
    const seatDescription = seat === 'front-passenger'
      ? 'Seated in the RIGHT front passenger seat; the center console is to the LEFT, right door and window to the RIGHT.'
      : seat === 'rear-passenger'
        ? 'Seated on a rear bench with a genuine front seatback ahead; dashboard only if a clear sightline exists.'
        : seat === 'front-center'
          ? 'Camera held by a real seated occupant toward the front centerline, not an unsupported floating camera between the seats.'
          : 'Seated in the LEFT driver seat with the steering wheel on the LEFT, seatback/headrest behind; steering wheel can occlude the lower frame.';
    const door = /driver_door_open|الباب مفتوح/.test(subScene)
      ? 'Driver door genuinely open, opening to the left; daylight or fixture light enters through that aperture, with realistic door swing clearance.'
      : 'Doors stay closed unless the chosen view explicitly opens one.';
    return [
      model,
      'Original 2017 cabin: one central infotainment touchscreen, separate physical climate controls, analog/period-correct instrument cluster; no 2018+ dual-stack touchscreens.',
      seatDescription,
      door,
      'Correct windshield, dashboard, A/B-pillars, tinted window and seatbelt occlusion only where actually in frame.',
      cameraRule,
      night ? 'Night cabin is dim; dashboard/dome lights remain off unless explicitly selected. Street/parking light enters only via real windows or open door.' : 'Daylight enters only through real glass or an open door, with pillar occlusion.'
    ].join(' ');
  }
  const view = /rear_quarter|in_front_trunk|صندوق|الجزء الخلفي|خلف السيارة/.test(subScene)
    ? 'Rear or rear-quarter view only: era-correct tailgate, rear lamps, bumper and adjoining side panel; no front grille appearing behind the person.'
    : /front_quarter|near_front_fender|front_residential_wall|أمام السيارة|الرفرف/.test(subScene)
      ? 'Front or front-quarter view only: original pre-facelift headlight/grille/bonnet contours and near front wheel; no rear tailgate in the same narrow selfie.'
      : 'Driver-side exterior view: coherent side mirror, front/rear door seams, dark side glass, correct wheelbase and continuous shoulder line.';
  const light = night
    ? 'At night only the selected real parking/street fixture lights the white paint and pavement; coherent localized reflections, rapid falloff, dark windows and wheel-well shadows. Headlights, taillights and dashboard stay OFF unless explicitly requested.'
    : 'Daylight or actual shade produces consistent paint highlights, dark underbody contact shadows, and curved-panel reflections; no luminous white paint.';
  return [
    model,
    'Five-door L494 SUV with real wheel-to-arch clearance, physically connected tires, factory body proportions and authentic 2017 lamp design.',
    view,
    'Subject stands OUTSIDE on solid pavement, clear of mirrors and door-swing path; vehicle parked, wheels grounded, visible contact shadows and reflection continuity.',
    cameraRule,
    light,
    'Preserve one vehicle, no duplicated wheels, handles, badges, license plates or invented trim.'
  ].join(' ');
}
