import { getMicroLocation } from '../data/microLocations';
import { OUTFITS } from '../data/clothingOutfits';
import { getActivityDefinition } from './activityAttire';
import { EXPRESSIONS, HAIRSTYLES } from './semanticSceneCompiler';
import {
  verifyCausalFingerprint,
  type UnifiedPromptPipelineResult,
  type UnifiedPromptTarget,
} from './unifiedPromptPipeline';

/**
 * Export-only copy. Preserve the complete canonical scene, diagnostics, negative
 * constraints, provenance and fingerprint inside the original pipeline.
 */
const shorten = (value: string, max = 145): string => {
  const clean = value.replace(/\s+/g, ' ').trim().replace(/[.;,\s]+$/, '');
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max + 1);
  const boundary = slice.lastIndexOf(' ');
  return (boundary > max * 0.65 ? slice.slice(0, boundary) : slice.slice(0, max))
    .replace(/[.;,\s]+$/, '');
};

const imageReference = (target: UnifiedPromptTarget, hasReference: boolean): string => {
  if (!hasReference) return 'Natural, believable facial features; no invented facial details.';
  const origin = target === 'chatgpt' ? 'attached' :
    target === 'gemini' ? 'provided' : 'selected';
  return 'Use the ' + origin +
    ' reference image for exact facial identity, age, proportions, skin tone, beard and hairline only; never copy its scene.';
};

export function compileCompactPrompt(
  pipeline: UnifiedPromptPipelineResult,
  target: UnifiedPromptTarget,
): string {
  if (!pipeline.diagnostics.anglePromptReady || !verifyCausalFingerprint(pipeline)) return '';
  const state = pipeline.manifest.resolved.state;
  const micro = getMicroLocation(state.sceneFamily, state.subScene);
  const outfit = OUTFITS.find(item => item.id === state.outfitId);
  const expression = EXPRESSIONS.find(item => item.id === state.expression);
  const hair = HAIRSTYLES.find(item => item.id === state.hairStyle);
  const activity = getActivityDefinition(state.activity);
  const capture = state.captureType === 'front-selfie'
    ? 'Xiaomi 15 Ultra front-camera selfie, 21mm equivalent, one reachable phone-holding arm'
    : state.captureType === 'mirror-selfie'
      ? 'natural smartphone mirror selfie, one correct mirror reflection'
      : 'candid third-person smartphone photograph';
  const glasses = state.glassesMode === 'no_glasses' ? 'No glasses.' :
    state.glassesMode === 'wear_glasses' ? 'Black rectangular glasses.' :
      'Eyewear follows the reference.';
  const outfitText = outfit
    ? shorten(outfit.promptDescription, 165)
    : shorten(pipeline.semantic.outfit, 165);
  const pose = shorten(state.pose || '', 85);
  const action = shorten(activity.prompt || state.activity || '', 100);
  const location = micro
    ? shorten(micro.environmentPrompt, 145)
    : shorten(pipeline.semantic.visibleEnvironment, 145);
  const setting = state.sceneFamily === 'car'
    ? (micro?.isOutdoor ? 'Outside beside the parked car' : 'Inside the vehicle cabin')
    : 'Ordinary Saudi setting';
  const hairText = shorten(hair?.prompt || '', 55);
  const expressionText = shorten(expression?.prompt || '', 65);
  const time = state.timeOfDay;
  const customWear = state.outfitLocked === false
    ? [state.shirtTuck, state.sleeveStyle, state.shirtButtons, state.collarStyle]
        .filter(value => value && value !== 'auto').join(', ')
    : '';
  const people = state.groupSelfieEnabled
    ? ' Group selfie of ' + (state.groupSelfieSize || 2) +
      ' with distinct companion faces; only the reference subject is identity-locked.'
    : state.sceneFamily === 'bedroom' || state.sceneFamily === 'living-room'
      ? state.homeBackgroundPeopleMode === 'none'
        ? ' No background people.'
        : state.homeBackgroundPeopleMode && (state.homeBackgroundCount || 0) > 0
          ? ' Background people: ' + state.homeBackgroundCount + ', ' +
            state.homeBackgroundPeopleMode + ', distinct faces.'
          : ''
      : '';
  const lighting = state.lightingMode || 'natural practical lighting';
  const framing = state.framing + ', ' + state.cameraAngle;
  const camera = 'Natural handheld geometry, ' + framing +
    '; realistic exposure, contact shadows and smartphone texture.';
  const parts = [
    'Generate ONE vertical 9:16 spontaneous, unedited-looking photorealistic photo.',
    imageReference(target, pipeline.manifest.referencePlan.hasReference),
    'Subject: 193 cm, 83 kg lean-athletic man. ' + glasses +
      ' Hair: ' + hairText + '. Expression: ' + expressionText + '.',
    'Outfit: ' + outfitText + (customWear ? '; ' + customWear : '') + '.',
    'Scene: ' + setting + ', ' + shorten(state.subScene, 50) + '. ' + location + '.' + people,
    'Pose: ' + pose + (action ? '; ' + action : '') + '.',
    'Light: ' + time + ', ' + lighting + '. Real light sources only.',
    'Camera: ' + capture + ', ' + camera,
    'No face alteration, artificial blur, plastic skin, impossible reflections or invisible fill.',
  ];
  if (target === 'midjourney') parts.push('--v 8.2 --raw');
  return parts.join('\n').replace(/\s+([,.])/g, '$1');
}

export function compileCompactNegativePrompt(
  pipeline: UnifiedPromptPipelineResult,
): string {
  if (!pipeline.diagnostics.anglePromptReady) return '';
  const state = pipeline.manifest.resolved.state;
  const negatives = [
    'identity drift', 'altered hairline or beard', 'plastic skin',
    'fake bokeh', 'floating camera', 'impossible anatomy',
    'invented light sources', 'CGI look',
  ];
  if (state.glassesMode === 'no_glasses') negatives.push('eyeglasses');
  if (state.glassesMode === 'wear_glasses') negatives.push('missing glasses');
  if (state.sceneFamily === 'car') negatives.push('wrong car seating or exterior geometry');
  if (state.lightingMode === 'إضاءة شاشة الهاتف فقط') negatives.push('extra lighting');
  return negatives.join(', ') + '.';
}
