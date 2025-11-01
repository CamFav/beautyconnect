import Avatar from "../../../components/ui/Avatar";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReservationCard({ reservation, onAction }) {
  const navigate = useNavigate();

  const { proId, serviceName, price, date, time, status, _id } = reservation;

  const sanitize = (value) =>
    typeof value === "string" ? value.trim().replace(/[<>]/g, "") : "";

  const pro = typeof proId === "object" && proId !== null ? proId : null;
  const displayName =
    pro?.proProfile?.businessName || pro?.name || "Professionnel";
  const safeDisplayName = sanitize(displayName);
  const safeServiceName = sanitize(serviceName);
  const avatarSrc = pro?.avatarPro || null;

  const proLocation = pro?.proProfile?.location;
  const safeLocation = (() => {
    if (!proLocation) return "";
    const { address, postalCode, city, country } = proLocation;
    const parts = [
      address && sanitize(address),
      postalCode && sanitize(postalCode),
      city && sanitize(city),
      country && sanitize(country),
    ].filter(Boolean);
    return parts.join(", ");
  })();

  const statusLabels = {
    pending: "En attente",
    accepted: "À venir",
    confirmed: "À venir",
    rejected: "Refusée",
    cancelled: "Annulée",
    past: "Passé",
  };
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    confirmed: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-700",
    past: "bg-gray-300 text-gray-700",
  };

  // Statut automatique “Passé” si la date est dépassée
  const now = new Date();
  const dateTime = new Date(`${date}T${time}`);
  const isPast = dateTime < now;
  const effectiveStatus =
    (status === "accepted" || status === "confirmed") && isPast
      ? "past"
      : status;

  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleCancel = () => {
    if (!_id) return;
    onAction(_id, "cancelled");
  };

  const handleOpenProfile = () => {
    if (pro?._id) {
      navigate(`/profile/${pro._id}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between border border-gray-200 rounded-lg p-5 bg-white shadow-sm relative">
      {/* Badge dynamique */}
      <span
        className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-md ${
          statusClasses[effectiveStatus] || "bg-gray-200 text-gray-700"
        }`}
        role="status"
      >
        {statusLabels[effectiveStatus] || effectiveStatus}
      </span>

      {/* Colonne gauche : clic vers profil sans effet visuel */}
      <div className="flex items-start space-x-4 select-none">
        <div
          onClick={handleOpenProfile}
          className="cursor-pointer flex-shrink-0"
          role="button"
          aria-label={`Ouvrir le profil de ${safeDisplayName}`}
        >
          <Avatar
            src={avatarSrc}
            name={safeDisplayName}
            size={55}
            className="border rounded-full"
          />
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-800">
            {safeServiceName}
          </h3>
          <p
            className="text-sm text-gray-700 cursor-pointer"
            onClick={handleOpenProfile}
            role="button"
          >
            {safeDisplayName}
          </p>

          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{time}</span>
              </div>
            </div>

            {safeLocation && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{safeLocation}</span>
              </div>
            )}
          </div>

          <p className="font-semibold text-gray-800 mt-3">{price}€</p>
        </div>
      </div>

      {/* Colonne droite */}
      <div className="mt-4 md:mt-0 flex flex-col items-end justify-between">
        <div className="flex gap-3 mt-4 md:mt-auto">
          <button
            className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-red-500 text-white hover:bg-red-600"
            onClick={handleCancel}
            aria-label={`Annuler la réservation ${safeServiceName}`}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
