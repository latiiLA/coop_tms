import React, { useRef, useState } from "react";
import { Box } from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import ATMForm from "../../components/ATMForm";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

const AddTerminal = () => {
  const navigate = useNavigate();
  const hasShownToast = useRef(false); // Use ref to track if the toast has been shown
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      // console.error("No authentication token found");
      if (!hasShownToast.current) {
        toast.error("User is not authenticated");
        hasShownToast.current = true;
      }
      navigate("/home");
      return; // Exit the function if no token is found
    }
    try {
      const response = await axios.post(
        `${apiUrl}/terminal/createTerminal`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      // console.log("terminals,", response.data.terminal);
      navigate("/viewdetail", { state: { row: response.data.terminal } });
      // console.log("New ATM is added:", response.data);
      toast.success(response.data.message);
    } catch (error) {
      // console.error(
      //   "Error adding an ATM:",
      //   error,
      //   error.response?.data?.message
      // );
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
      hasShownToast.current = true;
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        // height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 1,
      }}
    >
      <ATMForm initialValues={{}} onSubmit={handleSubmit} isEdit={false} />
      {/* Loading Spinner */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // marginLeft: 10,
            zIndex: 10, // Ensures the spinner is above the form
          }}
        >
          <LoadingSpinner />
        </Box>
      )}
    </Box>
  );
};

export default AddTerminal;
