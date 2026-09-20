import { useEffect, useState } from 'react';
import type { ClientTask } from '../api';

type Draft = Partial<ClientTask> & { title: string };

interface Props {
  draft?: Draft;
  busy: boolean;
  onParse: (input: string) => void;
  onConfirm: (draft: Draft) => void;
}

export function SmartTaskComposer({ draft, busy, onParse, onConfirm }: Props) {
  const [input, setInput] = useState('');
  const [edited, setEdited] = useState<Draft | undefined>(draft);
  useEffect(() => { setEdited(draft); }, [draft]);
  return <section className="composer panel-accent">
    <div className="section-kicker">智能输入</div>
    <h2>先写下来，剩下的交给我。</h2>
    <div className="composer-line"><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="把想法写下来，例如：明天下午 3 点买日用品" rows={2} /><button className="primary-button" disabled={busy || !input.trim()} onClick={() => onParse(input)}>{busy ? '整理中…' : '整理任务'}</button></div>
    {edited && <div className="draft-preview"><div className="draft-label">已整理成草稿 · 请确认</div><input value={edited.title} onChange={(event) => setEdited({ ...edited, title: event.target.value })} /><div className="draft-details"><span>{edited.category ?? '未分类'}</span><span>{edited.priority === 'high' ? '高优先级' : edited.priority === 'low' ? '低优先级' : '中优先级'}</span>{edited.tags?.map((tag) => <span key={tag}>#{tag}</span>)}</div><button className="confirm-button" onClick={() => onConfirm(edited)}>确认加入任务</button></div>}
  </section>;
}
