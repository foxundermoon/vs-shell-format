'use strict';

import * as vscode from 'vscode';
import { ShellDocumentFormattingEditProvider, Formatter } from './shFormat';

import { ShfmtFormatter } from './shfmtFormat';

export function activate(context: vscode.ExtensionContext) {
    // console.log('Congratulations, your extension "shell-format" is now active!');
    let shfmter = new Formatter()
    let symcShfmtFormater = new ShfmtFormatter()
    let shFmtProvider = new ShellDocumentFormattingEditProvider(shfmter)
    symcShfmtFormater.checkEnv();

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider({ language: 'shellscript', scheme: 'file', /*pattern: '*.sh'*/ },
            shFmtProvider
        ));
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('shell.format.shfmt', (textEditer, edit) => {
            let {document} = textEditer;
            let start;
            let end;
            start = new vscode.Position(0, 0);
            end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
            // edit.replace(new vscode.Range(start, end), symcShfmtFormater.formatDocument(document));
            let range = new vscode.Range(start, end);
            let content = document.getText(range);
            let formatedContent = symcShfmtFormater.formatCurrentDocumentWithContent(content);
            if (formatedContent != null) {
                edit.replace(range, formatedContent);
            }
        })
    );
}

export function deactivate() {
}