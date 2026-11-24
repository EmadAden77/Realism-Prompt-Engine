import type { ResolvedScene } from './physicsEngine';
import type { ReferencePlan } from './referenceRouter';

/**
 * Gemini Image geometry contract. Never reconstruct camera facts from UI labels,
 * infer undocumented measurements, or modify the physics engine's decisions.
 * This adds a platform-specific instruction layer only to Gemini exports.
 */
export function compileGeminiGeometryPrompt(
  basePrompt: string,
  resolved: ResolvedScene,
  referencePlan: ReferencePlan,
): string {
  const { state, physicalState: p } = resolved;
  const front = state.captureType === 'front-selfie';
  const mirror = state.captureType === 'mirror-selfie';
  const facts = [
    ['Camera position', p.cameraPosition],
    ['Camera-to-subject distance', p.cameraDistance],
    ['Camera direction', p.cameraDirection],
    ['Pitch', p.cameraPitch],
    ['Yaw', p.cameraYaw],
    ['Roll', p.cameraRoll],
    ['Framing / visible body', p.visibleBodyRegion],
    ['Field of view', p.fieldOfView],
    ['Optical perspective', p.opticalPerspective],
    ['Body orientation', p.bodyOrientation],
    ['Background depth', p.backgroundDepth],
  ].filter(([, value]) => typeof value === 'string' && value.trim())
    .map(([label, value]) => `${label}: ${value}.`);

  const captureRules = front
    ? [
      'Capture method: genuine handheld Xiaomi 15 Ultra FRONT camera, approximately 21mm equivalent and f/2.0.',
      'Anatomy: one continuous connected phone-holding arm, shoulder-to-elbow-to-wrist; reachable handheld camera position.',
      'Projection: authentic near-to-far wide-angle size relationships and foreshortening. The capturing phone stays outside the direct frame.',
    ]
    : mirror
      ? [
        'Capture method: one smartphone photographed through one physically consistent flat mirror; the phone is visible only as its true reflection.',
        'Mirror geometry: viewpoint, reflection, handedness and occlusion all obey one reflective plane; do not simulate a front-camera direct selfie.',
      ]
      : [
        'Capture method: a third-person observer photograph; no implied selfie arm or invisible mirror.',
        'Projection: subject and background scales follow the resolved observer camera position and depth.',
      ];

  const occlusion = p.occlusions.length
    ? `Occlusion order: ${p.occlusions.join('; ')}.`
    : 'Occlusion order: preserve overlap only for objects actually inside the resolved frame.';
  const sources = p.lightSources.filter(Boolean);
  const light = [
    `Time and lighting selection: ${state.timeOfDay}; ${state.lightingMode}.`,
    sources.length ? `Resolved light sources: ${sources.join('; ')}.` : '',
    p.shadowBehavior ? `Shadow behaviour: ${p.shadowBehavior}.` : '',
    p.exposureBehavior ? `Exposure behaviour: ${p.exposureBehavior}.` : '',
    'Do not invent a second source, rim light or independent facial exposure; reflections, shadows and noise must agree with the physical sources.',
  ].filter(Boolean);

  const reference = referencePlan.hasReference
    ? 'The supplied identity reference controls recognizable facial features only; scene camera, outfit, lighting and composition come from the validated scene, not from the reference photo. Supply the image as an actual Gemini image input.'
    : 'No identity reference image is attached: do not claim one exists.';
  const invariants = [
    'Keep the exact base outfit, selected worn outerwear, face and eyewear settings from the main scene description. Do not reinterpret these as optional styling.',
    'Apply geometry as a single coherent camera solution, not separate unrelated cinematic effects.',
    'Every scene fact above comes from the validated local geometry; do not invent extra numeric camera measurements or extra objects.',
  ];

  return [
    basePrompt.trim(),
    '',
    'GEMINI IMAGE — MANDATORY RESOLVED GEOMETRY',
    reference,
    ...captureRules,
    ...facts,
    p.armReach && front ? `Handheld reach: ${p.armReach}.` : '',
    occlusion,
    ...light,
    ...invariants,
  ].filter(Boolean).join('\n');
}
