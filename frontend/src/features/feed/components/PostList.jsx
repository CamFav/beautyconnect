import PostCard from "./PostCard";

export default function PostList({
  posts = [],
  user,
  handleLike,
  handleFavorite,
  handleImageClick,
}) {
  const sanitize = (val) =>
    typeof val === "string" ? val.trim().replace(/[<>]/g, "") : val;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pr-2 min-h-0 pb-32">
      <h2 className="text-xl font-semibold mb-4">Derniers posts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(posts) &&
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={{
                ...post,
                title: sanitize(post.title),
                content: sanitize(post.content),
                provider: post.provider ? { ...post.provider } : null,
              }}
              user={user}
              handleLike={handleLike}
              handleFavorite={handleFavorite}
              handleImageClick={handleImageClick}
            />
          ))}
        <div className="h-24" />
      </div>
    </div>
  );
}
