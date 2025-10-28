import http from "../http/httpClient";

const ACCOUNT_URL = "/account";
const USERS_URL = "/users";

// Mettre à jour le rôle de l'utilisateur
export const updateRole = async (role) => {
  const res = await http.patch(`${ACCOUNT_URL}/role`, { role });
  return res.data;
};

// Suivre / ne plus suivre un utilisateur
export const followUser = async (userId) => {
  const res = await http.post(`${USERS_URL}/${userId}/follow`);
  return res.data;
};

// Récupérer les prestataires avec filtres
export const getPros = async ({ q = "", service = "" } = {}) => {
  const res = await http.get(`${USERS_URL}/getPros`, {
    params: { q, service },
  });

  const data = res.data;
  // Toujours retourner un tableau
  return Array.isArray(data) ? data : data.pros || [];
};
