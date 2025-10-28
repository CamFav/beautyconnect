import http from "../http/httpClient";

//Récupère les réservations d'un pro
export const getProReservations = async (proId) => {
  const { data } = await http.get(`/reservations/pro/${proId}`);
  return data;
};

// status: "accepted" | "rejected" | "cancelled" | "pending"

export const updateReservationStatus = async (reservationId, status) => {
  const { data } = await http.patch(`/reservations/${reservationId}/status`, {
    status,
  });
  return data;
};
