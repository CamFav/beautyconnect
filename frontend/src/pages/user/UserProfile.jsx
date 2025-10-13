import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import ClientProfileView from "../../components/profile/ClientProfileView";
import ProProfileView from "../../components/profile/ProProfileView";

export default function UserProfile() {
  const { id } = useParams();
  const { token, user: loggedUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Si l'utilisateur consulte son propre profil
        if (id === loggedUser?._id) {
          setUser(loggedUser);
          return;
        }

        // Sinon, on récupère les infos d'un autre user
        const res = await axios.get(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Erreur récupération utilisateur:", err);
      }
    };

    fetchUser();
  }, [id, loggedUser, token]);

   // SCROLL AUTOMATIQUE SUR #offres
  useEffect(() => {
    if (!user) return;

    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    }
  }, [user]);

  if (!user) {
    return <p className="text-center py-8">Chargement...</p>;
  }

  // Détermine si c’est un profil pro
  const isPro =
    user.proProfile && Object.keys(user.proProfile).length > 0;

  // PROFIL CLIENT
  if (!isPro) {
    return <ClientProfileView user={user} title={`Profil de ${user.name}`} />;
  }

  // PROFIL PRO
  return <ProProfileView user={user} />;
}
