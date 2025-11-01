import { Link } from "react-router-dom";
import Avatar from "../../../components/ui/Avatar";
import { Heart, Star, Calendar } from "lucide-react";

export default function PostCard({
  post,
  user,
  handleLike,
  handleFavorite,
  handleImageClick,
}) {
  const sanitize = (val) =>
    typeof val === "string" ? val.trim().replace(/[<>]/g, "") : val;

  const provider = post.provider;
  const avatar = provider?.avatarPro || provider?.avatarClient || null;
  const displayName = sanitize(
    provider?.proProfile?.businessName || provider?.name || "Prestataire"
  );
  const profileLink = provider?._id
    ? `/profile/${sanitize(provider._id)}`
    : "#";

  const categories = (() => {
    const cats = provider?.proProfile?.categories;
    if (Array.isArray(cats) && cats.length > 0) {
      return cats.slice(0, 2).map(sanitize).join(", ");
    }
    return "Prestataire";
  })();

  const isLiked =
    user && Array.isArray(post.likes) && post.likes.includes(user._id);
  const isFavorited =
    user && Array.isArray(post.favorites) && post.favorites.includes(user._id);

  const description = sanitize(post.description || "");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      {post.mediaUrl && (
        <img
          src={sanitize(post.mediaUrl)}
          alt="Post"
          className="w-full aspect-square object-cover cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => handleImageClick?.(post)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleImageClick?.(post);
          }}
        />
      )}

      <div className="p-4 space-y-4">
        {/* Auteur */}
        {provider ? (
          <Link
            to={profileLink}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Avatar src={avatar} alt={displayName} size={42} />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">{displayName}</span>
              <span className="text-xs text-gray-500">{categories}</span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <span className="text-gray-500 text-sm">Utilisateur inconnu</span>
          </div>
        )}

        {/* Description (tronquée avec ellipsis) */}
        <p
          className="text-sm text-gray-700 leading-relaxed line-clamp-3 overflow-hidden text-ellipsis"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <button
              onClick={() => post._id && handleLike(post._id)}
              className="flex items-center gap-1 hover:text-red-600 transition"
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
            </button>

            <button
              onClick={() => post._id && handleFavorite(post._id)}
              className="flex items-center gap-1 hover:text-yellow-500 transition"
            >
              <Star size={20} fill={isFavorited ? "currentColor" : "none"} />
              <span>
                {Array.isArray(post.favorites) ? post.favorites.length : 0}
              </span>
            </button>
          </div>

          {provider?._id && (
            <Link
              to={`/profile/${sanitize(provider._id)}#offres`}
              className="flex items-center gap-1 hover:text-green-600 transition"
            >
              <Calendar size={18} />
              <span>Réserver</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
