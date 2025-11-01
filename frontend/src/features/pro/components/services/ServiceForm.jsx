export default function ServiceForm({
  editingService,
  serviceName,
  price,
  duration,
  description,
  setServiceName,
  setPrice,
  setDuration,
  setDescription,
  onSave,
  onCancel,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">
        {editingService ? "Modifier le service" : "Nouveau service"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nom du service *"
          className="border rounded-lg px-3 py-2"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Prix (€) *"
          className="border rounded-lg px-3 py-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Durée (minutes) *"
          className="border rounded-lg px-3 py-2"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <textarea
          placeholder="Description (optionnel)"
          className="border rounded-lg px-3 py-2 md:col-span-2"
          value={description}
          maxLength={80}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1 md:col-span-2">
          {description?.length || 0}/80 caractères
        </p>
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
