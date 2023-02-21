import * as https from 'https';
import * as fs from 'fs';
import { IncomingMessage } from 'http';
import { config } from './config';
import * as vscode from 'vscode';
import * as path from 'path';
import * as child_process from 'child_process';
import { getSettings } from './shFormat';
import { shellformatPath } from './extension';
const MaxRedirects = 10;
export interface DownloadProgress {
  (progress: number): void;
}
/**
 *  https://repl.it/@lordproud/Downloading-file-in-nodejs
 * @param url
 * @param path
 * @param progress
 */
export async function download(
  url: string,
  path: string,
  progress?: DownloadProgress
): Promise<any> {
  // deprecated
}

export async function download2(
  srcUrl: string,
  destPath: string,
  progress?: (downloaded: number, contentLength?: number, prev_downloaded?: number) => void
) {
  return new Promise(async (resolve, reject) => {
    let response;
    for (let i = 0; i < MaxRedirects; ++i) {
      response = await new Promise<IncomingMessage>((resolve) => https.get(srcUrl, resolve));
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        srcUrl = response.headers.location;
      } else {
        break;
      }
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      reject(new Error(`HTTP status ${response.statusCode} : ${response.statusMessage}`));
    }
    if (response.headers['content-type'] != 'application/octet-stream') {
      reject(new Error('HTTP response does not contain an octet stream'));
    } else {
      let stm = fs.createWriteStream(destPath, { mode: 0o755 });
      let pipeStm = response.pipe(stm);
      if (progress) {
        let contentLength = response.headers['content-length']
          ? Number.parseInt(response.headers['content-length'])
          : null;
        let downloaded = 0;
        let old_downloaded = 0;
        response.on('data', (chunk) => {
          old_downloaded = downloaded;
          downloaded += chunk.length;
          progress(downloaded, contentLength, old_downloaded);
        });
      }
      pipeStm.on('finish', resolve);
      pipeStm.on('error', reject);
      response.on('error', reject);
    }
  });
}

// const fileExtensionMap = {
//   // 'arm', 'arm64', 'ia32', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'
//   arm: "arm",
//   arm64: "arm",
//   ia32: "386",
//   mips: "mips",
//   x32: "386",
//   x64: "amd64"
// };

enum Arch {
  arm = 'arm',
  arm64 = 'arm64',
  i386 = '386',
  mips = 'mips',
  x64 = 'amd64',
  unknown = 'unknown',
}

enum Platform {
  darwin = 'darwin',
  freebsd = 'freebsd',
  linux = 'linux',
  netbsd = 'netbsd',
  openbsd = 'openbsd',
  windows = 'windows',
  unknown = 'unknown',
}

export function getArchExtension(): Arch {
  switch (process.arch) {
    case 'arm':
      return Arch.arm;
    case 'arm64':
      return Arch.arm64;
    case 'ia32':
      return Arch.i386;
    case 'x64':
      return Arch.x64;
    case 'mips':
      return Arch.mips;
    default:
      return Arch.unknown;
  }
}

function getExecuteableFileExt() {
  if (process.platform === 'win32') {
    return '.exe';
  } else {
    return '';
  }
}

export function getPlatform(): Platform {
  switch (process.platform) {
    case 'win32':
      return Platform.windows;
    case 'freebsd':
      return Platform.freebsd;
    case 'openbsd':
      return Platform.openbsd;
    case 'darwin':
      return Platform.darwin;
    case 'linux':
      return Platform.linux;
    default:
      return Platform.unknown;
  }
}

export function getPlatFormFilename() {
  const arch = getArchExtension();
  const platform = getPlatform();
  if (arch === Arch.unknown || platform == Platform.unknown) {
    throw new Error('do not find release shfmt for your platform');
  }
  return `shfmt_${config.shfmtVersion}_${platform}_${arch}${getExecuteableFileExt()}`;
}

export function getReleaseDownloadUrl() {
  // https://github.com/mvdan/sh/releases/download/v2.6.4/shfmt_v2.6.4_darwin_amd64
  return `https://github.com/mvdan/sh/releases/download/${
    config.shfmtVersion
  }/${getPlatFormFilename()}`;
}

export function getDestPath(context: vscode.ExtensionContext): string {
  let shfmtPath: string = getSettings('path');
  return shfmtPath || path.join(context.extensionPath, 'bin', getPlatFormFilename());
}

async function ensureDirectory(dir: string) {
  let exists = await new Promise((resolve) => fs.exists(dir, (exists) => resolve(exists)));
  if (!exists) {
    await ensureDirectory(path.dirname(dir));
    await new Promise((resolve, reject) =>
      fs.mkdir(dir, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      })
    );
  }
}

export async function checkInstall(context: vscode.ExtensionContext, output: vscode.OutputChannel) {
  if (!config.needCheckInstall) {
    return;
  }
  const destPath = getDestPath(context);
  await ensureDirectory(path.dirname(destPath));
  const needDownload = await checkNeedInstall(destPath, output);
  if (needDownload) {
    output.show();
    try {
      await cleanFile(destPath);
    } catch (err) {
      output.appendLine(`clean old file failed:[ ${destPath} ] ,please delete it mutual`);
      output.show();
      return;
    }
    const url = getReleaseDownloadUrl();
    try {
      output.appendLine('Shfmt will be downloaded automatically!');
      output.appendLine(`download url: ${url}`);
      output.appendLine(`download to: ${destPath}`);
      output.appendLine(
        `If the download fails, you can manually download it to the dest directory.`
      );
      output.appendLine(
        'Or download to another directory, and then set the "shellformat.path" as the path'
      );
      output.appendLine(`download shfmt page: https://github.com/mvdan/sh/releases`);
      output.appendLine(`You can't use this plugin until the download is successful.`);
      output.show();
      await download2(url, destPath, (d, t, p) => {
        if (Math.floor(p / 5) < Math.floor(d / 5)) {
          output.appendLine(`downloaded:[${((100.0 * d) / t).toFixed(2)}%]`);
        } else {
          output.append('.');
        }
      });
      // await fs.promises.chmod(destPath, 755);
      output.appendLine(`download success, You can use it successfully!`);
      output.appendLine('Start or issues can be submitted here https://git.io/shfmt');
    } catch (err) {
      output.appendLine(`download failed: ${err}`);
    }
    output.show();
  }
}

async function cleanFile(file: string) {
  try {
    await fs.promises.access(file);
  } catch (err) {
    // ignore
    return;
  }
  await fs.promises.unlink(file);
}

async function checkNeedInstall(dest: string, output: vscode.OutputChannel): Promise<boolean> {
  try {
    const configPath = getSettings('path');
    if (configPath) {
      try {
        await fs.promises.access(configPath, fs.constants.X_OK);
        config.needCheckInstall = false;
        return false;
      } catch (err) {
        output.appendLine(
          `"${shellformatPath}": "${configPath}"   find config shellformat path ,but the file cannot execute or not exists, so will auto download shfmt`
        );
      }
    }

    const version = await getInstalledVersion(dest);

    const needInstall = version !== config.shfmtVersion;
    if (!needInstall) {
      config.needCheckInstall = false;
    } else {
      output.appendLine(
        `current shfmt version : ${version}  ,is outdate to new version : ${config.shfmtVersion}`
      );
    }
    return needInstall;
  } catch (err) {
    output.appendLine(`shfmt hasn't downloaded yet!` + err);
    output.show();
    return true;
  }
}

async function getInstalledVersion(dest: string): Promise<string> {
  const stat = await fs.promises.stat(dest);
  if (stat.isFile()) {
    const v = child_process.execFileSync(dest, ['--version'], {
      encoding: 'utf8',
    });
    return v.replace('\n', '');
  } else {
    throw new Error(`[${dest}] is not file`);
  }
}
