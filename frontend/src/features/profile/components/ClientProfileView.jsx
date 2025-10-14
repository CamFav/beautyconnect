import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts } from "../../../api/post.service";
import { useAuth } from "../../../context/AuthContext";
import PostModal from "../../../components/common/PostModal";
import Avatar from "../../../components/common/Avatar";
import http from "../../../api/httpClient";

// Vue profil client (informations, favoris, abonnements)
export default function ClientProfileView({ user, title = "Mon profil" }) {
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  // Récupère les posts favoris et abonnements
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const data = await getPosts();
        const posts = data.posts || data;

        const sortedPosts = [...posts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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
  }, [user]);

  // Récupère les abonnements
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        if (user?.following?.length > 0) {
          const idsParam = user.following.join(",");
          const res = await http.get(`/users`, {
            params: { ids: idsParam },
          });
          setSubscriptions(res.data);
        } else {
          setSubscriptions([]);
        }
      } catch (err) {
        console.error("Erreur récupération abonnements:", err);
      }
    };

    if (user?._id) fetchSubscriptions();
  }, [user]);

  // Met à jour un post dans les favoris
  const handleUpdatePost = (updated) => {
    setFavoritePosts((prev) =>
      prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p))
    );
    setSelectedPost((prev) =>
      prev && prev._id === updated._id ? { ...prev, ...updated } : prev
    );
  };

  // Affichage
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{title}</h1>

      <div className="space-y-6">
        {/* Avatar utilisateur */}
        <div className="flex items-center mb-6">
          <Avatar
            src={user.avatarClient}
            alt={user.name}
            size={80}
            fallback={user.name?.[0]?.toUpperCase() || "?"}
          />
        </div>

        {/* Infos */}
        <section className="bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            Informations personnelles
          </h2>
          <p>
            <b>Nom :</b> {user.name}
          </p>
          <p>
            <b>Email :</b> {user.email}
          </p>
        </section>

        {/* Favoris */}
        <section className="bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Photos en favori</h2>
          {favoritePosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {favoritePosts.slice(0, 6).map((post) => (
                <img
                  key={post._id}
                  src={post.mediaUrl}
                  alt="favorite"
                  className="aspect-square object-cover rounded cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun favori pour le moment.</p>
          )}
        </section>

        {/* Abonnements */}
        <section className="bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Mes abonnements</h2>
          {subscriptions.length > 0 ? (
            <ul className="space-y-2">
              {subscriptions.map((u) => (
                <li
                  key={u._id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  onClick={() => navigate(`/profile/${u._id}`)}
                >
                  <Avatar
                    src={u.avatarPro || u.avatarClient}
                    alt={u.name}
                    size={48}
                    fallback={u.name?.[0]?.toUpperCase() || "?"}
                  />
                  <span className="text-gray-700">
                    {u.proProfile?.businessName || u.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun abonnement pour le moment.</p>
          )}
        </section>
      </div>

      {/* Modal */}
      <PostModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onUpdate={handleUpdatePost}
        canEdit={false}
      />
    </div>
  );
}
