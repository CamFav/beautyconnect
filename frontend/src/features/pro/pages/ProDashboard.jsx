import { useAuth } from "../../../context/AuthContextBase";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import PendingReservations from "../components/dashboard/PendingReservations";
import DashboardStats from "../components/dashboard/DashboardStats";
import PortfolioSection from "../components/dashboard/PortfolioSection";
import httpClient from "../../../api/http/httpClient";
import { useEffect, useState } from "react";
import AlertMessage from "../../../components/feedback/AlertMessage";
import Seo from "@/components/seo/Seo";

export default function ProDashboard() {
  const { user } = useAuth();
  const [weeklySlots, setWeeklySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const proId = user?._id;
  const isPro =
    user?.activeRole?.toLowerCase() === "pro" ||
    user?.role?.toLowerCase() === "pro";

  useEffect(() => {
    if (!proId) return;

    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await httpClient.get("/pro/availability");

        const dayMap = {
          monday: 0,
          tuesday: 1,
          wednesday: 2,
          thursday: 3,
          friday: 4,
          saturday: 5,
          sunday: 6,
        };

        const slotsByDay = Array.from({ length: 7 }, () => []);

        if (Array.isArray(res.data)) {
          res.data.forEach((dayObj) => {
            const index = dayMap[dayObj.day?.toLowerCase()];
            if (index !== undefined) {
              slotsByDay[index] = dayObj.enabled ? dayObj.slots || [] : [];
            }
          });
        }

        setWeeklySlots(slotsByDay);
      } catch (err) {
        console.error("Erreur récupération disponibilités :", err);
        setError("Impossible de charger vos disponibilités pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [proId]);

  if (!user || !isPro) {
    return (
      <div className="p-6 text-center text-gray-600">
        Accès réservé aux professionnels.
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Tableau de bord"
        description="Gérez vos réservations, vos services et vos publications sur BeautyConnect Pro."
      />

      <div className="p-6 space-y-6">
        {loading && (
          <p className="text-gray-500 text-center py-10">Chargement...</p>
        )}

        {error && <AlertMessage type="error">{error}</AlertMessage>}

        {!loading && !error && (
          <>
            <UpcomingAppointments proId={proId} weeklySlots={weeklySlots} />
            <PendingReservations proId={proId} />
            <DashboardStats proId={proId} />
            <PortfolioSection proId={proId} />
          </>
        )}
      </div>
    </>
  );
}
