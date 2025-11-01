import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContextBase";
import UpgradeToPro from "./UpgradeToPro";

export default function UpgradeProRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (user?.role === "pro" || user?.activeRole === "pro") {
    return <Navigate to="/pro/dashboard" replace />;
  }

  return <UpgradeToPro />;
}
