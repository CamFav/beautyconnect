import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContextBase";
import {
  createPost,
  getPosts,
  deletePost,
} from "../../../../api/posts/post.service";
import {
  Trash2,
  Heart,
  Plus,
  XCircle,
  Upload,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import PostModal from "../../../../components/feedback/PostModal";

export default function PortfolioSection({ proId }) {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [modalPost, setModalPost] = useState(null);

  const proCategories = user?.proProfile?.categories || [];
  const defaultCategory =
    proCategories.length === 1
      ? proCategories[0]
      : proCategories[0] || "Coiffure";

  const [formData, setFormData] = useState({
    description: "",
    category: defaultCategory,
    media: null,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await getPosts();
        const myPosts = allPosts.filter(
          (p) => p.provider?._id?.toString() === proId.toString()
        );
        setPosts(myPosts.slice(0, 4));
      } catch (err) {
        console.error("Erreur récupération des posts :", err);
      }
    };
    if (proId) fetchPosts();
  }, [proId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost(formData);
      setShowForm(false);
      setFormData({
        description: "",
        category: defaultCategory,
        media: null,
      });
      const allPosts = await getPosts();
      const myPosts = allPosts.filter(
        (p) => p.provider?._id?.toString() === proId.toString()
      );
      setPosts(myPosts.slice(0, 4));
    } catch (err) {
      console.error("Erreur création post :", err);
    }
  };

  const confirmDelete = (postId) => {
    setPostToDelete(postId);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deletePost(postToDelete);
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete));
    } catch (err) {
      console.error("Erreur suppression post :", err);
    } finally {
      setShowConfirmModal(false);
      setPostToDelete(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, media: file }));
    }
  };

  const handleModalUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
    setModalPost(updatedPost);
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Mon portfolio</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            <Plus size={18} /> Ajouter
          </button>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4"
        >
          {/* Description */}
          <div className="flex flex-col gap-1">
            <textarea
              placeholder="Décrivez votre prestation (max. 80 caractères)"
              value={formData.description}
              maxLength={80}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value.slice(0, 80),
                }))
              }
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.description.length}/80 caractères
            </p>
          </div>

          {/* Catégorie */}
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {proCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Upload */}
          <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 rounded-md p-3 text-sm hover:bg-gray-50">
            <Upload size={16} />
            <span>
              {formData.media
                ? `Fichier sélectionné : ${formData.media.name}`
                : "Importer une image"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm"
            >
              <XCircle size={16} /> Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
            >
              <ImageIcon size={16} /> Publier
            </button>
          </div>
        </form>
      )}

      {/* Aperçu des posts */}
      {!showForm && (
        <>
          {posts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="relative group rounded-lg overflow-hidden shadow-sm"
                >
                  <img
                    src={post.mediaUrl}
                    alt="publication"
                    className="w-full h-36 object-cover"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setModalPost(post)}
                      className="p-2 bg-white/80 rounded-full text-gray-700"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => confirmDelete(post._id)}
                      className="p-2 bg-white/80 rounded-full text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="p-2 bg-white/80 rounded-full flex items-center gap-1 text-gray-700">
                      <Heart size={16} />
                      <span className="text-xs">{post.likes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              Aucune photo publiée pour le moment.
            </p>
          )}
        </>
      )}

      {/* Modale suppression */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Voulez-vous vraiment supprimer ce post ? Cette action est
              irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale aperçu post */}
      {modalPost && (
        <PostModal
          post={modalPost}
          isOpen={true}
          onClose={() => setModalPost(null)}
          onUpdate={handleModalUpdate}
        />
      )}
    </section>
  );
}
