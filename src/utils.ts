import * as vscode from "vscode";
import { WakaState } from "./types";

const DEBOUNCE_MINUTES = 2;
let lastHeartbeatTime = -1;
export const enoughTimeHasPassed = () => {
  const now = Date.now();
  const diff = now - lastHeartbeatTime;
  return diff > DEBOUNCE_MINUTES * 60 * 1000;
};

export const resetDebounce = () => {
  lastHeartbeatTime = Date.now();
};

export const getCategory = (doc: vscode.TextDocument, state: WakaState) => {
  if (state.debugging) {
    return "debugging";
  }
  if (state.compiling) {
    return "building";
  }
  if (doc.uri.fsPath.endsWith(".test.ts") || doc.uri.fsPath.endsWith(".spec.ts")) {
    return "writing tests";
  }
  if (doc.uri.scheme === "pr") {
    return "code reviewing";
  }
  return "coding";
};

export const getProjectName = (doc: vscode.TextDocument) => {
  const { uri } = doc;
  // we want to grab the root folder name
  const folder = vscode.workspace.getWorkspaceFolder(uri);
  if (!folder) {
    return vscode.workspace.workspaceFolders?.[0]?.name ?? vscode.workspace.name ?? "unknown";
  }
  return folder.name;
};

export const getProjectRootCount = (doc: vscode.TextDocument) => {
  const { uri } = doc;
  const folder = vscode.workspace.getWorkspaceFolder(uri);
  if (!folder) {
    return 0;
  }
  return folder.uri.fsPath.split("/").length;
};

export const getFileName = (doc: vscode.TextDocument) => {
  if (doc.uri.scheme === "vscode-remote") {
    return (doc.uri.authority + doc.uri.path).replace("ssh-remote+", "ssh://");
  }
  return doc.fileName;
};
