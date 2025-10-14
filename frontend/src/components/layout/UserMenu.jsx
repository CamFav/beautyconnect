import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Avatar from "../common/Avatar";

export default function UserMenu() {
  const { user, logout, updateRole } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useRef(null);

  // Ferme si clic extérieur
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Ferme avec Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Changement de rôle sécurisé
  const onRoleCta = async () => {
    try {
      if (!user?.proProfile || !user?.proProfile?.siret) {
        setOpen(false);
        nav("/upgrade-pro");
        return;
      }
      const nextRole = user?.activeRole === "pro" ? "client" : "pro";
      await updateRole(nextRole);
      setOpen(false);
      nav("/home");
    } catch (err) {
      console.error("Erreur changement de rôle :", err);
      alert("Impossible de changer de rôle.");
    }
  };

  const roleCtaLabel =
    !user?.proProfile || !user?.proProfile?.siret
      ? "Activer le mode Pro"
      : user?.activeRole === "pro"
      ? "Revenir en client"
      : "Passer en mode Pro";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Mon profil"
        className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-gray-900"
      >
        <Avatar
          name={user?.name}
          email={user?.email}
          src={user?.avatarPro || user?.avatarClient}
          size={36}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-2 z-50"
        >
          <div className="px-3 py-2 border-b border-gray-100 mb-2">
            <div className="font-semibold text-sm">
              {user?.name || "Utilisateur"}
            </div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            {user?.activeRole && (
              <div className="mt-1 text-[11px] inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                Rôle : <strong>{user.activeRole}</strong>
              </div>
            )}
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              nav("/profile");
            }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
          >
            Mon profil
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              nav("/settings");
            }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
          >
            Paramètres
          </button>

          <div className="my-2 h-px bg-gray-100" />

          <button
            type="button"
            role="menuitem"
            onClick={onRoleCta}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
          >
            {roleCtaLabel}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-red-600"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
