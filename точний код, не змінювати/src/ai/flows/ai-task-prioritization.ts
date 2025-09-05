// A Genkit flow to intelligently suggest task priorities based on upcoming deadlines and overall goals.

'use server';

/**
 * @fileOverview AI-powered task prioritization flow.
 *
 * - suggestTaskPriorities - A function that suggests task priorities based on deadlines and goals.
 * - TaskPrioritizationInput - The input type for the suggestTaskPriorities function.
 * - TaskPrioritizationOutput - The return type for the suggestTaskPriorities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  deadline: z.string().optional(), // Expects date as a string, e.g., '2024-12-31'
  isGoal: z.boolean().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

const TaskPrioritizationInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('A list of tasks with descriptions and optional deadlines.'),
  overallGoal: z.string().describe('The user\u2019s overall goal.'),
});
export type TaskPrioritizationInput = z.infer<typeof TaskPrioritizationInputSchema>;

const TaskPrioritizationOutputSchema = z.array(
  z.object({
    taskId: z.string().describe('The ID of the task.'),
    priorityReason: z.string().describe('The reason for the suggested priority.'),
  })
);
export type TaskPrioritizationOutput = z.infer<typeof TaskPrioritizationOutputSchema>;

export async function suggestTaskPriorities(input: TaskPrioritizationInput): Promise<TaskPrioritizationOutput> {
  return taskPrioritizationFlow(input);
}

const taskPrioritizationPrompt = ai.definePrompt({
  name: 'taskPrioritizationPrompt',
  input: {schema: TaskPrioritizationInputSchema},
  output: {schema: TaskPrioritizationOutputSchema},
  prompt: `You are an AI task prioritization assistant. Given a list of tasks and an overall goal, you will suggest priorities for each task.

Prioritize tasks that contribute most to achieving the overall goal and those with approaching deadlines.

Tasks:
{{#each tasks}}
- ID: {{id}}
  Description: {{description}}
  Deadline: {{deadline}}
  Is Goal: {{isGoal}}
{{/each}}

Overall Goal: {{{overallGoal}}}

Priorities (as a JSON array of objects with taskId and priorityReason fields):
`,
});

const taskPrioritizationFlow = ai.defineFlow(
  {
    name: 'taskPrioritizationFlow',
    inputSchema: TaskPrioritizationInputSchema,
    outputSchema: TaskPrioritizationOutputSchema,
  },
  async input => {
    const {output} = await taskPrioritizationPrompt(input);
    return output!;
  }
);
