import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    key: (req, file, cb) => {
      const timestamp = Date.now();
      // Get extension from mimetype or originalname
      let ext = path.extname(file.originalname);
      if (!ext) {
        // fallback: guess from mimetype
        if (file.mimetype === "image/jpeg") ext = ".jpg";
        else if (file.mimetype === "image/png") ext = ".png";
        else if (file.mimetype === "video/mp4") ext = ".mp4";
        else ext = "";
      }
      // Sanitize filename (remove spaces etc)
      const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");
      const filename = `${timestamp}-${baseName}${ext}`;
      cb(null, `vibes/${filename}`);
    },
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || [];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export const uploadProfilePicture = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    key: (req, file, cb) => {
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.originalname}`;
      cb(null, `profiles/${filename}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for profile pictures
  },
  fileFilter: (req, file, cb) => {
    // Only allow images for profile pictures
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for profile pictures"));
    }
  },
});
