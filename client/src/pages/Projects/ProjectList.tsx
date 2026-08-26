import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { projectService } from "../../services/project.service";
import type { ProjectWithStats } from "../../types";
import {
  LoadingSpinner,
  EmptyState,
  StatusChip,
} from "../../components/common";

export const ProjectList = () => {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAll();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <LoadingSpinner message="Loading projects..." />;

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
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/projects/new")}
        >
          New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start managing tasks."
          actionLabel="Create Project"
          onAction={() => navigate("/projects/new")}
        />
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => {
            const progress =
              project.taskCount > 0
                ? Math.round(
                    (project.completedTaskCount / project.taskCount) * 100,
                  )
                : 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    "&:hover": { boxShadow: 4 },
                    height: "100%",
                  }}
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" noWrap sx={{ flex: 1, mr: 1 }}>
                        {project.name}
                      </Typography>
                      <StatusChip status={project.status} />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {project.description || "No description"}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Tasks: {project.completedTaskCount}/
                          {project.taskCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress} />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Details</Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
