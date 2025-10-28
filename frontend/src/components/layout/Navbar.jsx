import { useContext } from "react";
import { AuthContext } from "../../context/AuthContextBase";
import NavbarClient from "./NavbarClient";
import NavbarPro from "./NavbarPro";

/**
 * Navbar – Composant d’en-tête global
 * Affiche la barre adaptée au rôle de l'utilisateur.
 */

export default function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <nav
      role="navigation"
      aria-label={
        user?.activeRole === "pro"
          ? "Navigation principale professionnel"
          : "Navigation principale client"
      }
      className="w-full border-b border-gray-200 bg-white shadow-sm"
    >
      {user?.activeRole === "pro" ? <NavbarPro /> : <NavbarClient />}
    </nav>
  );
}
