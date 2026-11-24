import type { ResolvedScene } from './physicsEngine';
import type { ReferencePlan } from './referenceRouter';

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
};

const cleanText = (value: string): string => value.trim().replace(/\s+/g, ' ');
const translateKnown = (value: string, dictionary: Record<string, string>): string =>
  dictionary[cleanText(value)] || cleanText(value);

const describePosition = (state: ResolvedScene['state'], physical: ResolvedScene['physicalState']): string => {
  if (state.sceneFamily === 'car' && /السائق|driver/i.test(state.subScene + ' ' + state.pose))
    return 'seated in the left driver seat of the parked vehicle';
  if (state.sceneFamily === 'car' && /الراكب|للراكب|passenger/i.test(state.subScene + ' ' + state.pose))
    return 'seated in the passenger seat of the parked vehicle';
  return translateKnown(state.pose, KNOWN_SCENE_PHRASES) || physical.bodyOrientation;
};

/** Deduplicate pose/action when both select the same movement or position. */
function normalizeSceneLabels(prompt: string, resolved: ResolvedScene): string {
  const { state, physicalState } = resolved;
  const pose = describePosition(state, physicalState);
  const action = translateKnown(state.activity || '', KNOWN_SCENE_PHRASES);
  const location = translateKnown(state.subScene || '', KNOWN_SCENE_PHRASES);
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

  const lighting = translateKnown(state.lightingMode, KNOWN_LIGHTING);
  result = result.replace(
    /Time:\s*(morning|midday|afternoon|sunset|night)\.\s*Lighting:/i,
    (_match, time: string) => `Time: ${time}. Lighting:`,
  );
  // Only replace the exact source label; preserve its surrounding causal
  // lighting instructions (which contain the physically verified details).
  if (state.lightingMode !== lighting)
    result = result.replace(`Light source: ${state.lightingMode}`, `Light source: ${lighting}`)
      .replace(`Lighting: ${state.lightingMode}`, `Lighting: ${lighting}`);

  // This was emitted by the generic exporter twice, and has no additional
  // garment information beyond the already mandatory outerwear description.
  result = result.replace(
    /The selected jacket\/vest is visibly worn OVER the base outfit, not merely held nearby\. Preserve the base garment colour and shape under the layer\./g,
    'The jacket is visibly worn over the unchanged base outfit.',
  );
  return result;
}

export function compileGeminiGeometryPrompt(
  basePrompt: string,
  resolved: ResolvedScene,
  referencePlan: ReferencePlan,
): string {
  const { state, physicalState: p } = resolved;
  const front = state.captureType === 'front-selfie';
  const mirror = state.captureType === 'mirror-selfie';

  const base = normalizeSceneLabels(basePrompt, resolved).trim();
  const capture = front
    ? 'Xiaomi 15 Ultra front-camera selfie, 21mm-equivalent perspective; one anatomically continuous shoulder-to-wrist phone-holding arm at reachable distance; phone remains outside the captured frame.'
    : mirror
      ? 'One physically consistent flat-mirror reflection with the real phone visible, correct reflection angles and one continuous arm; no direct front-camera viewpoint.'
      : 'Third-person observer photograph with physically consistent perspective; no selfie arm or mirror reflection.';

  const angleParts = [
    p.cameraPitch ? `pitch ${p.cameraPitch}` : '',
    p.cameraYaw ? `yaw ${p.cameraYaw}` : '',
    p.cameraRoll ? `roll ${p.cameraRoll}` : '',
  ].filter(Boolean);

  const geometry = [
    p.cameraDistance ? `Camera distance: ${p.cameraDistance}.` : '',
    angleParts.length ? `Camera orientation: ${angleParts.join('; ')}.` : '',
    p.fieldOfView ? `Field of view: ${p.fieldOfView}.` : '',
    p.visibleBodyRegion ? `Crop: ${p.visibleBodyRegion}.` : '',
    p.bodyOrientation ? `Body support: ${p.bodyOrientation}.` : '',
    p.occlusions.length ? `Visible occlusion: ${p.occlusions[0]}.` : '',
  ].filter(Boolean);

  const reference = referencePlan.hasReference
    ? 'Identity reference: preserve the photographed person’s recognizable features and natural asymmetry; the reference does not set the new clothing, camera, lighting, or setting.'
    : '';
  const source = translateKnown(state.lightingMode, KNOWN_LIGHTING);
  const lighting = [
    `Light source: ${source}.`,
    p.shadowBehavior ? `Shadow direction: ${p.shadowBehavior}.` : '',
    'Exposure, shadows and reflections must follow only that source and its physically possible bounce.',
  ].filter(Boolean).join(' ');

  return [
    base,
    '',
    'GEMINI CAMERA GEOMETRY',
    reference,
    `Capture: ${capture}`,
    ...geometry,
    lighting,
    'Keep the chosen outfit, outerwear and facial appearance exactly as described above. Preserve natural smartphone exposure and perspective without invented lights or objects.',
  ].filter(Boolean).join('\n');
}
