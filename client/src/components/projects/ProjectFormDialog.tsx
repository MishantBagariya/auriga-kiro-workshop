import { Dialog } from "../ui/Dialog";
import { ProjectForm } from "./ProjectForm";
import { useCreateProject, useUpdateProject } from "../../hooks/useProjects";
import { useToast } from "../ui/ToastProvider";
import type { CreateProjectInput, Project } from "../../types";

interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
  onCreated?: (project: Project) => void;
}

export function ProjectFormDialog({ open, onClose, project, onCreated }: ProjectFormDialogProps) {
  const toast = useToast();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(project?.id ?? "");
  const loading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (input: CreateProjectInput) => {
    if (project) {
      await updateMutation.mutateAsync(input);
      toast.success("Project updated");
    } else {
      const created = await createMutation.mutateAsync(input);
      toast.success("Project created");
      onCreated?.(created);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={project ? "Edit project" : "New project"}>
      <ProjectForm
        initialValues={project}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
