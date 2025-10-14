// Composant Avatar réutilisable
export default function Avatar({
  src,
  alt,
  name,
  email,
  size = 40,
  className = "",
}) {
  const baseText = alt || name || email || "";
  const initials =
    baseText
      .trim()
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const dimension = `${size}px`;

  if (src) {
    return (
      <img
        src={src}
        alt={baseText || "avatar"}
        className={`rounded-full object-cover border ${className}`}
        style={{ width: dimension, height: dimension }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gray-400 flex items-center justify-center text-white font-medium border ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {initials}
    </div>
  );
}
