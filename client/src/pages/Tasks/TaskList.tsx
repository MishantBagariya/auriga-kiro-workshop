import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  InputAdornment,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { useNavigate } from "react-router-dom";
import { taskService } from "../../services/task.service";
import { projectService } from "../../services/project.service";
import type { Task, ProjectWithStats, TaskQueryParams } from "../../types";
import {
  LoadingSpinner,
  EmptyState,
  StatusChip,
  PriorityChip,
} from "../../components/common";
import { TaskBoard } from "./TaskBoard";

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [filters, setFilters] = useState<TaskQueryParams>({
    search: "",
    project: "",
    status: "",
    priority: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 20,
  });
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: TaskQueryParams = { ...filters };
      if (!params.search) delete params.search;
      if (!params.project) delete params.project;
      if (!params.status) delete params.status;
      if (!params.priority) delete params.priority;

      const result = await taskService.getAll(params);
      setTasks(result.tasks);
      setTotalPages(result.meta.totalPages);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

  const handleFilterChange = (
    key: keyof TaskQueryParams,
    value: string | number,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Tasks</Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="board" aria-label="board view">
              <ViewColumnIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/tasks/new")}
          >
            New Task
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flexWrap="wrap"
        >
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={filters.project || ""}
              label="Project"
              onChange={(e) => handleFilterChange("project", e.target.value)}
            >
              <MenuItem value="">All Projects</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ""}
              label="Status"
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority || ""}
              label="Priority"
              onChange={(e) => handleFilterChange("priority", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy || "createdAt"}
              label="Sort By"
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="updatedAt">Updated Date</MenuItem>
              <MenuItem value="dueDate">Due Date</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sortOrder || "desc"}
              label="Order"
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            >
              <MenuItem value="asc">Asc</MenuItem>
              <MenuItem value="desc">Desc</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {loading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title={
            filters.search ||
            filters.status ||
            filters.priority ||
            filters.project
              ? "No tasks match your filters"
              : "No tasks yet"
          }
          description={
            filters.search ||
            filters.status ||
            filters.priority ||
            filters.project
              ? "Try adjusting your search or filter criteria."
              : "Create your first task to get started."
          }
          actionLabel={
            !filters.search &&
            !filters.status &&
            !filters.priority &&
            !filters.project
              ? "Create Task"
              : undefined
          }
          onAction={
            !filters.search &&
            !filters.status &&
            !filters.priority &&
            !filters.project
              ? () => navigate("/tasks/new")
              : undefined
          }
        />
      ) : viewMode === "board" ? (
        <TaskBoard tasks={tasks} onStatusChange={fetchTasks} />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.project?.name || "—"}</TableCell>
                    <TableCell>
                      <StatusChip status={task.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityChip priority={task.priority} />
                    </TableCell>
                    <TableCell>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={filters.page || 1}
                onChange={(_, page) => handleFilterChange("page", page)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
