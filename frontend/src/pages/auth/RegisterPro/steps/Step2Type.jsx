export default function Step2Type({
  activityType,
  salonName,
  setSalonName,
  freelanceAtHome,
  setFreelanceAtHome,
  freelanceOutdoor,
  setFreelanceOutdoor,
}) {
  if (activityType === "salon") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du salon
        </label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          value={salonName}
          onChange={(e) => setSalonName(e.target.value)}
          placeholder="Ex: Salon Belle & Zen"
        />
      </div>
    );
  }

  if (activityType === "freelance") {
    return (
      <div>
        <p className="mb-3 text-gray-700">Vous travaillez :</p>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={freelanceAtHome}
              onChange={(e) => setFreelanceAtHome(e.target.checked)}
            />
            <span>Domicile</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={freelanceOutdoor}
              onChange={(e) => setFreelanceOutdoor(e.target.checked)}
            />
            <span>Extérieur</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Vous pouvez cocher les deux.
        </p>
      </div>
    );
  }

  return null;
}
