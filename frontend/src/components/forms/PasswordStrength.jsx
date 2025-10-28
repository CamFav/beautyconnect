import React from "react";
import { getPasswordScore } from "@/utils/validators";

const labels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];

export default function PasswordStrength({ password }) {
  const score = getPasswordScore(password);
  const pct = (score / 4) * 100;

  // pas de dépendance CSS externe
  const barClass =
    score >= 4
      ? "bg-green-600"
      : score === 3
      ? "bg-green-500"
      : score === 2
      ? "bg-yellow-500"
      : score === 1
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="mt-2">
      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className={`h-2 ${barClass} rounded transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">
        Force du mot de passe : {labels[score]}
      </p>
    </div>
  );
}
