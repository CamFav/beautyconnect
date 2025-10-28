import React, { useState, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContextBase";
import { createPost } from "../../../../api/posts/post.service";
import CreatePostForm from "./CreatePostSection";
import AlertMessage from "../../../../components/feedback/AlertMessage";

export default function CreatePostSection() {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const { token } = useContext(AuthContext);

  const handlePostSubmit = async (formData) => {
    try {
      if (!token) throw new Error("Vous devez être connecté");
      await createPost(token, formData);
      setMessage({
        type: "success",
        text: "Publication ajoutée avec succès !",
      });
      setShowForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Publier une photo
      </h2>

      {message && (
        <AlertMessage type={message.type}>{message.text}</AlertMessage>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          + Nouvelle publication
        </button>
      )}

      {showForm && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4">
          <CreatePostForm
            onCancel={() => setShowForm(false)}
            onSubmit={handlePostSubmit}
          />
        </div>
      )}
    </section>
  );
}
