import { resolveScene, validateScene, ResolvedScene, ValidationResult } from './physicsEngine';

export type RealismChangeArea =
  | 'camera'
  | 'lighting'
  | 'background'
  | 'pose'
  | 'appearance'
  | 'scene';

export interface RealismRepairResult {
  finalResolved: ResolvedScene;
  validation: ValidationResult;
  changedFields: string[];
  changedAreas: RealismChangeArea[];
  summaryAR: string;
}

const AREA_LABELS: Record<RealismChangeArea, string> = {
  camera: 'الكاميرا',
  lighting: 'الإضاءة',
  background: 'الخلفية',
  pose: 'الوضعية',
  appearance: 'المظهر',
  scene: 'المشهد'
};

const AREA_KEYS: Record<RealismChangeArea, string[]> = {
  camera: [
    'captureType',
    'framing',
    'cameraAngle',
    'cameraAngleMode',
    'selfieAngleAdvice'
  ],
  lighting: [
    'timeOfDay',
    'lightingMode',
    'lightingIntensity',
    'shadowDepth'
  ],
  background: [
    'environmentRealism',
    'backgroundMode',
    'backgroundHumans',
    'backgroundVehicles',
    'backgroundDisorder',
    'backgroundActivity',
    'backgroundPresence',
    'backgroundCompositionGoal',
    'backgroundAutoAngle',
    'backgroundGeminiAdvice'
  ],
  pose: [
    'activity',
    'pose',
    'groupSelfieEnabled',
    'groupSelfieSize',
    'groupSelfieRelationship'
  ],
  appearance: [
    'glassesMode',
    'hairStyle',
    'expression',
    'outfitId',
    'outfitWearStyle',
    'garmentWearContext',
    'shirtTuck',
    'sleeveStyle',
    'shirtButtons',
    'collarStyle',
    'outerwearClosure',
    'hoodPosition',
    'thobeCollar'
  ],
  scene: ['sceneFamily', 'subScene']
};

const stableValue = (value: unknown) => {
  if (value === undefined) return '__undefined__';
  return JSON.stringify(value);
};

export function summarizeSceneChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Pick<RealismRepairResult, 'changedFields' | 'changedAreas' | 'summaryAR'> {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changedFields = [...keys].filter(
    key => stableValue(before[key]) !== stableValue(after[key])
  );

  const changedAreas = (Object.keys(AREA_KEYS) as RealismChangeArea[]).filter(area =>
    AREA_KEYS[area].some(key => changedFields.includes(key))
  );

  const summaryAR =
    changedAreas.length > 0
      ? `تم تعديل ${changedAreas.length} عناصر: ${changedAreas
          .map(area => AREA_LABELS[area])
          .join(' • ')}`
      : 'المشهد متناسق ولم يحتج إلى تعديل';

  return { changedFields, changedAreas, summaryAR };
}

export function analyzeAndRepairScene(
  rawState: Record<string, unknown>
): RealismRepairResult {
  const firstPass = resolveScene(rawState as any);
  const finalResolved = resolveScene(firstPass.state as any);
  const validation = validateScene(finalResolved);
  const changes = summarizeSceneChanges(
    rawState,
    finalResolved.state as unknown as Record<string, unknown>
  );

  return {
    finalResolved,
    validation,
    ...changes
  };
}
