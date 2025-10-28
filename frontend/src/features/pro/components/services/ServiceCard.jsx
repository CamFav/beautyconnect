import { Pencil, Trash2 } from "lucide-react";

export default function ServiceCard({ service, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 flex justify-between items-start">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
        <p className="text-sm text-gray-600">
          {service.price}€ · {service.duration} min
        </p>
        {service.description && (
          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <Pencil size={16} />
          Modifier
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-red-600 hover:text-red-800"
        >
          <Trash2 size={16} />
          Supprimer
        </button>
      </div>
    </div>
  );
}
