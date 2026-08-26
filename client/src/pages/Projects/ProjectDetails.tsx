import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../../services/project.service";
import { taskService } from "../../services/task.service";
import type { ProjectWithStats, Task } from "../../types";
import {
  LoadingSpinner,
  EmptyState,
  StatusChip,
  PriorityChip,
  ConfirmDialog,
} from "../../components/common";
import { useNotification } from "../../context/NotificationContext";

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [projectData, taskData] = await Promise.all([
          projectService.getById(id),
          taskService.getAll({ project: id }),
        ]);
        setProject(projectData);
        setTasks(taskData.tasks);
      } catch (error) {
        showNotification("Failed to load project", "error");
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, showNotification]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await projectService.delete(id);
      showNotification("Project deleted successfully");
      navigate("/projects");
    } catch (error) {
      showNotification("Failed to delete project", "error");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return null;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/projects")}
        sx={{ mb: 2 }}
      >
        Back to Projects
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {project.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <StatusChip status={project.status} size="medium" />
            <Chip
              label={`${project.completedTaskCount}/${project.taskCount} tasks completed`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={() => navigate(`/projects/${id}/edit`)}
            aria-label="edit project"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => setDeleteDialogOpen(true)}
            color="error"
            aria-label="delete project"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {project.description && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1">{project.description}</Typography>
          </CardContent>
        </Card>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Tasks</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/tasks/new?project=${id}`)}
        >
          Add Task
        </Button>
      </Box>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks in this project"
          description="Create a task to get started."
          actionLabel="Create Task"
          onAction={() => navigate(`/tasks/new?project=${id}`)}
        />
      ) : (
        <Card>
          <List disablePadding>
            {tasks.map((task, index) => (
              <ListItem
                key={task._id}
                divider={index < tasks.length - 1}
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/tasks/${task._id}`)}
              >
                <ListItemText
                  primary={task.title}
                  secondary={
                    task.dueDate
                      ? `Due: ${new Date(task.dueDate).toLocaleDateString()}`
                      : undefined
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <StatusChip status={task.status} />
                    <PriorityChip priority={task.priority} />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Project"
        message="Are you sure? All tasks will also be deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={deleting}
      />
    </Box>
  );
};
