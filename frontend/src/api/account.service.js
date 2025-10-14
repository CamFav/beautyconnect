import axios from "axios";

// Mettre à jour le rôle utilisateur
export const upgradeUserToPro = async (token, payload) => {
  try {
    const res = await axios.patch(
      "http://localhost:5000/api/account/pro-profile",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur upgradeToPro :", err);
    throw err;
  }
};
