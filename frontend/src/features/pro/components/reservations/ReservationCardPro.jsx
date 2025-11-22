import Avatar from "../../../../components/ui/Avatar";
import { Calendar, Clock } from "lucide-react";

export default function ReservationCardPro({ reservation, onAction }) {
  const {
    _id,
    clientId,
    serviceName,
    price,
    duration,
    date,
    time,
    status,
  } = reservation;

  const client =
    typeof clientId === "object" && clientId !== null ? clientId : null;
  const displayName = client?.name || "Client";
  const avatarSrc = client?.avatarClient || "";

  // --- Statuts ---
  const now = new Date();
  const dateTime = new Date(`${date}T${time}`);

  let effectiveStatus = status;
  if (status === "accepted" && dateTime < now) effectiveStatus = "completed"; // nouvelle clé

  const statusLabels = {
    pending: "En attente",
    accepted: "Acceptée",
    rejected: "Refusée",
    cancelled: "Annulée",
    past: "Passé",
    completed: "Complétée",
  };

  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-700",
    past: "bg-gray-300 text-gray-700",
    completed: "bg-green-100 text-green-800",
  };

  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row justify-between border border-gray-200 rounded-xl p-5 bg-white shadow hover:shadow-md transition relative">
      {/* Badge statut */}
      <span
        className={`absolute top-4 right-4 text-xs font-medium px-3 py-1 rounded-full ${
          statusClasses[effectiveStatus] || "bg-gray-200 text-gray-700"
        }`}
      >
        {statusLabels[effectiveStatus] || effectiveStatus}
      </span>

      {/* Colonne gauche */}
      <div className="flex items-start space-x-4">
        <Avatar
          src={avatarSrc}
          name={displayName}
          size={55}
          className="border rounded-full"
        />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800">
            {displayName}
          </h3>
          <p className="text-sm text-gray-600">{serviceName}</p>

          <div className="mt-3 text-sm text-gray-700 space-y-2">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{time}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {duration} min • <span className="font-semibold">{price}€</span>
          </p>
        </div>
      </div>

      {/* Colonne droite (actions) */}
      <div className="mt-4 md:mt-0 flex items-end justify-end">
        {effectiveStatus === "pending" && (
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => onAction(_id, "accepted")}
              className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 transition"
            >
              Accepter
            </button>
            <button
              onClick={() => onAction(_id, "rejected")}
              className="px-4 py-2 text-sm rounded-md bg-red-500 text-white border border-red-500 hover:bg-red-600 transition"
            >
              Refuser
            </button>
          </div>
        )}

        {effectiveStatus === "accepted" && (
          <button
            onClick={() => onAction(_id, "cancelled")}
            className="px-4 py-2 text-sm border rounded-md bg-red-500 text-white hover:bg-red-600 transition"
          >
            Annuler
          </button>
        )}

        {(effectiveStatus === "rejected" ||
          effectiveStatus === "cancelled" ||
          effectiveStatus === "past" ||
          effectiveStatus === "completed") && (
          <span className="text-xs opacity-60">—</span>
        )}
      </div>
    </div>
  );
}
