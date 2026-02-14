import { apiFetch } from './http';
import type { QuickAddInput, TaskListResponse, TaskQuery } from './types';

function paramsFromQuery(query: TaskQuery): URLSearchParams {
  const params = new URLSearchParams();

  params.set('workspace_id', query.workspaceId);
  params.set('view', query.view);

  if (query.project) params.set('project', query.project);
  if (query.label) params.set('label', query.label);
  if (query.q) params.set('q', query.q);
  if (query.filterId) params.set('filter_id', query.filterId);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  if (query.limit) params.set('limit', String(query.limit));
  if (query.cursor) params.set('cursor', query.cursor);

  return params;
}

export async function fetchTasks(query: TaskQuery): Promise<TaskListResponse> {
  const params = paramsFromQuery(query);
  return apiFetch<TaskListResponse>(`/api/v1/tasks?${params.toString()}`);
}

export async function quickAddTask(input: QuickAddInput): Promise<unknown> {
  return apiFetch('/api/v1/tasks/quick-add', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
