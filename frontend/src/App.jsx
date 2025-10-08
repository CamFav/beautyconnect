import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";

import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Landing from "./pages/Landing.jsx";
import RegisterPro from "./pages/RegisterPro.jsx";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const { user, token } = useContext(AuthContext);

  // Vérifier le token
  if (token && !user) {
    return <p style={{ textAlign: "center" }}>Chargement...</p>;
  }

  // Sinon on vérifie si user existe
  return user ? children : <Navigate to="/login" replace />;
}

// Empêcher les users déjà connectés d'accéder à /login ou /register
function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/home" replace /> : children;
}

export default function App() {
  const { token } = useContext(AuthContext);
  return (
    <BrowserRouter>
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
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
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
        {/* allback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
