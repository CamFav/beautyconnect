export default function Step6Services({ services, setServices }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Services proposés (séparés par des virgules)
      </label>
      <input
        type="text"
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
        value={services}
        onChange={(e) => setServices(e.target.value)}
        placeholder="Ex: Coiffure, Maquillage, Onglerie"
      />
      <p className="text-xs text-gray-500 mt-2">
        Au moins un service est requis.
      </p>
    </div>
  );
}
