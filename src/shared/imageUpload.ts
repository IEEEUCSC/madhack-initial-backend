import {NextFunction, Request, Response} from "express";
import multer from "multer";
import {v1 as uuid_v1} from "uuid";
import createError from "http-errors";
import multerS3 from "multer-s3";
import {S3Client} from "@aws-sdk/client-s3";

// const s3 = new aws.S3();
const s3 = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_ACCESS_SECRET || "",
  }
})

// aws.config.update({
//   secretAccessKey: process.env.S3_ACCESS_SECRET,
//   accessKeyId: process.env.S3_ACCESS_KEY,
//   region: "ap-southeast-1",
// });

const fileFilter = (req: Request, file: Express.Multer.File, cb: CallableFunction) => {
  console.log(req);
  if (!file || !file.mimetype) {
    return cb(createError(400, "No image uploaded"), false);
  }
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    if (file.size > 1024 * 1024) {
      return cb(createError(400, "File size is too large!"), false);
    } else {
      return cb(null, true);
    }
  } else {
    cb(createError(400, "Only .jpg and .png files are allowed!"), false);
  }
}

export const uploadToS3 = (req: Request, res: Response, next: NextFunction) => {
  const upload = multer({
    fileFilter: fileFilter,
    storage: multerS3({
      s3: s3,
      bucket: "madhack-agon-taskopolis",
      metadata: (req, file, cb) => {
        cb(null, {fieldName: "TESTING_METADATA"});
      },
      key: (req, file, cb) => {
        const extension = file.originalname.split('.').pop();
        cb(null, "uploads/user-avatars/" + uuid_v1() + '.' + extension?.toLowerCase());
      },
    }),
  });

  upload.single('file')(req, res, (err) => {
    if (err) {
      next(createError(err.status, err.message));
    } else if (!req.file) {
      next(createError(400, "No image uploaded"));
    } else {
      // @ts-ignore
      const {location} = req.file;
      res.status(200).json({message: "Image uploaded successfully", avatarUrl: location});
    }
  });
}

export const uploadToDisk = (req: Request, res: Response, next: NextFunction) => {
  const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: CallableFunction) => {
      cb(null, 'uploads/user-avatars/');
    },
    filename: (req, file, cb) => {
      const extension = file.originalname.split('.').pop()
      cb(null, uuid_v1() + '.' + extension?.toLowerCase());
    }
  });

  const upload = multer({storage: storage, limits: {fileSize: 1024 * 1024}});

  upload.single('file')(req, res, (err) => {
    if (err) {
      next(createError(500, err.message));
    } else if (!req.file) {
      next(createError(400, "No image uploaded"));
    } else {
      res.status(200).json({message: "Image uploaded successfully", avatarUrl: req.file.path});
    }
  });
}
