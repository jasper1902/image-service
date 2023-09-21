import express, { Router } from "express";

import verifyAdmin from "../middlewares/verify";
import { deleteImage, getImages, saveImage } from "../controllers/image";

const router: Router = express.Router();

router.get("/", [verifyAdmin], getImages);

router.post("/upload", [verifyAdmin], saveImage);

router.delete("/delete/:filename", [verifyAdmin], deleteImage);

export default router;
