import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const imageDirectory = (filename?: string) => {
  const basePath =
    process.env.NODE_ENV === "production"
      ? path.join(__dirname, "..", "..", "..", "src", "public", "images")
      : path.join(__dirname, "..", "public", "images");
  const imagePath = filename ? path.join(basePath, filename) : basePath;
  return imagePath;
};

export const getImages = (req: Request, res: Response) => {
  try {
    const imageFiles = fs.readdirSync(imageDirectory());
    const images = imageFiles.map((fileName) => {
      return {
        filename: fileName,
        url: `/public/images/${fileName}`,
      };
    });

    res.status(200).json(images);
  } catch (error) {
    console.error("Error retrieving images:", error);
    res.status(500).send("Error retrieving images.");
  }
};

export const saveImage = (req: Request, res: Response) => {
  try {
    const filename = req.header("filename");
    if (!filename) {
      return res.status(400).send("No filename specified");
    }

    const uniqueSuffix = uuidv4();
    const sanitizedOriginalName = filename.replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${sanitizedOriginalName}-${uniqueSuffix}.jpg`;

    fs.mkdirSync(imageDirectory(), { recursive: true });
    fs.writeFileSync(imageDirectory(uniqueFilename), req.body);

    res.status(200).json({ message: "Image uploaded and saved successfully." });
  } catch (error) {
    console.error("Error saving image:", error);
    res.status(500).send("Error saving image.");
  }
};

export const deleteImage = (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).json({ message: "No filename specified" });
    }

    if (fs.existsSync(imageDirectory(filename))) {
      fs.unlinkSync(imageDirectory(filename));

      res.status(200).json({ message: "Image deleted successfully." });
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).send("Error deleting image.");
  }
};
