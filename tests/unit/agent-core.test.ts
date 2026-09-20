import { describe, expect, it } from 'vitest';
import { FakeModelPort } from '../../src/services/agent/fakeAdapter';
import { AgentCore } from '../../src/services/agent/core';
import { AgentRuntime } from '../../src/services/agent/runtime';

describe('mock agent core', () => {
  it('parses a Chinese natural-language task into an editable draft', async () => {
    const core = new AgentCore(new FakeModelPort());
    const result = await core.run({
      mode: 'parse_task',
      input: '提醒我明天下午3点购买日用品',
      timezone: 'Asia/Shanghai',
      now: new Date('2026-09-21T10:00:00+08:00'),
    }, new AbortController().signal);

    expect(result.kind).toBe('task_draft');
    expect(result.data).toMatchObject({
      title: '购买日用品',
      description: '提醒我明天下午3点购买日用品',
      priority: 'medium',
      tags: ['购物'],
      category: '生活',
    });
    expect((result.data as { due_at?: string }).due_at).toContain('2026-09-22T07:00:00.000Z');
  });

  it('decomposes a task and summarizes existing tasks', async () => {
    const core = new AgentCore(new FakeModelPort());
    const signal = new AbortController().signal;
    const decomposition = await core.run({ mode: 'decompose_task', input: '准备产品发布', now: new Date() }, signal);
    const today = new Date('2026-09-21T10:00:00+08:00');
    const summary = await core.run({
      mode: 'summarize',
      timezone: 'Asia/Shanghai',
      tasks: [
        { id: '1', title: '完成报告', status: 'completed', priority: 'high', tags: [], created_at: '2026-09-21T01:00:00.000Z', updated_at: '2026-09-21T02:00:00.000Z' },
        { id: '2', title: '回复客户', status: 'pending', priority: 'medium', tags: [], created_at: '2026-09-21T03:00:00.000Z', updated_at: '2026-09-21T03:00:00.000Z', due_at: '2026-09-21T10:00:00.000Z' },
        { id: '3', title: '旧任务', status: 'pending', priority: 'low', tags: [], created_at: '2026-09-20T03:00:00.000Z', updated_at: '2026-09-20T03:00:00.000Z' },
      ],
      now: today,
    }, signal);

    expect(decomposition.kind).toBe('subtask_drafts');
    expect((decomposition.data as { subtasks: unknown[] }).subtasks.length).toBeGreaterThan(1);
    expect(summary.kind).toBe('summary');
    expect(summary.data).toMatchObject({
      statistics: { todayTotal: 2, completedToday: 1, unfinishedToday: 1 },
      completedTasks: [expect.objectContaining({ title: '完成报告' })],
      unfinishedTasks: [expect.objectContaining({ title: '回复客户' })],
    });
    expect((summary.data as unknown as { summary: string }).summary).toContain('今天做了：完成报告');
    expect((summary.data as unknown as { summary: string }).summary).toContain('还没做：回复客户');
  });
});

describe('agent runtime', () => {
  it('emits ordered product events and a terminal result', async () => {
    const runtime = new AgentRuntime(new AgentCore(new FakeModelPort()));
    const events = [];
    for await (const event of runtime.run({ mode: 'parse_task', input: '买咖啡', now: new Date() })) events.push(event);

    expect(events[0].type).toBe('run_started');
    expect(events.at(-1)?.type).toBe('run_completed');
    expect(events.every((event, index) => event.sequence === index + 1)).toBe(true);
  });
});
