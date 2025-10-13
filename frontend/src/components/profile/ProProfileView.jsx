import { useEffect, useState } from "react";
import axios from "axios";

export default function ProProfileView({ user }) {
  const [posts, setPosts] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/posts?provider=${user._id}`
        );
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error("Erreur lors du chargement des posts du prestataire:", err);
      }
    };

    if (user?._id) {
      fetchPosts();
    }
  }, [user]);

  const visiblePosts = showAll ? posts : posts.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {user.avatarPro ? (
            <img
              src={user.avatarPro}
              alt="avatar pro"
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-medium">
              {user.proProfile?.businessName?.[0]?.toUpperCase() ||
                user.name?.[0]?.toUpperCase() ||
                "?"}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {user.proProfile?.businessName || user.name}
            </h1>
            <p className="text-gray-600 text-sm">124 abonnés</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Contacter
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("offres");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réserver
          </button>
        </div>
      </div>

      <section className="bg-white p-5 rounded shadow space-y-2">
        <h2 className="text-xl font-semibold">Informations</h2>
        <p>
          <b>Localisation :</b> {user.proProfile?.location || "—"}
        </p>
        <p>
          <b>Services :</b>{" "}
          {Array.isArray(user.proProfile?.services) &&
          user.proProfile.services.length > 0
            ? user.proProfile.services.join(", ")
            : "—"}
        </p>
      </section>

      <section className="bg-white p-5 rounded shadow space-y-2">
        <h2 className="text-xl font-semibold">Statut & Exercice</h2>
        <p>
          <b>Statut :</b> {user.proProfile?.status || "Non renseigné"}
        </p>
        <p>
          <b>Types d’exercice :</b>{" "}
          {Array.isArray(user.proProfile?.exerciseType) &&
          user.proProfile.exerciseType.length > 0
            ? user.proProfile.exerciseType.join(", ")
            : "Non renseigné"}
        </p>
        <p>
          <b>Expérience :</b>{" "}
          {user.proProfile?.experience || "Non renseignée"}
        </p>
      </section>

      {/* Dernières publications */}
      <section className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Dernières publications</h2>

        {posts.length === 0 ? (
          <p className="text-gray-500">Aucune publication pour le moment.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {visiblePosts.map((post) => (
                <img
                  key={post._id}
                  src={post.mediaUrl}
                  alt="Publication"
                  className="aspect-square object-cover rounded border"
                />
              ))}
            </div>

            {posts.length > 3 && (
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="mt-4 text-blue-600 hover:underline"
              >
                {showAll ? "Voir moins" : "Voir plus"}
              </button>
            )}
          </>
        )}
      </section>

      <section id="offres" className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Offres et tarifs (mock)</h2>
        <ul className="space-y-2">
          <li>Coupe / Brushing - 40€</li>
          <li>Maquillage événementiel - 60€</li>
          <li>Tatouage (petits motifs) - Dès 80€</li>
        </ul>
      </section>
    </div>
  );
}
