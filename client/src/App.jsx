import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./components/protectedRoutes";
import Login from "./components/login.jsx";
import Registration from "./components/registration";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
