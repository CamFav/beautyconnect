import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Inscription
export const register = async (formData) => {
  const res = await axios.post(`${API_URL}/register`, formData);
  return res.data;
};

// Connexion
export const login = async (formData) => {
  const res = await axios.post(`${API_URL}/login`, formData);
  return res.data;
};

// Récupère le profil utilisateur
export const getMe = async (token) => {
  console.log("Appel à /me avec token :", token);
  const res = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
