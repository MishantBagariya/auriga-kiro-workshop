import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import TaskIcon from "@mui/icons-material/CheckCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../../services/dashboard.service";
import type { DashboardStats, Task } from "../../types";
import {
  LoadingSpinner,
  StatusChip,
  PriorityChip,
} from "../../components/common";

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, recent, upcoming] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentTasks(),
          dashboardService.getUpcomingTasks(),
        ]);
        setStats(statsData);
        setRecentTasks(recent);
        setUpcomingTasks(upcoming);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const statCards = [
    {
      label: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: <FolderIcon />,
      color: "#1976d2",
    },
    {
      label: "Active Projects",
      value: stats?.activeProjects ?? 0,
      icon: <TrendingUpIcon />,
      color: "#2e7d32",
    },
    {
      label: "Total Tasks",
      value: stats?.totalTasks ?? 0,
      icon: <TaskIcon />,
      color: "#9c27b0",
    },
    {
      label: "To Do",
      value: stats?.todoTasks ?? 0,
      icon: <ScheduleIcon />,
      color: "#757575",
    },
    {
      label: "In Progress",
      value: stats?.inProgressTasks ?? 0,
      icon: <TrendingUpIcon />,
      color: "#0288d1",
    },
    {
      label: "Completed",
      value: stats?.completedTasks ?? 0,
      icon: <TaskIcon />,
      color: "#2e7d32",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={6} sm={4} md={2} key={card.label}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
                <Typography variant="h5">{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Tasks
              </Typography>
              {recentTasks.length === 0 ? (
                <Typography color="text.secondary">No recent tasks</Typography>
              ) : (
                <List disablePadding>
                  {recentTasks.map((task) => (
                    <ListItem
                      key={task._id}
                      sx={{ px: 0, cursor: "pointer" }}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                    >
                      <ListItemText
                        primary={task.title}
                        secondary={task.project?.name || "Unknown project"}
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
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Upcoming Tasks
              </Typography>
              {upcomingTasks.length === 0 ? (
                <Typography color="text.secondary">
                  No upcoming tasks
                </Typography>
              ) : (
                <List disablePadding>
                  {upcomingTasks.map((task) => (
                    <ListItem
                      key={task._id}
                      sx={{ px: 0, cursor: "pointer" }}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                    >
                      <ListItemText
                        primary={task.title}
                        secondary={`${task.project?.name || "Unknown"} | Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}`}
                      />
                      <ListItemSecondaryAction>
                        <PriorityChip priority={task.priority} />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
