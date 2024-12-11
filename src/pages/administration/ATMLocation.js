import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Import Leaflet styles

const ATMLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  // Replace with the device's IP address
  const ipAddress = "134.201.250.155";
  const apiKey = process.env.REACT_APP_IPAPI_KEY; // Ensure this key is set in your .env file
  console.log(apiKey);
  // http://api.ipapi.com/134.201.250.155
  // ? access_key = YOUR_ACCESS_KEY

  useEffect(() => {
    // Fetch geolocation data using ipapi
    axios
      .get(
        `https://api.ipapi.com/${ipAddress}?access_key=5c5c0ef51e79cd89e5ddc26b29cf133a`
      )
      .then((response) => {
        // Log the API response for debugging
        console.log("API Response: ", response.data);

        const { latitude, longitude, city, country_name } = response.data;

        // Check if latitude and longitude are valid before setting the state
        if (latitude && longitude) {
          setLocation({
            lat: latitude,
            lng: longitude,
            city,
            country: country_name,
          });
        } else {
          setError("Location data not found");
          console.error("Invalid latitude or longitude data.");
        }
      })
      .catch((err) => {
        setError("Error fetching location");
        console.error(err);
      });
  }, [ipAddress, apiKey]);

  return (
    <Box>
      <h1>Device Location</h1>
      {/* Render the map only if the location data is available */}
      {location ? (
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              {location.city}, {location.country}
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p>{error || "Loading location..."}</p>
      )}

      {location && (
        <p>
          Location: {location.city}, {location.country}
        </p>
      )}
    </Box>
  );
};

export default ATMLocation;
