import { workspace } from "vscode";
import { ApiConfig } from "./types";

const normalizeApiUrl = (apiUrl: string) => {
  const suffixes = ['/', '.bulk', '/users/current/heartbeats', '/heartbeats', '/heartbeat'];
  for (const suffix of suffixes) {
    if (apiUrl.endsWith(suffix)) {
      apiUrl = apiUrl.slice(0, -suffix.length);
    }
  }
  return apiUrl;
};


export const getApiConfigs = () => {
  const apiConfigs = workspace.getConfiguration('better-wakatime').get('apiConfig') as ApiConfig[];
  return apiConfigs.map((config) => ({
    ...config,
    apiUrl: normalizeApiUrl(config.apiUrl),
  }));
};