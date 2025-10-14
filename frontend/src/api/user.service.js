import axios from "axios";
import http from "./httpClient";

const ACCOUNT_URL = "/account";

export const updateRole = async (role) => {
  const res = await http.patch(`${ACCOUNT_URL}/role`, { role });
  return res.data; // { message, user, token }
};

// Mettre à jour le profil client
export const toggleFollow = async (token, targetUserId) => {
  const res = await axios.post(
    `http://localhost:5000/api/users/${targetUserId}/follow`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Récupérer les prestataires avec filtres optionnels
export const getPros = async ({ q = "", service = "" } = {}) => {
  const res = await axios.get("http://localhost:5000/api/users/getPros", {
    params: { q, service },
  });
  return res.data || [];
};
