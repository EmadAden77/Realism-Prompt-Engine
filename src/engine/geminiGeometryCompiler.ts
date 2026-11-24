import type { ResolvedScene } from './physicsEngine';
import type { ReferencePlan } from './referenceRouter';
import { getPhysicalLightingOption } from '../data/physicalLighting';

/**
 * Gemini-native image prompt presentation. The neutral engine owns scene facts;
 * this layer may format and deduplicate them but never infer a new camera,
 * identity, garment, light source, or viewpoint.
 */

const KNOWN_SCENE_PHRASES: Record<string, string> = {
  'جالس في مقعد السائق': 'seated in the left driver seat',
  'جالس في مقعد الراكب': 'seated in the front passenger seat',
  'مقعد السائق والسيارة متوقفة': 'driver seat of the safely parked vehicle',
  'مقعد الراكب والسيارة متوقفة': 'front passenger seat of the safely parked vehicle',
  'واقف بجانب سيارة متوقفة': 'standing beside a safely parked vehicle',
  'ينتظر السيارة': 'waiting beside the parked vehicle',
  'موقف سيارات مفتوح': 'ordinary open-air parking area',
  'واقف بثبات': 'standing naturally',
  'واقف بشكل طبيعي': 'standing naturally',
  'على السرير': 'on a bed',
  'مستلقي على السرير': 'lying on a bed with physical support',
  'مستلقي': 'lying down',
  'بجانب السرير': 'beside the bed',
  'شارع فلل سكني': 'ordinary residential villa street',
};

const KNOWN_LIGHTING: Record<string, string> = {
  'إضاءة الشارع عبر زجاج السيارة': 'street lighting entering through the vehicle glazing',
  'إنارة موقف ليلي بجانب السيارة': 'parking-lot fixtures lighting the parked vehicle',
  'إنارة شارع دافئة': 'warm street lighting',
  'إضاءة شاشة الهاتف فقط': 'the phone screen as the sole active light source',
  'ضوء نهاري طبيعي': 'natural daylight',
  'إضاءة أباجورة دافئة': 'a warm bedside lamp',
  'إنارة سقف موقف عبر الزجاج': 'an overhead parking-canopy lamp entering through the windshield and side windows',
};

const cleanText = (value: string): string => value.trim().replace(/\s+/g, ' ');
const hasArabic = (value: string): boolean => /[\u0600-\u06ff]/u.test(value);
const translateKnown = (value: string, dictionary: Record<string, string>): string =>
  dictionary[cleanText(value)] || cleanText(value);
const englishOrEmpty = (value: string): string => hasArabic(value) ? '' : value;
const resolveEnglishLight = (state: ResolvedScene['state']): string => {
  const known = KNOWN_LIGHTING[cleanText(state.lightingMode)];
  if (known) return known;
  const option = state.sceneFamily
    ? getPhysicalLightingOption(state.sceneFamily, state.lightingMode)
    : undefined;
  // All selectable physical light modes already have English fixture details.
  // For an unknown free-text Arabic source, never leak untranslated labels.
  return option?.detail || englishOrEmpty(state.lightingMode) ||
    'the selected scene fixture, with source direction fixed by the resolved lighting';
};

const describePosition = (state: ResolvedScene['state'], physical: ResolvedScene['physicalState']): string => {
  if (state.sceneFamily === 'car' && /السائق|driver/i.test(state.subScene + ' ' + state.pose))
    return 'seated in the left driver seat of the parked vehicle';
  if (state.sceneFamily === 'car' && /الراكب|للراكب|passenger/i.test(state.subScene + ' ' + state.pose))
    return 'seated in the passenger seat of the parked vehicle';
  return englishOrEmpty(translateKnown(state.pose, KNOWN_SCENE_PHRASES)) || physical.bodyOrientation;
};

/** Deduplicate pose/action when both select the same movement or position. */
function normalizeSceneLabels(prompt: string, resolved: ResolvedScene): string {
  const { state, physicalState } = resolved;
  const pose = describePosition(state, physicalState);
  const action = englishOrEmpty(translateKnown(state.activity || '', KNOWN_SCENE_PHRASES));
  const location = englishOrEmpty(translateKnown(state.subScene || '', KNOWN_SCENE_PHRASES));
  const sameAction = !action || action === pose
    || (state.sceneFamily === 'car' && /السائق|الراكب|driver|passenger/i.test(state.activity)
      && /السائق|الراكب|driver|passenger/i.test(state.pose));

  let result = prompt.replace(
    /Pose:\s*[^.]*\.\s*(?:Action:\s*[^.]*\.\s*)?Setting:\s*[^.]*\./u,
    [
      `Pose: ${pose}.`,
      !sameAction ? `Action: ${action}.` : '',
      state.sceneFamily !== 'car' && location ? `Setting: ${location}.` : '',
    ].filter(Boolean).join(' '),
  );

  const lighting = resolveEnglishLight(state);
  result = result.replace(
    /Time:\s*(morning|midday|afternoon|sunset|night)\.\s*Lighting:/i,
    (_match, time: string) => `Time: ${time}. Lighting:`,
  );
  // Only replace the exact source label; preserve its surrounding causal
  // lighting instructions (which contain the physically verified details).
  if (state.lightingMode !== lighting)
    result = result.replace(`Light source: ${state.lightingMode}`, `Light source: ${lighting}`)
      .replace(`Lighting: ${state.lightingMode}`, `Lighting: ${lighting}`);

  // Replace the selected light's original Arabic label everywhere, including
  // the generic fallback, before the final English-only Gemini export.
  if (hasArabic(state.lightingMode)) {
    result = result.split(state.lightingMode).join(lighting);
  }

  // This was emitted by the generic exporter twice, and has no additional
  // garment information beyond the already mandatory outerwear description.
  result = result.replace(
    /The selected jacket\/vest is visibly worn OVER the base outfit, not merely held nearby\. Preserve the base garment colour and shape under the layer\./g,
    'The jacket is visibly worn over the unchanged base outfit.',
  );
  return result;
}

/**
 * Approved Gemini narrative: describe the actual photograph rather than
 * sending the model a second, repetitive engineering checklist. The local
 * physics solver remains authoritative for what can be seen.
 */
function asPhotographNarrative(base: string): string {
  return base
    // Bedroom-only constrained exports have their own capture language;
    // ordinary Gemini exports omit generic camera prose at the source.
    .replace(/^Photorealistic vertical 9:16, unedited smartphone photograph\./,
      'A candid, photorealistic vertical 9:16 smartphone photograph, straight out of the camera.')
    .replace(/\bMale, 193cm, 83kg, lean-athletic\./,
      'The man has a lean-athletic build (193 cm, 83 kg).')
    .replace(/\bEyewear follows reference\./, 'His eyewear matches the identity reference.')
    .replace(/\bNo glasses\./, 'He is not wearing glasses.')
    .replace(/\bBlack rectangular eyeglasses\./, 'He wears black rectangular eyeglasses.')
    .replace(/\bOutfit:\s*/g, 'He wears ')
    .replace(/\bMandatory outerwear:\s*/g, 'Over the selected base clothing, he wears ')
    .replace(/\bExpression:\s*/g, 'His expression is ')
    .replace(/\bHair:\s*/g, 'His hair is ')
    .replace(/\bPose:\s*/g, 'He is ')
    .replace(/\bInside the vehicle:\s*/g, 'Inside the parked vehicle: ')
    .replace(/\bOutside beside the parked vehicle:\s*/g, 'Beside the parked vehicle: ')
    .replace(/\bTime:\s*night\.\s*Lighting:\s*/g, 'Late at night, ')
    .replace(/Late at night,\s+([A-Z])/g, (_match, initial: string) =>
      'Late at night, ' + initial.toLowerCase())
    .replace(/\bTime:\s*(morning|midday|afternoon|sunset)\.\s*Lighting:\s*/g,
      (_full, time: string) => 'During the ' + time + ', ')
    // The resolved lens orientation is written only once in the final capture paragraph.
    .replace(/,\s*pitch\/yaw\/roll\s*-?\d+(?:\.\d+)?°\/-?\d+(?:\.\d+)?°\/-?\d+(?:\.\d+)?°(?=\.)/g, '')
    .replace(/\s+The jacket is visibly worn over the unchanged base outfit\./g,
      ' The outerwear is visibly worn on the body over the unchanged base garment.')
    // The seat and steering-side fact is introduced once in the main scene pose.
    // The vehicle spec still identifies the correct factory interior.
    .replace(/Seated in the LEFT driver seat with the steering wheel on the LEFT, seatback\/headrest behind; steering wheel can occlude the lower frame\./g,
      'The driver seatback and headrest sit behind him.')
    // A mid-sternum selfie cannot be forced to reveal lower torso, dashboard
    // or steering-wheel surfaces outside its optical field of view.
    .replace(/Correct windshield, dashboard, A\/B-pillars, tinted window and seatbelt occlusion only where actually in frame\./g,
      'Only the windshield, pillars, tinted glass and interior surfaces naturally intersecting this close-up are visible.')
    .replace(/Show only vehicle surfaces in this real camera field of view, at consistent scale and perspective; no floating camera, impossible full-car view or repeated parts\./g,
      'Any visible controls must be era-correct and at a consistent perspective.')
    .replace(/\s+/g, ' ').trim();
}

function appendVisibleSaudiContext(resolved: ResolvedScene): string {
  const { state, physicalState: p } = resolved;
  const environment = p.backgroundRealism;
  const outdoors = state.sceneFamily === 'saudi-outdoor'
    || (state.sceneFamily === 'car' && /خارج|بجانب|outside|beside|parking|car_outside|car_beside/i.test(state.subScene));
  const vehicleSeen = environment.allowsVehicles && p.visibleVehicles.length > 0;
  const peopleSeen = environment.allowsHumans && p.visiblePeople.length > 0;
  const bits = [
    vehicleSeen ? 'ordinary parked or passing vehicles with varied realistic spacing' : '',
    peopleSeen ? 'a few naturally occupied background people at believable scale and distance' : '',
  ].filter(Boolean);
  if (!outdoors && state.sceneFamily !== 'car') return '';
  if (state.sceneFamily === 'car' && !outdoors) {
    return bits.length
      ? 'Through the actually visible car glass, the subdued Saudi street includes ' + bits.join(' and ') +
        '; their size, visibility, reflections and illumination stay consistent with the camera angle and tinted windows.'
      : 'Any glimpse beyond the car windows stays dim and physically consistent with the selected street, glazing, and camera viewpoint; no extra vehicles or people are inserted outside the permitted field of view.';
  }
  if (!bits.length) {
    return 'The ordinary Saudi surroundings have credible ground contact, materials, street depth and natural irregularities only where visible; do not add background traffic or pedestrians outside the resolved field of view.';
  }
  return 'The visible everyday Saudi surroundings naturally include ' + bits.join(' and ') +
    ', with believable scale, grounding, depth, varied poses and lighting. They remain secondary to the subject and appear only where the selected camera view permits.';
}

export function compileGeminiGeometryPrompt(
  basePrompt: string,
  resolved: ResolvedScene,
  referencePlan: ReferencePlan,
): string {
  const { state, physicalState: p } = resolved;
  const front = state.captureType === 'front-selfie';
  const mirror = state.captureType === 'mirror-selfie';

  const base = asPhotographNarrative(normalizeSceneLabels(basePrompt, resolved));
  // The reference-role directive is already emitted once by platformAdapter.
  // Do not repeat identity instructions in a second paragraph.
  void referencePlan;
  const capture = front
    ? 'Shot on the Xiaomi 15 Ultra front camera, approximately 21mm equivalent at f/2.0, with one naturally connected phone-holding arm and the handset outside the frame.'
    : mirror
      ? 'The photograph shows one real flat-mirror reflection, with a single visible phone and consistent reflected angles and hand placement rather than a direct front-camera view.'
      : 'A third-person smartphone photograph captures the subject from a physically reachable observer viewpoint, without a selfie arm or a mirror reflection.';

  const angle = (value: string): string => value.match(/-?\d+(?:\.\d+)?°/)?.[0] || value;
  const position = [
    p.cameraDistance ? 'camera-to-subject distance ' + p.cameraDistance : '',
    p.cameraPitch ? 'pitch ' + angle(p.cameraPitch) : '',
    p.cameraYaw ? 'yaw ' + angle(p.cameraYaw) : '',
    p.cameraRoll ? 'roll ' + angle(p.cameraRoll) : '',
  ].filter(Boolean).join(', ');
  const frame = [
    p.visibleBodyRegion ? 'The frame extends over ' + p.visibleBodyRegion : '',
    p.fieldOfView ? 'with ' + p.fieldOfView : '',
  ].filter(Boolean).join(' ');
  const geometry = [
    position ? 'The resolved viewpoint has ' + position + '.' : '',
    frame ? frame + '.' : '',
    p.occlusions.length
      ? 'Only foreground elements that actually enter this crop can overlap the subject; ' + p.occlusions[0] + '.'
      : '',
  ].filter(Boolean).join(' ');

  const reality = appendVisibleSaudiContext(resolved);
  // Lighting is already described with a real fixture and shadow falloff
  // in the canonical photographic narrative. Do not state it twice.

  return [
    base,
    capture,
    geometry,
    reality,
  ].filter(Boolean).join('\n\n');
}
