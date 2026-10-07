import type { SceneState } from './physicsEngine';

export type FixedHomeRoomId = 'bedroom' | 'living-room';

export interface FixedHomeRoomBlueprint {
  roomId: FixedHomeRoomId;
  permanentAnchors: string[];
  wearAnchors: string[];
  mutableProperties: string[];
}

export interface FixedHomeBlueprint {
  id: string;
  version: '1.0';
  locationContext: string;
  globalPermanentAnchors: string[];
  globalWearAnchors: string[];
  rooms: Record<FixedHomeRoomId, FixedHomeRoomBlueprint>;
}

export interface HomeContinuityContext {
  homeId: string;
  blueprintVersion: string;
  mode: 'persistent-environment';
  roomId: FixedHomeRoomId;
  continuityKey: string;

  // Full internal continuity lock. These remain stable even if they are outside frame.
  permanentAnchors: string[];
  wearAnchors: string[];

  // Prompt-facing subset selected from the current micro-location/FOV intent.
  visiblePermanentAnchors: string[];
  visibleWearAnchors: string[];
  hiddenPermanentAnchorCount: number;
  hiddenWearAnchorCount: number;
  visibilityProfile: string;

  mutableProperties: string[];
  transientAnchors: string[];
  promptConstraint: string;
}

/**
 * Sanitized structured form of the user-approved V20 fixed-home section.
 *
 * Stable architecture/furniture identity lives in the full anchor set.
 * Prompt emission uses only the scene-relevant visible subset so continuity
 * never forces hidden furniture into the frame.
 */
export const FIXED_HOME_V20: FixedHomeBlueprint = {
  id: 'fixed-home-v20-riyadh-al-narjis',
  version: '1.0',
  locationContext:
    'ordinary private two-floor Saudi villa in Riyadh, Al Narjis; no landmark dependency',
  globalPermanentAnchors: [
    'off-white painted interior wall family',
    '60x60 cm beige glossy floor-tile family with consistent grout layout',
    'same split-air-conditioning installation locations',
  ],
  globalWearAnchors: [
    'same restrained paint chips near the established AC area',
    'same established AC condensate water-stain location',
    'same subtle dust accumulation in tile grout and low-use seams',
  ],
  rooms: {
    bedroom: {
      roomId: 'bedroom',
      permanentAnchors: [
        'same 180 cm master bed and orientation',
        'same white bedsheet family with restrained natural micro-wrinkles and visible weave',
        'same wooden bedside table',
        'same white ceramic-base bedside lamp',
        'same white sliding-door wardrobe with mirror on the inside of a door',
        'same beige blackout curtain installation',
        'same small beige bedside carpet',
        'same phone-charger cable location near the bedside area',
      ],
      wearAnchors: [
        'same restrained scratch pattern on the wooden bedside table',
        'same curtain fold family unless physically disturbed by the current action',
        'same subtle dust pattern at low-use furniture edges and floor seams',
      ],
      mutableProperties: [
        'lighting state',
        'subject pose and activity',
        'camera angle and framing',
        'bed-linen compression caused by current body contact',
        'small movable personal objects when explicitly caused by the action',
      ],
    },
    'living-room': {
      roomId: 'living-room',
      permanentAnchors: [
        'same L-shaped grey fabric sofa and orientation',
        'same light-grey carpet placement',
        'same 55-inch television and media position',
        'same wooden coffee table',
        'same white sheer curtain plus blackout curtain installation',
      ],
      wearAnchors: [
        'same restrained fabric pilling pattern on the grey sofa',
        'same established scratch family on the wooden coffee table',
        'same curtain fold family unless physically disturbed by the current action',
        'same subtle dust accumulation at carpet edges and furniture seams',
      ],
      mutableProperties: [
        'lighting state',
        'subject pose and activity',
        'camera angle and framing',
        'seat-cushion compression caused by current body contact',
        'small movable personal objects when explicitly caused by the action',
      ],
    },
  },
};

const includesAny = (value: string, terms: string[]): boolean => {
  const normalized = value.toLowerCase();
  return terms.some(term => normalized.includes(term.toLowerCase()));
};

interface VisibleAnchorSelection {
  profile: string;
  permanent: string[];
  wear: string[];
}

const selectBedroomVisibleAnchors = (
  subScene: string,
  permanentAnchors: string[],
  wearAnchors: string[]
): VisibleAnchorSelection => {
  const globalWallsAndFloor = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['off-white painted', '60x60 cm beige'])
  );
  const globalDust = wearAnchors.filter(anchor =>
    includesAny(anchor, ['dust accumulation', 'dust pattern'])
  );

  const bedAnchors = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['180 cm master bed', 'white bedsheet', 'bedside table', 'bedside lamp', 'bedside carpet', 'phone-charger'])
  );
  const bedWear = wearAnchors.filter(anchor =>
    includesAny(anchor, ['bedside table', 'furniture edges', 'floor seams'])
  );

  const wardrobeAnchors = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['sliding-door wardrobe'])
  );

  const curtainAnchors = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['blackout curtain'])
  );
  const curtainWear = wearAnchors.filter(anchor =>
    includesAny(anchor, ['curtain fold'])
  );

  const acAnchors = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['air-conditioning installation'])
  );
  const acWear = wearAnchors.filter(anchor =>
    includesAny(anchor, ['paint chips', 'condensate water-stain'])
  );

  if (includesAny(subScene, ['br_beside_bed', 'br_front_bed', 'br_at_bed_edge', 'br_sitting_bed_edge', 'br_sitting_on_bed', 'br_reclining_on_bed', 'br_beside_headboard', 'بجانب السرير', 'أمام السرير', 'حافة السرير', 'فوق السرير', 'مستلق', 'رأس السرير'])) {
    return {
      profile: 'bed-zone',
      permanent: [...globalWallsAndFloor, ...bedAnchors],
      wear: [...globalDust, ...bedWear],
    };
  }

  if (includesAny(subScene, ['br_front_wardrobe', 'br_beside_wardrobe', 'br_between_bed_and_wardrobe', 'أمام الدولاب', 'بجانب الدولاب', 'بين السرير والدولاب'])) {
    return {
      profile: 'wardrobe-zone',
      permanent: [...globalWallsAndFloor, ...wardrobeAnchors],
      wear: [...globalDust],
    };
  }

  if (includesAny(subScene, ['br_front_mirror', 'أمام المرآة'])) {
    return {
      profile: 'mirror-wardrobe-zone',
      permanent: [...globalWallsAndFloor, ...wardrobeAnchors],
      wear: [...globalDust],
    };
  }

  if (includesAny(subScene, ['br_front_curtains', 'br_beside_curtains', 'ستائر', 'الستائر'])) {
    return {
      profile: 'curtain-window-zone',
      permanent: [...globalWallsAndFloor, ...curtainAnchors],
      wear: [...globalDust, ...curtainWear],
    };
  }

  if (includesAny(subScene, ['br_room_corner', 'br_beside_chair', 'br_near_ac', 'زاوية الغرفة', 'قرب وحدة التكييف'])) {
    return {
      profile: 'bedroom-corner-zone',
      permanent: [...globalWallsAndFloor, ...acAnchors],
      wear: [...globalDust, ...acWear],
    };
  }

  if (includesAny(subScene, ['br_center_bedroom', 'وسط الغرفة'])) {
    return {
      profile: 'bedroom-wide-zone',
      permanent: [...globalWallsAndFloor, ...bedAnchors, ...wardrobeAnchors, ...curtainAnchors],
      wear: [...globalDust, ...bedWear, ...curtainWear],
    };
  }

  return {
    profile: 'bedroom-generic-zone',
    permanent: [...globalWallsAndFloor],
    wear: [...globalDust],
  };
};

const selectLivingRoomVisibleAnchors = (
  subScene: string,
  permanentAnchors: string[],
  wearAnchors: string[]
): VisibleAnchorSelection => {
  const globalWallsAndFloor = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['off-white painted', '60x60 cm beige'])
  );
  const globalDust = wearAnchors.filter(anchor =>
    includesAny(anchor, ['dust accumulation'])
  );

  const sofaAnchors = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['L-shaped grey fabric sofa', 'light-grey carpet'])
  );
  const sofaWear = wearAnchors.filter(anchor =>
    includesAny(anchor, ['fabric pilling', 'carpet edges'])
  );

  const tvAnchors = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['55-inch television'])
  );

  const tableAnchors = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['wooden coffee table'])
  );
  const tableWear = wearAnchors.filter(anchor =>
    includesAny(anchor, ['scratch family'])
  );

  const curtainAnchors = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['white sheer curtain'])
  );
  const curtainWear = wearAnchors.filter(anchor =>
    includesAny(anchor, ['curtain fold'])
  );

  const acAnchors = permanentAnchors.filter(anchor =>
    includesAny(anchor, ['air-conditioning installation'])
  );

  if (includesAny(subScene, ['lr_beside_sofa', 'lr_front_sofa', 'lr_sitting_edge_sofa', 'lr_sitting_center_sofa', 'lr_beside_single_armchair', 'الكنبة', 'كرسي منفرد'])) {
    return {
      profile: 'living-sofa-zone',
      permanent: [...globalWallsAndFloor, ...sofaAnchors],
      wear: [...globalDust, ...sofaWear],
    };
  }

  if (includesAny(subScene, ['lr_front_tv', 'lr_front_simple_tv_unit', 'التلفاز', 'تلفاز'])) {
    return {
      profile: 'living-tv-zone',
      permanent: [...globalWallsAndFloor, ...tvAnchors],
      wear: [...globalDust],
    };
  }

  if (includesAny(subScene, ['lr_beside_coffee_table', 'lr_beside_side_table', 'طاولة الصالة', 'طاولة جانبية'])) {
    return {
      profile: 'living-table-zone',
      permanent: [...globalWallsAndFloor, ...tableAnchors, ...sofaAnchors],
      wear: [...globalDust, ...tableWear, ...sofaWear],
    };
  }

  if (includesAny(subScene, ['lr_beside_window', 'lr_front_window', 'lr_beside_curtain', 'النافذة', 'الستارة'])) {
    return {
      profile: 'living-window-zone',
      permanent: [...globalWallsAndFloor, ...curtainAnchors],
      wear: [...globalDust, ...curtainWear],
    };
  }

  if (includesAny(subScene, ['lr_near_ac_unit', 'وحدة التكييف'])) {
    return {
      profile: 'living-ac-zone',
      permanent: [...globalWallsAndFloor, ...acAnchors],
      wear: [...globalDust],
    };
  }

  if (includesAny(subScene, ['lr_center_room', 'منتصف الصالة'])) {
    return {
      profile: 'living-wide-zone',
      permanent: [...globalWallsAndFloor, ...sofaAnchors, ...tvAnchors, ...tableAnchors, ...curtainAnchors],
      wear: [...globalDust, ...sofaWear, ...tableWear, ...curtainWear],
    };
  }

  return {
    profile: 'living-generic-zone',
    permanent: [...globalWallsAndFloor],
    wear: [...globalDust],
  };
};

const dedupe = (values: string[]): string[] => [...new Set(values)];

export function isFixedHomeFamily(
  sceneFamily: SceneState['sceneFamily']
): sceneFamily is FixedHomeRoomId {
  return sceneFamily === 'bedroom' || sceneFamily === 'living-room';
}

export function resolveHomeContinuity(
  state: SceneState
): HomeContinuityContext | null {
  if (!isFixedHomeFamily(state.sceneFamily)) return null;

  const room = FIXED_HOME_V20.rooms[state.sceneFamily];
  const permanentAnchors = dedupe([
    ...FIXED_HOME_V20.globalPermanentAnchors,
    ...room.permanentAnchors,
  ]);
  const wearAnchors = dedupe([
    ...FIXED_HOME_V20.globalWearAnchors,
    ...room.wearAnchors,
  ]);

  const selected = state.sceneFamily === 'bedroom'
    ? selectBedroomVisibleAnchors(state.subScene || '', permanentAnchors, wearAnchors)
    : selectLivingRoomVisibleAnchors(state.subScene || '', permanentAnchors, wearAnchors);

  const visiblePermanentAnchors = dedupe(selected.permanent);
  const visibleWearAnchors = dedupe(selected.wear);

  return {
    homeId: FIXED_HOME_V20.id,
    blueprintVersion: FIXED_HOME_V20.version,
    mode: 'persistent-environment',
    roomId: room.roomId,
    continuityKey: `${FIXED_HOME_V20.id}:${room.roomId}:v${FIXED_HOME_V20.version}`,
    permanentAnchors,
    wearAnchors,
    visiblePermanentAnchors,
    visibleWearAnchors,
    hiddenPermanentAnchorCount: Math.max(
      0,
      permanentAnchors.length - visiblePermanentAnchors.length
    ),
    hiddenWearAnchorCount: Math.max(
      0,
      wearAnchors.length - visibleWearAnchors.length
    ),
    visibilityProfile: selected.profile,
    mutableProperties: [...room.mutableProperties],
    transientAnchors: [],
    promptConstraint: [
      `Fixed-home continuity key: ${FIXED_HOME_V20.id} / ${room.roomId}.`,
      `Current visibility profile: ${selected.profile}.`,
      `Visible immutable anchors only: ${visiblePermanentAnchors.join('; ')}.`,
      visibleWearAnchors.length
        ? `Visible persistent wear only: ${visibleWearAnchors.join('; ')}.`
        : 'No persistent wear anchor needs explicit prompt emission in this framing.',
      `Allowed to vary: ${room.mutableProperties.join('; ')}.`,
      'All other fixed-home anchors remain internally locked but must not be pulled into frame merely to prove continuity.',
      'If a generic micro-location description conflicts with a visible fixed-home anchor, the fixed-home anchor wins.',
      'Do not lock transient details across separate images unless an explicit same-moment series context exists.',
    ].join(' '),
  };
}
