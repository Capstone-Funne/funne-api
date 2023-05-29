import express from 'express';

import { errorMiddleware, authMiddleware } from './middleware.js';
import { createUserHandler, getCurrentUserHandler } from './app/user.js';
import { createAuthHandler } from './app/auth.js';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.post('/login', createAuthHandler);
app.post('/users', createUserHandler);
app.get('/users/me', authMiddleware, getCurrentUserHandler);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
