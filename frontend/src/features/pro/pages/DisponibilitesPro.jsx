import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContextBase";
import {
  getAvailability,
  updateAvailability,
} from "../../../api/pro/pro.availability";
import DayColumn from "@/features/pro/components/disponibilites/DayColumn";
import GlobalAlerts from "../components/disponibilites/GlobalAlerts";

import StickyFooterButton from "../../../components/ui/StickyFooterButton";
import AlertMessage from "../../../components/feedback/AlertMessage";
import Seo from "@/components/seo/Seo";

const DAYS = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

const defaultDay = (key) => ({ day: key, enabled: false, slots: [] });
const getDefaultAvailability = () => DAYS.map((d) => defaultDay(d.key));

const byTimeAsc = (a, b) => (a.start || "").localeCompare(b.start || "");

const isValidRange = (start, end) => {
  if (!start || !end) return false;
  return start < end;
};

const hasOverlap = (slots) => {
  if (!Array.isArray(slots) || slots.length < 2) return false;
  const sorted = [...slots].sort(byTimeAsc);
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const nxt = sorted[i + 1];
    if (cur.end && nxt.start && cur.end > nxt.start) return true;
  }
  return false;
};

export default function DisponibilitesPro() {
  const { token } = useAuth();

  const [availability, setAvailability] = useState([]);
  const [initialAvailability, setInitialAvailability] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Chargement initial
  useEffect(() => {
    (async () => {
      try {
        const res = await getAvailability(token);
        let merged;
        if (!Array.isArray(res) || res.length === 0) {
          merged = getDefaultAvailability();
        } else {
          merged = getDefaultAvailability().map((d) => {
            const existing = res.find((r) => r.day === d.day);
            if (!existing) return d;
            const slots = Array.isArray(existing.slots)
              ? [...existing.slots].sort(byTimeAsc)
              : [];
            return { day: d.day, enabled: !!existing.enabled, slots };
          });
        }
        setAvailability(merged);
        setInitialAvailability(JSON.parse(JSON.stringify(merged)));
      } catch (e) {
        console.error("Erreur chargement disponibilités :", e);
        const defaults = getDefaultAvailability();
        setAvailability(defaults);
        setInitialAvailability(JSON.parse(JSON.stringify(defaults)));
        setMessage({
          type: "error",
          text: "Impossible de charger vos disponibilités.",
        });
      }
    })();
  }, [token]);

  const hasChanges =
    JSON.stringify(availability) !== JSON.stringify(initialAvailability);

  // Handlers
  const toggleDay = (dayKey) => {
    setAvailability((prev) =>
      prev.map((d) => (d.day === dayKey ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const addSlot = (dayKey) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.day === dayKey
          ? {
              ...d,
              slots: [...d.slots, { start: "09:00", end: "12:00" }].sort(
                byTimeAsc
              ),
            }
          : d
      )
    );
  };

  const removeSlot = (dayKey, index) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.day === dayKey
          ? { ...d, slots: d.slots.filter((_, i) => i !== index) }
          : d
      )
    );
  };

  const changeTime = (dayKey, index, field, value) => {
    setAvailability((prev) =>
      prev.map((d) => {
        if (d.day !== dayKey) return d;
        const next = d.slots.map((s, i) =>
          i === index ? { ...s, [field]: value } : s
        );
        next.sort(byTimeAsc);
        return { ...d, slots: next };
      })
    );
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const cleaned = availability.map((d) => ({
        ...d,
        slots: d.slots.filter((s) => isValidRange(s.start, s.end)),
      }));
      await updateAvailability(token, cleaned);
      setInitialAvailability(JSON.parse(JSON.stringify(cleaned)));
      setMessage({
        type: "success",
        text: "Disponibilités enregistrées avec succès.",
      });
    } catch (e) {
      console.error("Erreur enregistrement :", e);
      setMessage({
        type: "error",
        text: "Erreur lors de l'enregistrement.",
      });
    } finally {
      setSaving(false);
    }
  };

  const uiDays = useMemo(() => {
    return DAYS.map(({ key, label }) => {
      const day = availability.find((d) => d.day === key) || defaultDay(key);
      const invalidCount = day.slots.filter(
        (s) => !isValidRange(s.start, s.end)
      ).length;
      return {
        key,
        label,
        enabled: day.enabled,
        slots: [...day.slots].sort(byTimeAsc),
        hasOverlap: hasOverlap(day.slots),
        invalidCount,
      };
    });
  }, [availability]);

  return (
    <>
      <Seo
        title="Vos disponnibilités"
        description="Définissez et gérez vos créneaux horaires sur BeautyConnect Pro pour recevoir des réservations facilement."
      />
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Mes disponibilités</h2>
        </div>

        {message && <AlertMessage type={message.type} message={message.text} />}

        <GlobalAlerts availability={availability} />

        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {uiDays.map((d) => (
              <DayColumn
                key={d.key}
                dayKey={d.key}
                label={d.label}
                enabled={d.enabled}
                slots={d.slots}
                hasOverlap={d.hasOverlap}
                invalidCount={d.invalidCount}
                onToggle={toggleDay}
                onAddSlot={addSlot}
                onRemoveSlot={removeSlot}
                onChangeTime={changeTime}
              />
            ))}
          </div>
        </div>

        {hasChanges && (
          <StickyFooterButton
            label={
              saving ? "Enregistrement..." : "Enregistrer les modifications"
            }
            onClick={save}
            disabled={saving}
          />
        )}
      </div>
    </>
  );
}
