import { Storage } from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';
import path from 'path';

const storage = new Storage();

export async function uploadIngredientsPicture(file) {
  return new Promise((resolve, reject) => {
    const bucket = storage.bucket(process.env.GCS_INGREDIENTS_PICTURE_BUCKET);

    const pictureExtension = path.extname(file.originalname);
    const pictureId = uuid() + pictureExtension;

    const blob = bucket.file(pictureId);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (error) => reject(error));
    blobStream.on('finish', () => resolve(pictureId));
    blobStream.end(file.buffer);
  });
}

export async function getIngredientsPictureUrl(pictureId) {
  if (!pictureId) return null;
  const bucket = storage.bucket(process.env.GCS_INGREDIENTS_PICTURE_BUCKET);
  const file = bucket.file(pictureId);
  const [isExist] = await file.exists();
  if (!isExist) return null;
  return file.publicUrl();
}
