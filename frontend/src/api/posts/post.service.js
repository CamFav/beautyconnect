import httpClient from "../http/httpClient";

const POSTS_URL = "/posts";

// Créer un post (Prestataire)
export const createPost = async (formData) => {
  const data = new FormData();
  data.append("description", formData.description || "");
  data.append("category", formData.category || "");
  if (formData.media) {
    data.append("media", formData.media);
  }

  const res = await httpClient.post(POSTS_URL, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Récupérer tous les posts (Feed client)
export const getPosts = async () => {
  const res = await httpClient.get(POSTS_URL);
  return Array.isArray(res.data)
    ? res.data
    : res.data.posts || res.data.data || [];
};

// Like / Unlike un post
export const likePost = async (postId) => {
  const res = await httpClient.post(`${POSTS_URL}/${postId}/like`);
  return res.data;
};

// Mettre à jour un post
export const updatePost = async (postId, data) => {
  const res = await httpClient.patch(`${POSTS_URL}/${postId}`, data);
  return res.data.post;
};

// Supprimer un post
export const deletePost = async (postId) => {
  const res = await httpClient.delete(`${POSTS_URL}/${postId}`);
  return res.data;
};

// Ajouter / Retirer un favori
export const favoritePost = async (postId) => {
  const res = await httpClient.post(`${POSTS_URL}/${postId}/favorite`);
  return res.data;
};
