import express from 'express';
import multer from 'multer';

import { errorMiddleware, authMiddleware } from './middleware.js';
import {
  createUserHandler,
  editCurrentUserHandler,
  getCurrentUserHandler,
} from './app/user.js';
import { createAuthHandler } from './app/auth.js';
import { extractTextFromImageHandler } from './app/vision.js';
import { analyzeIngredientsHandler } from './app/ingredient.js';

const PORT = process.env.PORT || 5000;

const app = express();

const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: {
    // no larger than 5mb
    fileSize: 5 * 1024 * 1024,
  },
});

app.use(express.json());

app.post('/login', createAuthHandler);
app.post('/users', createUserHandler);
app.get('/users/me', authMiddleware, getCurrentUserHandler);
app.put(
  '/users/me',
  authMiddleware,
  upload.single('picture'),
  editCurrentUserHandler
);
app.post(
  '/visions/images',
  authMiddleware,
  upload.single('image'),
  extractTextFromImageHandler
);
app.post('/ingredients/analyze', authMiddleware, analyzeIngredientsHandler);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
