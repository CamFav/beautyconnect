const mongoose = require('mongoose');
const Post = require('../../models/Post');

describe('Model - Post (pre save counters)', () => {
  it('updates likes/favorites counters on save', async () => {
    const doc = new Post({
      provider: new mongoose.Types.ObjectId(),
      mediaUrl: 'https://example.com/img.jpg',
      description: 'd',
      category: 'Autre',
      likes: [new mongoose.Types.ObjectId()],
      favorites: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
    });
    await doc.save();
    expect(doc.likesCount).toBe(1);
    expect(doc.favoritesCount).toBe(2);
  });
});

