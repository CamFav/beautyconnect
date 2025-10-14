import http from "./httpClient";

const ACCOUNT_URL = "/account";

// Mettre à jour le rôle utilisateur
export const upgradeUserToPro = async (payload) => {
  try {
    const res = await http.patch(`${ACCOUNT_URL}/pro-profile`, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur upgradeToPro :", err);
    throw err.response?.data || err;
  }
};
