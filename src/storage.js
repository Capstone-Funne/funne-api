import { Storage } from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';
import path from 'path';

const storage = new Storage();

export async function uploadProfilePicture(file) {
  return new Promise((resolve, reject) => {
    const bucket = storage.bucket(process.env.GCS_USER_PICTURE_BUCKET);

    const pictureExtension = path.extname(file.originalname);
    const pictureId = uuid() + pictureExtension;

    const blob = bucket.file(pictureId);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (error) => reject(error));
    blobStream.on('finish', () => resolve(pictureId));
    blobStream.end(file.buffer);
  });
}

export function getProfilePictureUrl(pictureId) {
  if (!pictureId) return null;
  const bucket = storage.bucket(process.env.GCS_USER_PICTURE_BUCKET);
  const file = bucket.file(pictureId);
  return file.publicUrl();
}

export function getProductPictureUrl(pictureId) {
  if (!pictureId) return null;
  const bucket = storage.bucket(process.env.GCS_PRODUCT_PICTURE_BUCKET);
  const file = bucket.file(pictureId);
  return file.publicUrl();
}
