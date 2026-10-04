// ============================================================================
// PhysFrame Physics Engine & Consistency Validator
// FIXED XIAOMI 15 ULTRA SELFIE PHYSICS + SCENE-AWARE BACKGROUND ENGINE
// Pure deterministic physical scene resolver, validator, and prompt compiler.
// ============================================================================

import { MICRO_LOCATIONS, getMicroLocation, MicroLocation, SceneFamilyId } from '../data/microLocations';
import { OUTFITS, OutfitItem } from '../data/clothingOutfits';

// --- TYPES ---
export type CaptureType = 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
export type Framing = 'head-shoulders' | 'chest-up' | 'half-body';
export type CameraAngle = 'eye-level' | 'slightly-high' | 'slightly-low' | 'slightly-off-center';
export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
export type RealismStyle = 'anti-ai-raw' | 'photorealistic' | 'candid-snap';
export type GlassesMode = 'wear_glasses' | 'no_glasses' | 'match_reference';
export type LensCondition = 'modern-iphone' | 'budget-android' | 'smudged-lens';
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
  hairStyle: string;
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
  if (s.lightingMode === 'إضاءة شاشة الهاتف فقط') {
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
    // Indoor rooms with closed windows do not have wind
    issues.push({
      type: 'warning',
      field: 'atmosphericCondition',
      description: 'Wind breeze requested in fully enclosed interior room without open windows.',
      autoResolvedBy: 'Subdued to neutral still interior air with gentle split AC airflow.'
    });
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

  const validationResult: ValidationResult = {
    isValid: postValidation.isValid,
    issues,
    autoResolved: issues.length > 0
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
  if (state.lightingMode === 'إضاءة شاشة الهاتف فقط' && isDay) {
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

  // --- 1. Camera Distance, Arm Reach & Optics ---
  let cameraDistance = 'approx 52cm';
  let distanceCm = 52;
  let armReach = '';
  let fieldOfView = '';
  let opticalPerspective = '';

  if (state.captureType === 'front-selfie') {
    // FIXED XIAOMI 15 ULTRA FRONT CAMERA OPTICS (21mm eq, ~90° FOV)
    if (framingClass === 'tight') {
      distanceCm = 42;
      cameraDistance = 'approx 40-42cm (close handheld reach)';
      armReach = 'dominant arm flexed at elbow (~65° flexion) holding smartphone near chin-to-eye height off-camera (phone NOT in frame)';
    } else if (framingClass === 'medium') {
      distanceCm = 52;
      cameraDistance = 'approx 50-54cm (comfortable arm reach)';
      armReach = 'dominant arm extended at ~40° elbow flexion with subtle natural shoulder elevation, smartphone held off-camera';
    } else {
      distanceCm = 68;
      cameraDistance = 'approx 65-70cm (maximum functional arm reach)';
      armReach = 'dominant arm extended near full reach (~70cm) with subtle upper torso tilt compensating for wide framing, smartphone held off-camera';
    }

    fieldOfView = XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE.fieldOfView;
    opticalPerspective = XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE.getPerspectiveDescription(distanceCm, framingClass);
  } else if (state.captureType === 'mirror-selfie') {
    distanceCm = 85;
    cameraDistance = 'approx 80-95cm (camera-to-mirror-to-subject optical plane)';
    armReach = 'dominant hand visibly holding smartphone at mid-chest or upper-abdomen level aimed steadily at mirror surface';
    fieldOfView = 'standard smartphone main rear lens perspective (~24mm eq, ~68° horizontal FOV)';
    opticalPerspective = 'rear camera optics through flat mirror: true reflective geometry, smartphone visibly grasped in hand partially occluding fingers in reflection';
  } else {
    // third-person-candid
    distanceCm = 240;
    cameraDistance = 'approx 2.2m - 2.8m (third-person bystander eye-level distance)';
    armReach = 'both hands free, natural unextended arm posture at sides or in pockets (no selfie arm mechanics)';
    fieldOfView = 'natural human perspective observer lens (~32mm equivalent, ~56° horizontal FOV)';
    opticalPerspective = 'candid observer perspective: balanced architectural proportions, natural depth compression without wide-angle arm distortion';
  }

  // --- 2. Camera Angles (Yaw, Pitch, Height, Direction) ---
  let cameraPosition = 'eye-level (+0cm vertical offset)';
  let cameraPitch = '0° pitch (frontal orthogonal)';
  let cameraYaw = '0° yaw';
  let cameraDirection = 'facing subject face frontally';

  if (state.cameraAngle === 'slightly-high') {
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

  if (state.pose.includes('مستند') || state.cameraAngle === 'slightly-off-center') {
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

  // Scene-aware Saudi Daily Life Background Elements (Section 8, 9)
  // MANDATORY RESTRAINT RULE (Section 19): Visibility determines inclusion!
  const baseBg = microLoc ? [...microLoc.backgroundElements] : [];
  let visibleEnvironment = '';

  if (framingClass === 'tight') {
    // TIGHT: Face/head dominate. Only immediate near-field surface behind head!
    if (familyId === 'car' && !isOutdoor) {
      visibleEnvironment = 'vehicle headrest and patterned fabric backrest immediately behind head';
    } else if (familyId === 'military-base') {
      visibleEnvironment = 'plain beige interior wall with acoustic suspended ceiling border immediately behind subject';
    } else if (familyId === 'saudi-outdoor') {
      visibleEnvironment = 'textured cream-finish villa boundary wall immediately behind subject';
    } else {
      visibleEnvironment = baseBg[0] || 'neutral wall surface immediately behind head';
    }
  } else if (framingClass === 'medium') {
    // MEDIUM: Head and upper chest. 1-2 relevant background surfaces.
    if (familyId === 'car' && !isOutdoor) {
      visibleEnvironment = 'car interior bucket seat, side window showing faint outdoor daylight, and portion of passenger headrest';
    } else if (familyId === 'military-base') {
      visibleEnvironment = 'office wall with mounted split AC indoor unit, corner of laminate bookcase, and acoustic ceiling tiles';
    } else if (familyId === 'saudi-outdoor') {
      visibleEnvironment = 'cream-painted villa boundary wall, residential metal gate section, and edge of asphalt roadway';
    } else {
      visibleEnvironment = baseBg.slice(0, 2).join(', ');
    }
  } else {
    // WIDE: Expansive depth.
    if (familyId === 'car' && !isOutdoor) {
      visibleEnvironment = 'interior cabin with bucket seat, steering wheel rim, instrument console, and side window showing realistic parking lot';
    } else if (familyId === 'military-base') {
      visibleEnvironment = 'functional administrative office with wooden laminate desk, desktop PC monitor edge, wire conduits, and official correspondence folder';
    } else if (familyId === 'saudi-outdoor') {
      visibleEnvironment = 'ordinary Saudi residential street with asphalt roadway, concrete curbs, textured villa boundary walls, metal vehicle gate, and wall-mounted electrical utility box';
    } else {
      visibleEnvironment = baseBg.slice(0, 3).join(', ');
    }
  }

  // --- 6. Activity Density & Contextual Secondary People & Vehicles (Section 10, 11) ---
  const activityDensity = deriveActivityDensity(familyId, state.subScene, state.timeOfDay, framingClass);
  const visiblePeople: string[] = [];
  const visibleVehicles: string[] = [];
  let motionBehavior = 'static resting scene, zero abrupt motion blur';

  if (framingClass !== 'tight') {
    // Vehicles in outdoor/parking scenes
    if (isOutdoor || (familyId === 'car' && state.subScene.includes('خارج'))) {
      if (activityDensity === 'minimal' || activityDensity === 'light' || activityDensity === 'moderate') {
        visibleVehicles.push('an ordinary modern family SUV parked along the curb in the midground');
      }
      if (activityDensity === 'moderate') {
        visibleVehicles.push('a common white sedan slowly moving in the far traffic lane');
        motionBehavior = 'subtle vehicular motion in distant background lane';
      }
    }

    // Secondary background humans (subtle, secondary to subject)
    if (activityDensity === 'light' || activityDensity === 'moderate') {
      if (familyId === 'saudi-outdoor') {
        visiblePeople.push('one distant pedestrian in ordinary casual attire walking along the sidewalk in far background');
        motionBehavior = 'subtle distant pedestrian walking pace in background';
      } else if (familyId === 'military-base' && state.subScene.includes('ممر')) {
        visiblePeople.push('an administrative colleague walking past the corridor intersection in the far background');
      } else if (familyId === 'gym') {
        visiblePeople.push('one other gym member resting on a bench press in the secondary midground');
      }
    }
  }

  // --- 7. Mild Everyday Disorder (Section 12: Lived-in, NOT messy) ---
  let disorderBehavior = '';
  if (familyId === 'military-base') {
    disorderBehavior = 'subtle administrative daily-use markers: neatly arranged stack of papers, desktop PC mouse and USB cable, subtle wall scuff near door jamb';
  } else if (familyId === 'car') {
    disorderBehavior = 'subtle daily vehicle markers: phone charging cable plugged into console port, faint speck of road dust on dashboard texture, slight hand reflection on steering wheel leather';
  } else if (familyId === 'saudi-outdoor') {
    disorderBehavior = 'ordinary street reality: faint dusty tire marks on asphalt, small hairline expansion seam on concrete curb, minor sun fading on gate latch';
  } else {
    disorderBehavior = 'natural human lived-in markers: authentic garment wear creases at elbow folds, resting fabric drape without artificial digital perfection';
  }

  // --- 8. Physical Lighting Causality (Section 16) ---
  const lightSources: string[] = [];
  let shadowBehavior = '';
  let exposureBehavior = '';

  const isMidday = state.timeOfDay === 'midday';
  const isHighContrast = state.lightingIntensity > 75 || state.shadowDepth > 70;

  if (isNight) {
    if (state.lightingMode === 'إضاءة شاشة الهاتف فقط') {
      lightSources.push('solely mobile screen OLED/LCD panel glow at ~40cm distance (primary point emission)');
      shadowBehavior = 'radial cast shadows projecting backward and outward away from phone screen, deep falloff into darkness';
    } else if (isOutdoor) {
      lightSources.push('overhead municipal warm LED streetlamp casting downward pool of light', 'faint residential gate entrance lantern spill');
      shadowBehavior = 'downward cast shadows with soft penumbra under chin and nose, natural street illumination';
    } else if (familyId === 'car') {
      lightSources.push('subtle dashboard instrument cluster and infotainment screen backlight', 'exterior streetlamp ambient spill through tinted side window');
      shadowBehavior = 'gentle upward-directed instrument glow with soft ambient side shadows';
    } else {
      lightSources.push('interior domestic fixture / warm night lamp emitting diffuse ambient light');
      shadowBehavior = 'soft diffuse interior shadows with gentle penumbra edges';
    }
    exposureBehavior = XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE.getExposureBehavior(true, false, isHighContrast);
  } else {
    // Daytime
    if (isOutdoor) {
      if (isMidday) {
        lightSources.push('direct high-angle Saudi sunlight', 'diffuse pale beige/cream wall radiosity bounce', 'asphalt ground fill reflection');
        shadowBehavior = 'harsh short vertical cast shadows tightly hugging underside of nose, jawline, and collar';
      } else {
        lightSources.push('directional low-angle morning/afternoon sunlight', 'warm environmental bounce light from ground and nearby walls');
        shadowBehavior = 'elongated directional cast shadows projecting sideways with warm soft penumbra';
      }
    } else if (familyId === 'car') {
      lightSources.push('natural exterior daylight filtering through vehicle windshield and side glass', 'diffuse cabin interior bounce');
      shadowBehavior = 'natural side-window directional light with soft ambient fill from passenger seat';
    } else {
      // Indoor office / room
      lightSources.push('overhead recessed ceiling fluorescent/LED troffer panels', 'indirect exterior daylight from nearby window');
      shadowBehavior = 'downward diffuse office shadows with realistic socket and chin occlusion';
    }
    exposureBehavior = XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE.getExposureBehavior(false, isMidday, isHighContrast);
  }

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

  return {
    cameraPosition,
    cameraDistance,
    cameraDirection,
    cameraPitch,
    cameraYaw,
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
    disorderBehavior
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
    skinResponse: 'natural human skin texture with microscopic visible pores, authentic subtle imperfections, natural melanin variance, no plastic airbrushing',
    hairCondition: 'natural human hair density, preserving authentic hairline without synthetic thickening',
    fabricBehavior: [],
    shadowBehavior: `${physics.shadowBehavior}, calibrated to ${depth}% shadow hardness (${shadowDepthDescription})`,
    environmentalLightBehavior: `ambient light sources: ${physics.lightSources.join('; ')}, calibrated to ${intensity}% ambient intensity`,
    cameraDistance: physics.cameraDistance,
    visibleBackgroundElements: [physics.visibleEnvironment, ...physics.visibleVehicles, ...physics.visiblePeople],
    contactPhysics: [physics.armReach, ...physics.occlusions],
    reflectionRules: physics.reflectionState,
    realismConstraints: [
      `Camera optics: ${physics.fieldOfView}`,
      `Camera perspective: ${physics.opticalPerspective}`,
      `Camera position: ${physics.cameraPosition}, ${physics.cameraPitch}, ${physics.cameraYaw}`,
      `Visible anatomical region: ${physics.visibleBodyRegion}`,
      `Background depth plane: ${physics.backgroundDepth}`,
      `Sensor exposure: ${physics.exposureBehavior}`,
      `Physical lived-in disorder: ${physics.disorderBehavior}`
    ],
    lensEffects: XIAOMI_15_ULTRA_FRONT_CAMERA_PROFILE.depthOfField,
    atmosphericEffects: 'Clean atmospheric clarity without artificial CGI fog or unrealistic haze.',
    muscleFatigueEffects: 'Resting facial muscle tone with natural ocular clarity.',
    lightingIntensityDescription,
    shadowDepthDescription
  };

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
  } else if (state.muscleFatigue === 'full-exhaustion') {
    derived.muscleFatigueEffects = 'Physical exhaustion: heavy drooping eyelids, subtle under-eye circles, and faint ocular vascularity.';
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
    if (/eyeglasses|spectacles|glasses|frames on face/i.test(cleanNeg)) {
      contradictions.push('Negative prompt prohibited glasses while scene explicitly requires wearing glasses.');
      cleanNeg = cleanNeg
        .replace(/eyeglasses,?\s*/gi, '')
        .replace(/spectacles,?\s*/gi, '')
        .replace(/sunglasses,?\s*/gi, '')
        .replace(/reading glasses,?\s*/gi, '')
        .replace(/frames on face,?\s*/gi, '')
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

  // 4. Duplicate Phrase / Sentence Deduplication
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
