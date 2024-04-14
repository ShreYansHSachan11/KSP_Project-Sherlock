import React, { useState, useEffect } from "react";
import { Box, Grid, TextField, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Assuming you're using React Router for navigation
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    // Check if the user is logged in when the component mounts
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);


  const handleLogin = () => {
    axios
      .post("https://sherlock-backend-4.onrender.com/login", {
        email,
        password,
      })
      .then((response) => {
        
        if (response.data.status) {
            const token = response.data.result.token;
            const username = response.data.result.userValid.firstName; // Assuming the username is provided in the response
            const id= response.data.result.userValid._id;
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("id", id); // Save the username in sessionStorage
        setIsLoggedIn(true); 
          navigate("/anonymize");
        } else {
          setError("Invalid email or password");
        }
      })
      .catch((error) => {
        setError("An error occurred. Please try again later.");
      });
   
  };

  
  return (
    <Container
      maxWidth="sm"
      style={{ border: "1px solid black", display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ color: "black" }}>Login</h2>
        {/* Check if the user is logged in */}
        {isLoggedIn ? (
          <p style={{color:"black"}}>You are already logged in.</p>
        ) : (
          <Box
            component="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            sx={{ mt: 1 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 5, backgroundColor: "#00C9B8" }}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;
