import http from "../http/httpClient";

const ACCOUNT_URL = "/account";

// Mettre à jour le rôle utilisateur (passage en Pro)
export const upgradeUserToPro = async (payload) => {
  try {
    const res = await http.patch(`${ACCOUNT_URL}/pro-profile`, payload);

    // Si le backend renvoie un token, stocke le token
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
    }

    // Retourne toujours l’objet utilisateur pour mettre à jour le contexte
    return res.data.user || res.data;
  } catch (err) {
    console.error("Erreur upgradeUserToPro :", err);
    throw err.response?.data || err;
  }
};
