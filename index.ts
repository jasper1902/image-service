import express from "express";
import morgan from "morgan";
import path from "path";
import * as dotenv from "dotenv";
import connectDB from "./src/configs/db";
import userRoute from "./src/routes/user";
import imageRoute from "./src/routes/image";
dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();
connectDB(process.env.MONGO_URI as string);

app.use(express.json({ limit: "50mb" }));
app.use(express.raw({ type: "application/octet-stream", limit: "50mb" }));
app.use(morgan("dev"));

app.use("/api/account", userRoute);
app.use("/api/images", imageRoute);

app.use("/public", express.static(path.join(__dirname, "src", "public")));

app.get("/public/images/:imageName", (req, res) => {
  const imagePath = path.join(
    __dirname,
    "src",
    "public",
    "images",
    req.params.imageName
  );

  res.sendFile(imagePath, (error) => {
    if (error) {
      console.error("Error sending file:", error);
      res.status(404).send("Image not found");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
