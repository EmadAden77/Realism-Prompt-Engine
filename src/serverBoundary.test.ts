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

console.log('✓ Server runtime boundary: no client-engine imports and all relative ESM imports are explicit.');
