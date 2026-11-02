import { expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// zustand v5 passes selector(api.getState()) straight to useSyncExternalStore as
// getSnapshot. A selector that builds a new object/array on every call returns a
// fresh snapshot identity each time, so React re-renders forever and throws error
// #185 ("Maximum update depth exceeded"). Select primitives one hook call each.
const OBJECT_SELECTOR = /use[A-Z]\w*Store\(\s*(?:\(\w+\)|\w+)\s*=>\s*\(\s*\{/;

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...sourceFiles(path));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

const srcRoot = fileURLToPath(new URL('../src', import.meta.url));

test('zustand selectors return stable values', () => {
  const offenders = sourceFiles(srcRoot)
    .filter((file) => OBJECT_SELECTOR.test(readFileSync(file, 'utf8')))
    .map((file) => file.slice(srcRoot.length + 1));

  expect(offenders).toEqual([]);
});
