import httpClient from "../http/httpClient";

/**
 * Récupère les disponibilités du pro connecté
 */
export async function getAvailability(token) {
  const res = await httpClient.get("/pro/availability", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

/**
 * Met à jour les disponibilités du pro connecté
 */
export async function updateAvailability(token, availability) {
  const res = await httpClient.put("/pro/availability", availability, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
