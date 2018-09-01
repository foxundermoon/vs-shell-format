'use strict';

import * as vscode from 'vscode';
import { ShellDocumentFormattingEditProvider, Formatter } from './shFormat';

import { ShfmtFormatter } from './shfmtFormat';

export function activate(context: vscode.ExtensionContext) {
    // console.log('Congratulations, your extension "shell-format" is now active!');
    let settings = vscode.workspace.getConfiguration('shellformat');
    let shfmter = new Formatter()
    let symcShfmtFormater = new ShfmtFormatter(settings)
    let shFmtProvider = new ShellDocumentFormattingEditProvider(shfmter, settings)
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

    if ('runOnSave' in settings && settings['runOnSave']) {
        vscode.workspace.onWillSaveTextDocument((event: vscode.TextDocumentWillSaveEvent) => {
            // Only on explicit save
            if (event.reason === 1 && isAllowedTextDocument(event.document)) {
                vscode.commands.executeCommand('shell.format.shfmt');
            }
        });
    }
}

function isAllowedTextDocument(textDocument: vscode.TextDocument): boolean {
	if (textDocument.languageId !== 'shellscript') {
		return false;
	}

	const scheme = textDocument.uri.scheme;
	return (scheme === 'file' || scheme === 'untitled');
}

export function deactivate() {
}
