import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Feed from "../../components/feed/Feed";
import ProDashboard from "../../components/dashboard/ProDashboard";

export default function Home() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <p>Chargement...</p>;
  }

  return user.activeRole === "pro" ? <ProDashboard /> : <Feed />;
}
