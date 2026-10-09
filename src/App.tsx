import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  ScanFace,
  Wand2,
  ShieldCheck,
  Check,
  Copy,
  RotateCcw,
  Upload,
  Trash2,
  Film,
  Bookmark,
  ChevronDown,
  AlertCircle,
  X,
  RefreshCw,
  Glasses,
  Sun,
  Layers,
  CheckCircle2,
  ArrowRight,
  Zap,
  Sliders,
  Maximize2,
  Eye,
  Droplets,
  Wind,
  CloudSun,
  Dices,
  Shuffle,
  Activity,
  Moon
} from 'lucide-react';
import { MICRO_LOCATIONS, getMicroLocation, MicroLocation } from './data/microLocations';
import { OUTFITS, OutfitItem } from './data/clothingOutfits';
import { resolveScene } from './engine/physicsEngine';
import {
  HAIRSTYLES,
  EXPRESSIONS,
} from './engine/semanticSceneCompiler';
import {
  compileUnifiedPromptPipeline,
  validateExternalPromptCandidate,
} from './engine/unifiedPromptPipeline';
import type { UnifiedConflictReport } from './engine/conflictValidator';
import { analyzeAndRepairScene } from './engine/realismIntelligence';
import {
  BackgroundMode,
  BackgroundControlDensity,
  BackgroundDisorderControl,
  BackgroundActivityControl,
  BackgroundPresenceControl,
  BackgroundCompositionGoal,
  BackgroundGeminiAdvice
} from './engine/backgroundRealism';
import { getEligibleSelfieAngles, SelfieAngleAdvice, SelfieAngleMode } from './engine/selfieAngles';
import {
  getActivityOptions,
  getOutfitCapabilities,
  getPoseOptions,
  getSceneRecommendations,
  OutfitWearStyle,
  GarmentWearContext,
  ShirtTuck,
  SleeveStyle,
  ShirtButtons,
  CollarStyle,
  OuterwearClosure,
  HoodPosition,
  ThobeCollar
} from './engine/activityAttire';
import {
  resolveGroupSelfie,
  GroupSelfieSize,
  GroupSelfieRelationship
} from './engine/groupSelfie';
import { HAIR_PHYSICS_PRESETS } from './data/hairPhysicsLibrary';
import {
  HOME_BACKGROUND_CLOTHING_OPTIONS,
  HOME_BACKGROUND_MODE_LABELS,
  isHomeBackgroundScene,
  resolveHomeBackgroundPersonKinds,
  type HomeBackgroundClothing,
  type HomeBackgroundPeopleMode,
} from './engine/homeBackgroundPeople';
import { HOME_SECTION_LABEL_AR } from './engine/homeYard';

// --- TYPES ---
type CaptureType = 'front-selfie' | 'mirror-selfie' | 'third-person-candid';
type Framing = 'head-shoulders' | 'chest-up' | 'half-body';
type CameraAngle = 'eye-level' | 'slightly-high' | 'slightly-low' | 'slightly-off-center';
type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';
type RealismStyle = 'raw-candid' | 'cinematic-realism' | 'anti-ai-raw';
type SceneFamilyId = 'bedroom' | 'living-room' | 'saudi-outdoor' | 'gym' | 'car' | 'military-base';

// Appearance & Accessory Types
export type GlassesMode = 'match_reference' | 'wear_glasses' | 'no_glasses';

// Imperfection Types
type LensCondition = 'xiaomi-clean' | 'smudged-lens';
type ClothingCondition = 'crisp' | 'worn-all-day' | 'vintage-washed';
type AtmosphericCondition = 'neutral' | 'high-humidity' | 'dusty-haze' | 'breezy';
type ForegroundObstruction = 'clean' | 'through-glass' | 'foreground-clutter';
type MuscleFatigue = 'none' | 'heavy-eyelids' | 'bloodshot-sclera' | 'pale-fatigued-skin' | 'full-exhaustion';

interface SceneState {
  referenceImageId: string | null;
  sceneFamily: SceneFamilyId | null;
  subScene: string;
  activity: string;
  captureType: CaptureType;
  framing: Framing;
  cameraAngle: CameraAngle;
  pose: string;
  outfitId: string;
  outfitWearStyle: OutfitWearStyle;
  garmentWearContext: GarmentWearContext;
  shirtTuck: ShirtTuck;
  sleeveStyle: SleeveStyle;
  shirtButtons: ShirtButtons;
  collarStyle: CollarStyle;
  outerwearClosure: OuterwearClosure;
  hoodPosition: HoodPosition;
  thobeCollar: ThobeCollar;
  hairStyle: string;
  hairPhysicsPreset: string;
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

  // Fixed scene-aware background controls
  backgroundMode: BackgroundMode;
  backgroundHumans: BackgroundControlDensity;
  backgroundVehicles: BackgroundControlDensity;
  backgroundDisorder: BackgroundDisorderControl;
  backgroundActivity: BackgroundActivityControl;
  backgroundPresence: BackgroundPresenceControl;
  backgroundCompositionGoal: BackgroundCompositionGoal;
  backgroundAutoAngle: boolean;
  backgroundGeminiAssist: boolean;
  backgroundGeminiAdvice?: BackgroundGeminiAdvice;

  // Smart optional people controls for private home scenes.
  homeBackgroundPeopleMode: HomeBackgroundPeopleMode;
  homeBackgroundCount: number;
  homeBackgroundClothing: HomeBackgroundClothing[];

  // Smart Xiaomi selfie camera director
  cameraAngleMode: SelfieAngleMode;
  selfieAngleAdvice?: SelfieAngleAdvice;

  // Dynamic scene-aware group selfie
  groupSelfieEnabled: boolean;
  groupSelfieSize: GroupSelfieSize;
  groupSelfieRelationship: GroupSelfieRelationship;
}

interface SavedPreset {
  id: string;
  name: string;
  state: SceneState;
}

interface FaceAnalysisResult {
  identityLockPrompt: string;
  arabicSummary: string;
  glassesDetected: boolean;
  glassesDescription?: string;
  hairDescription: string;
  facialHairDescription: string;
  recommendedHairId?: string;
  recommendedExpressionId?: string;
  antiAiTips: string[];
}

interface RealismAuditResult {
  realismScore: number;
  verdictAR: string;
  strengthsAR: string[];
  risksAR: string[];
  recommendationsAR: string[];
  localScore?: number;
  geminiScore?: number;
  scoreMode?: 'local' | 'composite';
}

interface DirectedSceneResult {
  sceneFamily: SceneFamilyId;
  subScene: string;
  activity: string;
  pose: string;
  captureType: CaptureType;
  framing: Framing;
  cameraAngle: CameraAngle;
  outfitId: string;
  hairStyle: string;
  expression: string;
  timeOfDay: TimeOfDay;
  lightingMode: string;
  environmentRealism: string;
  lensCondition: LensCondition;
  clothingCondition: ClothingCondition;
  atmosphericCondition: AtmosphericCondition;
  foregroundObstruction: ForegroundObstruction;
  realismStyle: RealismStyle;
  lightingIntensity?: number;
  shadowDepth?: number;
  glassesMode?: GlassesMode;
  storyAR: string;
  directorNoteAR: string;
}

// --- STORAGE HELPERS (INDEXED DB FOR IMAGES) ---
const DB_NAME = 'PhysFrameDB';
const STORE_NAME = 'images';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      if (!e.target.result.objectStoreNames.contains(STORE_NAME)) {
        e.target.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveImageToDB = async (blob: Blob) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, 'reference');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const loadImageFromDB = async (): Promise<Blob | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get('reference');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error reading indexedDB', err);
    return null;
  }
};

const deleteImageFromDB = async () => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete('reference');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// --- DATA DICTIONARIES ---

const SCENE_FAMILIES: Record<SceneFamilyId, {
  labelAR: string;
  subScenes: string[];
  activities: string[];
  poses: string[];
  allowedLighting: string[];
  environmentRealism: string[];
}> = {
  'military-base': {
    labelAR: 'مبنى عمل عسكري',
    subScenes: MICRO_LOCATIONS['military-base'].map(m => m.labelAR),
    activities: getActivityOptions('military-base' as SceneFamilyId).map(item => item.labelAR),
    poses: getPoseOptions('military-base' as SceneFamilyId),
    allowedLighting: ['إضاءة مكتب فلورسنت', 'ضوء نهاري من النافذة', 'إضاءة ممرات متوازية', 'شمس الظهر'],
    environmentRealism: ['رسمية ومنظمة', 'نشطة (عمل يومي)']
  },
  'saudi-outdoor': {
    labelAR: 'أماكن سعودية',
    subScenes: MICRO_LOCATIONS['saudi-outdoor'].map(m => m.labelAR),
    activities: getActivityOptions('saudi-outdoor' as SceneFamilyId).map(item => item.labelAR),
    poses: getPoseOptions('saudi-outdoor' as SceneFamilyId),
    allowedLighting: ['ضوء نهاري طبيعي', 'شمس الظهر', 'ساعة ذهبية (شروق/غروب)', 'إنارة شارع دافئة', 'إنارة نيون تجارية متناثرة'],
    environmentRealism: ['هادئ', 'طبيعي', 'نشط']
  },
  'car': {
    labelAR: 'السيارة',
    subScenes: MICRO_LOCATIONS['car'].map(m => m.labelAR),
    activities: getActivityOptions('car' as SceneFamilyId).map(item => item.labelAR),
    poses: getPoseOptions('car' as SceneFamilyId),
    allowedLighting: ['ضوء نهاري طبيعي', 'شمس الظهر', 'إضاءة داخل السيارة', 'إضاءة الشارع عبر زجاج السيارة', 'إضاءة شاشة الهاتف فقط'],
    environmentRealism: ['مرتبة', 'طبيعية', 'مستخدمة يوميًا']
  },
  'living-room': {
    labelAR: HOME_SECTION_LABEL_AR,
    subScenes: MICRO_LOCATIONS['living-room'].map(m => m.labelAR),
    activities: getActivityOptions('living-room' as SceneFamilyId).map(item => item.labelAR),
    poses: getPoseOptions('living-room' as SceneFamilyId),
    allowedLighting: ['ضوء نهاري طبيعي', 'إضاءة سقف دافئة 3000K', 'إضاءة سقف محايدة 4000K', 'إضاءة سقف أبيض 5000K', 'إضاءة سقف باردة 6500K', 'فلاش الشاشة الأمامية فقط', 'إضاءة سقف أبيض 5000K + فلاش الشاشة الأمامية', 'إنارة ليلية مختلطة'],
    environmentRealism: ['مرتبة', 'طبيعية', 'مستخدمة يوميًا']
  },
  'bedroom': {
    labelAR: 'غرفة نوم',
    subScenes: MICRO_LOCATIONS['bedroom'].map(m => m.labelAR),
    activities: getActivityOptions('bedroom' as SceneFamilyId).map(item => item.labelAR),
    poses: getPoseOptions('bedroom' as SceneFamilyId),
    allowedLighting: ['ضوء نهاري طبيعي', 'إضاءة سقف دافئة 3000K', 'إضاءة سقف محايدة 4000K', 'إضاءة سقف أبيض 5000K', 'إضاءة سقف باردة 6500K', 'فلاش الشاشة الأمامية فقط', 'إضاءة سقف أبيض 5000K + فلاش الشاشة الأمامية', 'إضاءة أباجورة دافئة'],
    environmentRealism: ['مرتبة', 'طبيعية', 'مستخدمة يوميًا']
  },
  'gym': {
    labelAR: 'نادي رياضي',
    subScenes: MICRO_LOCATIONS['gym'].map(m => m.labelAR),
    activities: getActivityOptions('gym' as SceneFamilyId).map(item => item.labelAR),
    poses: getPoseOptions('gym' as SceneFamilyId),
    allowedLighting: ['إضاءة النادي الرياضي', 'ضوء نهاري طبيعي'],
    environmentRealism: ['هادئ', 'طبيعي', 'نشط']
  }
};

// --- RULES ENGINE & RESOLVERS ---

const resolveConflicts = (state: SceneState): SceneState => {
  if (!state.sceneFamily || !SCENE_FAMILIES[state.sceneFamily]) return state;
  // Execute pure deterministic physical scene resolution pipeline
  const resolved = resolveScene(state as any);
  return resolved.state as SceneState;
};

const calculatePhysicalConsistencyScore = (
  conflicts: UnifiedConflictReport,
  scenePlausibilityScore?: number
): number => {
  // This is a pre-generation consistency score, not proof that a rendered image is "100% real".
  // Start below 100 to preserve uncertainty that can only be assessed after rendering.
  let score = 96;

  score -= conflicts.errors.length * 28;
  score -= conflicts.corrections.length * 8;
  score -= conflicts.warnings.length * 4;

  // Conservative rule: local consistency can never score higher than the
  // deterministic Scene Plausibility Engine for the same resolved scene.
  if (typeof scenePlausibilityScore === 'number' && Number.isFinite(scenePlausibilityScore)) {
    score = Math.min(score, Math.max(0, Math.min(100, scenePlausibilityScore)));
  }

  return Math.max(0, Math.min(96, Math.round(score)));
};

const combineRealismScores = (localScore: number, geminiScore?: number): number => {
  if (typeof geminiScore !== 'number' || !Number.isFinite(geminiScore)) return localScore;
  const boundedGemini = Math.max(0, Math.min(100, geminiScore));
  // Deterministic physics remains authoritative; Gemini adds qualitative visual-risk judgment.
  return Math.max(0, Math.min(99, Math.round(localScore * 0.60 + boundedGemini * 0.40)));
};

const buildBackgroundReasoningKey = (state: SceneState): string => JSON.stringify({
  sceneFamily: state.sceneFamily,
  subScene: state.subScene,
  activity: state.activity,
  pose: state.pose,
  timeOfDay: state.timeOfDay,
  captureType: state.captureType,
  framing: state.framing,
  cameraAngle: state.cameraAngle,
  cameraAngleMode: state.cameraAngleMode,
  selfieAngleId: state.selfieAngleAdvice?.angleId,
  lightingMode: state.lightingMode,
  backgroundMode: state.backgroundMode,
  backgroundHumans: state.backgroundHumans,
  backgroundVehicles: state.backgroundVehicles,
  backgroundDisorder: state.backgroundDisorder,
  backgroundActivity: state.backgroundActivity,
  backgroundPresence: state.backgroundPresence,
  backgroundCompositionGoal: state.backgroundCompositionGoal,
  backgroundAutoAngle: state.backgroundAutoAngle,
  groupSelfie: state.groupSelfieEnabled
    ? { size: state.groupSelfieSize, relationship: state.groupSelfieRelationship }
    : 'off'
});

const buildSelfieAngleReasoningKey = (state: SceneState): string => JSON.stringify({
  sceneFamily: state.sceneFamily,
  subScene: state.subScene,
  activity: state.activity,
  pose: state.pose,
  captureType: state.captureType,
  framing: state.framing,
  timeOfDay: state.timeOfDay,
  lightingMode: state.lightingMode,
  groupSelfie: state.groupSelfieEnabled
    ? { size: state.groupSelfieSize, relationship: state.groupSelfieRelationship }
    : 'off',
  backgroundAngleLink: state.backgroundAutoAngle
    ? {
        mode: state.backgroundMode,
        humans: state.backgroundHumans,
        vehicles: state.backgroundVehicles,
        disorder: state.backgroundDisorder,
        activity: state.backgroundActivity,
        presence: state.backgroundPresence,
        compositionGoal: state.backgroundCompositionGoal
      }
    : 'disabled'
});

const buildEligibleSelfieAngleCatalog = (state: SceneState) => {
  const eligible = getEligibleSelfieAngles({
    captureType: state.captureType,
    sceneFamily: state.sceneFamily,
    subScene: state.subScene,
    pose: state.pose,
    activity: state.activity,
    framing: state.framing,
    manualAngle: state.cameraAngle,
    timeOfDay: state.timeOfDay,
    lightingMode: state.lightingMode,
    backgroundAutoAngle: state.backgroundAutoAngle,
    backgroundMode: state.backgroundMode,
    backgroundHumans: state.backgroundHumans,
    backgroundVehicles: state.backgroundVehicles,
    backgroundDisorder: state.backgroundDisorder,
    backgroundActivity: state.backgroundActivity,
    backgroundPresence: state.backgroundPresence,
    backgroundCompositionGoal: state.backgroundCompositionGoal,
    groupSelfieEnabled: state.groupSelfieEnabled,
    groupSelfieSize: state.groupSelfieSize,
    mode: 'gemini-smart'
  });

  return eligible.map(angle => ({
    id: angle.id,
    labelAR: angle.labelAR,
    family: angle.family,
    pitchDeg: angle.pitchDeg,
    yawDeg: angle.yawDeg,
    rollDeg: angle.rollDeg,
    heightOffsetCm: angle.heightOffsetCm,
    distanceCm: angle.distanceCm,
    risk: angle.risk,
    intent: angle.intent,
    carFocus: angle.carFocus ?? 'balanced',
    carSeat: angle.carSeat ?? null,
    phonePlacement: angle.phonePlacement ?? null,
    cabinGuards: angle.cabinGuards ?? [],
    allowedMicroVariation: angle.variation
  }));
};

const BACKGROUND_DENSITY_LABELS: Record<string, string> = {
  none: 'بدون',
  sparse: 'قليل',
  light: 'خفيف',
  moderate: 'متوسط',
  auto: 'تلقائي'
};

const BACKGROUND_DISORDER_LABELS: Record<string, string> = {
  none: 'بدون',
  'very-clean': 'نظيف جدًا',
  light: 'طبيعي/خفيف',
  moderate: 'مستخدم/متوسط',
  auto: 'تلقائي'
};

const BACKGROUND_ACTIVITY_LABELS: Record<string, string> = {
  calm: 'هادئ',
  natural: 'طبيعي',
  active: 'نشط',
  auto: 'تلقائي'
};

const BACKGROUND_PRESENCE_LABELS: Record<string, string> = {
  low: 'ضعيف',
  balanced: 'متوازن',
  visible: 'واضح',
  strong: 'قوي',
  auto: 'تلقائي'
};

const BACKGROUND_GOAL_LABELS: Record<string, string> = {
  'face-priority': 'أولوية الوجه',
  balanced: 'متوازن',
  'background-priority': 'إظهار الخلفية',
  auto: 'تلقائي'
};

// --- DEFAULT STATE ---
const DEFAULT_STATE: SceneState = {
  referenceImageId: '1000236308.png',
  sceneFamily: null,
  subScene: '',
  activity: '',
  captureType: 'front-selfie',
  framing: 'chest-up',
  cameraAngle: 'eye-level',
  pose: '',
  outfitId: 'mil_admin_tan_shirt',
  outfitWearStyle: 'natural-neat',
  garmentWearContext: 'auto',
  shirtTuck: 'auto',
  sleeveStyle: 'auto',
  shirtButtons: 'auto',
  collarStyle: 'auto',
  outerwearClosure: 'auto',
  hoodPosition: 'auto',
  thobeCollar: 'auto',
  hairStyle: 'h2',
  hairPhysicsPreset: 'hp_auto',
  expression: 'e1',
  timeOfDay: 'midday',
  lightingMode: '',
  environmentRealism: 'رسمية ومنظمة',
  realismStyle: 'anti-ai-raw',
  lensCondition: 'xiaomi-clean',
  clothingCondition: 'crisp',
  atmosphericCondition: 'neutral',
  foregroundObstruction: 'clean',
  muscleFatigue: 'none',
  glassesMode: 'match_reference',
  lightingIntensity: 70,
  shadowDepth: 60,
  backgroundMode: 'auto',
  backgroundHumans: 'auto',
  backgroundVehicles: 'auto',
  backgroundDisorder: 'auto',
  backgroundActivity: 'auto',
  backgroundPresence: 'auto',
  backgroundCompositionGoal: 'auto',
  backgroundAutoAngle: true,
  backgroundGeminiAssist: true,
  homeBackgroundPeopleMode: 'none',
  homeBackgroundCount: 0,
  homeBackgroundClothing: [],
  cameraAngleMode: 'gemini-smart',
  groupSelfieEnabled: false,
  groupSelfieSize: 2,
  groupSelfieRelationship: 'auto'
};

export default function PhysFrameApp() {
  const [state, setState] = useState<SceneState>(DEFAULT_STATE);
  const [showPromptSheet, setShowPromptSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'chatgpt' | 'gemini' | 'negative'>('chatgpt');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasReference, setHasReference] = useState<boolean>(false);
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [showPresetsSheet, setShowPresetsSheet] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini Intelligence States
  const [isAnalyzingFace, setIsAnalyzingFace] = useState(false);
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysisResult | null>(null);
  const [showFaceAnalysisModal, setShowFaceAnalysisModal] = useState(false);

  const [showDirectorModal, setShowDirectorModal] = useState(false);
  const [directorVibeInput, setDirectorVibeInput] = useState('');
  const [isDirectingScene, setIsDirectingScene] = useState(false);
  const [directedScene, setDirectedScene] = useState<DirectedSceneResult | null>(null);

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<RealismAuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [autoFixStatus, setAutoFixStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [autoFixMessage, setAutoFixMessage] = useState<string | null>(null);

  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [enhancedPrompts, setEnhancedPrompts] = useState<{ chatgpt?: string; gemini?: string }>({});
  const [useEnhancedPrompt, setUseEnhancedPrompt] = useState(false);

  const [isBackgroundReasoning, setIsBackgroundReasoning] = useState(false);
  const [backgroundReasoningError, setBackgroundReasoningError] = useState<string | null>(null);
  const backgroundReasoningCacheRef = useRef<Map<string, BackgroundGeminiAdvice>>(new Map());

  const [isSelfieAngleReasoning, setIsSelfieAngleReasoning] = useState(false);
  const [selfieAngleReasoningError, setSelfieAngleReasoningError] = useState<string | null>(null);
  const selfieAngleReasoningCacheRef = useRef<Map<string, SelfieAngleAdvice>>(new Map());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateBackgroundControls = (patch: Partial<SceneState>) => {
    setState(prev => ({
      ...prev,
      ...patch,
      backgroundGeminiAdvice: undefined,
      ...(prev.backgroundAutoAngle
        ? {
            cameraAngleMode: 'gemini-smart' as SelfieAngleMode,
            selfieAngleAdvice: undefined
          }
        : {})
    }));
  };

  const updateGroupSelfieControls = (patch: Partial<SceneState>) => {
    setState(prev => {
      const next: SceneState = {
        ...prev,
        ...patch,
        captureType: patch.groupSelfieEnabled === false
          ? prev.captureType
          : (patch.groupSelfieEnabled === true || prev.groupSelfieEnabled)
            ? 'front-selfie'
            : prev.captureType,
        cameraAngleMode: (patch.groupSelfieEnabled === true || prev.groupSelfieEnabled)
          ? 'gemini-smart'
          : prev.cameraAngleMode,
        selfieAngleAdvice: undefined,
        backgroundGeminiAdvice: undefined
      };
      return next.sceneFamily ? resolveConflicts(next) : next;
    });
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const savedState = localStorage.getItem('physframe_current_state');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed.lensCondition === 'modern-iphone' || parsed.lensCondition === 'budget-android') {
            parsed.lensCondition = 'xiaomi-clean';
          }
          const validOutfit = OUTFITS.find(o => o.id === parsed.outfitId);
          if (!validOutfit) {
            parsed.outfitId = DEFAULT_STATE.outfitId;
          }
          setState({ ...DEFAULT_STATE, ...parsed });
        }

        const savedPresets = localStorage.getItem('physframe_presets');
        if (savedPresets) setPresets(JSON.parse(savedPresets));

        const savedAnalysis = localStorage.getItem('physframe_face_analysis');
        if (savedAnalysis) setFaceAnalysis(JSON.parse(savedAnalysis));

        const blob = await loadImageFromDB();
        if (blob) {
          setImageUrl(URL.createObjectURL(blob));
          setHasReference(true);
        }
      } catch (e) {
        console.error('Failed to load local data', e);
      }
      setIsLoaded(true);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('physframe_current_state', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const activeFamily = state.sceneFamily ? SCENE_FAMILIES[state.sceneFamily] : null;
  const selectedOutfit = OUTFITS.find(o => o.id === state.outfitId);
  const outfitCapabilities = getOutfitCapabilities(selectedOutfit);
  const activityOptions = state.sceneFamily ? getActivityOptions(state.sceneFamily, state.subScene) : [];
  const poseOptions = state.sceneFamily ? getPoseOptions(state.sceneFamily, state.subScene) : [];
  const sceneRecommendations = state.sceneFamily
    ? getSceneRecommendations(state.sceneFamily, state.subScene)
    : { activities: [], poses: [] };
  const recommendedActivitySet = new Set(sceneRecommendations.activities);
  const recommendedPoseSet = new Set(sceneRecommendations.poses);
  const militarySubSceneGroups = state.sceneFamily === 'military-base'
    ? ['المكاتب', 'الممرات', 'الأبواب والمداخل', 'الانتظار والاجتماعات', 'الاستراحة والخدمات', 'الدرج', 'خارج المبنى', 'المواقف']
        .map(groupAR => ({
          groupAR,
          locations: MICRO_LOCATIONS['military-base'].filter(location => location.groupAR === groupAR)
        }))
        .filter(group => group.locations.length > 0)
    : [];
  const backgroundReasoningKey = buildBackgroundReasoningKey(state);
  const selfieAngleReasoningKey = buildSelfieAngleReasoningKey(state);
  const currentResolvedPreview = state.sceneFamily ? resolveScene(state as any) : null;
  const backgroundDecision = currentResolvedPreview?.physicalState.backgroundRealism ?? null;
  const selfieAngleDecision = currentResolvedPreview?.physicalState.selfieAngle ?? null;
  const currentMicroLocation = state.sceneFamily ? getMicroLocation(state.sceneFamily, state.subScene) : undefined;
  const groupSelfiePreview = state.sceneFamily
    ? resolveGroupSelfie({
        enabled: state.groupSelfieEnabled,
        requestedSize: state.groupSelfieSize,
        relationship: state.groupSelfieRelationship,
        familyId: state.sceneFamily,
        subScene: state.subScene,
        framing: state.framing,
        microLoc: currentMicroLocation
      })
    : null;

  useEffect(() => {
    if (state.sceneFamily) {
      const resolved = resolveConflicts(state);
      if (JSON.stringify(resolved) !== JSON.stringify(state)) {
         setState(resolved);
      }
    }
  }, [state.sceneFamily, state.subScene, state.lightingMode, state.timeOfDay, state.captureType, state.activity, state.foregroundObstruction, state.groupSelfieEnabled, state.groupSelfieSize, state.framing]);

  useEffect(() => {
    if (
      !state.sceneFamily ||
      state.captureType !== 'front-selfie' ||
      state.cameraAngleMode !== 'gemini-smart'
    ) {
      setIsSelfieAngleReasoning(false);
      setSelfieAngleReasoningError(null);
      return;
    }

    const key = selfieAngleReasoningKey;

    if (state.selfieAngleAdvice?.cacheKey && state.selfieAngleAdvice.cacheKey !== key) {
      setState(prev => ({ ...prev, selfieAngleAdvice: undefined }));
      return;
    }

    if (state.selfieAngleAdvice?.cacheKey === key) return;

    const cached = selfieAngleReasoningCacheRef.current.get(key);
    if (cached) {
      setState(prev => ({ ...prev, selfieAngleAdvice: cached }));
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsSelfieAngleReasoning(true);
        setSelfieAngleReasoningError(null);

        const eligibleAngles = buildEligibleSelfieAngleCatalog(state);
        if (!eligibleAngles.length) {
          throw new Error('لا توجد زاوية سيلفي متوافقة مع الفيزياء الحالية.');
        }

        const res = await fetch('/api/ai/selfie-angle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            sceneState: state,
            eligibleAngles
          })
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.error || `Gemini selfie angle HTTP ${res.status}`);
        }

        const data = await res.json();
        const advice: SelfieAngleAdvice = {
          angleId: String(data.angleId || ''),
          pitchOffsetDeg: Number(data.pitchOffsetDeg) || 0,
          yawOffsetDeg: Number(data.yawOffsetDeg) || 0,
          rollOffsetDeg: Number(data.rollOffsetDeg) || 0,
          distanceOffsetCm: Number(data.distanceOffsetCm) || 0,
          carFocus: ['face-priority', 'cabin-context', 'balanced'].includes(data.carFocus)
            ? data.carFocus
            : undefined,
          reasonAR: Array.isArray(data.reasonAR) ? data.reasonAR.slice(0, 2) : [],
          confidence: Number(data.confidence) || 0,
          cacheKey: key
        };

        selfieAngleReasoningCacheRef.current.set(key, advice);
        setState(prev => (
          buildSelfieAngleReasoningKey(prev) === key
            ? { ...prev, selfieAngleAdvice: advice }
            : prev
        ));
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Gemini selfie angle reasoning failed:', err);
          setSelfieAngleReasoningError(err?.message || 'تعذر اختيار زاوية Gemini');
        }
      } finally {
        if (!controller.signal.aborted) setIsSelfieAngleReasoning(false);
      }
    }, 700);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    selfieAngleReasoningKey,
    state.cameraAngleMode,
    state.captureType,
    state.sceneFamily,
    state.backgroundAutoAngle
  ]);


  useEffect(() => {
    if (!state.sceneFamily || !state.backgroundGeminiAssist || state.backgroundMode === 'off') {
      setIsBackgroundReasoning(false);
      setBackgroundReasoningError(null);
      return;
    }

    const key = backgroundReasoningKey;

    // Never apply advice from a previous scene/configuration.
    if (state.backgroundGeminiAdvice?.cacheKey && state.backgroundGeminiAdvice.cacheKey !== key) {
      setState(prev => ({ ...prev, backgroundGeminiAdvice: undefined }));
      return;
    }

    if (state.backgroundGeminiAdvice?.cacheKey === key) return;

    const cached = backgroundReasoningCacheRef.current.get(key);
    if (cached) {
      setState(prev => ({ ...prev, backgroundGeminiAdvice: cached }));
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsBackgroundReasoning(true);
        setBackgroundReasoningError(null);

        const localState = {
          ...state,
          backgroundGeminiAssist: false,
          backgroundGeminiAdvice: undefined
        };
        const localDecision = resolveScene(localState as any).physicalState.backgroundRealism;

        const res = await fetch('/api/ai/background-reasoning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            sceneState: state,
            localLimits: {
              visibilityClass: localDecision.visibilityClass,
              humanDensity: localDecision.humanDensity,
              vehicleDensity: localDecision.vehicleDensity,
              disorderLevel: localDecision.disorderLevel,
              activityLevel: localDecision.activityLevel,
              presenceLevel: localDecision.presenceLevel,
              compositionGoal: localDecision.compositionGoal,
              fovAllowsBackgroundLife: localDecision.fovAllowsBackgroundLife,
              decisionReasons: localDecision.decisionReasons
            }
          })
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.error || `Gemini background reasoning HTTP ${res.status}`);
        }

        const data = await res.json();
        const advice: BackgroundGeminiAdvice = {
          humanDensity: data.humanDensity,
          vehicleDensity: data.vehicleDensity,
          disorderLevel: data.disorderLevel,
          reasonAR: Array.isArray(data.reasonAR) ? data.reasonAR.slice(0, 2) : [],
          confidence: Number(data.confidence) || 0,
          cacheKey: key
        };

        backgroundReasoningCacheRef.current.set(key, advice);
        setState(prev => (
          buildBackgroundReasoningKey(prev) === key
            ? { ...prev, backgroundGeminiAdvice: advice }
            : prev
        ));
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Background Gemini reasoning failed:', err);
          setBackgroundReasoningError(err?.message || 'تعذر تحليل الخلفية بواسطة Gemini');
        }
      } finally {
        if (!controller.signal.aborted) setIsBackgroundReasoning(false);
      }
    }, 850);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [backgroundReasoningKey, state.backgroundGeminiAssist, state.backgroundMode, state.sceneFamily]);

  const handleSceneSelect = (familyId: SceneFamilyId) => {
    const family = SCENE_FAMILIES[familyId];
    setState({
      ...state,
      sceneFamily: familyId,
      subScene: family.subScenes[0],
      activity: getActivityOptions(familyId, family.subScenes[0])[0]?.labelAR || family.activities[0],
      pose: getPoseOptions(familyId, family.subScenes[0])[0] || family.poses[0],
      lightingMode: family.allowedLighting[0],
      environmentRealism: family.environmentRealism[0],
      outfitId: state.outfitId || 'thobe_white_summer'
    });
  };

  const applyCuratedVibe = (vibeType: 'random' | 'military-duty' | 'afternoon-cafe' | 'gym-break' | 'car-waiting' | 'home-lounge' | 'desert-winter') => {
    let targetState: SceneState;

    if (vibeType === 'military-duty') {
      targetState = {
        ...state,
        sceneFamily: 'military-base',
        subScene: 'مكتب إداري عسكري',
        activity: 'عمل مكتبي',
        pose: 'جالس خلف المكتب',
        outfitId: 'mil_admin_tan_shirt', // قميص عسكري إداري مكتبي
        expression: 'e6', // حازم ورسمي وقور
        hairStyle: 'h2',
        timeOfDay: 'midday',
        lightingMode: 'إضاءة مكتب فلورسنت',
        environmentRealism: 'رسمية ومنظمة',
        captureType: 'third-person-candid',
        framing: 'chest-up',
        cameraAngle: 'eye-level',
        lensCondition: 'xiaomi-clean',
        clothingCondition: 'crisp',
        atmosphericCondition: 'neutral',
        foregroundObstruction: 'clean',
        realismStyle: 'anti-ai-raw',
        muscleFatigue: 'heavy-eyelids',
        lightingIntensity: 65,
        shadowDepth: 75
      };
      setState(resolveConflicts(targetState));
      showToast('🪖 تم تطبيق سيناريو: مناوبة مسائية بالقطاع العسكري');
      return;
    }

    if (vibeType === 'afternoon-cafe') {
      targetState = {
        ...state,
        sceneFamily: 'saudi-outdoor',
        subScene: 'أمام مقهى',
        activity: 'جالس في المقهى',
        pose: 'جالس على كرسي',
        outfitId: 'thobe_white_summer',
        expression: 'e4', // ابتسامة عفوية نصف مفتوحة
        hairStyle: 'h1',
        timeOfDay: 'afternoon',
        lightingMode: 'ساعة ذهبية (شروق/غروب)',
        environmentRealism: 'طبيعي',
        captureType: 'front-selfie',
        framing: 'chest-up',
        cameraAngle: 'slightly-high',
        lensCondition: 'xiaomi-clean',
        clothingCondition: 'worn-all-day',
        atmosphericCondition: 'dusty-haze',
        foregroundObstruction: 'clean',
        realismStyle: 'anti-ai-raw',
        muscleFatigue: 'none',
        lightingIntensity: 85,
        shadowDepth: 50
      };
      setState(resolveConflicts(targetState));
      showToast('☕ تم تطبيق سيناريو: قهوة العصر بالرياض');
      return;
    }

    if (vibeType === 'gym-break') {
      targetState = {
        ...state,
        sceneFamily: 'gym',
        subScene: 'بجانب الأثقال',
        activity: 'يستريح بين الجولات',
        pose: 'جالس على مقعد التمرين',
        outfitId: 'gym_black_tee_grey_shorts',
        expression: 'e11', // متحفز بعد التمرين
        hairStyle: 'h5', // بعد التمرين مبلل
        timeOfDay: 'night',
        lightingMode: 'إضاءة النادي الرياضي',
        environmentRealism: 'نشط',
        captureType: 'mirror-selfie',
        framing: 'half-body',
        cameraAngle: 'eye-level',
        lensCondition: 'smudged-lens',
        clothingCondition: 'worn-all-day',
        atmosphericCondition: 'high-humidity',
        foregroundObstruction: 'clean',
        realismStyle: 'anti-ai-raw',
        muscleFatigue: 'pale-fatigued-skin',
        lightingIntensity: 75,
        shadowDepth: 65
      };
      setState(resolveConflicts(targetState));
      showToast('🏋️‍♂️ تم تطبيق سيناريو: استراحة تمرين النادي');
      return;
    }

    if (vibeType === 'car-waiting') {
      targetState = {
        ...state,
        sceneFamily: 'car',
        subScene: 'داخل السيارة',
        activity: 'خلف المقود والسيارة متوقفة',
        pose: 'جالس باسترخاء في المقعد',
        outfitId: 'out_black_hoodie_cargos', // هودي أوفرسايز أسود
        expression: 'e9', // متأمل وسارح
        hairStyle: 'h4',
        timeOfDay: 'night',
        lightingMode: 'إضاءة شاشة الهاتف فقط',
        environmentRealism: 'طبيعية',
        captureType: 'front-selfie',
        framing: 'chest-up',
        cameraAngle: 'eye-level',
        lensCondition: 'xiaomi-clean',
        clothingCondition: 'worn-all-day',
        atmosphericCondition: 'neutral',
        foregroundObstruction: 'through-glass',
        realismStyle: 'anti-ai-raw',
        muscleFatigue: 'bloodshot-sclera',
        lightingIntensity: 35,
        shadowDepth: 85
      };
      setState(resolveConflicts(targetState));
      showToast('🚗 تم تطبيق سيناريو: انتظار مسائي داخل السيارة');
      return;
    }

    if (vibeType === 'home-lounge') {
      targetState = {
        ...state,
        sceneFamily: 'living-room',
        subScene: 'بجانب النافذة',
        activity: 'يشرب قهوة',
        pose: 'مسترخٍ على الكنبة',
        outfitId: 'home_cozy_knit_joggers', // كنزة صوفية مريحة
        expression: 'e16', // ابتسامة رضا وتنهيدة ارتياح
        hairStyle: 'h4',
        timeOfDay: 'morning',
        lightingMode: 'ضوء نهاري طبيعي',
        environmentRealism: 'طبيعية',
        captureType: 'third-person-candid',
        framing: 'chest-up',
        cameraAngle: 'eye-level',
        lensCondition: 'xiaomi-clean',
        clothingCondition: 'worn-all-day',
        atmosphericCondition: 'breezy',
        foregroundObstruction: 'clean',
        realismStyle: 'anti-ai-raw',
        muscleFatigue: 'none',
        lightingIntensity: 60,
        shadowDepth: 40
      };
      setState(resolveConflicts(targetState));
      showToast('🏠 تم تطبيق سيناريو: استكنان منزلي هادئ');
      return;
    }

    if (vibeType === 'desert-winter') {
      targetState = {
        ...state,
        sceneFamily: 'saudi-outdoor',
        subScene: 'شارع فلل سكني',
        activity: 'واقف بشكل طبيعي',
        pose: 'واقف بثبات',
        outfitId: 'thobe_winter_farwa', // ثوب زيتي مع فروة شمالية
        expression: 'e27', // استنشاق هواء نقي
        hairStyle: 'h1',
        timeOfDay: 'sunset',
        lightingMode: 'ساعة ذهبية (شروق/غروب)',
        environmentRealism: 'هادئ',
        captureType: 'third-person-candid',
        framing: 'half-body',
        cameraAngle: 'slightly-low',
        lensCondition: 'xiaomi-clean',
        clothingCondition: 'crisp',
        atmosphericCondition: 'breezy',
        foregroundObstruction: 'clean',
        realismStyle: 'anti-ai-raw',
        muscleFatigue: 'none',
        lightingIntensity: 80,
        shadowDepth: 55
      };
      setState(resolveConflicts(targetState));
      showToast('🏜️ تم تطبيق سيناريو: كشتة ونسيم شتوي');
      return;
    }

    // Default: Smart Coherent Randomizer (روليت فيزيائي متناسق)
    const families = Object.keys(SCENE_FAMILIES) as SceneFamilyId[];
    const randomFamilyId = families[Math.floor(Math.random() * families.length)];
    const family = SCENE_FAMILIES[randomFamilyId];
    const availableOutfits = OUTFITS;

    const coherentExpressionByFamily: Record<SceneFamilyId, string[]> = {
      'military-base': ['e6', 'e5', 'e1', 'e20', 'e26', 'e8'],
      'gym': ['e11', 'e5', 'e7', 'e1', 'e22'],
      'car': ['e9', 'e1', 'e12', 'e10', 'e7'],
      'saudi-outdoor': ['e2', 'e3', 'e4', 'e7', 'e9', 'e14', 'e27', 'e28'],
      'living-room': ['e1', 'e2', 'e3', 'e9', 'e16', 'e23'],
      'bedroom': ['e1', 'e2', 'e8', 'e9', 'e16', 'e18', 'e24']
    };

    const expList = coherentExpressionByFamily[randomFamilyId] || ['e1', 'e2', 'e3'];
    const chosenExp = expList[Math.floor(Math.random() * expList.length)];

    const lensOpts: LensCondition[] = ['xiaomi-clean', 'xiaomi-clean', 'xiaomi-clean', 'xiaomi-clean', 'smudged-lens'];
    const randLens = lensOpts[Math.floor(Math.random() * lensOpts.length)] as LensCondition;

    const clothingOpts = ['crisp', 'worn-all-day', 'worn-all-day', 'vintage-washed'];
    const randClothing = clothingOpts[Math.floor(Math.random() * clothingOpts.length)] as ClothingCondition;

    const atmosphericOpts: AtmosphericCondition[] = randomFamilyId === 'gym' 
      ? ['high-humidity', 'neutral'] 
      : randomFamilyId === 'saudi-outdoor'
      ? ['neutral', 'dusty-haze', 'breezy']
      : ['neutral', 'neutral', 'breezy'];
    const randAtmospheric = atmosphericOpts[Math.floor(Math.random() * atmosphericOpts.length)];

    const chosenTime = ['morning', 'midday', 'afternoon', 'sunset', 'night'][Math.floor(Math.random() * 5)] as TimeOfDay;

    const captureOptions: CaptureType[] = (['bedroom', 'gym', 'living-room'].includes(randomFamilyId))
      ? ['front-selfie', 'mirror-selfie', 'third-person-candid']
      : ['front-selfie', 'third-person-candid'];
    const chosenCapture = captureOptions[Math.floor(Math.random() * captureOptions.length)];

    const randomSubScene = family.subScenes[Math.floor(Math.random() * family.subScenes.length)];
    const randomActivityOptions = getActivityOptions(randomFamilyId, randomSubScene);
    const randomPoseOptions = getPoseOptions(randomFamilyId, randomSubScene);

    let rawState: SceneState = {
      ...state,
      sceneFamily: randomFamilyId,
      subScene: randomSubScene,
      activity: randomActivityOptions[Math.floor(Math.random() * randomActivityOptions.length)]?.labelAR || family.activities[0],
      pose: randomPoseOptions[Math.floor(Math.random() * randomPoseOptions.length)] || family.poses[0],
      lightingMode: family.allowedLighting[Math.floor(Math.random() * family.allowedLighting.length)],
      environmentRealism: family.environmentRealism[Math.floor(Math.random() * family.environmentRealism.length)],
      outfitId: availableOutfits[Math.floor(Math.random() * availableOutfits.length)]?.id || availableOutfits[0]?.id || 'thobe_white_summer',
      timeOfDay: chosenTime,
      captureType: chosenCapture,
      expression: chosenExp,
      hairStyle: randomFamilyId === 'gym' ? 'h5' : ['h1', 'h2', 'h3', 'h4'][Math.floor(Math.random() * 4)],
      lensCondition: randLens,
      clothingCondition: randClothing,
      atmosphericCondition: randAtmospheric,
      foregroundObstruction: (randomFamilyId === 'car' && Math.random() > 0.5) ? 'through-glass' : 'clean',
      muscleFatigue: (['none', 'none', 'heavy-eyelids', 'bloodshot-sclera', 'pale-fatigued-skin'] as MuscleFatigue[])[Math.floor(Math.random() * 5)],
      glassesMode: (['match_reference', 'wear_glasses', 'no_glasses'] as GlassesMode[])[Math.floor(Math.random() * 3)],
      realismStyle: 'anti-ai-raw',
      lightingIntensity: Math.floor(Math.random() * 14) * 5 + 30,
      shadowDepth: Math.floor(Math.random() * 14) * 5 + 30
    };

    const resolvedState = resolveConflicts(rawState);
    setState(resolvedState);
    showToast(`🎲 تم تكوين سيناريو فيزيائي متناسق: ${family.labelAR}`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await saveImageToDB(file);
      if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
      const newUrl = URL.createObjectURL(file);
      setImageUrl(newUrl);
      setHasReference(true);
      showToast('تم حفظ الصورة المرجعية بنجاح');

      // Auto trigger AI analysis for convenience
      analyzeFaceFromBlob(file);
    }
  };

  const handleImageDelete = async () => {
    await deleteImageFromDB();
    if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setHasReference(false);
    setFaceAnalysis(null);
    localStorage.removeItem('physframe_face_analysis');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('تم حذف الصورة المرجعية');
  };

  // Keep the original reference untouched in IndexedDB, but send Gemini a bounded
  // analysis copy so Base64 inflation cannot exceed Vercel request limits.
  const prepareImageForGemini = async (blob: Blob): Promise<Blob> => {
    const MAX_ANALYSIS_BYTES = 1_800_000;
    const MAX_ANALYSIS_DIMENSION = 1600;

    if (
      blob.size <= MAX_ANALYSIS_BYTES &&
      ['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)
    ) {
      return blob;
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('تعذر قراءة الصورة المرجعية لضغطها قبل إرسالها إلى Gemini'));
      };
      img.src = objectUrl;
    });

    const scale = Math.min(
      1,
      MAX_ANALYSIS_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('تعذر تجهيز نسخة التحليل للصورة');

    ctx.drawImage(image, 0, 0, width, height);

    const encodeJpeg = (quality: number) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          output => output ? resolve(output) : reject(new Error('تعذر ضغط الصورة للتحليل')),
          'image/jpeg',
          quality
        );
      });

    let output = await encodeJpeg(0.86);
    for (const quality of [0.78, 0.70, 0.62]) {
      if (output.size <= MAX_ANALYSIS_BYTES) break;
      output = await encodeJpeg(quality);
    }

    return output;
  };

  // Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Gemini Intelligence: Analyze Face
  const analyzeFaceFromBlob = async (blob: Blob) => {
    try {
      setIsAnalyzingFace(true);
      const analysisBlob = await prepareImageForGemini(blob);
      const base64Data = await blobToBase64(analysisBlob);

      const res = await fetch('/api/ai/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: analysisBlob.type || 'image/jpeg',
        }),
      });

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error('الصورة كبيرة جدًا للإرسال. تم تجهيز ضغط تلقائي، أعد المحاولة مرة واحدة.');
        }
        const errorPayload = await res.json().catch(() => null);
        throw new Error(errorPayload?.error || `فشل فحص الصورة بواسطة الذكاء الاصطناعي (HTTP ${res.status})`);
      }

      const data: FaceAnalysisResult = await res.json();
      setFaceAnalysis(data);
      localStorage.setItem('physframe_face_analysis', JSON.stringify(data));
      setShowFaceAnalysisModal(true);

      // Auto update recommendation if appropriate
      if (data.recommendedHairId) {
        setState(prev => ({ ...prev, hairStyle: data.recommendedHairId || prev.hairStyle }));
      }
      showToast('تم فحص ملامح الهوية بنجاح بواسطة Gemini');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'حدث خطأ أثناء فحص الصورة');
    } finally {
      setIsAnalyzingFace(false);
    }
  };

  const triggerFaceAnalysis = async () => {
    const blob = await loadImageFromDB();
    if (!blob) {
      showToast('يرجى رفع صورة مرجعية أولاً');
      return;
    }
    analyzeFaceFromBlob(blob);
  };

  // Gemini Intelligence: Scene Director
  const handleDirectScene = async () => {
    try {
      setIsDirectingScene(true);
      const res = await fetch('/api/ai/direct-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userVibe: directorVibeInput,
          currentFamily: state.sceneFamily || undefined,
          referenceDescription: faceAnalysis?.arabicSummary,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'تعذر تشغيل النموذج، جاري التوليد المحلي...');
      }
      const data: DirectedSceneResult = await res.json();
      setDirectedScene(data);
    } catch (err: any) {
      console.warn('Direct scene error, falling back locally:', err);
      // Fallback locally to generate a smart directed scene tailored to the user's vibe
      let chosenFamily: SceneFamilyId = state.sceneFamily || 'saudi-outdoor';
      if (directorVibeInput) {
        if (/عسكر|مكتب|دوام/.test(directorVibeInput)) chosenFamily = 'military-base';
        else if (/سيار/.test(directorVibeInput)) chosenFamily = 'car';
        else if (/نوم|سرير/.test(directorVibeInput)) chosenFamily = 'bedroom';
        else if (/صال|جلس|كنب/.test(directorVibeInput)) chosenFamily = 'living-room';
        else if (/نادي|جيم|تمرين/.test(directorVibeInput)) chosenFamily = 'gym';
      }
      const fam = SCENE_FAMILIES[chosenFamily] || SCENE_FAMILIES['saudi-outdoor'];
      const fallbackData: DirectedSceneResult = {
        sceneFamily: chosenFamily,
        subScene: fam.subScenes[0],
        activity: fam.activities[0],
        pose: fam.poses[0],
        captureType: 'front-selfie',
        framing: 'chest-up',
        cameraAngle: 'eye-level',
        outfitId: OUTFITS.find(o => o.category.includes(chosenFamily))?.id || 'thobe_white_summer',
        hairStyle: 'h2',
        expression: 'e1',
        timeOfDay: 'midday',
        lightingMode: fam.allowedLighting[0],
        environmentRealism: fam.environmentRealism[0],
        lensCondition: 'xiaomi-clean',
        clothingCondition: 'worn-all-day',
        atmosphericCondition: 'neutral',
        foregroundObstruction: 'clean',
        realismStyle: 'anti-ai-raw',
        storyAR: `لقطة عفوية في ${fam.labelAR} توثق تفاصيل يومية حقيقية غير مصطنعة مستوحاة من فكرتك.`,
        directorNoteAR: 'تم تنسيق زاوية الكاميرا وتجاعيد الملابس الطبيعية لمنع أي مظهر رقمي اصطناعي.'
      };
      setDirectedScene(fallbackData);
      showToast('تم ابتكار سيناريو واقعي متناسق بنجاح');
    } finally {
      setIsDirectingScene(false);
    }
  };

  const applyDirectedScene = () => {
    if (!directedScene) return;
    const resolved = resolveConflicts({
      ...state,
      sceneFamily: directedScene.sceneFamily,
      subScene: directedScene.subScene,
      activity: directedScene.activity,
      pose: directedScene.pose,
      captureType: directedScene.captureType,
      framing: directedScene.framing,
      cameraAngle: directedScene.cameraAngle,
      outfitId: directedScene.outfitId,
      hairStyle: directedScene.hairStyle,
      expression: directedScene.expression,
      timeOfDay: directedScene.timeOfDay,
      lightingMode: directedScene.lightingMode,
      environmentRealism: directedScene.environmentRealism,
      lensCondition: directedScene.lensCondition,
      clothingCondition: directedScene.clothingCondition,
      atmosphericCondition: directedScene.atmosphericCondition,
      foregroundObstruction: directedScene.foregroundObstruction,
      realismStyle: directedScene.realismStyle,
      lightingIntensity: typeof directedScene.lightingIntensity === 'number' ? directedScene.lightingIntensity : state.lightingIntensity,
      shadowDepth: typeof directedScene.shadowDepth === 'number' ? directedScene.shadowDepth : state.shadowDepth,
      glassesMode: directedScene.glassesMode || state.glassesMode || 'match_reference',
    });
    setState(resolved);
    setShowDirectorModal(false);
    showToast('تم تطبيق السيناريو المبتكر بالكامل');
  };

  // Gemini Intelligence: Audit Realism
  // Local physics result is committed first so the modal can never become blank.
  // Gemini is an optional qualitative layer on top of the deterministic score.
  const handleAuditRealism = async () => {
    setIsAuditing(true);
    setShowAuditModal(true);
    setAuditError(null);
    setAuditResult(null);

    try {
      // Pure deterministic physical pipeline:
      // SceneState -> Physical Scene Resolver -> Physics Validator -> Consistency Validator -> Prompt Builder -> Final Validation
      const auditPipeline = compileUnifiedPromptPipeline(state as any);
      const resolved = auditPipeline.manifest.resolved;
      const conflictReport = auditPipeline.diagnostics.conflictReport;
      const prompt = auditPipeline.platforms.gemini.prompt;
      const conflictMessages = conflictReport.results.map(item => item.message);
      const physicalConsistencyScore = calculatePhysicalConsistencyScore(
        conflictReport,
        resolved.physicalState.plausibility.overallScore
      );

      // Always show a deterministic local result immediately.
      const localAudit: RealismAuditResult = {
        realismScore: physicalConsistencyScore,
        localScore: physicalConsistencyScore,
        scoreMode: 'local',
        verdictAR: physicalConsistencyScore >= 90
          ? 'اتساق فيزيائي محلي ممتاز'
          : physicalConsistencyScore >= 75
            ? 'اتساق فيزيائي جيد مع ملاحظات'
            : 'توجد تناقضات فيزيائية تحتاج تصحيح',
        strengthsAR: [
          'تم فحص هندسة الكاميرا والمسافة ومجال الرؤية محليًا.',
          'تم فحص توافق الإضاءة والظلال والخلفية مع المشهد.',
          'تم فحص ظهور البشر والسيارات والعناصر الثانوية حسب زاوية السيلفي.'
        ],
        risksAR: conflictMessages,
        recommendationsAR: conflictReport.errors.length > 0
          ? ['استخدم التصحيح التلقائي لمعالجة الأخطاء غير المحلولة قبل التوليد.']
          : conflictReport.corrections.length > 0
            ? ['تم رصد وتصحيح تعارضات تلقائيًا؛ راجع الملخص قبل التوليد.']
            : ['الأساس الفيزيائي للمشهد متناسق؛ تدقيق Gemini سيضيف مراجعة نوعية عند توفر الاتصال.']
      };
      setAuditResult(localAudit);

      try {
        const res = await fetch('/api/ai/audit-realism', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneState: resolved.state,
            promptText: prompt,
          }),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => null);
          throw new Error(errorPayload?.error || `فشل تدقيق Gemini (HTTP ${res.status})`);
        }

        const data: RealismAuditResult = await res.json();

        const geminiScore = Number(data.realismScore);
        const overallScore = combineRealismScores(physicalConsistencyScore, geminiScore);

        setAuditResult({
          ...localAudit,
          ...data,
          realismScore: overallScore,
          localScore: physicalConsistencyScore,
          geminiScore: Number.isFinite(geminiScore) ? Math.max(0, Math.min(100, geminiScore)) : undefined,
          scoreMode: 'composite'
        });

        if (data.verdictAR?.includes('تعذر تدقيق Gemini')) {
          setAuditError('تعذر اتصال Gemini؛ تم عرض نتيجة الاتساق الفيزيائي المحلي.');
        }
      } catch (geminiErr: any) {
        console.error('Gemini audit failed:', geminiErr);
        setAuditError(geminiErr?.message || 'تعذر تدقيق Gemini؛ تم عرض نتيجة الاتساق الفيزيائي المحلي.');
      }
    } catch (localErr: any) {
      console.error('Local audit pipeline failed:', localErr);
      const message = localErr?.message || 'حدث خطأ أثناء بناء نتيجة الفحص المحلي.';
      setAuditError(message);
      setAuditResult({
        realismScore: 0,
        verdictAR: 'تعذر إكمال الفحص المحلي',
        strengthsAR: [],
        risksAR: [message],
        recommendationsAR: ['أعد اختيار المشهد أو استخدم التصحيح التلقائي ثم حاول مرة أخرى.']
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // Deterministic Auto-Fix & Realism Re-Audit
  // Flow: Current Scene -> Detect Problems -> Auto Resolve -> Validate -> Rebuild Prompt -> Review Again
  const handleAutoFix = async () => {
    if (isAutoFixing) return;
    try {
      setIsAutoFixing(true);
      setAutoFixStatus('processing');
      setAutoFixMessage(null);

      // 1. Run the unified Realism Intelligence layer once.
      // It resolves scene conflicts, validates the canonical result, and reports what changed.
      const intelligence = analyzeAndRepairScene(
        state as unknown as Record<string, unknown>
      );
      const finalResolved = intelligence.finalResolved;
      const finalState = finalResolved.state as SceneState;

      setState(finalState);
      localStorage.setItem('physframe_current_state', JSON.stringify(finalState));

      // 3. Re-compile only from the final canonical state through one engine entry point.
      const finalPipeline = compileUnifiedPromptPipeline(finalState as any);
      const conflictReport = finalPipeline.diagnostics.conflictReport;
      const cleanPromptText = finalPipeline.platforms.gemini.prompt;

      // Update enhanced prompt cache if active
      if (useEnhancedPrompt) {
        setEnhancedPrompts(prev => ({
          ...prev,
          gemini: cleanPromptText,
          chatgpt: finalPipeline.platforms.chatgpt.prompt
        }));
      }

      // 4. Auto-Fix succeeds locally and immediately. Gemini must never block correction.
      const physicalConsistencyScore = calculatePhysicalConsistencyScore(
        conflictReport,
        finalResolved.physicalState.plausibility.overallScore
      );
      const localFixedAudit: RealismAuditResult = {
        realismScore: physicalConsistencyScore,
        localScore: physicalConsistencyScore,
        scoreMode: 'local',
        verdictAR: physicalConsistencyScore >= 90
          ? 'تم التصحيح: اتساق فيزيائي محلي ممتاز'
          : physicalConsistencyScore >= 75
            ? 'تم التصحيح مع بقاء ملاحظات محدودة'
            : 'تم تطبيق التصحيحات المتاحة وتبقى نقاط تحتاج مراجعة',
        strengthsAR: [
          'تم اعتماد الحالة المصححة الكاملة دفعة واحدة.',
          'تمت إعادة بناء هندسة الكاميرا والإضاءة والخلفية من الحالة النهائية نفسها.',
          'تم تنظيف تناقضات البرومبت بعد التصحيح.'
        ],
        risksAR: conflictReport.results.map(item => item.message),
        recommendationsAR: conflictReport.errors.length > 0
          ? ['راجع الأخطاء غير المحلولة قبل التوليد.']
          : conflictReport.corrections.length > 0
            ? ['تم تطبيق التصحيحات المتاحة؛ راجع التغييرات إن أردت التأكد من النتيجة.']
            : ['المشهد جاهز للتوليد من ناحية الاتساق الفيزيائي المحلي.']
      };

      setAutoFixMessage(intelligence.summaryAR);

      setAuditResult(localFixedAudit);
      setAutoFixStatus('success');
      showToast(intelligence.summaryAR);

      // Gemini re-audit is secondary and runs without blocking the Auto-Fix button.
      void fetch('/api/ai/audit-realism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneState: finalState,
          promptText: cleanPromptText,
        }),
      })
        .then(async res => {
          if (!res.ok) throw new Error(`Gemini audit HTTP ${res.status}`);
          const updatedAudit: RealismAuditResult = await res.json();
          if (updatedAudit.verdictAR?.includes('تعذر تدقيق Gemini')) return;

          const geminiScore = Number(updatedAudit.realismScore);
          setAuditResult({
            ...localFixedAudit,
            ...updatedAudit,
            realismScore: combineRealismScores(physicalConsistencyScore, geminiScore),
            localScore: physicalConsistencyScore,
            geminiScore: Number.isFinite(geminiScore) ? Math.max(0, Math.min(100, geminiScore)) : undefined,
            scoreMode: 'composite'
          });
        })
        .catch(err => {
          console.warn('Gemini re-audit skipped after successful local Auto-Fix:', err);
        });

      // Restore normal button state after a short delay
      setTimeout(() => {
        setAutoFixStatus('idle');
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setAutoFixStatus('idle');
      showToast(err.message || 'تعذر استكمال التصحيح التلقائي');
    } finally {
      setIsAutoFixing(false);
    }
  };

  // Gemini Intelligence: Enhance Prompt
  const handleEnhancePrompt = async (targetEngine: 'chatgpt' | 'gemini') => {
    try {
      setIsEnhancingPrompt(true);
      const enhancePipeline = compileUnifiedPromptPipeline(state as any);
      if (!enhancePipeline.diagnostics.anglePromptReady) {
        throw new Error('لا يمكن تعزيز أو إرسال برومبت دون أدلة هندسية كافية للكاميرا.');
      }
      const base = enhancePipeline.platforms[targetEngine].prompt;

      const res = await fetch('/api/ai/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrompt: base,
          targetEngine,
          sceneState: state,
        }),
      });

      if (!res.ok) throw new Error('فشل تعزيز البرومبت');
      const data = await res.json();
      const enhancedCandidate = data.enhancedPrompt || base;
      const enhancedValidated = validateExternalPromptCandidate(
        enhancePipeline,
        targetEngine,
        enhancedCandidate
      );
      setEnhancedPrompts(prev => ({ ...prev, [targetEngine]: enhancedValidated.prompt }));
      setUseEnhancedPrompt(true);
      showToast('تم تعزيز البرومبت بميكرو-فيزياء العدسة ومسام البشرة');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'خطأ أثناء تعزيز البرومبت');
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleSavePreset = () => {
    if (!state.sceneFamily) return;
    const name = `${SCENE_FAMILIES[state.sceneFamily].labelAR} - ${state.subScene || ''} (${state.timeOfDay === 'night' ? 'ليل' : 'نهار'})`;
    const newPreset: SavedPreset = { id: Date.now().toString(), name, state };
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('physframe_presets', JSON.stringify(updatedPresets));
    showToast('تم حفظ القالب بنجاح');
  };

  const deletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem('physframe_presets', JSON.stringify(updated));
    showToast('تم حذف القالب');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('تم النسخ إلى الحافظة ✓');
    } catch {
      showToast('تعذر النسخ تلقائياً');
    }
  };

  let chatGPTPrompt = "", geminiPrompt = "", negativePrompt = "";
  let angleExportReady = false;
  if (state.sceneFamily) {
    // Single authoritative engine path:
    // SceneState -> Manifest -> Semantic -> Neutral -> Negative -> Platform -> Validation
    const pipeline = compileUnifiedPromptPipeline(state as any);
    angleExportReady = pipeline.diagnostics.anglePromptReady;
    chatGPTPrompt = pipeline.platforms.chatgpt.prompt;
    geminiPrompt = pipeline.platforms.gemini.prompt;
    negativePrompt = pipeline.platforms.chatgpt.negativePrompt || pipeline.negative.text;
  }

  const currentDisplayPrompt = !angleExportReady ? '' : activeTab === 'chatgpt'
    ? (useEnhancedPrompt && enhancedPrompts.chatgpt ? enhancedPrompts.chatgpt : chatGPTPrompt)
    : activeTab === 'gemini'
    ? (useEnhancedPrompt && enhancedPrompts.gemini ? enhancedPrompts.gemini : geminiPrompt)
    : negativePrompt;

  return (
    <div dir="rtl" className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-32 selection:bg-[var(--accent)] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1c2024] border border-[var(--accent)]/40 text-sm font-medium px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in text-[#F3EFE7]">
          <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-md mx-auto bg-[var(--bg-main)] min-h-screen relative shadow-2xl overflow-hidden border-x border-[var(--border)]">

        {/* Top Header */}
        <header className="px-5 py-3.5 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--bg-main)]/95 backdrop-blur-md z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--accent)] to-[#e8cda1] flex items-center justify-center text-black font-extrabold shadow-[0_0_12px_var(--accent-glow)]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-wide text-white">PhysFrame</h1>
                <span className="text-[10px] bg-[var(--accent)]/15 text-[var(--accent)] px-1.5 py-0.5 rounded font-mono font-medium border border-[var(--accent)]/20">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">محرك البرومبت الفيزيائي الواقعي</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => applyCuratedVibe('random')}
              className="text-xs bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] px-2.5 py-1.5 rounded-lg border border-[var(--border-accent)] flex items-center gap-1 transition-all active:scale-95 font-bold"
              title="روليت الخلطة الذكية العشوائية"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>خلطة 🎲</span>
            </button>
            <button
              onClick={() => setShowDirectorModal(true)}
              className="text-xs bg-white/5 hover:bg-white/10 text-white px-2 py-1.5 rounded-lg border border-white/10 flex items-center gap-1 transition-all active:scale-95"
              title="المخرج الذكي بالذكاء الاصطناعي"
            >
              <Film className="w-3.5 h-3.5" />
              <span>المخرج</span>
            </button>
            <button
              aria-label="القوالب المحفوظة"
              className="text-xs text-[var(--text-muted)] hover:text-white rounded-lg p-1.5 hover:bg-white/5 transition-colors"
              onClick={() => setShowPresetsSheet(true)}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              aria-label="إعادة ضبط الإعدادات"
              className="text-xs text-[var(--text-muted)] hover:text-white rounded-lg p-1.5 hover:bg-white/5 transition-colors"
              onClick={() => {
                setState(DEFAULT_STATE);
                localStorage.removeItem('physframe_current_state');
                showToast('تمت إعادة ضبط جميع الخيارات');
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Reference Image & AI Identity Analyzer */}
        <div className="px-5 py-4">
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <ScanFace className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>الصورة المرجعية والهوية</span>
            </h2>
            {hasReference && (
              <button
                onClick={triggerFaceAnalysis}
                disabled={isAnalyzingFace}
                className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
              >
                {isAnalyzingFace ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>جارِ الفحص...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>فحص الملامح بـ Gemini</span>
                  </>
                )}
              </button>
            )}
          </div>

          {!hasReference ? (
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 flex flex-col items-center justify-center border border-dashed border-[var(--border)] text-center transition-all hover:border-[var(--border-accent)]">
               <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-[var(--accent)]">
                 <Upload className="w-6 h-6" />
               </div>
               <p className="text-sm font-semibold mb-1">ارفع صورة وجه حقيقية للتثبيت</p>
               <p className="text-xs text-[var(--text-muted)] max-w-xs mb-3">سيقوم Gemini بفحص النظارات، خط الشعر، وكثافة اللحية بدقة ميكروسكوبية.</p>
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-bold rounded-xl hover:bg-[#d6b783] transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
               >
                 <Upload className="w-3.5 h-3.5" />
                 <span>اختيار صورة من الجهاز</span>
               </button>
               <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

               {/* Glasses Control */}
               <div className="mt-3 pt-2.5 border-t border-white/5 w-full flex items-center justify-center gap-1.5 text-[10px]">
                 <span className="flex items-center gap-1 font-semibold text-white">
                   <Glasses className="w-3 h-3 text-[var(--accent)]" />
                   <span>النظارات:</span>
                 </span>
                 <div className="inline-flex bg-black/40 p-0.5 rounded-lg border border-white/10">
                   {[
                     { id: 'match_reference', label: 'مطابقة للمرجع' },
                     { id: 'wear_glasses', label: 'مع نظارة' },
                     { id: 'no_glasses', label: 'بدون نظارة' }
                   ].map(opt => (
                     <button
                       key={opt.id}
                       type="button"
                       onClick={() => setState({ ...state, glassesMode: opt.id as GlassesMode })}
                       className={`px-2 py-0.5 rounded-md text-[10px] transition-all ${
                         state.glassesMode === opt.id
                           ? 'bg-[var(--accent)] text-black font-bold shadow-xs'
                           : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                       }`}
                     >
                       {opt.label}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-card)] rounded-2xl p-3.5 border border-[var(--border)] relative overflow-hidden">
              <div className="flex gap-3.5 items-center">
                <div className="w-16 h-20 bg-[var(--bg-hover)] rounded-xl overflow-hidden relative shrink-0 border border-white/10 flex items-center justify-center">
                   <img
                     src={imageUrl || ''}
                     alt="Reference"
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       e.currentTarget.style.display = 'none';
                     }}
                   />
                </div>

                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-1.5 mb-1">
                     <span className="w-2 h-2 rounded-full bg-[#52c41a] animate-pulse"></span>
                     <span className="text-xs font-bold text-white">الهوية مثبتة بقفل فيزيائي</span>
                   </div>

                   {faceAnalysis ? (
                     <div className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-2">
                       {faceAnalysis.arabicSummary}
                     </div>
                   ) : (
                     <p className="text-[11px] text-[var(--text-muted)] mb-2">
                       الصورة جاهزة للتوجيه والتوليد.
                     </p>
                   )}

                   <div className="flex flex-wrap gap-1.5">
                     <button
                       onClick={() => fileInputRef.current?.click()}
                       className="text-[11px] text-white/80 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md transition-colors"
                     >
                       استبدال
                     </button>
                     <button
                       onClick={handleImageDelete}
                       className="text-[11px] text-red-400 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md transition-colors"
                     >
                       حذف
                     </button>
                     {faceAnalysis && (
                       <button
                         onClick={() => setShowFaceAnalysisModal(true)}
                         className="text-[11px] text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                       >
                         <Eye className="w-3 h-3" />
                         <span>تقرير Gemini</span>
                       </button>
                     )}
                     <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                   </div>
                </div>
              </div>

              {/* Status bar with selectable Glasses Control */}
              <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <Glasses className="w-3 h-3 text-[var(--accent)]" />
                    <span>النظارات:</span>
                  </span>
                  <div className="inline-flex bg-black/40 p-0.5 rounded-lg border border-white/10">
                    {[
                      { id: 'match_reference', label: 'مطابقة للمرجع' },
                      { id: 'wear_glasses', label: 'مع نظارة' },
                      { id: 'no_glasses', label: 'بدون نظارة' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setState({ ...state, glassesMode: opt.id as GlassesMode })}
                        className={`px-2 py-0.5 rounded-md text-[10px] transition-all ${
                          state.glassesMode === opt.id
                            ? 'bg-[var(--accent)] text-black font-bold shadow-xs'
                            : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] shrink-0">193cm • 83kg</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Quick Scenario Launcher Banner */}
        <div className="px-5 mb-3">
          <div className="bg-gradient-to-r from-[#241E16] via-[#1E1914] to-[var(--bg-card)] rounded-2xl p-3.5 border border-[#483B28] flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/20 border border-[var(--border-accent)] flex items-center justify-center text-[var(--accent)] shrink-0">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F3EFE7] mb-0.5">المخرج الذكي (AI Director)</h3>
                <p className="text-[11px] text-[#A7A39A]">ابتكر مشاهد سعودية حقيقية مستحيلة الكشف</p>
              </div>
            </div>
            <button
              onClick={() => setShowDirectorModal(true)}
              className="px-3 py-1.5 bg-[var(--accent)] text-black text-xs font-bold rounded-lg hover:bg-[#d6b783] transition-colors shrink-0 shadow-sm"
            >
              افتح المخرج
            </button>
          </div>
        </div>

        {/* Smart Vibe Roulette & 1-Click Curated Scenarios (الخلطة العشوائية الذكية) */}
        <div className="px-5 mb-4">
          <div className="bg-[#181410] rounded-2xl p-3 border border-[#3E3424] shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold text-white">الخلطة العشوائية الذكية (Vibe Roulette)</h3>
              </div>
              <button
                type="button"
                onClick={() => applyCuratedVibe('random')}
                className="px-2.5 py-1 bg-[var(--accent)] text-black font-extrabold text-[11px] rounded-lg hover:bg-[#d6b783] transition-all flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Shuffle className="w-3 h-3" />
                <span>خلطة جديدة 🎲</span>
              </button>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] mb-2.5">
              تراكيب فيزيائية متناسقة 100% بنقرة واحدة لكسر طابع الـ AI:
            </p>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => applyCuratedVibe('military-duty')}
                className="p-2 rounded-xl bg-white/5 hover:bg-[var(--accent)]/15 border border-white/5 hover:border-[var(--accent)] text-right transition-all flex flex-col group cursor-pointer"
              >
                <span className="text-xs font-bold text-white group-hover:text-[var(--accent)]">🪖 مناوبة عسكرية</span>
                <span className="text-[9px] text-[var(--text-muted)]">مكتب رسمي وفلورسنت</span>
              </button>

              <button
                type="button"
                onClick={() => applyCuratedVibe('afternoon-cafe')}
                className="p-2 rounded-xl bg-white/5 hover:bg-[var(--accent)]/15 border border-white/5 hover:border-[var(--accent)] text-right transition-all flex flex-col group cursor-pointer"
              >
                <span className="text-xs font-bold text-white group-hover:text-[var(--accent)]">☕ قهوة العصر</span>
                <span className="text-[9px] text-[var(--text-muted)]">ساعة ذهبية وغبار خفيف</span>
              </button>

              <button
                type="button"
                onClick={() => applyCuratedVibe('gym-break')}
                className="p-2 rounded-xl bg-white/5 hover:bg-[var(--accent)]/15 border border-white/5 hover:border-[var(--accent)] text-right transition-all flex flex-col group cursor-pointer"
              >
                <span className="text-xs font-bold text-white group-hover:text-[var(--accent)]">🏋️‍♂️ بعد التمرين</span>
                <span className="text-[9px] text-[var(--text-muted)]">رطوبة وتعرق خفيف</span>
              </button>

              <button
                type="button"
                onClick={() => applyCuratedVibe('car-waiting')}
                className="p-2 rounded-xl bg-white/5 hover:bg-[var(--accent)]/15 border border-white/5 hover:border-[var(--accent)] text-right transition-all flex flex-col group cursor-pointer"
              >
                <span className="text-xs font-bold text-white group-hover:text-[var(--accent)]">🚗 داخل السيارة</span>
                <span className="text-[9px] text-[var(--text-muted)]">شاشة الهاتف والزجاج</span>
              </button>

              <button
                type="button"
                onClick={() => applyCuratedVibe('home-lounge')}
                className="p-2 rounded-xl bg-white/5 hover:bg-[var(--accent)]/15 border border-white/5 hover:border-[var(--accent)] text-right transition-all flex flex-col group cursor-pointer"
              >
                <span className="text-xs font-bold text-white group-hover:text-[var(--accent)]">🏠 استكنان منزلي</span>
                <span className="text-[9px] text-[var(--text-muted)]">كنزة صوفية وقهوة</span>
              </button>

              <button
                type="button"
                onClick={() => applyCuratedVibe('desert-winter')}
                className="p-2 rounded-xl bg-white/5 hover:bg-[var(--accent)]/15 border border-white/5 hover:border-[var(--accent)] text-right transition-all flex flex-col group cursor-pointer"
              >
                <span className="text-xs font-bold text-white group-hover:text-[var(--accent)]">🏜️ كشتة ونسيم</span>
                <span className="text-[9px] text-[var(--text-muted)]">فروة شمالية وهواء</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-5 py-1">
          {!state.sceneFamily ? (
             <div className="py-6 text-center animate-fade-in">
                <h2 className="text-lg font-bold mb-2">اختر موقع التصوير الميداني</h2>
                <p className="text-xs text-[var(--text-muted)] mb-5">مواقع واقعية من الحياة اليومية السعودية مصممة لكسر طابع الـ AI</p>

                <div className="grid grid-cols-1 gap-2.5">
                  {Object.entries(SCENE_FAMILIES).map(([id, family]) => (
                    <button
                      key={id}
                      onClick={() => handleSceneSelect(id as SceneFamilyId)}
                      className="w-full p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] text-right hover:border-[var(--border-accent)] hover:bg-[var(--bg-hover)] transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-sm text-[#F3EFE7] group-hover:text-[var(--accent)] transition-colors">
                          {family.labelAR}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {family.subScenes.slice(0, 3).join(' • ')}...
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
             </div>
          ) : (
             <div className="animate-fade-in space-y-6 pb-6">

                {/* Active Scene & Sub-scenes */}
                <section className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
                      <h3 className="font-bold text-sm text-[var(--accent)]">{activeFamily?.labelAR}</h3>
                    </div>
                    <button
                      onClick={() => setState({ ...state, sceneFamily: null })}
                      className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-white transition-colors"
                    >
                      تغيير الموقع
                    </button>
                  </div>

                  <label className="text-[11px] text-[var(--text-muted)] block mb-2 font-bold">الزاوية الفرعية الدقيقة:</label>
                  {state.sceneFamily === 'military-base' ? (
                    <div className="space-y-3">
                      {militarySubSceneGroups.map(group => (
                        <div key={group.groupAR} className="rounded-xl border border-white/5 bg-black/10 p-2.5">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold text-white">{group.groupAR}</span>
                            <span className="text-[9px] text-[var(--text-muted)]">{group.locations.length} زوايا</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.locations.map(location => (
                              <button
                                key={location.id}
                                type="button"
                                onClick={() => setState(prev => ({
                                  ...prev,
                                  subScene: location.labelAR,
                                  selfieAngleAdvice: undefined,
                                  backgroundGeminiAdvice: undefined
                                }))}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] border transition-colors ${state.subScene === location.labelAR ? 'bg-[var(--accent)]/15 border-[var(--border-accent)] text-[var(--accent)] font-bold' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-white/5'}`}
                              >
                                {location.labelAR}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="text-[9px] leading-relaxed text-[var(--text-muted)] px-1">
                        كل زاوية تحمل حدودًا مستقلة للبشر والسيارات والفوضى والإضاءة، وتعيد حساب الخلفية والزاوية الذكية عند تغييرها.
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {activeFamily?.subScenes.map(sub => (
                        <button
                          key={sub}
                          onClick={() => setState(prev => ({
                            ...prev,
                            subScene: sub,
                            selfieAngleAdvice: undefined,
                            backgroundGeminiAdvice: undefined
                          }))}
                          className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${state.subScene === sub ? 'bg-[var(--accent)]/15 border-[var(--border-accent)] text-[var(--accent)] font-bold' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-white/5'}`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {/* Activity & Pose */}
                <section className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
                  <h3 className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">النشاط والوضعية والاتكاء</h3>

                  <label className="text-[11px] text-[var(--text-muted)] block mb-1 font-semibold">ماذا يفعل؟</label>
                  <select
                    value={state.activity}
                    onChange={e => setState({
                      ...state,
                      activity: e.target.value,
                      selfieAngleAdvice: undefined
                    })}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[#F3EFE7] focus:outline-none focus:border-[var(--accent)] mb-3"
                  >
                    {sceneRecommendations.activities.length > 0 && (
                      <optgroup label="★ مقترح لهذا المشهد">
                        {sceneRecommendations.activities.map(labelAR => (
                          <option key={`recommended-activity-${labelAR}`} value={labelAR}>{labelAR}</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="خيارات إضافية">
                      {activityOptions
                        .filter(item => !recommendedActivitySet.has(item.labelAR))
                        .map(item => (
                          <option key={item.labelAR} value={item.labelAR}>{item.labelAR}</option>
                        ))}
                    </optgroup>
                  </select>

                  <label className="text-[11px] text-[var(--text-muted)] block mb-1 font-semibold">فيزياء الوضعية والملامسة:</label>
                  <select
                    value={state.pose}
                    onChange={e => setState({
                      ...state,
                      pose: e.target.value,
                      selfieAngleAdvice: undefined
                    })}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[#F3EFE7] focus:outline-none focus:border-[var(--accent)]"
                  >
                    {sceneRecommendations.poses.length > 0 && (
                      <optgroup label="★ مقترح لهذا المشهد">
                        {sceneRecommendations.poses.map(p => (
                          <option key={`recommended-pose-${p}`} value={p}>{p}</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="خيارات إضافية">
                      {poseOptions
                        .filter(p => !recommendedPoseSet.has(p))
                        .map(p => <option key={p} value={p}>{p}</option>)}
                    </optgroup>
                  </select>

                  <div className="mt-2.5 rounded-xl bg-black/20 border border-white/5 px-3 py-2 text-[9px] leading-relaxed text-[var(--text-muted)]">
                    الاقتراحات الأولى تتغير تلقائيًا حسب الزاوية الفرعية المختارة، بما فيها الأثاث ونقاط الملامسة. النشاط يغيّر حركة الجسم واتجاه النظر ويعيد حساب زاوية السيلفي الذكية عند الحاجة.
                  </div>
                </section>

                {/* Camera Mechanics & Framing */}
                <section className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
                   <div className="flex justify-between items-center mb-3">
                     <h3 className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider">نوع اللقطة والكاميرا</h3>
                     <span className="text-[10px] text-[var(--text-muted)]">فيزياء الذراع والعدسة</span>
                   </div>

                   <div className="flex gap-2 mb-3">
                      {[
                        { id: 'front-selfie', l: 'سيلفي أمامي' },
                        { id: 'mirror-selfie', l: 'سيلفي مرآة' },
                        { id: 'third-person-candid', l: 'لقطة عفوية (طرف ثالث)' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setState({
                           ...state,
                           captureType: t.id as CaptureType,
                           groupSelfieEnabled: t.id === 'front-selfie' ? state.groupSelfieEnabled : false,
                           selfieAngleAdvice: undefined,
                           backgroundGeminiAdvice: undefined
                         })}
                          className={`flex-1 py-2 px-1 rounded-xl text-xs border text-center transition-all ${state.captureType === t.id ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-bold' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-white/5'}`}
                        >
                          {t.l}
                        </button>
                      ))}
                   </div>

                   {state.captureType === 'front-selfie' && (
                     <div className="mb-3 rounded-xl border border-white/10 bg-black/20 p-3">
                       <button
                         type="button"
                         onClick={() => updateGroupSelfieControls({
                           groupSelfieEnabled: !state.groupSelfieEnabled
                         })}
                         className={`w-full flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-right transition-colors ${state.groupSelfieEnabled ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50' : 'bg-white/5 border-white/10'}`}
                       >
                         <div>
                           <div className="text-[11px] font-bold text-white">سيلفي جماعي ديناميكي</div>
                           <div className="text-[9px] text-[var(--text-muted)] mt-0.5">ليس قالبًا ثابتًا: المكان يحدد التوزيع والمسافة وملابس الأشخاص</div>
                         </div>
                         <span className={`text-[10px] font-bold ${state.groupSelfieEnabled ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                           {state.groupSelfieEnabled ? 'ON' : 'OFF'}
                         </span>
                       </button>

                       {state.groupSelfieEnabled && groupSelfiePreview && (
                         <div className="mt-3">
                           <div className="grid grid-cols-2 gap-2 mb-2">
                             <div>
                               <label className="text-[10px] text-[var(--text-muted)] block mb-1">عدد الأشخاص</label>
                               <select
                                 value={state.groupSelfieSize}
                                 onChange={e => updateGroupSelfieControls({
                                   groupSelfieSize: Number(e.target.value) as GroupSelfieSize
                                 })}
                                 className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white"
                               >
                                 {[2,3,4,5].map(size => (
                                   <option key={size} value={size} disabled={size > groupSelfiePreview.maxByLocation}>
                                     {size} أشخاص{size > groupSelfiePreview.maxByLocation ? ' · غير مناسب للمكان' : ''}
                                   </option>
                                 ))}
                               </select>
                             </div>
                             <div>
                               <label className="text-[10px] text-[var(--text-muted)] block mb-1">نوع المجموعة</label>
                               <select
                                 value={state.groupSelfieRelationship}
                                 onChange={e => updateGroupSelfieControls({
                                   groupSelfieRelationship: e.target.value as GroupSelfieRelationship
                                 })}
                                 className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white"
                               >
                                 <option value="auto">تلقائي حسب المكان</option>
                                 <option value="coworkers">زملاء عمل</option>
                                 <option value="friends">أصدقاء</option>
                                 <option value="family">عائلة</option>
                                 <option value="gym-friends">أصدقاء النادي</option>
                               </select>
                             </div>
                           </div>

                           <div className="rounded-lg border border-[#2C5A43] bg-[#102219] px-3 py-2 text-[9px] leading-relaxed text-[#8FD2A6]">
                             <div className="font-bold mb-1">Anti-Cloning: {groupSelfiePreview.antiCloningPassed ? 'PASS ✓' : 'يحتاج تصحيح'}</div>
                             <div>التوزيع: {groupSelfiePreview.arrangement}</div>
                             <div className="mt-1">الحد الواقعي للمكان: {groupSelfiePreview.maxByLocation} · المسافة المقترحة: {groupSelfiePreview.recommendedDistanceCm}cm</div>
                             <div className="mt-1">كل مرافق له وجه وشعر ولحية وطول وبنية وملابس مختلفة عن الآخرين، وصاحب الصورة المرجعية وحده مثبت الهوية ويحمل الهاتف.</div>
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                   <div className="flex gap-2 mb-3">
                      {[
                        { id: 'head-shoulders', l: 'رأس وكتف' },
                        { id: 'chest-up', l: 'الصدر للأعلى' },
                        { id: 'half-body', l: 'نصف الجسم' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setState({ ...state, framing: t.id as Framing })}
                          className={`flex-1 py-1.5 rounded-lg text-xs border transition-colors ${state.framing === t.id ? 'bg-white/10 border-white/20 text-white font-medium' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-white/5'}`}
                        >
                          {t.l}
                        </button>
                      ))}
                   </div>

                   {state.captureType === 'front-selfie' && (
                     <div className="grid grid-cols-2 gap-2 mb-3">
                       <button
                         type="button"
                         onClick={() => setState({
                           ...state,
                           cameraAngleMode: 'gemini-smart',
                           selfieAngleAdvice: undefined
                         })}
                         className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${state.cameraAngleMode === 'gemini-smart' ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
                       >
                         Gemini زاوية ذكية
                       </button>
                       <button
                         type="button"
                         onClick={() => setState({ ...state, cameraAngleMode: 'manual' })}
                         className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${state.cameraAngleMode === 'manual' ? 'bg-white/10 border-white/20 text-white' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
                       >
                         تحكم يدوي
                       </button>
                     </div>
                   )}

                   <select
                     value={state.cameraAngle}
                     onChange={e => setState({
                       ...state,
                       cameraAngle: e.target.value as CameraAngle,
                       selfieAngleAdvice: undefined
                     })}
                     disabled={state.captureType === 'front-selfie' && state.cameraAngleMode === 'gemini-smart'}
                     className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[#F3EFE7] focus:outline-none focus:border-[var(--accent)] disabled:opacity-45"
                   >
                    <option value="eye-level">زاوية الكاميرا: مستوى العين الطبيعي</option>
                    <option value="slightly-high">زاوية الكاميرا: أعلى قليلًا (سيلفي علوي)</option>
                    <option value="slightly-low">زاوية الكاميرا: أسفل قليلًا</option>
                    <option value="slightly-off-center">زاوية الكاميرا: خارج المنتصف (عفوي)</option>
                  </select>

                  {state.captureType === 'front-selfie' && state.cameraAngleMode === 'gemini-smart' && selfieAngleDecision && (
                    <div className="mt-3 rounded-xl border border-white/5 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] text-[var(--text-muted)]">الزاوية النهائية</div>
                          <div className="text-xs font-bold text-white mt-0.5">{selfieAngleDecision.presetLabelAR}</div>
                        </div>
                        <span className="text-[9px] text-[var(--accent)]">
                          {isSelfieAngleReasoning
                            ? 'Gemini يحلل...'
                            : selfieAngleDecision.source === 'gemini'
                              ? 'Gemini + Physics'
                              : 'Physics fallback'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 mt-2 text-center">
                        <div className="bg-white/5 rounded-lg p-1.5">
                          <div className="text-[9px] text-[var(--text-muted)]">Pitch</div>
                          <div className="text-[10px] font-bold text-white">{selfieAngleDecision.pitchDeg.toFixed(0)}°</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-1.5">
                          <div className="text-[9px] text-[var(--text-muted)]">Yaw</div>
                          <div className="text-[10px] font-bold text-white">{selfieAngleDecision.yawDeg.toFixed(0)}°</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-1.5">
                          <div className="text-[9px] text-[var(--text-muted)]">Roll</div>
                          <div className="text-[10px] font-bold text-white">{selfieAngleDecision.rollDeg.toFixed(0)}°</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-1.5">
                          <div className="text-[9px] text-[var(--text-muted)]">المسافة</div>
                          <div className="text-[10px] font-bold text-white">{Math.round(selfieAngleDecision.distanceCm)}cm</div>
                        </div>
                      </div>

                      {state.sceneFamily === 'car' && selfieAngleDecision.carFocus && (
                        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px]">
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-[var(--text-muted)] mb-0.5">هدف الزاوية</div>
                            <div className="font-bold text-white">
                              {selfieAngleDecision.carFocus === 'face-priority'
                                ? 'أولوية الوجه'
                                : selfieAngleDecision.carFocus === 'cabin-context'
                                  ? 'إظهار المقصورة'
                                  : 'متوازن'}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-[var(--text-muted)] mb-0.5">موضع الهاتف</div>
                            <div className="font-bold text-white leading-relaxed">
                              {selfieAngleDecision.phonePlacement || 'داخل المقصورة ضمن مجال الذراع'}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-[9px] leading-relaxed text-[var(--text-muted)] mt-2">
                        {selfieAngleDecision.reasonAR.slice(0, 2).join(' ')}
                      </div>

                      {state.sceneFamily === 'car' && selfieAngleDecision.carClearanceAdjusted && (
                        <div className="text-[9px] text-[#F0C77E] mt-2 flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>تم تقييد الزاوية تلقائيًا لتجنب المقود أو الزجاج أو السقف أو أجزاء المقصورة.</span>
                        </div>
                      )}

                      {selfieAngleReasoningError && (
                        <div className="text-[9px] text-[#E9A6A0] mt-2">
                          {selfieAngleReasoningError} تم استخدام أفضل زاوية محلية بدون تعطيل المحرك.
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Fixed Scene-Aware Background Controls */}
                <section className="bg-gradient-to-b from-[#181B1E] to-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-accent)] shadow-lg">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-xs">الواقعية الخلفية</h3>
                        <p className="text-[10px] text-[var(--text-muted)]">البشر والسيارات والفوضى والنشاط وحضور الخلفية مرتبطة تلقائيًا بزاوية السيلفي والـFOV</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateBackgroundControls({
                        backgroundGeminiAssist: !state.backgroundGeminiAssist
                      })}
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${state.backgroundGeminiAssist ? 'bg-[#1C2B20] border-[#355F3D] text-[#8FD29B]' : 'bg-white/5 border-white/10 text-[var(--text-muted)]'}`}
                    >
                      Gemini {state.backgroundGeminiAssist ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setState(prev => ({
                      ...prev,
                      backgroundAutoAngle: !prev.backgroundAutoAngle,
                      selfieAngleAdvice: undefined,
                      ...(!prev.backgroundAutoAngle
                        ? { cameraAngleMode: 'gemini-smart' as SelfieAngleMode }
                        : {})
                    }))}
                    className={`w-full mb-3 px-3 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-right transition-colors ${state.backgroundAutoAngle ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50' : 'bg-white/5 border-white/10'}`}
                  >
                    <div>
                      <div className="text-[10px] font-bold text-white">ربط الخلفية بزاوية السيلفي تلقائيًا</div>
                      <div className="text-[9px] text-[var(--text-muted)] mt-0.5">أي تغيير هنا يعيد اختيار Pitch / Yaw / Roll / المسافة تلقائيًا</div>
                    </div>
                    <span className={`text-[10px] font-bold ${state.backgroundAutoAngle ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                      {state.backgroundAutoAngle ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[
                      { id: 'auto', label: 'ذكي' },
                      { id: 'restricted', label: 'مقيّد' },
                      { id: 'active', label: 'نشط' },
                      { id: 'off', label: 'مغلق' }
                    ].map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateBackgroundControls({
                          backgroundMode: option.id as BackgroundMode
                        })}
                        className={`py-2 rounded-lg text-[10px] font-bold border transition-colors ${state.backgroundMode === option.id ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-white/5'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {isHomeBackgroundScene(state.sceneFamily) && (
                    <div className="mb-3 rounded-xl border border-[var(--border)] bg-black/20 p-3">
                      <div className="mb-2">
                        <div className="text-[11px] font-bold text-white">ماذا تريد في الخلفية؟</div>
                        <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
                          اختيارك للبشر صريح ولا يتحول إلى «بدون» بسبب الكادر؛ الفيزياء تقلل الظهور أو تستخدم الحجب فقط.
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-1 mb-3">
                        {(Object.entries(HOME_BACKGROUND_MODE_LABELS) as Array<[HomeBackgroundPeopleMode, string]>).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              const currentCount = Math.max(1, state.homeBackgroundCount || 1);
                              const density: BackgroundControlDensity =
                                id === 'none'
                                  ? 'none'
                                  : currentCount >= 4
                                    ? 'moderate'
                                    : currentCount >= 2
                                      ? 'light'
                                      : 'sparse';

                              setState(prev => ({
                                ...prev,
                                homeBackgroundPeopleMode: id,
                                homeBackgroundCount: id === 'none' ? 0 : Math.max(1, prev.homeBackgroundCount || 1),
                                homeBackgroundClothing: id === 'none'
                                  ? []
                                  : Array.from(
                                      { length: Math.max(1, prev.homeBackgroundCount || 1) },
                                      (_, index) => prev.homeBackgroundClothing?.[index] ?? 'auto'
                                    ),
                                backgroundMode: id === 'none' ? prev.backgroundMode : 'active',
                                backgroundHumans: density,
                                backgroundPresence: id === 'none' ? prev.backgroundPresence : 'visible',
                                backgroundGeminiAdvice: undefined,
                                selfieAngleAdvice: undefined,
                              }));
                            }}
                            className={`py-2 rounded-lg text-[9px] font-bold border transition-colors ${(state.homeBackgroundPeopleMode ?? 'none') === id ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {(state.homeBackgroundPeopleMode ?? 'none') !== 'none' && (
                        <>
                          <div className="mb-3">
                            <label className="text-[10px] text-[var(--text-muted)] block mb-1">عدد الأشخاص</label>
                            <select
                              value={Math.max(1, state.homeBackgroundCount || 1)}
                              onChange={e => {
                                const count = Math.max(1, Math.min(5, Number(e.target.value)));
                                const density: BackgroundControlDensity =
                                  count >= 4 ? 'moderate' : count >= 2 ? 'light' : 'sparse';
                                setState(prev => ({
                                  ...prev,
                                  homeBackgroundCount: count,
                                  homeBackgroundClothing: Array.from(
                                    { length: count },
                                    (_, index) => prev.homeBackgroundClothing?.[index] ?? 'auto'
                                  ),
                                  backgroundMode: 'active',
                                  backgroundHumans: density,
                                  backgroundPresence: 'visible',
                                  backgroundGeminiAdvice: undefined,
                                  selfieAngleAdvice: undefined,
                                }));
                              }}
                              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white"
                            >
                              {[1, 2, 3, 4, 5].map(count => (
                                <option key={count} value={count}>{count}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            {resolveHomeBackgroundPersonKinds(
                              state.homeBackgroundPeopleMode ?? 'none',
                              Math.max(1, state.homeBackgroundCount || 1)
                            ).map((kind, index) => {
                              const kindLabel = kind === 'man' ? 'رجل' : kind === 'woman' ? 'امرأة' : 'طفل';
                              const clothing = state.homeBackgroundClothing?.[index] ?? 'auto';
                              return (
                                <div key={`${kind}-${index}`} className="grid grid-cols-[72px_1fr] gap-2 items-center">
                                  <div className="text-[10px] font-bold text-white">{kindLabel} {index + 1}</div>
                                  <select
                                    value={clothing}
                                    onChange={e => {
                                      const next = [...(state.homeBackgroundClothing ?? [])];
                                      next[index] = e.target.value as HomeBackgroundClothing;
                                      setState(prev => ({
                                        ...prev,
                                        homeBackgroundClothing: next,
                                      }));
                                    }}
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white"
                                  >
                                    {HOME_BACKGROUND_CLOTHING_OPTIONS[kind].map(option => (
                                      <option key={option.id} value={option.id}>{option.labelAR}</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-3 text-[9px] leading-relaxed text-[#8FD29B]">
                            Anti-cloning صارم: لا يُنسخ وجه الصورة المرجعية، ولا يُعاد استخدام وجه شخص خلفي لشخص آخر.
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] block mb-1">البشر</label>
                      <select
                        value={state.backgroundHumans}
                        onChange={e => updateBackgroundControls({
                          backgroundHumans: e.target.value as BackgroundControlDensity
                        })}
                        disabled={state.backgroundMode === 'off' || isHomeBackgroundScene(state.sceneFamily)}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white disabled:opacity-40"
                      >
                        <option value="auto">{isHomeBackgroundScene(state.sceneFamily) ? 'من اختيار الخلفية المنزلية' : 'تلقائي'}</option>
                        <option value="none">بدون</option>
                        <option value="sparse">قليل</option>
                        <option value="light">خفيف</option>
                        <option value="moderate">متوسط</option>
                        <option value="high">مرتفع</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] block mb-1">السيارات</label>
                      <select
                        value={state.backgroundVehicles}
                        onChange={e => updateBackgroundControls({
                          backgroundVehicles: e.target.value as BackgroundControlDensity
                        })}
                        disabled={state.backgroundMode === 'off'}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white disabled:opacity-40"
                      >
                        <option value="auto">تلقائي</option>
                        <option value="none">بدون</option>
                        <option value="sparse">قليل</option>
                        <option value="light">خفيف</option>
                        <option value="moderate">متوسط</option>
                        <option value="high">مرتفع</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] block mb-1">الفوضى</label>
                      <select
                        value={state.backgroundDisorder}
                        onChange={e => updateBackgroundControls({
                          backgroundDisorder: e.target.value as BackgroundDisorderControl
                        })}
                        disabled={state.backgroundMode === 'off'}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white disabled:opacity-40"
                      >
                        <option value="auto">تلقائي</option>
                        <option value="very-clean">نظيف جدًا</option>
                        <option value="natural">طبيعي</option>
                        <option value="lived-in">مستخدم/معاش</option>
                        <option value="light">فوضى خفيفة</option>
                        <option value="moderate">فوضى متوسطة</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] block mb-1">نشاط المشهد</label>
                      <select
                        value={state.backgroundActivity}
                        onChange={e => updateBackgroundControls({
                          backgroundActivity: e.target.value as BackgroundActivityControl
                        })}
                        disabled={state.backgroundMode === 'off'}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white disabled:opacity-40"
                      >
                        <option value="auto">تلقائي</option>
                        <option value="calm">هادئ</option>
                        <option value="natural">طبيعي</option>
                        <option value="active">نشط</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] block mb-1">حضور الخلفية</label>
                      <select
                        value={state.backgroundPresence}
                        onChange={e => updateBackgroundControls({
                          backgroundPresence: e.target.value as BackgroundPresenceControl
                        })}
                        disabled={state.backgroundMode === 'off'}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white disabled:opacity-40"
                      >
                        <option value="auto">تلقائي</option>
                        <option value="low">ضعيف</option>
                        <option value="balanced">متوازن</option>
                        <option value="visible">واضح</option>
                        <option value="strong">قوي</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] block mb-1">هدف اللقطة</label>
                      <select
                        value={state.backgroundCompositionGoal}
                        onChange={e => updateBackgroundControls({
                          backgroundCompositionGoal: e.target.value as BackgroundCompositionGoal
                        })}
                        disabled={state.backgroundMode === 'off'}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white disabled:opacity-40"
                      >
                        <option value="auto">تلقائي</option>
                        <option value="face-priority">أولوية الوجه</option>
                        <option value="balanced">متوازن</option>
                        <option value="background-priority">إظهار الخلفية</option>
                      </select>
                    </div>
                  </div>

                  {backgroundDecision && (
                    <div className="mt-3 bg-black/20 rounded-xl border border-white/5 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-white">القرار النهائي للخلفية</span>
                        <span className="text-[9px] text-[var(--text-muted)]">
                          {isBackgroundReasoning ? 'Gemini يحلل المشهد...' : backgroundDecision.geminiApplied ? 'Gemini + Physics' : 'Physics'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-[var(--text-muted)] mb-0.5">البشر</div>
                          <div className="font-bold text-[#F3EFE7]">{BACKGROUND_DENSITY_LABELS[backgroundDecision.humanDensity]}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-[var(--text-muted)] mb-0.5">السيارات</div>
                          <div className="font-bold text-[#F3EFE7]">{BACKGROUND_DENSITY_LABELS[backgroundDecision.vehicleDensity]}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-[var(--text-muted)] mb-0.5">الفوضى</div>
                          <div className="font-bold text-[#F3EFE7]">{BACKGROUND_DISORDER_LABELS[backgroundDecision.disorderLevel]}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-[var(--text-muted)] mb-0.5">النشاط</div>
                          <div className="font-bold text-[#F3EFE7]">{BACKGROUND_ACTIVITY_LABELS[backgroundDecision.activityLevel]}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-[var(--text-muted)] mb-0.5">الحضور</div>
                          <div className="font-bold text-[#F3EFE7]">{BACKGROUND_PRESENCE_LABELS[backgroundDecision.presenceLevel]}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-[var(--text-muted)] mb-0.5">هدف اللقطة</div>
                          <div className="font-bold text-[#F3EFE7]">{BACKGROUND_GOAL_LABELS[backgroundDecision.compositionGoal]}</div>
                        </div>
                      </div>

                      {state.captureType === 'front-selfie' && state.backgroundAutoAngle && selfieAngleDecision && (
                        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] text-[var(--text-muted)]">زاوية السيلفي المرتبطة بالخلفية</span>
                            <span className="text-[10px] font-bold text-[var(--accent)]">{selfieAngleDecision.presetLabelAR}</span>
                          </div>
                          <div className="text-[9px] text-[var(--text-muted)] mt-1">
                            {backgroundDecision.angleIntent.reasonAR.slice(0, 1).join(' ')}
                          </div>
                        </div>
                      )}

                      <div className="text-[9px] leading-relaxed text-[var(--text-muted)]">
                        {backgroundDecision.decisionReasons.slice(0, 3).join(' ')}
                      </div>

                      {backgroundDecision.cappedByFraming && (
                        <div className="text-[9px] text-[#F0C77E] flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>تم تخفيض بعض اختياراتك لأن الكادر أو زاوية التصوير لا تسمح بها فعليًا.</span>
                        </div>
                      )}

                      {backgroundReasoningError && state.backgroundGeminiAssist && (
                        <div className="text-[9px] text-[#E9A6A0]">
                          {backgroundReasoningError} المحرك المحلي مستمر بدون تعطيل.
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Clothing & Attire */}
                <section className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
                   <h3 className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2.5">الملابس والمظهر</h3>
                   <select
                     value={state.outfitId}
                     onChange={e => setState({ ...state, outfitId: e.target.value })}
                     className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--accent)] mb-3"
                   >
                     {Array.from(new Set(OUTFITS.map(o => o.categoryAR))).map(cat => (
                       <optgroup key={cat} label={`── ${cat} ──`} className="bg-[#181B1E] text-[var(--accent)] font-bold">
                         {OUTFITS.filter(o => o.categoryAR === cat).map(o => (
                           <option key={o.id} value={o.id} className="bg-[var(--bg-main)] text-white font-normal py-1">
                             {o.labelAR}
                           </option>
                         ))}
                       </optgroup>
                     ))}
                   </select>

                   <div className="rounded-xl border border-white/5 bg-black/20 p-3 mb-3">
                     <div className="flex items-center justify-between mb-2.5">
                       <div>
                         <div className="text-[11px] font-bold text-white">طريقة لبس الملابس</div>
                         <div className="text-[9px] text-[var(--text-muted)] mt-0.5">الخيارات تتغير تلقائيًا حسب نوع الطقم</div>
                       </div>
                       <span className="text-[9px] text-[var(--accent)]">{selectedOutfit?.categoryAR || 'الطقم'}</span>
                     </div>

                     <div className="grid grid-cols-2 gap-2">
                       <div>
                         <label className="text-[10px] text-[var(--text-muted)] block mb-1">أسلوب اللبس</label>
                         <select value={state.outfitWearStyle} onChange={e => setState({ ...state, outfitWearStyle: e.target.value as OutfitWearStyle })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                           <option value="natural-neat">مرتب طبيعي</option>
                           <option value="very-neat">مرتب جدًا</option>
                           <option value="casual-relaxed">عفوي</option>
                           <option value="comfortable">مريح</option>
                           <option value="formal">رسمي</option>
                           <option value="home-relaxed">منزلي</option>
                           <option value="sporty">رياضي</option>
                         </select>
                       </div>

                       <div>
                         <label className="text-[10px] text-[var(--text-muted)] block mb-1">حالة القماش</label>
                         <select value={state.clothingCondition} onChange={e => setState({ ...state, clothingCondition: e.target.value as ClothingCondition })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                           <option value="crisp">مرتب ونظيف</option>
                           <option value="worn-all-day">مستخدم طوال اليوم</option>
                           <option value="vintage-washed">مستهلك طبيعيًا</option>
                         </select>
                       </div>

                       <div className="col-span-2">
                         <label className="text-[10px] text-[var(--text-muted)] block mb-1">أثر النشاط على اللبس</label>
                         <select value={state.garmentWearContext} onChange={e => setState({ ...state, garmentWearContext: e.target.value as GarmentWearContext })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                           <option value="auto">تلقائي حسب النشاط</option>
                           <option value="neutral">طبيعي ثابت</option>
                           <option value="after-sitting">بعد جلوس</option>
                           <option value="after-walking">بعد مشي</option>
                           <option value="post-workout">بعد تمرين</option>
                           <option value="light-breeze">نسيم خفيف</option>
                           <option value="light-sweat">تعرق خفيف</option>
                         </select>
                       </div>

                       {outfitCapabilities.supportsTuck && (
                         <div>
                           <label className="text-[10px] text-[var(--text-muted)] block mb-1">موضع القميص</label>
                           <select value={state.shirtTuck} onChange={e => setState({ ...state, shirtTuck: e.target.value as ShirtTuck })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                             <option value="auto">تلقائي</option>
                             <option value="tucked">داخل البنطلون</option>
                             <option value="untucked">خارج البنطلون</option>
                             <option value="half-tuck">نصف داخل</option>
                           </select>
                         </div>
                       )}

                       {outfitCapabilities.supportsSleeves && (
                         <div>
                           <label className="text-[10px] text-[var(--text-muted)] block mb-1">الأكمام</label>
                           <select value={state.sleeveStyle} onChange={e => setState({ ...state, sleeveStyle: e.target.value as SleeveStyle })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                             <option value="auto">تلقائي</option>
                             <option value="down">طبيعية للأسفل</option>
                             <option value="rolled-once">مرفوعة طية واحدة</option>
                             <option value="rolled-forearm">مرفوعة للساعد</option>
                           </select>
                         </div>
                       )}

                       {outfitCapabilities.supportsShirtButtons && (
                         <div>
                           <label className="text-[10px] text-[var(--text-muted)] block mb-1">زراير القميص</label>
                           <select value={state.shirtButtons} onChange={e => setState({ ...state, shirtButtons: e.target.value as ShirtButtons })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                             <option value="auto">تلقائي حسب الطقم</option>
                             <option value="fully-buttoned">مغلق بالكامل</option>
                             <option value="top-one-open">الزر الأول مفتوح</option>
                             <option value="top-two-open">أول زرين مفتوحين</option>
                           </select>
                         </div>
                       )}

                       {outfitCapabilities.supportsCollar && (
                         <div>
                           <label className="text-[10px] text-[var(--text-muted)] block mb-1">الياقة</label>
                           <select value={state.collarStyle} onChange={e => setState({ ...state, collarStyle: e.target.value as CollarStyle })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                             <option value="auto">تلقائي</option>
                             <option value="neat">مرتبة</option>
                             <option value="relaxed">عفوية</option>
                           </select>
                         </div>
                       )}

                       {outfitCapabilities.supportsOuterwearClosure && (
                         <div>
                           <label className="text-[10px] text-[var(--text-muted)] block mb-1">الطبقة الخارجية</label>
                           <select value={state.outerwearClosure} onChange={e => setState({ ...state, outerwearClosure: e.target.value as OuterwearClosure })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                             <option value="auto">تلقائي</option>
                             <option value="open">مفتوحة</option>
                             <option value="half-open">نصف مفتوحة</option>
                             <option value="closed">مغلقة</option>
                           </select>
                         </div>
                       )}

                       {outfitCapabilities.supportsHood && (
                         <div>
                           <label className="text-[10px] text-[var(--text-muted)] block mb-1">غطاء الهودي</label>
                           <select value={state.hoodPosition} onChange={e => setState({ ...state, hoodPosition: e.target.value as HoodPosition })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                             <option value="auto">تلقائي</option>
                             <option value="down">للخلف</option>
                             <option value="up">مرفوع على الرأس</option>
                           </select>
                         </div>
                       )}

                       {outfitCapabilities.supportsThobeCollar && (
                         <div>
                           <label className="text-[10px] text-[var(--text-muted)] block mb-1">ياقة الثوب</label>
                           <select value={state.thobeCollar} onChange={e => setState({ ...state, thobeCollar: e.target.value as ThobeCollar })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] text-white">
                             <option value="auto">تلقائي</option>
                             <option value="closed">مغلقة</option>
                             <option value="slightly-open">مفتوحة قليلًا</option>
                           </select>
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-2.5">
                     <div>
                       <label className="text-[10px] text-[var(--text-muted)] block mb-1 font-semibold">تسريحة الشعر:</label>
                       <select
                         value={state.hairStyle}
                         onChange={e => setState({ ...state, hairStyle: e.target.value })}
                         className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent)]"
                       >
                         {HAIRSTYLES.map(h => <option key={h.id} value={h.id}>{h.labelAR}</option>)}
                       </select>
                     </div>

                     <div>
                       <label className="text-[10px] text-[var(--text-muted)] block mb-1 font-semibold">تعبير الوجه:</label>
                       <select
                         value={state.expression}
                         onChange={e => setState({ ...state, expression: e.target.value })}
                         className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent)]"
                       >
                         {Array.from(new Set(EXPRESSIONS.map(e => e.categoryAR))).map(category => (
                           <optgroup key={category} label={category}>
                             {EXPRESSIONS
                               .filter(e => e.categoryAR === category)
                               .map(e => (
                                 <option key={e.id} value={e.id}>
                                   {e.labelAR}
                                 </option>
                               ))}
                           </optgroup>
                         ))}
                       </select>
                     </div>
                   </div>

                   <div className="mt-2.5">
                     <label className="text-[10px] text-[var(--text-muted)] block mb-1 font-semibold">فيزياء الشعر:</label>
                     <select
                       value={state.hairPhysicsPreset}
                       onChange={e => setState({ ...state, hairPhysicsPreset: e.target.value })}
                       className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent)]"
                     >
                       {Array.from(new Set(HAIR_PHYSICS_PRESETS.map(item => item.categoryAR))).map(category => (
                         <optgroup key={category} label={category}>
                           {HAIR_PHYSICS_PRESETS
                             .filter(item => item.categoryAR === category)
                             .map(item => (
                               <option key={item.id} value={item.id}>
                                 {item.labelAR}
                               </option>
                             ))}
                         </optgroup>
                       ))}
                     </select>
                   </div>
                </section>

                {/* Lighting and Time */}
                <section className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
                   <h3 className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2.5">الوقت ومصدر الإضاءة</h3>
                   <div className="flex flex-wrap gap-1.5 mb-3">
                      {[
                        { id: 'morning', l: 'صباح' },
                        { id: 'midday', l: 'ظهر' },
                        { id: 'afternoon', l: 'عصر' },
                        { id: 'sunset', l: 'غروب' },
                        { id: 'night', l: 'ليل' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setState({ ...state, timeOfDay: t.id as TimeOfDay })}
                          className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${state.timeOfDay === t.id ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-bold' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-white/5'}`}
                        >
                          {t.l}
                        </button>
                      ))}
                   </div>

                   <div className="flex flex-wrap gap-1.5">
                      {activeFamily?.allowedLighting.map(l => (
                        <button
                          key={l}
                          onClick={() => setState({ ...state, lightingMode: l })}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${state.lightingMode === l ? 'bg-white/10 border-white/30 text-white font-medium' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-white/5'}`}
                        >
                          {l}
                        </button>
                      ))}
                   </div>
                </section>

                {/* Environment Dynamics: Lighting Intensity & Shadow Depth Sliders */}
                <section className="bg-gradient-to-b from-[#181B1E] to-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-accent)] shadow-lg relative overflow-hidden">
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                         <Sliders className="w-3.5 h-3.5" />
                       </div>
                       <div>
                         <h3 className="font-bold text-white text-xs tracking-wide flex items-center gap-1.5">
                           <span>ديناميكية البيئة والإضاءة</span>
                           <span className="text-[10px] text-[var(--accent)] font-mono font-normal">(Environment Dynamics)</span>
                         </h3>
                         <p className="text-[10px] text-[var(--text-muted)]">معايرة ارتداد الضوء المحيطي وصلابة الظلال</p>
                       </div>
                     </div>
                     <span className="text-[10px] bg-[var(--accent)]/15 text-[var(--accent)] px-2 py-0.5 rounded-full border border-[var(--border-accent)] font-medium">
                       مضاد للتسطيح
                     </span>
                   </div>

                   <div className="space-y-4 pt-1">
                     {/* 1. Lighting Intensity Slider */}
                     <div className="bg-[var(--bg-main)]/80 p-3.5 rounded-xl border border-white/5 space-y-2.5">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Sun className="w-4 h-4 text-[#F6C365]" />
                           <div>
                             <label className="text-xs font-bold text-white block">
                               شدة الإضاءة المحيطية (Lighting Intensity)
                             </label>
                             <span className="text-[10px] text-[var(--text-muted)]">
                               ارتداد الضوء المحيطي والسطوع العام (Ambient Light Bounce)
                             </span>
                           </div>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <span className="text-xs font-mono font-extrabold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md border border-[var(--border-accent)] shadow-inner">
                             {state.lightingIntensity}%
                           </span>
                         </div>
                       </div>

                       {/* Status feedback tag */}
                       <div className="flex items-center justify-between text-[10px] bg-black/25 px-2.5 py-1.5 rounded-lg border border-white/5">
                         <span className="text-[var(--text-muted)]">حالة الارتداد المحيطي:</span>
                         <span className="font-semibold text-[var(--accent-light)]">
                           {state.lightingIntensity <= 35 && 'خافت / ارتداد ضئيل وظلال خريفية عميقة'}
                           {state.lightingIntensity > 35 && state.lightingIntensity <= 75 && 'طبيعي متوازن / ارتداد ناعم غير مباشر'}
                           {state.lightingIntensity > 75 && 'ساطع / ارتداد مشع وانعكاس قوي من الأسطح'}
                         </span>
                       </div>

                       {/* Slider Range Input */}
                       <div className="pt-1">
                         <input
                           type="range"
                           min="10"
                           max="100"
                           step="5"
                           value={state.lightingIntensity}
                           onChange={e => setState({ ...state, lightingIntensity: Number(e.target.value) })}
                           className="w-full h-2 bg-[#262B32] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] focus:outline-none"
                         />
                         <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-mono px-0.5 mt-1">
                           <span>10% (خافت)</span>
                           <span>50%</span>
                           <span>100% (ساطع)</span>
                         </div>
                       </div>

                       {/* Quick Presets */}
                       <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                         {[
                           { val: 30, label: 'خافت 30%' },
                           { val: 70, label: 'طبيعي 70%' },
                           { val: 95, label: 'ساطع 95%' }
                         ].map(preset => (
                           <button
                             key={preset.val}
                             type="button"
                             onClick={() => setState({ ...state, lightingIntensity: preset.val })}
                             className={`py-1 px-2 rounded-lg text-[10px] border transition-all ${
                               state.lightingIntensity === preset.val
                                 ? 'bg-[var(--accent)] text-black font-bold border-[var(--accent)] shadow-sm'
                                 : 'bg-white/5 border-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white'
                             }`}
                           >
                             {preset.label}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* 2. Shadow Depth Slider */}
                     <div className="bg-[var(--bg-main)]/80 p-3.5 rounded-xl border border-white/5 space-y-2.5">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Moon className="w-4 h-4 text-[#A0AEC0]" />
                           <div>
                             <label className="text-xs font-bold text-white block">
                               عمق وصلابة الظلال (Shadow Depth)
                             </label>
                             <span className="text-[10px] text-[var(--text-muted)]">
                               صلابة الحواف وتجويف الظلال (Shadow Hardness & Ambient Occlusion)
                             </span>
                           </div>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <span className="text-xs font-mono font-extrabold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md border border-[var(--border-accent)] shadow-inner">
                             {state.shadowDepth}%
                           </span>
                         </div>
                       </div>

                       {/* Status feedback tag */}
                       <div className="flex items-center justify-between text-[10px] bg-black/25 px-2.5 py-1.5 rounded-lg border border-white/5">
                         <span className="text-[var(--text-muted)]">خاصية الظلال الناتجة:</span>
                         <span className="font-semibold text-[var(--accent-light)]">
                           {state.shadowDepth <= 35 && 'ناعمة منتشرة / تدرج ضوئي لطيف'}
                           {state.shadowDepth > 35 && state.shadowDepth <= 75 && 'فيزيائية متزنة / تجاويف واقعية تحت الرقبة'}
                           {state.shadowDepth > 75 && 'عميقة وحادة / تباين عالي (Chiaroscuro)'}
                         </span>
                       </div>

                       {/* Slider Range Input */}
                       <div className="pt-1">
                         <input
                           type="range"
                           min="10"
                           max="100"
                           step="5"
                           value={state.shadowDepth}
                           onChange={e => setState({ ...state, shadowDepth: Number(e.target.value) })}
                           className="w-full h-2 bg-[#262B32] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] focus:outline-none"
                         />
                         <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-mono px-0.5 mt-1">
                           <span>10% (ناعمة)</span>
                           <span>50%</span>
                           <span>100% (حادة عميقة)</span>
                         </div>
                       </div>

                       {/* Quick Presets */}
                       <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                         {[
                           { val: 30, label: 'ناعمة 30%' },
                           { val: 60, label: 'متوازنة 60%' },
                           { val: 85, label: 'عميقة 85%' }
                         ].map(preset => (
                           <button
                             key={preset.val}
                             type="button"
                             onClick={() => setState({ ...state, shadowDepth: preset.val })}
                             className={`py-1 px-2 rounded-lg text-[10px] border transition-all ${
                               state.shadowDepth === preset.val
                                 ? 'bg-[var(--accent)] text-black font-bold border-[var(--accent)] shadow-sm'
                                 : 'bg-white/5 border-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white'
                             }`}
                           >
                             {preset.label}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* Live Physical Prompt Feedback Badge */}
                     <div className="text-[10px] bg-[#121417] p-2.5 rounded-xl border border-white/5 text-[#E0DACF] leading-relaxed font-mono">
                       <div className="flex items-center justify-between mb-1 font-sans">
                         <span className="text-[var(--accent)] font-bold flex items-center gap-1 text-[10px]">
                           <Sparkles className="w-3 h-3" />
                           <span>الصيغة الفيزيائية للإضاءة بالبرومبت:</span>
                         </span>
                         <span className="text-[9px] bg-white/5 text-[var(--text-muted)] px-1.5 py-0.5 rounded font-mono">
                           Lighting Dynamic Engine
                         </span>
                       </div>
                       <div className="text-[9.5px] text-[var(--text-muted)]">
                         <span className="text-[var(--accent-light)] font-bold">Lighting Intensity: {state.lightingIntensity}%</span>
                         {' • '}
                         <span className="text-[var(--accent-light)] font-bold">Shadow Depth: {state.shadowDepth}%</span>
                       </div>
                     </div>
                   </div>
                </section>

                {/* Randomness & Imperfections (Anti-AI slop triggers) */}
                <section className="bg-gradient-to-b from-[#1C1814] to-[var(--bg-card)] p-4 rounded-2xl border border-[#3E3424] shadow-md">
                   <div className="flex items-center justify-between mb-3.5">
                     <div className="flex items-center gap-2">
                       <Zap className="w-4 h-4 text-[var(--accent)]" />
                       <h3 className="font-bold text-[var(--accent)] text-xs tracking-wide">
                         العيوب والشوائب العضوية (Anti-AI Imperfections)
                       </h3>
                     </div>
                     <span className="text-[10px] bg-[var(--accent)]/15 text-[var(--accent)] px-2 py-0.5 rounded-full border border-[var(--border-accent)]">
                       ضروري لكسر الذكاء الاصطناعي
                     </span>
                   </div>

                   <div className="space-y-3">
                     <div>
                       <label className="text-[11px] text-[var(--text-muted)] block mb-1">حالة العدسة ومستشعر الهاتف:</label>
                       <select
                         value={state.lensCondition}
                         onChange={e => setState({ ...state, lensCondition: e.target.value as LensCondition })}
                         className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--accent)] text-white"
                       >
                         <option value="xiaomi-clean">عدسة Xiaomi 15 Ultra الأمامية النظيفة (ثابتة)</option>
                         <option value="smudged-lens">نفس عدسة Xiaomi 15 Ultra مع بصمة خفيفة واقعية</option>
                       </select>
                     </div>

                     <div>
                       <label className="text-[11px] text-[var(--text-muted)] block mb-1">حالة القماش والملبس:</label>
                       <select
                         value={state.clothingCondition}
                         onChange={e => setState({ ...state, clothingCondition: e.target.value as ClothingCondition })}
                         className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--accent)] text-white"
                       >
                         <option value="crisp">مكوي ونظيف تماماً</option>
                         <option value="worn-all-day">ملبوس طوال اليوم (طيات وجلوس واقعية)</option>
                         <option value="vintage-washed">مغسول متكرر (بهتان طفيف ونسيج غير لامع)</option>
                       </select>
                     </div>

                     <div>
                       <div className="flex items-center justify-between mb-1.5">
                         <label className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                           <CloudSun className="w-3.5 h-3.5 text-[var(--accent)]" />
                           <span>الجو والبيئة المحيطة (Atmospheric Condition):</span>
                         </label>
                         <span className="text-[10px] text-[var(--accent)] font-mono font-medium">
                           {state.atmosphericCondition === 'neutral' && 'نقاء بصري طبيعي'}
                           {state.atmosphericCondition === 'high-humidity' && 'تعرق ولمعان رطوبة'}
                           {state.atmosphericCondition === 'dusty-haze' && 'عج وغبار صحراوي'}
                           {state.atmosphericCondition === 'breezy' && 'هواء وحركة الأقمشة'}
                         </span>
                       </div>

                       {/* Interactive Atmosphere Chips */}
                       <div className="grid grid-cols-2 gap-1.5 mb-2">
                         {[
                           { id: 'neutral', label: 'طبيعي معتدل', desc: 'نقاء بدون غبار أو رطوبة', icon: Sun },
                           { id: 'high-humidity', label: 'رطوبة صيفية', desc: 'تعرق ولمعان بالجبين والأنف', icon: Droplets },
                           { id: 'dusty-haze', label: 'عج وغبار خفيف', desc: 'تشتت الضوء ودفء الصحراء', icon: Wind },
                           { id: 'breezy', label: 'هواء ونسيم', desc: 'رفرفة الثوب والشعر', icon: Wind }
                         ].map(item => {
                           const isSelected = state.atmosphericCondition === item.id;
                           const IconComponent = item.icon;
                           return (
                             <button
                               key={item.id}
                               type="button"
                               onClick={() => setState({ ...state, atmosphericCondition: item.id as AtmosphericCondition })}
                               className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                                 isSelected
                                   ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-white shadow-sm ring-1 ring-[var(--accent)]/40'
                                   : 'bg-white/5 border-[var(--border)] text-[var(--text-muted)] hover:bg-white/10'
                               }`}
                             >
                               <div className="flex items-center justify-between w-full mb-1">
                                 <div className="flex items-center gap-1.5">
                                   <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--accent)]' : 'text-white/60'}`} />
                                   <span className={`text-xs font-bold ${isSelected ? 'text-[var(--accent)]' : 'text-white/90'}`}>
                                     {item.label}
                                   </span>
                                 </div>
                                 {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>}
                               </div>
                               <span className="text-[10px] text-[var(--text-muted)] leading-tight">{item.desc}</span>
                             </button>
                           );
                         })}
                       </div>

                       <select
                         value={state.atmosphericCondition}
                         onChange={e => setState({ ...state, atmosphericCondition: e.target.value as AtmosphericCondition })}
                         className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--accent)] text-white mb-2"
                       >
                         <option value="neutral">طبيعي معتدل (Neutral - نقاء بصري طبيعي)</option>
                         <option value="high-humidity">رطوبة صيفية (High Humidity - تعرق طبيعي ولمعان بالجبين)</option>
                         <option value="dusty-haze">عج وغبار صحراوي (Dusty Haze - تشتت ضوء وتدرج دافئ)</option>
                         <option value="breezy">هواء ونسيم متحرك (Breezy - حركة طبيعية للثوب والشعر)</option>
                       </select>

                       {/* Live Atmospheric Prompt Preview Badge */}
                       <div className="text-[9.5px] bg-white/5 border border-white/5 p-2 rounded-xl text-white/80 leading-relaxed font-mono">
                         <span className="text-[var(--accent)] font-bold ml-1 font-sans">تأثير البرومبت الحي:</span>
                         {state.atmosphericCondition === 'high-humidity' && 'High ambient humidity atmosphere: visible moisture sheen on skin, subtle moisture clumping on hair tips, and soft optical light diffusion.'}
                         {state.atmosphericCondition === 'dusty-haze' && 'Airborne desert dust haze: warm earthy micro-particulate atmospheric depth, softened distant contrast, and sunlight scattering through suspended dust.'}
                         {state.atmosphericCondition === 'breezy' && 'Dynamic gentle breeze: visible wind motion catching clothing fabrics and naturally displacing loose hair strands.'}
                         {state.atmosphericCondition === 'neutral' && 'Clean natural atmospheric clarity without particulate haze or wind blur, realistic crisp depth separation.'}
                       </div>
                     </div>

                     {/* Muscle & Ocular Fatigue (حالة الإرهاق العضلي وتفاصيل العين والبشرة) */}
                     <div>
                       <div className="flex items-center justify-between mb-1.5">
                         <label className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                           <Activity className="w-3.5 h-3.5 text-[var(--accent)]" />
                           <span>حالة الإرهاق العضلي وتفاصيل العين (Muscle Fatigue):</span>
                         </label>
                         <span className="text-[10px] text-[var(--accent)] font-mono font-medium">
                           {state.muscleFatigue === 'none' && 'مرتاح / طبيعي'}
                           {state.muscleFatigue === 'heavy-eyelids' && 'إرهاق الأجفان (Heavy Eyelids)'}
                           {state.muscleFatigue === 'bloodshot-sclera' && 'احمرار العين (Bloodshot Sclera)'}
                           {state.muscleFatigue === 'pale-fatigued-skin' && 'شحوب البشرة المتعب'}
                           {state.muscleFatigue === 'full-exhaustion' && 'إرهاق شامل (Full Fatigue)'}
                         </span>
                       </div>

                       {/* Interactive Muscle Fatigue Chips */}
                       <div className="grid grid-cols-2 gap-1.5 mb-2">
                         {[
                           { id: 'none', label: 'طبيعي ومرتاح', desc: 'نقاء العينين وبشرة مسترخية', icon: Sun },
                           { id: 'heavy-eyelids', label: 'إرهاق وثقل الأجفان', desc: 'هبوط عضلي خفيف وترهل طبيعي للأجفان', icon: Eye },
                           { id: 'bloodshot-sclera', label: 'احمرار بياض العين', desc: 'شعيرات دموية دقيقة ببياض العين (إجهاد/سهر)', icon: AlertCircle },
                           { id: 'pale-fatigued-skin', label: 'شحوب البشرة المتعب', desc: 'انخفاض النضارة وهالات داكنة تحت العين', icon: Moon },
                           { id: 'full-exhaustion', label: 'إرهاق بدني شامل', desc: 'ثقل الأجفان + احمرار طفيف + شحوب مجهد', icon: Activity }
                         ].map(item => {
                           const isSelected = state.muscleFatigue === item.id;
                           const IconComponent = item.icon;
                           return (
                             <button
                               key={item.id}
                               type="button"
                               onClick={() => setState({ ...state, muscleFatigue: item.id as MuscleFatigue })}
                               className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                                 isSelected
                                   ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-white shadow-sm ring-1 ring-[var(--accent)]/40'
                                   : 'bg-white/5 border-[var(--border)] text-[var(--text-muted)] hover:bg-white/10'
                               } ${item.id === 'full-exhaustion' ? 'col-span-2' : ''}`}
                             >
                               <div className="flex items-center justify-between w-full mb-1">
                                 <div className="flex items-center gap-1.5">
                                   <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--accent)]' : 'text-white/60'}`} />
                                   <span className={`text-xs font-bold ${isSelected ? 'text-[var(--accent)]' : 'text-white/90'}`}>
                                     {item.label}
                                   </span>
                                 </div>
                                 {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>}
                               </div>
                               <span className="text-[10px] text-[var(--text-muted)] leading-tight">{item.desc}</span>
                             </button>
                           );
                         })}
                       </div>

                       <select
                         value={state.muscleFatigue}
                         onChange={e => setState({ ...state, muscleFatigue: e.target.value as MuscleFatigue })}
                         className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--accent)] text-white mb-2"
                       >
                         <option value="none">مرتاح / طبيعي (Well Rested - بشرة مستقرة ونقاء طبيعي)</option>
                         <option value="heavy-eyelids">إرهاق العين (Heavy Eyelids - ارتخاء وهبوط الأجفان العضلي الطبيعي)</option>
                         <option value="bloodshot-sclera">احمرار العين (Bloodshot Sclera - شعيرات دموية دقيقة في بياض العين)</option>
                         <option value="pale-fatigued-skin">شحوب البشرة المتعب (Pale Fatigued Skin - هالات تحت العين وشحوب طبيعي)</option>
                         <option value="full-exhaustion">إرهاق عضلي وبدني شامل (Full Fatigue - ثقل الأجفان وشحوب واحمرار خفيف)</option>
                       </select>

                       {/* Live Muscle Fatigue Prompt Preview Badge */}
                       <div className="text-[9.5px] bg-white/5 border border-white/5 p-2 rounded-xl text-white/80 leading-relaxed font-mono">
                         <span className="text-[var(--accent)] font-bold ml-1 font-sans">تأثير البرومبت على العين والبشرة:</span>
                         {state.muscleFatigue === 'heavy-eyelids' && 'Heavy eyelid fatigue: visible eyelid ptosis with weakened levator palpebrae superioris causing relaxed, heavy upper eyelids, and subtle fluid puffiness in inferior fold.'}
                         {state.muscleFatigue === 'bloodshot-sclera' && 'Bloodshot ocular sclera: realistic vascular dilation across eye whites with delicate branching red micro-capillaries winding across sclera from prolonged wakefulness.'}
                         {state.muscleFatigue === 'pale-fatigued-skin' && 'Fatigued pale skin & periorbital hollows: noticeable epidermal exhaustion pallor with decreased capillary flush, subtle sallow undertone, and authentic dark circles beneath eyes.'}
                         {state.muscleFatigue === 'full-exhaustion' && 'Full muscle & facial exhaustion: heavy drooping upper eyelids, periorbital fatigue shadows, delicate bloodshot capillaries in sclera, and a sallow depleted skin tone.'}
                         {state.muscleFatigue === 'none' && 'Well-rested muscle condition: natural ocular clarity, balanced eyelid tension, and healthy resting epidermal tone.'}
                       </div>
                     </div>

                     <div>
                       <label className="text-[11px] text-[var(--text-muted)] block mb-1">عناصر التشويش في مقدمة الكادر (Foreground Depth):</label>
                       <select
                         value={state.foregroundObstruction}
                         onChange={e => setState({ ...state, foregroundObstruction: e.target.value as ForegroundObstruction })}
                         className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--accent)] text-white"
                       >
                         <option value="clean">كادر نقي ومباشر</option>
                         <option value="through-glass">من وراء زجاج نافذة/سيارة (انعكاسات ضبابية)</option>
                         <option value="foreground-clutter">عنصر عشوائي قريب جداً من العدسة خارج الفوكس</option>
                       </select>
                     </div>
                   </div>
                </section>

                {/* Realism Style engine */}
                <section className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
                   <h3 className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">نمط معالجة التوليد</h3>
                   <select
                     value={state.realismStyle}
                     onChange={e => setState({ ...state, realismStyle: e.target.value as RealismStyle })}
                     className="w-full bg-[var(--bg-main)] border border-[var(--border-accent)] text-[var(--accent)] text-xs rounded-xl p-3 font-bold focus:outline-none cursor-pointer"
                   >
                      <option value="anti-ai-raw">🚀 خام مضاد للاكتشاف المباشر (Anti-AI Raw - موصى به)</option>
                      <option value="raw-candid">واقعي طبيعي (Raw Candid)</option>
                      <option value="cinematic-realism">واقعي سينمائي (Cinematic - قد يميل للذكاء الاصطناعي)</option>
                   </select>
                </section>

             </div>
          )}
        </div>

        {/* Floating Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-[var(--bg-main)]/95 backdrop-blur-md border-t border-[var(--border)] pb-[calc(1rem+env(safe-area-inset-bottom))] z-30">
           {state.sceneFamily && (
             <div className="flex justify-between items-center mb-2.5 px-1">
               <div className="text-[11px] text-[var(--text-muted)] truncate max-w-[200px]">
                 {activeFamily?.labelAR} • {state.subScene}
               </div>
               <div className="flex items-center gap-2">
                 <button
                   onClick={handleAuditRealism}
                   className="text-[11px] text-[#7CB68B] hover:text-[#9cd4aa] font-medium flex items-center gap-1 transition-colors"
                   title="فحص جودة الواقعية بـ Gemini"
                 >
                   <ShieldCheck className="w-3.5 h-3.5" />
                   <span>فحص الواقعية</span>
                 </button>
                 <button
                   onClick={handleSavePreset}
                   aria-label="حفظ كقالب"
                   className="text-[11px] text-[var(--accent)] font-medium hover:text-[#e0c496] flex items-center gap-1 transition-colors"
                 >
                   <Bookmark className="w-3 h-3" />
                   <span>حفظ كقالب</span>
                 </button>
               </div>
             </div>
           )}

           <div className="flex gap-2">
             <button
               onClick={() => applyCuratedVibe('random')}
               className="flex-1 py-3 rounded-xl border border-[var(--border-accent)] text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
             >
               <Dices className="w-3.5 h-3.5" />
               <span>خلطة ذكية 🎲</span>
             </button>

             <button
               disabled={!state.sceneFamily}
               onClick={() => setShowPromptSheet(true)}
               className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#dab985] text-black text-xs font-extrabold shadow-[0_0_15px_rgba(198,168,117,0.25)] hover:opacity-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 active:scale-98"
             >
               <Sparkles className="w-4 h-4" />
               <span>عرض البرومبت الذكي</span>
             </button>
           </div>
        </div>

        {/* Prompt Sheet Modal */}
        {showPromptSheet && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-md mx-auto">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPromptSheet(false)}></div>
            <div className="relative bg-[var(--bg-card)] w-full h-[88vh] rounded-t-3xl border-t border-white/15 flex flex-col shadow-2xl animate-[slideUp_0.25s_ease-out]">

               {/* Modal Header */}
               <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <div className="flex gap-3">
                     <button
                       onClick={() => { setActiveTab('chatgpt'); setUseEnhancedPrompt(false); }}
                       className={`text-xs font-bold pb-1.5 border-b-2 transition-colors ${activeTab === 'chatgpt' ? 'border-[var(--accent)] text-white' : 'border-transparent text-[var(--text-muted)]'}`}
                     >
                       ChatGPT (DALL-E)
                     </button>
                     <button
                       onClick={() => { setActiveTab('gemini'); setUseEnhancedPrompt(false); }}
                       className={`text-xs font-bold pb-1.5 border-b-2 transition-colors ${activeTab === 'gemini' ? 'border-[var(--accent)] text-white' : 'border-transparent text-[var(--text-muted)]'}`}
                     >
                       Gemini / Imagen
                     </button>
                     <button
                       onClick={() => setActiveTab('negative')}
                       className={`text-xs font-bold pb-1.5 border-b-2 transition-colors ${activeTab === 'negative' ? 'border-red-400 text-red-200' : 'border-transparent text-[var(--text-muted)]'}`}
                     >
                       Negative (MJ/Flux)
                     </button>
                  </div>

                  <button
                    onClick={() => setShowPromptSheet(false)}
                    aria-label="إغلاق"
                    className="text-[var(--text-muted)] p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
               </div>

               {/* Gemini AI Enhancement Bar */}
               {activeTab !== 'negative' && (
                 <div className="px-4 py-2.5 bg-[#141618] border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="text-[11px] text-[var(--text-muted)]">معالجة الدقة الفائقة:</span>
                     {useEnhancedPrompt && (
                       <span className="text-[10px] bg-[var(--accent)]/15 text-[var(--accent)] px-2 py-0.5 rounded-full font-bold">
                         مفعّل بـ Gemini ✨
                       </span>
                     )}
                   </div>

                   <button
                     onClick={() => handleEnhancePrompt(activeTab)}
                     disabled={isEnhancingPrompt}
                     className="text-[11px] text-[var(--accent)] hover:text-[#e0c496] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 px-2.5 py-1 rounded-lg border border-[var(--border-accent)] flex items-center gap-1 font-semibold disabled:opacity-50 transition-colors"
                   >
                     {isEnhancingPrompt ? (
                       <>
                         <RefreshCw className="w-3 h-3 animate-spin" />
                         <span>جارِ التعزيز...</span>
                       </>
                     ) : (
                       <>
                         <Sparkles className="w-3 h-3" />
                         <span>تعزيز التفاصيل الميكروسكوبية</span>
                       </>
                     )}
                   </button>
                 </div>
               )}

               {/* Textarea Viewport */}
               <div className="flex-1 overflow-y-auto p-4 relative" dir="ltr">
                  <textarea
                    readOnly
                    className="w-full h-full bg-transparent text-[#F3EFE7] text-[12px] leading-relaxed resize-none rounded-lg p-2 font-mono outline-none selection:bg-[var(--accent)] selection:text-black"
                    value={currentDisplayPrompt}
                  />
               </div>

               {/* Action Footer */}
               <div className="p-4 border-t border-white/10 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex gap-2">
                  <button
                    onClick={() => angleExportReady ? copyToClipboard(currentDisplayPrompt) : showToast('تعذر نسخ البرومبت: أدلة زاوية الكاميرا غير كافية')}
                    className="flex-1 py-3 bg-[var(--accent)] hover:bg-[#d6b783] text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                  >
                    <Copy className="w-4 h-4" />
                    <span>نسخ البرومبت الكامل</span>
                  </button>

                  <button
                    onClick={handleAuditRealism}
                    className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="فحص البرومبت"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#7CB68B]" />
                    <span>تقييم</span>
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* AI Face Analysis Modal */}
        {showFaceAnalysisModal && faceAnalysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center max-w-md mx-auto p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowFaceAnalysisModal(false)}></div>
            <div className="relative bg-[var(--bg-card)] w-full max-h-[85vh] rounded-2xl border border-[var(--border-accent)] flex flex-col shadow-2xl p-5 overflow-hidden animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
                    <ScanFace className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">تحليل ملامح الوجه الذكي</h3>
                    <p className="text-[10px] text-[var(--accent)]">تم الفحص بواسطة Gemini</p>
                  </div>
                </div>
                <button onClick={() => setShowFaceAnalysisModal(false)} className="text-[var(--text-muted)] hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                <div className="bg-[#131518] p-3 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-[var(--accent)] mb-1">الملخص التشريحي:</h4>
                  <p className="text-xs text-[#E1DDD5] leading-relaxed">{faceAnalysis.arabicSummary}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <Glasses className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">النظارات: </span>
                      <span className="text-[var(--text-muted)]">{faceAnalysis.glassesDescription || 'نظارات طبية داكنة مثبتة'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <Layers className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">الشعر واللحية: </span>
                      <span className="text-[var(--text-muted)]">{faceAnalysis.hairDescription} • {faceAnalysis.facialHairDescription}</span>
                    </div>
                  </div>
                </div>

                {faceAnalysis.antiAiTips && faceAnalysis.antiAiTips.length > 0 && (
                  <div className="bg-[#1C1814] p-3 rounded-xl border border-[#3E3424]">
                    <h4 className="text-xs font-bold text-[var(--accent)] mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>نصائح Gemini لمنع كشف الـ AI:</span>
                    </h4>
                    <ul className="space-y-1">
                      {faceAnalysis.antiAiTips.map((tip, idx) => (
                        <li key={idx} className="text-[11px] text-[#D8D2C6] flex items-start gap-1.5">
                          <span className="text-[var(--accent)] font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setState(prev => ({ ...prev, customIdentityPrompt: faceAnalysis.identityLockPrompt }));
                      setShowFaceAnalysisModal(false);
                      showToast('تم تطبيق قفل الهوية الدقيق في البرومبت');
                    }}
                    className="w-full py-2.5 bg-[var(--accent)] text-black rounded-xl text-xs font-bold hover:bg-[#d6b783] transition-colors"
                  >
                    تطبيق صياغة الهوية الذكية في كل البرومبتات
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Scene Director Modal */}
        {showDirectorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center max-w-md mx-auto p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDirectorModal(false)}></div>
            <div className="relative bg-[var(--bg-card)] w-full max-h-[90vh] rounded-2xl border border-[var(--border-accent)] flex flex-col shadow-2xl p-5 overflow-hidden animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">المخرج الذكي (AI Director)</h3>
                    <p className="text-[10px] text-[var(--text-muted)]">إخراج سيناريو واقعي فيزيائي بلمسة سعودية أصيلة</p>
                  </div>
                </div>
                <button onClick={() => setShowDirectorModal(false)} className="text-[var(--text-muted)] hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                    ما الفكرة أو الجو الذي تريده؟ (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={directorVibeInput}
                    onChange={e => setDirectorVibeInput(e.target.value)}
                    placeholder="مثال: بعد انتهاء المناوبة وراجع بالسيارة المغربية، أو جلسة في مقهى حي سكني بالثوب الكحلي..."
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--accent)] resize-none"
                  />
                </div>

                <button
                  onClick={handleDirectScene}
                  disabled={isDirectingScene}
                  className="w-full py-3 bg-[var(--accent)] text-black rounded-xl text-xs font-bold hover:bg-[#d6b783] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  {isDirectingScene ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>المخرج يقوم بابتكار وتنسيق المشهد...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>ابتكار سيناريو واقعي متكامل (Gemini)</span>
                    </>
                  )}
                </button>

                {directedScene && (
                  <div className="bg-[#141618] p-4 rounded-xl border border-[var(--border-accent)] space-y-3 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider block mb-0.5">القصة والدافع للالتقاط:</span>
                      <p className="text-xs text-[#E5E0D8] leading-relaxed font-medium">{directedScene.storyAR}</p>
                    </div>

                    <div className="bg-[#1F1A14] p-3 rounded-lg border border-[#3E3424]">
                      <span className="text-[10px] font-bold text-[var(--accent)] block mb-0.5">ملاحظة المخرج لكسر الـ AI:</span>
                      <p className="text-[11px] text-[#C9C2B5]">{directedScene.directorNoteAR}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)] pt-1">
                      <div>الموقع: <span className="text-white font-medium">{SCENE_FAMILIES[directedScene.sceneFamily]?.labelAR}</span></div>
                      <div>الزاوية: <span className="text-white font-medium">{directedScene.subScene}</span></div>
                      <div>الزي: <span className="text-white font-medium">{OUTFITS.find(o => o.id === directedScene.outfitId)?.labelAR}</span></div>
                      <div>الوقت: <span className="text-white font-medium">{directedScene.timeOfDay}</span></div>
                    </div>

                    <button
                      onClick={applyDirectedScene}
                      className="w-full py-2.5 bg-gradient-to-r from-[var(--accent)] to-[#dab985] text-black rounded-xl text-xs font-extrabold hover:opacity-95 transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>اعتماد هذا المشهد وتطبيقه في التطبيق</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Realism Audit Modal */}
        {showAuditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center max-w-md mx-auto p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAuditModal(false)}></div>
            <div className="relative bg-[var(--bg-card)] w-full max-h-[85vh] rounded-2xl border border-[var(--border-accent)] flex flex-col shadow-2xl p-5 overflow-hidden animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#52c41a]/20 text-[#7CB68B] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">فحص الواقعية ومكافحة نمطية الـ AI</h3>
                    <p className="text-[10px] text-[var(--text-muted)]">تدقيق نوعي بواسطة Gemini + تحقق فيزيائي محلي</p>
                  </div>
                </div>
                <button onClick={() => setShowAuditModal(false)} className="text-[var(--text-muted)] hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {auditError && (
                  <div className="bg-[#211715] border border-[#5A302B] p-3 rounded-xl text-xs text-[#F0B6AE] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{auditError}</span>
                  </div>
                )}

                {isAuditing && !auditResult ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin mb-3" />
                    <p className="text-xs text-white font-medium">جاري فحص التناسق الفيزيائي وكواشف الـ AI...</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">يتم التحقق من اتجاهات الظلال، شوائب العدسة، ومسام الجلد.</p>
                  </div>
                ) : auditResult ? (
                  <div className="space-y-4 animate-fade-in">
                    {isAuditing && (
                      <div className="bg-[#14181B] border border-white/10 p-2.5 rounded-xl text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-[var(--accent)] animate-spin" />
                        <span>النتيجة المحلية جاهزة، جاري إضافة تدقيق Gemini...</span>
                      </div>
                    )}

                    {/* Score Card */}
                    <div className="bg-[#14181B] p-4 rounded-xl border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {auditResult.scoreMode === 'composite' ? 'مقياس الواقعية الإجمالي' : 'مقياس الاتساق الفيزيائي المحلي'}
                        </div>
                        <div className="text-lg font-extrabold text-white mt-0.5">{auditResult.verdictAR}</div>
                        {(typeof auditResult.localScore === 'number' || typeof auditResult.geminiScore === 'number') && (
                          <div className="text-[10px] text-[var(--text-muted)] mt-1">
                            {typeof auditResult.localScore === 'number' && <span>محلي {auditResult.localScore}%</span>}
                            {typeof auditResult.localScore === 'number' && typeof auditResult.geminiScore === 'number' && <span> • </span>}
                            {typeof auditResult.geminiScore === 'number' && <span>Gemini {auditResult.geminiScore}%</span>}
                          </div>
                        )}
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-[var(--accent)] flex items-center justify-center font-black text-xl text-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_12px_var(--accent-glow)]">
                        {auditResult.realismScore}%
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="bg-[#131B15] p-3.5 rounded-xl border border-[#24422A]">
                      <h4 className="text-xs font-bold text-[#7CB68B] mb-2 flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>نقاط القوة الفيزيائية:</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {auditResult.strengthsAR.map((item, idx) => (
                          <li key={idx} className="text-xs text-[#D1E7D5] flex items-start gap-2">
                            <span className="text-[#7CB68B] font-bold">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    {auditResult.recommendationsAR && auditResult.recommendationsAR.length > 0 && (
                      <div className="bg-[#1B1914] p-3.5 rounded-xl border border-[#483B28]">
                        <h4 className="text-xs font-bold text-[var(--accent)] mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>نصائح لرفع الواقعية:</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {auditResult.recommendationsAR.map((rec, idx) => (
                            <li key={idx} className="text-xs text-[#E2DACB] flex items-start gap-2">
                              <span className="text-[var(--accent)]">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Auto-Fix Status Banner */}
                    {autoFixMessage && (
                      <div className="bg-[#131B15] border border-[#24422A] p-2.5 rounded-xl text-center text-xs font-medium text-[#7CB68B] flex items-center justify-center gap-1.5 animate-fade-in">
                        <Check className="w-3.5 h-3.5 text-[#7CB68B]" />
                        <span>{autoFixMessage}</span>
                      </div>
                    )}

                    {/* Auto-Fix Primary Action Button */}
                    <button
                      onClick={handleAutoFix}
                      disabled={isAutoFixing}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-[var(--accent)] to-[#e8cda1] hover:brightness-105 active:scale-[0.98] text-black rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_var(--accent-glow)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {autoFixStatus === 'processing' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                          <span>جارٍ التصحيح...</span>
                        </>
                      ) : autoFixStatus === 'success' ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5] text-black" />
                          <span>تم التصحيح ✓</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-black" />
                          <span>تحليل المشهد وإصلاحه</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowAuditModal(false)}
                      className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      إغلاق التقرير
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Presets Sheet Modal */}
        {showPresetsSheet && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-md mx-auto">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPresetsSheet(false)}></div>
            <div className="relative bg-[var(--bg-card)] w-full max-h-[75vh] rounded-t-3xl border-t border-white/10 flex flex-col shadow-2xl animate-[slideUp_0.25s_ease-out]">
               <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-sm font-bold text-white">القوالب والسيناريوهات المحفوظة</h3>
                  </div>
                  <button onClick={() => setShowPresetsSheet(false)} aria-label="إغلاق" className="text-[var(--text-muted)] p-1.5 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-4 h-4" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-4">
                  {presets.length === 0 ? (
                    <div className="text-center text-[var(--text-muted)] py-12 text-xs">
                      لا يوجد قوالب محفوظة حالياً. اضغط على "حفظ كقالب" في أي سيناريو لحفظه هنا.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {presets.map(preset => (
                        <div key={preset.id} className="bg-[var(--bg-hover)] border border-white/5 p-3.5 rounded-xl flex justify-between items-center hover:border-[var(--border-accent)] transition-all">
                           <div className="flex-1 cursor-pointer" onClick={() => { setState(preset.state); setShowPresetsSheet(false); showToast(`تم تحميل: ${preset.name}`); }}>
                             <h4 className="font-bold text-xs text-white mb-0.5">{preset.name}</h4>
                             <p className="text-[11px] text-[var(--text-muted)]">
                               {preset.state.captureType} • {preset.state.subScene || 'عام'} • {preset.state.timeOfDay}
                             </p>
                           </div>
                           <button
                             onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                             aria-label="حذف"
                             className="text-red-400/80 p-2 hover:bg-white/5 rounded-lg transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
