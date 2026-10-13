import fs from 'node:fs';

const serverSource = fs.readFileSync(new URL('../server.ts', import.meta.url), 'utf8');

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error('Server boundary assertion failed: ' + message);
  }
};

const relativeImports = Array.from(
  serverSource.matchAll(/from\s+['"]([^'"]+)['"]/g),
  match => match[1]
).filter(specifier => specifier.startsWith('.'));

assert(
  !relativeImports.some(specifier => specifier.startsWith('./src/engine/')),
  'server.ts must not import client physics/engine modules; a transitive ESM failure would crash every API route'
);

for (const specifier of relativeImports) {
  assert(
    /\.(?:ts|js|mjs|cjs|json)$/.test(specifier),
    `relative server import must have an explicit ESM extension: ${specifier}`
  );
}


assert(
  serverSource.includes("compileUnifiedPromptPipeline(req.body.sceneState)"),
  'prompt enhancement must independently recompute scene validation on the server'
);
assert(
  serverSource.includes("!pipeline.diagnostics.anglePromptReady"),
  'prompt enhancement must deny requests without verified camera evidence'
);
assert(
  serverSource.includes("basePrompt !== pipeline.platforms[targetEngine].prompt"),
  'prompt enhancement must reject prompt text not derived from the validated scene'
);
assert(
  serverSource.indexOf("!pipeline.diagnostics.anglePromptReady") < serverSource.indexOf("Refine this prompt for"),
  'readiness check must run before AI enhancement'
);


assert(
  serverSource.includes("source: 'unavailable'") &&
    serverSource.includes("return sendGeminiFailure(res, error, 'تحليل الصورة')") &&
    serverSource.includes("return sendGeminiFailure(res, error, 'تدقيق الواقعية')") &&
    serverSource.includes("return sendGeminiFailure(res, error, 'تعزيز البرومبت')"),
  'Gemini failures must be reported as unavailable, not successful mock analysis/enhancement'
);
assert(
  !serverSource.includes("realismScore: 0,") &&
    !serverSource.includes('Graceful fallback profile'),
  'Gemini failure must not fabricate a face profile or a zero audit score'
);
assert(
  serverSource.includes("app.use('/api/ai'") &&
    serverSource.includes('current.count > 90') &&
    serverSource.includes("limit: '5mb'"),
  'AI endpoints must reject cross-origin abuse, excess requests, and oversized bodies'
);
assert(
  serverSource.includes("'gemini-3.6-flash'") &&
    !serverSource.includes("'gemini-3.5-flash'"),
  'Fallback model should not use deprecated 3.5 Flash routing'
);

const appSource = fs.readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
assert(
  appSource.includes('referenceImageId: null,') &&
    appSource.includes("referenceImageId: blob ? 'local-reference' : null") &&
    appSource.includes("referenceImageId: 'local-reference'"),
  'Image reference must be tied to IndexedDB, not a hardcoded image filename'
);
assert(
  appSource.includes('enhancedPromptBasesRef.current.chatgpt === chatGPTPrompt') &&
    appSource.includes('enhancedPromptBasesRef.current.gemini === geminiPrompt') &&
    appSource.includes('latestSceneRef.current'),
  'Enhanced prompts and async Gemini responses must be tied to the current scene'
);

console.log('✓ Server runtime boundary: no client-engine imports and all relative ESM imports are explicit.');
