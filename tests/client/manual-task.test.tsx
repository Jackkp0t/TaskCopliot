// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../../src/client/components/TaskForm';

describe('manual task creation', () => {
  it('submits a human-authored task without using AI', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm busy={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('任务标题'), '整理会议纪要');
    await user.selectOptions(screen.getByLabelText('优先级'), 'high');
    await user.click(screen.getByRole('button', { name: '创建任务' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: '整理会议纪要',
      priority: 'high',
    }));
  });
});
