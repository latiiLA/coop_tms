import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import UserProfile from "./UserProfile";
import { useNavigate } from "react-router-dom";
import { Field, Form, Formik } from "formik";

const Account = () => {
  const navigate = useNavigate();
  const language = [
    { value: "es", label: "English" },
    { value: "or", label: "Afan Oromo" },
  ];

  const handleSubmit = () => {};
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <Typography variant="h4">Account Information</Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Typography sx={{ marginY: "auto" }}>Update Profile</Typography>
        <Button variant="contained" onClick={() => navigate("/profile")}>
          Update Profile
        </Button>
      </Box>
      <Box
        sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 5 }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography marginY="auto">Change password</Typography>
          <Button variant="contained" onClick={() => navigate("/setpassword")}>
            Change Password
          </Button>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <Typography marginY="auto">Language Preference</Typography>
          <Box width="30%">
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="language-label">Language</InputLabel>
              <Select name="language" labelId="language-label" label="Language">
                {language.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button variant="contained" type="submit">
            Apply
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Account;
