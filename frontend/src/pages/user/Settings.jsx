import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import ClientSettings from "../../components/settings/ClientSettings";
import ProSettings from "../../components/settings/ProSettings.jsx";

export default function Settings() {
  const { user, token } = useContext(AuthContext);

  const [message, setMessage] = useState(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  if (!user) {
    return <p className="text-center py-8">Chargement…</p>;
  }

  const activeRole = user?.activeRole ?? "client";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-600">
          Rôle actif : <b>{activeRole}</b>
        </p>
      </header>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profil Client */}
      <ClientSettings
        user={user}
        token={token}
        headers={headers}
        setMessage={setMessage}
      />

      {/* Profil Pro (seulement si rôle actif) */}
      {activeRole === "pro" && (
        <ProSettings
          user={user}
          token={token}
          headers={headers}
          setMessage={setMessage}
        />
      )}
    </div>
  );
}
