export default function ClientProfileView({ user, title = "Mon profil" }) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {title}
      </h1>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center mb-6">
          {user.avatarClient ? (
            <img
              src={user.avatarClient}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-medium">
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Infos */}
        <section className="bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
          <p><b>Nom :</b> {user.name}</p>
          <p><b>Email :</b> {user.email}</p>
        </section>

        {/* Likes mock */}
        <section className="bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Photos likées (mock)</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="aspect-square bg-gray-200 rounded"></div>
            <div className="aspect-square bg-gray-200 rounded"></div>
            <div className="aspect-square bg-gray-200 rounded"></div>
          </div>
        </section>

        {/* Abonnements mock */}
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
