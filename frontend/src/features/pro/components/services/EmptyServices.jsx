export default function EmptyServices({ onAdd }) {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-xl font-medium text-gray-800 mb-2">
        Aucun service pour le moment
      </h2>
      <p className="text-gray-600 text-sm">
        Ajoutez vos prestations avec leurs tarifs et durées.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
      >
        Ajouter un service
      </button>
    </div>
  );
}
