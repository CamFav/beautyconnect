import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../../context/AuthContextBase";
import AccountSettings from "../components/AccountSettings.jsx";
import SecuritySettings from "../components/SecuritySettings.jsx";
import ProSettingsSection from "../components/ProSettingsSection.jsx";
import Seo from "@/components/seo/Seo.jsx";

export default function Settings() {
  const { user, token, setUser } = useContext(AuthContext);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("account");

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
    <>
      <Seo
        title="Paramètres du compte"
        description="Gérez vos informations personnelles, votre sécurité et vos préférences sur BeautyConnect."
      />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">
            Gérez votre compte, vos informations de sécurité et vos paramètres
            professionnels.
          </p>
        </header>

        {/* Navigation par onglets */}
        <nav className="flex gap-3 border-b border-gray-200 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === "account"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Compte
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === "security"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Sécurité
          </button>

          {activeRole === "pro" && (
            <button
              onClick={() => setActiveTab("pro")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "pro"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Profil pro
            </button>
          )}
        </nav>

        {/* Message global */}
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

        {/* Contenu des onglets */}
        <div className="mt-6">
          {activeTab === "account" && (
            <AccountSettings
              user={user}
              token={token}
              headers={headers}
              setMessage={setMessage}
              onUserUpdate={setUser}
            />
          )}

          {activeTab === "security" && (
            <SecuritySettings
              user={user}
              token={token}
              headers={headers}
              setMessage={setMessage}
            />
          )}

          {activeTab === "pro" && activeRole === "pro" && (
            <ProSettingsSection
              user={user}
              token={token}
              headers={headers}
              setMessage={setMessage}
            />
          )}
        </div>
      </div>
    </>
  );
}
