import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts, likePost, favoritePost } from "../../api/post.service";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/common/Avatar";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data.posts || data);
      } catch (error) {
        console.error("Erreur récupération posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    if (!token) {
      alert("Vous devez être connecté pour liker.");
      return;
    }

    try {
      const updated = await likePost(token, postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: updated.liked
                  ? [...p.likes, user._id]
                  : p.likes.filter((id) => id !== user._id),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Erreur like:", err);
    }
  };

  const handleFavorite = async (postId) => {
    if (!token) {
      alert("Vous devez être connecté pour ajouter en favori.");
      return;
    }

    try {
      const updated = await favoritePost(token, postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                favorites: updated.favorited
                  ? [...p.favorites, user._id]
                  : p.favorites.filter((id) => id !== user._id),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Erreur favori:", err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-2">Derniers posts</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post) => {
          const provider = post.provider;
          const avatar = provider?.avatarPro || provider?.avatarClient;
          const displayName =
            provider?.proProfile?.businessName ||
            provider?.name ||
            "Prestataire";
          const profileLink = provider?._id ? `/profile/${provider._id}` : "#";

          const isLiked = user && post.likes.includes(user._id);
          const isFavorited = user && post.favorites?.includes(user._id);

          return (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={post.mediaUrl}
                alt="Post"
                className="w-full aspect-square object-cover"
              />

              <div className="p-3 space-y-2">
                {provider ? (
                  <Link
                    to={profileLink}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Avatar
                      src={avatar}
                      alt={displayName}
                      size={40}
                      fallback={displayName[0]?.toUpperCase() || "?"}
                    />
                    <span className="font-medium">{displayName}</span>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <span className="font-medium text-gray-500">
                      Utilisateur inconnu
                    </span>
                  </div>
                )}

                <p className="text-sm text-gray-700">{post.description}</p>

                {/* Like + Favori */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleLike(post._id)}>
                      {isLiked ? "❤️" : "🤍"}
                    </button>
                    <span>{post.likes.length}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => handleFavorite(post._id)}>
                      {isFavorited ? "★" : "☆"}
                    </button>
                    <span>{post.favorites?.length || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button className="flex-1 bg-gray-200 text-gray-800 text-sm py-2 rounded">
                    Contacter
                  </button>
                  {provider?._id && (
                    <Link
                      to={`/profile/${provider._id}#offres`}
                      className="flex-1 bg-blue-600 text-white text-sm py-2 rounded text-center"
                    >
                      Réserver
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
