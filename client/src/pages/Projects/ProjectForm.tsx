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
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { projectService } from "../../services/project.service";
import type { CreateProjectDto, ProjectStatus } from "../../types";
import { useNotification } from "../../context/NotificationContext";
import { LoadingSpinner } from "../../components/common";

export const ProjectForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateProjectDto>({
    name: "",
    description: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      const fetchProject = async () => {
        try {
          const project = await projectService.getById(id);
          setForm({
            name: project.name,
            description: project.description,
            status: project.status,
          });
        } catch (error) {
          showNotification("Failed to load project", "error");
          navigate("/projects");
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, isEdit, navigate, showNotification]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Project name is required";
    if (form.name.length > 100)
      newErrors.name = "Name cannot exceed 100 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await projectService.update(id, form);
        showNotification("Project updated successfully");
      } else {
        await projectService.create(form);
        showNotification("Project created successfully");
      }
      navigate("/projects");
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to save project",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEdit ? "Edit Project" : "Create Project"}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label="Project Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={Boolean(errors.name)}
            helperText={errors.name}
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

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              label="Status"
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ProjectStatus })
              }
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Update Project"
                  : "Create Project"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/projects")}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
