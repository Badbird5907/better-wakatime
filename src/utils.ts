import * as vscode from "vscode";
import { WakaState } from "./types";
import { logger } from "./logger";

const DEBOUNCE_MINUTES = 2;
let lastHeartbeatTime = -1;
let lastStatusBarTime = -1;
export const enoughTimeHasPassed = () => {
  const now = Date.now();
  const diff = now - lastHeartbeatTime;
  return diff > DEBOUNCE_MINUTES * 60 * 1000;
};

export const resetDebounce = () => {
  lastHeartbeatTime = Date.now();
};

export const enoughTimeHasPassedForStatusBar = () => {
  const now = Date.now();
  const diff = now - lastStatusBarTime;
  return diff > DEBOUNCE_MINUTES * 60 * 1000;
};

export const resetStatusBarDebounce = () => {
  lastStatusBarTime = Date.now();
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

export const isEqual = (a: unknown, b: unknown) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const getCurrentGitBranch = (docUri: vscode.Uri): string | undefined => { // https://stackoverflow.com/questions/45171300/read-current-git-branch-natively-using-vscode-extension
  const extension = vscode.extensions.getExtension("vscode.git");
  if (!extension) {
    logger.warn("Git extension not available");
    return undefined;
  }
  if (!extension.isActive) {
    logger.warn("Git extension not active");
    return undefined;
  }

  const git = extension.exports.getAPI(1);
  const repository = git.getRepository(docUri);
  if (!repository) {
    logger.warn("No Git repository for current document", docUri);
    return undefined;
  }

  const currentBranch = repository.state.HEAD;
  if (!currentBranch) {
    logger.warn("No HEAD branch for current document", docUri);
    return undefined;
  }

  const branchName = currentBranch.name;
  if (!branchName) {
    logger.warn("Current branch has no name", docUri, currentBranch);
    return undefined;
  }
  return branchName;
};