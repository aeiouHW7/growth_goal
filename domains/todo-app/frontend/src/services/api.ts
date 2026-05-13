import axios from 'axios';
import type { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoApi = {
  // 获取所有待办事项
  getAll: async (): Promise<Todo[]> => {
    const response = await api.get<Todo[]>('/todos');
    return response.data;
  },

  // 创建待办事项
  create: async (data: CreateTodoDto): Promise<Todo> => {
    const response = await api.post<Todo>('/todos', data);
    return response.data;
  },

  // 更新待办事项
  update: async (id: number, data: UpdateTodoDto): Promise<Todo> => {
    const response = await api.put<Todo>(`/todos/${id}`, data);
    return response.data;
  },

  // 删除待办事项
  delete: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
};
