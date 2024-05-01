import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserProfilePage from "./userProfile";
import Courses from "./coursePage";
import UserPage from "./users";
import NavBar from "./navBar";

function ProtectedRoutes() {
  const [tokenStatus, setTokenStatus] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("Token");
    fetch("/api/verified/get-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTokenStatus(data.tokenStatus === "true");
      })
      .catch((error) => {
        console.log(error);
        setTokenStatus(false); // Set token status to false if there's an error
      });
  }, []);

  if (tokenStatus === null) {
    return <div>Loading...</div>;
  }

  // Define a wrapper component for protected routes
  function ProtectedRouteWrapper({ element, path }) {
    return tokenStatus ? (
      element
    ) : (
      <Navigate to="/login" replace state={{ from: path }} />
    );
  }

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <Routes>
        <Route
          path="/verified/user-profile"
          element={<ProtectedRouteWrapper element={<UserProfilePage />} path="/verified/user-profile" />}
        />
        <Route
          path="/verified/courses"
          element={<ProtectedRouteWrapper element={<Courses />} path="/verified/courses" />}
        />
        <Route
          path="/verified/users"
          element={<ProtectedRouteWrapper element={<UserPage />} path="/verified/users" />}
        />
      </Routes>
    </>
  );
}

export default ProtectedRoutes;
