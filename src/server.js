import express from 'express';
import multer from 'multer';

import { errorMiddleware, authMiddleware } from './middleware.js';
import {
  createUserHandler,
  getCurrentUserHandler,
  createResetPasswordHandler,
  renderResetPasswordPageHandler,
  editPasswordHandler,
} from './app/user.js';
import { createAuthHandler } from './app/auth.js';
import { extractTextFromImageHandler } from './app/vision.js';
import { analyzeIngredientsHandler } from './app/ingredient.js';

const PORT = process.env.PORT || 5000;

const app = express();

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

app.use(express.json());

app.post('/login', createAuthHandler);
app.post('/users', createUserHandler);
app.get('/users/me', authMiddleware, getCurrentUserHandler);
app.post(
  '/visions/images',
  authMiddleware,
  upload.single('image'),
  extractTextFromImageHandler
);
app.post('/ingredients/analyze', authMiddleware, analyzeIngredientsHandler);
app.post('/reset-password', createResetPasswordHandler);
app.put('/passwords', editPasswordHandler);
app.get('/reset-password', renderResetPasswordPageHandler);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
