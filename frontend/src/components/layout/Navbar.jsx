import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false); // menu mobile futur

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* logo / recherche / icônes */}
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        {/* Gauche */}
        <div className="flex items-center gap-6">
          <button onClick={() => nav("/")} className="text-2xl font-semibold tracking-tight">
            TattooConnect
          </button>

          {/* Recherche (desktop) */}
          <div className="hidden md:block">
            <div className="relative w-[520px] max-w-[60vw]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </span>
              <input
                className="w-full rounded-full border border-gray-200 pl-10 pr-4 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Rechercher..."
                aria-label="Rechercher"
              />
            </div>
          </div>
        </div>

        {/* Droite */}
        <div className="flex items-center gap-3">
          <IconCircle label="Messages"><ChatIcon /></IconCircle>
          <IconCircle label="Historique"><ClockIcon /></IconCircle>
          <UserMenu /> {/* profil → /profile + logout */}
        </div>
      </div>

      {/* onglets */}
      <nav className="mx-auto max-w-6xl px-4">
        <ul className="flex items-center gap-8 text-sm text-gray-700 overflow-x-visible">
          <li>
            <NavLink
              to="/home"
              end
              className={({ isActive }) =>
                "relative py-3 hover:text-gray-900 " +
                (isActive
                  ? "text-gray-900 after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-gray-900"
                  : "hover:after:absolute hover:after:left-0 hover:after:-bottom-[1px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-300")
              }
            >
              Feed
            </NavLink>
          </li>

          {/* à connecter */}
          <li>
            <button
              className="relative py-3 hover:text-gray-900 hover:after:absolute hover:after:left-0 hover:after:-bottom-[1px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-300"
              type="button"
            >
              Suivis
            </button>
          </li>
          <li>
            <button
              className="relative py-3 hover:text-gray-900 hover:after:absolute hover:after:left-0 hover:after:-bottom-[1px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-300"
              type="button"
            >
              Mes rendez-vous
            </button>
          </li>
          <li>
  <NavLink
    to="/explore"
    className="relative py-3 hover:text-gray-900 hover:after:absolute hover:after:left-0 hover:after:-bottom-[1px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-300"
  >
    Explorer
  </NavLink>
</li>
        </ul>
      </nav>
    </header>
  );
}

/* omposants utilitaires */
function IconCircle({ label, children, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-gray-900 text-gray-900"
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12c0 3.866-3.582 7-8 7-1.1 0-2.15-.2-3.1-.56L4 19l.74-3.72C4.27 14.25 4 13.15 4 12c0-3.87 3.58-7 8-7s9 3.13 9 7z"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
