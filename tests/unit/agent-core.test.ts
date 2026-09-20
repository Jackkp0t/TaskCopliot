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
    const summary = await core.run({
      mode: 'summarize',
      tasks: [{ id: '1', title: '发布', status: 'pending', priority: 'high', tags: [], created_at: '', updated_at: '' }],
      now: new Date(),
    }, signal);

    expect(decomposition.kind).toBe('subtask_drafts');
    expect((decomposition.data as { subtasks: unknown[] }).subtasks.length).toBeGreaterThan(1);
    expect(summary.kind).toBe('summary');
    expect((summary.data as unknown as { statistics: { total: number } }).statistics.total).toBe(1);
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
