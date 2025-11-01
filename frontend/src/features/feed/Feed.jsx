import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContextBase";
import { getPosts, likePost, favoritePost } from "@/api/posts/post.service";
import FeedFiltersBar from "./components/FeedFiltersBar";
import FeedSidebar from "./components/FeedSidebar";
import LocationFilter from "./components/LocationFilter";
import PostList from "./components/PostList";
import PostModal from "../../components/feedback/PostModal";
import AlertMessage from "../../components/feedback/AlertMessage";
import { toast } from "react-hot-toast";
import Seo from "@/components/seo/Seo";

/**
 * Feed – Flux principal des publications
 */

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [locationFilter, setLocationFilter] = useState("all");

  const { user, token } = useAuth();

  const [typedCity, setTypedCity] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [shouldFilter, setShouldFilter] = useState(false);

  const [modalPost, setModalPost] = useState(null);
  const openModal = (post) => setModalPost(post);
  const closeModal = () => setModalPost(null);

  const [alert, setAlert] = useState(null);
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const sanitize = (val) =>
    typeof val === "string" ? val.trim().replace(/[<>]/g, "") : "";

  // === Récupération des posts ===
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        let fetchedPosts = Array.isArray(data.posts) ? data.posts : data;

        // Filtre de localisation (ville)
        if (locationFilter === "city" && shouldFilter && selectedCity) {
          const citySanitized = sanitize(selectedCity).toLowerCase();
          fetchedPosts = fetchedPosts.filter(
            (p) =>
              sanitize(
                p.provider?.proProfile?.location?.city || ""
              ).toLowerCase() === citySanitized
          );
        }

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Erreur récupération posts:", error);
        setAlert({
          type: "error",
          message: "Impossible de charger les publications pour le moment.",
        });
      }
    };

    fetchPosts();
  }, [locationFilter, shouldFilter, selectedCity]);

  // === Filtrage combiné : catégorie + ville ===
  useEffect(() => {
    let result = [...posts];
    if (activeCategory !== "Tous") {
      result = result.filter((p) => {
        const categories =
          p.provider?.proProfile?.categories?.map((c) =>
            c.toLowerCase().trim()
          ) || [];
        return categories.includes(activeCategory.toLowerCase());
      });
    }
    setFilteredPosts(result);
  }, [posts, activeCategory]);

  // === Like ===
  const handleLike = async (postId) => {
    if (!token) {
      toast.error("Vous devez être connecté pour liker un post.", {
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
      const updated = await likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: updated.liked
                  ? [...(p.likes || []), user._id]
                  : (p.likes || []).filter((id) => id !== user._id),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Erreur like:", err);
      setAlert({
        type: "error",
        message: "Une erreur est survenue lors du like.",
      });
    }
  };

  // === Favoris ===
  const handleFavorite = async (postId) => {
    if (!token) {
      toast.error("Vous devez être connecté pour ajouter un favori.", {
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
      const updated = await favoritePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                favorites: updated.favorited
                  ? [...(p.favorites || []), user._id]
                  : (p.favorites || []).filter((id) => id !== user._id),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Erreur favori:", err);
      setAlert({
        type: "error",
        message: "Une erreur est survenue lors de l’ajout en favori.",
      });
    }
  };

  // === Suggestions de villes ===
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

  return (
    <>
      <Seo
        title="Fil d’actualités"
        description="Explorez les publications des professionnels de la beauté et trouvez l’inspiration."
      />

      <main
        id="main-content"
        role="main"
        aria-label="Fil d’actualités BeautyConnect"
        tabIndex={-1}
        className="relative max-w-6xl mx-auto p-6 flex flex-col md:flex-row gap-6 focus:outline-none"
      >
        <h1 className="sr-only">Fil d’actualités BeautyConnect</h1>

        {/* Message global d’erreur (visuel + lecteur d’écran) */}
        {alert && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg"
            role="alert"
            aria-live="assertive"
          >
            <AlertMessage type={alert.type} message={alert.message} />
          </div>
        )}

        <section
          aria-labelledby="filters-title"
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <h2 id="filters-title" className="sr-only">
            Filtres de recherche
          </h2>

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

          <FeedFiltersBar
            active={activeCategory}
            onChange={setActiveCategory}
          />

          <section
            aria-labelledby="posts-title"
            className="flex-1 overflow-auto no-scrollbar"
          >
            <h2 id="posts-title" className="sr-only">
              Liste des publications
            </h2>
            <PostList
              posts={filteredPosts}
              user={user}
              handleLike={handleLike}
              handleFavorite={handleFavorite}
              handleImageClick={openModal}
            />
          </section>
        </section>

        {/* Sidebar droite */}
        <aside
          className="hidden md:block w-80 self-start"
          aria-labelledby="sidebar-title"
        >
          <h2 id="sidebar-title" className="sr-only">
            Suggestions et statistiques du flux
          </h2>
          <FeedSidebar
            key={activeCategory}
            selectedCity={selectedCity}
            posts={filteredPosts}
            cityActive={locationFilter === "city" && shouldFilter}
          />
        </aside>

        {/* Modal de publication */}
        {modalPost && (
          <PostModal
            post={modalPost}
            isOpen={!!modalPost}
            onClose={closeModal}
            onUpdate={(updatedPost) => {
              if (!updatedPost) return;
              setPosts((prev) =>
                prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
              );
            }}
          />
        )}
      </main>
    </>
  );
}
