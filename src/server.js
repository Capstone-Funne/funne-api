import express from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { database } from './database.js';
import { errorMiddleware, authMiddleware } from './middleware.js';
import { InvariantError } from './exception/invariant-error.js';

const PORT = process.env.PORT || 5000;
const EMAIL_REGEX =
  /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const SALT_ROUNDS = 10;

const app = express();

app.use(express.json());

app.get('/', (_, res) => {
  res.send('Funne API');
});

app.post('/users', async (req, res, next) => {
  const payload = req.body;

  try {
    if (!payload.name) {
      throw new InvariantError('Nama wajib dimasukan');
    }

    if (!payload.email?.match(EMAIL_REGEX)) {
      throw new InvariantError('Email tidak valid');
    }

    if (!payload.password || payload.password.length < 8) {
      throw new InvariantError('Password minimal 8 karakter');
    }

    const isEmailExist = await database.user
      .findFirst({ where: { email: payload.email } })
      .then(Boolean);

    if (isEmailExist) {
      throw new InvariantError('Email tidak dapat digunakan');
    }

    const hashPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);
    await database.user.create({
      data: {
        id: uuid(),
        name: payload.name,
        email: payload.email,
        password: hashPassword,
      },
    });

    return res.status(201).json({
      status_code: 201,
      message: 'Berhasil menambah user baru',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/login', async (req, res, next) => {
  const payload = req.body;

  try {
    if (!payload.email?.match(EMAIL_REGEX)) {
      throw new InvariantError('Email tidak valid');
    }

    if (!payload.password) {
      throw new InvariantError('Password wajib dimasukan');
    }

    const user = await database.user.findFirst({
      where: { email: payload.email },
    });

    const isPasswordMatch = await bcrypt.compare(
      payload.password,
      user?.password ?? ''
    );

    if (user === null || !isPasswordMatch) {
      throw new InvariantError('Email atau password salah');
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    return res.status(200).json({
      status_code: 200,
      message: 'Berhasil masuk',
      data: {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture:
            user.picture ??
            encodeURI(
              `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`
            ),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/users/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await database.user.findFirst({ where: { id: req.user.id } });

    return res.status(200).json({
      status_code: 200,
      message: 'OK',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        picture:
          user.picture ??
          encodeURI(
            `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`
          ),
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
