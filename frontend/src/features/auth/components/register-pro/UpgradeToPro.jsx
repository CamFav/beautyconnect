import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContextBase";
import httpClient from "@/api/http/httpClient";
import { upgradeUserToPro } from "@/api/auth/account.service";

import Step1ActivityType from "@/features/auth/components/register-pro/steps/Step1ActivityType";
import Step2Type from "@/features/auth/components/register-pro/steps/Step2Type";
import Step3Experience from "@/features/auth/components/register-pro/steps/Step3Experience";
import Step4Siret from "@/features/auth/components/register-pro/steps/Step4Siret";
import Step5Services from "@/features/auth/components/register-pro/steps/Step5Services";
import AlertMessage from "@/components/feedback/AlertMessage";
import Seo from "@/components/seo/Seo";

export default function UpgradeToPro() {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      if (user.role === "pro" || user.activeRole === "pro") {
        navigate("/pro/dashboard", { replace: true });
      }
    }, 200); // 200ms suffit pour que le context se mette à jour
    return () => clearTimeout(timer);
  }, [user, navigate]);

  // États des étapes
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // États métier pro
  const [activityType, setActivityType] = useState("");
  const [salonName, setSalonName] = useState("");
  const [freelanceName, setFreelanceName] = useState("");
  const [freelanceAtHome, setFreelanceAtHome] = useState(false);
  const [freelanceOutdoor, setFreelanceOutdoor] = useState(false);
  const [experience, setExperience] = useState("");
  const [siret, setSiret] = useState("");
  const [locationField, setLocationField] = useState({
    city: "",
    country: "",
    address: "",
    latitude: null,
    longitude: null,
  });
  const [categories, setCategories] = useState([]);

  const siretIsValid = (val) => /^[0-9]{14}$/.test(String(val || "").trim());

  const canGoNext = () => {
    switch (step) {
      case 1:
        return activityType === "salon" || activityType === "freelance";
      case 2:
        if (activityType === "salon") {
          return (
            salonName.trim().length > 1 &&
            locationField.city.trim() &&
            locationField.country.trim()
          );
        }
        if (activityType === "freelance") {
          return (
            freelanceName.trim().length > 1 &&
            (freelanceAtHome || freelanceOutdoor) &&
            locationField.city.trim() &&
            locationField.country.trim()
          );
        }
        return false;
      case 3:
        return ["<1 an", "2+ ans", "5+ ans"].includes(experience);
      case 4:
        return siretIsValid(siret);
      case 5:
        return Array.isArray(categories) && categories.length >= 1;
      default:
        return false;
    }
  };

  const onNext = () => {
    setFormError("");
    if (canGoNext()) setStep((s) => Math.min(5, s + 1));
  };

  const onBack = () => {
    setFormError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const submitUpgrade = async () => {
    setFormError("");
    setFormSuccess("");

    if (!siretIsValid(siret)) {
      setFormError("SIRET invalide.");
      return;
    }

    const businessName =
      activityType === "salon" ? salonName.trim() : freelanceName.trim();

    const proPayload = {
      businessName,
      siret: siret.trim(),
      location: {
        address: locationField.address?.trim() || "",
        city: locationField.city?.trim() || "",
        country: locationField.country?.trim() || "France",
        latitude: locationField.latitude ?? null,
        longitude: locationField.longitude ?? null,
      },
      categories,
      status: activityType,
      exerciseType: [
        ...(freelanceAtHome ? ["domicile"] : []),
        ...(freelanceOutdoor ? ["exterieur"] : []),
      ],
      experience,
    };

    try {
      // 1. Envoi du profil pro
      const updatedUser = await upgradeUserToPro(proPayload);

      // 2. Récupération du user complet depuis le backend
      const me = await httpClient.get("/auth/me");
      if (me?.data) {
        localStorage.setItem("user", JSON.stringify(me.data));
        updateUser(me.data);

        window.dispatchEvent(new Event("storage"));

        // Attente du re-render AuthContext (user.role === "pro")
        setFormSuccess("Votre compte est maintenant professionnel !");

        // Vérifie que la mise à jour est bien effective avant redirection
        setTimeout(() => {
          const storedUser = JSON.parse(localStorage.getItem("user"));
          console.log("Redirecting, storedUser:", storedUser);
          if (storedUser?.role === "pro" || storedUser?.activeRole === "pro") {
            navigate("/pro/dashboard", { replace: true });
          } else {
            console.warn("User not yet updated, forcing reload");
            window.location.reload();
          }
        }, 1000);
      } else {
        updateUser(updatedUser);
      }

      // 3. Message de succès et redirection fluide
      setFormSuccess("Votre compte est maintenant professionnel !");
      setTimeout(() => navigate("/pro/dashboard", { replace: true }), 1000);
    } catch (err) {
      console.error("Erreur upgrade :", err);
      setFormError("Impossible de passer en professionnel.");
    }
  };

  // === États de succès / erreur ===
  if (formSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-md p-8 rounded-lg text-center">
          <p className="text-lg font-semibold mb-4">{formSuccess}</p>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span>Redirection en cours...</span>
            <span className="animate-pulse">⏳</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Passer en compte professionnel"
        description="Convertissez votre compte BeautyConnect en compte Pro pour accéder à toutes les fonctionnalités professionnelles."
      />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-10">
        {/* Message d'alerte en haut et centré */}
        <div className="w-full max-w-4xl mb-6">
          <AlertMessage type="info">
            Vous êtes connecté en tant que <b>{user?.email}</b>. En validant,
            votre compte sera converti en professionnel.
          </AlertMessage>
        </div>
  
        {/* Bloc principal centré */}
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              Passage au compte professionnel
            </h3>
            <div className="text-sm text-gray-600">
              Étape <b>{step}</b> / 5
            </div>
          </div>
  
          {formError && <AlertMessage type="error" message={formError} />}
  
          <div className="space-y-6">
            {step === 1 && (
              <Step1ActivityType
                activityType={activityType}
                setActivityType={(v) => {
                  setActivityType(v);
                  setFormError("");
                }}
              />
            )}
            {step === 2 && (
              <Step2Type
                activityType={activityType}
                salonName={salonName}
                setSalonName={(v) => {
                  setSalonName(v);
                  setFormError("");
                }}
                freelanceName={freelanceName}
                setFreelanceName={(v) => {
                  setFreelanceName(v);
                  setFormError("");
                }}
                freelanceAtHome={freelanceAtHome}
                setFreelanceAtHome={(v) => {
                  setFreelanceAtHome(v);
                  setFormError("");
                }}
                freelanceOutdoor={freelanceOutdoor}
                setFreelanceOutdoor={(v) => {
                  setFreelanceOutdoor(v);
                  setFormError("");
                }}
                locationField={locationField}
                setLocationField={(v) => {
                  setLocationField(v);
                  setFormError("");
                }}
              />
            )}
            {step === 3 && (
              <Step3Experience
                experience={experience}
                setExperience={(v) => {
                  setExperience(v);
                  setFormError("");
                }}
              />
            )}
            {step === 4 && (
              <Step4Siret
                siret={siret}
                setSiret={(v) => {
                  setSiret(v);
                  setFormError("");
                }}
                helper="Votre SIRET doit contenir exactement 14 chiffres."
                isValid={siretIsValid}
              />
            )}
            {step === 5 && (
              <Step5Services
                categories={categories}
                setCategories={(v) => {
                  setCategories(v);
                  setFormError("");
                }}
              />
            )}
          </div>
  
          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                >
                  Retour
                </button>
              )}
            </div>
            <div>
              {step < 5 ? (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext()}
                  className={`px-4 py-2 rounded ${
                    canGoNext()
                      ? "bg-blue-600 text-white hover:bg-blue-700 transition"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitUpgrade}
                  disabled={!canGoNext()}
                  className={`px-4 py-2 rounded ${
                    canGoNext()
                      ? "bg-black text-white hover:bg-gray-900 transition"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Valider mon passage en Pro
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

