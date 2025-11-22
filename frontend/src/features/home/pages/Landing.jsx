import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContextBase";
import {
  Calendar,
  Image,
  Users,
  Search,
  ClipboardList,
  Star,
} from "lucide-react";
import { sanitizeInput, sanitizeName } from "../../../utils/sanitize";
import {
  validateEmail,
  validatePassword,
  validateName,
  messages,
} from "../../../utils/validators";
import Seo from "@/components/seo/Seo";
import Footer from "@/components/layout/Footer";

export default function Landing() {
  const navigate = useNavigate();
  const { token, handleLogin } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "name"
        ? sanitizeName(value)
        : name === "email"
        ? sanitizeInput(value)
        : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    switch (name) {
      case "name":
        setErrors((prev) => ({
          ...prev,
          name: !validateName(newValue) ? messages.name : "",
        }));
        break;
      case "email":
        setErrors((prev) => ({
          ...prev,
          email: !validateEmail(newValue) ? "Format d'email invalide" : "",
        }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: !validatePassword(newValue) ? messages.password : "",
        }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !validateName(formData.name) ||
      !validateEmail(formData.email) ||
      !validatePassword(formData.password)
    ) {
      setErrors({
        name: !validateName(formData.name) ? messages.name : "",
        email: !validateEmail(formData.email) ? messages.email : "",
        password: !validatePassword(formData.password)
          ? messages.password
          : "",
      });
      return;
    }

    navigate("/register", {
      state: {
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        },
      },
    });
  };

  const goPro = () => navigate("/register-pro");

  const accessSite = async () => {
    if (token) {
      try {
        await handleLogin({ email: "", password: "" });
      } catch (err) {
        console.error("Token invalide ou expiré :", err);
      }
    }
    navigate("/feed");
  };

  return (
    <>
      <Seo
        title="BeautyConnect – Trouvez le professionnel beauté qui vous correspond"
        description="Explorez, réservez et partagez vos expériences beauté avec les meilleurs prestataires."
      />

      <main
        id="main-content"
        role="main"
        aria-label="Page d'accueil BeautyConnect"
        className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 relative focus:outline-none"
        tabIndex={-1}
      >
        {/* Accès rapide */}
        <div className="absolute top-4 right-6">
          <button
            onClick={accessSite}
            className="border border-blue-600 text-blue-600 px-4 py-2 text-sm rounded-lg hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
          >
            Accéder au site
          </button>
        </div>

        {/* Section héro */}
        <section
          className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 py-10 gap-10 pt-40"
          aria-labelledby="hero-title"
        >
          <div className="md:w-1/2 text-center md:text-left">
            <h1
              id="hero-title"
              className="text-4xl font-bold text-blue-600 mb-4"
            >
              BeautyConnect
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed">
              Trouvez ou proposez des services beauté en toute simplicité.
              Rejoignez une plateforme moderne pour découvrir des
              professionnels, réserver des prestations, gérer votre activité et
              gagner en visibilité.
            </p>
          </div>

          <div
            className="md:w-1/2 max-w-md bg-white shadow-lg p-6 rounded-xl border border-gray-200"
            aria-labelledby="form-title"
          >
            <h2 id="form-title" className="text-xl font-semibold mb-4">
              Créer un compte
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Nom */}
              <div>
                <label
                  htmlFor="name"
                  className="block mb-1 text-sm font-medium text-gray-800"
                >
                  Nom
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  required
                />
                {errors.name && (
                  <p id="name-error" className="text-red-600 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-medium text-gray-800"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                />
                {errors.email && (
                  <p id="email-error" className="text-red-600 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1 text-sm font-medium text-gray-800"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  required
                />
                {errors.password && (
                  <p id="password-error" className="text-red-600 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Mention RGPD */}
              <p className="text-xs text-gray-500">
                En créant un compte, vous acceptez que vos données soient
                traitées conformément à notre{" "}
                <Link
                  to="/legal/politique-de-confidentialite"
                  className="underline hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
              >
                S'inscrire
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              >
                Déjà un compte ? Se connecter
              </Link>
            </div>

            <div className="mt-6">
              <button
                onClick={goPro}
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
              >
                Je suis un professionnel
              </button>
            </div>
          </div>
        </section>

        <hr className="border-t border-gray-200 max-w-5xl mx-auto w-full" />

        {/* Fonctionnalités */}
        <section
          className="py-16 px-6 bg-white"
          aria-labelledby="features-title"
        >
          <h2
            id="features-title"
            className="text-3xl font-bold text-center text-gray-900 mb-16"
          >
            Ce que vous offre BeautyConnect
          </h2>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">
            {/* Clients */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">
                Pour les clients
              </h3>
              <div className="space-y-6">
                {[
                  {
                    icon: (
                      <Image
                        className="w-8 h-8 mr-4"
                        aria-hidden="true"
                        focusable="false"
                      />
                    ),
                    title: "Découvrir les prestations",
                    desc: "Feed visuel inspiré d’Instagram pour voir le travail des pros.",
                  },
                  {
                    icon: (
                      <Calendar
                        className="w-8 h-8 mr-4"
                        aria-hidden="true"
                        focusable="false"
                      />
                    ),
                    title: "Réserver facilement",
                    desc: "Faites une demande de réservation en quelques clics.",
                  },
                  {
                    icon: (
                      <Search
                        className="w-8 h-8 mr-4"
                        aria-hidden="true"
                        focusable="false"
                      />
                    ),
                    title: "Trouver un prestataire",
                    desc: "Système de recherche original selon vos envies.",
                  },
                ].map((item, idx) => (
                  <article
                    key={idx}
                    className="flex items-start bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    {item.icon}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-gray-700 text-sm">{item.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Pros */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">
                Pour les professionnels
              </h3>
              <div className="space-y-6">
                {[
                  {
                    icon: (
                      <ClipboardList
                        className="w-8 h-8 mr-4"
                        aria-hidden="true"
                        focusable="false"
                      />
                    ),
                    title: "Gérer ses réservations",
                    desc: "Un espace clair pour organiser vos demandes clients.",
                  },
                  {
                    icon: (
                      <Image
                        className="w-8 h-8 mr-4"
                        aria-hidden="true"
                        focusable="false"
                      />
                    ),
                    title: "Portfolio & offres",
                    desc: "Centralisez vos services et montrez votre travail.",
                  },
                  {
                    icon: (
                      <Users
                        className="w-8 h-8 mr-4"
                        aria-hidden="true"
                        focusable="false"
                      />
                    ),
                    title: "Planning complet",
                    desc: "Gérez vos créneaux et disponibilités au même endroit.",
                  },
                ].map((item, idx) => (
                  <article
                    key={idx}
                    className="flex items-start bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    {item.icon}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-gray-700 text-sm">{item.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="py-16 px-6 bg-gray-50" aria-labelledby="how-title">
          <h2
            id="how-title"
            className="text-2xl font-bold text-center text-gray-900 mb-10"
          >
            Comment ça marche ?
          </h2>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              {
                step: "1. Inscription",
                desc: "Client ou pro, créez votre compte gratuitement.",
              },
              {
                step: "2. Découverte",
                desc: "Explorez les profils, offres et prestations.",
              },
              {
                step: "3. Réservation",
                desc: "Envoyez une demande en un clic.",
              },
            ].map((item, idx) => (
              <article key={idx}>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {item.step}
                </p>
                <p className="text-gray-700 text-sm">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Avis */}
        <section
          className="py-16 px-6 bg-white"
          aria-labelledby="reviews-title"
        >
          <h2
            id="reviews-title"
            className="text-2xl font-bold text-center text-gray-900 mb-10"
          >
            Ils nous font confiance
          </h2>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: `"J'ai trouvé une coiffeuse en 5 minutes, expérience fluide !"`,
                author: "Laura",
              },
              {
                text: `"Je gère mes rendez-vous et offres facilement sur la plateforme."`,
                author: "Sabrina",
              },
              {
                text: `"Super visibilité pour mon activité de maquilleuse."`,
                author: "Chloé",
              },
            ].map((review, idx) => (
              <article
                key={idx}
                className="bg-gray-50 p-6 shadow-md rounded-xl flex flex-col items-center text-center"
                aria-label={`Avis de ${review.author}`}
              >
                <div className="flex mb-3" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                <blockquote className="text-gray-800 italic mb-4">
                  {review.text}
                </blockquote>
                <p className="font-semibold text-gray-900">— {review.author}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Footer global */}
      <footer
        role="contentinfo"
        className="bg-gray-900 text-gray-300 py-8 px-6 text-center"
      >
        <p className="text-sm">
          © {new Date().getFullYear()} BeautyConnect. Tous droits réservés.
        </p>

        <nav
          className="flex justify-center space-x-4 mt-3 text-sm"
          aria-label="Liens légaux"
        >
          <Link
            to="/legal/mentions-legales"
            className="hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
          >
            Mentions légales
          </Link>
          <Link
            to="/legal/cgu"
            className="hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
          >
            CGU
          </Link>
          <Link
            to="/legal/politique-de-confidentialite"
            className="hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
          >
            Politique de confidentialité
          </Link>
        </nav>
      </footer>
    </>
  );
}
