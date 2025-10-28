import { useNavigate } from "react-router-dom";
import Seo from "@/components/seo/Seo";

export default function CGU() {
  const navigate = useNavigate();

  return (
    <>
      {/* === Balises SEO === */}
      <Seo
        title="Conditions Générales d’Utilisation | BeautyConnect"
        description="Consultez les Conditions Générales d’Utilisation (CGU) de BeautyConnect pour comprendre les règles applicables à l’usage du site et de ses services."
        robots="index,follow"
      />

      {/* === Contenu principal accessible === */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        aria-label="Conditions Générales d’Utilisation"
        className="min-h-screen max-w-4xl mx-auto px-6 py-10 text-gray-800 leading-relaxed focus:outline-none relative"
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
          Conditions Générales d’Utilisation
        </h1>

        {/* === Corps du texte === */}
        <article className="space-y-5 text-sm sm:text-base">
          <p>
            Les présentes Conditions Générales d’Utilisation (ci-après « CGU »)
            régissent l’accès et l’utilisation du site{" "}
            <strong>BeautyConnect</strong>.
          </p>

          <section>
            <h2 className="text-xl font-medium mt-6">1. Objet</h2>
            <p>
              Le site BeautyConnect a pour vocation de mettre en relation des
              professionnels du bien-être et des utilisateurs à la recherche de
              services esthétiques, de coiffure ou de soins.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              2. Acceptation des conditions
            </h2>
            <p>
              En accédant au site BeautyConnect, l’utilisateur reconnaît avoir
              lu, compris et accepté sans réserve les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              3. Inscription et compte utilisateur
            </h2>
            <p>
              L’accès à certaines fonctionnalités du site nécessite la création
              d’un compte. L’utilisateur s’engage à fournir des informations
              exactes et à les maintenir à jour. BeautyConnect se réserve le
              droit de suspendre ou de supprimer un compte en cas de non-respect
              des CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">4. Responsabilités</h2>
            <p>
              BeautyConnect s’efforce d’assurer la disponibilité du site, mais
              ne saurait être tenu responsable des interruptions de service,
              erreurs ou dommages directs ou indirects résultant de
              l’utilisation du site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              5. Propriété intellectuelle
            </h2>
            <p>
              Tous les éléments du site (textes, images, logos, marques, etc.)
              sont protégés par les lois en vigueur sur la propriété
              intellectuelle. Toute reproduction, distribution ou utilisation
              non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">
              6. Données personnelles
            </h2>
            <p>
              L’utilisation du site implique la collecte et le traitement de
              certaines données personnelles. Pour en savoir plus, consultez
              notre{" "}
              <a
                href="/legal/politique-de-confidentialite"
                className="text-blue-600 underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
              >
                Politique de confidentialité
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">7. Modifications</h2>
            <p>
              BeautyConnect se réserve le droit de modifier à tout moment les
              présentes CGU. Les utilisateurs seront informés de toute mise à
              jour par une mention sur le site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mt-6">8. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGU, vous pouvez nous
              contacter à :{" "}
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
