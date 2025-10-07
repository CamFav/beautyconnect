import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, handleLogout } = useContext(AuthContext);

  return (
    <div>
      <h1>Mon profil</h1>
      <p><b>Nom</b> : {user?.name}</p>
      <p><b>Email</b> : {user?.email}</p>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}
