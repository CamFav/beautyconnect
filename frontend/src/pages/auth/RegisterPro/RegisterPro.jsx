import { useState, useContext, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { upgradeUserToPro } from "../../../api/account.service";

import Step1ActivityType from "./steps/Step1ActivityType";
import Step2SalonFreelance from "./steps/Step2Type";
import Step3Experience from "./steps/Step3Experience";
import Step4Siret from "./steps/Step4Siret";
import Step5Location from "./steps/Step5Location";
import Step6Services from "./steps/Step6Services";

export default function RegisterPro() {
  const { user, token, handleRegister, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const upgrading = useMemo(() => !!user && user.role !== "pro", [user]);

  // Si création : récupérer pré-remplissage éventuel (landing)
  const prefill = location.state?.prefill || {};

  const [account, setAccount] = useState({
    name: prefill.name || "",
    email: prefill.email || "",
    password: prefill.password || "",
    confirmPassword: "",
  });

  const [step, setStep] = useState(1);

  // Données PRO
  const [activityType, setActivityType] = useState("");
  const [salonName, setSalonName] = useState("");

  const [freelanceAtHome, setFreelanceAtHome] = useState(false);
  const [freelanceOutdoor, setFreelanceOutdoor] = useState(false);

  const [experience, setExperience] = useState("");
  const [siret, setSiret] = useState("");

  const [locationField, setLocationField] = useState("");
  const [services, setServices] = useState("");

  const canGoNext = () => {
    if (!upgrading) {
      if (
        !account.name ||
        !account.email ||
        !account.password ||
        !account.confirmPassword
      )
        return false;
      if (account.password !== account.confirmPassword) return false;
    }
    switch (step) {
      case 1:
        return activityType === "salon" || activityType === "freelance";
      case 2:
        if (activityType === "salon") return salonName.trim().length > 1;
        if (activityType === "freelance")
          return freelanceAtHome || freelanceOutdoor;
        return false;
      case 3:
        return ["<1 an", "2+ ans", "5+ ans"].includes(experience);
      case 4:
        return siret.trim().length >= 8;
      case 5:
        return locationField.trim().length > 1;
      case 6: {
        const arr = services
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        return arr.length >= 1;
      }
      default:
        return false;
    }
  };

  const onNext = () => {
    if (canGoNext()) setStep((s) => Math.min(6, s + 1));
  };

  const onBack = () => setStep((s) => Math.max(1, s - 1));

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

    const proPayload = {
      businessName,
      siret: siret.trim(),
      location: locationField.trim(),
      services: servicesArray,
      status: activityType,
      exerciseType: [
        ...(freelanceAtHome ? ["domicile"] : []),
        ...(freelanceOutdoor ? ["exterieur"] : []),
      ],
      experience,
    };

    try {
      if (upgrading) {
        const updatedUser = await upgradeUserToPro(token, proPayload);
        updateUser(updatedUser);
        alert("Votre compte est maintenant professionnel.");
        navigate("/home");
        return;
      }

      // Vérification mot de passe
      if (account.password !== account.confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }

      const payload = {
        name: account.name,
        email: account.email,
        password: account.password,
        role: "pro",
        activeRole: "pro",
        proProfile: proPayload,
      };

      await handleRegister(payload);
      alert("Inscription pro réussie !");
      navigate("/login");
    } catch (err) {
      console.error("Erreur REGISTER/UPGRADE :", err?.response?.data || err);
      alert(
        upgrading
          ? "Impossible de passer le compte en professionnel."
          : "Erreur lors de l'inscription pro"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full py-4 px-6 flex justify-end">
        <Link to="/home" className="text-sm text-gray-700 hover:underline">
          Accéder au site
        </Link>
      </header>

      <div className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {!upgrading && (
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                      value={account.confirmPassword}
                      onChange={(e) =>
                        setAccount({
                          ...account,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={upgrading ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  Informations professionnelles
                </h3>
                <div className="text-sm text-gray-600">
                  Étape <b>{step}</b> / 6
                </div>
              </div>

              {upgrading && (
                <div className="mb-4 text-sm text-gray-700 bg-gray-50 border rounded p-3">
                  Vous êtes connecté en tant que <b>{user?.email}</b>. En
                  validant, votre compte sera converti en professionnel.
                </div>
              )}

              <div className="space-y-6">
                {step === 1 && (
                  <Step1ActivityType
                    activityType={activityType}
                    setActivityType={setActivityType}
                  />
                )}

                {step === 2 && (
                  <Step2SalonFreelance
                    activityType={activityType}
                    salonName={salonName}
                    setSalonName={setSalonName}
                    freelanceAtHome={freelanceAtHome}
                    setFreelanceAtHome={setFreelanceAtHome}
                    freelanceOutdoor={freelanceOutdoor}
                    setFreelanceOutdoor={setFreelanceOutdoor}
                  />
                )}

                {step === 3 && (
                  <Step3Experience
                    experience={experience}
                    setExperience={setExperience}
                  />
                )}

                {step === 4 && <Step4Siret siret={siret} setSiret={setSiret} />}

                {step === 5 && (
                  <Step5Location
                    location={locationField}
                    setLocation={setLocationField}
                  />
                )}

                {step === 6 && (
                  <Step6Services
                    services={services}
                    setServices={setServices}
                  />
                )}
              </div>

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
                    {upgrading
                      ? "Valider mon passage en Pro"
                      : "Créer mon compte"}
                  </button>
                )}
              </div>
            </div>

            {!upgrading && (
              <div className="text-sm text-center mt-6">
                <span className="text-gray-600">Déjà un compte ? </span>
                <Link to="/login" className="text-blue-600 hover:underline">
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
