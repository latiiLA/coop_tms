import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function Upload() {
  const [files, setFiles] = React.useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (!files) return; // Check if files are selected

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file); // Append each file to formData
    });

    try {
      const response = await axios.post(`${apiUrl}/request/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  return (
    <>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        Upload Agreement
        <VisuallyHiddenInput type="file" onChange={handleFileChange} multiple />
      </Button>
      <Button
        onClick={handleUpload}
        variant="contained"
        color="primary"
        style={{ marginLeft: 10 }}
      >
        Submit Upload
      </Button>
    </>
  );
}
