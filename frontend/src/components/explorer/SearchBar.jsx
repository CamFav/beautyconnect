export default function SearchBar({ value, onChange }) {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Rechercher un prestataire..."
        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
