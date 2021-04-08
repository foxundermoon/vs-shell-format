import * as vscode from 'vscode';
import {
  ShellDocumentFormattingEditProvider,
  Formatter,
  checkEnv,
  configurationPrefix,
  ConfigItemName,
} from './shFormat';

import { checkInstall } from './downloader';

export enum DocumentFilterScheme {
  File = 'file',
  Untitled = 'untitled',
}

const formatOnSaveConfig = 'editor.formatOnSave';
const formatDocumentCommand = 'editor.action.formatDocument';

export const shellformatPath = 'shellformat.path';

export const output = vscode.window.createOutputChannel('shellformat');
export function activate(context: vscode.ExtensionContext) {
  const settings = vscode.workspace.getConfiguration(configurationPrefix);
  const shfmter = new Formatter(context, output);
  const shFmtProvider = new ShellDocumentFormattingEditProvider(shfmter, settings);
  // checkEnv();
  checkInstall(context, output);
  const effectLanguages = settings.get<string[]>(ConfigItemName.EffectLanguages);
  if (effectLanguages) {
    for (const lang of effectLanguages) {
      for (const schemae of Object.values(DocumentFilterScheme)) {
        context.subscriptions.push(
          vscode.languages.registerDocumentFormattingEditProvider(
            { language: lang, scheme: schemae /*pattern: '*.sh'*/ },
            shFmtProvider
          )
        );
      }
    }
  }

  const formatOnSave = vscode.workspace.getConfiguration().get(formatOnSaveConfig);
  if (formatOnSave) {
    vscode.workspace.onWillSaveTextDocument((event: vscode.TextDocumentWillSaveEvent) => {
      // Only on explicit save
      if (event.reason === 1 && isAllowedTextDocument(event.document)) {
        vscode.commands.executeCommand(formatDocumentCommand);
      }
    });
  }
}

function isAllowedTextDocument(textDocument: vscode.TextDocument): boolean {
  const settings = vscode.workspace.getConfiguration(configurationPrefix);
  const effectLanguages = settings.get<string[]>(ConfigItemName.EffectLanguages);
  const { scheme } = textDocument.uri;
  if (effectLanguages) {
    const checked = effectLanguages.find((e) => e === textDocument.languageId);
    if (checked) {
      return scheme === DocumentFilterScheme.File || scheme === DocumentFilterScheme.Untitled;
    }
  }
  return false;
}

export function deactivate() {}
