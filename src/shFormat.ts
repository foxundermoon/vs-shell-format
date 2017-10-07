"use strict";

import vscode = require("vscode");
import cp = require("child_process");
import path = require("path");
import { fileExists } from "./pathUtil";
import {
  isDiffToolAvailable,
  getEdits,
  getEditsFromUnifiedDiffStr
} from "../src/diffUtils";

export class Formatter {
  private formatCommand = "shfmt";

  public formatDocument(
    document: vscode.TextDocument
  ): Thenable<vscode.TextEdit[]> {
    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(
      document.lineCount - 1,
      document.lineAt(document.lineCount - 1).text.length
    );
    const range = new vscode.Range(start, end);
    const content = document.getText(range);
    return this.formatDocumentWithContent(content, document.fileName);
  }

  public formatDocumentWithContent(
    content: string,
    filename: string
  ): Thenable<vscode.TextEdit[]> {
    return new Promise((resolve, reject) => {
      try {
        let formatFlags = []; //todo add user configuration
        let settings = vscode.workspace.getConfiguration("shellformat");
        if (settings) {
          let flag: string = settings["flag"];
          if (flag) {
            if (flag.includes("-w")) {
              vscode.window.showWarningMessage(
                "can not set -w flag  please fix config"
              );
            }
            let flags = flag.split(" ");
            formatFlags.push(...flags);
          }
          let binPath: string = settings["path"];
          if (binPath) {
            if (fileExists(binPath)) {
              this.formatCommand = binPath;
            } else {
              vscode.window.showErrorMessage(
                "the config shellformat.path file not exists please fix it"
              );
            }
          }
        }
        let fmtSpawn = cp.spawn(this.formatCommand, formatFlags);
        let output: Buffer[] = [];
        let errorOutput: Buffer[] = [];
        let textEdits: vscode.TextEdit[] = [];
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

        fmtSpawn.on("close", code => {
          if (code == 0) {
            if (output.length == 0) {
              resolve(null);
            } else {
              let result = Buffer.concat(output).toString();
              let filePatch = getEdits(filename, content, result);

              filePatch.edits.forEach(edit => {
                textEdits.push(edit.apply());
              });
              resolve(textEdits);
            }
          } else {
            let errMsg = "";
            if (errorOutput.length != 0) {
              errMsg = Buffer.concat(errorOutput).toString();
              const showError = settings["showError"];
              if (showError) {
                vscode.window.showErrorMessage(errMsg);
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

  constructor(formatter?: Formatter) {
    if (formatter) {
      this.formatter = formatter;
    } else {
      this.formatter = new Formatter();
    }
    this.settings = vscode.workspace.getConfiguration("shellformat");
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
    return this.formatter.formatDocument(document);
  }
}
