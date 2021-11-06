import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../../src/extension';
import {
  DownloadProgress,
  download,
  download2,
  getReleaseDownloadUrl,
  getPlatFormFilename,
} from '../../src/downloader';
import * as fs from 'fs';
import * as child_process from 'child_process';
import { config } from '../../src/config';

// Defines a Mocha test suite to group tests of similar kind together
suite('Downloader Tests', () => {
  // Defines a Mocha unit test
  test('download', async () => {
    const url = getReleaseDownloadUrl();
    const dest = `${__dirname}/../${getPlatFormFilename()}`;

    try {
      if ((await fs.promises.stat(dest)).isFile) {
        await fs.promises.unlink(dest);
      }
    } catch (err) {
      console.log(err);
    }

    const success = await download2(url, dest, (p, t) => console.log(`${(100.0 * p) / t}%`));

    await fs.promises.chmod(dest, 755);

    let version = await child_process.execFileSync(dest, ['--version'], {
      encoding: 'utf8',
    });

    version = version.replace('\n', '');

    assert.equal(version, config.shfmtVersion);
  }).timeout('60s');
});
