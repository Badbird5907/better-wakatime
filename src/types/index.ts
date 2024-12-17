export type ApiConfig ={
  apiUrl: string;
  apiKey: string;
}
export type Heartbeat = {
  entity: string; // file path
  type: "file" | "app" | "domain"
  category?: "coding" | "building" | "indexing" | "debugging" | "browsing" | "running tests" | "writing tests" | "manual testing" | "writing docs" | "communicating" | "code reviewing" | "researching" | "learning" | "designing"
  time: number
  project?: string
  project_root_count?: number
  branch?: string
  language?: string
  dependencies?: string
  lines?: number
  line_additions?: number
  line_deletions?: number
  lineno?: number
  cursorpos?: number
  is_write?: boolean
  plugin?: string
}

export type HeartbeatResponse = {
  data: {
    id: string;
    entity: string;
    type: "file" | "app" | "domain";
    time: number;
  }
}


export type WakaState = {
  currentFile: string | undefined;
  debugging: boolean;
  compiling: boolean;
}