import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="bg-gray-900 text-gray-300 py-8 px-6 text-center"
    >
      <p className="text-sm">
        © {new Date().getFullYear()} BeautyConnect. Tous droits réservés.
      </p>

      <nav
        className="flex justify-center space-x-4 mt-3 text-sm"
        aria-label="Liens légaux"
      >
        <Link
          to="/legal/mentions-legales"
          className="hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
        >
          Mentions légales
        </Link>
        <Link
          to="/legal/cgu"
          className="hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
        >
          CGU
        </Link>
        <Link
          to="/legal/politique-de-confidentialite"
          className="hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
        >
          Politique de confidentialité
        </Link>
      </nav>
    </footer>
  );
}
