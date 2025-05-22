import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { v4 } from "uuid";
import { appEnv } from "../config/env";

cloudinary.config({
  api_key: appEnv.cloudinaryApiKey,
  api_secret: appEnv.cloudinaryApiSecret,
  cloud_name: appEnv.cloudName,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: () => ({
    public_id: v4(),
    folder: "cces",
  }),
});

const upload = multer({ storage: storage });
export default upload;
