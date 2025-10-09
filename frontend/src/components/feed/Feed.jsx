export default function Feed() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-2">Derniers posts</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="aspect-square bg-gray-200 rounded"></div>
        <div className="aspect-square bg-gray-200 rounded"></div>
        <div className="aspect-square bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}