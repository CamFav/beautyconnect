const cloudinary = require("cloudinary").v2;

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  NODE_ENV,
} = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true, // force HTTPS sur les URLs Cloudinary
});

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  const msg = "Cloudinary environment variables are missing!";
  if (NODE_ENV !== "production") {
    console.warn(msg);
  } else {
    console.error("Cloudinary configuration error — startup aborted.");
    process.exit(1);
  }
}

module.exports = cloudinary;
