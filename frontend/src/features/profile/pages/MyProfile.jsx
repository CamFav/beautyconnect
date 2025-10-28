import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContextBase";
import ClientProfileView from "@/features/profile/components/client/ClientProfileView";
import ProProfileView from "@/features/profile/components/pro/ProProfileView";
import Seo from "@/components/seo/Seo.jsx";

export default function MyProfile() {
  const { user } = useContext(AuthContext);

  // === Cas 1 : Auth en cours de chargement ===
  if (user === undefined) {
    return (
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="text-center py-12 text-gray-700"
      >
        <p>Chargement...</p>
      </main>
    );
  }

  // === Cas 2 : Non connecté ===
  if (!user) {
    return (
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="text-center py-12 text-gray-600"
      >
        <p>Vous devez être connecté pour voir votre profil.</p>
      </main>
    );
  }

  // === Cas 3 : Vue selon le rôle actif ===
  const isPro =
    typeof user.activeRole === "string" &&
    user.activeRole.trim().toLowerCase() === "pro";

  return (
    <>
      <Seo
        title="Mon profil"
        description="Consultez et modifiez les informations de votre compte BeautyConnect."
        robots="index,follow"
      />

      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="min-h-screen bg-gray-50 focus:outline-none"
      >
        {isPro ? (
          <ProProfileView user={user} />
        ) : (
          <ClientProfileView user={user} title="Mon profil" />
        )}
      </main>
    </>
  );
}
