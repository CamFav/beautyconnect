const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mediaUrl: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+/i, "URL de média invalide"],
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: ["Coiffure", "Esthétique", "Tatouage", "Maquillage", "Autre"],
      default: "Autre",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

// Index utile pour tri et recherche
postSchema.index({ provider: 1, createdAt: -1 });

// Synchronise les compteurs avant sauvegarde
postSchema.pre("save", function (next) {
  this.likesCount = this.likes?.length || 0;
  this.favoritesCount = this.favorites?.length || 0;
  next();
});

module.exports = mongoose.model("Post", postSchema);
