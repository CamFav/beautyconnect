import { useRef, useState, useContext, useEffect } from "react";
import {
  Briefcase,
  Clock,
  MapPin,
  Camera,
  Pencil,
  X,
  Users,
  Home,
} from "lucide-react";
import Avatar from "../../../../components/ui/Avatar";
import httpClient from "../../../../api/http/httpClient";
import { AuthContext } from "../../../../context/AuthContextBase";

export default function ProProfileHeader({
  user,
  isOwner,
  isFollowing,
  followersCount = 0,
  onFollow,
}) {
  const { token, setUser } = useContext(AuthContext);

  const [headerPreview, setHeaderPreview] = useState(
    user?.proProfile?.headerImage || null
  );
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarPro || null);
  const [uploading, setUploading] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);

  const headerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    setHeaderPreview(user?.proProfile?.headerImage || null);
    setAvatarPreview(user?.avatarPro || null);
  }, [user]);

  const displayName = (
    user?.proProfile?.businessName ||
    user?.name ||
    ""
  ).trim();
  const { status, experience, location, exerciseType } =
    user?.proProfile || {};

  const statusText =
    status === "freelance"
      ? "Freelance"
      : status === "salon"
      ? "En salon"
      : null;

  const experienceText =
    experience && experience !== "Non renseignée" ? experience : null;

  const exerciseBadges =
    status === "freelance" && Array.isArray(exerciseType)
      ? [
          exerciseType.includes("domicile") && {
            key: "domicile",
            label: "Domicile",
            description: "Se déplace uniquement chez le client.",
          },
          exerciseType.includes("exterieur") && {
            key: "exterieur",
            label: "Extérieur",
            description: "Se déplace où vous le souhaitez.",
          },
        ].filter(Boolean)
      : [];

  const handleImageUpload = async (file, type) => {
    if (!file || !token) return;
    const formData = new FormData();
    formData.append(type, file);
    setUploading(true);

    try {
      const endpoint =
        type === "header" ? "/account/pro/header" : "/users/pro/avatar";

      const res = await httpClient.patch(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (type === "header" && res?.data?.headerImage) {
        setHeaderPreview(`${res.data.headerImage}?t=${Date.now()}`);
      } else if (type === "avatar") {
        const newAvatar = res?.data?.user?.avatarPro;
        if (newAvatar) setAvatarPreview(`${newAvatar}?t=${Date.now()}`);
      }

      const me = await httpClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (me?.data) {
        if (me.data.proProfile?.headerImage)
          me.data.proProfile.headerImage += `?t=${Date.now()}`;
        if (me.data.avatarPro) me.data.avatarPro += `?t=${Date.now()}`;
        setUser(me.data);
      }
    } catch (err) {
      console.error("Erreur upload:", err?.response?.data || err.message);
    } finally {
      setUploading(false);
      setShowEditMenu(false);
    }
  };

  const onHeaderChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeaderPreview(URL.createObjectURL(file));
    handleImageUpload(file, "header");
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    handleImageUpload(file, "avatar");
  };

  const locationText = (() => {
    if (!location) return "";
    const address = (location.address || "").trim();
    const city = (location.city || "").trim();

    if (address && city) {
      if (address.toLowerCase().includes(city.toLowerCase())) {
        return address;
      }
      return `${address}, ${city}`;
    }
    if (city) return city;
    if (address) return address;
    return "";
  })();

  return (
    <div className="relative w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER IMAGE */}
      <div className="relative h-48 bg-gray-100">
        {headerPreview ? (
          <img
            src={headerPreview}
            alt="Bannière"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Aucune bannière
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {isOwner && (
          <>
            <button
              onClick={() => setShowEditMenu((p) => !p)}
              className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition"
              title="Modifier le profil"
            >
              {showEditMenu ? <X size={16} /> : <Pencil size={16} />}
            </button>

            {showEditMenu && (
              <div className="absolute top-12 right-3 bg-white border border-gray-200 rounded-md shadow-md w-44 z-20 animate-fadeIn">
                <button
                  onClick={() => headerInputRef.current?.click()}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Camera size={14} /> Modifier la bannière
                </button>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Camera size={14} /> Modifier l’avatar
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* AVATAR SEUL (superposé) */}
      <div className="relative z-10 flex justify-center sm:justify-start px-6 -mt-10">
        <Avatar
          src={avatarPreview}
          name={displayName}
          size={100}
          className="border-4 border-white shadow-md rounded-full"
        />
      </div>

      {/* INFOS TEXTE EN DESSOUS */}
      <div className="px-6 pt-3 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-gray-900 break-words leading-tight">
            {displayName}
          </h1>

          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm text-gray-600 mt-2">
            {statusText && (
              <span className="flex items-center gap-1">
                <Briefcase size={14} /> {statusText}
              </span>
            )}
            {experienceText && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> {experienceText}
              </span>
            )}
            {locationText && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {locationText}
              </span>
            )}
            {exerciseBadges.length > 0 && (
              <span className="flex items-center gap-2">
                <Home
                  size={14}
                  className="text-blue-600"
                  aria-hidden="true"
                />
                <div
                  className="flex flex-wrap gap-2 text-xs"
                  aria-label="Modes d'intervention"
                >
                  {exerciseBadges.map((badge) => (
                    <span
                      key={badge.key}
                      className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold"
                      title={badge.description}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={14} />
              <span className="text-gray-700">
                {followersCount} abonné{followersCount > 1 ? "s" : ""}
              </span>
            </span>
          </div>
        </div>

        {!isOwner && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
            <button
              onClick={() =>
                document
                  .getElementById("offres")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
            >
              Réserver
            </button>
            <button
              onClick={onFollow}
              className={`w-full sm:w-auto px-4 py-2 rounded-md text-white text-sm font-medium transition ${
                isFollowing
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isFollowing ? "Se désabonner" : "S'abonner"}
            </button>
          </div>
        )}
      </div>

      {uploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm backdrop-blur-[2px]">
          Upload en cours...
        </div>
      )}

      <input
        ref={headerInputRef}
        type="file"
        accept="image/*"
        onChange={onHeaderChange}
        className="hidden"
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={onAvatarChange}
        className="hidden"
      />
    </div>
  );
}

