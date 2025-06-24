const path = require("path");

const uploadImage = async (file) => {
  try {
    // file contains info from multer, like path and filename
    const filename = file.filename; // already renamed by multer
    const publicUrl = `https://yourdomain.com/uploads/products/${filename}`;
    return publicUrl;
  } catch (error) {
    console.error("Image upload error:", error.message);
    throw new Error("Image upload failed.");
  }
};

module.exports = { uploadImage };
