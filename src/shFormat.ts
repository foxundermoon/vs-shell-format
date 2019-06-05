import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import { fileExists, getExecutableFileUnderPath } from "./pathUtil";

import {
  isDiffToolAvailable,
  getEdits,
  getEditsFromUnifiedDiffStr
} from "../src/diffUtils";

import {
  Diagnostic,
  DiagnosticSeverity,
  Range,
  DiagnosticCollection,
  TextDocument,
  Position,
  FormattingOptions,
  TextEdit
} from "vscode";

export const configurationPrefix = "shellformat";

export enum ConfigItemName {
  Flag = "flag",
  Path = "path",
  EffectLanguages = "effectLanguages",
  ShowError = "showError"
}

const shfmtVersion = "v2.6.4";

const defaultDownloadDirParrent = "/usr/local";
const defaultDownloadDir = "/usr/local/bin";
const defaultDownloadShfmtPath = `${defaultDownloadDir}/shfmt`;
const fileExtensionMap = {
  arm: "arm",
  arm64: "arm",
  ia32: "386",
  mips: "mips",
  x32: "386",
  x64: "amd64"
};
export class Formatter {
  static formatCommand = "shfmt";
  diagnosticCollection: DiagnosticCollection;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection(
      "shell-format"
    );
  }

  public formatDocument(
    document: TextDocument,
    options?: FormattingOptions
  ): Thenable<TextEdit[]> {
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
        let formatFlags = []; //todo add user configuration
        let settings = vscode.workspace.getConfiguration(configurationPrefix);
        let withFlagI = false;
        if (settings) {
          let flag: string = settings["flag"];
          if (flag) {
            if (flag.includes("-w")) {
              vscode.window.showWarningMessage(
                "can not set -w flag  please fix config"
              );
              reject("-w config error");
            }
            if (flag.includes("-i")) {
              withFlagI = true;
            }

            let flags = flag.split(" ");
            formatFlags.push(...flags);
          }
          let binPath: string = settings["path"];
          if (binPath) {
            if (fileExists(binPath)) {
              Formatter.formatCommand = binPath;
            } else {
              vscode.window.showErrorMessage(
                "the config shellformat.path file not exists please fix it"
              );
            }
          } else {
            if (
              !binPath &&
              process.platform != "win32" &&
              fileExists(defaultDownloadShfmtPath)
            ) {
              Formatter.formatCommand = defaultDownloadShfmtPath;
            }
          }
        }
        if (options && options.insertSpaces && !withFlagI) {
          formatFlags.push("-i", options.tabSize);
        }
        let fmtSpawn = cp.spawn(Formatter.formatCommand, formatFlags);
        let output: Buffer[] = [];
        let errorOutput: Buffer[] = [];
        let textEdits: TextEdit[] = [];
        fmtSpawn.stdout.on("data", chunk => {
          let bc: Buffer;
          if (chunk instanceof Buffer) {
            bc = chunk;
          } else {
            bc = new Buffer(chunk);
          }
          output.push(bc);
        });
        fmtSpawn.stderr.on("data", chunk => {
          let bc: Buffer;
          if (chunk instanceof Buffer) {
            bc = chunk;
          } else {
            bc = new Buffer(chunk);
          }
          errorOutput.push(bc);
        });

        fmtSpawn.on("close", (code, signal) => {
          if (code == 0) {
            this.diagnosticCollection.delete(document.uri);
            if (output.length == 0) {
              resolve(null);
            } else {
              let result = Buffer.concat(output).toString();
              let filePatch = getEdits(document.fileName, content, result);

              filePatch.edits.forEach(edit => {
                textEdits.push(edit.apply());
              });
              resolve(textEdits);
            }
          } else {
            let errMsg = "";
            if (errorOutput.length != 0) {
              errMsg = Buffer.concat(errorOutput).toString();

              // https://regex101.com/r/uPoLKg/2/
              let m = /^<standard input>:(\d+):(\d+):/.exec(errMsg);
              if (m !== null && m.length > 2) {
                let line = parseInt(m[1]);
                let coloum = parseInt(m[2]);

                const diag: Diagnostic = {
                  range: new vscode.Range(
                    new vscode.Position(line, coloum),
                    new vscode.Position(line, coloum)
                  ),
                  message: errMsg.slice(
                    "<standard input>:".length,
                    errMsg.length
                  ),
                  severity: DiagnosticSeverity.Error
                };
                this.diagnosticCollection.delete(document.uri);
                this.diagnosticCollection.set(document.uri, [diag]);
              }
            }
            // vscode.window.showWarningMessage('shell format error  please commit one issue to me:' + errMsg);
            reject(errMsg);
          }
        });
        fmtSpawn.stdin.write(content);
        fmtSpawn.stdin.end();
      } catch (e) {
        reject("Internal issues when formatted content");
      }
    });
  }
}

export class ShellDocumentFormattingEditProvider
  implements vscode.DocumentFormattingEditProvider {
  private formatter: Formatter;
  private settings: vscode.WorkspaceConfiguration;

  constructor(formatter?: Formatter, settings?: vscode.WorkspaceConfiguration) {
    if (formatter) {
      this.formatter = formatter;
    } else {
      this.formatter = new Formatter();
    }
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

export function checkEnv() {
  const settings = vscode.workspace.getConfiguration(configurationPrefix);
  let configBinPath = false;
  if (settings) {
    let flag: string = settings.get(ConfigItemName.Flag);
    if (flag) {
      if (flag.includes("-w")) {
        vscode.window.showWarningMessage(
          "can not set -w flag  please fix config"
        );
      }
    }
    let binPath: string = settings.get(ConfigItemName.Path);
    if (binPath) {
      configBinPath = true;
      if (fileExists(binPath)) {
        this.formatCommand = binPath;
      } else {
        vscode.window.showErrorMessage(
          `the config [${configurationPrefix}.${
            ConfigItemName.Path
          }] file not exists please fix it`
        );
      }
    }
  }
  if (
    !configBinPath &&
    !isExecutedFmtCommand() &&
    !fileExists(defaultDownloadShfmtPath)
  ) {
    if (process.platform == "darwin") {
      installFmtForMaxos();
    } else if (
      [
        // "android",
        // "darwin",
        "freebsd",
        "linux",
        "openbsd"
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
    `[${configurationPrefix}.${
      ConfigItemName.Path
    }]not found!  please install  manual https://mvdan.cc/sh/cmd/shfmt `
  );
}
function installFmtForMaxos() {
  if (getExecutableFileUnderPath("brew")) {
    vscode.window.showInformationMessage("will install shfmt by brew");
    const terminal = vscode.window.createTerminal();
    terminal.show();
    terminal.sendText("brew install shfmt", true);
    terminal.sendText("echo '**Enjoy shellscript!**'", true);
    terminal.sendText(
      "echo 'fork or star  https://github.com/foxundermoon/vs-shell-format'",
      true
    );
  } else {
    installForLinux();
  }
}

function installForLinux() {
  //todo fix the ubuntu permission issue
  return;
  try {
    const url = getDownloadUrl();
    vscode.window.showInformationMessage("will install shfmt by curl");
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
      terminal.sendText(
        `curl -L '${url}' --output  /usr/local/bin/shfmt`,
        true
      );
      terminal.sendText(`chmod a+x /usr/local/bin/shfmt`, true);
    } catch (err) {
      terminal.sendText(
        `sudo curl -L '${url}' --output  /usr/local/bin/shfmt`,
        true
      );
      terminal.sendText(`sudo chmod a+x /usr/local/bin/shfmt`, true);
    }
    terminal.sendText("echo '**Enjoy shellscript!**'", true);
    terminal.sendText(
      "echo 'fork or star  https://github.com/foxundermoon/vs-shell-format'",
      true
    );
  } catch (error) {
    vscode.window.showWarningMessage(
      "install shfmt faild , please install manual https://mvdan.cc/sh/cmd/shfmt"
    );
  }
}

function getDownloadUrl(): String {
  try {
    const extension = fileExtensionMap[process.arch];
    const url = `https://github.com/mvdan/sh/releases/download/${shfmtVersion}/shfmt_${shfmtVersion}_${
      process.platform
    }_${extension}`;
    return url;
  } catch (error) {
    throw new Error("nor sourport");
  }
}

function isExecutedFmtCommand(): Boolean {
  return getExecutableFileUnderPath(Formatter.formatCommand) != null;
}
