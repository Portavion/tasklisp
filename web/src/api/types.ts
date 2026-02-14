export type TaskView =
  | 'inbox'
  | 'today'
  | 'upcoming'
  | 'overdue'
  | 'project'
  | 'label'
  | 'search'
  | 'filter';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: SessionUser;
  providers: string[];
}

export interface AuthProvidersResponse {
  google_login_url: string;
  apple_login_url: string;
}

export interface Workspace {
  id: string;
  name: string;
  timezone?: string;
}

export interface Task {
  node_id: string;
  workspace_id: string;
  file_path: string;
  title: string;
  todo_state: string | null;
  priority: 'A' | 'B' | 'C' | null;
  tags: string[];
  scheduled_raw: string | null;
  deadline_raw: string | null;
  scheduled_at: string | null;
  deadline_at: string | null;
  props: Record<string, string>;
  is_task: boolean;
  row_version: number;
  updated_at: string;
  body_text?: string;
}

export interface TaskListResponse {
  items: Task[];
  next_cursor: string | null;
}

export interface TaskQuery {
  workspaceId: string;
  view: TaskView;
  project?: string;
  label?: string;
  q?: string;
  filterId?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}

export interface QuickAddInput {
  workspace_id: string;
  input: string;
  target?: {
    file_path: string;
    heading: string;
  };
  timezone?: string;
}

export interface ConflictItem {
  id: string;
  node_id: string;
  conflicting_fields: string[];
  status: string;
  detected_at: string;
}
