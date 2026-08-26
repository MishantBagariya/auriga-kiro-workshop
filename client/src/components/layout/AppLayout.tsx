import { useState } from "react";
import { Box, AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

const DRAWER_WIDTH = 260;

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          display: { md: "none" },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2 }}
            aria-label="open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            TaskFlow
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 },
          backgroundColor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
