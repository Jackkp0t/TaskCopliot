import { useEffect, useState } from 'react';
import type { ClientTask } from '../api';

type Draft = Partial<ClientTask> & { title: string };

export const COMMON_CATEGORIES = ['工作', '生活', '学习', '健康', '财务', '个人', '其他'];

interface Props {
  draft?: Draft;
  busy: boolean;
  onParse: (input: string) => void;
  onConfirm: (draft: Draft) => void;
  onCancel?: () => void;
}

function toDatetimeLocal(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toIso(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

export function SmartTaskComposer({ draft, busy, onParse, onConfirm, onCancel }: Props) {
  const [input, setInput] = useState('');
  const [edited, setEdited] = useState<Draft | undefined>(draft);
  const [dueAt, setDueAt] = useState(() => toDatetimeLocal(draft?.due_at));

  useEffect(() => {
    setEdited(draft);
    setDueAt(toDatetimeLocal(draft?.due_at));
  }, [draft]);

  const updateDraft = (changes: Partial<Draft>) => {
    setEdited((current) => current ? { ...current, ...changes } : current);
  };

  return (
    <section className="composer panel-accent">
      <div className="section-kicker">智能输入</div>
      <h2>先写下来，剩下的交给我。</h2>
      <div className="composer-line">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="把想法写下来，例如：明天下午 3 点买日用品"
          rows={2}
        />
        <button className="primary-button" disabled={busy || !input.trim()} onClick={() => onParse(input)}>
          {busy ? '整理中…' : '整理任务'}
        </button>
      </div>

      {edited && (
        <dialog className="draft-dialog" open aria-label="AI任务草稿">
          <div className="dialog-header">
            <div>
              <div className="draft-label">AI 已整理一份任务草稿</div>
              <h3>确认后才会写入任务库</h3>
            </div>
            <button className="dialog-close" type="button" aria-label="关闭草稿" onClick={onCancel}>×</button>
          </div>
          <p className="dialog-intro">智能助手只整理建议。你可以修改字段，确认保存后才会调用创建任务接口。</p>
          <div className="draft-form">
            <label>
              任务标题
              <input aria-label="任务标题" value={edited.title} onChange={(event) => updateDraft({ title: event.target.value })} />
            </label>
            <label>
              任务描述
              <textarea aria-label="任务描述" value={edited.description ?? ''} rows={3} onChange={(event) => updateDraft({ description: event.target.value })} />
            </label>
            <div className="draft-form-grid">
              <label>
                优先级
                <select aria-label="优先级" value={edited.priority ?? 'medium'} onChange={(event) => updateDraft({ priority: event.target.value as ClientTask['priority'] })}>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </label>
              <label>
                任务分类
                <select aria-label="任务分类" value={edited.category ?? ''} onChange={(event) => updateDraft({ category: event.target.value || undefined })}>
                  <option value="">常用分类</option>
                  {COMMON_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label>
                截止日期
                <input aria-label="截止日期" type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
              </label>
            </div>
            <div className="draft-tags">
              <span>AI 推荐标签</span>
              {edited.tags?.length ? edited.tags.map((tag) => <em key={tag}>#{tag}</em>) : <em>暂无</em>}
            </div>
          </div>
          <div className="dialog-actions">
            <button className="dialog-cancel" type="button" onClick={onCancel}>稍后处理</button>
            <button className="confirm-button" type="button" disabled={busy || !edited.title.trim()} onClick={() => onConfirm({ ...edited, title: edited.title.trim(), due_at: toIso(dueAt) })}>确认保存任务</button>
          </div>
        </dialog>
      )}
    </section>
  );
}
