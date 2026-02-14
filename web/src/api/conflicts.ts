import { apiFetch } from './http';
import type { ConflictItem } from './types';

interface ConflictListEnvelope {
  items: ConflictItem[];
}

function normalizeConflicts(data: ConflictItem[] | ConflictListEnvelope): ConflictItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

export async function fetchConflicts(workspaceId: string): Promise<ConflictItem[]> {
  const params = new URLSearchParams({ workspace_id: workspaceId, status: 'open' });
  const data = await apiFetch<ConflictItem[] | ConflictListEnvelope>(
    `/api/v1/conflicts?${params.toString()}`
  );
  return normalizeConflicts(data);
}
