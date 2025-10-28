import React from "react";

/**
 * SkipLink — permet aux utilisateurs clavier d'accéder directement au contenu principal
 * (invisible sauf focus)
 */

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute left-2 top-2 -translate-y-20 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:text-blue-600 px-3 py-2 rounded-md font-medium transition-all z-50"
    >
      Aller au contenu principal
    </a>
  );
}
