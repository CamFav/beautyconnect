import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextBase";
import Avatar from "../ui/Avatar";

export default function UserMenu() {
  const { user, logout, updateRole } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [openedWithKeyboard, setOpenedWithKeyboard] = useState(false);
  const nav = useNavigate();
  const ref = useRef(null);
  const firstItemRef = useRef(null);

  // Ferme le menu quand on clique à l’extérieur
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Ferme le menu avec la touche Échap
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Focus sur le premier item seulement si ouvert au clavier
  useEffect(() => {
    if (open && openedWithKeyboard && firstItemRef.current) {
      firstItemRef.current.focus();
      setOpenedWithKeyboard(false); // réinitialiser
    }
  }, [open, openedWithKeyboard]);

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

  const baseAvatar =
    user?.activeRole === "pro" ? user?.avatarPro : user?.avatarClient;

  const cacheBust = user?.updatedAt
    ? `?v=${new Date(user.updatedAt).getTime()}`
    : `?t=${Date.now()}`;

  const avatarUrl = baseAvatar ? `${baseAvatar}${cacheBust}` : null;

  return (
    <div className="relative flex items-center" ref={ref}>
      {/* === Bouton principal === */}
      <button
        type="button"
        id="user-menu-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu-dropdown"
        onClick={(e) => {
          // détecte si le menu a été ouvert au clavier
          const fromKeyboard = e.detail === 0;
          setOpenedWithKeyboard(fromKeyboard);
          setOpen((v) => !v);
        }}
        title={user ? "Mon profil" : "Menu utilisateur"}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 border border-gray-200 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <Avatar
          name={user?.name}
          email={user?.email}
          src={avatarUrl}
          size={34}
          className="border-gray-300"
        />
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-150 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* === Menu déroulant === */}
      {open && (
        <div
          id="user-menu-dropdown"
          role="menu"
          aria-labelledby="user-menu-button"
          className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl p-2 z-50 origin-top-right animate-fade-in"
        >
          {!user ? (
            <>
              <div
                className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100"
                role="none"
              >
                Bienvenue ! Connectez-vous pour continuer.
              </div>
              <button
                ref={firstItemRef}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  nav("/login");
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Se connecter
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  nav("/register");
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                S'inscrire
              </button>
            </>
          ) : (
            <>
              <div
                className="px-3 py-2 border-b border-gray-100 mb-2"
                role="none"
              >
                <div className="font-semibold text-sm">{user?.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
                {user?.activeRole && (
                  <div className="mt-1 text-[11px] inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                    Rôle : <strong>{user.activeRole}</strong>
                  </div>
                )}
              </div>

              <button
                ref={firstItemRef}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  nav("/profile");
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Mon profil
              </button>

              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  nav("/settings");
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Paramètres
              </button>

              <div className="my-2 h-px bg-gray-100" role="none" />

              <button
                role="menuitem"
                onClick={onRoleCta}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {roleCtaLabel}
              </button>

              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-red-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Se déconnecter
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
