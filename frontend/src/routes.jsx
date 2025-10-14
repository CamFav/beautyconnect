import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";

import Layout from "./components/layout/Layout.jsx";
import Home from "./features/home/pages/Home.jsx";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import Landing from "./features/home/pages/Landing.jsx";
import RegisterPro from "./features/auth/RegisterPro/RegisterPro.jsx";
import Settings from "./features/settings/pages/Settings.jsx";
import MyProfile from "./features/profile/pages/MyProfile.jsx";
import UserProfile from "./features/profile/pages/UserProfile.jsx";
import Explorer from "./features/explore/Explorer.jsx";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/home" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Routes publiques */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/register-pro"
        element={
          <PublicRoute>
            <RegisterPro />
          </PublicRoute>
        }
      />

      <Route
        path="/upgrade-pro"
        element={
          <ProtectedRoute>
            <Layout>
              <RegisterPro />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/explore"
        element={
          <Layout>
            <Explorer />
          </Layout>
        }
      />

      {/* Routes protégées */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Profil connecté */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <MyProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Profil public */}
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <UserProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
