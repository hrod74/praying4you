import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const mobileAppRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function sourceFilesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFilesUnder(path);
    return ['.ts', '.tsx'].includes(extname(entry.name)) ? [path] : [];
  });
}

test('Expo allows the app to follow the device appearance', () => {
  const appConfig = JSON.parse(readFileSync(join(mobileAppRoot, 'app.json'), 'utf8'));
  assert.equal(appConfig.expo.userInterfaceStyle, 'automatic');
});

test('every themed UI module subscribes to live appearance changes', () => {
  const uiFiles = [
    ...sourceFilesUnder(join(mobileAppRoot, 'app')),
    ...sourceFilesUnder(join(mobileAppRoot, 'src/components')),
    ...sourceFilesUnder(join(mobileAppRoot, 'src/context')),
  ];

  const missingSubscription = uiFiles
    .filter((path) => readFileSync(path, 'utf8').includes('createThemedStyles'))
    .filter((path) => !/useAppTheme\s*\(\s*\)/.test(readFileSync(path, 'utf8')))
    .map((path) => path.replace(`${mobileAppRoot}/`, ''));

  assert.deepEqual(
    missingSubscription,
    [],
    `These themed modules can retain stale colors after a live device-mode switch: ${missingSubscription.join(', ')}`,
  );
});
