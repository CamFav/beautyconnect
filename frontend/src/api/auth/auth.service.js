import http from "../http/httpClient";

const AUTH_URL = "/auth";

// Inscription
export const register = async (formData) => {
  const res = await http.post(`${AUTH_URL}/register`, formData);
  return res.data;
};

// Connexion
export const login = async (formData) => {
  const res = await http.post(`${AUTH_URL}/login`, formData);
  return res.data;
};

// Récupération du profil utilisateur
export const getMe = async () => {
  const res = await http.get(`${AUTH_URL}/me`);
  return res.data;
};
