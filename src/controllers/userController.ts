import {NextFunction, Request, Response} from "express";
import multer from 'multer';
import {v1 as uuidv1} from 'uuid';
import createError from "http-errors";

export const getUser = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement get user details
};

export const uploadAvatar = (req: Request, res: Response, next: NextFunction) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/user-avatars/');
    },
    filename: (req, file, cb) => {
      const extension = file.originalname.split('.').pop()
      cb(null, uuidv1() + '.' + extension?.toLowerCase());
    }
  });

  const upload = multer({storage: storage, limits: {fileSize: 1024 * 1024}});

  upload.single('file')(req, res, (err) => {
    if (err) {
      next(createError(500, err.message));
    } else if (!req.file) {
      next(createError(400, "No file uploaded"));
    } else {
      res.status(200).json({message: "File uploaded successfully"});
    }
  });
}
