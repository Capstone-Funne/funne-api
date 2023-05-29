import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { database } from '../database.js';
import { InvariantError } from '../exception/invariant-error.js';
import { EMAIL_REGEX } from '../constant.js';
import { getPictureByName } from '../utilities.js';

export async function createAuthHandler(req, res, next) {
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
          picture: user.picture ?? getPictureByName(user.name),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}
