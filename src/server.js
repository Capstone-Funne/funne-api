const express = require('express');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

const { database } = require('./database');

const PORT = process.env.PORT || 5000;
const EMAIL_REGEX =
  /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const SALT_ROUNDS = 10;

const app = express();

app.use(express.json());

app.get('/', (_, res) => {
  res.send('Funne API');
});

app.post('/users', async (req, res) => {
  const payload = req.body;
  try {
    if (!payload.name) {
      return res.status(400).json({
        status_code: 400,
        message: 'Bad Request',
        error: 'Wajib memasukkan nama',
      });
    }

    if (!payload.email?.match(EMAIL_REGEX)) {
      return res.status(400).json({
        status_code: 400,
        message: 'Bad Request',
        error: 'Masukkan email yang valid',
      });
    }

    if (!payload.password || payload.password.length < 8) {
      return res.status(400).json({
        status_code: 400,
        message: 'Bad Request',
        error: 'Password minimal 8 karakter',
      });
    }

    const isEmailExist = await database.user
      .findFirst({ where: { email: payload.email } })
      .then(Boolean);

    if (isEmailExist) {
      return res.status(400).json({
        status_code: 400,
        message: 'Bad Request',
        error: 'Email sudah terpakai, silahkan coba yang email lain',
      });
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
    return res
      .status(201)
      .json({ status_code: 201, message: 'Registrasi berhasil', data: null });
  } catch (error) {
    console.error(JSON.stringify(error));
    return res.status(500).json({
      status_code: 500,
      message: 'Internal Server Error',
      error: 'Maaf ada sesuatu yang salah di server',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
