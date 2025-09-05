'use server';

import type { Task, TaskPrioritizationInput, TaskPrioritizationOutput } from '@/ai/flows/ai-task-prioritization';
import { suggestTaskPriorities } from '@/ai/flows/ai-task-prioritization';
import type { HelpContentInput, HelpContentOutput } from '@/ai/flows/ai-help-assistant';
import { getHelpContent as getHelpContentFromAI } from '@/ai/flows/ai-help-assistant';


type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getTaskPriorities(tasks: Task[], overallGoal: string): Promise<ActionResult<TaskPrioritizationOutput>> {
  if (!tasks || tasks.length === 0 || !overallGoal) {
    return { success: false, error: 'Tasks and overall goal are required.' };
  }

  const input: TaskPrioritizationInput = {
    tasks,
    overallGoal,
  };

  try {
    const output = await suggestTaskPriorities(input);
    return { success: true, data: output };
  } catch (error) {
    console.error('Error in task prioritization flow:', error);
    return { success: false, error: 'Failed to get task priorities from AI.' };
  }
}
