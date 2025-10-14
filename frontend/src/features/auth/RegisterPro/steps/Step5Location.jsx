export default function Step5Location({ location, setLocation }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Localisation (ville / zone)
      </label>
      <input
        type="text"
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Ex: Paris, Lyon, Bordeaux…"
      />
    </div>
  );
}
