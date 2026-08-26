import { Box, Card, CardContent, Typography, Paper, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Task, TaskStatus } from "../../types";
import { PriorityChip } from "../../components/common";
import { taskService } from "../../services/task.service";
import { useNotification } from "../../context/NotificationContext";

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo", label: "To Do", color: "#757575" },
  { status: "in-progress", label: "In Progress", color: "#0288d1" },
  { status: "completed", label: "Completed", color: "#2e7d32" },
];

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: () => void;
}

export const TaskBoard = ({ tasks, onStatusChange }: TaskBoardProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const handleDrop = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      showNotification("Task status updated");
      onStatusChange();
    } catch (error) {
      showNotification("Failed to update task status", "error");
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      handleDrop(taskId, status);
    }
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        gap: 2,
        overflowX: "auto",
      }}
    >
      {columns.map((column) => (
        <Paper
          key={column.status}
          sx={{ p: 2, backgroundColor: "#fafafa", minHeight: 400 }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDropOnColumn(e, column.status)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: column.color,
              }}
            />
            <Typography variant="subtitle1" fontWeight={600}>
              {column.label}
            </Typography>
            <Chip label={getTasksByStatus(column.status).length} size="small" />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {getTasksByStatus(column.status).map((task) => (
              <Card
                key={task._id}
                draggable
                onDragStart={(e) => handleDragStart(e, task._id)}
                sx={{
                  cursor: "grab",
                  "&:hover": { boxShadow: 3 },
                  "&:active": { cursor: "grabbing" },
                }}
                onClick={() => navigate(`/tasks/${task._id}`)}
              >
                <CardContent
                  sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}
                >
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                    {task.title}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <PriorityChip priority={task.priority} />
                    {task.dueDate && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  {task.project?.name && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {task.project.name}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
