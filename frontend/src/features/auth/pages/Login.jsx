import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContextBase";
import { useNavigate, Link } from "react-router-dom";
import { sanitizeInput } from "../../../utils/sanitize";
import AlertMessage from "../../../components/feedback/AlertMessage";
import { Calendar, Heart } from "lucide-react";
import {
  validateLoginForm,
  mapApiErrors,
} from "../../../utils/validators";
import Seo from "@/components/seo/Seo";

/**
 * Page de connexion
 */

export default function Login() {
  const { handleLogin } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Gestion du changement d'input
   * On assainit uniquement l'email pour éviter d'effacer des caractères spéciaux du mot de passe
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "email" ? sanitizeInput(value) : value,
    }));
    setErrors({});
    setSubmitError("");
  };

  /**
   * Validation légère spécifique au login
   * (Email valide + mot de passe non vide)
   */
  const validateForm = () => {
    const newErrors = validateLoginForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Soumission du formulaire de connexion
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError("");

    try {
      await handleLogin(formData);
      navigate("/home");
    } catch (err) {
      console.error("Erreur login :", err);

      const apiErrors = mapApiErrors(err?.response?.data);
      if (apiErrors.email || apiErrors.password) {
        setErrors(apiErrors);
      } else {
        setSubmitError("Email ou mot de passe incorrect.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Balises SEO */}
      <Seo
        title="Connexion"
        description="Connectez-vous à votre compte BeautyConnect pour gérer vos réservations, vos services et vos publications."
      />

      {/* Contenu principal */}
      <main
        id="main-content"
        role="main"
        aria-label="Page de connexion"
        tabIndex={-1}
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10 focus:outline-none"
      >
        <div
          className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-10"
          role="region"
          aria-labelledby="login-title"
        >
          {/* Formulaire */}
          <section
            aria-labelledby="login-title"
            className="flex flex-col justify-center"
          >
            <h1
              id="login-title"
              className="text-2xl font-bold mb-6 text-center md:text-left"
            >
              Connexion
            </h1>

            {submitError && (
              <div role="alert" aria-live="assertive" className="mb-4">
                <AlertMessage type="error" message={submitError} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Champ email */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="exemple@domaine.com"
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

              {/* Champ mot de passe */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="password"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Votre mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  required
                />
                {errors.password && (
                  <p id="password-error" className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              Pas encore de compte ?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
              >
                S'inscrire
              </Link>
            </p>
          </section>

          {/* Section droite visuelle */}
          <aside
            className="bg-gray-50 p-8 rounded-lg border border-gray-200 flex flex-col justify-center text-center"
            aria-label="Avantages de la connexion"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Accédez à votre espace
            </h2>

            <ul className="space-y-6 text-gray-700 text-sm" role="list">
              <li className="flex items-center justify-center gap-3">
                <Calendar className="w-6 h-6" aria-hidden="true" />
                <p>Gérez vos réservations facilement</p>
              </li>
              <li className="flex items-center justify-center gap-3">
                <Heart className="w-6 h-6" aria-hidden="true" />
                <p>Suivez vos favoris et vos prestataires préférés</p>
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </>
  );
}
