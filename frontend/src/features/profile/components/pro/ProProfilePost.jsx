import PostModal from "../../../../components/feedback/PostModal";

export default function ProProfilePost({
  posts = [],
  visiblePosts = [],
  showAll,
  setShowAll,
  selectedPost,
  setSelectedPost,
  handleUpdatePost,
  isOwner,
}) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-5 text-gray-800">
        Dernières publications
      </h2>

      {posts.length === 0 ? (
        <p className="text-gray-500">Aucune publication pour le moment.</p>
      ) : (
        <>
          {/* Grille responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visiblePosts.map((post) => (
              <div
                key={post._id}
                role="button"
                tabIndex={0}
                aria-label="Voir la publication"
                className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 focus:ring-2 focus:ring-blue-400"
                onClick={() => setSelectedPost(post)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPost(post);
                  }
                }}
              >
                <img
                  src={post.mediaUrl}
                  alt="Publication"
                  className="w-full h-full object-cover aspect-square transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Bouton Voir + / Voir - */}
          {posts.length > visiblePosts.length && (
            <div className="mt-5 text-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="text-blue-600 hover:underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              >
                Voir plus
              </button>
            </div>
          )}

          {showAll && posts.length > 3 && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setShowAll(false)}
                className="text-blue-600 hover:underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              >
                Voir moins
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <PostModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onUpdate={handleUpdatePost}
        canEdit={isOwner}
      />
    </section>
  );
}
