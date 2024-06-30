import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SensorManagement from "./components/SensorManagement";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-sensors" element={<SensorManagement />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App;
