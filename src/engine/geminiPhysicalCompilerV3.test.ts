import assert from 'node:assert/strict';
import { compileGeminiGeometryPrompt, structureGeminiNarrative } from './geminiGeometryCompiler';
import type { ResolvedScene } from './physicsEngine';
import type { ReferencePlan } from './referenceRouter';

const makeResolved = (patch: Record<string, unknown> = {}) => ({
  state: {
    sceneFamily: 'car', subScene: 'المقعد الأمامي للراكب',
    pose: 'جالس في مقعد الراكب', activity: 'ينتظر',
    captureType: 'front-selfie', lightingMode: 'إضاءة شاشة الهاتف فقط',
    timeOfDay: 'night', groupSelfieEnabled: false, ...patch,
  },
  physicalState: {
    bodyOrientation: 'seated naturally', cameraDistance: '52cm',
    cameraPitch: '8°', cameraYaw: '10°', cameraRoll: '3°',
    visibleBodyRegion: 'head and chest', fieldOfView: 'wide smartphone field of view',
    occlusions: [], visibleVehicles: [], visiblePeople: [],
    backgroundRealism: { allowsVehicles: false, allowsHumans: false },
  },
} as unknown as ResolvedScene);

const base = 'Photorealistic vertical 9:16, unedited smartphone photograph. Pose: جالس في مقعد الراكب. Action: ينتظر. Setting: المقعد الأمامي للراكب. Time: night. Lighting: Only the phone screen illuminates the face.';
const noRef = { hasReference: false } as ReferencePlan;
const passenger = compileGeminiGeometryPrompt(base, makeResolved(), noRef);
assert.match(passenger, /front right passenger seat/);
assert.match(passenger, /waiting casually/);
assert.match(passenger, /Xiaomi 15 Ultra front camera/);
assert.doesNotMatch(passenger, /supplied identity reference applies exclusively/);

const rear = compileGeminiGeometryPrompt(base, makeResolved({subScene: 'المقعد الخلفي', pose: 'جالس في المقعد الخلفي'}), noRef);
assert.match(rear, /rear bench/);
assert.doesNotMatch(rear, /front right passenger seat/);

const grouped = compileGeminiGeometryPrompt(base + ' GROUP SELFIE MODE: total people=3. Companion 1: distinct identity. Companion 2: distinct identity.', makeResolved({groupSelfieEnabled: true}), {hasReference: true} as ReferencePlan);
assert.match(grouped, /reference applies exclusively to the main subject/);
assert.match(grouped, /Companion 1: distinct identity/);
assert.match(grouped, /Companion 2: distinct identity/);
assert.equal(structureGeminiNarrative('Portrait. Companion 1: A. Companion 2: B.'), 'Portrait.\n\nCompanion 1: A.\n\nCompanion 2: B.');
console.log('Gemini V3 narrative regression checks passed.');
