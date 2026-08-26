import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import TaskIcon from "@mui/icons-material/CheckCircleOutline";
import { useLocation, useNavigate } from "react-router-dom";

const DRAWER_WIDTH = 260;

const navItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Projects", path: "/projects", icon: <FolderIcon /> },
  { label: "Tasks", path: "/tasks", icon: <TaskIcon /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          TaskFlow
        </Typography>
      </Toolbar>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};
