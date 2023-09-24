import mongoose, { Document, Model, Schema } from "mongoose";
import User from "./User";

interface IPhoto extends Document {
  url: string;
  width: number;
  height: number;
  alt?: string;
  filename?: string;
  uploader: Schema.Types.ObjectId;
  tagList: string[];
}

interface IPhotoMethods {
  toPhotoResponse(): Promise<ToPhotoResponse>;
}

type PhotoModel = Model<IPhoto, object, IPhotoMethods>;

interface PhotoDocument extends Document, IPhoto, IPhotoMethods {
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new mongoose.Schema<IPhoto, PhotoModel, IPhotoMethods>(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    alt: {
      type: String,
    },
    filename: {
      type: String,
      unique: true,
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tagList: [String],
  },
  { timestamps: true }
);

interface ToPhotoResponse {
  id: Schema.Types.ObjectId;
  width: number;
  height: number;
  url: string;
  alt?: string;
  filename?: string;
  tagList?: string[];
  uploader?: string;
  createdAt: Date;
  updatedAt: Date;
}

PhotoSchema.method("toPhotoResponse", async function toPhotoResponse(): Promise<
  ToPhotoResponse | undefined
> {
  const photo = this as PhotoDocument;
  const user = await User.findById(photo.uploader);
  const photoResponse: ToPhotoResponse = {
    id: photo._id.toString(),
    url: photo.url,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    filename: photo.filename,
    tagList: photo.tagList,
    uploader: user?.username,
    createdAt: photo.createdAt,
    updatedAt: photo.updatedAt,
  };
  return photoResponse;
});

const Photo = mongoose.model<IPhoto, PhotoModel>("Photo", PhotoSchema);
export default Photo;
