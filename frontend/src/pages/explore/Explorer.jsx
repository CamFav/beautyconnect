import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPros, followUser } from "../../api/user.service";
import SearchBar from "../../components/explorer/SearchBar";
import FiltersBar from "../../components/explorer/FiltersBar";
import ProCard from "../../components/explorer/ProCard";

export default function Explorer() {
  const { token, user: currentUser } = useAuth();
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [active, setActive] = useState("Tous");
  const [following, setFollowing] = useState({});

  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        const data = await getPros();

        // garde uniquement les comptes pros (ceux qui ont un proProfile)
        const onlyPros = data.filter(
          (u) =>
            u.role === "pro" ||
            (u.proProfile &&
              (u.proProfile.businessName?.trim() ||
                (Array.isArray(u.proProfile.services) &&
                  u.proProfile.services.length > 0)))
        );

        setPros(onlyPros);

        const map = {};
        data.forEach((u) => {
          map[u._id] = !!u.followers?.includes?.(currentUser?._id);
        });
        setFollowing(map);
      } catch (err) {
        console.error("Erreur chargement prestataires:", err);
      }
      setLoading(false);
    };

    fetchPros();
  }, [currentUser?._id]);

  const filtered = useMemo(() => {
    const text = q.toLowerCase();
    const service = active !== "Tous" ? active.toLowerCase() : "";

    return pros.filter((pro) => {
      const haystack = `
        ${pro.proProfile?.businessName || pro.name || ""}
        ${pro.username || ""}
        ${pro.proProfile?.location || ""}
        ${(pro.proProfile?.services || []).join(" ")}
      `.toLowerCase();

      const okText = text ? haystack.includes(text) : true;
      const okService = service
        ? (pro.proProfile?.services || [])
            .map((s) => s.toLowerCase())
            .includes(service)
        : true;

      return okText && okService;
    });
  }, [pros, q, active]);

  const handleFollow = async (proId) => {
    try {
      if (!token)
        return alert("Vous devez être connecté pour suivre quelqu'un.");

      const result = await followUser(proId);

      setPros((prev) =>
        prev.map((pro) =>
          pro._id === proId
            ? {
                ...pro,
                followers: result.following
                  ? [...(pro.followers || []), currentUser._id]
                  : pro.followers.filter((id) => id !== currentUser._id),
              }
            : pro
        )
      );
    } catch (err) {
      console.error("Erreur follow/unfollow :", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Explorer</h1>
        <p className="text-gray-600">
          Découvrez les meilleurs prestataires près de chez vous.
        </p>
        <SearchBar value={q} onChange={setQ} />
        <FiltersBar active={active} onChange={setActive} />
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
  );
}
