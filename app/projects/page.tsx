"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, FolderKanban } from "lucide-react";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectForm } from "@/components/projects/project-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { CreateProjectInput } from "@/lib/validations/project";

export default function ProjectsPage() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const createProject = useCreateProject();
  const [formOpen, setFormOpen] = useState(false);

  async function handleCreate(data: CreateProjectInput) {
    await createProject.mutateAsync(data);
    toast.success("Project created successfully");
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Project
        </Button>
      </div>

      {isLoading && <LoadingSpinner label="Loading projects" />}

      {isError && (
        <ErrorMessage
          message="Failed to load projects."
          retry={() => refetch()}
        />
      )}

      {projects && projects.length === 0 && (
        <EmptyState
          icon={<FolderKanban className="h-10 w-10" />}
          title="No projects yet"
          description="Create your first project to get started."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Create Project
            </Button>
          }
        />
      )}

      {projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        title="Create Project"
        submitLabel="Create"
      />
    </div>
  );
}
