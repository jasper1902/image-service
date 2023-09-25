import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { imageDirectory } from "../controllers/image";
import sharp from "sharp";
export const sanitizeFilename = (filename: string): string =>
  filename.replace(/[^a-zA-Z0-9]/g, "_");

export const generateUniqueFilename = (sanitizedFilename: string): string => {
  const uniqueSuffix = uuidv4();
  return `${sanitizedFilename}-${uniqueSuffix}.jpg`;
};

export const writeImageToFile = (
  filename: string,
  imageBuffer: Buffer
): void => {
  fs.writeFileSync(imageDirectory(filename), imageBuffer);
};

export const getImageMetadata = async (filename: string) => {
  const imagePath = `${imageDirectory()}/${filename}`;
  return await sharp(imagePath).metadata();
};

