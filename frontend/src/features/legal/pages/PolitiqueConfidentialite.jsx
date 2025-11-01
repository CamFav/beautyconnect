import { useNavigate } from "react-router-dom";
import Seo from "@/components/seo/Seo";

export default function PolitiqueConfidentialite() {
  const navigate = useNavigate();

  return (
    <>
      {/* === Balises SEO === */}
      <Seo
        title="Politique de confidentialité | BeautyConnect"
        description="Découvrez la politique de confidentialité de BeautyConnect : traitement, conservation et droits relatifs à vos données personnelles."
        robots="index,follow"
      />

      {/* === Contenu principal accessible === */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        aria-label="Politique de confidentialité"
        className="min-h-screen max-w-4xl mx-auto px-6 py-10 text-gray-800 leading-relaxed relative"
      >
        {/* === Bouton retour === */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
        >
          ← Retour
        </button>

        {/* === Titre principal === */}
        <h1 className="text-3xl font-semibold mb-8 text-center">
          Politique de confidentialité
        </h1>

        {/* === Corps du texte === */}
        <article className="space-y-6 text-sm sm:text-base">
          <section>
            <p>
              La présente politique de confidentialité a pour objectif
              d’informer les utilisateurs du site <strong>BeautyConnect</strong>{" "}
              sur la collecte, l’utilisation et la protection de leurs données
              personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              1. Responsable du traitement
            </h2>
            <p>
              Les données sont collectées et traitées par{" "}
              <strong>BeautyConnect</strong> dans le cadre de son activité. Pour
              toute question relative à vos données, vous pouvez contacter :{" "}
              <a
                href="mailto:contact@beautyconnect.fr"
                className="text-blue-600 underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
              >
                contact@beautyconnect.fr
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              2. Données collectées et finalités
            </h2>
            <p>
              Les informations collectées sur le site (formulaires,
              réservations, profils, etc.) sont utilisées uniquement pour :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Permettre la création et la gestion de comptes utilisateurs.
              </li>
              <li>
                Assurer le bon fonctionnement du service (prise de rendez-vous,
                messagerie, etc.).
              </li>
              <li>
                Améliorer l’expérience utilisateur et la qualité du service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              3. Conservation et sécurité des données
            </h2>
            <p>
              Les données personnelles sont conservées pendant la durée
              strictement nécessaire à la fourniture des services. Des mesures
              techniques et organisationnelles appropriées sont mises en œuvre
              pour assurer leur sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              4. Droits des utilisateurs
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD), vous disposez d’un droit d’accès, de rectification, de
              suppression et d’opposition concernant vos données.
            </p>
            <p>
              Vous pouvez exercer ces droits à tout moment en écrivant à :{" "}
              <a
                href="mailto:contact@beautyconnect.fr"
                className="text-blue-600 underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
              >
                contact@beautyconnect.fr
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              5. Cookies et mesure d’audience
            </h2>
            <p>
              Ce site utilise uniquement des cookies essentiels à son
              fonctionnement. Aucun cookie publicitaire ni de suivi externe
              n’est actuellement utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">6. Contact</h2>
            <p>
              Pour toute question concernant cette politique ou l’exercice de
              vos droits, vous pouvez nous contacter à :{" "}
              <a
                href="mailto:contact@beautyconnect.fr"
                className="text-blue-600 underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
              >
                contact@beautyconnect.fr
              </a>
              .
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
