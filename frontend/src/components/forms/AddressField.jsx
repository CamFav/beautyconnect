import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { sanitizeInput } from "@/utils/sanitize";

export default function AddressField({
  label = "Adresse",
  placeholder = "Ex : 10 Rue de la Paix, Paris",
  hint = "",
  initialValue = "",
  onSelectAddress,
}) {
  const [query, setQuery] = useState(initialValue || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Synchronise le champ si l’adresse change depuis le parent
  useEffect(() => {
    setQuery(initialValue || "");
  }, [initialValue]);

  // --- Récupération des suggestions ---
  useEffect(() => {
    if (!userInteracted || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (e) {
        console.error("Erreur API adresse :", e);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, userInteracted]);

  // --- Sélection d'une adresse ---
  const handleSelect = (feature) => {
    const props = feature.properties;
    const coords = feature.geometry.coordinates;

    const addressData = {
      label: props.label || "",
      address: sanitizeInput(props.name || props.label || ""),
      city: sanitizeInput(props.city || ""),
      country: "France",
      latitude: coords[1],
      longitude: coords[0],
    };

    setQuery(props.label || "");
    setSuggestions([]);
    setShowSuggestions(false);
    onSelectAddress(addressData);
  };

  return (
    <div className="space-y-2 relative">
      {label && (
        <label className="block text-sm font-medium text-gray-800">
          {label}
        </label>
      )}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <div className="relative">
        <MapPin className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setUserInteracted(true);
          }}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-48 overflow-auto mt-1">
            {suggestions.map((item) => (
              <li
                key={item.properties.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm rounded-md focus:bg-gray-100"
                onClick={() => handleSelect(item)}
                onKeyDown={(e) =>
                  e.key === "Enter" || e.key === " " ? handleSelect(item) : null
                }
                tabIndex={0}
                role="button"
                aria-label={`Sélectionner l’adresse ${item.properties.label}`}
              >
                {item.properties.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
