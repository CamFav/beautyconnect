import { useEffect, useState } from "react";
import Avatar from "../../../components/ui/Avatar";
import AlertMessage from "../../../components/feedback/AlertMessage";

import { TrendingUp, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContextBase";
import httpClient from "../../../api/http/httpClient";
import { toast } from "react-hot-toast";

export default function FeedSidebar({ selectedCity, posts, cityActive }) {
  const { token } = useAuth();
  const [artistsData, setArtistsData] = useState({ artists: [], top: [] });
  const [randomArtists, setRandomArtists] = useState([]);
  const [following, setFollowing] = useState({});
  const [alert, setAlert] = useState(null);

  const sanitize = (val) =>
    typeof val === "string" ? val.trim().replace(/[<>]/g, "") : "";

  // Récupération des followings si connecté
  useEffect(() => {
    if (!token) return;
    const fetchFollowing = async () => {
      try {
        const { data } = await httpClient.get("/users/me/following");
        if (!data.following || !Array.isArray(data.following)) return;

        const map = {};
        data.following.forEach((id) => (map[id] = true));
        setFollowing(map);
      } catch (err) {
        console.error("Erreur récupération followings :", err);
      }
    };
    fetchFollowing();
  }, [token]);

  const toggleFollow = async (proId) => {
    if (!token) {
      toast.error("Vous devez être connecté pour suivre un artiste.", {
        duration: 4000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
        },
      });
      return;
    }

    try {
      // Ajout du header Authorization avec le token
      const { data } = await httpClient.post(
        `/users/${proId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFollowing((prev) => ({ ...prev, [proId]: data.following }));
    } catch (err) {
      console.error("Erreur API follow/unfollow :", err);
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Une erreur est survenue lors de l’action de suivi.",
      });
    }
  };

  // ================================
  // Construction artistes / top
  // ================================
  useEffect(() => {
    // Si aucun post → on vide les données sidebar
    if (!Array.isArray(posts) || posts.length === 0) {
      setArtistsData({ artists: [], top: [] });
      setRandomArtists([]);
      return;
    }

    const artistsMap = new Map();
    posts.forEach((post) => {
      const provider = post.provider;
      if (provider?._id) artistsMap.set(provider._id, provider);
    });
    const allArtists = Array.from(artistsMap.values());

    const filteredArtists = cityActive
      ? allArtists.filter(
          (pro) =>
            sanitize(pro?.proProfile?.location?.city).toLowerCase() ===
            sanitize(selectedCity).toLowerCase()
        )
      : allArtists;

    const providerLikes = {};
    posts.forEach((post) => {
      const provider = post.provider;
      const providerId = provider?._id;
      if (!providerId) return;

      const providerCity = sanitize(
        provider?.proProfile?.location?.city
      ).toLowerCase();
      if (cityActive && providerCity !== sanitize(selectedCity).toLowerCase())
        return;

      if (!providerLikes[providerId])
        providerLikes[providerId] = { provider, likeCount: 0 };
      providerLikes[providerId].likeCount += Array.isArray(post.likes)
        ? post.likes.length
        : 0;
    });

    const top = Object.values(providerLikes)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 3);

    setArtistsData({ artists: filteredArtists, top });

    if (!cityActive) {
      const shuffled = [...allArtists]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      setRandomArtists(shuffled);
    }
  }, [posts, cityActive, selectedCity]);

  const { artists, top } = artistsData;
  const artistsToDisplay = cityActive ? artists : randomArtists;
  const artistsTitle = cityActive
    ? `Artistes à ${sanitize(selectedCity)}`
    : "Artistes en France";

  // Fonction pour afficher les catégories
  const renderCategories = (pro) => {
    const cats = pro?.proProfile?.categories;
    if (Array.isArray(cats) && cats.length > 0) {
      return cats.slice(0, 2).map(sanitize).join(", ");
    }
    return "-"; // fallback si pas de catégories
  };

  return (
    <aside className="w-full md:w-80 space-y-6">
      {alert && <AlertMessage type={alert.type} message={alert.message} />}

      {/* Bloc Artistes */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3">{artistsTitle}</h3>
        {Array.isArray(artistsToDisplay) && artistsToDisplay.length > 0 ? (
          <ul className="space-y-3">
            {artistsToDisplay.map((pro) => (
              <li
                key={pro._id}
                className="flex items-center justify-between gap-2"
              >
                <Link
                  to={`/profile/${sanitize(pro._id)}`}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 flex-1"
                >
                  <Avatar
                    src={pro.avatarPro || pro.avatarClient || ""}
                    alt={sanitize(pro.name || "Prestataire")}
                    size={40}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">
                      {sanitize(pro.proProfile?.businessName) ||
                        sanitize(pro.name) ||
                        "-"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {renderCategories(pro)}
                    </p>
                  </div>
                </Link>
                <button
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded shrink-0 ${
                    following[pro._id]
                      ? "bg-gray-300 text-gray-700"
                      : "bg-blue-700 text-white"
                  }`}
                  onClick={() => toggleFollow(pro._id)}
                >
                  <UserPlus size={14} />
                  {following[pro._id] ? "Suivi" : "Suivre"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Aucun artiste trouvé.</p>
        )}
      </div>

      {/* Bloc Top artistes */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3">
          Meilleurs de la semaine
        </h3>
        <ul className="space-y-4">
          {Array.isArray(top) &&
            top.map((item, index) => (
              <li key={item.provider._id} className="flex items-center gap-3">
                <div className="text-sm font-bold text-blue-700">
                  #{index + 1}
                </div>
                <Link
                  to={`/profile/${sanitize(item.provider._id)}`}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 flex-1"
                >
                  <Avatar
                    src={
                      item.provider.avatarPro ||
                      item.provider.avatarClient ||
                      ""
                    }
                    alt={sanitize(item.provider.name || "Prestataire")}
                    size={40}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">
                      {sanitize(item.provider.proProfile?.businessName) ||
                        sanitize(item.provider.name) ||
                        "-"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {renderCategories(item.provider)}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 text-xs text-blue-700">
                  <TrendingUp size={14} />
                </div>
              </li>
            ))}
        </ul>
      </div>
    </aside>
  );
}
