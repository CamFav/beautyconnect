import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/account";
const SERVICE_OPTIONS = [
  "Coiffure",
  "Maquillage",
  "Onglerie",
  "Massage",
  "Tatouage",
  "Esthétique",
  "Barber",
];

const clean = (v) =>
  typeof v === "string"
    ? v.trim().replace(/[<>]/g, "").replace(/[\u200B-\u200D\uFEFF]/g, "")
    : v;

export default function ProSettings({ user, token, headers, setMessage }) {
  // ---------- AVATAR PRO ----------
  const [savingAvatarPro, setSavingAvatarPro] = useState(false);
  const [avatarProPreview, setAvatarProPreview] = useState(null);
  const [avatarProFile, setAvatarProFile] = useState(null);

  // ---------- PRO INFOS ----------
  const [savingPro, setSavingPro] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [status, setStatus] = useState("freelance");
  const [exerciseHome, setExerciseHome] = useState(false);
  const [exerciseOutdoor, setExerciseOutdoor] = useState(false);
  const [services, setServices] = useState([]);
  const [locationPro, setLocationPro] = useState("");
  const [siret, setSiret] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    if (!user) return;

    // Prévisualisation avatar
    setAvatarProPreview(user.avatarPro || null);

    // Infos pro
    const p = user.proProfile || {};
    setBusinessName(p.businessName || "");
    setStatus(p.status || "freelance");
    setExerciseHome(
      Array.isArray(p.exerciseType)
        ? p.exerciseType.includes("domicile")
        : false
    );
    setExerciseOutdoor(
      Array.isArray(p.exerciseType)
        ? p.exerciseType.includes("exterieur")
        : false
    );
    setServices(Array.isArray(p.services) ? p.services : []);
    setLocationPro(p.location || "");
    setSiret(p.siret || "");
    setExperience(p.experience || "");
  }, [user]);

  // -------------------------------------------------
  //   AVATAR PRO
  // -------------------------------------------------
  const onAvatarProChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarProFile(file);
    setAvatarProPreview(URL.createObjectURL(file));
  };

  const saveAvatarPro = async (e) => {
    e.preventDefault();
    if (!avatarProFile || !token) return;

    setMessage(null);
    setSavingAvatarPro(true);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarProFile);

      await axios.patch(
        "http://localhost:5000/api/users/pro/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage({ type: "success", text: "Avatar pro mis à jour" });
    } catch (err) {
      console.error(err);
      const text =
        err?.response?.data?.message ||
        "Impossible de mettre à jour l'avatar pro.";
      setMessage({ type: "error", text });
    } finally {
      setSavingAvatarPro(false);
    }
  };

  // -------------------------------------------------
  //   INFOS PRO
  // -------------------------------------------------
  const handleSavePro = async (e) => {
    e.preventDefault();
    if (!token) return;

    setMessage(null);
    setSavingPro(true);

    try {
      const exerciseType = [
        ...(exerciseHome ? ["domicile"] : []),
        ...(exerciseOutdoor ? ["exterieur"] : []),
      ];

      const payload = {
        businessName: clean(businessName),
        status: clean(status),
        exerciseType,
        services,
        location: clean(locationPro),
        siret: clean(siret),
      };

      await axios.patch(`${API_BASE}/pro-profile`, payload, { headers });
      setMessage({ type: "success", text: "Profil professionnel mis à jour" });
    } catch (err) {
      console.error(err);
      const text =
        err?.response?.data?.message ||
        "Impossible de mettre à jour le profil professionnel.";
      setMessage({ type: "error", text });
    } finally {
      setSavingPro(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold">Profil professionnel</h2>
        <p className="text-sm text-gray-500">
          Informations visibles dans votre portfolio pro.
        </p>
      </div>

      {/* Avatar pro */}
      <form
        onSubmit={saveAvatarPro}
        className="px-6 py-4 flex flex-col gap-4 border-b border-gray-100"
      >
        <h3 className="font-medium text-gray-800">Avatar Pro</h3>
        <div className="flex items-center gap-4">
          {avatarProPreview ? (
            <img
              src={avatarProPreview}
              alt="avatar pro preview"
              className="w-16 h-16 rounded-full object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-medium">
              {user?.proProfile?.businessName?.[0]?.toUpperCase() ||
                user?.name?.[0]?.toUpperCase() ||
                "?"}
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={onAvatarProChange}
            className="text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={savingAvatarPro}
          className={`px-4 py-2 rounded text-white ${
            savingAvatarPro ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {savingAvatarPro
            ? "Enregistrement…"
            : "Mettre à jour avatar pro"}
        </button>
      </form>

      {/* Infos pro */}
      <form
        onSubmit={handleSavePro}
        className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom d'entreprise
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="freelance">Freelance</option>
            <option value="salon">Salon</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Lieu d'exercice
          </label>
          <div className="flex items-center gap-6 mt-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={exerciseHome}
                onChange={(e) => setExerciseHome(e.target.checked)}
              />
              <span>Domicile</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={exerciseOutdoor}
                onChange={(e) => setExerciseOutdoor(e.target.checked)}
              />
              <span>Extérieur</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Localisation (pro)
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={locationPro}
            onChange={(e) => setLocationPro(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SIRET</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Expérience
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-100"
            value={experience || "—"}
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Non modifiable après l’inscription
          </p>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium mb-2">Services</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SERVICE_OPTIONS.map((opt) => (
              <label key={opt} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={services.includes(opt)}
                  onChange={() =>
                    setServices((prev) =>
                      prev.includes(opt)
                        ? prev.filter((s) => s !== opt)
                        : [...prev, opt]
                    )
                  }
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            disabled={savingPro}
            className={`px-4 py-2 rounded text-white ${
              savingPro ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {savingPro ? "Enregistrement…" : "Enregistrer (pro)"}
          </button>
        </div>
      </form>
    </section>
  );
}
