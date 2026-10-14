import { useCallback, useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  downloadFile,
  fetchFileBlob,
  readBlobErrorMessage,
} from "../utils/fileDownload";

const PdfBlobViewer = ({ filePath, fileName, open, onClose }) => {
  const [fileUrl, setFileUrl] = useState("");
  const [contentType, setContentType] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !filePath) {
      return undefined;
    }

    let objectUrl = "";
    let cancelled = false;

    setStatus("loading");
    setError("");
    setFileUrl("");
    setContentType("");

    (async () => {
      try {
        const blob = await fetchFileBlob(filePath);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setFileUrl(objectUrl);
        setContentType(blob.type || "");
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(await readBlobErrorMessage(err));
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [filePath, open]);

  const handleDownload = useCallback(() => {
    downloadFile(filePath, fileName).catch((err) =>
      console.error("Failed to download file:", err)
    );
  }, [filePath, fileName]);

  const isImage = contentType.startsWith("image/");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: "90vh" } }}
    >
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 1.5 }}>
          <DescriptionOutlinedIcon color="action" />
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ flex: 1, fontWeight: 600 }}
          >
            {fileName || "Document"}
          </Typography>

          {status === "ready" && (
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          )}

          <Tooltip title="Close">
            <IconButton edge="end" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <DialogContent
        dividers
        sx={{ p: 0, flex: 1, bgcolor: "grey.100", overflow: "hidden" }}
      >
        {status === "loading" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {status === "error" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              height: "100%",
              p: 3,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
            <Typography variant="subtitle1" color="text.primary">
              Couldn&apos;t load the document
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        {status === "ready" &&
          (isImage ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                p: 2,
              }}
            >
              <Box
                component="img"
                src={fileUrl}
                alt={fileName || "document"}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              />
            </Box>
          ) : (
            <iframe
              title={fileName || "file viewer"}
              src={fileUrl}
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
            />
          ))}
      </DialogContent>
    </Dialog>
  );
};

export default PdfBlobViewer;
