import { Box, Typography, Button } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        gap: 2,
        py: 6,
      }}
    >
      <InboxIcon sx={{ fontSize: 64, color: "text.disabled" }} />
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" textAlign="center" maxWidth={400}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};
