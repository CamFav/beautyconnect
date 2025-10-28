import { useAuth } from "../../../../context/AuthContextBase";
import { useState, useEffect } from "react";
import httpClient from "../../../../api/http/httpClient";
import { followUser } from "../../../../api/users/user.service";

import ProProfileHeader from "./ProProfileHeader";
import ProProfilePost from "./ProProfilePost";
import ProProfileServicesBooking from "./ProProfileServicesBooking";
import { toast } from "react-hot-toast";

export default function ProProfileView({ user }) {
  const { user: currentUser, token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [publicServices, setPublicServices] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(
    user.followers?.length || 0
  );

  // === Détection fiable du propriétaire du profil ===
  const isOwner =
    currentUser?._id === user._id || currentUser?.proProfile?._id === user._id;

  // === Récupération des publications ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await httpClient.get(`/posts`, {
          params: { provider: user._id },
        });
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error("Erreur chargement posts :", err);
      }

      if (currentUser && user.followers?.includes(currentUser._id)) {
        setIsFollowing(true);
      }
    };

    if (user?._id) fetchData();
  }, [user, currentUser]);

  // === Récupération des services publics ===
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await httpClient.get(`/pro/${user._id}/services/public`);
        setPublicServices(res.data || []);
      } catch (error) {
        console.error("Erreur chargement services publics :", error);
        setPublicServices([]);
      }
    };

    if (user?._id) fetchServices();
  }, [user]);

  // === Gestion Follow / Unfollow ===
  const handleFollow = async () => {
    if (!token) {
      toast.error("Vous devez être connecté pour vous abonner.", {
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
      const result = await followUser(user._id);
      setIsFollowing(result.following);
      setFollowersCount(result.followersCount);
    } catch (err) {
      console.error("Erreur follow/unfollow:", err);
    }
  };

  // === Rendu principal ===
  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      aria-label={`Profil professionnel de ${
        user.proProfile?.salonName || user.name
      }`}
      className="max-w-4xl mx-auto p-6 space-y-10 bg-gray-50 min-h-screen focus:outline-none"
    >
      {/* === En-tête du profil Pro === */}
      <ProProfileHeader
        user={user}
        isOwner={isOwner}
        isFollowing={isFollowing}
        followersCount={followersCount}
        onFollow={handleFollow}
      />

      {/* === Liste des services (avec réservation publique) === */}
      <ProProfileServicesBooking
        publicServices={publicServices}
        user={user}
        currentUser={currentUser}
        requireLoginForBooking={true}
      />

      {/* === Publications du professionnel === */}
      <section aria-label="Publications du professionnel">
        <ProProfilePost
          posts={posts}
          visiblePosts={showAll ? posts : posts.slice(0, 3)}
          showAll={showAll}
          setShowAll={setShowAll}
          selectedPost={selectedPost}
          setSelectedPost={setSelectedPost}
          handleUpdatePost={(updated) => {
            if (updated.deleted) {
              setPosts((prev) => prev.filter((p) => p._id !== updated._id));
              setSelectedPost(null);
            } else {
              setPosts((prev) =>
                prev.map((p) =>
                  p._id === updated._id ? { ...p, ...updated } : p
                )
              );
              setSelectedPost((prev) =>
                prev && prev._id === updated._id
                  ? { ...prev, ...updated }
                  : prev
              );
            }
          }}
          isOwner={isOwner}
        />
      </section>
    </main>
  );
}
