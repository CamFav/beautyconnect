import { useState } from "react";
import httpClient from "../../../api/http/httpClient";
import { Lock, Trash2 } from "lucide-react";
import StickyFooterButton from "../../../components/ui/StickyFooterButton";
import AlertMessage from "../../../components/feedback/AlertMessage";
import { mapApiErrors, messages } from "../../../utils/validators";

export default function SecuritySettings({ token, headers, setMessage }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const clean = (v) =>
    typeof v === "string"
      ? v
          .trim()
          .replace(/[<>]/g, "")
          .replace(/[\u200B-\u200D\uFEFF]/g, "")
      : v;

  // --- Update password ---
  const handleSavePassword = async () => {
    if (!token) return;

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: messages.password,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await httpClient.patch(
        "/account/password",
        {
          currentPassword: clean(currentPassword),
          newPassword: clean(newPassword),
        },
        { headers }
      );

      setMessage({
        type: "success",
        text: "Mot de passe mis à jour avec succès.",
      });
      setHasChanges(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Erreur mot de passe :", err);
      const apiErrors = mapApiErrors(err?.response?.data);
      setMessage({
        type: "error",
        text:
          apiErrors.currentPassword ||
          apiErrors.newPassword ||
          apiErrors._error ||
          "Impossible de mettre a jour le mot de passe.",
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Delete account ---
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "SUPPRIMER") {
      setMessage({
        type: "error",
        text: "Veuillez saisir SUPPRIMER pour confirmer.",
      });
      return;
    }

    try {
      // Suppression côté backend
      await httpClient.delete("/account/delete", { headers });

      // Nettoyage local complet
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (typeof window !== "undefined") {
        const event = new CustomEvent("logout");
        window.dispatchEvent(event);
      }

      setMessage({
        type: "success",
        text: "Compte supprimé avec succès. Vous allez être déconnecté.",
      });

      // Redirection après 2s
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      console.error("Erreur suppression :", err);
      const apiErrors = mapApiErrors(err?.response?.data);
      setMessage({
        type: "error",
        text:
          apiErrors._error ||
          "Impossible de supprimer le compte pour le moment.",
      });
    } finally {
      setShowDeleteModal(false);
      setDeleteConfirm("");
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6 relative">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Sécurité</h2>

      {setMessage && <AlertMessage>{setMessage?.text}</AlertMessage>}

      {/* --- Modification du mot de passe --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium mb-1"
          >
            Mot de passe actuel
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Mot de passe actuel"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium mb-1"
          >
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Nouveau mot de passe"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-1"
          >
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Confirmer le mot de passe"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {/* --- Suppression du compte --- */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
          <Trash2 className="text-red-600" size={18} />
          Supprimer mon compte
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Cette action est{" "}
          <span className="font-semibold text-red-600">irréversible</span>.
          Toutes vos données seront supprimées définitivement.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          Supprimer mon compte
        </button>
      </div>

      {/* --- Footer sticky --- */}
      {hasChanges && (
        <StickyFooterButton
          label={saving ? "Enregistrement..." : "Mettre à jour"}
          onClick={handleSavePassword}
          disabled={saving}
        >
          <button
            type="button"
            onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setHasChanges(false);
            }}
            className="ml-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </button>
        </StickyFooterButton>
      )}

      {/* --- Modale de suppression --- */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Confirmer la suppression
            </h4>
            <p className="text-sm text-gray-600">
              Pour confirmer, tapez{" "}
              <span className="font-semibold">SUPPRIMER</span> ci-dessous :
            </p>
            <label htmlFor="deleteConfirm" className="sr-only">
              Confirmer la suppression
            </label>
            <input
              id="deleteConfirm"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
