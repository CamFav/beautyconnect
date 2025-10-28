import { useNavigate } from "react-router-dom";
import Avatar from "../../../components/ui/Avatar";
import { MapPin, Heart } from "lucide-react";
import { useAuth } from "../../../context/AuthContextBase";

export default function ProCard({ pro, isFollowing, onFollow }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  if (!pro?.proProfile) return null;

  const sanitize = (val) =>
    typeof val === "string" ? val.trim().replace(/[<>]/g, "") : "";

  const displayName = sanitize(
    (pro.proProfile?.businessName || pro.name || "").trim()
  );

  const avatarUrl = pro.avatarPro || pro.avatarClient || null;

  const location = pro.proProfile?.location;
  const locationText =
    location && (location.city || location.postalCode)
      ? `${sanitize(location.postalCode || "")} ${sanitize(
          location.city || ""
        )}`.trim()
      : "";

  const categories = Array.isArray(pro.proProfile?.categories)
    ? pro.proProfile.categories
    : [];

  const totalLikes = pro.proProfile?.likesCount || 0;

  const handleNavigate = () => {
    if (!pro._id) return;

    console.log("handleNavigate click", {
      proId: pro._id,
      myClientId: currentUser?._id,
      myProId: currentUser?.proProfile?._id,
      activeRole: currentUser?.activeRole,
    });

    const myProId = currentUser?.proProfile?._id || null;
    const myClientId = currentUser?._id || null;

    const isMyPro = myProId && String(pro._id) === String(myProId);
    const isMyClient = myClientId && String(pro._id) === String(myClientId);

    console.log("Comparaison", {
      isMyPro,
      isMyClient,
      condition: isMyPro || isMyClient ? "→ /profile" : `→ /profile/${pro._id}`,
    });

    if (isMyPro || isMyClient) {
      navigate("/profile");
    } else {
      navigate(`/profile/${pro._id}`);
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col"
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleNavigate();
      }}
      role="button"
      tabIndex={0}
      aria-label={`Voir le profil de ${displayName}`}
    >
      {/* IMAGE DE COUVERTURE */}
      <div className="relative h-32 bg-gray-100">
        {pro.proProfile?.headerImage ? (
          <img
            src={pro.proProfile.headerImage}
            alt={`Bannière de ${displayName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.remove();
            }}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-r ${
              [
                "from-blue-400 to-purple-500",
                "from-pink-400 to-red-500",
                "from-indigo-400 to-cyan-400",
                "from-amber-400 to-orange-500",
                "from-emerald-400 to-teal-500",
                "from-fuchsia-400 to-pink-500",
              ][pro._id?.charCodeAt(0) % 6] || "from-blue-400 to-purple-500"
            }`}
          />
        )}

        {/* Avatar superposé */}
        <div className="absolute -bottom-6 left-4">
          <Avatar
            src={avatarUrl}
            name={displayName}
            size={55}
            className="border-4 border-white shadow-md"
          />
        </div>
      </div>

      {/* CONTENU */}
      <div className="pt-8 pb-4 px-4 flex flex-col flex-1">
        <div className="flex flex-col flex-1">
          <h2 className="text-base font-semibold text-gray-900 leading-tight">
            {displayName}
          </h2>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((cat) => (
                <span
                  key={sanitize(cat)}
                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md font-medium"
                >
                  {sanitize(cat)}
                </span>
              ))}
            </div>
          )}

          {locationText && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
              <MapPin size={12} className="text-gray-400" />
              <span>{locationText}</span>
            </div>
          )}

          {totalLikes > 0 && (
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-700">
              <Heart size={14} className="text-red-500 fill-red-500" />
              <span>{totalLikes}</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFollow && onFollow();
          }}
          aria-label={
            isFollowing
              ? `Se désabonner de ${displayName}`
              : `S'abonner à ${displayName}`
          }
          className={`mt-4 w-full py-2 rounded-md text-sm font-medium transition ${
            isFollowing
              ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isFollowing ? "Suivi(e)" : "Suivre"}
        </button>
      </div>
    </div>
  );
}
