import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContextBase";
import { likePost, favoritePost } from "../../api/posts/post.service";
import { Heart, Star, Calendar, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authRequired } from "@/utils/errorMessages";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function PostModal({ post, isOpen, onClose, onUpdate }) {
  const { user: currentUser, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => setLocalPost(post), [post]);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && closeBtnRef.current) closeBtnRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    const trapFocus = (e) => {
      if (!isOpen || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [isOpen]);

  if (!isOpen || !localPost) return null;

  const sanitize = (val) =>
    typeof val === "string"
      ? val
          .trim()
          .replace(/[<>]/g, "")
          .replace(/&#x27;/g, "'")
      : val;

  const provider = localPost.provider;
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

  const checkToken = () => {
    if (!token) {
      toast.error(authRequired(), {
        duration: 4000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
        },
      });
      onClose();
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!checkToken()) return;
    setLoading(true);
    try {
      const updated = await likePost(localPost._id, token);
      const newLikes = updated.liked
        ? [...(localPost.likes || []), currentUser._id]
        : (localPost.likes || []).filter((id) => id !== currentUser._id);
      const updatedPost = { ...localPost, likes: newLikes };
      setLocalPost(updatedPost);
      onUpdate(updatedPost);
    } catch {
      toast.error("Impossible de liker ce post pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!checkToken()) return;
    setLoading(true);
    try {
      const updated = await favoritePost(localPost._id, token);
      const newFavorites = updated.favorited
        ? [...(localPost.favorites || []), currentUser._id]
        : (localPost.favorites || []).filter((id) => id !== currentUser._id);
      const updatedPost = { ...localPost, favorites: newFavorites };
      setLocalPost(updatedPost);
      onUpdate(updatedPost);
    } catch {
      toast.error("Impossible d'ajouter ce post en favori.");
    } finally {
      setLoading(false);
    }
  };

  const isLiked = currentUser && localPost.likes?.includes(currentUser._id);
  const isFavorited =
    currentUser && localPost.favorites?.includes(currentUser._id);
  const isOwner = currentUser?._id === provider?._id;

  const formattedDate = localPost.createdAt
    ? formatDistanceToNow(new Date(localPost.createdAt), {
        addSuffix: true,
        locale: fr,
      })
    : null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-sm overflow-y-auto p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-modal-title"
      aria-describedby="post-modal-desc"
      tabIndex={0}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg max-w-md w-full relative p-4 space-y-4 outline-none max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/80 hover:bg-white/95 text-gray-700 hover:text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="Fermer la fenêtre de publication"
        >
          <X size={20} strokeWidth={2.2} />
        </button>

        <div className="relative w-full max-h-[60vh] overflow-hidden">
          {localPost.mediaUrl && (
            <>
              <img
                src={sanitize(localPost.mediaUrl)}
                alt="Image de la publication"
                className="w-full rounded max-h-[60vh] object-contain"
              />
              {formattedDate && (
                <div className="absolute top-2 left-2 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded-md shadow-sm">
                  {formattedDate}
                </div>
              )}
            </>
          )}
        </div>

        {provider && (
          <Link
            to={profileLink}
            className="flex items-center gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-md"
          >
            <Avatar src={avatar} alt={displayName} size={42} />
            <div className="flex flex-col leading-tight">
              <span
                id="post-modal-title"
                className="font-semibold text-sm text-gray-900"
              >
                {displayName}
              </span>
              <span className="text-xs text-gray-500">{categories}</span>
            </div>
          </Link>
        )}

        <p
          id="post-modal-desc"
          className="text-gray-700 break-words overflow-hidden text-sm leading-snug"
          style={{
            wordBreak: "break-word",
            maxHeight: "6rem",
            overflowY: "auto",
          }}
        >
          {sanitize(localPost.description) || "Pas de description"}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <button
              onClick={!isOwner ? handleLike : undefined}
              disabled={loading || isOwner}
              title={
                isOwner
                  ? "Action indisponible sur vos propres publications"
                  : ""
              }
              className={`flex items-center gap-1 transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                isOwner ? "opacity-50 cursor-not-allowed" : "hover:text-red-600"
              }`}
            >
              <Heart
                size={22}
                strokeWidth={1.5}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>
                {Array.isArray(localPost.likes) ? localPost.likes.length : 0}
              </span>
            </button>

            <button
              onClick={!isOwner ? handleFavorite : undefined}
              disabled={loading || isOwner}
              title={
                isOwner
                  ? "Action indisponible sur vos propres publications"
                  : ""
              }
              className={`flex items-center gap-1 transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                isOwner
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:text-yellow-500"
              }`}
            >
              <Star
                size={22}
                strokeWidth={1.5}
                fill={isFavorited ? "currentColor" : "none"}
              />
              <span>
                {Array.isArray(localPost.favorites)
                  ? localPost.favorites.length
                  : 0}
              </span>
            </button>
          </div>

          {!isOwner && provider?._id && (
            <Link
              to={`/profile/${sanitize(provider._id)}#offres`}
              className="flex items-center gap-1 hover:text-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-600 rounded-md"
            >
              <Calendar size={20} />
              <span>Réserver</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
