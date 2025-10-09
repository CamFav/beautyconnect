import React from "react";

export default function ProDashboard() {
  return (
    <div className="p-4 space-y-6">

      {/* Rendez-vous à venir */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Prochains rendez-vous</h2>
        <ul className="space-y-2">
          <li className="text-sm text-gray-700">Aucun rendez-vous à venir (mock)</li>
        </ul>
        <button className="mt-3 text-blue-600 hover:underline">
          Voir mon planning
        </button>
      </section>

      {/* Nouvelle publication */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Publier une photo</h2>
        <button className="bg-black text-white px-4 py-2 rounded">
          + Nouvelle publication
        </button>
      </section>

      {/* Offres & Tarifs */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Mes offres & tarifs</h2>
        <button className="text-blue-600 hover:underline">
          Gérer mes services
        </button>
      </section>
    </div>
  );
}
