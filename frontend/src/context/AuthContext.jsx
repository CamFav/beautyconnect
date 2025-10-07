import { createContext, useState, useEffect } from "react";
import { register, login, getMe } from "../api/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Récupère le profil utilisateur si token présent
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

  // nscription
  const handleRegister = async (formData) => {
    const data = await register(formData);
    return data;
  };

  // Connexion 
  const handleLogin = async (formData) => {
    const data = await login(formData);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        handleRegister,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
