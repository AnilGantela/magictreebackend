const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
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
