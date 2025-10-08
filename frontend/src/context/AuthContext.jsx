import { createContext, useState, useEffect } from "react";
import { register, login, getMe } from "../api/authService";
import { updateRole as apiUpdateRole } from "../api/accountService";

export const AuthContext = createContext();

/* sanitisation */
const sanitize = (value) => {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .replace(/[<>]/g, "") // Retire balises
    .replace(/[\u200B-\u200D\uFEFF]/g, ""); // Retire caractères invisibles
};

/* Nettoie tous les champs d’un objet (formData) */
const sanitizeObject = (obj) => {
  const cleaned = {};
  for (const key in obj) {
    cleaned[key] = sanitize(obj[key]);
  }
  return cleaned;
};

/* Contexte d'authentification */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const data = await getMe(token);
        setUser(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil :", err);
        handleLogout();
      }
    };
    fetchUser();
  }, [token]);

  // Inscription
  const handleRegister = async (formData) => {
    const sanitizedData = sanitizeObject(formData);
    const data = await register(sanitizedData);
    return data;
  };

  // Connexion
  const handleLogin = async (formData) => {
    const sanitizedData = sanitizeObject(formData);
    const data = await login(sanitizedData);

    if (!data.token) throw new Error("Aucun token reçu");

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Bascule de rôle + refresh du token
  const updateRole = async (role) => {
    if (!token) throw new Error("Non connecté");
    const sanitizedRole = sanitize(role);
    const res = await apiUpdateRole(token, sanitizedRole);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
    console.log("[Auth] Nouveau token :", res.token.slice(0, 24), "…");
    return res.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        handleRegister,
        handleLogin,
        handleLogout,
        logout: handleLogout,
        updateRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
