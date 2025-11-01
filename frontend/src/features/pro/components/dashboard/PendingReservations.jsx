import { useEffect, useState } from "react";
import httpClient from "../../../../api/http/httpClient";
import ReservationCardPro from "../reservations/ReservationCardPro";

export default function PendingReservations({ proId }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proId) return;

    const fetchReservations = async () => {
      setLoading(true);
      try {
        const res = await httpClient.get(`/reservations/pro/${proId}`);
        const now = new Date();

        const pending = res.data
          .filter(
            (r) =>
              r.status === "pending" &&
              new Date(`${r.date}T${r.time}:00`) >= now
          )
          .sort(
            (a, b) =>
              new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
          );

        setReservations(pending.slice(0, 3));
      } catch (err) {
        console.error("Erreur chargement réservations :", err);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [proId]);

  const handleAction = async (id, newStatus) => {
    try {
      await httpClient.patch(`/reservations/${id}/status`, {
        status: newStatus,
      });
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Erreur mise à jour réservation :", err);
    }
  };

  if (loading) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Réservations en attente
        </h2>
        <p className="text-gray-500 text-sm">Chargement...</p>
      </section>
    );
  }

  if (!reservations.length) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Réservations en attente
        </h2>
        <div className="flex flex-col items-center justify-center py-6 border border-gray-200 rounded-lg bg-gray-50 text-center shadow-sm">
          <div className="text-gray-500 font-medium text-sm">
            Aucune demande en attente
          </div>
          <div className="text-gray-400 text-xs mt-1">
            Vous serez notifié dès qu’un client vous envoie une réservation.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Réservations en attente
      </h2>
      {reservations.map((r) => (
        <ReservationCardPro
          key={r._id}
          reservation={r}
          onAction={handleAction}
        />
      ))}
      {reservations.length >= 3 && (
        <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
          Voir toutes les réservations
        </button>
      )}
    </section>
  );
}
