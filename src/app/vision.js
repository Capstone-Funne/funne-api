import vision from '@google-cloud/vision';

import { InvariantError } from '../exception/invariant-error.js';
import { uploadIngredientsPicture } from '../storage.js';

const client = new vision.ImageAnnotatorClient();

export async function extractTextFromImageHandler(req, res, next) {
  const { file } = req;

  try {
    if (file === undefined) {
      throw new InvariantError('Gambar tidak ditemukan');
    }

    const [result] = await client.textDetection(file.buffer);
    const detection = result.fullTextAnnotation;

    const imageId = await uploadIngredientsPicture(file);

    return res.status(200).json({
      status_code: 200,
      message: 'OK',
      data: {
        text: detection.text,
        image_id: imageId,
      },
    });
  } catch (error) {
    return next(error);
  }
}
