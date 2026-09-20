import { useState } from 'react';
import type { ClientTask } from '../api';

type ManualTask = Pick<ClientTask, 'title' | 'description' | 'priority' | 'category' | 'tags' | 'due_at'>;

interface Props {
  busy: boolean;
  onSubmit: (task: ManualTask) => Promise<void> | void;
}

const initialState: ManualTask = { title: '', description: '', priority: 'medium', category: '', tags: [], due_at: '' };

export function TaskForm({ busy, onSubmit }: Props) {
  const [form, setForm] = useState<ManualTask>(initialState);
  const [tagText, setTagText] = useState('');
  const update = <K extends keyof ManualTask>(key: K, value: ManualTask[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    await onSubmit({ ...form, title: form.title.trim(), tags: tagText.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) });
    setForm(initialState);
    setTagText('');
  };

  return <form className="manual-form" onSubmit={submit}>
    <div className="manual-grid">
      <label>任务标题<input aria-label="任务标题" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="例如：整理会议纪要" required /></label>
      <label>优先级<select aria-label="优先级" value={form.priority} onChange={(event) => update('priority', event.target.value as ManualTask['priority'])}><option value="low">低</option><option value="medium">中</option><option value="high">高</option></select></label>
      <label>分类<input aria-label="分类" value={form.category} onChange={(event) => update('category', event.target.value)} placeholder="工作 / 生活" /></label>
      <label>截止时间<input aria-label="截止时间" type="datetime-local" value={form.due_at} onChange={(event) => update('due_at', event.target.value ? new Date(event.target.value).toISOString() : '')} /></label>
    </div>
    <label>描述<textarea aria-label="描述" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="补充一些背景" rows={2} /></label>
    <label>标签<input aria-label="标签" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="用逗号分隔，例如：会议,整理" /></label>
    <button className="confirm-button" type="submit" disabled={busy || !form.title.trim()}>{busy ? '保存中…' : '创建任务'}</button>
  </form>;
}
