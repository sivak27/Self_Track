import { apiClient } from "./apiClient";
import { Project, CreateProjectInput } from "@/types/project";

export const projectService = {
  async getProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>("/projects");
  },

  async createProject(data: CreateProjectInput): Promise<Project> {
    return apiClient.post<Project>("/projects", data);
  },

  async updateProject(id: string, data: Partial<CreateProjectInput>): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, data);
  },

  async deleteProject(id: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  },
};
