import { apiFetch, ApiError } from './http';
import type { Workspace } from './types';

interface WorkspaceListEnvelope {
  items: Workspace[];
}

function normalizeWorkspaces(data: Workspace[] | WorkspaceListEnvelope): Workspace[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

export async function fetchWorkspaces(): Promise<Workspace[]> {
  try {
    const data = await apiFetch<Workspace[] | WorkspaceListEnvelope>('/api/v1/workspaces');
    return normalizeWorkspaces(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return [];
    }

    throw error;
  }
}
