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
import { getProductsHandler } from './app/product.js';
import { getSolutionsHandler } from './app/solution.js';
import { getUserHistoryHandler } from './app/history.js';

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

const v1 = express.Router();
v1.post('/auth', createAuthHandler);
v1.post('/users', createUserHandler);
v1.get('/users/me', authMiddleware, getCurrentUserHandler);
v1.put(
  '/users/me',
  authMiddleware,
  upload.single('picture'),
  editCurrentUserHandler
);
v1.get('/products', authMiddleware, getProductsHandler);
v1.get('/solutions', authMiddleware, getSolutionsHandler);
v1.post(
  '/visions/images',
  authMiddleware,
  upload.single('image'),
  extractTextFromImageHandler
);
v1.post('/ingredients/analyze', authMiddleware, analyzeIngredientsHandler);
v1.get('/histories', authMiddleware, getUserHistoryHandler);
app.use('/api/v1', v1);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
