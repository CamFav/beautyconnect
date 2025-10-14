export default function Step1Activity({ activityType, setActivityType }) {
  return (
    <div>
      <p className="mb-4 text-gray-700">
        Choisissez votre type d’activité :
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActivityType("salon")}
          className={`border rounded p-4 text-left hover:bg-gray-50 ${
            activityType === "salon"
              ? "border-blue-600 ring-1 ring-blue-600"
              : "border-gray-300"
          }`}
        >
          <div className="font-medium">Je travaille dans un salon</div>
          <div className="text-sm text-gray-500">
            Vous faites partie d’un établissement
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActivityType("freelance")}
          className={`border rounded p-4 text-left hover:bg-gray-50 ${
            activityType === "freelance"
              ? "border-blue-600 ring-1 ring-blue-600"
              : "border-gray-300"
          }`}
        >
          <div className="font-medium">Je suis freelance</div>
          <div className="text-sm text-gray-500">
            Vous travaillez à votre compte
          </div>
        </button>
      </div>
    </div>
  );
}
