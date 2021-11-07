import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

let binPathCache: { [bin: string]: string } = {};
export function getExecutableFileUnderPath(toolName: string) {
  let cachePath = binPathCache[toolName];
  if (cachePath) {
    return cachePath;
  }
  toolName = correctBinname(toolName);
  if (path.isAbsolute(toolName)) {
    return toolName;
  }
  let paths = process.env['PATH'].split(path.delimiter);
  for (let i = 0; i < paths.length; i++) {
    let binpath = path.join(paths[i], toolName);
    if (fileExists(binpath)) {
      binPathCache[toolName] = binpath;
      return binpath;
    }
  }
  return null;
}

function correctBinname(binname: string) {
  if (process.platform === 'win32' && path.extname(binname) !== '.exe') {
    return binname + '.exe';
  } else {
    return binname;
  }
}

export function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch (e) {
    return false;
  }
}

export function substitutePath(filePath: string): string {
  let workspaceFolder =
    vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
  return filePath
    .replace(/\${workspaceRoot}/g, workspaceFolder || '')
    .replace(/\${workspaceFolder}/g, workspaceFolder || '');
}
