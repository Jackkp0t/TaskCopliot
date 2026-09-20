import type { AgentRequest, AgentResult, TaskDraft } from '../../models/agent';
import type { AgentState, Decision, ModelPort } from './ports';

function inferPriority(input: string): TaskDraft['priority'] {
  if (/紧急|重要|马上|尽快|高优先级/.test(input)) return 'high';
  if (/可选|有空|不急|低优先级/.test(input)) return 'low';
  return 'medium';
}

function inferTags(input: string): string[] {
  const tags = new Set<string>();
  if (/买|购物|日用品|采购/.test(input)) tags.add('购物');
  if (/会议|开会|客户/.test(input)) tags.add('工作');
  if (/学习|课程|复习/.test(input)) tags.add('学习');
  if (/锻炼|运动|跑步/.test(input)) tags.add('健康');
  return [...tags];
}

function inferCategory(input: string): string | undefined {
  if (/买|购物|日用品|采购/.test(input)) return '生活';
  if (/会议|开会|客户|项目|报告/.test(input)) return '工作';
  if (/学习|课程|复习/.test(input)) return '学习';
  if (/锻炼|运动|跑步/.test(input)) return '健康';
  return undefined;
}

function inferDueAt(input: string, now: Date): string | undefined {
  const tomorrow = /明天/.test(input);
  const match = input.match(/(上午|下午|晚上)?\s*(\d{1,2})\s*点/);
  if (!tomorrow || !match) return undefined;
  let hour = Number(match[2]);
  if (match[1] === '下午' || match[1] === '晚上') hour = hour < 12 ? hour + 12 : hour;
  const due = new Date(now);
  due.setDate(due.getDate() + 1);
  due.setHours(hour, 0, 0, 0);
  return due.toISOString();
}

function cleanTitle(input: string): string {
  return input
    .replace(/^(提醒我|请提醒我|帮我|请|安排我|计划)/, '')
    .replace(/明天(上午|下午|晚上)?\s*\d{1,2}\s*点/, '')
    .replace(/在明天/, '')
    .replace(/[，。,:：]/g, ' ')
    .trim() || '新任务';
}

function parseTask(request: AgentRequest): AgentResult {
  const input = request.input?.trim() ?? '';
  return {
    kind: 'task_draft',
    data: {
      title: cleanTitle(input),
      priority: inferPriority(input),
      tags: inferTags(input),
      category: inferCategory(input),
      due_at: inferDueAt(input, request.now ?? new Date()),
    },
  };
}

export function resolveFakeResult(request: AgentRequest): AgentResult {
  if (request.mode === 'parse_task') return parseTask(request);
  if (request.mode === 'decompose_task') {
    const title = request.input?.trim() || request.task?.title || '复杂任务';
    return {
      kind: 'subtask_drafts',
      data: {
        subtasks: [
          { title: `明确${title}的目标`, priority: 'high', tags: ['准备'], category: request.task?.category },
          { title: `执行${title}`, priority: 'medium', tags: ['执行'], category: request.task?.category },
          { title: `检查${title}的结果`, priority: 'medium', tags: ['复盘'], category: request.task?.category },
        ],
      },
    };
  }
  const tasks = request.tasks ?? [];
  const statistics = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === 'completed').length,
    inProgress: tasks.filter((task) => task.status === 'in_progress').length,
    pending: tasks.filter((task) => task.status === 'pending').length,
    highPriority: tasks.filter((task) => task.priority === 'high').length,
  };
  return {
    kind: 'summary',
    data: {
      summary: `当前范围共有 ${tasks.length} 个任务，其中 ${statistics.highPriority} 个高优先级任务。`,
      statistics,
      highlights: tasks.filter((task) => task.priority === 'high').slice(0, 5),
      overdue: tasks.filter((task) => task.due_at && new Date(task.due_at) < (request.now ?? new Date()) && task.status !== 'completed'),
    },
  };
}

export class FakeModelPort implements ModelPort {
  async decide(state: AgentState, signal: AbortSignal): Promise<Decision> {
    signal.throwIfAborted();
    return { kind: 'respond', content: resolveFakeResult(state.request) };
  }
}
