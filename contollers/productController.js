const Product = require("../models/Product");
const { categoryValues } = require("../categories");
const { uploadImage } = require("../utils/uploadImage");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, discount } = req.body;

    if (!categoryValues.includes(category)) {
      return res.status(400).json({ message: "Invalid category." });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) => uploadImage(file.path));
        imageUrls = await Promise.all(uploadPromises);
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({ message: "Image upload failed." });
      }
    }

    const newProduct = new Product({
      name,
      description,
      price,
      images: imageUrls,
      category,
      stock,
      discount: discount || 0,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

const hi = async (req, res) => {
  try {
    res.status(200).json({ message: "Hello from the product controller!" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createProduct,
  hi,
};
