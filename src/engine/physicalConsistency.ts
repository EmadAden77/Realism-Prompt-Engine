/**
 * Causal scene constraints, intentionally separate from text-generation models.
 * Coordinates are TOPOLOGICAL, not a manufactured dimensioned CAD model:
 * x grows toward vehicle right; y grows forward; z grows upward.
 * Numeric camera calculations run only when their physical inputs are supplied.
 */
import type { SceneState } from './physicsEngine';
import { isCarExteriorSubScene, carSeatView } from './carReality';
import { getClothingOutfit } from '../data/clothingOutfits';

export type ConstraintSeverity = 'BLOCKER' | 'ERROR' | 'WARNING' | 'INFO';
export interface ConstraintIssue {
  code: string;
  severity: ConstraintSeverity;
  messageAR: string;
  fields: string[];
  suggestedRepair?: string;
}
export interface PhysicalCalibration {
  upperArmCm?: number;
  forearmCm?: number;
  lensBeyondWristCm?: number;
  shoulderToEyeCm?: number;
  cameraToFaceCm?: number;
  elbowFlexionDeg?: number;
  sensorWidthMm?: number;
  opticalFocalMm?: number;
  equivalentFocalMm?: number;
  apertureF?: number;
}
export type RangeRoverModel = 'l494-2017' | 'l494-2022';
export interface SceneConstraintInput extends SceneState {
  vehicleModel?: RangeRoverModel;
  vehicleMotion?: 'parked' | 'moving' | 'unknown';
  selfieCalibration?: PhysicalCalibration;
  portraitModeEnabled?: boolean;
  bodyHeightCm?: number;
  bodyMassKg?: number;
}

export const VEHICLE_LOCAL_TOPOLOGY = {
  axes: { x: 'vehicle right +', y: 'vehicle forward +', z: 'up +' },
  anchors: {
    driverSeat: { x: -1, y: 0, z: 0 },
    passengerSeat: { x: 1, y: 0, z: 0 },
    steeringWheel: { x: -1, y: 1, z: 1 },
    centerConsole: { x: 0, y: 0.5, z: 0.5 },
    driverDoor: { x: -2, y: 0, z: 0 },
    passengerDoor: { x: 2, y: 0, z: 0 },
    windshield: { x: 0, y: 2, z: 1.5 },
    headliner: { x: 0, y: 0, z: 2 },
    rearviewMirror: { x: 0, y: 1.9, z: 1.7 },
  },
  note: 'Signed relative topology only; these values are NOT coordinates in metres.'
} as const;

export type VisualRegion = 'head' | 'shoulders' | 'upper-torso' | 'waist' | 'thighs' | 'feet';
export interface SceneConstraintReport {
  issues: ConstraintIssue[];
  corrections: string[];
  hasBlocker: boolean;
  model: RangeRoverModel | null;
  seat: 'driver' | 'front-passenger' | 'rear-passenger' | 'front-center' | null;
  visualRegions: VisualRegion[];
  optics: {
    horizontalFovDeg: number | null;
    opticalFocalMm: number | null;
    equivalentFocalMm: number | null;
    status: 'derived-from-inputs' | 'insufficient-calibration';
  };
  reach: {
    maximumFromShoulderCm: number | null;
    necessaryMinimumFromShoulderCm: number | null;
    status: 'bounded-from-inputs' | 'insufficient-calibration';
  };
  lighting: { phoneScreenOnly: boolean; sourceModel: string; evidence: 'selected-preset-not-measurement' };
  knownUnknowns: string[];
}

const finitePositive = (x: unknown): x is number =>
  typeof x === 'number' && Number.isFinite(x) && x > 0;
const radians = (degree: number): number => degree * Math.PI / 180;
const degrees = (radian: number): number => radian * 180 / Math.PI;
const round = (n: number, places = 1): number =>
  Number(n.toFixed(places));

export function visibleRegions(framing: SceneState['framing']): VisualRegion[] {
  if (framing === 'head-shoulders') return ['head','shoulders'];
  if (framing === 'chest-up') return ['head','shoulders','upper-torso'];
  return ['head','shoulders','upper-torso','waist'];
}

/** Avoid prescribing trousers, thighs or a belt in a head-and-shoulders shot. */
export function compileVisibleWardrobe(
  state: SceneState,
  fullDescription: string
): { visiblePrompt: string; fullSelection: string; hiddenRegions: string[] } {
  const crop = visibleRegions(state.framing);
  const hiddenRegions = ['thighs','feet'];
  if (!crop.includes('waist')) hiddenRegions.push('waist and belt');
  if (state.framing === 'half-body') {
    return {
      visiblePrompt: fullDescription.replace(/\s+/g,' ').trim(),
      fullSelection: fullDescription,
      hiddenRegions
    };
  }
  let top = '';
  try {
    const outfit = getClothingOutfit(state.outfitId);
    const description = outfit?.promptDescription || '';
    top = description
      .split(/\s+paired with\s+|\s+matched with\s+|\s+and\s+(?:tailored |straight |dark |light )?(?:trousers|pants|jeans|shorts)\b/i)[0]
      .replace(/,\s*(?:(?:medium|light|dark|deep|warm|tailored|straight|grey|navy|blue|black|beige|khaki|cotton|\w+-\w+)\s+){0,5}(?:trousers|pants|jeans|shorts)\b.*$/i, '');
  } catch (_) {
    // No manufactured wardrobe attributes when the outfit is missing.
  }
  if (!top || top === state.outfitId) {
    top = fullDescription.split(/\s+paired with\s+/i)[0].split(/\.\s+LOCKED COMPLETE OUTFIT/i)[0];
  }
  if (top.length > 230) top = top.slice(0,230).replace(/\s+\S*$/,'');
  return {
    visiblePrompt: 'Visible upper garment: ' + top.trim()
      + '. Keep the selected complete outfit unchanged outside the visible crop.',
    fullSelection: fullDescription,
    hiddenRegions
  };
}

export function resolvePhysicalConstraints(state: SceneConstraintInput): SceneConstraintReport {
  const issues: ConstraintIssue[] = [];
  const corrections: string[] = [];
  const unknowns: string[] = [];
  const add = (code: string, severity: ConstraintSeverity, messageAR: string, fields: string[], suggestedRepair?: string) =>
    issues.push({ code, severity, messageAR, fields, suggestedRepair });
  const insideCar = state.sceneFamily === 'car' && !isCarExteriorSubScene(state.subScene);
  const seat = insideCar ? carSeatView(state.subScene, state.pose) : null;
  const model = state.sceneFamily === 'car' ? (state.vehicleModel || 'l494-2017') : null;
  const calibration = state.selfieCalibration;
  const frontSelfie = state.captureType === 'front-selfie';

  if (insideCar && state.vehicleMotion === 'moving' && seat === 'driver' && frontSelfie) {
    add('MOTION_DRIVER_SELFIE', 'BLOCKER', 'لا يمكن للسائق تصوير سيلفي محمول أثناء الحركة.',
      ['captureType','vehicleMotion'], 'التوقف بأمان أو التحويل إلى تصوير بكاميرا مثبتة دون استخدام السائق للهاتف.');
  }
  if (insideCar && state.vehicleMotion === 'moving' && seat === 'driver'
    && /(?:holding|using|checking)\s+(?:the\s+)?phone|يمسك الهاتف|يصور نفسه/i.test(state.pose + ' ' + state.activity)) {
    add('MOVING_DRIVER_DISTRACTION', 'BLOCKER', 'وضعية السائق أثناء الحركة تتضمن انشغال اليد بالهاتف.',
      ['pose','activity','vehicleMotion'], 'استخدم وضعية القيادة بيدين على المقود أو اجعل السيارة متوقفة.');
  }
  if (frontSelfie && /(?:fully extended arm|fully straight arm|ذراع ممدود(?:ة)? بالكامل)/i.test(state.pose)
    && /(?:90.degree elbow|elbow bent 90|كوع.*90|المرفق.*90)/i.test(state.pose)) {
    add('ELBOW_EXTENSION_CONFLICT', 'BLOCKER', 'الذراع الممدودة بالكامل لا تتوافق مع ثني الكوع 90 درجة.',
      ['pose'], 'اختر وضعية واحدة متوافقة.');
  }
  if (state.captureType === 'mirror-selfie' && insideCar &&
    !/(?:mirror|مرآة|مرايا)/i.test(state.subScene + ' ' + state.pose)) {
    add('MIRROR_NOT_ESTABLISHED', 'WARNING',
      'سيلفي المرآة داخل السيارة يتطلب مرآة فعلية ومسار انعكاس ممكن.',
      ['captureType','subScene'], 'حدد مرآة الشمسية أو المرآة الداخلية وموقع الكاميرا.');
  }

  const upper = calibration?.upperArmCm;
  const forearm = calibration?.forearmCm;
  const beyond = calibration?.lensBeyondWristCm;
  const shoulderEye = calibration?.shoulderToEyeCm;
  const faceDistance = calibration?.cameraToFaceCm;
  const maxReach = finitePositive(upper) && finitePositive(forearm) && typeof beyond === 'number' && beyond >= 0
    ? upper + forearm + beyond : null;
  // Triangle inequality: shoulder-camera distance >= |eye-camera - shoulder-eye|.
  const requiredMin = finitePositive(faceDistance) && finitePositive(shoulderEye)
    ? Math.abs(faceDistance - shoulderEye) : null;
  if (frontSelfie && maxReach !== null && requiredMin !== null && requiredMin > maxReach + 0.01) {
    add('SELFIE_REACH_IMPOSSIBLE', 'BLOCKER', 'موقع العدسة خارج أقصى مدى وصول للذراع وفق القياسات المقدمة.',
      ['selfieCalibration'], 'قلّل مسافة العدسة أو صحّح القياسات.');
  }
  if (calibration?.elbowFlexionDeg !== undefined) {
    const flex = calibration.elbowFlexionDeg;
    if (!Number.isFinite(flex) || flex < 0 || flex > 150) {
      add('ELBOW_ANGLE_INVALID','ERROR','زاوية المرفق خارج نطاق الضبط المقبول.',
        ['selfieCalibration.elbowFlexionDeg']);
    } else if (/(?:fully extended|ممدود(?:ة)? بالكامل)/i.test(state.pose) && flex > 15) {
      add('ELBOW_EXTENSION_CALIBRATION','BLOCKER','الذراع الممدودة تتعارض مع زاوية ثني الكوع المدخلة.',
        ['pose','selfieCalibration.elbowFlexionDeg']);
    }
  }
  if (frontSelfie && (maxReach === null || requiredMin === null)) {
    unknowns.push('Actual arm-to-camera reach cannot be verified without measured limb and camera geometry.');
  }

  const s = calibration?.sensorWidthMm, f = calibration?.opticalFocalMm;
  const equiv = calibration?.equivalentFocalMm;
  let horizontalFovDeg: number | null = null;
  if (finitePositive(s) && finitePositive(f)) {
    horizontalFovDeg = round(degrees(2 * Math.atan(s / (2*f))),2);
    if (horizontalFovDeg < 10 || horizontalFovDeg > 150) {
      add('OPTICS_EXTREME_FOV','WARNING','زاوية الرؤية المحسوبة غير معتادة؛ تحقق من أبعاد المستشعر والعدسة.',
        ['selfieCalibration.sensorWidthMm','selfieCalibration.opticalFocalMm']);
    }
    if (finitePositive(equiv)) {
      const implied = f * (36 / s);
      if (Math.abs(implied-equiv) / equiv > 0.12) {
        add('FOCAL_EQUIVALENCE_CONFLICT','ERROR','الطول البؤري المكافئ لا يتسق مع طول العدسة الحقيقي وعرض المستشعر.',
          ['selfieCalibration.equivalentFocalMm'], 'تأكد أن المكافئ محسوب وفق زاوية الرؤية الأفقية.');
      }
    }
  } else {
    unknowns.push('Optical field of view not calibrated: sensor width and actual optical focal length are required.');
  }
  if (frontSelfie && state.portraitModeEnabled === false && /(?:cinematic bokeh|extreme shallow depth|dslr blur)/i.test(state.pose)) {
    add('UNJUSTIFIED_BOKEH','WARNING','عزل الخلفية السينمائي غير مدعوم في وضع السيلفي الطبيعي.',
      ['portraitModeEnabled','pose']);
  }
  if (state.framing !== 'half-body' && /(?:belt buckle|waistband|thigh|knee|إبزيم|الفخذ|الركبة)/i.test(state.pose)) {
    corrections.push('Framing hides waist/thigh details; invisible wardrobe instructions are omitted from the image prompt.');
    add('CROP_VISIBILITY','WARNING','بعض التفاصيل المطلوبة خارج القصّة الحالية.',
      ['framing','pose'], 'اختر نصف الجسم إذا كانت تفاصيل الخصر مطلوبة.');
  }

  const lightMode = state.lightingMode || '';
  const phoneScreenOnly = /(?:إضاءة شاشة الهاتف فقط|فلاش الشاشة الأمامية فقط|phone.screen.only|screen.only)/i.test(lightMode);
  if (phoneScreenOnly && state.timeOfDay !== 'night') {
    add('SCREEN_ONLY_DAYLIGHT_CONFLICT','WARNING','الشاشة ليست مصدر الضوء الوحيد نهارًا.',
      ['lightingMode','timeOfDay']);
  }
  if (phoneScreenOnly && state.captureType === 'third-person-candid') {
    add('SCREEN_LIGHT_CAPTURE_CONFLICT','WARNING','إضاءة الشاشة وحدها تحتاج وضعًا معروفًا للهاتف واتجاهه.',
      ['captureType','lightingMode']);
  }
  if (model === 'l494-2022' && /(?:2017|pre.facelift)/i.test(state.activity + ' ' + state.pose)) {
    add('VEHICLE_MODEL_CONFLICT','ERROR','الوصف الحر يخلط موديل 2017 مع موديل 2022.',
      ['vehicleModel','activity','pose']);
  }
  if (model === 'l494-2017' && /(?:touch pro duo|dual.touchscreen)/i.test(state.activity + ' ' + state.pose)) {
    add('VEHICLE_MODEL_CONFLICT','ERROR','المقصورة القديمة لا يجب أن ترث نظام شاشتَي 2022.',
      ['vehicleModel','activity','pose']);
  }
  return {
    issues,
    corrections,
    hasBlocker: issues.some(issue => issue.severity === 'BLOCKER' || issue.severity === 'ERROR'),
    model,
    seat,
    visualRegions:visibleRegions(state.framing),
    optics: { horizontalFovDeg, opticalFocalMm:f ?? null,equivalentFocalMm:equiv ?? null,
      status:horizontalFovDeg === null?'insufficient-calibration':'derived-from-inputs' },
    reach: { maximumFromShoulderCm:maxReach, necessaryMinimumFromShoulderCm:requiredMin,
      status:maxReach===null||requiredMin===null?'insufficient-calibration':'bounded-from-inputs' },
    lighting: { phoneScreenOnly,sourceModel:phoneScreenOnly?'extended OLED display emitter':'selected location fixture / daylight',
      evidence:'selected-preset-not-measurement' },
    knownUnknowns: unknowns
  };
}
