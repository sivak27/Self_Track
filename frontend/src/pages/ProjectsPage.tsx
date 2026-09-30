import React, { useState, useEffect } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectSummaryCards } from "@/components/projects/ProjectSummaryCards";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useProjects } from "@/hooks/projects/useProjects";
import { Project, CreateProjectInput } from "@/types/project";

export function ProjectsPage() {
  const {
    projects,
    isLoading,
    activeCount,
    completedCount,
    planningCount,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.title = "Project Workspaces | Personal Control Center";
  }, []);

  const handleOpenAdd = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateProjectInput) => {
    if (projectToEdit) {
      await updateProject(projectToEdit.id, data);
    } else {
      await addProject(data);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await deleteProject(deletingId);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Workspaces"
        description="Organize overarching initiatives, track milestone progress percentages, and cluster related tasks."
      >
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Workspace</span>
        </button>
      </PageHeader>

      <ProjectSummaryCards
        totalCount={projects.length}
        activeCount={activeCount}
        completedCount={completedCount}
        planningCount={planningCount}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <LoadingSkeleton count={3} className="h-56 w-full" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Projects in Pipeline"
          description="Create a project to bundle your milestones, actionable tasks, and progress reports in one central workspace."
          actionLabel="Create First Project"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        projectToEdit={projectToEdit}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Project Workspace"
        message="Are you sure you want to delete this project? Associated tasks will be detached but preserved."
        confirmLabel="Delete Workspace"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
