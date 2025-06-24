// utils/uploadImage.js
const uploadImage = async (file) => {
  try {
    const filename = file.filename;
    const imageUrl = `https://magictree.in/uploads/products/${filename}`; // Update your domain
    return imageUrl;
  } catch (error) {
    console.error("Image upload error:", error.message);
    throw new Error("Image upload failed.");
  }
};

module.exports = { uploadImage };
