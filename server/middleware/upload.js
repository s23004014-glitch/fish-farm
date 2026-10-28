import multer from "multer";
import path from "path";
import crypto from "crypto";

// Only these image types are allowed. The file extension comes from this list,
// never from the name the user sent.
const allowedTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve("uploads")),
  filename: (req, file, cb) => {
    const randomName = crypto.randomBytes(12).toString("hex");
    cb(null, `${Date.now()}-${randomName}${allowedTypes[file.mimetype]}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedTypes[file.mimetype]) return cb(null, true);
  const error = new Error("Only JPG, PNG or WEBP images are allowed");
  error.statusCode = 400;
  cb(error);
};

// Max size 2MB, one file only
const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024, files: 1 } });

export default upload;