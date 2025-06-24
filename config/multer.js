// config/multer.js
const path = require("path");
const multer = require("multer");

// Set storage to /public/uploads/products (this must be inside your cPanel's public_html if deployed)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/products"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
module.exports = upload;
