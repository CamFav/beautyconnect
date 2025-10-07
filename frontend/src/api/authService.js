import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

// Inscription
export const register = async (data) => {
  const res = await axios.post(`${API_URL}register`, data);
  return res.data;
};

// Connexion
export const login = async (data) => {
  const res = await axios.post(`${API_URL}login`, data);
  return res.data;
};

// Récupération du profil utilisateur (token JWT)
export const getMe = async (token) => {
  const res = await axios.get(`${API_URL}me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
