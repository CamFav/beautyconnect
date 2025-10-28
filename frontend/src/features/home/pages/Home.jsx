import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContextBase";
import Feed from "../../feed/Feed";
import ProDashboard from "../../pro/pages/ProDashboard";
import Seo from "@/components/seo/Seo.jsx";

export default function Home() {
  const { user } = useContext(AuthContext);

  // === SEO par défaut ===
  const defaultSeo = (
    <Seo
      title="Accueil"
      description="Découvrez et réservez facilement les meilleurs professionnels de la beauté autour de vous."
    />
  );

  if (user === undefined) {
    // Token en cours de vérification
    return (
      <>
        {defaultSeo}
        <main id="main-content">
          <p>Chargement...</p>
        </main>
      </>
    );
  }

  if (!user) {
    // Utilisateur non connecté → afficher feed public
    return (
      <>
        {defaultSeo}
        <main id="main-content">
          <Feed />
        </main>
      </>
    );
  }

  // Sécurisation : sanitize activeRole
  const activeRole =
    typeof user.activeRole === "string" ? user.activeRole.trim() : "client";
  const isPro = activeRole === "pro";

  // SEO dynamique selon le rôle
  const roleSeo = isPro ? (
    <Seo
      title="Tableau de bord"
      description="Gérez vos réservations, services et publications sur BeautyConnect Pro."
    />
  ) : (
    defaultSeo
  );

  return (
    <>
      {roleSeo}
      <main id="main-content" className="p-4">
        {user ? isPro ? <ProDashboard /> : <Feed /> : <Feed />}
      </main>
    </>
  );
}
