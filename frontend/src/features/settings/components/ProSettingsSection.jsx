import { useEffect, useRef, useState } from "react";
import httpClient from "../../../api/http/httpClient";
import Avatar from "../../../components/ui/Avatar";
import StickyFooterButton from "../../../components/ui/StickyFooterButton";
import { Briefcase, Layers } from "lucide-react";
import AddressField from "@/components/forms/AddressField";
import { validateName, messages } from "../../../utils/validators";

const clean = (v) =>
  typeof v === "string"
    ? v
        .trim()
        .replace(/[<>]/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
    : v;

export default function ProSettingsSection({
  user,
  token,
  headers,
  setMessage,
}) {
  const fileInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [status, setStatus] = useState("freelance");
  const [siret, setSiret] = useState("");
  const [experience, setExperience] = useState("");
  const [exerciseType, setExerciseType] = useState([]);
  const [categories, setCategories] = useState([]);
  const [location, setLocation] = useState({
    address: "",
    city: "",
    country: "France",
    latitude: null,
    longitude: null,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const CATEGORY_OPTIONS = ["Coiffure", "Esthétique", "Tatouage", "Maquillage"];

  // --- Init user data ---
  useEffect(() => {
    if (!user) return;
    const p = user.proProfile || {};

    setAvatarPreview(user.avatarPro || null);
    setBusinessName(p.businessName || "");
    setStatus(p.status || "freelance");
    setSiret(p.siret || "");
    setExperience(p.experience || "");
    setExerciseType(Array.isArray(p.exerciseType) ? p.exerciseType : []);
    setCategories(Array.isArray(p.categories) ? p.categories : []);
    setLocation({
      address: p.location?.address || p.location?.label || "",
      city: p.location?.city || "",
      country: p.location?.country || "France",
      latitude: p.location?.latitude || null,
      longitude: p.location?.longitude || null,
    });
    setHasChanges(false);
  }, [user]);

  // --- Avatar ---
  const onAvatarClick = () => fileInputRef.current?.click();

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setHasChanges(true);
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    try {
      await httpClient.patch("/users/pro/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    } catch {
      throw new Error("Impossible de mettre à jour l’avatar pro.");
    }
  };

  // --- Toggle helpers ---
  const toggleExercise = (type) => {
    setExerciseType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setHasChanges(true);
  };

  const toggleCategory = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setHasChanges(true);
  };

  const validateBusinessName = () => {
    if (!validateName(businessName)) {
      setMessage({
        type: "error",
        text: messages.name.replace(
          "prénom et éventuellement un nom",
          "nom d’entreprise (ex : Studio & 2000 Camillé)"
        ),
      });
      return false;
    }
    return true;
  };

  // --- Save ---
  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setMessage(null);

    if (!validateBusinessName()) {
      setSaving(false);
      return;
    }

    const payload = {
      businessName: clean(businessName),
      status,
      exerciseType,
      categories,
      location: {
        address: clean(location.address),
        city: clean(location.city),
        country: location.country || "France",
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };

    try {
      await httpClient.patch("/account/pro-profile", payload, { headers });
      if (avatarFile) await saveAvatar();
      setMessage({ type: "success", text: "Profil professionnel mis à jour." });
      setHasChanges(false);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Impossible de mettre à jour le profil professionnel.",
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Cancel ---
  const handleCancel = () => {
    const p = user.proProfile || {};
    setAvatarPreview(user.avatarPro || null);
    setBusinessName(p.businessName || "");
    setStatus(p.status || "freelance");
    setExerciseType(Array.isArray(p.exerciseType) ? p.exerciseType : []);
    setCategories(Array.isArray(p.categories) ? p.categories : []);
    setLocation({
      address: p.location?.address || "",
      city: p.location?.city || "",
      country: p.location?.country || "France",
      latitude: p.location?.latitude || null,
      longitude: p.location?.longitude || null,
    });
    setHasChanges(false);
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Profil professionnel
      </h2>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div
          role="button"
          tabIndex={0}
          onClick={onAvatarClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onAvatarClick();
          }}
          className="cursor-pointer focus:ring-2 focus:ring-blue-400 rounded-full"
          title="Changer l'avatar professionnel"
        >
          <Avatar
            src={avatarPreview}
            name={user?.proProfile?.businessName || user?.name}
            email={user?.email}
            size={90}
            className="border"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onAvatarChange}
          className="hidden"
        />
        <p className="text-sm text-gray-600 text-center">
          Cliquez sur l'avatar pour sélectionner un fichier
        </p>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nom entreprise */}
        <div>
          <label
            htmlFor="businessName"
            className="block text-sm font-medium mb-1"
          >
            Nom d’entreprise
          </label>
          <div className="relative">
            <Briefcase
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Ex : Studio & 2000 Camillé"
              className={`w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-200 ${
                businessName && !validateName(businessName)
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* SIRET */}
        <div>
          <label htmlFor="siret" className="block text-sm font-medium mb-1">
            SIRET
          </label>
          <input
            id="siret"
            type="text"
            value={siret}
            readOnly
            className="w-full border border-gray-200 bg-gray-50 text-gray-600 rounded-lg px-3 py-2 cursor-not-allowed"
          />
        </div>

        {/* Expérience */}
        <div>
          <label
            htmlFor="experience"
            className="block text-sm font-medium mb-1"
          >
            Expérience
          </label>
          <input
            id="experience"
            type="text"
            value={experience || "—"}
            readOnly
            className="w-full border border-gray-200 bg-gray-50 text-gray-600 rounded-lg px-3 py-2 cursor-not-allowed"
          />
        </div>

        {/* Adresse */}
        <AddressField
          label="Adresse professionnelle"
          initialValue={location.address}
          onSelectAddress={(addr) => {
            setLocation(addr);
            setHasChanges(true);
          }}
        />
      </div>

      {/* Lieux et catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <div>
          <label
            htmlFor="exerciseType"
            className="flex items-center gap-1 text-sm font-medium mb-2"
          >
            <Layers size={16} /> Lieux d’exercice
          </label>
          <div id="exerciseType" className="flex flex-wrap gap-2">
            {["domicile", "exterieur"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleExercise(type)}
                className={`px-3 py-1.5 rounded-md text-sm border transition ${
                  exerciseType.includes(type)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {type === "domicile" ? "Domicile" : "Extérieur"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="categories"
            className="flex items-center gap-1 text-sm font-medium mb-2"
          >
            <Layers size={16} /> Catégories
          </label>
          <div id="categories" className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-sm border transition ${
                  categories.includes(cat)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky save/cancel */}
      {hasChanges && (
        <StickyFooterButton
          label={saving ? "Enregistrement..." : "Enregistrer"}
          onClick={handleSave}
          disabled={saving}
        >
          <button
            type="button"
            onClick={handleCancel}
            className="ml-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </button>
        </StickyFooterButton>
      )}
    </section>
  );
}
