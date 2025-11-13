export type CreateTaskDto = {
  title: string;
  description?: string;
  category?: string;
  status: number;
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: number;
  category?: string;
  order?: number;
}

export const taskStatusList = ['todo', 'in-progress', 'done'] as const;
