const Product = require("../models/Product");
const { categoryValues, subcategoryValues } = require("../categories");
const { uploadImage } = require("../utils/uploadImage");
const Review = require("../models/Review");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, subcategory, stock, discount } =
      req.body;

    // Validate category and subcategory
    if (!categoryValues.includes(category)) {
      return res.status(400).json({ message: "Invalid category." });
    }

    if (subcategory && !subcategoryValues.includes(subcategory)) {
      return res.status(400).json({ message: "Invalid subcategory." });
    }
    const baseProductPrice = Number(price);

    const productGstPercent = 18;
    const razorpayFeePercent = 3;
    const razorpayGstPercent = 18;

    // Step 1: Add 18% GST on the product
    const productGst = (baseProductPrice * productGstPercent) / 100;
    const totalChargedToCustomer = baseProductPrice + productGst;

    // Step 2: Calculate Razorpay base fee (3% of totalChargedToCustomer)
    const razorpayFee = (totalChargedToCustomer * razorpayFeePercent) / 100;

    // Step 3: Calculate GST on Razorpay fee
    const razorpayGst = (razorpayFee * razorpayGstPercent) / 100;

    // Step 4: Total Razorpay deduction
    const totalRazorpayDeduction = razorpayFee + razorpayGst;

    // Step 5: Final payout after deduction
    const finalPrice =
      Math.round((totalChargedToCustomer + totalRazorpayDeduction) * 100) / 100;

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

    // Create the product with the final price
    const newProduct = new Product({
      name,
      description,
      price: finalPrice, // Use the final price after adding the extra percentage
      images: imageUrls,
      category,
      subcategory: subcategory || null,
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

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res
      .status(200)
      .json({ message: "Products fetched successfully", products });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const reviews = await Review.find({ product: id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Product fetched successfully",
      product,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

const getProductsBySubcategory = async (req, res) => {
  try {
    const { subcategory } = req.params;

    // Ensure the subcategory check is case-insensitive
    if (
      !subcategoryValues.some(
        (value) => value.toLowerCase() === subcategory.toLowerCase()
      )
    ) {
      return res.status(400).json({ message: "Invalid subcategory." });
    }

    // Fetch products by subcategory with case-insensitive regex
    const products = await Product.find({
      subcategory: { $regex: new RegExp(`^${subcategory}$`, "i") },
    });

    // Log products to check if they are fetched correctly
    console.log("Fetched products:", products);

    if (products.length === 0) {
      return res
        .status(200)
        .json({ message: "No products found for this subcategory." });
    }

    res.status(200).json({
      message: "Products fetched successfully by subcategory",
      products,
    });
  } catch (error) {
    console.error("Error fetching products by subcategory:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsBySubcategory,
};
