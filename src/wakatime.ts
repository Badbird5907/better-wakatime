import * as vscode from "vscode";
import { getApiConfigs } from "./config";
import { logger } from "./logger";
import { ApiConfig, Heartbeat, HeartbeatResponse, WakaState } from "./types";
import { enoughTimeHasPassed, getCategory, getFileName, getProjectName, getProjectRootCount, resetDebounce } from "./utils";
import isEqual from "lodash.isequal";

const sendHeartbeatToServer = async (apiConfig: ApiConfig, heartbeat: Heartbeat, machineName?: string): 
Promise<{ success: false; message: string } | { success: true, data: HeartbeatResponse }> => {
  const url = `${apiConfig.apiUrl}/users/current/heartbeats?api_key=${apiConfig.apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Machine-Name": machineName ?? "desktop",
    },
    body: JSON.stringify(heartbeat),
  });
  if (!resp.ok) {
    const message = await resp.text();
    // throw new Error(`Failed to send heartbeat to server: ${resp.statusText}`);
    return {
      success: false,
      message,
    };
  }
  const json = await resp.json();
  return {
    success: true,
    data: json as HeartbeatResponse,
  };
};

const getOperatingSystem = () => {
  if (process.platform === "win32") {
    return "Windows";
  } else if (process.platform === "darwin") {
    return "Mac";
  } else if (process.platform === "linux") {
    return "Linux";
  }
  return process.platform;
};

const agent = `(${getOperatingSystem()}) vscode/${vscode.version} better-wakatime/${vscode.extensions.getExtension("better-wakatime")?.packageJSON.version}`;

export let currentState: WakaState = {
  currentFile: undefined,
  debugging: false,
  compiling: false,
};
let lastState: WakaState | undefined = undefined;
export const heartbeat = async (force?: boolean) => {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {return;}
  const document = activeTextEditor.document;
  if (!document) {return;}
  if (!force && isEqual(currentState, lastState) && !enoughTimeHasPassed()) {
    logger.debug(`Conditions not met to send heartbeat, skipping...`);
    return;
  }
  const { selection: { start: currentPos } } = activeTextEditor;
  resetDebounce();

  const data: Heartbeat = {
    entity: getFileName(document),
    type: "file",
    time: Date.now() / 1000,
    lineno: currentPos.line + 1,
    cursorpos: currentPos.character + 1,
    is_write: force,
    category: getCategory(document, currentState),
    project: getProjectName(document),
    language: document.languageId,
    project_root_count: getProjectRootCount(document),
    plugin: agent,
  };

  await sendHeartbeat(data);
  lastState = currentState;
};

export const sendHeartbeat = async (heartbeat: Heartbeat) => {
  logger.debug(`Sending heartbeat: ${JSON.stringify(heartbeat, null, 2)}`);
  const apiConfigs = getApiConfigs();
  const promises = apiConfigs.map((apiConfig) => sendHeartbeatToServer(apiConfig, heartbeat));
  await Promise.all(promises).then(
    (results) => {
      results.forEach((res) => {
        if (!res.success) {
          logger.error(`Failed to send heartbeat to server: ${res.message}`);
          logger.error(`Heartbeat: ${JSON.stringify(heartbeat)}`);
          vscode.window.showErrorMessage(`Failed to send heartbeat to server: ${res.message}`);
        }
      });
    }
  );
};
