import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { handleRegister } = useContext(AuthContext);
  const [role, setRole] = useState("client");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    siret: "",
    location: "",
    services: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role,
    };

    if (role === "pro") {
      payload.businessName = formData.businessName;
      payload.siret = formData.siret;
      payload.location = formData.location;
      payload.services = formData.services.split(",").map(s => s.trim());
    }

    try {
      await handleRegister(payload);
      alert("Inscription réussie !");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white shadow p-6 rounded w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Créer un compte</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block mb-1">Nom</label>
            <input
              type="text"
              name="name"
              className="w-full border px-3 py-2 rounded"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border px-3 py-2 rounded"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              className="w-full border px-3 py-2 rounded"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Sélecteur Client / Pro */}
          <div className="flex gap-4 mt-3">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`px-4 py-2 rounded ${role === "client" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => setRole("pro")}
              className={`px-4 py-2 rounded ${role === "pro" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Pro
            </button>
          </div>

          {/* affiche les champs en plus si rôle = pro */}
          {role === "pro" && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block mb-1">Nom du commerce</label>
                <input
                  type="text"
                  name="businessName"
                  className="w-full border px-3 py-2 rounded"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1">SIRET</label>
                <input
                  type="text"
                  name="siret"
                  className="w-full border px-3 py-2 rounded"
                  value={formData.siret}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Localisation</label>
                <input
                  type="text"
                  name="location"
                  className="w-full border px-3 py-2 rounded"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Services (séparés par des virgules)</label>
                <input
                  type="text"
                  name="services"
                  className="w-full border px-3 py-2 rounded"
                  value={formData.services}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Déjà un compte ? <a href="/login" className="text-blue-600">Se connecter</a>
        </p>
      </div>
    </div>
  );
}
