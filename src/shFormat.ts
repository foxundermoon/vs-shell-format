import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileExists, getExecutableFileUnderPath, substitutePath } from './pathUtil';
import { output } from './extension';

import { isDiffToolAvailable, getEdits, getEditsFromUnifiedDiffStr } from '../src/diffUtils';

import {
  Diagnostic,
  DiagnosticSeverity,
  Range,
  DiagnosticCollection,
  TextDocument,
  Position,
  FormattingOptions,
  TextEdit,
} from 'vscode';
import * as editorconfig from 'editorconfig';

import { config } from './config';
import { getPlatFormFilename, getDestPath } from './downloader';
export const configurationPrefix = 'shellformat';

export enum ConfigItemName {
  Flag = 'flag',
  Path = 'path',
  EffectLanguages = 'effectLanguages',
  ShowError = 'showError',
  UseEditorConfig = 'useEditorConfig',
}

const defaultDownloadDirParrent = '/usr/local';
const defaultDownloadDir = '/usr/local/bin';
const defaultDownloadShfmtPath = `${defaultDownloadDir}/shfmt`;
const fileExtensionMap = {
  arm: 'arm',
  arm64: 'arm64',
  ia32: '386',
  mips: 'mips',
  x32: '386',
  x64: 'amd64',
};
export class Formatter {
  static formatCommand = 'shfmt';
  diagnosticCollection: DiagnosticCollection;

  constructor(public context: vscode.ExtensionContext, public output: vscode.OutputChannel) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('shell-format');
  }

  getShfmtPath() {
    return getDestPath(this.context);
  }

  public formatDocument(document: TextDocument, options?: FormattingOptions): Thenable<TextEdit[]> {
    const start = new Position(0, 0);
    const end = new vscode.Position(
      document.lineCount - 1,
      document.lineAt(document.lineCount - 1).text.length
    );
    const range = new vscode.Range(start, end);
    const content = document.getText(range);
    return this.formatDocumentWithContent(content, document, range, options);
  }

  public formatDocumentWithContent(
    content: string,
    document: TextDocument,
    range: Range,
    options?: vscode.FormattingOptions
  ): Thenable<vscode.TextEdit[]> {
    return new Promise((resolve, reject) => {
      try {
        let settings = vscode.workspace.getConfiguration(configurationPrefix);
        let binPath: string = getSettings('path');
        let flag: string = getSettings('flag');

        let shfmtFlags = []; // TODO: Add user configuration
        let shfmtIndent = false;
        if (/\.bats$/.test(document.fileName)) {
          shfmtFlags.push('--ln=bats');
        }

        if (binPath) {
          if (fileExists(binPath)) {
            Formatter.formatCommand = binPath;
          } else {
            let errMsg = `Invalid shfmt path in extension configuration: ${binPath}`;
            vscode.window.showErrorMessage(errMsg);
            reject(errMsg);
          }
        } else {
          Formatter.formatCommand = this.getShfmtPath();
        }

        if (settings.useEditorConfig) {
          if (flag) {
            flag = '';
            output.appendLine('shfmt flags will be ignored as EditorConfig mode is enabled.');
          }

          let edcfgOptions = editorconfig.parseSync(document.fileName);
          output.appendLine(
            `EditorConfig for file "${document.fileName}": ${JSON.stringify(edcfgOptions)}`
          );

          if (edcfgOptions.indent_style === 'tab') {
            shfmtFlags.push('-i=0');
            shfmtIndent = true;
          } else if (edcfgOptions.indent_style === 'space') {
            if (typeof edcfgOptions.indent_size === 'number') {
              shfmtFlags.push(`-i=${edcfgOptions.indent_size}`);
              shfmtIndent = true;
            }
          }

          if (edcfgOptions['shell_variant']) {
            shfmtFlags.push(`-ln=${edcfgOptions['shell_variant']}`);
          }

          if (edcfgOptions['binary_next_line']) {
            shfmtFlags.push('-bn');
          }

          if (edcfgOptions['switch_case_indent']) {
            shfmtFlags.push('-ci');
          }

          if (edcfgOptions['space_redirects']) {
            shfmtFlags.push('-sr');
          }

          if (edcfgOptions['keep_padding']) {
            shfmtFlags.push('-kp');
          }

          if (edcfgOptions['function_next_line']) {
            shfmtFlags.push('-fn');
          }
        }

        if (flag) {
          if (flag.includes('-w')) {
            let errMsg = 'Incompatible flag specified in shellformat.flag: -w';
            vscode.window.showWarningMessage(errMsg);
            reject(errMsg);
          }

          if (flag.includes('-i')) {
            shfmtIndent = true;
          }

          let flags = flag.split(' ');
          shfmtFlags.push(...flags);
        }

        if (options?.insertSpaces && !shfmtIndent) {
          shfmtFlags.push(`-i=${options.tabSize}`);
        }

        if (shfmtFlags) {
          output.appendLine(`Effective shfmt flags: ${shfmtFlags}`);
        }

        let shfmt = child_process.spawn(Formatter.formatCommand, shfmtFlags);

        let shfmtOut: Buffer[] = [];
        shfmt.stdout.on('data', (chunk) => {
          let bc: Buffer;
          if (chunk instanceof Buffer) {
            bc = chunk;
          } else {
            bc = new Buffer(chunk);
          }
          shfmtOut.push(bc);
        });
        let shfmtErr: Buffer[] = [];
        shfmt.stderr.on('data', (chunk) => {
          let bc: Buffer;
          if (chunk instanceof Buffer) {
            bc = chunk;
          } else {
            bc = new Buffer(chunk);
          }
          shfmtErr.push(bc);
        });

        let textEdits: TextEdit[] = [];
        shfmt.on('close', (code, signal) => {
          if (code == 0) {
            this.diagnosticCollection.delete(document.uri);

            if (shfmtOut.length != 0) {
              let result = Buffer.concat(shfmtOut).toString();
              let filePatch = getEdits(document.fileName, content, result);

              filePatch.edits.forEach((edit) => {
                textEdits.push(edit.apply());
              });

              resolve(textEdits);
            } else {
              resolve(null);
            }
          } else {
            let errMsg = '';

            if (shfmtErr.length != 0) {
              errMsg = Buffer.concat(shfmtErr).toString();

              // https://regex101.com/r/uPoLKg/2/
              let errLoc = /^<standard input>:(\d+):(\d+):/.exec(errMsg);

              if (errLoc !== null && errLoc.length > 2) {
                let line = parseInt(errLoc[1]);
                let column = parseInt(errLoc[2]);

                const diag: Diagnostic = {
                  range: new vscode.Range(
                    new vscode.Position(line, column),
                    new vscode.Position(line, column)
                  ),
                  message: errMsg.slice('<standard input>:'.length, errMsg.length),
                  severity: DiagnosticSeverity.Error,
                };

                this.diagnosticCollection.delete(document.uri);
                this.diagnosticCollection.set(document.uri, [diag]);
              }
            }

            reject(errMsg);
          }
        });

        shfmt.stdin.write(content);
        shfmt.stdin.end();
      } catch (e) {
        reject(`Fatal error calling shfmt: ${e}`);
      }
    });
  }
}

export class ShellDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {
  private settings: vscode.WorkspaceConfiguration;

  constructor(public formatter: Formatter, settings?: vscode.WorkspaceConfiguration) {
    if (settings === undefined) {
      this.settings = vscode.workspace.getConfiguration(configurationPrefix);
    } else {
      this.settings = settings;
    }
  }

  public provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Thenable<vscode.TextEdit[]> {
    // const onSave = this.settings["onsave"];
    // if (!onSave) {
    //   console.log(onSave);
    // }
    return this.formatter.formatDocument(document, options);
  }
}

/**
 * deprecated
 * will clean
 *  */

export function checkEnv() {
  const settings = vscode.workspace.getConfiguration(configurationPrefix);
  let configBinPath = false;
  if (settings) {
    let flag: string = settings.get(ConfigItemName.Flag);
    if (flag) {
      if (flag.includes('-w')) {
        vscode.window.showWarningMessage('can not set -w flag  please fix config');
      }
    }
    let binPath: string = settings.get(ConfigItemName.Path);
    if (binPath) {
      configBinPath = true;
      if (fileExists(binPath)) {
        this.formatCommand = binPath;
      } else {
        vscode.window.showErrorMessage(
          `the config [${configurationPrefix}.${ConfigItemName.Path}] file not exists please fix it`
        );
      }
    }
  }
  if (!configBinPath && !isExecutedFmtCommand() && !fileExists(defaultDownloadShfmtPath)) {
    if (process.platform == 'darwin') {
      installFmtForMaxos();
    } else if (
      [
        // "android",
        // "darwin",
        'freebsd',
        'linux',
        'openbsd',
        // "sunos",
        // "win32",
        // "cygwin"
      ].includes(process.platform)
    ) {
      // installForLinux();
      showMamualInstallMessage();
    } else {
      showMamualInstallMessage();
    }
  }
}

function showMamualInstallMessage() {
  vscode.window.showErrorMessage(
    `[${configurationPrefix}.${ConfigItemName.Path}]not found!  please install manually https://mvdan.cc/sh/cmd/shfmt `
  );
}
function installFmtForMaxos() {
  if (getExecutableFileUnderPath('brew')) {
    vscode.window.showInformationMessage('will install shfmt by brew');
    const terminal = vscode.window.createTerminal();
    terminal.show();
    terminal.sendText('brew install shfmt', true);
    terminal.sendText("echo '**Enjoy shellscript!**'", true);
    terminal.sendText("echo 'fork or star  https://github.com/foxundermoon/vs-shell-format'", true);
  } else {
    installForLinux();
  }
}

/** will clean */
function installForLinux() {
  //todo fix the ubuntu permission issue
  return;
  try {
    const url = getDownloadUrl();
    vscode.window.showInformationMessage('will install shfmt by curl');
    const terminal = vscode.window.createTerminal();
    terminal.show();
    if (!fs.existsSync(defaultDownloadDir)) {
      try {
        fs.accessSync(defaultDownloadDirParrent, fs.constants.W_OK);
        terminal.sendText(`mkdir -p ${defaultDownloadDir}`, true);
      } catch (err) {
        terminal.sendText(`sudo mkdir -p ${defaultDownloadDir}`, true);
      }
    }

    try {
      fs.accessSync(defaultDownloadDir, fs.constants.W_OK);
      terminal.sendText(`curl -L '${url}' --output  /usr/local/bin/shfmt`, true);
      terminal.sendText(`chmod a+x /usr/local/bin/shfmt`, true);
    } catch (err) {
      terminal.sendText(`sudo curl -L '${url}' --output  /usr/local/bin/shfmt`, true);
      terminal.sendText(`sudo chmod a+x /usr/local/bin/shfmt`, true);
    }
    terminal.sendText("echo '**Enjoy shellscript!**'", true);
    terminal.sendText("echo 'fork or star https://github.com/foxundermoon/vs-shell-format'", true);
  } catch (error) {
    vscode.window.showWarningMessage(
      'install shfmt failed , please install manually https://mvdan.cc/sh/cmd/shfmt'
    );
  }
}

function getDownloadUrl(): String {
  try {
    const extension = fileExtensionMap[process.arch];
    const url = `https://github.com/mvdan/sh/releases/download/${config.shfmtVersion}/shfmt_${config.shfmtVersion}_${process.platform}_${extension}`;
    return url;
  } catch (error) {
    throw new Error('nor sourport');
  }
}

/**
 * will clean
 */
function isExecutedFmtCommand(): Boolean {
  return getExecutableFileUnderPath(Formatter.formatCommand) != null;
}

export function getSettings(key: string) {
  let settings = vscode.workspace.getConfiguration(configurationPrefix);
  if (key === 'path' && settings[key]) {
    return substitutePath(settings[key]);
  }
  return key !== undefined ? settings[key] : null;
}
