import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import { taskService } from "../../services/task.service";
import type { Task, TaskStatus } from "../../types";
import {
  LoadingSpinner,
  StatusChip,
  PriorityChip,
  ConfirmDialog,
} from "../../components/common";
import { useNotification } from "../../context/NotificationContext";

export const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTask = async () => {
      try {
        const data = await taskService.getById(id);
        setTask(data);
      } catch (error) {
        showNotification("Failed to load task", "error");
        navigate("/tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, navigate, showNotification]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!id || !task) return;
    try {
      const updated = await taskService.updateStatus(id, newStatus);
      setTask(updated);
      showNotification("Task status updated");
    } catch (error) {
      showNotification("Failed to update status", "error");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await taskService.delete(id);
      showNotification("Task deleted successfully");
      navigate("/tasks");
    } catch (error) {
      showNotification("Failed to delete task", "error");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!task) return null;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/tasks")}
        sx={{ mb: 2 }}
      >
        Back to Tasks
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
            {task.title}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <StatusChip status={task.status} size="medium" />
            <PriorityChip priority={task.priority} size="medium" />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={() => navigate(`/tasks/${id}/edit`)}
            aria-label="edit task"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => setDeleteDialogOpen(true)}
            color="error"
            aria-label="delete task"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Description
              </Typography>
              <Typography
                variant="body1"
                color={task.description ? "text.primary" : "text.secondary"}
              >
                {task.description || "No description provided."}
              </Typography>
            </CardContent>
          </Card>

          {task.labels.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Labels
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {task.labels.map((label) => (
                    <Chip key={label} label={label} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={task.status}
                    label="Status"
                    onChange={(e) =>
                      handleStatusChange(e.target.value as TaskStatus)
                    }
                  >
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Project
                </Typography>
                <Typography variant="body2">
                  {task.project?.name || "Unknown"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Priority
                </Typography>
                <PriorityChip priority={task.priority} />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body2">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "Not set"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(task.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Updated
                </Typography>
                <Typography variant="body2">
                  {new Date(task.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={deleting}
      />
    </Box>
  );
};
