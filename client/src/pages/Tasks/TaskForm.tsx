import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { taskService } from "../../services/task.service";
import { projectService } from "../../services/project.service";
import type {
  CreateTaskDto,
  ProjectWithStats,
  TaskStatus,
  TaskPriority,
} from "../../types";
import { useNotification } from "../../context/NotificationContext";
import { LoadingSpinner } from "../../components/common";

export const TaskForm = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get("project") || "";
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [form, setForm] = useState<CreateTaskDto>({
    title: "",
    description: "",
    projectId: preselectedProject,
    status: "todo",
    priority: "medium",
    dueDate: null,
    labels: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAll();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      const fetchTask = async () => {
        try {
          const task = await taskService.getById(id);
          setForm({
            title: task.title,
            description: task.description,
            projectId: task.projectId,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.split("T")[0] : null,
            labels: task.labels,
          });
        } catch (error) {
          showNotification("Failed to load task", "error");
          navigate("/tasks");
        } finally {
          setLoading(false);
        }
      };
      fetchTask();
    }
  }, [id, isEdit, navigate, showNotification]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Task title is required";
    if (form.title.length > 200)
      newErrors.title = "Title cannot exceed 200 characters";
    if (!form.projectId) newErrors.projectId = "Project is required";
    if (!form.status) newErrors.status = "Status is required";
    if (!form.priority) newErrors.priority = "Priority is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
      };
      if (isEdit && id) {
        await taskService.update(id, payload);
        showNotification("Task updated successfully");
      } else {
        await taskService.create(payload);
        showNotification("Task created successfully");
      }
      navigate("/tasks");
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to save task",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLabel = () => {
    const label = labelInput.trim();
    if (label && !form.labels?.includes(label)) {
      setForm({ ...form, labels: [...(form.labels || []), label] });
      setLabelInput("");
    }
  };

  const handleRemoveLabel = (label: string) => {
    setForm({ ...form, labels: form.labels?.filter((l) => l !== label) || [] });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEdit ? "Edit Task" : "Create Task"}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label="Task Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={Boolean(errors.title)}
            helperText={errors.title}
            fullWidth
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            multiline
            rows={4}
            fullWidth
          />

          <FormControl fullWidth required error={Boolean(errors.projectId)}>
            <InputLabel>Project</InputLabel>
            <Select
              value={form.projectId}
              label="Project"
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            >
              {projects.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
            {errors.projectId && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.5 }}
              >
                {errors.projectId}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              label="Status"
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as TaskStatus })
              }
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Priority</InputLabel>
            <Select
              value={form.priority}
              label="Priority"
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as TaskPriority })
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Due Date"
            type="date"
            value={form.dueDate || ""}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value || null })
            }
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Box>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <OutlinedInput
                size="small"
                placeholder="Add label..."
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLabel();
                  }
                }}
              />
              <Button variant="outlined" size="small" onClick={handleAddLabel}>
                Add
              </Button>
            </Box>
            {form.labels && form.labels.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {form.labels.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    onDelete={() => handleRemoveLabel(label)}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Update Task"
                  : "Create Task"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/tasks")}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
