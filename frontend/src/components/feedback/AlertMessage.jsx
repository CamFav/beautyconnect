import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

/**
 * AlertMessage — Composant d’alerte accessible
 *
 * Ajouts :
 * - role="alert" pour erreurs/avertissements
 * - aria-live="polite" pour infos/success
 * - Compatible screen readers (NVDA, VoiceOver)
 */

export default function AlertMessage({ type = "info", message, children }) {
  const styles = {
    success: {
      base: "bg-green-50 border-green-200 text-green-700",
      icon: (
        <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
      ),
      role: "status",
      live: "polite",
    },
    error: {
      base: "bg-red-50 border-red-200 text-red-700",
      icon: <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />,
      role: "alert",
      live: "assertive",
    },
    warning: {
      base: "bg-yellow-50 border-yellow-200 text-yellow-700",
      icon: (
        <TriangleAlert className="w-5 h-5 text-yellow-600" aria-hidden="true" />
      ),
      role: "alert",
      live: "assertive",
    },
    info: {
      base: "bg-blue-50 border-blue-200 text-blue-700",
      icon: <Info className="w-5 h-5 text-blue-600" aria-hidden="true" />,
      role: "status",
      live: "polite",
    },
  };

  const sanitize = (val) =>
    typeof val === "string" ? val.replace(/[<>]/g, "") : val;

  const content = sanitize(message) || sanitize(children);
  if (!content) return null;

  const isSessionExpired =
    typeof content === "string" &&
    content.toLowerCase().includes("session a expiré");

  const isDisconnected =
    typeof content === "string" && content.toLowerCase().includes("déconnect");

  if (isSessionExpired || isDisconnected) {
    type = "warning";
  }

  const style = styles[type] || styles.info;

  return (
    <div
      role={style.role}
      aria-live={style.live}
      className={`flex items-start gap-3 p-3.5 border rounded-md shadow-sm transition-all ${style.base}`}
    >
      <div className="mt-0.5 shrink-0">{style.icon}</div>
      <div className="text-sm font-medium leading-snug">{content}</div>
    </div>
  );
}
