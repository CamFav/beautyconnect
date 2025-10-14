import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";

// Carte affichant un pro avec bouton suivre / ne plus suivre
export default function ProCard({ pro, isFollowing, onFollow }) {
  if (!pro.proProfile) return null;
  const navigate = useNavigate();

  const displayName =
    pro.proProfile?.status === "freelance"
      ? pro.name
      : pro.proProfile?.businessName || pro.name;

  const avatarUrl = pro.avatarPro || pro.avatarClient;

  const handleNavigate = () => {
    navigate(`/profile/${pro._id}`);
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col min-h-[180px]">
      <div
        className="flex items-center gap-4 mb-4 cursor-pointer"
        onClick={handleNavigate}
      >
        <Avatar src={avatarUrl} name={displayName} size={64} />

        <div className="flex-1">
          <h2 className="text-lg font-semibold">{displayName}</h2>
          <p className="text-gray-500 text-sm">
            {pro.proProfile?.location || "Localisation inconnue"}
          </p>
          {Array.isArray(pro.proProfile?.services) &&
            pro.proProfile.services.length > 0 && (
              <p className="text-gray-600 text-sm mt-1">
                {pro.proProfile.services.join(", ")}
              </p>
            )}
        </div>
      </div>

      <button
        onClick={() => onFollow && onFollow()}
        className={`mt-auto px-4 py-2 rounded-lg text-sm font-medium transition ${
          isFollowing
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isFollowing ? "Se désabonner" : "S'abonner"}
      </button>
    </div>
  );
}
