import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useContext } from "react";
import { AuthContext } from "./context/AuthContextBase";
import Layout from "./components/layout/Layout";
import UpgradeProRoute from "@/features/auth/components/register-pro/UpgradeProRoute";

// === Lazy imports ===
const Home = lazy(() => import("./features/home/pages/Home"));
const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));
const Landing = lazy(() => import("./features/home/pages/Landing"));
const RegisterPro = lazy(() => import("./features/auth/pages/RegisterPro"));
const Settings = lazy(() => import("./features/settings/pages/Settings"));
const MyProfile = lazy(() => import("./features/profile/pages/MyProfile"));
const UserProfile = lazy(() => import("./features/profile/pages/UserProfile"));
const Explorer = lazy(() => import("./features/explore/Explorer"));
const ProDashboard = lazy(() => import("./features/pro/pages/ProDashboard"));
const ReservationsPro = lazy(() =>
  import("./features/pro/pages/ReservationsPro")
);
const ServicesPro = lazy(() => import("./features/pro/pages/ServicesPro"));
const DisponibilitesPro = lazy(() =>
  import("./features/pro/pages/DisponibilitesPro")
);
const MesRendezVous = lazy(() =>
  import("./features/client/pages/MesRendezVous")
);
const Suivis = lazy(() => import("./features/client/pages/Suivis"));
const MentionsLegales = lazy(() =>
  import("./features/legal/pages/MentionsLegales")
);
const PolitiqueConfidentialite = lazy(() =>
  import("./features/legal/pages/PolitiqueConfidentialite")
);
const CGU = lazy(() => import("./features/legal/pages/CGU"));

// === Guards ===
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? <Navigate to="/feed" replace /> : children;
}

function HomeGateway() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.activeRole === "pro" ? (
    <Navigate to="/pro/dashboard" replace />
  ) : (
    <Navigate to="/feed" replace />
  );
}

// === Routes ===
export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-600">Chargement...</div>
      }
    >
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Auth */}
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

        {/* Upgrade Pro */}
        <Route
          path="/upgrade-pro"
          element={
            <ProtectedRoute>
              <UpgradeProRoute />
            </ProtectedRoute>
          }
        />

        {/* Pages principales */}
        <Route
          path="/explore"
          element={
            <Layout>
              <Explorer />
            </Layout>
          }
        />
        <Route
          path="/feed"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <Layout>
              <UserProfile />
            </Layout>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeGateway />
            </ProtectedRoute>
          }
        />

        {/* Espace Pro */}
        <Route
          path="/pro/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <ProDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro/services"
          element={
            <ProtectedRoute>
              <Layout>
                <ServicesPro />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro/disponibilites"
          element={
            <ProtectedRoute>
              <Layout>
                <DisponibilitesPro />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro/reservations"
          element={
            <ProtectedRoute>
              <Layout>
                <ReservationsPro />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Espace Client */}
        <Route
          path="/mes-rendez-vous"
          element={
            <ProtectedRoute>
              <Layout>
                <MesRendezVous />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/suivis"
          element={
            <ProtectedRoute>
              <Layout>
                <Suivis />
              </Layout>
            </ProtectedRoute>
          }
        />
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

        {/* === Pages légales publiques === */}
        <Route
          path="/legal/mentions-legales"
          element={
            <Layout>
              <MentionsLegales />
            </Layout>
          }
        />
        <Route
          path="/legal/cgu"
          element={
            <Layout>
              <CGU />
            </Layout>
          }
        />
        <Route
          path="/legal/politique-de-confidentialite"
          element={
            <Layout>
              <PolitiqueConfidentialite />
            </Layout>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
