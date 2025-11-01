export default function StickyFooterButton({
  label,
  onClick,
  disabled,
  children,
}) {
  return (
    <div className="sticky bottom-4 w-full flex justify-center mt-8 z-50">
      <div className="backdrop-blur bg-white/80 border border-gray-200 rounded-xl shadow-lg px-4 py-2 flex items-center gap-3">
        <button
          onClick={onClick}
          disabled={disabled}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400"
        >
          {label}
        </button>
        {children && children}{" "}
      </div>
    </div>
  );
}
