import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function UserMenu() {
  const { user, logout, updateRole } = useContext(AuthContext); // <-- updateRole vient du contexte
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useRef(null);

  // Ferme si clic en dehors
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Ferme avec Echap
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Initiales avatar
  const initials = (user?.name || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Bascule client <-> pro
  const toggleRole = async () => {
    try {
      const next = user?.role === "pro" ? "client" : "pro";
      await updateRole(next); // met à jour user + token via contexte
      setOpen(false);
      // Log  token en localStorage
      const t = localStorage.getItem("token") || "";
      console.log("[UserMenu] Nouveau token (début):", t.slice(0, 20), "…");

      // if (next === "pro") nav("/pro");
    } catch (e) {
      console.error(e);
      alert("Impossible de changer de rôle");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="w-10 h-10 rounded-full border border-gray-900 flex items-center justify-center"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Mon profil"
      >
        <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
          {initials}
        </span>
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
            {user?.role && (
              <div className="mt-1 text-[11px] inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                Rôle : <strong>{user.role}</strong>
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
              /* nav('/settings')*/
            }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
          >
            Paramètres
          </button>

          <div className="my-2 h-px bg-gray-100" />

        {/* Bascule rôle */}
          <button
            type="button"
            role="menuitem"
            onClick={toggleRole}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
          >
            {user?.role === "pro" ? "Revenir client" : "Activer le mode Pro"}
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
