import dotenv from "dotenv";
dotenv.config();
export const appEnv = {
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudName: process.env.CLOUD_NAME,
};
