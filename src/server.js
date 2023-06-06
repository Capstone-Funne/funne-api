import express from 'express';
import multer from 'multer';

import { errorMiddleware, authMiddleware } from './middleware.js';
import { createUserHandler, getCurrentUserHandler } from './app/user.js';
import { createAuthHandler } from './app/auth.js';
import { extractTextFromImageHandler } from './app/vision.js';
import { analyzeIngredientsHandler } from './app/ingredient.js';

const PORT = process.env.PORT || 5000;

const app = express();

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

app.use(express.json());

const v1 = express.Router();
v1.post('/auth', createAuthHandler);
v1.post('/users', createUserHandler);
v1.get('/users/me', authMiddleware, getCurrentUserHandler);
v1.post(
  '/visions/images',
  authMiddleware,
  upload.single('image'),
  extractTextFromImageHandler
);
v1.post('/ingredients/analyze', authMiddleware, analyzeIngredientsHandler);
app.use('/api/v1', v1);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
