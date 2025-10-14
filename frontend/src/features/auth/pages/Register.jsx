import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: "client",
    };

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
        <h2 className="text-2xl font-semibold mb-4">Créer un compte client</h2>

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

          <div>
            <label className="block mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full border px-3 py-2 rounded"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Déjà un compte ?{" "}
          <a href="/login" className="text-blue-600">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
