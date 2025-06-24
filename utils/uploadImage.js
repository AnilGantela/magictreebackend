const cloudinary = require("../config/cloudinary");

const uploadImage = async (image, folder = "products") => {
  try {
    let uploadedImage;

    if (image.startsWith("data:image")) {
      uploadedImage = await cloudinary.uploader.upload(image, {
        folder,
        transformation: [
          { width: 500, height: 500, crop: "fill" },
          { quality: "auto:low" },
          { fetch_format: "auto" },
          { flags: "progressive" },
          { dpr: "auto" },
        ],
      });
    } else {
      uploadedImage = await cloudinary.uploader.upload(image, {
        folder,
      });
    }

    return uploadedImage.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    throw new Error("Image upload failed.");
  }
};

module.exports = { uploadImage };
