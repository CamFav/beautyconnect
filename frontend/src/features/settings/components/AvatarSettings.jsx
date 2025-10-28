import { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContextBase";
import { updateAvatar } from "../../../api/user.service";

export default function AvatarSettings() {
  const { user, token, setUser } = useContext(AuthContext);

  // Utilisation correcte de l'avatar en fonction du rôle
  const initialAvatar =
    user?.activeRole === "pro" ? user.avatarPro : user.avatarClient;

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialAvatar || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Veuillez sélectionner une image." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Appel API
      const data = await updateAvatar(token, file);

      // Mise à jour locale selon le rôle
      setUser((prev) => ({
        ...prev,
        ...(prev.activeRole === "pro"
          ? { avatarPro: data.avatarUrl }
          : { avatarClient: data.avatarUrl }),
      }));

      setMessage({ type: "success", text: "Avatar mis à jour avec succès" });
    } catch (error) {
      console.error("Erreur upload avatar:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erreur lors de l'upload",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-3">
      {/* Titre */}
      <h2 className="text-lg font-semibold">Avatar</h2>

      {/* Aperçu */}
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border">
        {preview ? (
          <img
            src={preview}
            alt="avatar preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            ?
          </div>
        )}
      </div>

      {/* Input fichier */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* Bouton action */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
        }`}
      >
        {loading ? "Envoi..." : "Mettre à jour l'avatar"}
      </button>

      {/* Message de feedback */}
      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
