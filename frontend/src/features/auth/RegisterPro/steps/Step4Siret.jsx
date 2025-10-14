export default function Step4Siret({ siret, setSiret }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Numéro de SIRET (fictif accepté)
      </label>
      <input
        type="text"
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
        value={siret}
        onChange={(e) => setSiret(e.target.value)}
        placeholder="Ex: 123 456 789 00012"
      />
    </div>
  );
}
