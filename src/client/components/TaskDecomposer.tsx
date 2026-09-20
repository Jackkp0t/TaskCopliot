import type { ClientTask } from '../api';

interface Props {
  tasks: Array<Partial<ClientTask> & { title: string }>;
  busy: boolean;
  onChange: (index: number, title: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TaskDecomposer({ tasks, busy, onChange, onConfirm, onCancel }: Props) {
  if (!tasks.length) return null;
  return <div className="decomposer panel-accent"><div className="draft-label">智能拆解 · 确认后才会创建</div><div className="subtask-list">{tasks.map((task, index) => <div className="subtask-item" key={`${task.title}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><input value={task.title} onChange={(event) => onChange(index, event.target.value)} /></div>)}</div><div className="decomposer-actions"><button onClick={onCancel}>取消</button><button className="confirm-button" disabled={busy} onClick={onConfirm}>{busy ? '创建中…' : '确认创建子任务'}</button></div></div>;
}
