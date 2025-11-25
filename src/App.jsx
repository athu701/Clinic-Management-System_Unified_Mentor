import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Home from "./Pages/Home";

import DoctorLogin from "./Pages/Auth/DoctorLogin";
import ReceptionistLogin from "./Pages/Auth/ReceptionistLogin";
import DoctorDashboard from "./Pages/Doctor/DoctorDashboard";
import ReceptionistDashboard from "./Pages/Receptionist/ReceptionistDashboard";
import AssignedPatients from "./Pages/Receptionist/AssignedPatients.jsx";
import AddPatient from "./Pages/Doctor/AddPatient";
import EditPatient from "./Pages/Doctor/EditPatient";
import DoctorPatients from "./Pages/Doctor/DoctorPatients";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/receptionist-login" element={<ReceptionistLogin />} />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receptionist-dashboard"
          element={
            <ProtectedRoute role="receptionist">
              <ReceptionistDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/add-patient" element={<AddPatient />} />
        <Route
          path="/edit-patient/:doctorId/:patientId"
          element={<EditPatient />}
        />
        <Route path="/assigned-patients" element={<AssignedPatients />} />
        <Route path="/doctor-patients" element={<DoctorPatients />} />

        {/* admin */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
