import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

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

export default function Settings() {
  
  const { user, token, setUser } = useContext(AuthContext);

  const [savingClient, setSavingClient] = useState(false);
  const [savingPro, setSavingPro] = useState(false);
  const [message, setMessage] = useState(null);

  // 1) ÉTATS CLIENT
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [locationClient, setLocationClient] = useState("");

  // 2) ÉTATS PRO 
  const [businessName, setBusinessName] = useState("");
  const [status, setStatus] = useState("freelance"); // 'salon' ou 'freelance'
  const [exerciseHome, setExerciseHome] = useState(false); // domicile
  const [exerciseOutdoor, setExerciseOutdoor] = useState(false); // exterieur
  const [services, setServices] = useState([]); // array<string>
  const [locationPro, setLocationPro] = useState("");
  const [siret, setSiret] = useState("");
  const [experience, setExperience] = useState(""); // read-only

  // Rôle actif
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
    setExperience(p.experience || ""); // lecture seule
  }, [user]);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // handlers services
  const toggleService = (label) => {
    setServices((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  // client
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

      // 
      setUser((prev) => ({
        ...prev,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
      }));

      setMessage({ type: "success", text: "Profil client mis à jour" });
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

  // 
  const handleSavePro = async (e) => {
    e.preventDefault();
    console.log("handleSavePro déclenché");
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

      console.log("Payload envoyé :", payload);
      console.log("Token utilisé :", token);
      console.log("headers envoyés :", headers);
      console.log("URL :", `${API_BASE}/pro-profile`);

      const { data } = await axios.patch(
        `${API_BASE}/pro-profile`,
        payload,
        {
          headers,
        }
      );

      // maj du contexte
      setUser((prev) => ({
        ...prev,
        proProfile: {
          ...prev.proProfile,
          ...payload,
        },
      }));

      setMessage({
        type: "success",
        text: "Profil professionnel mis à jour ✅",
      });
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
        {/* ... (inchangé) */}
      </section>

      {/* ----------- FORMULAIRE PRO ----------- */}
      {activeRole === "pro" && (
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        </section>
      )}
    </div>
  );
}
