import multer from 'multer';

import { InvariantError } from './exception/invariant-error.js';

const multerStorage = multer.memoryStorage();

const allowedMimetypes = ['image/png', 'image/jpg', 'image/jpeg'];

export const upload = multer({
  storage: multerStorage,
  limits: {
    // no larger than 5mb
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_, file, callback) => {
    if (allowedMimetypes.includes(file.mimetype)) {
      return callback(null, true);
    }
    callback(null, false);
    return callback(
      new InvariantError('Format file tidak valid (png, jpg, atau jpeg)')
    );
  },
});
