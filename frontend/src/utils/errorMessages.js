// Centralized user-facing error messages and helpers

export const sessionExpiredMsg =
  "Votre session a expiré, veuillez vous reconnecter.";

export const forbiddenMsg =
  "Accès refusé : vous n’avez pas les permissions requises.";

export const genericErrorMsg = "Une erreur est survenue. Veuillez réessayer.";

// Returns a standard auth-required message with an optional action
export const authRequired = (action = "effectuer cette action") =>
  `Vous devez être connecté pour ${action}.`;

// User cannot perform actions on their own content
export const ownerActionNotAllowed =
  "Action indisponible sur vos propres publications.";

// Optionally map common API payloads to messages
export const fromApiError = (error) =>
  error?.response?.data?.message?.toString?.() || genericErrorMsg;
