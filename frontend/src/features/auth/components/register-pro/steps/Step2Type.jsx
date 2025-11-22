import { useState } from "react";
import { Home, MapPinHouse } from "lucide-react";
import { validateName } from "@/utils/validators";
import AddressField from "@/components/forms/AddressField";

export default function Step2Type({
  activityType,
  salonName,
  setSalonName,
  freelanceName,
  setFreelanceName,
  locationField,
  setLocationField,
  freelanceAtHome,
  setFreelanceAtHome,
  freelanceOutdoor,
  setFreelanceOutdoor,
}) {
  const [nameError, setNameError] = useState("");

  const handleBusinessNameChange = (value, setter) => {
    setter(value);
    if (!validateName(value)) {
      setNameError(
        "Nom d’entreprise invalide ou contient des caractères non autorisés."
      );
    } else {
      setNameError("");
    }
  };

  // --- Mode Salon ---
  if (activityType === "salon") {
    return (
      <div className="space-y-6">
        {/* Nom du salon */}
        <div className="space-y-3">
          <label
            htmlFor="salonName"
            className="block text-sm font-medium text-gray-800"
          >
            Nom du salon
          </label>
          <input
            id="salonName"
            type="text"
            value={salonName}
            onChange={(e) =>
              handleBusinessNameChange(e.target.value, setSalonName)
            }
            placeholder="Ex : Salon Belle & Zen"
            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
              nameError
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {nameError && (
            <p className="text-red-500 text-sm mt-1">{nameError}</p>
          )}
        </div>

        {/* Adresse du salon (avec suggestions) */}
        <AddressField
          label="Adresse du salon"
          initialValue={locationField.address}
          onSelectAddress={(addr) => {
            setLocationField({
              address: addr.address,
              city: addr.city,
              country: addr.country,
              latitude: addr.latitude,
              longitude: addr.longitude,
            });
          }}
          hint="Ex : 27 Rue des Martyrs, 75009 Paris"
        />
      </div>
    );
  }

  // --- Mode Freelance ---
  if (activityType === "freelance") {
    return (
      <div className="space-y-6">
        {/* Nom de l’entreprise freelance */}
        <div className="space-y-3">
          <label
            htmlFor="freelanceName"
            className="block text-sm font-medium text-gray-800"
          >
            Nom de votre entreprise
          </label>
          <input
            id="freelanceName"
            type="text"
            value={freelanceName}
            onChange={(e) =>
              handleBusinessNameChange(e.target.value, setFreelanceName)
            }
            placeholder="Ex : Studio Camille Beauté"
            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
              nameError
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {nameError && (
            <p className="text-red-500 text-sm mt-1">{nameError}</p>
          )}
        </div>

        {/* Mode d’exercice */}
        <div>
          <h3 className="text-base font-medium text-gray-800 mb-2">
            Où exercez-vous votre activité ?
          </h3>
          <p className="text-sm text-gray-600">
            Vous pouvez sélectionner une ou plusieurs options.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            aria-pressed={freelanceAtHome}
            onClick={() => setFreelanceAtHome(!freelanceAtHome)}
            className={`flex items-center gap-3 p-4 rounded-lg border transition shadow-sm ${
              freelanceAtHome
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            <Home
              className={`w-6 h-6 ${
                freelanceAtHome ? "text-blue-600" : "text-gray-500"
              }`}
            />
            <span className="text-sm text-gray-800">À domicile</span>
          </button>

          <button
            type="button"
            aria-pressed={freelanceOutdoor}
            onClick={() => setFreelanceOutdoor(!freelanceOutdoor)}
            className={`flex items-center gap-3 p-4 rounded-lg border transition shadow-sm ${
              freelanceOutdoor
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            <MapPinHouse
              className={`w-6 h-6 ${
                freelanceOutdoor ? "text-blue-600" : "text-gray-500"
              }`}
            />
            <span className="text-sm text-gray-800">Extérieur</span>
          </button>
        </div>

        {/* Adresse principale (même système que salon) */}
        <AddressField
          label="Ville et pays"
          initialValue={locationField.address}
          onSelectAddress={(addr) => {
            setLocationField({
              address: addr.address,
              city: addr.city,
              country: addr.country,
              latitude: addr.latitude,
              longitude: addr.longitude,
            });
          }}
          hint="Ville requise (ex. Bordeaux). Ajoutez une adresse si vous recevez à domicile."
        />
      </div>
    );
  }

  return null;
}
