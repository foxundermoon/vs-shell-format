import vscode = require('vscode');
import cp = require('child_process');

import { getExecutableFileUnderPath } from './pathUtil';

export class ShfmtFormatter {
    private formatCommand = 'shfmt';
    public formatDocument(document: vscode.TextDocument): string {
        let filename = document.fileName;
        let formatFlags = /*vscode.workspace.getConfiguration('shell')['formatFlags'] ||*/[];
        let result = cp.execFileSync(this.formatCommand, [...formatFlags, filename], { encoding: "utf-8" });
        return result.toString()
    }
    public checkEnv() {
        if (!this.isExecutedFmtCommand()) {
            vscode.window.showErrorMessage('shfmt not found! run go get -u github.com/mvdan/sh/cmd/shfmt to install');
        }
    }
    private isExecutedFmtCommand() {
        return getExecutableFileUnderPath(this.formatCommand) != null;
    }
}