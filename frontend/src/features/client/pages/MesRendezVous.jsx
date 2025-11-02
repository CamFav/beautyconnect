import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContextBase";
import httpClient from "../../../api/http/httpClient";
import ReservationCard from "../components/ReservationCard";
import AlertMessage from "../../../components/feedback/AlertMessage";
import Seo from "@/components/seo/Seo";

export default function MesRendezVous() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!user?._id) return;

    let isCancelled = false;

    const fetchData = async () => {
      try {
        const res = await httpClient.get(`/reservations/client/${user._id}`);
        if (!isCancelled) {
          setReservations(res.data || []);
        }
      } catch (err) {
        console.error("Erreur chargement réservations :", err);
        if (!isCancelled)
          setAlert({
            type: "error",
            text: "Impossible de charger vos rendez-vous.",
          });
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isCancelled = true;
    };
  }, [user]);

  const now = useMemo(() => new Date(), []);

  const reservationsUpcoming = useMemo(
    () => reservations.filter((r) => new Date(`${r.date}T${r.time}`) >= now),
    [reservations, now]
  );

  const reservationsPast = useMemo(
    () => reservations.filter((r) => new Date(`${r.date}T${r.time}`) < now),
    [reservations, now]
  );

  const displayed =
    activeTab === "upcoming" ? reservationsUpcoming : reservationsPast;

  const handleAction = async (id, nextStatus) => {
    const validStatuses = ["confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(nextStatus)) return;

    const previous = [...reservations];
    try {
      if (nextStatus === "cancelled") {
        setReservations((prev) => prev.filter((r) => r._id !== id));
      }

      await httpClient.patch(`/reservations/${id}/status`, {
        status: nextStatus,
      });

      if (nextStatus === "cancelled") {
        setAlert({ type: "info", text: "Rendez-vous annulé." });
      }
    } catch (e) {
      console.error(e);
      setReservations(previous);
      setAlert({
        type: "error",
        text: "Impossible d'effectuer cette action pour le moment.",
      });
    }
  };

  return (
    <>
      <Seo
        title="Mes rendez-vous"
        description="Retrouvez vos réservations confirmées et vos rendez-vous à venir."
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Mes rendez-vous</h1>

        {alert && (
          <AlertMessage type={alert.type} message={alert.text} role="alert" />
        )}

        {/* Tabs */}
        <div className="flex gap-2 mt-2 mb-6" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "upcoming"}
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
            role="tab"
            aria-selected={activeTab === "past"}
            onClick={() => setActiveTab("past")}
            className={`px-4 py-1 rounded-full border text-sm transition ${
              activeTab === "past"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Passés ({reservationsPast.length})
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : displayed.length === 0 ? (
          <p className="text-gray-500">
            {activeTab === "upcoming"
              ? "Aucun rendez-vous à venir."
              : "Aucun rendez-vous passé."}
          </p>
        ) : (
          <div className="space-y-4">
            {displayed.map((r) => (
              <ReservationCard
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
