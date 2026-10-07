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
  permanentAnchors: string[];
  wearAnchors: string[];
  mutableProperties: string[];
  transientAnchors: string[];
  promptConstraint: string;
}

/**
 * Sanitized structured form of the user-approved V20 fixed-home section.
 *
 * Only stable architecture, furniture identity, and restrained wear are locked.
 * Transient same-moment details remain empty until the engine gains an explicit
 * series/continuity identifier.
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
  const permanentAnchors = [
    ...FIXED_HOME_V20.globalPermanentAnchors,
    ...room.permanentAnchors,
  ];
  const wearAnchors = [
    ...FIXED_HOME_V20.globalWearAnchors,
    ...room.wearAnchors,
  ];

  return {
    homeId: FIXED_HOME_V20.id,
    blueprintVersion: FIXED_HOME_V20.version,
    mode: 'persistent-environment',
    roomId: room.roomId,
    continuityKey: `${FIXED_HOME_V20.id}:${room.roomId}:v${FIXED_HOME_V20.version}`,
    permanentAnchors,
    wearAnchors,
    mutableProperties: [...room.mutableProperties],
    transientAnchors: [],
    promptConstraint: [
      `Fixed-home continuity key: ${FIXED_HOME_V20.id} / ${room.roomId}.`,
      `Immutable anchors: ${permanentAnchors.join('; ')}.`,
      `Persistent wear anchors: ${wearAnchors.join('; ')}.`,
      `Allowed to vary: ${room.mutableProperties.join('; ')}.`,
      'If a generic micro-location description conflicts with these fixed-home anchors, the fixed-home anchors win.',
      'Do not lock transient details across separate images unless an explicit same-moment series context exists.',
    ].join(' '),
  };
}
