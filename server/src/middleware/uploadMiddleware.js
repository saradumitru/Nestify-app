const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { cloudinary, hasCloudinaryConfig } = require("../config/cloudinary");

const uploadPath = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Se pot incarca doar imagini"), false);
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
});

const localFileUrl = (file) => `/uploads/${file.filename}`;

const getUploadedFiles = (req) => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === "object") return Object.values(req.files).flat();
  return [];
};

const uploadFileToCloudinary = async (file) => {
  file.url = localFileUrl(file);

  if (!hasCloudinaryConfig()) {
    return;
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "nestify",
      resource_type: "image",
    });

    file.cloudinaryUrl = result.secure_url;
    file.cloudinaryPublicId = result.public_id;
    file.url = result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed. Falling back to local upload:", error.message);
  }
};

const withCloudinary = (middleware) => {
  return (req, res, next) => {
    middleware(req, res, async (error) => {
      if (error) return next(error);

      try {
        await Promise.all(getUploadedFiles(req).map(uploadFileToCloudinary));
        next();
      } catch (uploadError) {
        next(uploadError);
      }
    });
  };
};

const upload = {
  single: (fieldName) => withCloudinary(multerUpload.single(fieldName)),
  array: (fieldName, maxCount) => withCloudinary(multerUpload.array(fieldName, maxCount)),
  fields: (fields) => withCloudinary(multerUpload.fields(fields)),
  localSingle: (fieldName) => multerUpload.single(fieldName),
};

module.exports = upload;
