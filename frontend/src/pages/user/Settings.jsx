import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const API_BASE = "http://localhost:5000/api/account";

// Options de services
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

// Composant
export default function Settings() {
  const { user, token } = useContext(AuthContext);
  const [savingClient, setSavingClient] = useState(false);
  const [savingPro, setSavingPro] = useState(false);
  const [message, setMessage] = useState(null);

  // 1) ÉTATS CLIENT
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [phone, setPhone] = useState("");
  const [locationClient, setLocationClient] = useState("");

  // 2) ÉTATS PRO (dans user.proProfile)
  const [businessName, setBusinessName] = useState("");
  const [status, setStatus] = useState("freelance"); // 'salon' | 'freelance'
  const [exerciseHome, setExerciseHome] = useState(false); // domicile
  const [exerciseOutdoor, setExerciseOutdoor] = useState(false); // exterieur
  const [services, setServices] = useState([]); // array<string>
  const [locationPro, setLocationPro] = useState("");
  const [siret, setSiret] = useState("");
  const [experience, setExperience] = useState(""); // read-only

  const activeRole = user?.activeRole ?? "client";

  // Synchronise les formulaires quand user change
  useEffect(() => {
    if (!user) return;

    // Champs client (racine)
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setLocationClient(user.location || "");

    // Champs pro (proProfile)
    const p = user.proProfile || {};
    setBusinessName(p.businessName || "");
    setStatus(p.status || "freelance");
    setExerciseHome(Array.isArray(p.exerciseType) ? p.exerciseType.includes("domicile") : false);
    setExerciseOutdoor(Array.isArray(p.exerciseType) ? p.exerciseType.includes("exterieur") : false);
    setServices(Array.isArray(p.services) ? p.services : []);
    setLocationPro(p.location || "");
    setSiret(p.siret || "");
    setExperience(p.experience || ""); // lecture seule
  }, [user]);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // ---- handlers services (checkboxes)
  const toggleService = (label) => {
    setServices((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  // ---- SUBMIT CLIENT
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!token) return;

    setMessage(null);
    setSavingClient(true);
    try {
      const payload = {
        name: clean(name),
        email: clean(email),
        phone: clean(phone),
        location: clean(locationClient),
      };

      const { data } = await axios.patch(`${API_BASE}/profile`, payload, {
        headers,
      });

      setMessage({ type: "success", text: "Profil client mis à jour " });
      // Option : rafraîchir user via /me côté AuthContext (si nécessaire)
      // Ici, on suppose que /me est rechargé ailleurs ou que la page suffit.
    } catch (err) {
      console.error(err);
      const text =
        err?.response?.data?.message ||
        "Impossible de mettre à jour le profil client.";
      setMessage({ type: "error", text });
    } finally {
      setSavingClient(false);
    }
  };

  // ---- SUBMIT PRO
  const handleSavePro = async (e) => {
  e.preventDefault();
  console.log("handleSavePro déclenché !");
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
        // experience non modifiable, NE l’envoie pas
      };

    console.log("Payload envoyé :", payload);
    console.log("Token utilisé :", token);
    console.log("Headers envoyés :", headers);
    console.log("URL :", `${API_BASE}/pro-profile`);

    const { data } = await axios.patch(`${API_BASE}/pro-profile`, payload, {
        headers,
      });

      setMessage({ type: "success", text: "Profil professionnel mis à jour ✅" });
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

  if (!user) return <p className="text-center py-8">Chargement…</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-600">
          Rôle actif : <b>{activeRole}</b>
        </p>
      </header>

      {/* Messages globaux */}
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ----------- FORMULAIRE CLIENT ----------- */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold">Profil client</h2>
          <p className="text-sm text-gray-500">
            Ces informations sont utilisées pour votre compte (hors portfolio pro).
          </p>
        </div>

        <form onSubmit={handleSaveClient} className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
            
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Localisation (client)</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={locationClient}
              onChange={(e) => setLocationClient(e.target.value)}
              placeholder="Ville / Zone"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={savingClient}
              className={`px-4 py-2 rounded ${
                savingClient ? "bg-gray-300" : "bg-gray-900 hover:bg-black"
              } text-white`}
            >
              {savingClient ? "Enregistrement…" : "Enregistrer (client)"}
            </button>
          </div>
        </form>
      </section>

      {/* ----------- FORMULAIRE PRO ----------- */}
      {activeRole === "pro" && (
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold">Profil professionnel</h2>
          <p className="text-sm text-gray-500">
            Ces informations apparaissent sur votre portfolio pro.
          </p>
        </div>

        <form onSubmit={handleSavePro} className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Nom d'entreprise</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Salon Belle & Zen"
            />
          </div>

          <div className="col-span-1">
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

          {/* Exercice : domicile / extérieur*/}
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Lieu d’exercice</label>
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
            <p className="text-xs text-gray-500 mt-1">
              Vous pouvez cocher les deux.
            </p>
          </div>

          {/* Localisation pro */}
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Localisation (pro)</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={locationPro}
              onChange={(e) => setLocationPro(e.target.value)}
              placeholder="Ville / Zone"
            />
          </div>

          {/* SIRET */}
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">SIRET</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              placeholder="123 456 789 00012"
            />
          </div>

          {/* Experience */}
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Expérience</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 bg-gray-100"
              value={experience || "—"}
              readOnly
              title="L'expérience ne peut pas être modifiée après l'inscription."
            />
            <p className="text-xs text-gray-500 mt-1">
              Non modifiable après l’inscription.
            </p>
          </div>

          {/* Services*/}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2">Services</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SERVICE_OPTIONS.map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={services.includes(opt)}
                    onChange={() => toggleService(opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cochez un ou plusieurs services proposés.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={savingPro}
              className={`px-4 py-2 rounded ${
                savingPro ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {savingPro ? "Enregistrement…" : "Enregistrer (pro)"}
            </button>
          </div>
        </form>
      </section>
      )}
    </div>
    
  );
}
