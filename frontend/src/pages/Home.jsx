import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Feed from "../components/Feed";
import ProDashboard from "../components/ProDashboard";

export default function Home() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <p>Chargement...</p>;
  }

  return user.activeRole === "pro" ? <ProDashboard /> : <Feed />;
}
