import { useState, useEffect, useCallback } from "react";
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilter, TaskStatus } from "@/types/task";
import { Project } from "@/types/project";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";

export function useTasks(initialFilters?: TaskFilter) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<TaskFilter>(initialFilters || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err: unknown) {
      console.error("Failed to load projects for tasks:", err);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks(filters);
      setTasks(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load tasks";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (input: CreateTaskInput) => {
    const created = await taskService.createTask(input);
    setTasks((prev) => [created, ...prev]);
    return created;
  };

  const updateTask = async (id: string, input: UpdateTaskInput) => {
    const updated = await taskService.updateTask(id, input);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    return updated;
  };

  const toggleTaskStatus = async (id: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === "completed" ? "todo" : "completed";
    return await updateTask(id, { status: nextStatus });
  };

  const deleteTask = async (id: string) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Metrics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;

  return {
    tasks,
    projects,
    filters,
    setFilters,
    isLoading,
    error,
    refresh: fetchTasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    totalCount,
    completedCount,
    inProgressCount,
    urgentCount,
  };
}
