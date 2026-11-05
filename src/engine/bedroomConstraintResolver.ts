/**
 * Bedroom capture constraints. Only explicitly provided facts are treated as facts.
 * All unsupported clinical/photometric quantities are deliberately omitted.
 */
export type Hand = 'left' | 'right';
export type Occupancy = 'holding_phone' | 'touching_hair' | 'resting' | 'supporting_body' | 'holding_object' | 'interacting_with_environment' | 'free';
export type CameraModule = 'front' | 'rear_main' | 'rear_ultrawide' | 'rear_telephoto';
export type Confidence = 'verified' | 'estimated' | 'unknown';

export interface BedroomCaptureConfig {
  holdingHand: Hand;
  hands: Record<Hand, Occupancy>;
  microGesture?: 'hair_touch' | 'none';
  camera: { deviceId: string; module: CameraModule; lensToFaceCm?: number };
  body: { heightCm?: number; weightKg?: number; type?: string };
  pose: 'supine' | 'left_side' | 'right_side' | 'reclined' | 'semi_reclined' | 'prone' | 'sitting' | 'headboard_sitting' | 'elbow_supported' | 'pillow_supported';
  pillow: 'fiber' | 'foam' | 'none';
  mattress: 'soft' | 'medium' | 'firm';
  lighting: { mode: 'phone_screen_only' | 'room_lighting'; activeSources: string[]; lampVisible?: boolean; lampOn?: boolean; dustBeam?: boolean };
  clothing?: { top?: string; bottom?: string; fabric?: string; fit?: string; fullOutfitRequired?: boolean };
  framing?: 'head-shoulders' | 'chest-up' | 'half-body';
}

export interface CameraSpecification {
  deviceId: string;
  cameraPosition: 'front' | 'rear';
  moduleId: CameraModule;
  equivalentFocalLengthMm?: number;
  physicalFocalLengthMm?: number;
  apertureFNumber?: number;
  sensorWidthMm?: number;
  sensorHeightMm?: number;
  provenance: string;
  verificationStatus: Confidence;
}
export const CAMERA_SPECIFICATIONS: readonly CameraSpecification[] = [
  { deviceId: 'iPhone 15 Pro', cameraPosition: 'front', moduleId: 'front', provenance: 'Apple public TrueDepth specifications; sensor geometry not independently verified', verificationStatus: 'unknown' },
  { deviceId: 'iPhone 15 Pro', cameraPosition: 'rear', moduleId: 'rear_main', provenance: 'Apple public rear-camera specifications; no sensor assumptions', verificationStatus: 'unknown' },
  { deviceId: 'Xiaomi 15 Ultra', cameraPosition: 'front', moduleId: 'front', provenance: 'Legacy application profile; numerical specs require independent calibration', verificationStatus: 'unknown' },
];
export interface ConstraintIssue {
  code: string;
  severity: 'BLOCKER' | 'ERROR' | 'WARNING' | 'INFO';
  field: string;
  messageAr: string;
  alternatives?: string[];
}
export type ResolutionResult<T> =
  | { valid: true; value: T; warnings: ConstraintIssue[]; corrections: string[] }
  | { valid: false; errors: ConstraintIssue[]; alternatives: string[] };
export interface BedroomResolved {
  config: BedroomCaptureConfig;
  identityPrompt: string;
  visualInstructions: string[];
  diagnostics: { cameraSpec: CameraSpecification | null; bodyProvenance: string; physicalMeasurements: null };
}
const side = (hand: Hand): Hand => hand === 'left' ? 'right' : 'left';
const bodySupport = (pose: BedroomCaptureConfig['pose']) => pose === 'elbow_supported';
const validNumber = (n: number | undefined) => n === undefined || (Number.isFinite(n) && n > 0);
const identityPrompt = 'Use the attached reference as the sole authority for visible facial identity, apparent age, natural asymmetry, hairline, beard and skin. No reconstruction, beautification, de-aging or invented traits.';
/** Pure deterministic validation; no UI mutations, no undocumented auto-corrections. */
export function resolveBedroomCapture(raw: BedroomCaptureConfig, activeProfile?: {heightCm?: number; weightKg?: number; type?: string}): ResolutionResult<BedroomResolved> {
  const errors: ConstraintIssue[] = [], warnings: ConstraintIssue[] = [], corrections: string[] = [];
  const fail = (code: string, field: string, messageAr: string, alternatives: string[] = []) =>
    errors.push({code,field,messageAr,severity:'BLOCKER',alternatives});
  const warn = (code: string, field: string, messageAr: string) =>
    warnings.push({code,field,messageAr,severity:'WARNING'});
  const config: BedroomCaptureConfig = {
    ...raw, hands: { ...raw.hands }, camera: {...raw.camera}, body: {...raw.body},
    lighting: {...raw.lighting, activeSources: [...raw.lighting.activeSources]},
    clothing: raw.clothing ? {...raw.clothing} : undefined
  };
  // Active profile wins over legacy template defaults, unless the current user supplied an explicit override.
  if (activeProfile) {
    for (const field of ['heightCm','weightKg','type'] as const) {
      if (activeProfile[field] !== undefined && config.body[field] === undefined) {
        config.body = {...config.body, [field]: activeProfile[field]};
      }
    }
  }
  if (!validNumber(config.body.heightCm) || !validNumber(config.body.weightKg)) fail('INVALID_BODY_PROFILE','body','قياسات الجسم يجب أن تكون موجبة وصحيحة');
  if (config.hands[config.holdingHand] !== 'holding_phone')
    fail('HOLDING_HAND_CONFLICT', 'hands', 'اليد الحاملة للهاتف لا تؤدي مهمتين', ['اجعل إشغال اليد الحاملة holding_phone']);
  if (config.microGesture === 'hair_touch' && config.hands[side(config.holdingHand)] !== 'touching_hair')
    fail('GESTURE_HAND_CONFLICT', 'microGesture', 'لمسة الشعر تتطلب اليد الحرة، ولا يمكن أن تكون مستريحة في اللحظة نفسها', ['غيّر إشغال اليد الحرة إلى touching_hair', 'ألغِ حركة لمس الشعر']);
  if (config.microGesture !== 'hair_touch' && Object.values(config.hands).includes('touching_hair'))
    warn('UNMATCHED_GESTURE', 'hands', 'توجد يد تلمس الشعر دون اختيار هذه الحركة');
  if (bodySupport(config.pose) && config.hands[side(config.holdingHand)] !== 'supporting_body')
    fail('SUPPORT_HAND_CONFLICT','pose','هذه الوضعية تتطلب الساعد الحر لدعم الجسم', ['اختر وضعية مسنودة بالوسادة', 'غيّر اليد الحرة إلى supporting_body وألغِ الحركة']);
  if (config.pose === 'prone' && config.microGesture === 'hair_touch')
    warn('PRONE_REACH_REVIEW', 'pose', 'تحقق بصريًا من وصول الذراع الحرة للشعر دون تدوير العنق بإفراط');
  if (config.camera.module !== 'front')
    fail('FRONT_SELFIE_MODULE', 'camera.module', 'سيلفي الكاميرا الأمامية يتطلب وحدة front', ['اختر front', 'بدّل طريقة الالتقاط إلى مرآة']);
  if (!validNumber(config.camera.lensToFaceCm))
    fail('INVALID_CAMERA_DISTANCE', 'camera.lensToFaceCm', 'المسافة يجب أن تكون موجبة');
  if (config.camera.lensToFaceCm !== undefined) {
    if (config.camera.lensToFaceCm < 20 || config.camera.lensToFaceCm > 90)
      fail('SELFIE_REACH', 'camera.lensToFaceCm', 'مسافة العدسة خارج نطاق الفحص التقريبي للسيلفي اليدوي', ['اختر مسافة أقرب للوجه', 'استخدم مسند هاتف صريحًا']);
    else warn('REACH_UNCALIBRATED', 'camera', 'المسافة ضمن نطاق مبدئي؛ لا يمكن إثبات وصول الذراع دون أطوال أجزائها وإحداثيات الكتف');
  }
  const cameraSpec = CAMERA_SPECIFICATIONS.find(spec => spec.deviceId === config.camera.deviceId && spec.moduleId === config.camera.module) ?? null;
  if (!cameraSpec) warn('CAMERA_PROFILE_UNVERIFIED','camera.deviceId','المواصفات الفعلية للجهاز غير مثبتة؛ لن تُختلق أبعاد المستشعر أو العدسة');
  if (config.lighting.mode === 'phone_screen_only') {
    if (config.lighting.activeSources.some(s => s !== 'phone_screen'))
      fail('EXTRA_LIGHT_SOURCE','lighting.activeSources','إضاءة الشاشة فقط لا تسمح بمصادر مضاءة إضافية', ['أوقف المصابيح الأخرى', 'اختر إضاءة الغرفة']);
    if (config.lighting.lampOn)
      fail('LAMP_ON_CONFLICT','lighting.lampOn','لا يمكن تشغيل المصباح عند اختيار إضاءة شاشة الهاتف فقط', ['اجعل المصباح مطفأ']);
    if (!config.lighting.activeSources.includes('phone_screen'))
      fail('SCREEN_LIGHT_MISSING','lighting.activeSources','مصدر الشاشة غير مسجل', ['أضف phone_screen إلى المصادر الفعالة']);
  }
  if (config.lighting.dustBeam && config.lighting.mode === 'phone_screen_only')
    fail('DUST_BEAM_UNSUPPORTED','lighting.dustBeam','شعاع الغبار غير مبرر دون مسار ضوئي قوي ومحدد', ['ألغِ تأثير الغبار', 'اختر إضاءة نافذة أو شعاعًا موثقًا']);
  if (config.pose === 'left_side' || config.pose === 'right_side' || config.pose === 'pillow_supported') {
    if (config.pillow === 'none') warn('HEAD_SUPPORT_UNKNOWN','pillow','يلزم وصف مسند فعلي للرأس أو توازن الرقبة');
  }
  if (config.clothing?.fullOutfitRequired && config.framing === 'chest-up')
    warn('OUTFIT_OUTSIDE_CROP','framing','السروال خارج الكادر غالبًا؛ وسّع الإطار لإظهار الطقم');
  if (errors.length) return {valid:false, errors, alternatives:[...new Set(errors.flatMap(issue=>issue.alternatives ?? []))]};
  const visualInstructions: string[] = [
    identityPrompt,
    'An authentic bedroom-only handheld front-camera selfie.',
    ({
      supine:'Lying on the back with head and torso supported by pillow and mattress',
      left_side:'Lying on the left side with realistic head, shoulder and hip support',
      right_side:'Lying on the right side with realistic head, shoulder and hip support',
      reclined:'Reclined with back and pelvis supported by the bed',
      semi_reclined:'Semi-reclined against stable pillows, hips pressing into the mattress',
      prone:'Lying on stomach with contact under torso and pelvis',
      sitting:'Sitting on the mattress with supported hips and natural weight distribution',
      headboard_sitting:'Sitting with back against the headboard and supported hips',
      elbow_supported:'Side-lying with a weight-bearing forearm and supported pelvis',
      pillow_supported:'Relaxed lying pose with the head supported by a real pillow'
    })[config.pose] + '.',
    'The ' + config.holdingHand + ' hand holds the phone with a reachable grip; the ' + side(config.holdingHand) + ' hand ' +
      (config.hands[side(config.holdingHand)] === 'touching_hair' ? 'naturally touches the existing hair without changing its density' :
        config.hands[side(config.holdingHand)] === 'supporting_body' ? 'supports body weight' : 'rests naturally') + '.',
    config.camera.deviceId + ' front-camera perspective' +
      (config.camera.lensToFaceCm !== undefined ? ', approximately ' + config.camera.lensToFaceCm + ' cm lens-to-face distance' : '') +
      '; natural smartphone wide-angle perspective, no artificial portrait bokeh.',
    config.clothing ? [config.clothing.fit,config.clothing.fabric,config.clothing.top,config.framing !== 'chest-up' ? config.clothing.bottom : undefined].filter(Boolean).join(' ') +
      '; cloth wrinkles follow gravity and pressure at real support contacts.' : '',
    config.lighting.mode === 'phone_screen_only'
      ? 'The phone OLED display is the sole active light source; all room lamps remain OFF, with weak near-field facial illumination, deep bedroom shadows and restrained low-light processing.'
      : 'Light comes only from declared active bedroom fixtures; reflections and shadows follow their locations.',
    config.lighting.lampVisible && !config.lighting.lampOn ? 'An unlit bedside lamp may be visible as a background object.' : '',
    'Natural unmade bedding and realistic pillow compression, no floating props, no invisible lighting, no additional arms, no invented identity details.'
  ].filter(Boolean);
  return {valid:true,value:{config,identityPrompt,visualInstructions,diagnostics:{cameraSpec,bodyProvenance:activeProfile?'active profile with explicit scene overrides':'scene configuration',physicalMeasurements:null}},warnings,corrections};
}
