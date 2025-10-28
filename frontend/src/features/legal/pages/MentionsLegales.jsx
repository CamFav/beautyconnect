import { useNavigate } from "react-router-dom";
import Seo from "@/components/seo/Seo";

export default function MentionsLegales() {
  const navigate = useNavigate();

  return (
    <>
      {/* === Balises SEO spécifiques à la page === */}
      <Seo
        title="Mentions légales | BeautyConnect"
        description="Mentions légales de BeautyConnect : informations sur l'éditeur, l'hébergement et les conditions d'utilisation du site."
        robots="index,follow"
      />

      {/* === Contenu principal accessible === */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        aria-label="Mentions légales"
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
          Mentions légales
        </h1>

        <article className="space-y-6 text-sm sm:text-base">
          <section>
            <p>
              Conformément aux dispositions des articles 6-III et 19 de la Loi
              n°2004-575 du 21 juin 2004 pour la Confiance dans l’économie
              numérique (L.C.E.N.), nous portons à la connaissance des
              utilisateurs du site <strong>BeautyConnect</strong> les
              informations suivantes :
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">1. Éditeur du site</h2>
            <p>
              <strong>BeautyConnect</strong> — Projet pédagogique.
              <br />
              Directeur de la publication : <em>Camille Favriel</em>.<br />
              Contact :{" "}
              <a
                href="mailto:camillefvrl@gmail.com"
                className="text-blue-600 underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
              >
                camillefvrl@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">2. Hébergement du site</h2>
            <p>
              Le site BeautyConnect est hébergé par un prestataire de service
              conforme aux exigences européennes en matière de sécurité et de
              protection des données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              3. Propriété intellectuelle
            </h2>
            <p>
              Le contenu du site BeautyConnect (textes, images, logos, design)
              est protégé par le droit d’auteur. Toute reproduction ou
              utilisation sans autorisation préalable est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              4. Données personnelles
            </h2>
            <p>
              Les informations collectées via le site BeautyConnect sont
              traitées conformément à la législation en vigueur. Pour plus de
              détails, consultez notre{" "}
              <a
                href="/legal/politique-de-confidentialite"
                className="text-blue-600 underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
              >
                Politique de confidentialité
              </a>
              .
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
