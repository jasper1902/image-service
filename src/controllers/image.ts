import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import Photo from "../models/Photo";
import { AdminAuthRequest } from "../middlewares/verify";
import {
  generateUniqueFilename,
  getImageMetadata,
  sanitizeFilename,
  writeImageToFile,
} from "../utils/image";

export const imageDirectory = (filename?: string) => {
  const basePath =
    process.env.NODE_ENV === "production"
      ? path.join(__dirname, "..", "..", "..", "src", "public", "images")
      : path.join(__dirname, "..", "public", "images");
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }
  const imagePath = filename ? path.join(basePath, filename) : basePath;
  return imagePath;
};

export const getImages = async (req: Request, res: Response) => {
  try {
    const pageQueryParam = req.query.page;
    const perPageQueryParam = req.query.perPage;

    const page = pageQueryParam ? parseInt(pageQueryParam as string) : 1;
    const perPage = perPageQueryParam
      ? parseInt(perPageQueryParam as string)
      : 40;

    const totalPhotos = await Photo.countDocuments();
    const totalPages = Math.ceil(totalPhotos / perPage);

    const photos = await Photo.find()
      .skip((page - 1) * perPage)
      .limit(perPage);

    const photoPromises = photos.map(async (i) => {
      try {
        return await i.toPhotoResponse();
      } catch (error) {
        console.error("Error processing photo:", error);
        return null;
      }
    });

    const photo = await Promise.all(photoPromises);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    res.status(200).json({
      photo,
      totalPages,
      totalPhotos,
      currentPage: page,
      nextPage,
      prevPage,
    });
  } catch (error) {
    console.error("Error retrieving images:", error);
    res.status(500).send("Error retrieving images.");
  }
};

export const saveImage = async (req: Request, res: Response) => {
  try {
    const filename = req.header("filename");
    if (!filename) {
      return res.status(400).send("No filename specified");
    }

    const imageData = JSON.parse(req.body.toString("utf8"));
    const imageBuffer = Buffer.from(imageData.file.buffer.data);

    const sanitizedFilename = sanitizeFilename(filename);
    const uniqueFilename = generateUniqueFilename(sanitizedFilename);

    writeImageToFile(uniqueFilename, imageBuffer);

    const imageInfo = await getImageMetadata(uniqueFilename);
    const newReq = req as unknown as AdminAuthRequest;
    const savedPhoto = await Photo.create({
      url: `/public/images/${uniqueFilename}`,
      width: imageInfo.width,
      height: imageInfo.height,
      filename: uniqueFilename,
      alt: imageData.alt,
      uploader: newReq.userId,
      tagList: imageData.tagList,
    });

    res.status(200).json({ photo: await savedPhoto.toPhotoResponse() });
  } catch (error) {
    console.error("Error saving image:", error);
    res.status(500).send("Error saving image.");
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).json({ message: "No filename specified" });
    }

    const deletePhoto = await Photo.findOneAndDelete({ filename });

    if (!deletePhoto) {
      return res.status(404).json({ message: "photo not found" });
    }

    if (fs.existsSync(imageDirectory(filename))) {
      fs.unlinkSync(imageDirectory(filename));

      res.status(204).json({ message: "Image deleted successfully." });
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).send("Error deleting image.");
  }
};
