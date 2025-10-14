export default function Step3Experience({ experience, setExperience }) {
  const options = [
    { key: "<1 an", label: "Moins d'1 an" },
    { key: "2+ ans", label: "Plus de 2 ans" },
    { key: "5+ ans", label: "Plus de 5 ans" },
  ];

  return (
    <div>
      <p className="mb-3 text-gray-700">Votre expérience :</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setExperience(opt.key)}
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
  );
}
