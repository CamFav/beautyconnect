import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContextBase";
import { getPros, followUser } from "../../../api/users/user.service";
import ProCard from "@/features/explore/components/ProCard";
import Seo from "@/components/seo/Seo.jsx";

export default function Suivis() {
  const { user: currentUser, token } = useAuth();
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Chargement des pros suivis ---
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!currentUser?._id) return;
      setLoading(true);

      try {
        const data = await getPros();

        // On garde uniquement ceux suivis par le user
        console.log("Réponse API suivis :", data);
        const followingPros = data.filter(
          (pro) =>
            Array.isArray(pro.followers) &&
            pro.followers.includes(currentUser._id)
        );

        setPros(followingPros);
      } catch (err) {
        console.error("Erreur chargement des suivis :", err);
      }

      setLoading(false);
    };

    fetchFollowing();
  }, [currentUser]);

  // --- Gestion follow/unfollow ---
  const handleFollow = async (proId) => {
    if (!token) {
      alert("Vous devez être connecté pour gérer vos suivis.");
      return;
    }

    try {
      const result = await followUser(proId);

      // Si on vient de se désabonner, on retire la carte
      if (!result.following) {
        setPros((prev) => prev.filter((pro) => pro._id !== proId));
      }
    } catch (err) {
      console.error("Erreur lors du follow/unfollow :", err);
    }
  };

  return (
    <>
      <Seo
        title="Mes suivis"
        description="Suivez vos professionnels préférés et recevez leurs dernières actualités."
      />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Mes suivis</h1>
          <p className="text-gray-600">
            Retrouvez ici tous les professionnels que vous suivez.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : pros.length === 0 ? (
          <p className="text-gray-500">
            Vous ne suivez encore aucun professionnel.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pros.map((pro) => (
              <ProCard
                key={pro._id}
                pro={pro}
                isFollowing={true}
                onFollow={() => handleFollow(pro._id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
