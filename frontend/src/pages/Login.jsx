import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { sanitizeInput } from "../utils/sanitize";

export default function Login() {
  const { handleLogin } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: sanitizeInput(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Payload envoyé :", formData);
  
    try {
      await handleLogin(formData);
      alert("Connexion réussie !");
      navigate("/home");
    } catch (err) {
      console.error("Erreur login :",err);
      alert("Erreur lors de la connexion");
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 400, margin: "0 auto" }}>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Se connecter</button>
      </form>

      <p style={{ marginTop: 10 }}>
        Pas encore de compte ? <a href="/register">S'inscrire</a>
      </p>
    </div>
  );
}
