import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";

const UserActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState({});
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Function to fetch logs
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/log/getactivity`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in headers
        },
      });
      setLogs(response.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to fetch logs.");
    }
  };

  // Function to fetch all users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/auth/getUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userMap = response.data.users.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {});
      setUsers(userMap);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchUsers();
    const intervalId = setInterval(fetchLogs, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        maxHeight: "600px",
        overflowY: "scroll",
        backgroundColor: (theme) => theme.palette.background.default,
        color: (theme) => theme.palette.text.primary,
        fontFamily: "monospace",
        padding: "16px",
        borderRadius: "4px",
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {error && <Typography color="error">{error}</Typography>}
      {logs.length === 0 ? (
        <Typography>No logs available.</Typography>
      ) : (
        logs.map((log, index) => {
          const user = users[log.userId];
          return (
            <Typography key={index}>
              {user
                ? `${user.username} (${user.firstName}) - ${log.action} - ${
                    log.description
                  } - ${log.ipAddress} - ${log.userAgent} - ${new Date(
                    log.createdAt
                  ).toLocaleString()}`
                : `User not found - ${log.action} - ${log.description} - ${
                    log.ipAddress
                  } - ${log.userAgent} - ${new Date(
                    log.createdAt
                  ).toLocaleString()}`}
            </Typography>
          );
        })
      )}
    </Box>
  );
};

export default UserActivityLog;
