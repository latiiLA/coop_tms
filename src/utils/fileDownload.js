import axios from "axios";

// Uploaded files are only served to authenticated users, so they cannot be
// linked with a plain <a href>. Fetch the bytes with the bearer token instead.
export const fetchFileBlob = async (filePath) => {
  const token = localStorage.getItem("token");
  const apiUrl = process.env.REACT_APP_API_URL;

  // Stored paths look like "uploads/<name>" (older rows used backslashes), so
  // only the file name is needed for the download endpoint.
  const fileName = String(filePath || "")
    .split(/[\\/]/)
    .pop();

  const response = await axios.get(
    `${apiUrl}/uploads/${encodeURIComponent(fileName)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
      responseType: "blob",
    }
  );

  return response.data;
};

// Normalise axios errors: with responseType "blob" the JSON error body arrives
// as a Blob, so decode it to let callers show the server's message.
export const readBlobErrorMessage = async (error) => {
  const data = error?.response?.data;

  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.message) {
        return parsed.message;
      }
    } catch {
      /* fall through to the generic message */
    }
  }

  return error?.response?.data?.message || error?.message || "Unable to load the file.";
};

// Fetch a file and trigger a browser download using its original name.
export const downloadFile = async (filePath, fileName) => {
  const blob = await fetchFileBlob(filePath);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
