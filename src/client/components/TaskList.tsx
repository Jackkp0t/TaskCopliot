import { useState } from 'react';
import type { ClientTask } from '../api';

interface Props {
  tasks: ClientTask[];
  onToggle: (task: ClientTask) => void;
  onDelete: (task: ClientTask) => void;
  onDecompose: (task: ClientTask) => void;
  onEdit: (task: ClientTask, title: string) => void;
}

export function TaskList({ tasks, onToggle, onDelete, onDecompose, onEdit }: Props) {
  const [editingId, setEditingId] = useState<string>();
  const [editedTitle, setEditedTitle] = useState('');
  if (tasks.length === 0) return <div className="empty-state"><span className="empty-mark">∅</span><h3>还没有任务</h3><p>从上方写下一件想完成的事，作息簿会替你整理。</p></div>;
  return <div className="task-list">{tasks.map((task) => (
    <article className={`task-row ${task.status === 'completed' ? 'is-complete' : ''}`} key={task.id}>
      <button className="check-button" aria-label={`完成 ${task.title}`} onClick={() => onToggle(task)}>{task.status === 'completed' ? '✓' : ''}</button>
      <div className="task-copy">
        <div className="task-heading">{editingId === task.id ? <input className="inline-edit" value={editedTitle} onChange={(event) => setEditedTitle(event.target.value)} /> : <h3>{task.title}</h3>}<span className={`priority priority-${task.priority}`}>{task.priority === 'high' ? '高' : task.priority === 'low' ? '低' : '中'}</span></div>
        <div className="task-meta"><span>{task.category ?? '未分类'}</span>{task.tags.map((tag) => <span key={tag}>#{tag}</span>)}{task.due_at && <span>截止 {new Date(task.due_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>}</div>
      </div>
      <div className="task-actions">{editingId === task.id ? <><button onClick={() => { onEdit(task, editedTitle); setEditingId(undefined); }}>保存</button><button onClick={() => setEditingId(undefined)}>取消</button></> : <><button onClick={() => { setEditingId(task.id); setEditedTitle(task.title); }}>编辑</button><button onClick={() => onDecompose(task)}>拆解</button><button onClick={() => onDelete(task)}>删除</button></>}</div>
    </article>
  ))}</div>;
}
