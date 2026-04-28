import multer from "multer";
import path from "path";
import fs from "fs";

// 1. Ensure the uploads directory exists before saving
const uploadDir = "uploads/profiles";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Local Storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Creates a unique filename: e.g., P001-1634567890.jpg
    cb(null, `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// 3. File Filter (Reject PDFs, exes, etc.)
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only! (jpeg, jpg, png)"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});