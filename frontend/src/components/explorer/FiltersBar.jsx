const categories = ["Tous", "Coiffure", "Beauté", "Tatouage", "Esthétique"];

export default function FiltersBar({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1 rounded-full border text-sm transition ${
            active === cat
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
