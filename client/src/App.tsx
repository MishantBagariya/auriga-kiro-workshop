import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import { NotificationProvider } from "./context/NotificationContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { ProjectList } from "./pages/Projects/ProjectList";
import { ProjectDetails } from "./pages/Projects/ProjectDetails";
import { ProjectForm } from "./pages/Projects/ProjectForm";
import { TaskList } from "./pages/Tasks/TaskList";
import { TaskDetails } from "./pages/Tasks/TaskDetails";
import { TaskForm } from "./pages/Tasks/TaskForm";

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/new" element={<ProjectForm />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/projects/:id/edit" element={<ProjectForm />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks/:id" element={<TaskDetails />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};
