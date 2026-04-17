const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create the upload folder if it does not exist.
const uploadDir = path.join(__dirname, "../../uploads/payment-slips");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    // Create a simple safe filename for the uploaded file.
    const safeName = file.fieldname + "-" + timestamp + ext;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext || mime) {
    return cb(null, true);
  }

  cb(new Error("Only JPG, JPEG, PNG, or PDF files are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
