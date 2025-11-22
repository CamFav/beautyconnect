import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContextBase";

import Step1ActivityType from "@/features/auth/components/register-pro/steps/Step1ActivityType";
import Step2Type from "@/features/auth/components/register-pro/steps/Step2Type";
import Step3Experience from "@/features/auth/components/register-pro/steps/Step3Experience";
import Step4Siret from "@/features/auth/components/register-pro/steps/Step4Siret";
import Step5Services from "@/features/auth/components/register-pro/steps/Step5Services";

import AlertMessage from "../../../components/feedback/AlertMessage";
import PasswordStrength from "../../../components/forms/PasswordStrength";
import { sanitizeInput, sanitizeName } from "../../../utils/sanitize";
import {
  validateEmail,
  validatePassword,
  validateName,
  messages,
  mapApiErrors,
} from "../../../utils/validators";
import Seo from "@/components/seo/Seo";

export default function RegisterPro() {
  const { handleRegister } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const prefill = location.state?.prefill || {};

  // --- États du compte utilisateur ---
  const [account, setAccount] = useState({
    name: sanitizeName(prefill.name || ""),
    email: sanitizeInput(prefill.email || ""),
    password: prefill.password || "",
    confirmPassword: "",
  });

  const [emailError, setEmailError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [step, setStep] = useState(1);
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- États liés à l'activité professionnelle ---
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

  // --- Validation SIRET ---
  const siretIsValid = (val) => /^[0-9]{14}$/.test(String(val || "").trim());

  // --- Validation des étapes ---
  const canGoNext = () => {
    if (
      !validateName(account.name) ||
      !validateEmail(account.email) ||
      !validatePassword(account.password) ||
      account.password !== account.confirmPassword
    )
      return false;

    switch (step) {
      case 1:
        return activityType === "salon" || activityType === "freelance";
      case 2:
        if (activityType === "salon") {
          return (
            salonName.trim().length > 1 &&
            locationField.address.trim().length > 5 &&
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

  // --- Gestion des champs du compte ---
  const handleAccountChange = (field, value) => {
    const cleanedValue =
      field === "name"
        ? sanitizeName(value)
        : field === "email"
        ? sanitizeInput(value)
        : value;

    setAccount((prev) => ({ ...prev, [field]: cleanedValue }));
    setFormError("");
    setEmailError("");
    setConfirmError("");

    if (field === "name" && !validateName(cleanedValue)) {
      setFormError(messages.name);
    }

    if (field === "email" && !validateEmail(cleanedValue)) {
      setEmailError(messages.email);
    }

    if (field === "password" && !validatePassword(cleanedValue)) {
      setFormError(messages.password);
    }

    if (field === "confirmPassword" && account.password !== cleanedValue) {
      setConfirmError("Les mots de passe ne correspondent pas.");
    } else if (field === "confirmPassword") {
      setConfirmError("");
    }
  };

  // --- Soumission du formulaire ---
  const submitPro = async () => {
    setFormError("");
    setFormSuccess("");
    if (submitting) return;

    if (
      !validateName(account.name) ||
      !validateEmail(account.email) ||
      !validatePassword(account.password) ||
      account.password !== account.confirmPassword
    ) {
      setFormError("Veuillez vérifier les informations du compte.");
      return;
    }

    if (!siretIsValid(siret)) {
      setFormError("SIRET invalide.");
      return;
    }

    const businessName =
      activityType === "salon"
        ? salonName.trim()
        : freelanceName.trim() || account.name.trim();

    const proPayload = {
      businessName,
      siret: siret.trim(),
      location: {
        address:
          activityType === "salon"
            ? locationField.address?.trim() || ""
            : locationField.address?.trim() || "",
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
      setSubmitting(true);
      const payload = {
        name: account.name.trim(),
        email: account.email.trim(),
        password: account.password.trim(),
        role: "pro",
        activeRole: "pro",
        proProfile: proPayload,
      };

      await handleRegister(payload);
      setSubmitting(false);
      setFormSuccess("Inscription réussie ! Vous allez être redirigé...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Erreur REGISTER PRO :", err?.response?.data || err);
      const apiErrors = mapApiErrors(err?.response?.data);
      if (apiErrors.email) setEmailError(apiErrors.email);
      if (apiErrors.password || apiErrors.newPassword) {
        setFormError(apiErrors.password || apiErrors.newPassword);
      } else if (apiErrors._error) {
        setFormError(apiErrors._error);
      } else {
        setFormError("Erreur lors de l'inscription pro.");
      }
    }
  };

  // --- État de succès ---
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

  // --- Rendu principal ---
  return (
    <>
      <Seo
        title="Créer un compte professionnel"
        description="Créez votre compte BeautyConnect Pro pour gérer vos services, réservations et visibilité en ligne."
      />
      <div className="min-h-screen bg-gray-50 flex flex-col relative">
        <div className="absolute top-4 right-6">
          <Link
            to="/home"
            className="border border-blue-600 text-blue-600 px-4 py-2 text-sm rounded-lg hover:bg-blue-600 hover:text-white transition"
          >
            Accéder au site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bloc gauche : création de compte */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Créez votre compte professionnel
                </h2>
                {emailError && (
                  <AlertMessage type="error" message={emailError} />
                )}
                <div className="space-y-4">
                  {/* Nom / prénom */}
                  <div>
                    <label
                      htmlFor="accountName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nom / Prénom
                    </label>
                    <input
                      id="accountName"
                      type="text"
                      value={account.name}
                      onChange={(e) =>
                        handleAccountChange("name", e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="accountEmail"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="accountEmail"
                      type="email"
                      value={account.email}
                      onChange={(e) =>
                        handleAccountChange("email", e.target.value)
                      }
                      className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200 ${
                        emailError ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>

                  {/* Mot de passe + force */}
                  <div>
                    <label
                      htmlFor="accountPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Mot de passe
                    </label>
                    <input
                      id="accountPassword"
                      type="password"
                      value={account.password}
                      onChange={(e) =>
                        handleAccountChange("password", e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                      required
                    />
                    {account.password && (
                      <PasswordStrength password={account.password} />
                    )}
                  </div>

                  {/* Confirmation */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={account.confirmPassword}
                      onChange={(e) =>
                        handleAccountChange("confirmPassword", e.target.value)
                      }
                      className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200 ${
                        confirmError ? "border-red-500" : ""
                      }`}
                      required
                    />
                    {confirmError && (
                      <p className="text-red-500 text-sm mt-1">
                        {confirmError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloc droit : étapes pro */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    Informations professionnelles
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
                      setActivityType={setActivityType}
                    />
                  )}
                  {step === 2 && (
                    <Step2Type
                      activityType={activityType}
                      salonName={salonName}
                      setSalonName={setSalonName}
                      freelanceName={freelanceName}
                      setFreelanceName={setFreelanceName}
                      freelanceAtHome={freelanceAtHome}
                      setFreelanceAtHome={setFreelanceAtHome}
                      freelanceOutdoor={freelanceOutdoor}
                      setFreelanceOutdoor={setFreelanceOutdoor}
                      locationField={locationField}
                      setLocationField={setLocationField}
                    />
                  )}
                  {step === 3 && (
                    <Step3Experience
                      experience={experience}
                      setExperience={setExperience}
                    />
                  )}
                  {step === 4 && (
                    <Step4Siret
                      siret={siret}
                      setSiret={setSiret}
                      helper="Votre SIRET doit contenir exactement 14 chiffres."
                      isValid={siretIsValid}
                    />
                  )}
                  {step === 5 && (
                    <Step5Services
                      categories={categories}
                      setCategories={setCategories}
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
                      <div className="flex flex-col items-end space-y-4">
                        <div className="flex items-start text-sm">
                          <input
                            id="consentPro"
                            type="checkbox"
                            checked={consentGiven}
                            onChange={(e) => setConsentGiven(e.target.checked)}
                            className="mt-1 mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            required
                          />
                          <label htmlFor="consentPro" className="text-gray-700">
                            J’ai lu et j’accepte la{" "}
                            <Link
                              to="/legal/politique-de-confidentialite"
                              className="text-blue-600 hover:underline"
                            >
                              politique de confidentialité
                            </Link>{" "}
                            de BeautyConnect.
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={submitPro}
                          disabled={!canGoNext() || !consentGiven || submitting}
                          className={`px-4 py-2 rounded ${
                            canGoNext() && consentGiven && !submitting
                              ? "bg-black text-white hover:bg-gray-900 transition"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          Créer mon compte
                        </button>
                      </div>
                    )}
                  </div>
                </div>

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
      </div>
    </>
  );
}
