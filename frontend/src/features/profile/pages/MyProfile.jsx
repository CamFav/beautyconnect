import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import ClientProfileView from "../components/ClientProfileView";
import ProProfileView from "../components/ProProfileView";

export default function MyProfile() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <p className="text-center py-8">Chargement...</p>;
  }

  // PROFIL CLIENT
  if (user.activeRole !== "pro") {
    return <ClientProfileView user={user} title="Mon profil" />;
  }

  // PROFIL PRO
  return <ProProfileView user={user} />;
}
