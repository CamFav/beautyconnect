import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContextBase";
import ClientProfileView from "@/features/profile/components/client/ClientProfileView";
import ProProfileView from "@/features/profile/components/pro/ProProfileView";
import httpClient from "../../../api/http/httpClient";
import { toast } from "react-hot-toast";
import Seo from "@/components/seo/Seo";

export default function UserProfile() {
  const { id } = useParams();
  const { user: loggedUser } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cas 1 : profil de l'utilisateur connecté
        if (id === loggedUser?._id) {
          setUser(loggedUser);
          return;
        }

        // Cas 2 : profil public
        const res = await httpClient.get(`/users/${id}/public`);
        const data = res.data.user || res.data;
        setUser(data);
      } catch (err) {
        console.error("Erreur récupération utilisateur:", err);

        if (err.response?.status === 401) {
          toast.error("Votre session a expiré, veuillez vous reconnecter.", {
            duration: 4000,
            style: {
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
            },
          });
        }

        setError("Impossible de récupérer ce profil pour le moment.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id, loggedUser]);

  // === États de chargement / erreur ===
  if (loading) {
    return (
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex items-center justify-center min-h-screen text-gray-600"
      >
        <p>Chargement du profil...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex items-center justify-center min-h-screen text-red-500"
      >
        <p>{error}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex items-center justify-center min-h-screen text-gray-600"
      >
        <p>Profil introuvable.</p>
      </main>
    );
  }

  // === Détection du type de profil ===
  const isPro = !!user.proProfile && Object.keys(user.proProfile).length > 0;

  // === SEO dynamique ===
  const profileName = isPro
    ? user.proProfile?.salonName?.trim() || user.name
    : user.name;

  const description = isPro
    ? `Découvrez le profil professionnel de ${profileName}, ses prestations et disponibilités sur BeautyConnect.`
    : `Consultez le profil de ${profileName} sur BeautyConnect.`;

  return (
    <>
      <Seo
        title={
          profileName ? `${profileName} | BeautyConnect` : "Profil utilisateur"
        }
        description={description}
        robots="index,follow"
      />

      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="min-h-screen bg-gray-50 focus:outline-none"
      >
        {isPro ? (
          <ProProfileView user={user} />
        ) : (
          <ClientProfileView user={user} title={`Profil de ${user.name}`} />
        )}
      </main>
    </>
  );
}
