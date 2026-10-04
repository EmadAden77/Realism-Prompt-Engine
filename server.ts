import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MICRO_LOCATIONS } from './src/data/microLocations.ts';
import { OUTFITS } from './src/data/clothingOutfits.ts';
import { getEligibleSelfieAngles } from './src/engine/selfieAngles.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const getGeminiApiKey = () =>
  process.env.GEMINI_API_KEY ||
  process.env.GeminiAPIKey2 ||
  '';

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(getGeminiApiKey()),
    runtime: process.env.VERCEL ? 'vercel' : 'node'
  });
});

// Gemini is initialized lazily inside requests so a missing key never crashes
// the whole Vercel function before health checks or static routes can respond.
function createGeminiClient() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient helper to call Gemini with multi-model fallback (gemini-3.8-flash -> gemini-3.5-flash -> gemini-3.1-flash-lite)
async function callGeminiWithFallback(params: {
  contents: any;
  config?: any;
  preferredModels?: string[];
}) {
  const models = params.preferredModels || ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  const ai = createGeminiClient();
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        console.info("[PhysFrame] Gemini model " + model + " succeeded.");
        return response;
      }
    } catch (err: any) {
      console.warn(`[PhysFrame] Model ${model} failed, trying next fallback. Error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All model attempts failed');
}

// Scene dictionaries for validation and local fallback
const SCENE_DATA: Record<string, { subScenes: string[]; activities: string[]; poses: string[]; allowedLighting: string[]; outfits: string[] }> = {
  'military-base': {
    subScenes: MICRO_LOCATIONS['military-base'].map(m => m.labelAR),
    activities: ['عمل مكتبي', 'استراحة قصيرة', 'مناوبة', 'واقف بثبات واعتزاز'],
    poses: ['واقف باستقامة', 'جالس خلف المكتب', 'مستند بظهره على مكتب', 'واقف بثبات'],
    allowedLighting: ['إضاءة مكتب فلورسنت', 'ضوء نهاري من النافذة', 'إضاءة ممرات متوازية', 'شمس الظهر'],
    outfits: OUTFITS.filter(o => o.category.includes('military-base')).map(o => o.id)
  },
  'saudi-outdoor': {
    subScenes: MICRO_LOCATIONS['saudi-outdoor'].map(m => m.labelAR),
    activities: ['يمشي بهدوء', 'واقف بشكل طبيعي', 'ينتظر', 'جالس في المقهى'],
    poses: ['واقف بثبات', 'يمشي بخطوات طبيعية', 'مستند على جدار', 'مستند بظهره على الجدار', 'جالس على كرسي'],
    allowedLighting: ['ضوء نهاري طبيعي', 'شمس الظهر', 'ساعة ذهبية (شروق/غروب)', 'إنارة شارع دافئة', 'إنارة نيون تجارية متناثرة'],
    outfits: OUTFITS.filter(o => o.category.includes('saudi-outdoor')).map(o => o.id)
  },
  'car': {
    subScenes: MICRO_LOCATIONS['car'].map(m => m.labelAR),
    activities: ['خلف المقود والسيارة متوقفة', 'جالس في مقعد الراكب', 'جالس بهدوء داخل السيارة'],
    poses: ['جالس باسترخاء في المقعد', 'مستند على المقود'],
    allowedLighting: ['ضوء نهاري طبيعي', 'شمس الظهر', 'إضاءة داخل السيارة', 'إضاءة الشارع عبر زجاج السيارة', 'إضاءة شاشة الهاتف فقط'],
    outfits: OUTFITS.filter(o => o.category.includes('car')).map(o => o.id)
  },
  'living-room': {
    subScenes: MICRO_LOCATIONS['living-room'].map(m => m.labelAR),
    activities: ['جالس على الكنبة', 'واقف بشكل طبيعي', 'يشرب قهوة', 'يستخدم الهاتف'],
    poses: ['مسترخٍ على الكنبة', 'واقف بثبات', 'مستند على طاولة'],
    allowedLighting: ['ضوء نهاري طبيعي', 'إضاءة سقف', 'إنارة ليلية مختلطة', 'إضاءة شاشة الهاتف فقط'],
    outfits: OUTFITS.filter(o => o.category.includes('living-room')).map(o => o.id)
  },
  'bedroom': {
    subScenes: MICRO_LOCATIONS['bedroom'].map(m => m.labelAR),
    activities: ['جالس', 'واقف بشكل طبيعي', 'مسترخٍ', 'يستخدم الهاتف'],
    poses: ['جالس على حافة السرير', 'نصف مستلقٍ', 'مستند على الجدار', 'واقف بثبات'],
    allowedLighting: ['ضوء نهاري طبيعي', 'إضاءة سقف', 'إضاءة أباجورة دافئة', 'إضاءة شاشة الهاتف فقط'],
    outfits: OUTFITS.filter(o => o.category.includes('bedroom')).map(o => o.id)
  },
  'gym': {
    subScenes: MICRO_LOCATIONS['gym'].map(m => m.labelAR),
    activities: ['قبل التمرين', 'يستريح بين الجولات', 'بعد التمرين'],
    poses: ['واقف بجانب الأجهزة', 'جالس على مقعد التمرين', 'يحمل زجاجة ماء'],
    allowedLighting: ['إضاءة النادي الرياضي', 'ضوء نهاري طبيعي'],
    outfits: OUTFITS.filter(o => o.category.includes('gym')).map(o => o.id)
  }
};

function sanitizeFamily(val: string): string {
  if (SCENE_DATA[val]) return val;
  if (/عسكر|مكتب|دوام|ضابط|مناوب/.test(val)) return 'military-base';
  if (/سيار|كامري|يوكن|شاحنة|طريق/.test(val)) return 'car';
  if (/نوم|سرير|غرف/.test(val)) return 'bedroom';
  if (/صال|كنب|تلفزيون|مجلس/.test(val)) return 'living-room';
  if (/نادي|جيم|تمرين|رياض|حديد/.test(val)) return 'gym';
  return 'saudi-outdoor';
}

function sanitizeItem(item: string, allowedList: string[], fallback: string): string {
  if (!item) return fallback;
  if (allowedList.includes(item)) return item;
  const found = allowedList.find(x => item.includes(x) || x.includes(item));
  return found || fallback;
}

// 1. Analyze reference portrait image for identity locking and physical traits
app.post('/api/ai/analyze-face', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const response = await callGeminiWithFallback({
      preferredModels: ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'],
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `You are an expert photographic forensic analyst and AI image prompt engineer specializing in physical likeness and identity preservation.
Analyze this reference image in detail. Extract physical characteristics and output JSON according to the schema.
Ensure your identity lock prompt is strict, avoiding beautification, de-aging, plastic skin, or altered geometry.
Pay specific attention to:
1. Eyeglasses: frame style (e.g. dark rectangular, wire, rimless), color, lens characteristics.
2. Hair: color, volume, hairline contour, parting, density.
3. Facial hair: exact beard/mustache density, trim lines, natural stubble.
4. Skin & face geometry: facial structure, jawline, skin undertones, natural visible pores/micro-features, absence of artificial filters.
5. Height & athletic build indicators.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identityLockPrompt: {
              type: Type.STRING,
              description: 'Exhaustive English prompt segment enforcing exact facial identity, bone structure, hairline, beard pattern, and proportions without beautification (do not mandate permanent eyeglasses in identity).',
            },
            arabicSummary: {
              type: Type.STRING,
              description: 'A 2-3 sentence Arabic description of the detected features (glasses, facial hair, skin traits, etc.) for display in the UI.',
            },
            glassesDetected: {
              type: Type.BOOLEAN,
              description: 'Whether eyeglasses were detected on the subject.',
            },
            glassesDescription: {
              type: Type.STRING,
              description: 'Detailed description of the glasses frames, color, and lenses.',
            },
            hairDescription: {
              type: Type.STRING,
              description: 'Detailed description of hair style, hairline, and density.',
            },
            facialHairDescription: {
              type: Type.STRING,
              description: 'Detailed description of beard and moustache growth.',
            },
            recommendedHairId: {
              type: Type.STRING,
              description: 'Recommended hair style ID from: h1, h2, h3, h4, h5, h6',
            },
            recommendedExpressionId: {
              type: Type.STRING,
              description: 'Recommended expression ID from: e1, e2, e3, e4, e5',
            },
            antiAiTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 Arabic bullet points on how to keep this person looking completely natural and avoid AI gloss.',
            },
          },
          required: [
            'identityLockPrompt',
            'arabicSummary',
            'glassesDetected',
            'hairDescription',
            'facialHairDescription',
            'antiAiTips',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Face analysis error, falling back to structured profile:', error);
    // Graceful fallback profile
    return res.json({
      identityLockPrompt: `Preserve exact facial identity from the reference image. 193cm height, 83kg weight, tall lean-athletic male build. DO NOT alter facial proportions, head geometry, hairline, or natural hair density. DO NOT artificially beautify, de-age, or smooth skin. Preserve natural facial asymmetry and existing beard/moustache growth pattern.`,
      arabicSummary: 'تم تثبيت الملامح الطبيعية: لحية طبيعية محددة، وبنية رياضية رشيقة بطول 193 سم.',
      glassesDetected: true,
      glassesDescription: 'نظارات طبية بإطار مستطيل داكن كلاسيكي',
      hairDescription: 'شعر أسود طبيعي بكثافة متوازنة وخط شعر غير متكلف',
      facialHairDescription: 'لحية وشارب نمو طبيعي متناسق غير مبالغ في تشذيبها',
      recommendedHairId: 'h2',
      recommendedExpressionId: 'e1',
      antiAiTips: [
        'تجنب التنعيم الرقمي على الخدين للحفاظ على مسام الجلد الحقيقية.',
        'إبقاء انعكاسات النظارة غير متطابقة لإضفاء واقعية عضوية.',
        'الحفاظ على عدم تماثل خصلات الشعر الطفيفة.'
      ]
    });
  }
});

// 2. AI Scenario Director: Intelligently choreograph a Saudi authentic realistic scene
app.post('/api/ai/direct-scene', async (req, res) => {
  try {
    const { userVibe, currentFamily, referenceDescription } = req.body;

    const response = await callGeminiWithFallback({
      preferredModels: ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'],
      contents: `You are a Saudi cinematic director and physical photography realism expert.
Your mission is to invent a hyper-authentic, believable Saudi lifestyle/work scenario that looks 100% like an unedited raw photo taken spontaneously on an iPhone or Android phone by an ordinary person in Saudi Arabia.
No tourist cliches, no floating studio lighting, no AI-slop perfection.

User preferred vibe or idea: ${userVibe || 'عفوي وطبيعي جداً بدون تصنع'}
Current scene family preference: ${currentFamily || 'any appropriate'}
Subject context: ${referenceDescription || 'Saudi male, tall lean-athletic, wearing glasses'}

Available Scene Families:
- 'military-base' (مبنى عمل عسكري: مكتب إداري, ممرات, مواقف)
- 'saudi-outdoor' (أماكن سعودية: شارع فلل, حي سكني, شارع تجاري, كافيه, ممشى)
- 'car' (السيارة: داخل السيارة, بجانب السيارة)
- 'living-room' (صالة منزلية)
- 'bedroom' (غرفة نوم)
- 'gym' (نادي رياضي)

Available Outfits (Choose the exact outfitId that best matches the scene and mood):
${OUTFITS.map(o => `- '${o.id}': ${o.labelAR} (${o.promptDescription}) [Category: ${o.categoryAR}]`).join('\n')}

Available Anatomical Expressions:
- 'e1' (Resting Neutral), 'e2' (Calm Serene), 'e3' (Duchenne Micro-Smile), 'e4' (Candid Half-Smile), 'e5' (Cognitive Focus), 'e6' (Commanding Gravitas), 'e7' (Sun Squint), 'e8' (Post-Shift Fatigue), 'e9' (Distant Pensive), 'e10' (Skeptical Brow Lift), 'e11' (Post-Workout Breathing), 'e12' (Friendly Smirk), 'e13' (Inquisitive Surprise), 'e14' (Full Genuine Laugh), 'e15' (Intense Analytical Brow Furrow), 'e16' (Contented Sigh), 'e17' (Bemused Incredulity), 'e18' (Drowsy Heavy Eyelids), 'e19' (Guarded Vigilance), 'e20' (Quiet Dignified Pride), 'e21' (Mild Discontent & Pebble Chin), 'e22' (Lip Bite in Concentration), 'e23' (Mid-Conversation Speech), 'e24' (Spiritual Tranquility), 'e25' (Playful Eye-Roll), 'e26' (Stoic Tactical Vigilance), 'e27' (Deep Inhale Fresh Air), 'e28' (Gentle Quizzical Inquisitiveness)

Available Lens Conditions: 'xiaomi-clean', 'smudged-lens'. For front-selfie, camera hardware is always Xiaomi 15 Ultra front camera; lensCondition changes surface cleanliness only, never device identity.
Available Clothing Conditions: 'crisp', 'worn-all-day', 'vintage-washed'
Available Atmospheric Conditions: 'neutral', 'high-humidity', 'dusty-haze', 'breezy'
Available Foreground Obstructions: 'clean', 'through-glass', 'foreground-clutter'
Available Capture Types: 'front-selfie', 'mirror-selfie', 'third-person-candid'
Available Framings: 'head-shoulders', 'chest-up', 'half-body'

Select completely coherent, physically realistic attributes and provide a vivid story behind the shot.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneFamily: { type: Type.STRING },
            subScene: { type: Type.STRING },
            activity: { type: Type.STRING },
            pose: { type: Type.STRING },
            captureType: { type: Type.STRING },
            framing: { type: Type.STRING },
            cameraAngle: { type: Type.STRING },
            outfitId: { type: Type.STRING },
            hairStyle: { type: Type.STRING },
            expression: { type: Type.STRING },
            timeOfDay: { type: Type.STRING },
            lightingMode: { type: Type.STRING },
            environmentRealism: { type: Type.STRING },
            lensCondition: { type: Type.STRING },
            clothingCondition: { type: Type.STRING },
            atmosphericCondition: { type: Type.STRING },
            foregroundObstruction: { type: Type.STRING },
            muscleFatigue: {
              type: Type.STRING,
              description: "Physical muscle and ocular fatigue: 'none', 'heavy-eyelids', 'bloodshot-sclera', 'pale-fatigued-skin', 'full-exhaustion'",
            },
            lightingIntensity: {
              type: Type.INTEGER,
              description: 'Ambient lighting intensity percentage (10 to 100)',
            },
            shadowDepth: {
              type: Type.INTEGER,
              description: 'Shadow depth and hardness percentage (10 to 100)',
            },
            realismStyle: { type: Type.STRING },
            storyAR: {
              type: Type.STRING,
              description: 'A captivating 2-sentence Arabic backstory of why this shot was taken spontaneously.',
            },
            directorNoteAR: {
              type: Type.STRING,
              description: 'Director note in Arabic highlighting the key physical detail that fools AI detectors.',
            },
          },
          required: [
            'sceneFamily',
            'subScene',
            'activity',
            'pose',
            'captureType',
            'framing',
            'cameraAngle',
            'outfitId',
            'hairStyle',
            'expression',
            'timeOfDay',
            'lightingMode',
            'environmentRealism',
            'lensCondition',
            'clothingCondition',
            'atmosphericCondition',
            'foregroundObstruction',
            'realismStyle',
            'storyAR',
            'directorNoteAR',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Strict sanitization to guarantee valid frontend state
    const familyKey = sanitizeFamily(parsed.sceneFamily || currentFamily || 'saudi-outdoor');
    const familyData = SCENE_DATA[familyKey];

    const sanitizedResult = {
      sceneFamily: familyKey,
      subScene: sanitizeItem(parsed.subScene, familyData.subScenes, familyData.subScenes[0]),
      activity: sanitizeItem(parsed.activity, familyData.activities, familyData.activities[0]),
      pose: sanitizeItem(parsed.pose, familyData.poses, familyData.poses[0]),
      captureType: ['front-selfie', 'mirror-selfie', 'third-person-candid'].includes(parsed.captureType)
        ? (parsed.captureType === 'mirror-selfie' && !['bedroom', 'gym', 'living-room'].includes(familyKey) ? 'front-selfie' : parsed.captureType)
        : 'front-selfie',
      framing: ['head-shoulders', 'chest-up', 'half-body'].includes(parsed.framing) ? parsed.framing : 'chest-up',
      cameraAngle: ['eye-level', 'slightly-high', 'slightly-low', 'slightly-off-center'].includes(parsed.cameraAngle) ? parsed.cameraAngle : 'eye-level',
      outfitId: familyData.outfits.includes(parsed.outfitId) ? parsed.outfitId : familyData.outfits[0],
      hairStyle: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(parsed.hairStyle) ? parsed.hairStyle : 'h2',
      expression: Array.from({ length: 28 }, (_, i) => `e${i + 1}`).includes(parsed.expression) ? parsed.expression : 'e1',
      timeOfDay: ['morning', 'midday', 'afternoon', 'sunset', 'night'].includes(parsed.timeOfDay) ? parsed.timeOfDay : 'midday',
      lightingMode: sanitizeItem(parsed.lightingMode, familyData.allowedLighting, familyData.allowedLighting[0]),
      environmentRealism: parsed.environmentRealism || 'طبيعي',
      lensCondition: parsed.lensCondition === 'smudged-lens' ? 'smudged-lens' : 'xiaomi-clean',
      clothingCondition: ['crisp', 'worn-all-day', 'vintage-washed'].includes(parsed.clothingCondition) ? parsed.clothingCondition : 'worn-all-day',
      atmosphericCondition: ['neutral', 'high-humidity', 'dusty-haze', 'breezy'].includes(parsed.atmosphericCondition) ? parsed.atmosphericCondition : 'neutral',
      foregroundObstruction: ['clean', 'through-glass', 'foreground-clutter'].includes(parsed.foregroundObstruction) ? parsed.foregroundObstruction : 'clean',
      muscleFatigue: ['none', 'heavy-eyelids', 'bloodshot-sclera', 'pale-fatigued-skin', 'full-exhaustion'].includes(parsed.muscleFatigue) ? parsed.muscleFatigue : 'none',
      realismStyle: 'anti-ai-raw',
      storyAR: parsed.storyAR || 'لقطة عفوية وثقت لحظة هدوء حقيقية بدون أي تصنع أو ترتيب مسبق.',
      directorNoteAR: parsed.directorNoteAR || 'الانعكاسات غير المتناظرة على النظارة وتجاعيد القماش الطبيعية تمنح اللقطة مصداقية مادية تامة.',
    };

    return res.json(sanitizedResult);
  } catch (error: any) {
    console.warn('Scene director API failed, generating intelligent local Saudi scenario:', error?.message);

    // Bulletproof dynamic Saudi scenario generator
    const { userVibe, currentFamily } = req.body;
    let targetFamily = sanitizeFamily(currentFamily || (userVibe ? sanitizeFamily(userVibe) : 'saudi-outdoor'));
    const fData = SCENE_DATA[targetFamily];

    const fallbackScenarios: Record<string, { story: string; note: string; sub: string; act: string; outfit: string; time: string; lighting: string }> = {
      'military-base': {
        story: 'استراحة سريعة داخل المكتب الإداري بعد جولة تفقدية بالقطاع، حيث تظهر الملفات الرسمية والضوء النهاري الخافت من النافذة.',
        note: 'تفاصيل نسيج القماش المقوى للزي الإداري وانعكاس شاشة الكمبيوتر تكسر مظهر الذكاء الاصطناعي.',
        sub: 'مكتب إداري عسكري',
        act: 'عمل مكتبي',
        outfit: 'mil3',
        time: 'midday',
        lighting: 'إضاءة مكتب فلورسنت'
      },
      'car': {
        story: 'لحظة انتظار عند مقهى محلي وقت الغروب في الرياض، متوقف على جانب الطريق مع إضاءة خفيفة تتسلل عبر زجاج السيارة الجانبي.',
        note: 'انعكاس الزجاج وتدرج الإضاءة الطبيعي على حزام الأمان يمنح عمقاً واقعياً فائقاً.',
        sub: 'داخل السيارة',
        act: 'خلف المقود والسيارة متوقفة',
        outfit: 'thobe1',
        time: 'sunset',
        lighting: 'ضوء نهاري طبيعي'
      },
      'saudi-outdoor': {
        story: 'جلسة هادئة أمام مقهى محلي بحي سكني حديث بعد العصر، حيث الشوارع النظيفة وانعكاس شمس العصر المائلة.',
        note: 'تجاعيد الثوب القطني الخفيف وحركة الهواء الطبيعية تمنعان أي نعومة بلاستيكية.',
        sub: 'أمام مقهى',
        act: 'جالس في المقهى',
        outfit: 'thobe1',
        time: 'afternoon',
        lighting: 'ساعة ذهبية (شروق/غروب)'
      },
      'gym': {
        story: 'استراحة قصيرة بين الجولات التدريبية في النادي الرياضي، مع تعرق خفيف طبيعي وإضاءة الصالة الرياضية المباشرة.',
        note: 'لمعان التعرق الفيزيائي غير المبالغ فيه على الجبين يثبت بشرية اللقطة تماماً.',
        sub: 'بجانب الأثقال',
        act: 'يستريح بين الجولات',
        outfit: 'gym1',
        time: 'night',
        lighting: 'إضاءة النادي الرياضي'
      },
      'living-room': {
        story: 'جلسة مسائية مريحة في الصالة مع فنجان قهوة واستخدام الهاتف بهدوء بعد يوم عمل طويل.',
        note: 'إضاءة شاشة الهاتف المنعكسة جزئياً على زجاج النظارة تكسر الإضاءة الاستوديو المثالية.',
        sub: 'في منتصف الصالة',
        act: 'يشرب قهوة',
        outfit: 'cas8',
        time: 'night',
        lighting: 'إنارة ليلية مختلطة'
      },
      'bedroom': {
        story: 'لقطة عفوية صباحية أثناء الاستعداد لليوم، الإضاءة الطبيعية تدخل من زاوية النافذة بهدوء.',
        note: 'طيات مفرش السرير العفوية غير المرتبة بدقة توثق أصالة المشهد الواقعي.',
        sub: 'على حافة السرير',
        act: 'جالس',
        outfit: 'bed1',
        time: 'morning',
        lighting: 'ضوء نهاري طبيعي'
      }
    };

    const sc = fallbackScenarios[targetFamily] || fallbackScenarios['saudi-outdoor'];

    return res.json({
      sceneFamily: targetFamily,
      subScene: sc.sub,
      activity: sc.act,
      pose: fData.poses[0],
      captureType: 'front-selfie',
      framing: 'chest-up',
      cameraAngle: 'eye-level',
      outfitId: sc.outfit,
      hairStyle: 'h2',
      expression: 'e1',
      timeOfDay: sc.time,
      lightingMode: sc.lighting,
      environmentRealism: 'طبيعي',
      lensCondition: 'xiaomi-clean',
      clothingCondition: 'worn-all-day',
      atmosphericCondition: 'neutral',
      foregroundObstruction: 'clean',
      muscleFatigue: 'none',
      realismStyle: 'anti-ai-raw',
      lightingIntensity: 70,
      shadowDepth: 60,
      storyAR: sc.story,
      directorNoteAR: sc.note,
    });
  }
});

// 3. Gemini Selfie Camera Director: selects from a bounded physical angle library.
// Gemini chooses contextually; the local physics engine remains authoritative.
app.post('/api/ai/selfie-angle', async (req, res) => {
  try {
    const sceneState = req.body?.sceneState || {};

    if (sceneState.captureType !== 'front-selfie') {
      return res.status(400).json({ error: 'Smart selfie angle selection applies only to front-camera selfies.' });
    }

    const context = {
      captureType: 'front-selfie' as const,
      sceneFamily: sceneState.sceneFamily || null,
      subScene: String(sceneState.subScene || ''),
      pose: String(sceneState.pose || ''),
      activity: String(sceneState.activity || ''),
      framing: sceneState.framing || 'chest-up',
      manualAngle: sceneState.cameraAngle || 'eye-level',
      timeOfDay: sceneState.timeOfDay || 'midday',
      lightingMode: String(sceneState.lightingMode || ''),
      mode: 'gemini-smart' as const
    };

    const eligible = getEligibleSelfieAngles(context);
    if (!eligible.length) {
      return res.status(422).json({ error: 'No physically eligible selfie angle exists for this scene/framing.' });
    }

    const angleCatalog = eligible.map(angle => ({
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
      carFocus: angle.carFocus || 'balanced',
      carSeat: angle.carSeat || null,
      phonePlacement: angle.phonePlacement || null,
      cabinGuards: angle.cabinGuards || [],
      allowedMicroVariation: angle.variation
    }));

    const response = await callGeminiWithFallback({
      preferredModels: ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'],
      contents: `You are the Camera Director for a physically constrained Xiaomi 15 Ultra front-camera selfie engine.

Choose EXACTLY ONE angle from the supplied eligible catalog. Never invent a new angle ID.

SCENE:
${JSON.stringify({
  sceneFamily: sceneState.sceneFamily,
  subScene: sceneState.subScene,
  activity: sceneState.activity,
  pose: sceneState.pose,
  framing: sceneState.framing,
  timeOfDay: sceneState.timeOfDay,
  lightingMode: sceneState.lightingMode,
  backgroundMode: sceneState.backgroundMode,
  backgroundHumans: sceneState.backgroundHumans,
  backgroundVehicles: sceneState.backgroundVehicles
}, null, 2)}

ELIGIBLE PHYSICALLY-BOUNDED SELFIE ANGLES:
${JSON.stringify(angleCatalog, null, 2)}

Selection priorities:
1. The person's actual pose/body support and available space.
2. Natural one-arm selfie mechanics with Xiaomi 15 Ultra front-camera perspective.
3. The selected framing and what background can physically enter the FOV.
4. Avoid repetitive centered angles when a subtle off-axis angle is more natural.
5. Prefer low-risk angles unless the scene specifically benefits from a medium-risk angle.
6. Never choose cinematic bird-eye, 90-degree profile, dramatic Dutch angle, DSLR, ARRI, 35mm, 85mm, or impossible floating-camera geometry.
7. Roll is only natural handheld micro-tilt, never a dramatic Dutch angle.
8. Return micro-variation offsets only; the local engine will clamp them to the preset's allowed range.
9. FOR CAR INTERIORS: first decide the photographic goal:
   - face-priority = face remains dominant; steering wheel/dashboard/window only as secondary context.
   - cabin-context = deliberately reveal more steering wheel/dashboard/window/seat architecture while keeping the face primary enough to remain a selfie.
   - balanced = neither dominates.
10. FOR CAR INTERIORS: respect the actual seat role. Driver angles must not be used for front/rear passenger positions and vice versa.
11. FOR CAR INTERIORS: phone must remain physically inside the cabin, behind windshield/side-glass planes, below roof/headliner/visor, and clear of steering wheel, rearview mirror, A/B/C pillars, dashboard, center console, and gear selector.
12. If lighting is "إضاءة شاشة الهاتف فقط", prefer a face-priority close/medium angle where the phone can plausibly illuminate the face; do not choose a distant cabin-context angle.

Return the exact carFocus associated with the selected catalog item (or "balanced" for non-car scenes), plus one or two concise Arabic reasons explaining why the angle fits this exact pose and scene.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            angleId: { type: Type.STRING },
            pitchOffsetDeg: { type: Type.INTEGER },
            yawOffsetDeg: { type: Type.INTEGER },
            rollOffsetDeg: { type: Type.INTEGER },
            distanceOffsetCm: { type: Type.INTEGER },
            carFocus: {
              type: Type.STRING,
              description: 'One of: face-priority, cabin-context, balanced.'
            },
            reasonAR: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            confidence: { type: Type.INTEGER }
          },
          required: [
            'angleId',
            'pitchOffsetDeg',
            'yawOffsetDeg',
            'rollOffsetDeg',
            'distanceOffsetCm',
            'carFocus',
            'reasonAR',
            'confidence'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const selected = eligible.find(angle => angle.id === parsed.angleId);
    if (!selected) {
      throw new Error('Gemini selected an angle outside the eligible physical catalog');
    }

    const numberOrZero = (value: unknown) => {
      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
    };

    return res.json({
      angleId: selected.id,
      pitchOffsetDeg: numberOrZero(parsed.pitchOffsetDeg),
      yawOffsetDeg: numberOrZero(parsed.yawOffsetDeg),
      rollOffsetDeg: numberOrZero(parsed.rollOffsetDeg),
      distanceOffsetCm: numberOrZero(parsed.distanceOffsetCm),
      carFocus: selected.carFocus || 'balanced',
      reasonAR: Array.isArray(parsed.reasonAR) ? parsed.reasonAR.slice(0, 2) : [],
      confidence: Math.max(0, Math.min(100, numberOrZero(parsed.confidence)))
    });
  } catch (error: any) {
    console.warn('Selfie angle reasoning failed:', error?.message || error);
    return res.status(503).json({
      error: 'تعذر اختيار زاوية Gemini الآن. سيستخدم المحرك أفضل زاوية محلية متوافقة مع الفيزياء.'
    });
  }
});

// 3. Gemini Background Reasoner: advisory scene understanding only.
// Local physics/FOV remains authoritative and caps every Gemini suggestion.
app.post('/api/ai/background-reasoning', async (req, res) => {
  try {
    const sceneState = req.body?.sceneState || {};
    const localLimits = req.body?.localLimits || {};

    const response = await callGeminiWithFallback({
      // Background reasoning is latency-sensitive.
      preferredModels: ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'],
      contents: `You are a scene-context reasoner for a photorealistic Saudi smartphone selfie prompt engine.

Your task is NOT to redesign the scene. Decide only how much secondary background life is contextually plausible.

SCENE:
${JSON.stringify({
  sceneFamily: sceneState.sceneFamily,
  subScene: sceneState.subScene,
  timeOfDay: sceneState.timeOfDay,
  captureType: sceneState.captureType,
  framing: sceneState.framing,
  cameraAngle: sceneState.cameraAngle,
  lightingMode: sceneState.lightingMode,
  backgroundMode: sceneState.backgroundMode,
  backgroundHumans: sceneState.backgroundHumans,
  backgroundVehicles: sceneState.backgroundVehicles,
  backgroundDisorder: sceneState.backgroundDisorder
}, null, 2)}

LOCAL PHYSICAL LIMITS:
${JSON.stringify(localLimits, null, 2)}

Rules:
- The local engine owns camera geometry, Xiaomi 15 Ultra front-camera FOV, occlusion, lighting causality, and physical feasibility.
- Never exceed local limits.
- Private interiors should normally have no random people.
- Tight selfies should normally have no visible full people or vehicles.
- Public Saudi scenes may contain sparse, ordinary background life if physically visible.
- No landmarks, staged crowds, decorative traffic, cinematic clutter, or tourist stereotypes.
- Mild disorder must be place-appropriate and visually secondary.
- User explicit choices have higher priority than your advice.
- Return density advice only. Do not invent a new location.

Return concise Arabic reasoning.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            humanDensity: {
              type: Type.STRING,
              description: 'One of: none, sparse, light, moderate.'
            },
            vehicleDensity: {
              type: Type.STRING,
              description: 'One of: none, sparse, light, moderate.'
            },
            disorderLevel: {
              type: Type.STRING,
              description: 'One of: none, very-clean, light, moderate.'
            },
            reasonAR: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'One or two concise Arabic reasons tied to the actual scene and selfie framing.'
            },
            confidence: {
              type: Type.INTEGER,
              description: 'Confidence from 0 to 100.'
            }
          },
          required: ['humanDensity', 'vehicleDensity', 'disorderLevel', 'reasonAR', 'confidence']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const allowedDensity = new Set(['none', 'sparse', 'light', 'moderate']);
    const allowedDisorder = new Set(['none', 'very-clean', 'light', 'moderate']);

    if (!allowedDensity.has(parsed.humanDensity) ||
        !allowedDensity.has(parsed.vehicleDensity) ||
        !allowedDisorder.has(parsed.disorderLevel)) {
      throw new Error('Gemini background reasoning returned an invalid density value');
    }

    return res.json({
      humanDensity: parsed.humanDensity,
      vehicleDensity: parsed.vehicleDensity,
      disorderLevel: parsed.disorderLevel,
      reasonAR: Array.isArray(parsed.reasonAR) ? parsed.reasonAR.slice(0, 2) : [],
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0))
    });
  } catch (error: any) {
    console.warn('Background reasoning failed:', error?.message || error);
    return res.status(503).json({
      error: 'تعذر تحليل الخلفية بواسطة Gemini الآن. سيستمر المحرك المحلي بالعمل بشكل طبيعي.'
    });
  }
});

// 4. AI Realism Inspector: Audit current settings & prompt for anti-AI realism score & slop prevention
app.post('/api/ai/audit-realism', async (req, res) => {
  try {
    const { sceneState, promptText } = req.body;

    const response = await callGeminiWithFallback({
      // Audit is latency-sensitive. 3.5 Flash is currently succeeding while 3.8 Flash
      // is frequently returning 503 high-demand responses in production.
      preferredModels: ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'],
      contents: `You are an elite AI Image Realism Auditor and anti-slop evaluator.
Examine this generation configuration and prompt:
Configuration: ${JSON.stringify(sceneState, null, 2)}
Prompt Text:
"""
${promptText}
"""

Evaluate how convincingly physical and non-synthetic this image will be if rendered.
Check for:
1. Physical realism and grounding (does the pose contact surfaces physically? are shadows coherent?).
2. Anti-AI slop qualities: natural imperfections, real lens characteristics, asymmetric catchlights, non-waxy skin, true-to-life clothing wrinkles.
3. Possible conflicts (e.g., indoor room with daylight sun at night, or conflicting camera angles).
4. Score between 0 and 100 on the "Anti-AI Realism Scale".

Return your assessment in Arabic.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            realismScore: {
              type: Type.INTEGER,
              description: 'Score from 0 to 100 indicating how physically realistic and un-AI-like the result will be.',
            },
            verdictAR: {
              type: Type.STRING,
              description: 'Short verdict in Arabic (e.g., "واقعية فيزيائية خارقة", "ممتاز مع ملاحظات طفيفة").',
            },
            strengthsAR: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 key physical strengths that break AI stereotypes.',
            },
            risksAR: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '1-2 subtle risks where AI might try to slip in fake smoothing or impossible lighting.',
            },
            recommendationsAR: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 actionable recommendations in Arabic to maximize raw photography authenticity.',
            },
          },
          required: [
            'realismScore',
            'verdictAR',
            'strengthsAR',
            'risksAR',
            'recommendationsAR',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Audit realism API fallback triggered:', error?.message);
    return res.json({
      realismScore: 0,
      verdictAR: 'تعذر تدقيق Gemini؛ تم الاعتماد على فحص الاتساق الفيزيائي المحلي',
      strengthsAR: [
        'تثبيت قيود النظارة ومنع تنعيم البشرة يحميان الهوية من التزييف البلاستيكي.',
        'إدراج فيزياء الأقمشة والتجاعيد يكسر نمطية الموديلات ثلاثية الأبعاد.',
        'تحديد زاوية الذراع والعدسة الواسعة للهاتف يمنح الكادر عمقاً عفوياً.'
      ],
      risksAR: [
        'قد تحاول بعض المحركات تفتيح الظلال بشكل مفرط في الخلفيات البعيدة.'
      ],
      recommendationsAR: [
        'احرص على استخدام أمر Anti-AI Raw لضمان ظهور مسام البشرة وحبيبات المستشعر.',
        'يفضل تفعيل شوائب العدسة العضوية لمزيد من المصداقية المادية.'
      ]
    });
  }
});

// 4. AI Hyper-Polish: Enhance prompt with micro-sensor physics & organic flaws
app.post('/api/ai/enhance-prompt', async (req, res) => {
  const basePrompt = req.body?.basePrompt || '';
  const targetEngine = req.body?.targetEngine || 'chatgpt';

  try {
    const response = await callGeminiWithFallback({
      preferredModels: ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'],
      contents: `You are a master prompt engineering specialist for photorealistic AI imagery.
Refine this prompt for ${targetEngine} to improve natural photographic realism without changing any physical facts already resolved by the local engine.
Preserve all core identity restrictions, eyeglasses rules, outfit, location, camera geometry, lighting causality, and focal-length constraints exactly.
CAMERA HARD LOCK: if this is a direct front-camera selfie, the camera remains the Xiaomi 15 Ultra front camera at approximately 21mm equivalent, fixed f/2.0, with its wide smartphone perspective. Never substitute iPhone, generic Android, 24-28mm, DSLR, or another camera profile.
Only add details that are causally supported by the scene:
- Sensor noise only when low light/exposure makes it plausible; do not force a fixed ISO value.
- Real light physics: restrained asymmetric catchlights, natural highlight roll-off, and physically sourced bounce light.
- Skin realism: natural micro-texture and pores without beautification or exaggerated microscopic language.
- Lens effects only when supported by lensCondition; do not invent chromatic aberration, flare, haze, or smudges when the lens is clean.
- Prefer concise coherence over adding more photographic jargon.

Original Prompt:
"""
${basePrompt}
"""

Output the refined prompt text directly in clean English.`,
    });

    return res.json({ enhancedPrompt: response.text?.trim() || basePrompt });
  } catch (error: any) {
    console.warn('Enhance prompt fallback:', error?.message);
    const polishedFallback = `${basePrompt}\n\n[REALISM PRESERVATION]\nPreserve the camera profile, focal length, lighting causality, identity geometry, and scene physics already specified above. Add only restrained natural skin texture and physically plausible sensor noise when supported by low light. Do not substitute camera hardware or add generic 24-28mm/iPhone optics.`;
    return res.json({ enhancedPrompt: polishedFallback });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PhysFrame server running on port ${port} (0.0.0.0)`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
