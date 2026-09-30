import { apiClient } from "./apiClient";
import { Task, CreateTaskInput, TaskFilters } from "@/types/task";

export const taskService = {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    return apiClient.get<Task[]>("/tasks", {
      params: {
        projectId: filters?.projectId,
        status: filters?.status,
        priority: filters?.priority,
        search: filters?.search,
      },
    });
  },

  async createTask(data: CreateTaskInput): Promise<Task> {
    return apiClient.post<Task>("/tasks", data);
  },

  async updateTask(id: string, data: Partial<CreateTaskInput>): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}`, data);
  },

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },
};
