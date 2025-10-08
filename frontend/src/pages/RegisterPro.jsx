import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RegisterPro() {
  const { handleRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  // Infos de compte 
  const [account, setAccount] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Wizard / étapes
  const [step, setStep] = useState(1);

  // Données  PRO
  const [activityType, setActivityType] = useState(""); // "salon" | "freelance"
  const [salonName, setSalonName] = useState("");

  const [freelanceAtHome, setFreelanceAtHome] = useState(false);
  const [freelanceOutdoor, setFreelanceOutdoor] = useState(false);

  const [experience, setExperience] = useState(""); // "<1", ">2", ">5"
  const [siret, setSiret] = useState("");

  // Champs requis par l’API 
  const [location, setLocation] = useState(""); // obligatoire
  const [services, setServices] = useState(""); // input texte "Coiffure, Maquillage"

  // Validations 
  const canGoNext = () => {
    if (!account.name || !account.email || !account.password) return false;

    switch (step) {
      case 1:
        return activityType === "salon" || activityType === "freelance";
      case 2:
        if (activityType === "salon") return salonName.trim().length > 1;
        if (activityType === "freelance") {
          return freelanceAtHome || freelanceOutdoor;
        }
        return false;
      case 3:
        return ["<1 an", "2+ ans", "5+ ans"].includes(experience);
      case 4:
        return siret.trim().length >= 8; // s(fictif)
      case 5:
        return location.trim().length > 1;
      case 6:
        // services -> au moins 1 service après split / trim
        const arr = services
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        return arr.length >= 1;
      default:
        return false;
    }
  };

  const onNext = () => {
    if (!canGoNext()) return;
    setStep((s) => Math.min(6, s + 1));
  };

  const onBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const submitPro = async () => {
  const servicesArray = services
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const businessName =
    activityType === "salon"
      ? salonName.trim()
      : `Freelance${freelanceAtHome ? " - domicile" : ""}${
          freelanceOutdoor ? " - extérieur" : ""
        }`.trim();

  const payload = {
    name: account.name,
    email: account.email,
    password: account.password,
    role: "pro",
    businessName,
    siret: siret.trim(),
    location: location.trim(),
    services: servicesArray,
    status: activityType,
    exerciseType: [
      ...(freelanceAtHome ? ["domicile"] : []),
      ...(freelanceOutdoor ? ["exterieur"] : []),
    ],
    experience: experience, // "<1 an", "2+ ans", "5+ ans"
  };

  try {
    console.log("Payload envoyé :", payload);
    await handleRegister(payload);
    alert("Inscription pro réussie !");
    navigate("/login");
  }   catch (err) {

console.error("Erreur REGISTER complète :", err?.response?.data);

  const fullError = err?.response?.data;
  console.error("Erreur REGISTER complète :", fullError);

  if (fullError?.errors) {
    console.error("Première erreur :", fullError.errors[0]);
  }

  alert("Erreur lors de l'inscription pro");
}
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-end">
        <Link to="/home" className="text-sm text-gray-700 hover:underline">
          Accéder au site
        </Link>
      </header>

      {/* Contenu */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : compte */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Créez votre compte professionnel
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom / Prénom
                  </label>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                    value={account.name}
                    onChange={(e) =>
                      setAccount({ ...account, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                    value={account.email}
                    onChange={(e) =>
                      setAccount({ ...account, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                    value={account.password}
                    onChange={(e) =>
                      setAccount({ ...account, password: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="text-xs text-gray-500">
                  Votre compte sera créé avec le rôle <b>professionnel</b>.
                </div>

                <div className="pt-2 text-sm">
                  <Link to="/register" className="text-blue-600 hover:underline">
                    Plutôt un client ? Créer un compte client
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite*/}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
              {/* En-tête */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Informations professionnelles</h3>
                <div className="text-sm text-gray-600">
                  Étape <b>{step}</b> / 6
                </div>
              </div>

              {/* Étapes */}
              <div className="space-y-6">
                {step === 1 && (
                  <div>
                    <p className="mb-4 text-gray-700">
                      Choisissez votre type d’activité :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setActivityType("salon")}
                        className={`border rounded p-4 text-left hover:bg-gray-50 ${
                          activityType === "salon"
                            ? "border-blue-600 ring-1 ring-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="font-medium">Je travaille dans un salon</div>
                        <div className="text-sm text-gray-500">
                          Vous faites partie d’un établissement
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActivityType("freelance")}
                        className={`border rounded p-4 text-left hover:bg-gray-50 ${
                          activityType === "freelance"
                            ? "border-blue-600 ring-1 ring-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="font-medium">Je suis freelance</div>
                        <div className="text-sm text-gray-500">
                          Vous travaillez à votre compte
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* nom du salon */}
                {step === 2 && activityType === "salon" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du salon
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                      value={salonName}
                      onChange={(e) => setSalonName(e.target.value)}
                      placeholder="Ex: Salon Belle & Zen"
                    />
                  </div>
                )}

                {/* freelance - lieu d’exercice */}
                {step === 2 && activityType === "freelance" && (
                  <div>
                    <p className="mb-3 text-gray-700">Vous travaillez :</p>
                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={freelanceAtHome}
                          onChange={(e) => setFreelanceAtHome(e.target.checked)}
                        />
                        <span>Domicile</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={freelanceOutdoor}
                          onChange={(e) => setFreelanceOutdoor(e.target.checked)}
                        />
                        <span>Extérieur</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Vous pouvez cocher les deux.
                    </p>
                  </div>
                )}

                {/* Étape 3 : expérience */}
                {step === 3 && (
                  <div>
                    <p className="mb-3 text-gray-700">Votre expérience :</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { key: "<1 an", label: "Moins d'1 an" },
                        { key: "2+ ans", label: "Plus de 2 ans" },
                        { key: "5+ ans", label: "Plus de 5 ans" },
                        ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setExperience(opt.key);
                            console.log("Valeur choisie ->", opt.key);
                            }}
                          className={`border rounded p-3 hover:bg-gray-50 ${
                            experience === opt.key
                              ? "border-blue-600 ring-1 ring-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Étape 4 : SIRET */}
                {step === 4 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de SIRET (fictif accepté)
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                      value={siret}
                      onChange={(e) => setSiret(e.target.value)}
                      placeholder="Ex: 123 456 789 00012"
                    />
                  </div>
                )}

                {/* Étape 5 : Localisation */}
                {step === 5 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation (ville / zone)
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Paris, Lyon, Bordeaux…"
                    />
                  </div>
                )}

                {/* Étape 6 : Services */}
                {step === 6 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Services proposés (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="Ex: Coiffure, Maquillage, Onglerie"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Au moins un service est requis.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer navigation */}
              <div className="mt-8 flex items-center justify-between">
                <div>
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={onBack}
                      className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Retour
                    </button>
                  ) : (
                    <span />
                  )}
                </div>

                {step < 6 ? (
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!canGoNext()}
                    className={`px-4 py-2 rounded ${
                      canGoNext()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitPro}
                    disabled={!canGoNext()}
                    className={`px-4 py-2 rounded ${
                      canGoNext()
                        ? "bg-black text-white hover:bg-gray-900"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Créer mon compte
                  </button>
                )}
              </div>
            </div>

            {/* Lien connexion */}
            <div className="text-sm text-center mt-6">
              <span className="text-gray-600">Déjà un compte ? </span>
              <Link to="/login" className="text-blue-600 hover:underline">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}