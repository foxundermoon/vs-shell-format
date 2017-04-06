'use strict';

import vscode = require('vscode');
import cp = require('child_process');
import path = require('path');
import { fileExists } from './pathUtil'
import { isDiffToolAvailable, getEdits, getEditsFromUnifiedDiffStr } from '../src/diffUtils';


export class Formatter {
    private formatCommand = 'shfmt';

    public formatDocument(document: vscode.TextDocument): Thenable<vscode.TextEdit[]> {
        return new Promise((resolve, reject) => {
            let filename = document.uri.path;  //document.fileName;
            let formatFlags = /*vscode.workspace.getConfiguration('shell')['formatFlags'] ||*/[];
            // let canFormatToolUseDiff = vscode.workspace.getConfiguration('go')['useDiffForFormatting'] && isDiffToolAvailable();
            // if (canFormatToolUseDiff && formatFlags.indexOf('-d') === -1) {
            // formatFlags.push('-d');
            // }
            // We ignore the -w flag that updates file on disk because that would break undo feature
            // if (formatFlags.indexOf('-w') > -1) {
            // 	formatFlags.splice(formatFlags.indexOf('-w'), 1);
            // }
            let settings = vscode.workspace.getConfiguration('shellformat')
            if (settings) {
                let flag: string = settings['flag']
                if (flag) {
                    if (flag.includes('-w')) {
                        vscode.window.showWarningMessage('can not set -w flag  please fix config')
                    }
                    let flags = flag.split(' ')
                    formatFlags.push(...flags)
                }
                let binPath: string = settings['path']
                if (binPath) {
                    if (fileExists(binPath)) {
                        this.formatCommand = binPath
                    } else {
                        vscode.window.showErrorMessage('the config shellformat.path file not exists please fix it')
                    }
                }
            }

            let t0 = Date.now();
            cp.execFile(this.formatCommand, [...formatFlags, filename], {}, (err, stdout, stderr) => {
                try {
                    if (err && (<any>err).code === 'ENOENT') {
                        return resolve(null);
                    }
                    if (err) {
                        return reject('Cannot format due to syntax errors.');
                    };

                    let textEdits: vscode.TextEdit[] = [];
                    let filePatch = getEdits(filename, document.getText(), stdout);

                    filePatch.edits.forEach((edit) => {
                        textEdits.push(edit.apply());
                    });

                    return resolve(textEdits);
                } catch (e) {
                    reject('Internal issues while getting diff from formatted content');
                }
            });
        });
    }

    public formatDocumentWithContent(content: string, filename: string): Thenable<vscode.TextEdit[]> {
        return new Promise((resolve, reject) => {
            try {
                let formatFlags = []; //todo add user configuration
                let settings = vscode.workspace.getConfiguration('shellformat')
                if (settings) {
                    let flag: string = settings['flag']
                    if (flag) {
                        if (flag.includes('-w')) {
                            vscode.window.showWarningMessage('can not set -w flag  please fix config')
                        }
                        let flags = flag.split(' ')
                        formatFlags.push(...flags)
                    }
                    let binPath: string = settings['path']
                    if (binPath) {
                        if (fileExists(binPath)) {
                            this.formatCommand = binPath
                        } else {
                            vscode.window.showErrorMessage('the config shellformat.path file not exists please fix it')
                        }
                    }
                }
                let fmtSpawn = cp.spawn(this.formatCommand, formatFlags);
                let output: Buffer[] = [];
                let errorOutput: Buffer[] = [];
                let textEdits: vscode.TextEdit[] = [];
                fmtSpawn.stdout.on('data', chunk => {
                    let bc: Buffer;
                    if (chunk instanceof Buffer) {
                        bc = chunk;
                    } else {
                        bc = new Buffer(chunk)
                    }
                    output.push(bc);
                });
                fmtSpawn.stderr.on('data', chunk => {
                    let bc: Buffer;
                    if (chunk instanceof Buffer) {
                        bc = chunk;
                    } else {
                        bc = new Buffer(chunk)
                    }
                    errorOutput.push(bc);
                });

                fmtSpawn.on('close', code => {
                    if (code == 0) {
                        if (output.length == 0) {
                            resolve(null);
                        } else {
                            let result = Buffer.concat(output).toString();
                            let filePatch = getEdits(filename, content, result);

                            filePatch.edits.forEach((edit) => {
                                textEdits.push(edit.apply());
                            });
                            resolve(textEdits);
                        }
                    } else {
                        let errMsg = "";
                        if (errorOutput.length != 0) {
                            Buffer.concat(errorOutput).toString();
                        }
                        // vscode.window.showWarningMessage('shell format error  please commit one issue to me:' + errMsg);
                        reject(errMsg);
                    }
                })
                fmtSpawn.stdin.write(content);
                fmtSpawn.stdin.end();
            } catch (e) {
                reject('Internal issues when formatted content');
            }

        });
    }
}

export class ShellDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {
    private formatter: Formatter;

    constructor(formatter?: Formatter) {
        if (formatter) {
            this.formatter = formatter;
        } else {
            this.formatter = new Formatter();
        }
    }

    public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Thenable<vscode.TextEdit[]> {

        return document.save().then(() => {
            // let formatedText = this.formatter.formatDocument(document);
            let content = document.getText();
            let formatedText = this.formatter.formatDocumentWithContent(content, document.fileName);
            return formatedText;
        });
    }
}