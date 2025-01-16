import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ComboBox({
  field,
  form,
  initialValue,
  disabled,
  ...props
}) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!token) {
        toast.error("User is not authenticated");
        navigate("/home");
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/device/getSerialNumber`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        if (!response.data?.devices?.length) {
          toast.error("No devices found.");
          return;
        }

        const devices = response?.data?.devices.map((device) => ({
          value: device?._id,
          label: device?.serialNumber,
        }));
        setDevices(devices);

        // Pre-select the initial value
        if (initialValue) {
          const matchedDevice = devices.find(
            (device) => device.label === initialValue
          );
          if (matchedDevice) {
            setSelectedDevice(matchedDevice);
            form.setFieldValue(field.name, matchedDevice.value);
          }
        }
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [navigate]);
  // initialValue, form, field.name;

  useEffect(() => {
    const matchedDevice = devices.find(
      (device) => device.value === field.value
    );
    setSelectedDevice(matchedDevice || null);
  }, [field.value, devices]);

  const handleDeviceChange = (event, newValue) => {
    setSelectedDevice(newValue);
    form.setFieldValue(field.name, newValue?.value || "");
    form.setFieldTouched(field.name, true);
  };

  const handleBlur = () => {
    form.setFieldTouched(field.name, true);
  };

  return (
    <Autocomplete
      {...props}
      disablePortal
      options={devices}
      getOptionLabel={(option) => option?.label || ""}
      value={
        selectedDevice ||
        devices.find((device) => device.value === field.value) ||
        null
      }
      onChange={handleDeviceChange}
      onBlur={handleBlur}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Serial Number"
          error={Boolean(form.touched[field.name] && form.errors[field.name])}
          helperText={form.touched[field.name] && form.errors[field.name]}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
