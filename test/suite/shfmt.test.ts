import { getSettings } from '../../src/shFormat';
import * as assert from 'assert';
import { fileExists } from '../../src/pathUtil';

suite('shfmt path Tests', () => {
  let shfmtPath = getSettings('path');

  // Defines a Mocha unit test
  if (shfmtPath) {
    test('shfmt exists', () => {
      assert.equal(fileExists(shfmtPath), true);
    });
  }
});
