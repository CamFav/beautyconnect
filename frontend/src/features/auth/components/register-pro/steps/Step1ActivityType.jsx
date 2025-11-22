import { BriefcaseBusiness, Store } from "lucide-react";

export default function Step1ActivityType({ activityType, setActivityType }) {
  const options = [
    {
      key: "salon",
      label: "Je travaille dans un salon",
      description:
        "Lieu fixe, adresse complète obligatoire pour être visible et recevoir des clients.",
      Icon: Store,
    },
    {
      key: "freelance",
      label: "Je suis freelance",
      description:
        "Vous travaillez à votre compte. Ville obligatoire, adresse optionnelle (exercice à domicile).",
      Icon: BriefcaseBusiness,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Quel est votre mode d’activité ?
        </h2>
        <p className="text-sm text-gray-600">
          Sélectionnez l’option qui correspond le mieux à votre situation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* eslint-disable-next-line no-unused-vars */}
        {options.map(({ key, label, description, Icon }) => {
          const isActive = activityType === key;

          return (
            <button
              key={key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActivityType(key)}
              className={`flex flex-col justify-center w-full h-40 p-6 rounded-xl border transition-all shadow-sm text-left
                ${
                  isActive
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-center gap-4 mb-2">
                <Icon
                  className={`w-8 h-8 ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span
                  className={`font-medium text-base ${
                    isActive ? "text-blue-700" : "text-gray-800"
                  }`}
                >
                  {label}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-snug">
                {description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
