import * as vscode from "vscode";
import {
  ShellDocumentFormattingEditProvider,
  Formatter,
  checkEnv
} from "./shFormat";

// import { ShfmtFormatter } from "./shfmtFormat";

export function activate(context: vscode.ExtensionContext) {
  // console.log('Congratulations, your extension "shell-format" is now active!');
  const settings = vscode.workspace.getConfiguration("shellformat");
  const shfmter = new Formatter();
  //   const symcShfmtFormater = new ShfmtFormatter(settings);
  const shFmtProvider = new ShellDocumentFormattingEditProvider(
    shfmter,
    settings
  );
  checkEnv();
  const effectLanguages = settings.get<string[]>("effectLanguages");
  if (effectLanguages) {
    for (const lang of effectLanguages) {
      context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
          { language: lang, scheme: "file" /*pattern: '*.sh'*/ },
          shFmtProvider
        )
      );
    }
  }

  const editorSettings = vscode.workspace.getConfiguration("editor");
  let formatOnSave = false;
  if (editorSettings.has("formatOnSave")) {
    formatOnSave = editorSettings.get("formatOnSave");
  }
  if (formatOnSave) {
    vscode.workspace.onWillSaveTextDocument(
      (event: vscode.TextDocumentWillSaveEvent) => {
        // Only on explicit save
        if (event.reason === 1 && isAllowedTextDocument(event.document)) {
          vscode.commands.executeCommand("editor.action.formatDocument");
        }
      }
    );
  }
}

function isAllowedTextDocument(textDocument: vscode.TextDocument): boolean {
  const settings = vscode.workspace.getConfiguration("shellformat");
  const effectLanguages = settings.get<string[]>("effectLanguages");
  const { scheme } = textDocument.uri;
  if (effectLanguages) {
    const checked = effectLanguages.find(e => e === textDocument.languageId);
    if (checked) {
      return scheme === "file" || scheme === "untitled";
    }
  }
  return false;
}

export function deactivate() {}
