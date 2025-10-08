import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // register-pro (futur)
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/register", { state: { prefill: formData } });
  };

  const goPro = () => {
    navigate("/register-pro"); // à créer
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-gray-50">

      {/* HEADER droite */}
      <header className="w-full py-4 px-6 flex justify-end">
        <Link
          to="/home"
          className="text-sm text-gray-700 hover:underline"
        >
          Accéder au site
        </Link>
      </header>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-6">
        
        {/* Bloc slogan / branding */}
        <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            BeautyConnect
          </h1>
          <p className="text-gray-600 text-lg">
            Trouvez un professionnel de la beauté ou proposez vos services en toute simplicité.
          </p>
        </div>

        {/* Bloc formulaire */}
        <div className="md:w-1/2 max-w-md bg-white shadow p-6 rounded border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Créer un compte</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                name="name"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              S'inscrire
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Déjà un compte ? Se connecter
            </Link>
          </div>

          {/* Bouton pro */}
          <div className="mt-6">
            <button
              onClick={goPro}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900"
            >
              Je suis un professionnel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
