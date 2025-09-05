

type User = {
    id: string;
    name: string;
    avatar?: string;
};

type SubResult = {
    id: string;
    name: string;
    completed: boolean;
    assignee?: User;
    deadline?: string;
}

type ResultTask = {
    id: string;
    title: string;
    status: 'todo' | 'done';
}

type ResultTemplate = {
    id: string;
    name: string;
    repeatability?: string;
}

export type { SubResult, User };

export interface Result {
  id: string;
  name: string;
  status: string;
  completed: boolean;
  isUrgent?: boolean;
  deadline: string;
  assignee: User;
  reporter: User;
  description: string;
  expectedResult: string;
  subResults: SubResult[];
  tasks: ResultTask[];
  templates: ResultTemplate[];
}
