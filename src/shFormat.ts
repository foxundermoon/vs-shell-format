'use strict';

import vscode = require('vscode');
import cp = require('child_process');
import path = require('path');
import { isDiffToolAvailable, getEdits, getEditsFromUnifiedDiffStr } from '../src/diffUtils';


export class Formatter {
    private formatCommand = 'shfmt';

    // constructor() {
    // 	let formatTool = vscode.workspace.getConfiguration('go')['formatTool'];
    // 	if (formatTool) {
    // 		this.formatCommand = formatTool;
    // 	}
    // }

    public formatDocument(document: vscode.TextDocument): Thenable<vscode.TextEdit[]> {
        return new Promise((resolve, reject) => {
            let filename = document.fileName;

            // let formatCommandBinPath = getBinPath(this.formatCommand);
            let formatFlags = /*vscode.workspace.getConfiguration('shell')['formatFlags'] ||*/[];
            // let canFormatToolUseDiff = vscode.workspace.getConfiguration('go')['useDiffForFormatting'] && isDiffToolAvailable();
            // if (canFormatToolUseDiff && formatFlags.indexOf('-d') === -1) {
            // formatFlags.push('-d');
            // }
            // We ignore the -w flag that updates file on disk because that would break undo feature
            // if (formatFlags.indexOf('-w') > -1) {
            // 	formatFlags.splice(formatFlags.indexOf('-w'), 1);
            // }
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
                    let filePatch =  getEdits(filename, document.getText(), stdout);

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
        console.log("start format");
        return document.save().then(() => {
            let formatedText = this.formatter.formatDocument(document);
            console.log(formatedText);

            return formatedText;
        });
    }
}

// package main; import \"fmt\"; func main() {fmt.Print(\"Hello\")}
// package main; import \"fmt\"; import \"math\"; func main() {fmt.Print(\"Hello\")}
// package main; import \"fmt\"; import \"gopkg.in/Shopify/sarama.v1\"; func main() {fmt.Print(sarama.V0_10_0_0)}
