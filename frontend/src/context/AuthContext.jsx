import { createContext, useEffect, useRef, useState } from "react";
import { register, login, getMe } from "../api/authService";
import { updateRole as apiUpdateRole } from "../api/accountService";

export const AuthContext = createContext();

/** Sanitize helpers (garde ton util si tu veux) */
const sanitize = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().replace(/[<>]/g, "").replace(/[\u200B-\u200D\uFEFF]/g, "");
};
const sanitizeObject = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitize(v)]));

/** Normalise l'objet user venant de l'API */
const normalizeUser = (raw) => {
  if (!raw) return null;
  const u = { ...raw };
  // activeRole prioritaire pour l'affichage, fallback sur role si besoin
  if (!u.activeRole) u.activeRole = u.role ?? "client";
  // assure l’existence du proProfile (utile côté UI)
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
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const fetchGen = useRef(0); // évite de prendre en compte des /me obsolètes

  /** Charge /me à chaque token (en ignorant les requêtes obsolètes) */
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    const gen = ++fetchGen.current;

    (async () => {
      try {
        const me = await getMe(token);
        if (fetchGen.current !== gen) return; // réponse obsolète, on ignore
        setUser(normalizeUser(me));
      } catch (err) {
        if (fetchGen.current !== gen) return;
        console.error("[Auth] Erreur /me :", err?.response?.data || err.message);
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

    // 1) met à jour l'UI immédiatement
    setUser(normalizeUser(data.user));
    // 2) persiste le token (déclenche le /me ensuite)
    localStorage.setItem("token", data.token);
    setToken(data.token);
  };

  /** Déconnexion */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  /** Toggle / mise à jour du rôle (activeRole) */
const updateRole = async (role) => {
  if (!token) throw new Error("Non connecté");

  const sanitizedRole = sanitize(role);
  const res = await apiUpdateRole(token, sanitizedRole);

  console.log("[updateRole] Réponse backend :", res);

  // Mise à jour du token
  if (res.token) {
    localStorage.setItem("token", res.token);
    setToken(res.token);
  }

  // fusionne les données reçues
  setUser((prev) => ({
    ...prev,
    ...res.user,
    activeRole: sanitizedRole,
  }));

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
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
