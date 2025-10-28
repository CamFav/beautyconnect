import { useEffect, useState } from "react";
import httpClient from "../../../../api/http/httpClient";

/**
 * weeklySlots: Array(7) aligné Lundi=0 ... Dimanche=6
 */
export default function UpcomingAppointments({ proId, weeklySlots }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekDays = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  const todayIndex = (new Date().getDay() + 6) % 7; // Lundi=0

  useEffect(() => {
    if (!proId) return;

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await httpClient.get(`/reservations/pro/${proId}`);

        const confirmed = res.data
          .filter((r) => r.status === "accepted")
          .sort(
            (a, b) =>
              new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
          );

        setAppointments(confirmed);
      } catch (err) {
        console.error("Erreur chargement planning :", err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [proId]);

  if (loading) return <p>Chargement du planning...</p>;

  const grouped = weekDays.map((_, index) =>
    appointments.filter((appt) => {
      const date = new Date(appt.date);
      const dayIndex = (date.getDay() + 6) % 7;
      return dayIndex === index;
    })
  );

  const groupByTimeSlots = (dayAppointments, slots) => {
    if (!slots || slots.length === 0) return {};

    const slotMap = {};
    slots.forEach((s) => {
      const key = `${s.start} - ${s.end}`;
      slotMap[key] = [];
    });

    dayAppointments.forEach((appt) => {
      const apptTime = appt.time;
      slots.forEach((s) => {
        if (apptTime >= s.start && apptTime < s.end) {
          const key = `${s.start} - ${s.end}`;
          slotMap[key].push(appt);
        }
      });
    });

    return slotMap;
  };

  const isClosed = (idx) => {
    if (!Array.isArray(weeklySlots) || weeklySlots.length !== 7) return false;
    const slots = weeklySlots[idx] || [];
    return slots.length === 0;
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Planning hebdomadaire
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const closed = isClosed(idx);
          const isToday = idx === todayIndex;

          const cardClass = closed
            ? "border-red-300 bg-red-50 shadow-md"
            : isToday
            ? "border-blue-400 bg-blue-50 shadow-md"
            : "border-gray-200 bg-white";

          const headerClass = closed
            ? "bg-red-600 text-white border-red-500"
            : isToday
            ? "bg-blue-600 text-white border-blue-500"
            : "bg-blue-50 text-blue-700 border-blue-100";

          return (
            <div
              key={day}
              className={`flex flex-col rounded-xl border overflow-hidden min-h-[180px] shadow-sm ${cardClass}`}
            >
              <div className={`px-3 py-2 border-b text-center ${headerClass}`}>
                <h3 className="text-sm font-semibold flex items-center justify-center gap-2">
                  {day}
                  {closed && (
                    <span className="text-[10px] uppercase tracking-wide bg-white/20 rounded px-2 py-[2px]">
                      Fermé
                    </span>
                  )}
                </h3>
              </div>

              <div className="flex-1 p-3 space-y-3">
                {closed ? (
                  <p className="text-red-700 text-xs italic text-center mt-4">
                    Aucun créneau de disponibilité
                  </p>
                ) : (
                  (() => {
                    const daySlots = weeklySlots[idx] || [];
                    const slotsWithAppts = groupByTimeSlots(
                      grouped[idx],
                      daySlots
                    );

                    const slotKeys = Object.keys(slotsWithAppts);
                    if (!slotKeys.length) {
                      return (
                        <p className="text-gray-400 text-xs italic text-center mt-4">
                          Aucun RDV
                        </p>
                      );
                    }

                    return slotKeys.map((slotLabel) => (
                      <div key={slotLabel}>
                        <h4 className="text-xs font-semibold text-gray-600 mb-1">
                          {slotLabel}
                        </h4>
                        {slotsWithAppts[slotLabel].length ? (
                          slotsWithAppts[slotLabel].map((appt) => (
                            <div
                              key={appt._id}
                              className="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-md p-2 shadow-sm mb-1"
                            >
                              <span className="font-medium block">
                                {appt.time} • {appt.serviceName}
                              </span>
                              <span className="italic text-gray-600">
                                {appt.clientId?.name || "Client inconnu"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-xs italic">
                            Aucun RDV sur ce créneau
                          </p>
                        )}
                      </div>
                    ));
                  })()
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
