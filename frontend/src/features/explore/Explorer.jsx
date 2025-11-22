import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContextBase";
import { getPros, followUser } from "../../api/users/user.service";
import SearchBar from "@/features/explore/components/SearchBar";
import FiltersBar from "@/features/explore/components/FiltersBar";
import LocationFilter from "@/features/feed/components/LocationFilter";
import ProCard from "@/features/explore/components/ProCard";
import AlertMessage from "../../components/feedback/AlertMessage";
import Seo from "@/components/seo/Seo";
import { mapApiErrors } from "@/utils/validators";

export default function Explorer() {
  const { token, user: currentUser } = useAuth();
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [active, setActive] = useState("Tous");
  const [alert, setAlert] = useState(null);

  // --- Localisation ---
  const [locationFilter, setLocationFilter] = useState("all");
  const [typedCity, setTypedCity] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [shouldFilter, setShouldFilter] = useState(false);

  // --- Auto disparition du message ---
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // --- SANITIZE ---
  const sanitize = (val) =>
    typeof val === "string" ? val.trim().replace(/[<>]/g, "") : "";

  // --- Suggestions de villes (API française) ---
  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 3) {
      setCitySuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          query
        )}&type=municipality&limit=5`
      );
      const data = await res.json();
      const suggestions = (data?.features || []).map((item) =>
        sanitize(item.properties.city)
      );
      setCitySuggestions(suggestions);
    } catch (error) {
      console.error("Erreur API ville :", error);
      setAlert({
        type: "warning",
        message: "Impossible de charger les suggestions de ville.",
      });
    }
  };

  // --- Chargement des pros ---
  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        const data = await getPros();

        const onlyPros = data.filter(
          (u) =>
            u.role === "pro" ||
            (u.proProfile &&
              (u.proProfile.businessName?.trim() ||
                (Array.isArray(u.proProfile.services) &&
                  u.proProfile.services.length > 0)))
        );

        setPros(onlyPros);
      } catch (err) {
        console.error("Erreur chargement prestataires:", err);
        const apiErrors = mapApiErrors(err?.response?.data);
        setAlert({
          type: "error",
          message:
            apiErrors._error ||
            "Impossible de charger les prestataires pour le moment.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPros();
  }, []);

  // --- Filtrage ---
  const filtered = useMemo(() => {
    const text = q.toLowerCase();
    const citySanitized = sanitize(selectedCity).toLowerCase();

    return pros.filter((pro) => {
      const businessName = sanitize(
        pro.proProfile?.businessName || pro.name || ""
      );
      const username = sanitize(pro.username || "");
      const location = pro.proProfile?.location
        ? `${sanitize(pro.proProfile.location.address)} ${sanitize(
            pro.proProfile.location.city
          )} ${sanitize(pro.proProfile.location.country)}`
        : "";
      const services = (pro.proProfile?.services || []).map(sanitize).join(" ");

      const haystack =
        `${businessName} ${username} ${location} ${services}`.toLowerCase();
      const okText = text ? haystack.includes(text) : true;

      const okCategory =
        active === "Tous"
          ? true
          : (pro.proProfile?.categories || [])
              .map(sanitize)
              .map((c) => c.toLowerCase())
              .includes(active.toLowerCase());

      const okCity =
        locationFilter === "city" && shouldFilter && citySanitized
          ? sanitize(pro.proProfile?.location?.city || "").toLowerCase() ===
            citySanitized
          : true;

      return okText && okCategory && okCity;
    });
  }, [pros, q, active, locationFilter, selectedCity, shouldFilter]);

  // --- Suivre / Ne plus suivre ---
  const handleFollow = async (proId) => {
    if (!token) {
      setAlert({
        type: "warning",
        message: "Vous devez être connecté pour suivre un prestataire.",
      });
      return;
    }

    if (!proId) return;

    try {
      const result = await followUser(proId);
      setPros((prev) =>
        prev.map((pro) =>
          pro._id === proId
            ? {
                ...pro,
                followers: result.following
                  ? [...(pro.followers || []), currentUser._id]
                  : (pro.followers || []).filter(
                      (id) => id !== currentUser._id
                    ),
              }
            : pro
        )
      );
    } catch (err) {
      console.error("Erreur follow/unfollow :", err);
      const apiErrors = mapApiErrors(err?.response?.data);
      setAlert({
        type: "error",
        message:
          apiErrors._error ||
          "Impossible de suivre ce prestataire pour le moment.",
      });
    }
  };

  return (
    <>
      <Seo
        title="Explorer"
        description="Recherchez des prestataires par spécialité, localisation ou services."
      />
      <div className="relative max-w-6xl mx-auto p-6 space-y-6">
        {/* Message global d’erreur */}
        {alert && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg">
            <AlertMessage type={alert.type} message={alert.message} />
          </div>
        )}

        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Explorer</h1>
          <p className="text-gray-600">
            Découvrez les meilleurs prestataires près de chez vous.
          </p>

          {/* 🔍 Barre de recherche + filtres */}
          <SearchBar value={q} onChange={setQ} />
          <FiltersBar active={active} onChange={setActive} />

          {/* 🌍 Filtre de localisation */}
          <LocationFilter
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            typedCity={typedCity}
            setTypedCity={setTypedCity}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            citySuggestions={citySuggestions}
            setCitySuggestions={setCitySuggestions}
            fetchCitySuggestions={fetchCitySuggestions}
            setShouldFilter={setShouldFilter}
          />
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">Aucun prestataire trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered
              .filter((pro) => !!pro.proProfile)
              .map((pro) => (
                <ProCard
                  key={pro._id}
                  pro={pro}
                  isFollowing={pro.followers?.includes(currentUser?._id)}
                  onFollow={() => handleFollow(pro._id)}
                />
              ))}
          </div>
        )}
      </div>
    </>
  );
}
