import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { prayedStateKey } from './prayedStateKey.ts';

test('removing a prayed request changes the feed invalidation key', () => {
  const before = prayedStateKey(['request-2', 'request-1']);
  const after = prayedStateKey(['request-2']);
  assert.notEqual(after, before);
  assert.equal(before, prayedStateKey(['request-1', 'request-2']), 'ordering does not affect the key');
});

test('the feed passes personal prayed state to FlatList as extraData', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const feedSource = readFileSync(resolve(here, '../../app/(app)/feed/index.tsx'), 'utf8');
  assert.match(feedSource, /extraData=\{prayedExtraData\}/);
});
