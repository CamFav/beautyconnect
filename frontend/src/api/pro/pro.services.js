import httpClient from "../http/httpClient";

/**
 * Récupère les services du pro connecté
 */
export async function getMyServices(token) {
  const res = await httpClient.get("/pro/services", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

/**
 * Crée un nouveau service
 * data = { name, price, duration, description }
 */
export async function createService(token, data) {
  const res = await httpClient.post("/pro/services", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

/**
 * Met à jour un service
 * data = { name, price, duration, description }
 */
export async function updateService(token, serviceId, data) {
  const res = await httpClient.put(`/pro/services/${serviceId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

/**
 * Supprime un service
 */
export async function deleteService(token, serviceId) {
  const res = await httpClient.delete(`/pro/services/${serviceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
