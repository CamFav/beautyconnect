import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts } from "../../../../api/posts/post.service";
import PostModal from "../../../../components/feedback/PostModal";
import Avatar from "../../../../components/ui/Avatar";
import http from "../../../../api/http/httpClient";
import { Mail, Users, Star } from "lucide-react";

export default function ClientProfileView({ user }) {
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [showAllSubscriptions, setShowAllSubscriptions] = useState(false);
  const navigate = useNavigate();

  // === Récupération des favoris ===
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const data = await getPosts();
        const posts = data.posts || data;
        const sortedPosts = [...posts].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        const favorites = sortedPosts.filter((p) =>
          p.favorites?.includes(user._id)
        );
        setFavoritePosts(favorites);
      } catch (err) {
        console.error("Erreur récupération posts client:", err);
      }
    };

    if (user?._id) fetchUserPosts();
  }, [user?._id]);

  // === Récupération des abonnements ===
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        if (user?.following?.length > 0) {
          const idsParam = user.following.join(",");
          const res = await http.get("/users", { params: { ids: idsParam } });
          const arr = Array.isArray(res.data)
            ? res.data
            : res.data?.users || [];
          setSubscriptions(arr);
        } else {
          setSubscriptions([]);
        }
      } catch (err) {
        console.error("Erreur récupération abonnements:", err);
      }
    };

    if (user?._id) fetchSubscriptions();
  }, [user?._id, user?.following]);

  const handleUpdatePost = (updated) => {
    setFavoritePosts((prev) =>
      prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p))
    );
    setSelectedPost((prev) =>
      prev && prev._id === updated._id ? { ...prev, ...updated } : prev
    );
  };

  // === Limites d’affichage initial ===
  const maxFavorites = 6;
  const maxSubscriptions = 6;

  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      aria-label={`Profil client de ${user.name}`}
      className="max-w-3xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen focus:outline-none"
    >
      {/* === En-tête du profil === */}
      <header
        className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-md border border-gray-200"
        aria-label="Informations du profil"
      >
        <Avatar
          src={user.avatarClient}
          alt={user.name}
          size={80}
          fallback={user.name?.[0]?.toUpperCase() || "?"}
        />
        <div className="flex flex-col justify-center gap-1">
          <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
          <div className="flex items-center gap-2 text-gray-500">
            <Mail size={16} aria-hidden="true" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <Users size={16} aria-hidden="true" />
            <span>{user.following?.length || 0} abonnements</span>
          </div>
        </div>
      </header>

      {/* === Section Favoris === */}
      <section
        aria-label="Photos favorites"
        className="bg-white p-5 rounded-xl shadow-md border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <Star size={20} className="text-yellow-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Photos en favori</h2>
        </div>

        {favoritePosts.length > 0 ? (
          <>
            <div
              className="grid grid-cols-3 gap-3"
              role="list"
              aria-label="Liste de publications favorites"
            >
              {(showAllFavorites
                ? favoritePosts
                : favoritePosts.slice(0, maxFavorites)
              ).map((post) => (
                <button
                  key={post._id}
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="aspect-square w-full rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform focus:ring-2 focus:ring-blue-400"
                  aria-label={`Voir la publication favorite du ${new Date(
                    post.createdAt
                  ).toLocaleDateString("fr-FR")}`}
                >
                  <img
                    src={post.mediaUrl}
                    alt={`Publication favorite de ${user.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            {favoritePosts.length > maxFavorites && !showAllFavorites && (
              <button
                onClick={() => setShowAllFavorites(true)}
                className="mt-3 text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              >
                Voir plus
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500">Aucun favori pour le moment.</p>
        )}
      </section>

      {/* === Section Abonnements === */}
      <section
        aria-label="Mes abonnements"
        className="bg-white p-5 rounded-xl shadow-md border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-blue-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Mes abonnements</h2>
        </div>

        {subscriptions.length > 0 ? (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              role="list"
              aria-label="Liste de mes abonnements"
            >
              {(showAllSubscriptions
                ? subscriptions
                : subscriptions.slice(0, maxSubscriptions)
              ).map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => navigate(`/profile/${u._id}`)}
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition focus:ring-2 focus:ring-blue-400"
                  aria-label={`Voir le profil de ${
                    u.proProfile?.businessName || u.name
                  }`}
                >
                  <Avatar
                    src={u.avatarPro || u.avatarClient}
                    alt={u.name}
                    size={64}
                    className="mb-2 border"
                  />
                  <span className="text-gray-700 font-medium text-center">
                    {u.proProfile?.businessName || u.name}
                  </span>
                </button>
              ))}
            </div>

            {subscriptions.length > maxSubscriptions &&
              !showAllSubscriptions && (
                <button
                  onClick={() => setShowAllSubscriptions(true)}
                  className="mt-3 text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                >
                  Voir plus
                </button>
              )}
          </>
        ) : (
          <p className="text-gray-500">Aucun abonnement pour le moment.</p>
        )}
      </section>

      {/* === Modal de publication === */}
      <PostModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onUpdate={handleUpdatePost}
        canEdit={false}
      />
    </main>
  );
}
