import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContextBase";
import { register, login, getMe } from "../api/auth/auth.service";
import { updateRole as apiUpdateRole } from "../api/users/user.service";
import { sanitizeObject, normalizeUser, isTokenExpired } from "./authUtils";

const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(true);
  const fetchGen = useRef(0);

  const setUser = (value) => {
    if (!value) {
      localStorage.removeItem("user");
      setUserState(null);
    } else {
      const normalized = normalizeUser(value);
      localStorage.setItem("user", JSON.stringify(normalized));
      setUserState(normalized);
    }
  };

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      handleLogout();
      setLoading(false);
      return;
    }

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const gen = ++fetchGen.current;
    (async () => {
      try {
        const me = await getMe();
        if (fetchGen.current !== gen) return;
        setUser(me);
      } catch (err) {
        if (fetchGen.current !== gen) return;
        console.error(
          "[Auth] Erreur /me :",
          err?.response?.data || err.message
        );
        handleLogout();
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleRegister = async (formData) => register(sanitizeObject(formData));

  const handleLogin = async (formData) => {
    const data = await login(sanitizeObject(formData));
    if (!data?.token) throw new Error("Impossible de récupérer le token");
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserState(null);
    setToken(null);
  };

  const updateRole = async (role) => {
    if (!token) throw new Error("Non connecté");
    const res = await apiUpdateRole(role);
    if (res.token) {
      localStorage.setItem("token", res.token);
      setToken(res.token);
    }
    setUser({
      ...res.user,
      activeRole: res?.user?.activeRole ?? role,
    });
    return res.user;
  };

  const upgradeUserToPro = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      role: "pro",
      activeRole: "pro",
      proProfile: updatedFields || prev?.proProfile,
    }));
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn("[Auth] Session expirée, déconnexion forcée.");
      handleLogout();
    };
    window.addEventListener("sessionExpired", handleSessionExpired);
    return () =>
      window.removeEventListener("sessionExpired", handleSessionExpired);
  }, []);

  // --- Écouteur global pour logout manuel ---
  useEffect(() => {
    const handleExternalLogout = () => {
      console.info("[Auth] Déconnexion externe (suppression du compte).");
      handleLogout();
    };

    window.addEventListener("logout", handleExternalLogout);
    return () => window.removeEventListener("logout", handleExternalLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        handleRegister,
        handleLogin,
        handleLogout,
        logout: handleLogout,
        updateRole,
        upgradeUserToPro,
        updateUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
