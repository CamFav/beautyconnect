import { Award, Medal, Star } from "lucide-react";

export default function Step3Experience({ experience, setExperience }) {
  const options = [
    { key: "<1 an", label: "Moins d'1 an", Icon: Star },
    { key: "2+ ans", label: "2 à 5 ans", Icon: Award },
    { key: "5+ ans", label: "Plus de 5 ans", Icon: Medal },
  ];

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Quelle est votre expérience ?
        </h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* eslint-disable-next-line no-unused-vars */}
        {options.map(({ key, label, Icon }) => {
          const isSelected = experience === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setExperience(key)}
              className={`w-full flex flex-col items-center p-5 rounded-xl border transition-all shadow-sm
                ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }
              `}
            >
              <Icon
                className={`w-8 h-8 mb-3 ${
                  isSelected ? "text-blue-600" : "text-gray-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-blue-700" : "text-gray-800"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
