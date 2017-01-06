import vscode = require('vscode');
import cp = require('child_process');

import { getExecutableFileUnderPath } from './pathUtil';

export class ShfmtFormatter {
    private formatCommand = 'shfmt';
    public formatDocument(document: vscode.TextDocument): string {
        let filename = document.uri.path// document.fileName;

        let formatFlags = /*vscode.workspace.getConfiguration('shell')['formatFlags'] ||*/[];
        let result = cp.execFileSync(this.formatCommand, [...formatFlags, filename], <cp.SpawnSyncOptionsWithStringEncoding>{ encoding: "utf8" });
        return result
    }
    public checkEnv() {
        if (!this.isExecutedFmtCommand()) {
            vscode.window.showErrorMessage('shfmt not found! run go get -u github.com/mvdan/sh/cmd/shfmt to install');
        }
    }

    public formatCurrentDocumentWithContent(content: string): string {
        let formatFlags = []
       let cmdSpawn= cp.spawnSync(this.formatCommand, 
       formatFlags,
        <cp.SpawnSyncOptionsWithStringEncoding>{ 
            encoding: "utf8",
        input:content
     });
       if(cmdSpawn.status ==0){
           return cmdSpawn.stdout;
       }else{
           vscode.window.showWarningMessage('shell format error:'+cmdSpawn.stderr);
           return null;
       }
    }
    private isExecutedFmtCommand() {
        return getExecutableFileUnderPath(this.formatCommand) != null;
    }
}