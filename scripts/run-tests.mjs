// Discover and execute every TypeScript regression test, reporting ALL failures.
// Isolate each test in its own process so one early failure does not hide the rest.
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

function findTests(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? findTests(path) : entry.isFile() && entry.name.endsWith('.test.ts') ? [path] : [];
  });
}
const files = findTests('src').sort();
let failed = 0;
for (const file of files) {
  const testName = relative(process.cwd(), join(process.cwd(), file));
  console.log('\n▶ ' + testName);
  const result = spawnSync('./node_modules/.bin/tsx', [file], {
    encoding: 'utf8', stdio: 'pipe', maxBuffer: 20 * 1024 * 1024
  });
  if (result.status === 0) {
    console.log('✓ PASS ' + testName);
  } else {
    failed++;
    console.error('✗ FAIL ' + testName + ' (exit ' + result.status + ')');
    console.error((result.stdout || '').slice(-2500));
    console.error((result.stderr || '').slice(-3500));
  }
}
console.log('\n' + (files.length - failed) + '/' + files.length + ' test files passed.');
if (failed) process.exitCode = 1;
