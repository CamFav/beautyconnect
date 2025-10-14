import {
  likePost,
  favoritePost,
  updatePost,
  deletePost,
} from "../api/post.service";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";

export default function PostModal({
  post,
  isOpen,
  onClose,
  onUpdate,
  canEdit,
}) {
  const { user: currentUser, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(
    post?.description || ""
  );

  // Resynchronise la description locale quand le post chang
  useEffect(() => {
    if (post) {
      setEditDescription(post.description || "");
    }
  }, [post]);

  if (!post) return null;

  const isOwner =
    canEdit &&
    currentUser &&
    currentUser.role === "pro" &&
    (post.provider?._id === currentUser._id ||
      post.provider === currentUser._id);

  const handleLike = async () => {
    if (!token) return alert("Vous devez être connecté pour liker.");
    try {
      const updated = await likePost(token, post._id);
      onUpdate({
        ...post,
        likes: updated.liked
          ? [...post.likes, currentUser._id]
          : post.likes.filter((id) => id !== currentUser._id),
      });
    } catch (err) {
      console.error("Erreur like :", err);
    }
  };

  const handleFavorite = async () => {
    if (!token)
      return alert("Vous devez être connecté pour ajouter en favori.");
    try {
      const updated = await favoritePost(token, post._id);
      onUpdate({
        ...post,
        favorites: updated.favorited
          ? [...post.favorites, currentUser._id]
          : post.favorites.filter((id) => id !== currentUser._id),
      });
    } catch (err) {
      console.error("Erreur favori :", err);
    }
  };

  const handleSaveEdit = async () => {
    if (!token) return alert("Vous devez être connecté pour modifier ce post.");
    try {
      const updatedPost = await updatePost(token, post._id, {
        description: editDescription,
      });

      onUpdate(updatedPost);
      setIsEditing(false);
    } catch (err) {
      console.error("Erreur modification post :", err);
      alert("Impossible de modifier la publication.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-3">
        <img src={post.mediaUrl} alt="Publication" className="w-full rounded" />

        {/* Description en mode édition ou affichage normal */}
        {isEditing ? (
          <textarea
            className="w-full border rounded p-2 text-gray-700"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        ) : (
          <p className="text-gray-700">
            {post.description || "Pas de description"}
          </p>
        )}

        {/* Boutons like/favori */}
        <div className="flex items-center gap-4 mt-2">
          <button onClick={handleLike}>
            {currentUser && post.likes?.includes(currentUser._id) ? "❤️" : "🤍"}
          </button>
          <span>{post.likes?.length || 0}</span>

          <button onClick={handleFavorite}>
            {currentUser && post.favorites?.includes(currentUser._id)
              ? "⭐"
              : "☆"}
          </button>
          <span>{post.favorites?.length || 0}</span>
        </div>

        {/* Boutons Modifier / Sauvegarder / Supprimer */}
        {isOwner && (
          <div className="flex items-center gap-4 mt-4">
            {isEditing ? (
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Enregistrer
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditDescription(post.description || "");
                  setIsEditing(true);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Modifier
              </button>
            )}

            {!isEditing && (
              <button
                onClick={async () => {
                  if (!token)
                    return alert("Vous devez être connecté pour supprimer.");
                  const confirmDelete = window.confirm(
                    "Voulez-vous vraiment supprimer ce post ?"
                  );
                  if (!confirmDelete) return;

                  try {
                    await deletePost(token, post._id);
                    onUpdate({ deleted: true, _id: post._id });
                    onClose();
                  } catch (err) {
                    console.error("Erreur suppression post :", err);
                    alert("Impossible de supprimer la publication.");
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
