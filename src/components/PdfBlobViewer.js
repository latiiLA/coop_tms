import { useState, useEffect } from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingSpinner from "./LoadingSpinner";

const PdfBlobViewer = ({ filePath, open, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (open && filePath) {
      console.log("Fetching PDF from:", filePath);

      // Fetch the PDF blob and generate a URL to display it
      fetch(filePath, {
        method: "GET", // Make sure GET is used
        headers: {
          Authorization: `Bearer your-auth-token`, // Add token if needed
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.blob(); // Convert response to Blob
        })
        .then((blob) => {
          console.log("Blob fetched:", blob);
          const url = URL.createObjectURL(blob); // Create URL for the Blob
          setPdfUrl(url); // Set the generated URL to be used in iframe
        })
        .catch((error) => console.error("Error fetching PDF:", error));
    }
  }, [filePath, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <IconButton
        onClick={onClose}
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          backgroundColor: "#fff",
          borderRadius: "50%",
          padding: 5,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CloseIcon style={{ color: "#0693e3", fontSize: "1.5rem" }} />
      </IconButton>
      <DialogContent>
        {pdfUrl ? (
          <iframe
            title="file viewer"
            src={pdfUrl}
            width="100%"
            height="600px"
          />
        ) : (
          <LoadingSpinner />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PdfBlobViewer;
