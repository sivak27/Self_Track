import { useState, useEffect, useCallback } from "react";
import { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project";
import { projectService } from "@/services/projectService";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load projects";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (input: CreateProjectInput) => {
    const created = await projectService.createProject(input);
    setProjects((prev) => [created, ...prev]);
    return created;
  };

  const updateProject = async (id: string, input: UpdateProjectInput) => {
    const updated = await projectService.updateProject(id, input);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    return updated;
  };

  const deleteProject = async (id: string) => {
    await projectService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Aggregated calculations
  const activeCount = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const planningCount = projects.filter((p) => p.status === "planning").length;

  return {
    projects,
    isLoading,
    error,
    refresh: fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    activeCount,
    completedCount,
    planningCount,
  };
}
