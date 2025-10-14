import { useState } from "react";

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleImageSelect = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = () => {
    console.log("IMAGE AVANT ENVOI :", image);

    if (!image) {
      alert("Merci de sélectionner une image.");
      return;
    }

    const formData = new FormData();
    formData.append("media", image);
    formData.append("description", description);
    formData.append("category", category);

    console.log("FORMDATA ENVOYÉ :", [...formData.entries()]); //

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">Créer une nouvelle publication</h2>

        {/* Input image avec bouton */}
        <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Image</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full"
            />
        </div>


        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrire votre poste..."
          />
        </div>

        {/* Catégorie */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Catégorie</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ex: makeup, nails..."
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  );
}
