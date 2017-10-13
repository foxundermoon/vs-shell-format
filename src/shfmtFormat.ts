import * as vscode from "vscode";
import * as cp from "child_process";
import { fileExists } from "./pathUtil";

import { getExecutableFileUnderPath } from "./pathUtil";

export class ShfmtFormatter {
  private formatCommand = "shfmt";
  public formatDocument(document: vscode.TextDocument): string {
    let filename = document.uri.path; // document.fileName;

    let formatFlags = /*vscode.workspace.getConfiguration('shell')['formatFlags'] ||*/ [];
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
        formatFlags.push(flags);
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
    let result = cp.execFileSync(
      this.formatCommand,
      [...formatFlags, filename],
      <cp.SpawnSyncOptionsWithStringEncoding>{ encoding: "utf8" }
    );
    return result;
  }
  public checkEnv() {
    let settings = vscode.workspace.getConfiguration("shellformat");
    let configBinPath = false;
    if (settings) {
      let flag: string = settings["flag"];
      if (flag) {
        if (flag.includes("-w")) {
          vscode.window.showWarningMessage(
            "can not set -w flag  please fix config"
          );
        }
      }
      let binPath: string = settings["path"];
      if (binPath) {
        configBinPath = true;
        if (fileExists(binPath)) {
          this.formatCommand = binPath;
        } else {
          vscode.window.showErrorMessage(
            "the config shellformat.path file not exists please fix it"
          );
        }
      }
    }
    if (!configBinPath && !this.isExecutedFmtCommand()) {
      vscode.window.showErrorMessage(
        "shellformat.path not config please download  https://github.com/mvdan/sh/releases or go get -u mvdan.cc/sh/cmd/shfmt to install"
      );
    }
  }

  public formatCurrentDocumentWithContent(content: string): string {
    let formatFlags = [];
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
    let cmdSpawn = cp.spawnSync(
      this.formatCommand,
      formatFlags,
      <cp.SpawnSyncOptionsWithStringEncoding>{
        encoding: "utf8",
        input: content
      }
    );
    if (cmdSpawn.status == 0) {
      return cmdSpawn.stdout;
    } else {
      vscode.window.showWarningMessage("shell format error:" + cmdSpawn.stderr);
      return null;
    }
  }
  private isExecutedFmtCommand() {
    return getExecutableFileUnderPath(this.formatCommand) != null;
  }
}
