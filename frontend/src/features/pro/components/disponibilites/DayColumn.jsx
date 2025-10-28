const isValidRange = (start, end) => start && end && start < end;

export default function DayColumn({
  dayKey,
  label,
  enabled,
  slots,
  onToggle,
  onAddSlot,
  onRemoveSlot,
  onChangeTime,
}) {
  return (
    <section
      className={`relative rounded-2xl border shadow-sm transition flex flex-col h-full min-h-[240px] ${
        enabled ? "bg-white border-gray-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      {/* Header avec switch et badge */}
      <header className="flex items-center justify-between px-5 py-3 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-800">{label}</h3>
          <span
            className={`text-xs px-3 py-0.5 rounded-full font-medium border ${
              enabled
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-600 border-gray-300"
            }`}
          >
            {enabled ? "Ouvert" : "Fermé"}
          </span>
        </div>
        <label
          className="relative inline-flex items-center cursor-pointer select-none"
          aria-label={`Basculer ${label} ${enabled ? "ouvert" : "fermé"}`}
        >
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={() => onToggle(dayKey)}
          />
          {/* Track */}
          <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition" />
          {/* Thumb */}
          <div className="absolute top-1/2 left-1 w-5 h-5 bg-white rounded-full shadow transform -translate-y-1/2 transition peer-checked:translate-x-7" />
        </label>
      </header>

      <div
        className={`px-5 py-4 flex flex-col gap-4 ${
          enabled ? "opacity-100" : "opacity-60"
        }`}
      >
        {enabled && slots.length === 0 && (
          <p className="text-sm text-gray-500">Aucun créneau pour ce jour.</p>
        )}

        <ul className="flex flex-col gap-3">
          {slots.map((slot, i) => (
            <li
              key={`${dayKey}-${i}`}
              className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3"
            >
              <input
                type="time"
                value={slot.start || ""}
                onChange={(e) =>
                  onChangeTime(dayKey, i, "start", e.target.value)
                }
                className="border rounded-lg px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Début créneau ${i + 1} ${label}`}
              />
              <span className="text-gray-400 font-bold" aria-hidden>
                →
              </span>
              <input
                type="time"
                value={slot.end || ""}
                onChange={(e) => onChangeTime(dayKey, i, "end", e.target.value)}
                className="border rounded-lg px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Fin créneau ${i + 1} ${label}`}
              />

              {!isValidRange(slot.start, slot.end) && (
                <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-medium">
                  Invalide
                </span>
              )}

              <button
                onClick={() => onRemoveSlot(dayKey, i)}
                className="ml-auto text-gray-400 hover:text-red-600 transition text-lg font-bold"
                title="Supprimer le créneau"
                aria-label={`Supprimer créneau ${i + 1} ${label}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onAddSlot(dayKey)}
          className="mt-2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
        >
          + Ajouter un créneau
        </button>
      </div>

      {!enabled && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          aria-hidden
        >
          <div className="absolute inset-0 rounded-2xl bg-white/30" />
        </div>
      )}
    </section>
  );
}
