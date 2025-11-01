import { Scissors, Sparkles, Palette, Brush } from "lucide-react";

const CATEGORIES = [
  { key: "Coiffure", icon: Scissors },
  { key: "Esthétique", icon: Sparkles },
  { key: "Tatouage", icon: Palette },
  { key: "Maquillage", icon: Brush },
];

// 'categories' et 'setCategories'
// valeur par défaut [] pour éviter 'undefined.includes'
export default function Step5Services({ categories = [], setCategories }) {
  const toggleCategory = (category) => {
    // protège aussi si prev est undefined
    setCategories((prev = []) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          Quels types de services proposez-vous ?
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Sélectionnez au moins un domaine d’activité.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* eslint-disable-next-line no-unused-vars */}
        {CATEGORIES.map(({ key, icon: Icon }) => {
          const isSelected = categories.includes(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleCategory(key)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border shadow-sm transition text-center
                ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }
              `}
            >
              <Icon
                className={`w-7 h-7 mb-2 ${
                  isSelected ? "text-blue-600" : "text-gray-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-blue-700" : "text-gray-800"
                }`}
              >
                {key}
              </span>
            </button>
          );
        })}
      </div>

      {categories.length === 0 && (
        <p className="text-xs text-red-500 mt-2" role="alert">
          Vous devez sélectionner au moins un service.
        </p>
      )}
    </div>
  );
}
