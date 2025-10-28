import httpClient from "../http/httpClient";

export async function getAvailableSlots(proId, serviceId, date) {
  try {
    const res = await httpClient.get(
      `/pro/${proId}/slots?date=${date}&serviceId=${serviceId}`
    );

    // Retourne uniquement le tableau de créneaux disponibles
    return res.data?.availableSlots || [];
  } catch (err) {
    console.error("Erreur getAvailableSlots:", err);
    return [];
  }
}
