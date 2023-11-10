/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as index from '../src/index';

describe('index', () => {
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    index.run();
    expect(true).toBe(true);
  });
});
