import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../../api/post.service";

export default function Feed() {
  const [posts, setPosts] = useState([]);

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

  
  return (
    <div
      key={post._id}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      {/* Image du post */}
      <img
        src={post.mediaUrl}
        alt="Post"
        className="w-full aspect-square object-cover"
      />

      {/* Infos sous l'image */}
      <div className="p-3 space-y-2">
        
        {/* Avatar + nom cliquables */}
        {provider ? (
          <Link
            to={profileLink}
            className="flex items-center space-x-2 cursor-pointer"
          >
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-white">
                {displayName[0]?.toUpperCase() || "?"}
              </div>
            )}

            <span className="font-medium">{displayName}</span>
          </Link>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <span className="font-medium text-gray-500">Utilisateur inconnu</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-700">{post.description}</p>

        {/* Bouton contact / réservation */}
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
