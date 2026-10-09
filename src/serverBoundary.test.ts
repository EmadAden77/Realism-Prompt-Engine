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

console.log('✓ Server runtime boundary: no client-engine imports and all relative ESM imports are explicit.');
