import { Modal } from '../../../components/ui/Modal';
import { ProjectForm, type ProjectFormValues } from './ProjectForm';
import { useToast } from '../../../hooks/useToast';
import { useCreateProject } from '../hooks/useCreateProject';
import { useUpdateProject } from '../hooks/useUpdateProject';
import type { Project } from '../../../types/project';
import type { ApiError } from '../../../types/api';

interface ProjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
}

export function ProjectFormDialog({ isOpen, onClose, project }: ProjectFormDialogProps) {
  const { showToast } = useToast();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(project?.id ?? '');

  const isEditing = !!project;
  const mutation = isEditing ? updateProject : createProject;

  const handleSubmit = (values: ProjectFormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        showToast(isEditing ? 'Project updated successfully' : 'Project created successfully');
        onClose();
        mutation.reset();
      },
      onError: (error) => {
        const apiError = error as ApiError;
        if (apiError.code !== 'VALIDATION_ERROR') {
          showToast(apiError.message, 'error');
        }
      },
    });
  };

  return (
    <Modal title={isEditing ? 'Edit Project' : 'Create Project'} isOpen={isOpen} onClose={onClose}>
      <ProjectForm
        defaultValues={project}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        serverErrors={(mutation.error as ApiError | null)?.details}
        submitLabel={isEditing ? 'Save Changes' : 'Create Project'}
      />
    </Modal>
  );
}
