import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContextBase";
import {
  getProReservations,
  updateReservationStatus,
} from "../../../api/pro/pro.reservations.js";
import ReservationCardPro from "@/features/pro/components/reservations/ReservationCardPro";
import AlertMessage from "../../../components/feedback/AlertMessage";
import Seo from "@/components/seo/Seo";
import { mapApiErrors } from "@/utils/validators";

export default function ReservationsPro() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [alert, setAlert] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!user?._id || user?.activeRole !== "pro") return;

    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await getProReservations(user._id);
        if (mounted) setReservations(data || []);
      } catch (error) {
        if (mounted) {
          const apiErrors = mapApiErrors(error?.response?.data);
          setErr(
            apiErrors._error ||
              error?.response?.data?.message ||
              "Impossible de charger les réservations."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [user?._id, user?.activeRole]);

  const handleAction = async (id, nextStatus) => {
    const previous = [...reservations];
    try {
      if (nextStatus === "rejected" || nextStatus === "cancelled") {
        setReservations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: nextStatus } : r))
        );
      } else {
        setReservations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: nextStatus } : r))
        );
      }

      await updateReservationStatus(id, nextStatus);

      if (nextStatus === "accepted")
        setAlert({ type: "success", text: "Réservation acceptée." });
      else if (nextStatus === "cancelled")
        setAlert({ type: "info", text: "Réservation annulée." });
      else if (nextStatus === "rejected")
        setAlert({ type: "info", text: "Réservation refusée." });
    } catch {
      setReservations(previous);
      setAlert({ type: "error", text: "Action impossible pour le moment." });
    }
  };

  const reservationsUpcoming = useMemo(() => {
    const now = new Date();
    return reservations.filter(
      (r) =>
        new Date(`${r.date}T${r.time}:00`) >= now &&
        r.status !== "cancelled" &&
        r.status !== "rejected"
    );
  }, [reservations]);

  const reservationsPast = useMemo(() => {
    const now = new Date();
    return reservations.filter(
      (r) =>
        new Date(`${r.date}T${r.time}:00`) < now &&
        r.status !== "cancelled" &&
        r.status !== "rejected"
    );
  }, [reservations]);

  const reservationsCancelled = useMemo(() => {
    return reservations.filter(
      (r) => r.status === "cancelled" || r.status === "rejected"
    );
  }, [reservations]);

  const displayed =
    activeTab === "upcoming"
      ? reservationsUpcoming
      : activeTab === "past"
      ? reservationsPast
      : reservationsCancelled;

  if (user?.activeRole !== "pro") {
    return (
      <div className="p-6 text-center text-gray-600">
        Accès réservé aux professionnels.
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Mes réservations"
        description="Consultez et organisez vos rendez-vous avec vos clients."
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Mes réservations</h1>

        {alert && <AlertMessage type={alert.type} message={alert.text} />}
        {err && <AlertMessage type="error" message={err} />}

        {/* Onglets */}
        <div className="flex gap-2 mt-2 mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-1 rounded-full border text-sm transition ${
              activeTab === "upcoming"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            À venir ({reservationsUpcoming.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-1 rounded-full border text-sm transition ${
              activeTab === "past"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Passées ({reservationsPast.length})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-1 rounded-full border text-sm transition ${
              activeTab === "cancelled"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Annulées ({reservationsCancelled.length})
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : displayed.length === 0 ? (
          <p className="text-gray-500">
            {activeTab === "upcoming"
              ? "Aucune réservation à venir."
              : activeTab === "past"
              ? "Aucune réservation passée."
              : "Aucune réservation annulée."}
          </p>
        ) : (
          <div className="space-y-4">
            {displayed.map((r) => (
              <ReservationCardPro
                key={r._id}
                reservation={r}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
