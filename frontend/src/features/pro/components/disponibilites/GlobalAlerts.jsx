import { useMemo } from "react";

const isValidRange = (start, end) => {
  if (!start || !end) return false;
  return start < end;
};

const hasOverlap = (slots) => {
  if (!Array.isArray(slots) || slots.length < 2) return false;
  const sorted = [...slots].sort((a, b) =>
    (a.start || "").localeCompare(b.start || "")
  );
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const nxt = sorted[i + 1];
    if (cur.end && nxt.start && cur.end > nxt.start) return true;
  }
  return false;
};

export default function GlobalAlerts({ availability }) {
  const stats = useMemo(() => {
    let overlaps = 0;
    let invalids = 0;
    for (const d of availability || []) {
      if (hasOverlap(d.slots)) overlaps += 1;
      invalids += (d.slots || []).filter(
        (s) => !isValidRange(s.start, s.end)
      ).length;
    }
    return { overlaps, invalids };
  }, [availability]);

  if (stats.overlaps === 0 && stats.invalids === 0) return null;

  return (
    <div className="mb-5 space-y-2">
      {stats.overlaps > 0 && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          Des chevauchements existent dans vos disponibilités.
        </div>
      )}
      {stats.invalids > 0 && (
        <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          Certains créneaux invalides seront ignorés à l'enregistrement.
        </div>
      )}
    </div>
  );
}
