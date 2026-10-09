// ============================================================================
// PhysFrame Physics Engine & Consistency Validator
// FIXED XIAOMI 15 ULTRA SELFIE PHYSICS + SCENE-AWARE BACKGROUND ENGINE
// Pure deterministic physical scene resolver, validator, and prompt compiler.
// ============================================================================

import { MICRO_LOCATIONS, getMicroLocation, MicroLocation, SceneFamilyId } from '../data/microLocations';
import { compileHomeYardEnvironment, resolveHomeYardVisibility } from './homeYard';
import { OUTFITS, OutfitItem } from '../data/clothingOutfits';
import {
  deriveBackgroundRealism,
  BackgroundRealismState,
  BackgroundMode,
  BackgroundControlDensity,
  BackgroundDisorderControl,
  BackgroundActivityControl,
  BackgroundPresenceControl,
  BackgroundCompositionGoal,
  BackgroundGeminiAdvice
} from './backgroundRealism';
import { deriveLightingCausality, LightingCausalityState } from './lightingCausality';
import { evaluateScenePlausibility, ScenePlausibilityState } from './scenePlausibility';
import { deriveSurfaceRealism, SurfaceRealismState } from './surfaceRealism';
import { compileFixedHomeVisibleEnvironment, resolveHomeContinuity } from './fixedHomeContinuity';
import {
  resolveSelfieAngleGeometry,
  ResolvedSelfieAngle,
  SelfieAngleAdvice,
  SelfieAngleMode
} from './selfieAngles';
import {
  resolveGroupSelfie,
  widenFramingForGroup,
  GroupSelfieSize,
  GroupSelfieRelationship,
  ResolvedGroupSelfie
} from './groupSelfie';
import { deriveMicroPhysics } from './sceneAffordances';
import type {
  OutfitWearStyle,
  GarmentWearContext,
  ShirtTuck,
  SleeveStyle,
  ShirtButtons,
  CollarStyle,
  OuterwearClosure,
  HoodPosition,
  ThobeCollar
} from './activityAttire';

// --- TYPES ---
export type CaptureType = 'front-selfie' | 'mirror-selfie' | 'third-person-candid';

/**
 * Apparent optical path for an image in a plane mirror.
 * Distances are measured along the actual reflected ray path, not inferred
 * from camera type. The 2x shortcut is valid only for special geometry.
 */
export function resolveMirrorOpticalPath(input: {
  cameraToMirrorCm: number;
  mirrorToSubjectCm: number;
}): { opticalPathCm: number; nearDoubleMirrorDistance: boolean } | null {
  const { cameraToMirrorCm, mirrorToSubjectCm } = input;
  if (![cameraToMirrorCm, mirrorToSubjectCm].every(x => Number.isFinite(x) && x > 0)) {
    return null;
  }
  const opticalPathCm = cameraToMirrorCm + mirrorToSubjectCm;
  return {
    opticalPathCm,
    nearDoubleMirrorDistance: Math.abs(cameraToMirrorCm - mirrorToSubjectCm) <= 1,
  };
}

export type Framing = 'head-shoulders' | 'chest-up' | 'half-body';
export type CameraAngle = 'eye-level' | 'slightly-high' | 'slightly-low' | 'slightly-off-center';
export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
export type RealismStyle = 'anti-ai-raw' | 'photorealistic' | 'candid-snap';
export type GlassesMode = 'wear_glasses' | 'no_glasses' | 'match_reference';
export type LensCondition = 'xiaomi-clean' | 'smudged-lens' | 'modern-iphone' | 'budget-android'; // legacy ids retained only for state migration
export type ClothingCondition = 'crisp' | 'worn-all-day' | 'vintage-washed';
export type AtmosphericCondition = 'neutral' | 'high-humidity' | 'dusty-haze' | 'breezy';
export type ForegroundObstruction = 'clean' | 'through-glass' | 'foreground-clutter';
export type MuscleFatigue = 'none' | 'heavy-eyelids' | 'bloodshot-sclera' | 'pale-fatigued-skin' | 'full-exhaustion';

export type FramingClass = 'tight' | 'medium' | 'wide';
export type ActivityDensity = 'none' | 'minimal' | 'light' | 'moderate';

export interface SceneState {
  referenceImageId: string | null;
  sceneFamily: SceneFamilyId | null;
  subScene: string;
  activity: string;
  captureType: CaptureType;
  framing: Framing;
  cameraAngle: CameraAngle;
  pose: string;
  outfitId: string;
  outfitWearStyle?: OutfitWearStyle;
  garmentWearContext?: GarmentWearContext;
  shirtTuck?: ShirtTuck;
  sleeveStyle?: SleeveStyle;
  shirtButtons?: ShirtButtons;
  collarStyle?: CollarStyle;
  outerwearClosure?: OuterwearClosure;
  hoodPosition?: HoodPosition;
  thobeCollar?: ThobeCollar;
  hairStyle: string;
  hairPhysicsPreset?: string;
  expression: string;
  timeOfDay: TimeOfDay;
  lightingMode: string;
  environmentRealism: string;
  realismStyle: RealismStyle;
  customIdentityPrompt?: string;

  // Appearance & Accessories
  glassesMode: GlassesMode;

  // Environment Dynamics
  lightingIntensity: number;
  shadowDepth: number;

  // State Variables for Randomness & Imperfections
  lensCondition: LensCondition;
  clothingCondition: ClothingCondition;
  atmosphericCondition: AtmosphericCondition;
  foregroundObstruction: ForegroundObstruction;
  muscleFatigue: MuscleFatigue;

  // User-controlled background realism. Optional for backward-compatible presets/tests.
  backgroundMode?: BackgroundMode;
  backgroundHumans?: BackgroundControlDensity;
  backgroundVehicles?: BackgroundControlDensity;
  backgroundDisorder?: BackgroundDisorderControl;
  backgroundActivity?: BackgroundActivityControl;
  backgroundPresence?: BackgroundPresenceControl;
  backgroundCompositionGoal?: BackgroundCompositionGoal;
  backgroundAutoAngle?: boolean;
  backgroundGeminiAssist?: boolean;
  backgroundGeminiAdvice?: BackgroundGeminiAdvice;

  // Optional smart home-background people controls.
  homeBackgroundPeopleMode?: 'none' | 'men' | 'women' | 'children' | 'mixed';
  homeBackgroundCount?: number;
  homeBackgroundClothing?: string[];

  // Gemini-assisted selfie camera direction. Local physics always validates/caps it.
  cameraAngleMode?: SelfieAngleMode;
  selfieAngleAdvice?: SelfieAngleAdvice;
  smartAngleEvidence?: import('./selfieAngles').SmartAngleEvidence;

  // Dynamic group selfie. The reference subject remains the sole identity-locked phone holder.
  groupSelfieEnabled?: boolean;
  groupSelfieSize?: GroupSelfieSize;
  groupSelfieRelationship?: GroupSelfieRelationship;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERNAL DERIVED PHYSICAL STATE (SECTION 22)
// Automatically derived behind the scenes. NOT exposed as UI controls.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface DerivedPhysicalState {
  cameraPosition: string;
  cameraDistance: string;
  cameraDirection: string;
  cameraPitch: string;
  cameraYaw: string;
  cameraRoll: string;
  armReach: string;
  bodyOrientation: string;
  visibleBodyRegion: string;
  framingClass: FramingClass;
  fieldOfView: string;
  opticalPerspective: string;
  visibleEnvironment: string;
  foregroundElements: string[];
  occlusions: string[];
  backgroundDepth: string;
  activityDensity: ActivityDensity;
  visiblePeople: string[];
  visibleVehicles: string[];
  lightSources: string[];
  shadowBehavior: string;
  reflectionState: string[];
  exposureBehavior: string;
  motionBehavior: string;
  disorderBehavior: string;
  backgroundRealism: BackgroundRealismState;
  lightingCausality: LightingCausalityState;
  surfaceRealism: SurfaceRealismState;
  plausibility: ScenePlausibilityState;
  selfieAngle: ResolvedSelfieAngle | null;
  groupSelfie: ResolvedGroupSelfie | null;
}

// Backward-compatible interface for existing App.tsx consumers
export interface DerivedPhysics {
  phoneDistance: string;
  cameraHeight: string;
  cameraYawPitch: string;
  armReach: string;
  bodyOrientation: string;
  visibleBodyRegion: string;
  fieldOfView: string;
  occlusion: string[];
  backgroundDepth: string;
  availableLightSources: string[];
  shadowDirection: string;
  exposureBehavior: string;
  reflections: string[];
  physicallyVisibleElements: string[];
}

export interface ValidationIssue {
  type: 'contradiction' | 'warning' | 'physical_impossibility';
  field: string;
  description: string;
  autoResolvedBy?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  autoResolved: boolean;
}

export interface DerivedSceneState {
  skinResponse: string;
  hairCondition: string;
  fabricBehavior: string[];
  shadowBehavior: string;
  environmentalLightBehavior: string;
  cameraDistance: string;
  visibleBackgroundElements: string[];
  contactPhysics: string[];
  reflectionRules: string[];
  realismConstraints: string[];
  lensEffects: string;
  atmosphericEffects: string;
  muscleFatigueEffects: string;
  lightingIntensityDescription: string;
  shadowDepthDescription: string;
}

export interface SemanticScene {
  identity: string;
  body: string;
  glasses: string;
  captureMechanics: string;
  hair: string;
  expression: string;
  outfit: string;
  outfitPhysics: string;
  poseAndContact: string;
  visibleEnvironment: string;
  lighting: string;
  atmosphere: string;
  skinResponse: string;
  cameraRealism: string;
  styleConstraints: string;
  physicsDetails?: string;
}

export interface ResolvedScene {
  state: SceneState;
  derived: DerivedSceneState;
  physics: DerivedPhysics;
  physicalState: DerivedPhysicalState;
  validation: ValidationResult;
}

export interface PromptValidationResult {
  isValid: boolean;
  cleanPrompt: string;
  cleanNegativePrompt: string;
  contradictionsFound: string[];
  warnings: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. FIXED XIAOMI 15 ULTRA FRONT CAMERA PROFILE (INTERNAL BASELINE)
// Automatically applied to every direct front-camera selfie. Never exposed in UI.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE = {
  hardware: 'Xiaomi 15 Ultra front-camera optical system: 32MP quad-bayer sensor (1/3.14" optical format, 0.7μm physical pixel pitch), fixed f/2.0 aperture',
  equivalentFocalLength: 'approx 21mm equivalent wide-angle perspective',
  fieldOfView: 'approx 90° diagonal field of view (~79° horizontal field of view)',
  getPerspectiveDescription: (distanceCm: number, framingClass: FramingClass): string => {
    if (framingClass === 'tight' || distanceCm < 45) {
      return '21mm wide-angle close selfie optics: natural near-field facial geometry with subtle anatomical depth curvature on nose bridge and zygomatic contours, realistic ear placement without cartoonish fish-eye distortion, balanced cheekbone perspective';
    } else if (framingClass === 'medium' || distanceCm <= 58) {
      return '21mm wide-angle medium selfie optics: natural handheld facial proportion, authentic arm foreshortening extending from shoulder toward off-camera smartphone, uncompressed chest and collarbone geometry';
    } else {
      return '21mm wide-angle extended selfie optics: natural subtle wide-angle expansion at frame perimeters, realistic full arm reach foreshortening, authentic broad environmental inclusion without telephoto flattening';
    }
  },
  depthOfField: 'deep smartphone optical depth of field characteristic of f/2.0 mobile aperture (~2.8mm physical focal length), subtle natural optical sharpness roll-off across depth planes, strictly NO synthetic portrait-mode cutout blur, NO artificial DSLR bokeh halos',
  getExposureBehavior: (isNight: boolean, isMidday: boolean, isHighContrast: boolean): string => {
    if (isNight) {
      return 'smartphone computational low-light auto-exposure: preserved shadow depth without artificial night-sight over-brightening, authentic fine luminance noise in deep dark tones, natural highlights on skin from local light fixtures, no plastic noise-reduction smearing';
    } else if (isMidday) {
      return 'smartphone computational multi-frame HDR auto-exposure: controlled highlight roll-off against harsh Saudi sun, balanced dynamic range preserving both sunny asphalt glare and subtle jawline contact shadows, realistic natural skin tone saturation';
    } else if (isHighContrast) {
      return 'smartphone auto-exposure with computational tone-mapping: preserved ambient contrast, natural highlight recovery on specular reflections, balanced midtones on skin';
    } else {
      return 'smartphone auto-exposure: balanced natural exposure, organic sensor micro-contrast, crisp uncompressed skin pore detail without artificial over-sharpening rings';
    }
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. SCENE UNDERSTANDING & CLASSIFICATION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getFramingClass(framing: Framing): FramingClass {
  if (framing === 'head-shoulders') return 'tight';
  if (framing === 'chest-up') return 'medium';
  return 'wide';
}

export function deriveActivityDensity(
  familyId: SceneFamilyId,
  subScene: string,
  timeOfDay: TimeOfDay,
  framingClass: FramingClass
): ActivityDensity {
  // Bedroom: always none
  if (familyId === 'bedroom') return 'none';

  // Interior Car: none or minimal
  if (familyId === 'car') {
    if (subScene.includes('خارج') || subScene.includes('بجانب') || subScene.includes('مواقف')) {
      return timeOfDay === 'night' ? 'minimal' : 'light';
    }
    return timeOfDay === 'night' ? 'none' : 'minimal';
  }

  // Living Room: minimal
  if (familyId === 'living-room') return 'none';

  // Gym: moderate during active times, light otherwise
  if (familyId === 'gym') {
    if (framingClass === 'tight') return 'minimal';
    return (timeOfDay === 'sunset' || timeOfDay === 'afternoon') ? 'moderate' : 'light';
  }

  // Military Base:
  if (familyId === 'military-base') {
    if (subScene.includes('مكتب') || subScene.includes('اجتماعات') || subScene.includes('زاوية')) {
      return 'minimal';
    }
    if (subScene.includes('ممر') || subScene.includes('مدخل') || subScene.includes('انتظار')) {
      return 'light';
    }
    return 'minimal';
  }

  // Saudi Outdoor:
  if (familyId === 'saudi-outdoor') {
    if (subScene.includes('شارع تجاري') || subScene.includes('مقهى') || subScene.includes('ممشى')) {
      if (framingClass === 'tight') return 'minimal';
      return (timeOfDay === 'midday' || timeOfDay === 'morning') ? 'light' : 'moderate';
    }
    // Residential streets & villa walls
    if (framingClass === 'tight') return 'none';
    return timeOfDay === 'night' ? 'minimal' : 'minimal';
  }

  return 'minimal';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. PHYSICAL SCENE RESOLVER (DETERMINISTIC PIPELINE)
// Flow: Detect -> Resolve -> Validate Again -> Generate
// Priority Order:
// 1. Identity Lock
// 2. Explicit User Selections
// 3. Capture Topology
// 4. Hard Physical Constraints
// 5. Camera Geometry
// 6. Spatial Consistency
// 7. Visibility / FOV
// 8. Lighting Causality
// 9. Environmental Realism
// 10. Background Activity
// 11. Realism Imperfections
// 12. Stylistic Wording
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function resolveScene(rawState: SceneState): ResolvedScene {
  // Step 1: DETECT initial physical contradictions
  const initialValidation = validateScene(rawState);
  const issues: ValidationIssue[] = [...initialValidation.issues];
  let s: SceneState = { ...rawState };

  const familyId = s.sceneFamily || 'saudi-outdoor';
  const microLoc = getMicroLocation(familyId, s.subScene);
  const isOutdoor = microLoc ? microLoc.isOutdoor : (familyId === 'saudi-outdoor');
  const isNight = s.timeOfDay === 'night';
  const isDay = ['morning', 'midday', 'afternoon'].includes(s.timeOfDay);

  if (s.groupSelfieEnabled) {
    const group = resolveGroupSelfie({
      enabled: true,
      requestedSize: s.groupSelfieSize ?? 2,
      relationship: s.groupSelfieRelationship ?? 'auto',
      familyId,
      subScene: s.subScene,
      framing: s.framing,
      microLoc
    });

    if (s.captureType !== 'front-selfie') {
      issues.push({
        type: 'contradiction',
        field: 'captureType',
        description: 'Group selfie mode requires the direct Xiaomi 15 Ultra front camera.',
        autoResolvedBy: 'Capture type changed to front-selfie.'
      });
      s.captureType = 'front-selfie';
    }

    if ((s.groupSelfieSize ?? 2) !== group.resolvedSize) {
      issues.push({
        type: 'physical_impossibility',
        field: 'groupSelfieSize',
        description: `Requested group size ${s.groupSelfieSize ?? 2} exceeds the physical capacity of ${s.subScene || familyId}.`,
        autoResolvedBy: `Group size capped to ${group.resolvedSize} people for this micro-location.`
      });
      s.groupSelfieSize = group.resolvedSize;
    }

    const widenedFraming = widenFramingForGroup(s.framing, group.resolvedSize);
    if (widenedFraming !== s.framing) {
      issues.push({
        type: 'contradiction',
        field: 'framing',
        description: `${s.framing} is too tight for a ${group.resolvedSize}-person group selfie.`,
        autoResolvedBy: `Framing widened to ${widenedFraming} while preserving Xiaomi front-camera geometry.`
      });
      s.framing = widenedFraming;
    }
  }

  // Canonical Xiaomi 15 Ultra front-camera lock.
  if (s.captureType === 'front-selfie' && (s.lensCondition === 'modern-iphone' || s.lensCondition === 'budget-android')) {
    issues.push({
      type: 'contradiction',
      field: 'lensCondition',
      description: `Legacy lens profile (${s.lensCondition}) conflicts with the fixed Xiaomi 15 Ultra front-camera hardware lock.`,
      autoResolvedBy: 'Normalized to the canonical clean Xiaomi 15 Ultra front-camera profile.'
    });
    s.lensCondition = 'xiaomi-clean';
  }

  if (s.captureType === 'front-selfie' && s.foregroundObstruction === 'through-glass') {
    issues.push({
      type: 'physical_impossibility',
      field: 'foregroundObstruction',
      description: 'Through-glass foreground obstruction is incompatible with a direct handheld front-camera selfie.',
      autoResolvedBy: 'Removed the foreground glass layer while preserving physically plausible background reflections.'
    });
    s.foregroundObstruction = 'clean';
  }

  // --- Step 2: RESOLVE Contradictions prioritizing User Intent ---

  // Check & Resolve 1: Capture Topology & Mirror Selfie in Mirror-less Environments
  if (s.captureType === 'mirror-selfie') {
    const naturallyMirrorLocations: SceneFamilyId[] = ['bedroom', 'gym', 'living-room'];
    const hasShopWindowGlass = familyId === 'saudi-outdoor' && (s.subScene.includes('مقهى') || s.subScene.includes('محلات') || s.subScene.includes('خدمات'));

    if (!naturallyMirrorLocations.includes(familyId) && !hasShopWindowGlass) {
      issues.push({
        type: 'physical_impossibility',
        field: 'captureType',
        description: `Mirror selfie selected in open outdoor environment (${s.subScene}) lacking reflective mirror surfaces.`,
        autoResolvedBy: 'Adjusted captureType to front-selfie while maintaining exact user framing, camera angle, and focal position.'
      });
      s.captureType = 'front-selfie';
    }
  }

  // Check & Resolve 2: Seat & Body Pose vs Micro-Location Compatibility
  if (familyId === 'car') {
    if (!isOutdoor) {
      // Inside car interior: must be in-seat poses
      if (s.pose.includes('واقف') || s.pose.includes('يمشي') || s.pose.includes('السرير') || s.pose.includes('الأجهزة')) {
        issues.push({
          type: 'physical_impossibility',
          field: 'pose',
          description: `Standing or walking pose ("${s.pose}") is physically impossible inside vehicle cabin (${s.subScene}).`,
          autoResolvedBy: 'Adjusted pose to seated in bucket seat with backrest contact and steering wheel clearance.'
        });
        s.pose = s.subScene.includes('راكب') ? 'جالس في مقعد الراكب' : 'جالس باسترخاء في المقعد';
      }
    }
  } else if (familyId === 'military-base') {
    if (s.subScene.includes('مكتب') && (s.pose.includes('السرير') || s.pose.includes('المقود') || s.pose.includes('الأجهزة'))) {
      issues.push({
        type: 'contradiction',
        field: 'pose',
        description: `Pose "${s.pose}" is incompatible with administrative office workstation.`,
        autoResolvedBy: 'Adjusted to seated behind desk or standing upright.'
      });
      s.pose = 'جالس خلف المكتب';
    }
  } else if (familyId === 'bedroom') {
    if (s.pose.includes('المقود') || s.pose.includes('الأجهزة')) {
      issues.push({
        type: 'contradiction',
        field: 'pose',
        description: `Pose "${s.pose}" belongs to vehicle/gym, incompatible with bedroom setting.`,
        autoResolvedBy: 'Adjusted to seated on bed edge or standing.'
      });
      s.pose = 'جالس على حافة السرير';
    }
  }

  // Check & Resolve 3: Lighting Source Causality & Day/Night Conflicts
  if (s.lightingMode === 'إضاءة شاشة الهاتف فقط' || s.lightingMode === 'فلاش الشاشة الأمامية فقط') {
    if (s.timeOfDay !== 'night') {
      issues.push({
        type: 'physical_impossibility',
        field: 'lightingMode',
        description: 'Phone screen illumination cannot physically overpower daylight; requires dark ambient environment.',
        autoResolvedBy: 'Adjusted lighting to natural daylight to preserve user timeOfDay selection.'
      });
      s.lightingMode = isOutdoor ? 'ضوء نهاري طبيعي' : 'ضوء نهاري من النافذة';
    }
  } else if (isNight) {
    if (s.lightingMode.includes('نهار') || s.lightingMode.includes('شمس')) {
      issues.push({
        type: 'contradiction',
        field: 'lightingMode',
        description: `Solar/daylight source ("${s.lightingMode}") selected for a nighttime setting.`,
        autoResolvedBy: 'Assigned authentic nocturnal lighting source appropriate to location.'
      });
      if (familyId === 'saudi-outdoor') s.lightingMode = 'إنارة شارع دافئة';
      else if (familyId === 'car') s.lightingMode = 'إضاءة الشارع عبر زجاج السيارة';
      else if (familyId === 'living-room') s.lightingMode = 'إنارة ليلية مختلطة';
      else if (familyId === 'bedroom') s.lightingMode = 'إضاءة أباجورة دافئة';
      else s.lightingMode = 'إضاءة ممرات متوازية';
    }
  } else if (isDay) {
    if (s.lightingMode === 'إضاءة شاشة الهاتف فقط') {
      issues.push({
        type: 'contradiction',
        field: 'lightingMode',
        description: 'Phone screen as sole illumination is physically ineffective during daylight.',
        autoResolvedBy: 'Adjusted to natural daytime lighting.'
      });
      s.lightingMode = isOutdoor ? 'ضوء نهاري طبيعي' : 'ضوء نهاري من النافذة';
    }
  }

  // Check & Resolve 4: Indoor vs Outdoor Lighting Mismatch
  if (isOutdoor && s.lightingMode.match(/مكتب|سقف|أباجورة/)) {
    issues.push({
      type: 'physical_impossibility',
      field: 'lightingMode',
      description: `Indoor ceiling/desk light ("${s.lightingMode}") cannot exist in open outdoor Saudi environment.`,
      autoResolvedBy: 'Adjusted to outdoor daylight or practical streetlamp lighting.'
    });
    s.lightingMode = isNight ? 'إنارة شارع دافئة' : 'ضوء نهاري طبيعي';
  } else if (!isOutdoor && s.lightingMode.match(/شمس|شارع/) && !s.subScene.includes('نافذة') && familyId !== 'car') {
    issues.push({
      type: 'physical_impossibility',
      field: 'lightingMode',
      description: `Direct street or sun lighting ("${s.lightingMode}") applied to enclosed interior room.`,
      autoResolvedBy: 'Adjusted to ambient interior lighting fixture.'
    });
    s.lightingMode = isNight ? 'إضاءة سقف' : 'ضوء نهاري من النافذة';
  }

  // Check & Resolve 5: Glasses Consistency between Selector and Custom Prompt
  if (s.glassesMode === 'no_glasses' && /must wear dark rectangular eyeglasses|Dark rectangular eyeglasses visible in reference MUST be worn/i.test(s.customIdentityPrompt || '')) {
    issues.push({
      type: 'contradiction',
      field: 'glassesMode',
      description: 'Custom identity prompt demands glasses while selector explicitly disabled glasses.',
      autoResolvedBy: 'User explicit selection (no_glasses) took precedence; purged forced glasses directive from custom prompt.'
    });
    s.customIdentityPrompt = (s.customIdentityPrompt || '')
      .replace(/must wear dark rectangular eyeglasses\.?\s*/gi, '')
      .replace(/Dark rectangular eyeglasses visible in reference MUST be worn\.?\s*/gi, '')
      .replace(/Dark rectangular eyeglasses MUST be worn\.?\s*/gi, '')
      .trim();
  }

  // Check & Resolve 6: Atmospheric and Environmental Reality Alignment
  if (!isOutdoor && s.atmosphericCondition === 'breezy' && familyId !== 'car') {
    issues.push({
      type: 'warning',
      field: 'atmosphericCondition',
      description: 'Outdoor-style wind motion requested in an enclosed interior scene.',
      autoResolvedBy: 'Normalized to neutral indoor air; mild airflow is treated as local HVAC.'
    });
    s.atmosphericCondition = 'neutral';
  }

  // Check & Resolve 7: Couple lighting sliders to physically causal lighting modes.
  if (s.lightingMode === 'إضاءة شاشة الهاتف فقط' || s.lightingMode === 'فلاش الشاشة الأمامية فقط') {
    if (s.lightingIntensity > 35) {
      issues.push({
        type: 'warning',
        field: 'lightingIntensity',
        description: 'Phone-screen-only lighting cannot create a bright room-scale ambient level.',
        autoResolvedBy: 'Clamped lighting intensity to 35% maximum for localized screen illumination.'
      });
      s.lightingIntensity = 35;
    }
    if (s.shadowDepth < 75) {
      issues.push({
        type: 'warning',
        field: 'shadowDepth',
        description: 'Phone-screen-only lighting requires rapid falloff and comparatively deep shadows.',
        autoResolvedBy: 'Raised shadow depth to 75% minimum.'
      });
      s.shadowDepth = 75;
    }
  } else if (isOutdoor && s.timeOfDay === 'midday') {
    if (s.lightingIntensity < 65) s.lightingIntensity = 65;
    if (s.shadowDepth < 50) s.shadowDepth = 50;
  }

  // Step 3: VALIDATE AGAIN after resolution to ensure 100% physical validity
  const postValidation = validateScene(s);

  // Step 4: Calculate Detailed Derived Physical State & Derived Scene State
  const framingClass = getFramingClass(s.framing);
  const physicalState = calculateDetailedPhysicalState(s, microLoc, isOutdoor, s.timeOfDay === 'night', framingClass);
  const derived = calculateDerivedState(s, microLoc, physicalState);

  // Backward-compatible physics object for existing consumers
  const physics: DerivedPhysics = {
    phoneDistance: physicalState.cameraDistance,
    cameraHeight: physicalState.cameraPosition,
    cameraYawPitch: `${physicalState.cameraYaw}, ${physicalState.cameraPitch}`,
    armReach: physicalState.armReach,
    bodyOrientation: physicalState.bodyOrientation,
    visibleBodyRegion: physicalState.visibleBodyRegion,
    fieldOfView: physicalState.fieldOfView,
    occlusion: physicalState.occlusions,
    backgroundDepth: physicalState.backgroundDepth,
    availableLightSources: physicalState.lightSources,
    shadowDirection: physicalState.shadowBehavior,
    exposureBehavior: physicalState.exposureBehavior,
    reflections: physicalState.reflectionState,
    physicallyVisibleElements: [physicalState.visibleEnvironment, ...physicalState.visibleVehicles, ...physicalState.visiblePeople]
  };

  if (physicalState.plausibility.overallStatus === 'impossible') {
    for (const blocker of physicalState.plausibility.blockers) {
      issues.push({
        type: 'physical_impossibility',
        field: 'scenePlausibility',
        description: blocker
      });
    }
  }

  const validationResult: ValidationResult = {
    isValid: postValidation.isValid && physicalState.plausibility.overallStatus !== 'impossible',
    issues,
    autoResolved: issues.some(issue => Boolean(issue.autoResolvedBy))
  };

  return {
    state: s,
    derived,
    physics,
    physicalState,
    validation: validationResult
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. DETERMINISTIC SCENE VALIDATOR
// Scans an existing state for physical, optical, or spatial contradictions.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function validateScene(inputState: SceneState | ResolvedScene): ValidationResult {
  const state = 'state' in inputState ? inputState.state : inputState;
  const issues: ValidationIssue[] = [];

  const familyId = state.sceneFamily || 'saudi-outdoor';
  const microLoc = getMicroLocation(familyId, state.subScene);
  const isOutdoor = microLoc ? microLoc.isOutdoor : (familyId === 'saudi-outdoor');
  const isNight = state.timeOfDay === 'night';
  const isDay = ['morning', 'midday', 'afternoon'].includes(state.timeOfDay);

  if (state.groupSelfieEnabled) {
    const group = resolveGroupSelfie({
      enabled: true,
      requestedSize: state.groupSelfieSize ?? 2,
      relationship: state.groupSelfieRelationship ?? 'auto',
      familyId,
      subScene: state.subScene,
      framing: state.framing,
      microLoc
    });

    if (state.captureType !== 'front-selfie') {
      issues.push({
        type: 'contradiction',
        field: 'groupSelfieEnabled',
        description: 'Group selfie mode is enabled but capture type is not front-selfie.'
      });
    }
    if ((state.groupSelfieSize ?? 2) > group.maxByLocation) {
      issues.push({
        type: 'physical_impossibility',
        field: 'groupSelfieSize',
        description: `Group size exceeds selected micro-location capacity (${group.maxByLocation}).`
      });
    }
    if (widenFramingForGroup(state.framing, group.resolvedSize) !== state.framing) {
      issues.push({
        type: 'contradiction',
        field: 'framing',
        description: `Selected framing is too tight for ${group.resolvedSize} people.`
      });
    }
    if (!group.antiCloningPassed) {
      issues.push({
        type: 'contradiction',
        field: 'groupSelfieProfiles',
        description: 'Generated companion profiles are not visually distinct enough.'
      });
    }
  }

  // 1. Mirror Selfie Check
  if (state.captureType === 'mirror-selfie') {
    const mirrorAllowedFamilies = ['bedroom', 'gym', 'living-room'];
    const hasShopWindow = familyId === 'saudi-outdoor' && (state.subScene.includes('مقهى') || state.subScene.includes('محلات'));
    if (!mirrorAllowedFamilies.includes(familyId) && !hasShopWindow) {
      issues.push({
        type: 'physical_impossibility',
        field: 'captureType',
        description: `Mirror selfie requested in open environment (${state.subScene}) lacking reflective mirror.`
      });
    }
  }

  // 2. Pose vs Geometry
  if (familyId === 'car' && !isOutdoor) {
    if (state.pose.includes('واقف') || state.pose.includes('يمشي')) {
      issues.push({
        type: 'physical_impossibility',
        field: 'pose',
        description: 'Standing or walking pose inside a closed vehicle cabin.'
      });
    }
  }

  // 3. Day / Night vs Lighting
  if (isNight && (state.lightingMode.includes('نهار') || state.lightingMode.includes('شمس'))) {
    issues.push({
      type: 'contradiction',
      field: 'lightingMode',
      description: 'Solar daylight source specified during nighttime.'
    });
  }
  if ((state.lightingMode === 'إضاءة شاشة الهاتف فقط' || state.lightingMode === 'فلاش الشاشة الأمامية فقط') && isDay) {
    issues.push({
      type: 'contradiction',
      field: 'lightingMode',
      description: 'Phone screen cannot be sole lighting source during daytime.'
    });
  }

  // 4. Indoor / Outdoor vs Fixtures
  if (isOutdoor && state.lightingMode.match(/مكتب|سقف|أباجورة/)) {
    issues.push({
      type: 'physical_impossibility',
      field: 'lightingMode',
      description: 'Indoor ceiling fixture in open outdoor location.'
    });
  }

  // 5. Glasses Consistency
  if (state.glassesMode === 'no_glasses' && /must wear dark rectangular eyeglasses|Dark rectangular eyeglasses visible in reference MUST be worn/i.test(state.customIdentityPrompt || '')) {
    issues.push({
      type: 'contradiction',
      field: 'glassesMode',
      description: 'Glasses explicitly disabled in selector, but custom identity prompt demands glasses.'
    });
  }

  return {
    isValid: issues.filter(i => i.type === 'physical_impossibility' || i.type === 'contradiction').length === 0,
    issues,
    autoResolved: false
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. DETAILED PHYSICAL STATE CALCULATOR (SELFIE OPTICS & BACKGROUND ENGINE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function calculateDetailedPhysicalState(
  state: SceneState,
  microLoc: MicroLocation | undefined,
  isOutdoor: boolean,
  isNight: boolean,
  framingClass: FramingClass
): DerivedPhysicalState {
  const familyId = state.sceneFamily || 'saudi-outdoor';

  const selfieAngle = resolveSelfieAngleGeometry({
    captureType: state.captureType,
    sceneFamily: state.sceneFamily,
    subScene: state.subScene,
    pose: state.pose,
    activity: state.activity,
    framing: state.framing,
    manualAngle: state.cameraAngle,
    timeOfDay: state.timeOfDay,
    lightingMode: state.lightingMode,
    backgroundAutoAngle: state.backgroundAutoAngle ?? true,
    backgroundMode: state.backgroundMode,
    backgroundHumans: state.backgroundHumans,
    backgroundVehicles: state.backgroundVehicles,
    backgroundDisorder: state.backgroundDisorder,
    backgroundActivity: state.backgroundActivity,
    backgroundPresence: state.backgroundPresence,
    backgroundCompositionGoal: state.backgroundCompositionGoal,
    groupSelfieEnabled: state.groupSelfieEnabled,
    groupSelfieSize: state.groupSelfieSize,
    mode: state.cameraAngleMode ?? 'manual',
    advice: state.selfieAngleAdvice
  });

  const effectiveCameraAngle = selfieAngle?.legacyAngle ?? state.cameraAngle;
  const groupSelfie = state.groupSelfieEnabled
    ? resolveGroupSelfie({
        enabled: true,
        requestedSize: state.groupSelfieSize ?? 2,
        relationship: state.groupSelfieRelationship ?? 'auto',
        familyId,
        subScene: state.subScene,
        framing: state.framing,
        microLoc
      })
    : null;

  // --- 1. Camera Distance, Arm Reach & Optics ---
  let cameraDistance = 'approx 52cm';
  let distanceCm = 52;
  let armReach = '';
  let fieldOfView = '';
  let opticalPerspective = '';

  if (state.captureType === 'front-selfie') {
    // FIXED XIAOMI 15 ULTRA FRONT CAMERA OPTICS (21mm eq, ~90° FOV)
    // Smart mode may refine the exact handheld distance, but only inside framing-safe limits.
    if (selfieAngle) {
      distanceCm = selfieAngle.distanceCm;
      cameraDistance = `approx ${Math.round(distanceCm)}cm (physically bounded handheld selfie reach)`;
      armReach = selfieAngle.armMechanics;
    } else if (framingClass === 'tight') {
      distanceCm = 42;
      cameraDistance = 'approx 40-42cm (close handheld reach)';
      armReach = 'dominant arm flexed at elbow (~65° flexion) holding smartphone near chin-to-eye height off-camera (phone NOT in frame)';
    } else if (framingClass === 'medium') {
      distanceCm = 52;
      cameraDistance = 'approx 50-54cm (comfortable arm reach)';
      armReach = 'dominant arm extended at ~40° elbow flexion with subtle natural shoulder elevation, smartphone held off-camera';
    } else {
      distanceCm = 60;
      cameraDistance = 'approx 58-60cm (maximum realistic one-arm selfie reach)';
      armReach = 'dominant arm extended near full reach (~60cm) with subtle upper torso tilt compensating for wide framing, smartphone held off-camera';
    }

    if (groupSelfie) {
      distanceCm = Math.max(distanceCm, groupSelfie.recommendedDistanceCm);
      cameraDistance = `approx ${Math.round(distanceCm)}cm (group selfie reach, physically bounded by one extended arm)`;
      armReach = `reference subject alone holds the Xiaomi 15 Ultra at about ${Math.round(distanceCm)}cm; companions lean into the shared FOV without duplicating the phone-holding arm`;
    }

    fieldOfView = XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE.fieldOfView;
    opticalPerspective = XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE.getPerspectiveDescription(distanceCm, framingClass);
  } else if (state.captureType === 'mirror-selfie') {
    distanceCm = 85;
    cameraDistance = 'mirror-selfie reflection path: camera-to-mirror plus mirror-to-subject distance (do not assume fixed 2x path without geometry)';
    armReach = 'dominant hand visibly holding smartphone at mid-chest or upper-abdomen level aimed steadily at mirror surface';
    fieldOfView = 'standard smartphone main rear lens perspective (~24mm eq, ~68° horizontal FOV)';
    opticalPerspective = 'rear camera optics through flat mirror: reflected subject appears at the sum of camera-to-mirror and mirror-to-subject optical distances; do not focus the reflection at the glass plane, and do not force background blur; smartphone visibly grasped in hand partially occluding fingers';
  } else {
    // third-person-candid
    distanceCm = 240;
    cameraDistance = 'approx 2.2m - 2.8m (third-person bystander eye-level distance)';
    armReach = 'both hands free, natural unextended arm posture at sides or in pockets (no selfie arm mechanics)';
    fieldOfView = 'natural human perspective observer lens (~32mm equivalent, ~56° horizontal FOV)';
    opticalPerspective = 'candid observer perspective: balanced architectural proportions, natural depth compression without wide-angle arm distortion';
  }

  // --- 2. Camera Angles (Yaw, Pitch, Roll, Height, Direction) ---
  let cameraPosition = 'eye-level (+0cm vertical offset)';
  let cameraPitch = '0° pitch (frontal orthogonal)';
  let cameraYaw = '0° yaw';
  let cameraRoll = '0° roll';
  let cameraDirection = 'facing subject face frontally';

  if (selfieAngle && state.captureType === 'front-selfie') {
    cameraPosition = selfieAngle.cameraPosition;
    cameraPitch = `${selfieAngle.pitchDeg.toFixed(1)}° pitch`;
    cameraYaw = `${selfieAngle.yawDeg.toFixed(1)}° yaw`;
    cameraRoll = `${selfieAngle.rollDeg.toFixed(1)}° roll`;
    cameraDirection = selfieAngle.cameraDirection;
  } else if (state.cameraAngle === 'slightly-high') {
    cameraPosition = 'elevated slightly above eye-line (+18cm relative height)';
    cameraPitch = '-14° downward tilt pointing toward subject face and jawline';
    cameraDirection = 'aiming down from elevated arm posture';
  } else if (state.cameraAngle === 'slightly-low') {
    cameraPosition = 'positioned below chin level (-18cm relative height)';
    cameraPitch = '+14° upward tilt pointing toward jawline and ceiling/sky';
    cameraDirection = 'aiming upward from chest/lap level';
  } else if (state.cameraAngle === 'slightly-off-center') {
    cameraPosition = 'eye-level (+5cm)';
    cameraYaw = '18° horizontal yaw (candid asymmetric handheld angle)';
    cameraPitch = '-5° subtle pitch';
    cameraRoll = '1° natural handheld roll';
    cameraDirection = 'held slightly to the side with natural single-handed grip';
  }

  // --- 3. Body Orientation & Visible Region ---
  let bodyOrientation = 'upper torso facing forward toward camera lens';
  let visibleBodyRegion = 'head, neck, collar area, and upper chest';

  if (framingClass === 'tight') {
    visibleBodyRegion = 'head, facial features, neck, and top edge of shirt collar';
  } else if (framingClass === 'medium') {
    visibleBodyRegion = 'head down to mid-sternum, shoulders, and sleeve origins';
  } else {
    visibleBodyRegion = 'head down to waistband, full torso, and upper hip line';
  }

  if (state.pose.includes('مستند') || effectiveCameraAngle === 'slightly-off-center') {
    bodyOrientation = 'torso angled approximately 20° - 30° relative to camera line of sight';
  } else if (familyId === 'car' && !isOutdoor) {
    bodyOrientation = 'seated forward in contoured vehicle bucket seat with backrest and headrest support';
  }

  // --- 4. Occlusions & Foreground Elements (Section 13, 15) ---
  const occlusions: string[] = [];
  const foregroundElements: string[] = [];

  if (familyId === 'car' && !isOutdoor) {
    occlusions.push('lower body occluded by car door panel, center console, and steering wheel');
    foregroundElements.push('slight edge of steering wheel rim or A-pillar trim partially visible at extreme outer frame boundary');
  } else if (state.pose.includes('خلف المكتب') || (familyId === 'military-base' && state.subScene.includes('مكتب'))) {
    occlusions.push('waist and lower torso occluded by administrative desk surface');
    foregroundElements.push('front edge of office desk with neatly placed document folder in immediate near-ground');
  } else if (state.pose.includes('السرير')) {
    occlusions.push('lower thighs occluded by mattress edge');
  } else if (familyId === 'military-base' && state.subScene.includes('ممر')) {
    foregroundElements.push('doorway jamb edge subtly framing one side of composition');
  } else if (isOutdoor && framingClass === 'wide') {
    foregroundElements.push('low concrete curb edge at lower perimeter of composition');
  }

  if (state.captureType === 'front-selfie') {
    occlusions.push('capturing smartphone is positioned off-camera outside field of view (NOT visible in front of face)');
  } else if (state.captureType === 'mirror-selfie') {
    occlusions.push('smartphone held in hand partially occluding fingers in mirror reflection');
    foregroundElements.push('edge of mirror frame at composition border');
  }

  // --- 5. Background Depth & Visibility / FOV Filtering (Section 7, 8, 14) ---
  let backgroundDepth = isOutdoor ? 'medium outdoor depth (~8m to 30m vanishing point)' : 'shallow interior room depth (~1.5m to 4m)';
  if (state.subScene.includes('سور') || state.subScene.includes('جدار') || (familyId === 'car' && !isOutdoor)) {
    backgroundDepth = 'shallow plane (< 1.5m immediately behind subject)';
  } else if (state.subScene.includes('ممشى') || state.subScene.includes('شارع')) {
    backgroundDepth = 'deep street perspective (> 25m vanishing point)';
  }

  // --- 5. Scene-aware Background Realism ---
  // Visibility is derived from the actual micro-location and selfie geometry.
  const activityDensity = deriveActivityDensity(familyId, state.subScene, state.timeOfDay, framingClass);
  const backgroundRealism = deriveBackgroundRealism({
    familyId,
    subScene: state.subScene,
    timeOfDay: state.timeOfDay,
    framingClass,
    cameraAngle: effectiveCameraAngle,
    captureType: state.captureType,
    activityDensity,
    isOutdoor,
    lightingMode: state.lightingMode,
    backgroundMode: state.backgroundMode,
    backgroundHumans: state.backgroundHumans,
    backgroundVehicles: state.backgroundVehicles,
    backgroundDisorder: state.backgroundDisorder,
    backgroundActivity: state.backgroundActivity,
    backgroundPresence: state.backgroundPresence,
    backgroundCompositionGoal: state.backgroundCompositionGoal,
    backgroundGeminiAssist: state.backgroundGeminiAssist,
    backgroundGeminiAdvice: state.backgroundGeminiAdvice,
    groupSelfieEnabled: state.groupSelfieEnabled,
    groupSelfieSize: state.groupSelfieSize,
    microLoc
  });

  let visibleEnvironment = backgroundRealism.environmentalSurfaces.join(', ');
  if (!visibleEnvironment) {
    visibleEnvironment = microLoc?.environmentPrompt
      || (isOutdoor
        ? 'ordinary Saudi exterior surface physically visible within the selfie field of view'
        : 'ordinary interior surface physically visible immediately behind the subject');
  }

  // Fixed-home environments own their visible furniture/surface facts.
  // Generic micro-location prose may still supply spatial relation, but it cannot
  // introduce alternate furniture identities that conflict with continuity.
  const homeContinuity = resolveHomeContinuity(state);
  if (homeContinuity) {
    visibleEnvironment = compileFixedHomeVisibleEnvironment(
      homeContinuity,
      microLoc?.spatialBehavior
    );
  }

  const visiblePeople = backgroundRealism.allowsHumans
    ? [...backgroundRealism.humanBehavior]
    : [];

  const visibleVehicles = backgroundRealism.allowsVehicles
    ? [...backgroundRealism.vehicleBehavior]
    : [];

  const yardVisibility = resolveHomeYardVisibility({
    microLocationId: microLoc?.id,
    framingClass,
    cameraAngle: effectiveCameraAngle,
    captureType: state.captureType,
  });
  if (yardVisibility) {
    visibleEnvironment = compileHomeYardEnvironment(yardVisibility);
    visibleVehicles.length = 0;
    visibleVehicles.push(...yardVisibility.vehiclePrompt);
    occlusions.push(...yardVisibility.geometryGuards);
  }

  const motionBehavior = backgroundRealism.motionRules.join('; ')
    || 'static resting scene, zero abrupt motion blur';

  const disorderBehavior = backgroundRealism.allowsMildDisorder
    ? backgroundRealism.mildDisorderElements.join('; ')
    : 'restrained ordinary wear only; no decorative clutter';

  // --- 8. Physical Lighting Causality ---
  // A single deterministic solver owns source hierarchy, direction, falloff,
  // bounce, shadow causality, and camera exposure behavior.
  const isMidday = state.timeOfDay === 'midday';
  const isHighContrast = state.lightingIntensity > 75 || state.shadowDepth > 70;
  const cameraExposureBehavior = XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE.getExposureBehavior(
    isNight,
    isMidday,
    isHighContrast
  );

  const lightingCausality = deriveLightingCausality({
    familyId,
    subScene: state.subScene,
    timeOfDay: state.timeOfDay,
    lightingMode: state.lightingMode,
    lightingIntensity: state.lightingIntensity,
    shadowDepth: state.shadowDepth,
    isOutdoor,
    microLoc,
    backgroundLightSources: backgroundRealism.lightSources,
    cameraExposureBehavior
  });

  const lightSources = [...lightingCausality.sourceSummary];
  const shadowBehavior = lightingCausality.shadowBehavior;
  const exposureBehavior = lightingCausality.exposureBehavior;

  // --- 8.5 Material & Surface Response ---
  // Realism is not only geometry and light placement. Surfaces must react to
  // those lights according to material roughness, reflectance, contact, and depth.
  const surfaceRealism = deriveSurfaceRealism({
    familyId,
    isOutdoor,
    timeOfDay: state.timeOfDay,
    captureType: state.captureType,
    glassesMode: state.glassesMode,
    clothingCondition: state.clothingCondition,
    atmosphericCondition: state.atmosphericCondition,
    lighting: lightingCausality
  });

  // --- 9. Physical Reflections (Section 17) ---
  const reflectionState: string[] = [];
  if (state.glassesMode === 'wear_glasses') {
    reflectionState.push('subtle asymmetrical ambient catchlights on spectacle lenses without occluding eyes or pupils');
  }
  if (familyId === 'car') {
    reflectionState.push('specular highlight reflections on side window glass and rearview mirror housing');
  }
  if (state.captureType === 'mirror-selfie') {
    reflectionState.push('optically accurate flat mirror reflection with phone camera lens visible in reflection');
  }

  const plausibility = evaluateScenePlausibility({
    familyId,
    subScene: state.subScene,
    captureType: state.captureType,
    framingClass,
    cameraAngle: effectiveCameraAngle,
    pose: state.pose,
    foregroundObstruction: state.foregroundObstruction,
    isOutdoor,
    visibleBodyRegion,
    occlusions,
    foregroundElements,
    backgroundRealism,
    lightingCausality
  });

  return {
    cameraPosition,
    cameraDistance,
    cameraDirection,
    cameraPitch,
    cameraYaw,
    cameraRoll,
    armReach,
    bodyOrientation,
    visibleBodyRegion,
    framingClass,
    fieldOfView,
    opticalPerspective,
    visibleEnvironment,
    foregroundElements,
    occlusions,
    backgroundDepth,
    activityDensity,
    visiblePeople,
    visibleVehicles,
    lightSources,
    shadowBehavior,
    reflectionState,
    exposureBehavior,
    motionBehavior,
    disorderBehavior,
    backgroundRealism,
    lightingCausality,
    surfaceRealism,
    plausibility,
    selfieAngle,
    groupSelfie
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. DERIVED SCENE STATE BUILDER
// Builds skin response, fabric dynamics, and realism constraints.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function calculateDerivedState(
  state: SceneState,
  microLoc: MicroLocation | undefined,
  physics: DerivedPhysicalState
): DerivedSceneState {
  const intensity = typeof state.lightingIntensity === 'number' ? state.lightingIntensity : 70;
  const depth = typeof state.shadowDepth === 'number' ? state.shadowDepth : 60;

  let lightingIntensityDescription = `${intensity}% ambient illumination level`;
  if (intensity <= 35) lightingIntensityDescription = `subdued ambient level (${intensity}%), low-intensity secondary bounce`;
  else if (intensity >= 75) lightingIntensityDescription = `bright luminous ambient level (${intensity}%), strong environmental bounce`;

  let shadowDepthDescription = `${depth}% shadow depth`;
  if (depth <= 35) shadowDepthDescription = `soft penumbra diffusion (${depth}%), gentle light falloff`;
  else if (depth >= 75) shadowDepthDescription = `deep high-contrast shadow hardness (${depth}%), crisp contact occlusion`;

  const derived: DerivedSceneState = {
    skinResponse: physics.surfaceRealism.skinResponse,
    hairCondition: 'natural human hair density, preserving authentic hairline without synthetic thickening',
    fabricBehavior: [physics.surfaceRealism.fabricResponse],
    shadowBehavior: `${physics.shadowBehavior}; ${physics.lightingCausality.contrastBehavior}; calibrated to ${depth}% shadow hardness (${shadowDepthDescription})`,
    environmentalLightBehavior: `primary light: ${physics.lightingCausality.primarySource.name}; secondary/bounce: ${physics.lightingCausality.secondarySources.map(source => source.name).join('; ') || 'none'}; bounce surfaces: ${physics.lightingCausality.bounceSurfaces.join('; ')}; falloff: ${physics.lightingCausality.falloffBehavior}; calibrated to ${intensity}% ambient intensity`,
    cameraDistance: physics.cameraDistance,
    visibleBackgroundElements: [physics.visibleEnvironment, ...physics.visibleVehicles, ...physics.visiblePeople],
    contactPhysics: [physics.armReach, ...physics.occlusions],
    reflectionRules: physics.reflectionState,
    realismConstraints: [
      `Camera optics: ${physics.fieldOfView}`,
      `Camera perspective: ${physics.opticalPerspective}`,
      `Camera position: ${physics.cameraPosition}, ${physics.cameraPitch}, ${physics.cameraYaw}, ${physics.cameraRoll}`,
      physics.selfieAngle
        ? `Selfie angle director: preset=${physics.selfieAngle.presetId}, source=${physics.selfieAngle.source}, risk=${physics.selfieAngle.risk}; ${physics.selfieAngle.reasonAR.join(' ')}`
        : 'Selfie angle director: not applicable to this capture topology',
      physics.selfieAngle?.phonePlacement
        ? `In-car phone placement: ${physics.selfieAngle.phonePlacement}; cabin guards: ${physics.selfieAngle.cabinGuards?.join('; ') || 'standard cabin clearance'}`
        : 'In-car phone placement: not applicable',
      `Visible anatomical region: ${physics.visibleBodyRegion}`,
      `Background depth plane: ${physics.backgroundDepth}`,
      `Sensor exposure: ${physics.exposureBehavior}`,
      `Lighting causality: ${physics.lightingCausality.inverseSquareBehavior}`,
      `Lighting guards: ${physics.lightingCausality.consistencyGuards.join('; ')}`,
      `Surface realism: score=${physics.surfaceRealism.score}/100; ${physics.surfaceRealism.consistencyGuards.join('; ')}`,
      `Surface response: ${physics.surfaceRealism.environmentalSurfaceResponse.join('; ')}`,
      `Surface reflections: ${physics.surfaceRealism.reflectionRules.join('; ') || 'no additional reflection constraints'}`,
      `Scene plausibility: status=${physics.plausibility.overallStatus}, score=${physics.plausibility.overallScore}/100; ${physics.plausibility.constraints.join('; ') || 'no additional constraints'}`,
      `Physical lived-in disorder: ${physics.disorderBehavior}`,
      physics.groupSelfie
        ? `Group selfie physics: ${physics.groupSelfie.physicsGuards.join('; ')}`
        : 'Group selfie physics: not enabled'
    ],
    lensEffects: state.captureType === 'front-selfie'
      ? `${XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE.depthOfField}; clean Xiaomi 15 Ultra front-camera optical response`
      : state.captureType === 'mirror-selfie'
        ? 'natural smartphone rear-camera optical response through a flat mirror, no synthetic portrait blur'
        : 'natural handheld smartphone-camera optical response with realistic depth and no synthetic portrait blur',
    atmosphericEffects: 'Clean atmospheric clarity without artificial CGI fog or unrealistic haze.',
    muscleFatigueEffects: 'Resting facial muscle tone with natural ocular clarity.',
    lightingIntensityDescription,
    shadowDepthDescription
  };

  if (microLoc?.spatialBehavior) derived.contactPhysics.push(microLoc.spatialBehavior);
  if (microLoc?.lightingHints) derived.environmentalLightBehavior += `; location-specific light cues: ${microLoc.lightingHints}`;

  const microPhysics = deriveMicroPhysics({
    familyId: state.sceneFamily || 'saudi-outdoor',
    subScene: state.subScene,
    pose: state.pose,
    captureType: state.captureType,
    timeOfDay: state.timeOfDay,
    lightingIntensity: state.lightingIntensity
  });

  derived.contactPhysics.push(
    `Structured pose affordance: ${microPhysics.poseSuggestion.promptAddon}`,
    ...microPhysics.contactPhysics
  );
  derived.fabricBehavior.push(...microPhysics.fabricTension);
  derived.realismConstraints.push(
    `Eye convergence: ${microPhysics.eyeConvergence}`,
    ...microPhysics.realismGuards
  );
  if (microPhysics.sensorArtifacts.length > 0) {
    derived.lensEffects += `; ${microPhysics.sensorArtifacts.join('; ')}`;
  }

  derived.realismConstraints.push(
    `Background visibility: ${physics.backgroundRealism.visibilityClass}; ${physics.backgroundRealism.depthLayers.join('; ')}`,
    `Background occlusion: ${physics.backgroundRealism.occlusionRules.join('; ')}`,
    `Background control decision: humans=${physics.backgroundRealism.humanDensity}, vehicles=${physics.backgroundRealism.vehicleDensity}, disorder=${physics.backgroundRealism.disorderLevel}, activity=${physics.backgroundRealism.activityLevel}, presence=${physics.backgroundRealism.presenceLevel}, composition=${physics.backgroundRealism.compositionGoal}. ${physics.backgroundRealism.realismGuards.join('; ')}`
  );

  if (state.lensCondition === 'smudged-lens') {
    derived.lensEffects += '; slight localized fingerprint haze causing restrained flare/bloom near strong practical lights and a small local loss of micro-contrast';
  }

  // Activity & sweat response
  if (state.sceneFamily === 'gym' && state.activity === 'بعد التمرين') {
    derived.skinResponse = 'subtle post-workout sweat sheen on temples and forehead, authentic exertion flush, realistic pore highlight roll-off';
    derived.hairCondition = 'slightly damp at hairline edges from physical workout, preserving baseline density';
  } else if (state.timeOfDay === 'midday' && (state.sceneFamily === 'saudi-outdoor' || state.sceneFamily === 'military-base')) {
    derived.skinResponse = 'subtle natural warmth and forehead sheen from daytime desert temperature, raw un-airbrushed skin texture';
  }

  // Clothing condition
  if (state.clothingCondition === 'worn-all-day') {
    derived.fabricBehavior.push('fabric shows organic wear creases at elbows and waist from hours of sitting', 'natural un-starched relaxed fold lines');
  } else if (state.clothingCondition === 'vintage-washed') {
    derived.fabricBehavior.push('soft washed-in matte textile texture', 'subtle seam fading and natural fabric softness');
  } else {
    derived.fabricBehavior.push('neatly pressed fabric with clean structured drape');
  }

  // Atmospheric conditions
  if (state.atmosphericCondition === 'high-humidity') {
    derived.atmosphericEffects = 'Coastal high humidity atmosphere: soft optical light diffusion, micro-moisture sheen on skin and hair tips.';
  } else if (state.atmosphericCondition === 'dusty-haze') {
    derived.atmosphericEffects = 'Airborne desert dust haze: warm earthy micro-particulate atmospheric depth, softened distant contrast.';
  } else if (state.atmosphericCondition === 'breezy') {
    derived.atmosphericEffects = 'Gentle natural breeze: subtle movement flutter on garment edges, loose hair strands naturally displaced.';
  }

  // Muscle Fatigue
  if (state.muscleFatigue === 'heavy-eyelids') {
    derived.muscleFatigueEffects = 'Eyelid fatigue: relaxed upper eyelids partially lowering over pupils, subtle under-eye soft tissue heaviness.';
  } else if (state.muscleFatigue === 'bloodshot-sclera') {
    derived.muscleFatigueEffects = 'Ocular fatigue: delicate realistic blood vessels in sclera whites from extended wakefulness.';
  } else if (state.muscleFatigue === 'pale-fatigued-skin') {
    derived.muscleFatigueEffects = 'Fatigue pallor: slightly reduced facial flush with subtle under-eye darkness and natural uneven tired skin tone, without cosmetic smoothing.';
    derived.skinResponse += ', subtle fatigue pallor and mild natural under-eye darkness';
  } else if (state.muscleFatigue === 'full-exhaustion') {
    derived.muscleFatigueEffects = 'Physical exhaustion: heavy drooping eyelids, subtle under-eye circles, and faint ocular vascularity.';
  }

  if (state.foregroundObstruction === 'through-glass') {
    derived.visibleBackgroundElements.unshift('subtle real glass surface artifacts in the foreground plane: faint reflection and restrained glare');
    derived.realismConstraints.push('foreground glass must obey reflection geometry and cannot float independently of a real pane');
  } else if (state.foregroundObstruction === 'foreground-clutter') {
    derived.visibleBackgroundElements.unshift('one restrained, partially cropped everyday foreground object at the frame edge');
  }

  if (state.realismStyle === 'anti-ai-raw') {
    derived.skinResponse += ', restrained pore detail, natural asymmetry, no beautification or plastic smoothing';
    derived.fabricBehavior.push('small irregular weave/fold variation appropriate to the selected garment');
    if (state.timeOfDay === 'night' || state.lightingIntensity <= 35) {
      derived.lensEffects += '; fine low-light luminance noise in darker tonal regions with restrained computational noise reduction';
    }
    derived.realismConstraints.push('no synthetic DSLR bokeh', 'no studio-light substitution', 'no invented camera hardware');
  }

  return derived;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. PROMPT VALIDATOR & CONTRADICTION PURIFIER (FINAL VALIDATION)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function validatePrompt(
  prompt: string,
  resolvedScene: ResolvedScene,
  negativePrompt: string = ''
): PromptValidationResult {
  const contradictions: string[] = [];
  const warnings: string[] = [];

  const state = resolvedScene.state;
  let cleanPrompt = prompt;
  let cleanNeg = negativePrompt;

  // 1. Glasses Positive vs Negative Contradiction
  if (state.glassesMode === 'wear_glasses') {
    // Only treat standalone eyewear items as prohibitions. Phrases such as
    // "missing glasses" or "no eyeglasses" are valid negative constraints
    // when the positive scene explicitly requires glasses.
    const forbidsGlasses = /(?:^|[.;,]\s*)(?:eyeglasses|spectacles|sunglasses|reading glasses|frames on face|tinted lenses)(?=\s*[,.;]|$)/i.test(cleanNeg);
    if (forbidsGlasses) {
      contradictions.push('Negative prompt prohibited glasses while scene explicitly requires wearing glasses.');
      cleanNeg = cleanNeg
        .replace(/(?:^|[.;,]\s*)(?:eyeglasses|spectacles|sunglasses|reading glasses|frames on face|tinted lenses)(?=\s*[,.;]|$)/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
  } else if (state.glassesMode === 'no_glasses') {
    if (/wearing black rectangular|wearing eyeglasses|wearing spectacles/i.test(cleanPrompt)) {
      contradictions.push('Positive prompt instructed wearing glasses while scene explicitly forbids glasses.');
      cleanPrompt = cleanPrompt.replace(/wearing black rectangular full-rim eyeglasses/gi, 'not wearing glasses');
    }
  }

  // 2. Day vs Night Verbal Contradictions in Positive Prompt
  if (state.timeOfDay === 'night') {
    if (/\b(midday sun|bright daylight|morning sunlight|afternoon sun|harsh sunlight)\b/i.test(cleanPrompt)) {
      contradictions.push('Daytime solar terms detected inside night scene prompt.');
      cleanPrompt = cleanPrompt
        .replace(/\bmidday sun\b/gi, 'night ambient illumination')
        .replace(/\bbright daylight\b/gi, 'nocturnal street lighting')
        .replace(/\bmorning sunlight\b/gi, 'night ambient light')
        .replace(/\bafternoon sun\b/gi, 'ambient street lighting')
        .replace(/\bharsh sunlight\b/gi, 'nocturnal ambient lighting');
    }
  }

  // 3. Front Selfie vs Floating Camera Contradiction
  if (state.captureType === 'front-selfie') {
    if (/holding phone up in front of face|camera floating in front/i.test(cleanPrompt)) {
      contradictions.push('Front selfie incorrectly described floating or face-obscuring phone.');
      cleanPrompt = cleanPrompt.replace(/holding phone up in front of face/gi, 'one arm extended holding recording smartphone off-camera');
    }
  }

  // 4. Xiaomi 15 Ultra camera-lock contamination check
  if (state.captureType === 'front-selfie') {
    const wrongFocalPattern = /(?:24\s*mm\s*[-–]\s*28\s*mm|24\s*[-–]\s*28\s*mm|\b(?:24|25|26|27|28)\s*mm\b)(?:\s*(?:eq|equivalent))?/gi;
    if (wrongFocalPattern.test(cleanPrompt)) {
      contradictions.push('Non-Xiaomi front-camera focal length detected in a Xiaomi 15 Ultra front-selfie prompt.');
      cleanPrompt = cleanPrompt.replace(wrongFocalPattern, 'approx 21mm equivalent');
    }
    if (/iPhone\s+front[- ]camera/gi.test(cleanPrompt)) {
      contradictions.push('iPhone front-camera wording detected in a Xiaomi 15 Ultra front-selfie prompt.');
      cleanPrompt = cleanPrompt.replace(/iPhone\s+front[- ]camera/gi, 'Xiaomi 15 Ultra front camera');
    }
  }

  // 5. Duplicate Phrase / Sentence Deduplication
  const lines = cleanPrompt.split('\n');
  const seenLines = new Set<string>();
  const dedupedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('[') || trimmed.endsWith(']')) {
      dedupedLines.push(line);
      continue;
    }
    if (seenLines.has(trimmed)) {
      continue;
    }
    seenLines.add(trimmed);
    dedupedLines.push(line);
  }
  cleanPrompt = dedupedLines.join('\n');

  return {
    isValid: contradictions.length === 0,
    cleanPrompt,
    cleanNegativePrompt: cleanNeg,
    contradictionsFound: contradictions,
    warnings
  };
}
