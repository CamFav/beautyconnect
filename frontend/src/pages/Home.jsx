import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user, handleLogout } = useContext(AuthContext);

  if (!user) return <p>Chargement...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenue, {user.name}</h1>
      <p>Email : {user.email}</p>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}
