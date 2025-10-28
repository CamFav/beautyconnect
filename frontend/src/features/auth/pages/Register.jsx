import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContextBase";
import AlertMessage from "../../../components/feedback/AlertMessage";
import { Image, Calendar, Search } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { sanitizeInput, sanitizeName } from "../../../utils/sanitize";
import {
  validateName,
  validateEmail,
  validatePassword,
  messages,
} from "../../../utils/validators";
import PasswordStrength from "../../../components/forms/PasswordStrength";

/**
 * Page d'inscription
 */

export default function Register() {
  const { handleRegister } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const prefill = location.state?.prefill || {};
  const [formData, setFormData] = useState({
    name: prefill.name || "",
    email: prefill.email || "",
    password: prefill.password || "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "name":
        if (!validateName(value)) error = messages.name;
        break;
      case "email":
        if (!validateEmail(value)) error = messages.email;
        break;
      case "password":
        if (!validatePassword(value)) error = messages.password;
        break;
      case "confirmPassword":
        if (value !== formData.password)
          error = "Les mots de passe ne correspondent pas.";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleaned =
      name === "name" ? sanitizeName(value) : sanitizeInput(value);
    setFormData((prev) => ({ ...prev, [name]: cleaned }));
    validateField(name, cleaned);
    setSubmitError("");
    setSubmitSuccess("");
  };

  const isFormValid = () =>
    validateName(formData.name) &&
    validateEmail(formData.email) &&
    validatePassword(formData.password) &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!isFormValid()) {
      setSubmitError("Veuillez corriger les erreurs avant de continuer.");
      return;
    }

    try {
      await handleRegister({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: "client",
      });
      setSubmitSuccess("Inscription réussie !");
      navigate("/login");
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      if (backendMessage?.toLowerCase().includes("email")) {
        setErrors((prev) => ({
          ...prev,
          email: "Cet email est déjà utilisé.",
        }));
      } else {
        setSubmitError("Une erreur est survenue lors de l'inscription.");
      }
    }
  };

  return (
    <>
      {/* SEO */}
      <Seo
        title="Créer un compte"
        description="Inscrivez-vous gratuitement sur BeautyConnect pour réserver vos prestations beauté et découvrir de nouveaux professionnels."
      />

      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        aria-label="Page d'inscription client"
        className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-10 focus:outline-none"
      >
        <div
          className="bg-white shadow-lg rounded-lg w-full max-w-5xl p-8 grid grid-cols-1 md:grid-cols-2 gap-10"
          role="region"
          aria-labelledby="register-title"
        >
          {/* Formulaire d'inscription */}
          <section
            aria-labelledby="register-title"
            className="flex flex-col justify-center"
          >
            <h1
              id="register-title"
              className="text-2xl font-semibold mb-6 text-center md:text-left"
            >
              Créer un compte client
            </h1>

            {submitError && (
              <div role="alert" aria-live="assertive" className="mb-2">
                <AlertMessage type="error" message={submitError} />
              </div>
            )}
            {submitSuccess && (
              <div role="status" aria-live="polite" className="mb-2">
                <AlertMessage type="success" message={submitSuccess} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Nom */}
              <div>
                <label htmlFor="name" className="block mb-1 font-medium">
                  Nom
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  required
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block mb-1 font-medium">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  required
                />
                {formData.password.length > 0 && (
                  <PasswordStrength password={formData.password} />
                )}
                {errors.password && (
                  <p id="password-error" className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmation */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-1 font-medium"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword ? "confirm-error" : undefined
                  }
                  required
                />
                {errors.confirmPassword && (
                  <p id="confirm-error" className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Consentement RGPD */}
              <div className="flex items-start mt-6">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  aria-required="true"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  J’ai lu et j’accepte la{" "}
                  <Link
                    to="/legal/politique-de-confidentialite"
                    className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
                  >
                    politique de confidentialité
                  </Link>{" "}
                  de BeautyConnect.
                </label>
              </div>

              <button
                type="submit"
                disabled={!isFormValid() || !consentGiven}
                className={`w-full py-2 rounded mt-4 ${
                  isFormValid() && consentGiven
                    ? "bg-blue-600 text-white hover:bg-blue-700 transition"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                S'inscrire
              </button>
            </form>

            <p className="text-sm text-center mt-4">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
              >
                Se connecter
              </Link>
            </p>
          </section>

          {/* Section droite visuelle */}
          <aside
            className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col justify-center"
            aria-label="Avantages de l'inscription client"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Pourquoi rejoindre BeautyConnect ?
            </h2>

            <ul className="space-y-6" role="list">
              <li className="flex items-start">
                <Image
                  className="w-7 h-7 text-blue-600 mr-3"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Découvrez les prestations
                  </h3>
                  <p className="text-sm text-gray-600">
                    Un feed visuel pour explorer le travail des professionnels.
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <Calendar
                  className="w-7 h-7 text-blue-600 mr-3"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Réservez facilement
                  </h3>
                  <p className="text-sm text-gray-600">
                    Demandes rapides, confirmations en quelques clics.
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <Search
                  className="w-7 h-7 text-blue-600 mr-3"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Trouvez le bon prestataire
                  </h3>
                  <p className="text-sm text-gray-600">
                    Recherches personnalisées selon vos envies beauté.
                  </p>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </>
  );
}
