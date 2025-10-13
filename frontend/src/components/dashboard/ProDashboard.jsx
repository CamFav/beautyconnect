import React, { useState, useContext } from "react";
import CreatePostModal from "../../components/posts/CreatePostModal";
import { AuthContext } from "../../context/AuthContext";
import { createPost } from "../../api/post.service";

export default function ProDashboard() {
  const [showModal, setShowModal] = useState(false);
  const { token } = useContext(AuthContext);

  const handlePostSubmit = async (formData) => {
    console.log("FORM DATA REÇU DANS ProDashboard :", [...formData.entries()]);
    console.log("TOKEN :", token);
    try {
      if (!token) {
        alert("Vous devez être connecté pour publier.");
        return;
      }

      const response = await createPost(token, formData);
      console.log("Post créé :", response);
      alert("Votre publication a été ajoutée avec succès !");
      setShowModal(false);
      
      // TODO: rafraîchir la liste des posts ou rediriger

    } catch (error) {
      console.error("Erreur lors de la création du post :", error.response?.data || error.message);
      alert(error.response?.data?.message || "Erreur lors de la création du post");
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Rendez-vous à venir */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Prochains rendez-vous</h2>
        <ul className="space-y-2">
          <li className="text-sm text-gray-700">
            Aucun rendez-vous à venir (mock)
          </li>
        </ul>
        <button className="mt-3 text-blue-600 hover:underline">
          Voir mon planning
        </button>
      </section>

      {/* Nouvelle publication */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Publier une photo</h2>
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          + Nouvelle publication
        </button>
      </section>

      {/* Modal */}
      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handlePostSubmit}
      />

      {/* Offres & Tarifs */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Mes offres & tarifs</h2>
        <button className="text-blue-600 hover:underline">
          Gérer mes services
        </button>
      </section>
    </div>
  );
}
