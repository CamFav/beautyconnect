import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <p className="text-center py-8">Chargement...</p>;
  }

  // PROFIL CLIENT
  if (user.activeRole !== "pro") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Mon profil</h1>

        <div className="space-y-6">
          {/* Informations de base */}
          <section className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
            <p><b>Nom :</b> {user.name}</p>
            <p><b>Email :</b> {user.email}</p>
          </section>

          {/* Activité récente  */}
          <section className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Photos likées (mock)</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-square bg-gray-200 rounded"></div>
              <div className="aspect-square bg-gray-200 rounded"></div>
              <div className="aspect-square bg-gray-200 rounded"></div>
            </div>
          </section>

          {/* Abonnements  */}
          <section className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Mes abonnements (mock)</h2>
            <ul className="space-y-2">
              <li className="text-gray-700">• Salon Éclat de Beauté</li>
              <li className="text-gray-700">• Maquilleuse Pro Paris</li>
              <li className="text-gray-700">• Studio Coif & Style</li>
            </ul>
          </section>
        </div>
      </div>
    );
  }

  // PROFIL PRO
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header  */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {user.proProfile?.businessName || user.name}
            </h1>
            {/* Nombre d’abonnés (mock) */}
            <p className="text-gray-600 text-sm">
              124 abonnés
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Contacter
          </button>
          <a
            href="#offres"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réserver
          </a>
        </div>
      </div>

      {/* Infos entrepris */}
      <section className="bg-white p-5 rounded shadow space-y-2">
        <h2 className="text-xl font-semibold">Informations</h2>
        <p><b>Localisation :</b> {user.proProfile?.location || "—"}</p>
        <p>
          <b>Services :</b>{" "}
          {Array.isArray(user.proProfile?.services) && user.proProfile.services.length > 0
            ? user.proProfile.services.join(", ")
            : "—"}
        </p>
      </section>

      {/* Statut  */}
      <section className="bg-white p-5 rounded shadow space-y-2">
        <h2 className="text-xl font-semibold">Statut & Exercice</h2>
        <p><b>Statut :</b> {user.proProfile?.status || 'Non renseigné'}</p>
        <p>
          <b>Types d’exercice :</b>{" "}
          {Array.isArray(user.proProfile?.exerciseType) && user.proProfile.exerciseType.length > 0
            ? user.proProfile.exerciseType.join(", ")
            : 'Non renseigné'}
        </p>
        <p><b>Expérience :</b> {user.proProfile?.experience || 'Non renseignée'}</p>
      </section>

      {/* Publications */}
      <section className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Dernières publications (mock)</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="aspect-square bg-gray-200 rounded"></div>
          <div className="aspect-square bg-gray-200 rounded"></div>
          <div className="aspect-square bg-gray-200 rounded"></div>
        </div>
      </section>

      {/* Offres & tarifs */}
      <section id="offres" className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Mes offres et tarifs (mock)</h2>
        <ul className="space-y-2">
          <li>Coupe / Brushing - 40€</li>
          <li>Maquillage événementiel - 60€</li>
          <li>Tatouage (petits motifs) - Dès 80€</li>
        </ul>
      </section>
    </div>
  );
}
