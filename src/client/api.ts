export interface ClientTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  tags: string[];
  due_at?: string;
  category?: string;
  parent_id?: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) throw new Error((await response.json()).error?.message ?? '请求失败');
  return response.status === 204 ? undefined as T : response.json();
}

export const api = {
  listTasks: (search = '') => request<{ items: ClientTask[]; total: number }>('/api/tasks?search=' + encodeURIComponent(search)),
  createTask: (task: Partial<ClientTask>) => request<ClientTask>('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id: string, task: Partial<ClientTask>) => request<ClientTask>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(task) }),
  deleteTask: (id: string) => request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
  aiRun: (body: Record<string, unknown>) => request<{ runId: string; result?: { kind: string; data: unknown } }>('/api/ai/runs', { method: 'POST', body: JSON.stringify(body) }),
};
