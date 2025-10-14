import { createContext, useEffect, useRef, useState, useContext } from "react";
import { register, login, getMe } from "../api/auth.service";
import { updateRole as apiUpdateRole } from "../api/user.service";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/** Sanitize helpers */
const sanitize = (value) => {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .replace(/[<>]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
};
const sanitizeObject = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitize(v)]));

/** Normalise l'objet user venant de l'API */
const normalizeUser = (raw) => {
  if (!raw) return null;
  const u = { ...raw };
  if (!u.activeRole) u.activeRole = u.role ?? "client";

  if (u.activeRole === "pro" && !u.proProfile) {
    u.proProfile = {
      businessName: "",
      status: "freelance",
      exerciseType: [],
      experience: "<1 an",
      location: "",
      services: [],
      siret: "",
    };
  }
  return u;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const fetchGen = useRef(0);

  /** Charge /me à chaque token */
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    const gen = ++fetchGen.current;

    (async () => {
      try {
        const me = await getMe();
        if (fetchGen.current !== gen) return;
        setUser(normalizeUser(me));
      } catch (err) {
        if (fetchGen.current !== gen) return;
        console.error(
          "[Auth] Erreur /me :",
          err?.response?.data || err.message
        );
        handleLogout();
      }
    })();
  }, [token]);

  /** Inscription */
  const handleRegister = async (formData) => {
    const data = await register(sanitizeObject(formData));
    return data;
  };

  /** Connexion */
  const handleLogin = async (formData) => {
    const data = await login(sanitizeObject(formData));
    if (!data?.token) throw new Error("Aucun token reçu");

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(normalizeUser(data.user));
  };

  /** Déconnexion */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  /** Mise à jour du rôle */
  const updateRole = async (role) => {
    if (!token) throw new Error("Non connecté");

    const sanitizedRole = sanitize(role);
    const res = await apiUpdateRole(sanitizedRole);

    console.log("[updateRole] Réponse backend :", res);

    // Mise à jour du token si renvoyé
    if (res.token) {
      localStorage.setItem("token", res.token);
      setToken(res.token);
    }

    // fusion des données
    setUser((prev) => ({
      ...prev,
      ...res.user,
      activeRole: sanitizedRole,
    }));

    return res.user;
  };

  /** Mise à jour locale après passage en PRO */
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        handleRegister,
        handleLogin,
        handleLogout,
        logout: handleLogout,
        updateRole,
        upgradeUserToPro,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
