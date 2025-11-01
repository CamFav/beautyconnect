import { useEffect, useState } from "react";
import httpClient from "../../../../api/http/httpClient";
import { CalendarCheck, Clock, Image } from "lucide-react";

export default function DashboardStats({ proId }) {
  const [stats, setStats] = useState({
    confirmedAppointments: 0,
    pendingReservations: 0,
    posts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proId) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const resRdv = await httpClient.get(`/reservations/pro/${proId}`);
        const confirmed = resRdv.data.filter(
          (r) => r.status === "accepted"
        ).length;
        const pending = resRdv.data.filter(
          (r) => r.status === "pending"
        ).length;

        const resPosts = await httpClient.get(`/posts?provider=${proId}`);
        const postsCount = resPosts.data.posts?.length || 0;

        setStats({
          confirmedAppointments: confirmed,
          pendingReservations: pending,
          posts: postsCount,
        });
      } catch (err) {
        console.error("Erreur chargement stats :", err);
        setStats({
          confirmedAppointments: 0,
          pendingReservations: 0,
          posts: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [proId]);

  if (loading) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Statistiques
        </h2>
        <p>Chargement...</p>
      </section>
    );
  }

  const items = [
    {
      label: "RDV confirmés",
      value: stats.confirmedAppointments,
      icon: <CalendarCheck size={28} className="text-blue-600" />,
    },
    {
      label: "En attente",
      value: stats.pendingReservations,
      icon: <Clock size={28} className="text-yellow-600" />,
    },
    {
      label: "Publications",
      value: stats.posts,
      icon: <Image size={28} className="text-purple-600" />,
    },
  ];

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-sm">
              {item.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
