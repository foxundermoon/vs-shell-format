import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as myExtension from "../src/extension";
import { DownloadProgress, download, download2 } from "../src/downloader";
import * as fs from "fs";

// Defines a Mocha test suite to group tests of similar kind together
suite("Downloader Tests", () => {
  // Defines a Mocha unit test
  test("download", async () => {
    const url =
      "https://github.com/mvdan/sh/releases/download/v2.6.4/shfmt_v2.6.4_darwin_amd64";
    const dest = `${__dirname}/../shfmt`;

    try {
      if ((await fs.promises.stat(dest)).isFile) {
        await fs.promises.unlink(dest);
      }
    } catch (err) {
      console.log(err);
    }

    const success = await download2(url, dest, (p, t) =>
      console.log(`${(100.0 * p) / t}%`)
    );
  }).timeout("60s");
});
