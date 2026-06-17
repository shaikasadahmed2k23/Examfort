import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import RegisterAdmin from "./pages/RegisterAdmin.jsx";
import AdminHome from "./pages/AdminHome.jsx";
import SeatSmart from "./pages/SeatSmart.jsx";
import MockBoardCreate from "./pages/MockBoardCreate.jsx";
import MockBoardLeaderboard from "./pages/MockBoardLeaderboard.jsx";
import LeakTrace from "./pages/LeakTrace.jsx";
import PaperVault from "./pages/PaperVault.jsx";
import StudentExam from "./pages/StudentExam.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register-admin" element={<RegisterAdmin />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/seatsmart"
        element={
          <ProtectedRoute allowedRole="admin">
            <SeatSmart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mockboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <MockBoardCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mockboard/leaderboard/:quizId"
        element={
          <ProtectedRoute allowedRole="admin">
            <MockBoardLeaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leaktrace"
        element={
          <ProtectedRoute allowedRole="admin">
            <LeakTrace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/papervault"
        element={
          <ProtectedRoute allowedRole="admin">
            <PaperVault />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentExam />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}