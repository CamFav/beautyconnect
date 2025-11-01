const categories = ["Tous", "Coiffure", "Esthétique", "Tatouage", "Maquillage"];

export default function FeedFiltersBar({ active, onChange }) {
  const sanitize = (val) => (typeof val === "string" ? val.trim() : "");

  return (
    <div
      className="flex flex-wrap gap-2 mt-3 mb-4"
      role="tablist"
      aria-label="Filtres de publications"
    >
      {categories.map((cat) => {
        const safeCat = sanitize(cat);
        return (
          <button
            key={safeCat}
            onClick={() => onChange(safeCat)}
            role="tab"
            aria-selected={active === safeCat}
            aria-label={`Filtrer les posts par ${safeCat}`}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-150 ${
              active === safeCat
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {safeCat}
          </button>
        );
      })}
    </div>
  );
}
