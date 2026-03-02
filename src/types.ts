export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  apiId?: string;
  description: string;
}

export interface ApiConfig {
  id: string;
  name: string;
  provider: string;
  key: string;
  version: string;
}

export interface Connection {
  id: string;
  name: string;
  ip: string;
  port: string;
  token: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'queued' | 'in-progress' | 'complete';
}

export interface MissionDocument {
  id: string;
  name: string;
  content: string;
  type: string;
  size: string;
  updatedAt: string;
}

export interface AppState {
  agents: Agent[];
  apis: ApiConfig[];
  connections: Connection[];
  tasks: Task[];
  documents: MissionDocument[];
  notes: string;
  theme: 'light' | 'dark';
}
