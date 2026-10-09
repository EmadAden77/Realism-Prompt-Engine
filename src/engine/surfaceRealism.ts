import type { SceneFamilyId } from '../data/microLocations';
import type { LightingCausalityState } from './lightingCausality';

export type SurfaceRealismIssueSeverity = 'warning' | 'contradiction';

export interface SurfaceRealismIssue {
  severity: SurfaceRealismIssueSeverity;
  area: 'skin' | 'fabric' | 'glass' | 'paint' | 'environment';
  message: string;
}

export interface SurfaceRealismInput {
  familyId: SceneFamilyId;
  isOutdoor: boolean;
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
  captureType: 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
  glassesMode: 'wear_glasses' | 'no_glasses' | 'match_reference';
  clothingCondition: 'crisp' | 'worn-all-day' | 'vintage-washed';
  atmosphericCondition: 'neutral' | 'high-humidity' | 'dusty-haze' | 'breezy';
  lighting: LightingCausalityState;
}

export interface SurfaceRealismState {
  score: number;
  skinResponse: string;
  fabricResponse: string;
  environmentalSurfaceResponse: string[];
  reflectionRules: string[];
  consistencyGuards: string[];
  issues: SurfaceRealismIssue[];
}

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function deriveSurfaceRealism(input: SurfaceRealismInput): SurfaceRealismState {
  const issues: SurfaceRealismIssue[] = [];
  const environmentalSurfaceResponse: string[] = [];
  const reflectionRules: string[] = [];
  const consistencyGuards: string[] = [
    'surface texture must follow object geometry and local illumination rather than appearing as a flat procedural overlay',
    'specular highlights must align with the active light-source directions',
    'rough materials must produce broad weak highlights; smooth glass/paint may produce tighter stronger highlights',
    'contact regions must show local occlusion and pressure-darkening where physically expected'
  ];

  let score = 100;

  const phoneOnly = input.lighting.primarySource.name === 'smartphone display glow';
  const harshSun = input.lighting.primarySource.name.includes('midday sun');

  const thermalSkinResponse = input.isOutdoor && input.timeOfDay === 'midday'
    ? 'if sun exposure and heat are evident, retain localized skin flush and restrained natural perspiration without uniform redness; preserve personal complexion'
    : 'no mandatory heat flush or perspiration without evidence of heat exposure';
  consistencyGuards.push(thermalSkinResponse);

  const skinResponse = phoneOnly
    ? 'natural skin microtexture with pores and fine facial hair visible only on phone-facing planes; rapid highlight falloff across cheeks, ears, jaw and neck; no uniform beauty-light sheen'
    : harshSun
      ? 'natural skin microtexture with directional specular breakup on forehead, nose and cheekbone peaks, preserved pore contrast, restrained highlight clipping and non-uniform subsurface warmth'
      : 'natural human skin microtexture with non-uniform pores, fine vellus hair, subtle regional oiliness and physically local highlight response; no waxy smoothing or uniform synthetic shine';

  let fabricResponse: string;
  if (input.clothingCondition === 'worn-all-day') {
    fabricResponse = 'fabric shows mild compression creases, softened folds, small tension changes around joints and contact points, with roughness-dependent highlights rather than glossy synthetic shading';
  } else if (input.clothingCondition === 'vintage-washed') {
    fabricResponse = 'washed fabric shows restrained fiber fuzz, softened dye contrast, edge wear and irregular fold shading that follows garment tension and gravity';
  } else {
    fabricResponse = 'clean fabric preserves believable weave/fiber response, gravity-driven folds, seam tension and contact compression without sterile CG-perfect smoothness';
  }

  if (input.atmosphericCondition === 'high-humidity') {
    environmentalSurfaceResponse.push(
      'humidity slightly softens distant contrast and may add restrained moisture sheen only on plausible exposed surfaces'
    );
  } else if (input.atmosphericCondition === 'dusty-haze') {
    environmentalSurfaceResponse.push(
      'fine dust reduces distant contrast and lightly dulls exposed matte surfaces without coating skin, glass and fabric uniformly'
    );
  } else {
    environmentalSurfaceResponse.push(
      'ordinary material contrast is preserved with no artificial global haze or universal gloss layer'
    );
  }

  if (input.familyId === 'car') {
    environmentalSurfaceResponse.push(
      'vehicle paint uses curved-body specular flow; trim remains materially distinct; glass reflections stay weaker than direct mirror reflections and respect glazing angle'
    );
    reflectionRules.push(
      'automotive glass reflections must follow the window plane and visible exterior light sources; no floating highlights or duplicated scenery'
    );
  }

  if (input.captureType === 'mirror-selfie') {
    reflectionRules.push(
      'mirror reflection remains planar and perspective-consistent; reflected phone, hand and body must share one coherent reflected camera geometry'
    );
  }

  if (input.glassesMode === 'wear_glasses') {
    reflectionRules.push(
      'eyeglass reflections remain asymmetrical and partial, following lens curvature and real source direction without hiding both pupils'
    );
  }

  if (phoneOnly) {
    environmentalSurfaceResponse.push(
      'background materials remain mostly dark because the near-field phone display cannot evenly illuminate room-scale surfaces'
    );
    if (input.lighting.secondarySources.length > 0) {
      issues.push({
        severity: 'contradiction',
        area: 'environment',
        message: 'phone-screen-only lighting must not create active secondary emitters'
      });
      score -= 24;
    }
  }

  if (input.isOutdoor && input.timeOfDay === 'night' && input.lighting.primarySource.name.includes('window daylight')) {
    issues.push({
      severity: 'contradiction',
      area: 'environment',
      message: 'night outdoor scene cannot use window daylight as the primary source'
    });
    score -= 30;
  }

  if (input.familyId === 'car' && reflectionRules.length === 0) {
    issues.push({
      severity: 'warning',
      area: 'glass',
      message: 'vehicle scenes should carry explicit glass/paint reflection constraints'
    });
    score -= 8;
  }

  return {
    score: clampScore(score),
    skinResponse,
    fabricResponse,
    environmentalSurfaceResponse,
    reflectionRules,
    consistencyGuards,
    issues
  };
}
