// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); // ✅ using your custom multer
const productController = require("../contollers/productController");
const verifyAdminToken = require("../middlewares/adminAuthentication");

router.post(
  "/create",
  verifyAdminToken,
  upload.array("images", 5),
  productController.createProduct
);

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get(
  "/subcategory/:subcategory",
  productController.getProductsBySubcategory
);

module.exports = router;
