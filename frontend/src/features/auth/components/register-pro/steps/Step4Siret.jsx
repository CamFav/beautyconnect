import { useState } from "react";
import { Building2 } from "lucide-react";

export default function Step4Siret({ siret, setSiret }) {
  const [error, setError] = useState("");

  const handleChange = (e) => {
    // garde uniquement les chiffres
    const raw = e.target.value.replace(/\D/g, "");
    setSiret(raw);

    if (raw.length > 0 && raw.length !== 14) {
      setError("Le numéro de SIRET doit contenir exactement 14 chiffres.");
    } else {
      setError("");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Numéro de SIRET
        </h2>
        <p className="text-sm text-gray-600">
          Obligatoire uniquement pour les professionnels déclarés.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 text-gray-500" />
        <input
          type="text"
          inputMode="numeric"
          maxLength={14}
          value={siret}
          onChange={handleChange}
          placeholder="Ex : 12345678900012"
          className={`flex-1 border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
            error ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? "siret-error" : undefined}
        />
      </div>

      {error && (
        <p id="siret-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
