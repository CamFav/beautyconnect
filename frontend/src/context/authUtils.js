export const sanitize = (value) => {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .replace(/[<>]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
};

export const sanitizeObject = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitize(v)]));

export const normalizeUser = (raw) => {
  if (!raw) return null;
  const u = { ...raw };
  if (!u.activeRole) u.activeRole = u.role ?? "client";
  if (u.activeRole === "pro" && !u.proProfile) {
    u.proProfile = {
      businessName: "",
      status: "freelance",
      exerciseType: [],
      experience: "<1 an",
      location: "",
      services: [],
      siret: "",
    };
  }
  return u;
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
