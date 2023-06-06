import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { PasswordResetStatus } from '@prisma/client';
import fs from 'fs/promises';
import ejs from 'ejs';

import { database } from '../database.js';
import { InvariantError } from '../exception/invariant-error.js';
import { EMAIL_REGEX, SALT_ROUNDS } from '../constant.js';
import { getPictureByName } from '../utilities.js';
import { mailer } from '../mailer.js';

const resetPasswordEmailTemplate = await fs.readFile(
  'src/templates/password-reset-email.ejs'
);

const resetPasswordPageTemplate = await fs.readFile(
  'src/templates/password-reset-page.ejs'
);

export async function createUserHandler(req, res, next) {
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
}

export async function getCurrentUserHandler(req, res, next) {
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
        picture: user.picture ?? getPictureByName(user.name),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createResetPasswordHandler(req, res, next) {
  const payload = req.body;

  try {
    if (!payload.email?.match(EMAIL_REGEX)) {
      throw new InvariantError('Email tidak valid');
    }

    const user = await database.user.findFirst({
      where: { email: payload.email },
    });

    if (user === null) {
      throw new InvariantError('Email tidak ditemukan');
    }

    const resetPasswordToken = crypto.randomBytes(16).toString('hex');

    const revokeExistingTokens = database.passwordResetTokens.updateMany({
      where: {
        user: { email: payload.email },
        status: PasswordResetStatus.PENDING,
      },
      data: { status: PasswordResetStatus.INVALID },
    });

    const createNewToken = database.passwordResetTokens.create({
      data: {
        id: uuid(),
        userId: user.id,
        token: resetPasswordToken,
      },
    });

    await database.$transaction([revokeExistingTokens, createNewToken]);

    const html = ejs.render(resetPasswordEmailTemplate.toString(), {
      name: user.name,
      url: `${process.env.BASE_URL}/reset-password?token=${resetPasswordToken}`,
    });

    await mailer.sendMail({
      from: `Funne App <${process.env.EMAIL_ADDRESS}>`,
      to: payload.email,
      subject: 'Permintaan Reset Password',
      html,
    });

    return res.status(201).json({
      status_code: 201,
      message: 'Link permintaan reset password telah di kirim melalui email',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function editPasswordHandler(req, res, next) {
  const payload = req.body;

  try {
    if (!payload.token) {
      throw new InvariantError('Reset password token tidak ditemukan');
    }

    if (!payload.password || payload.password.length < 8) {
      throw new InvariantError('Password minimal 8 karakter');
    }

    const token = await database.passwordResetTokens.findFirst({
      where: { token: payload.token, status: PasswordResetStatus.PENDING },
    });

    if (token === null) {
      throw new InvariantError('Reset password token tidak valid');
    }

    const hashPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);

    const updateUserPassword = database.user.update({
      where: { id: token.userId },
      data: { password: hashPassword },
    });

    const invalidateToken = database.passwordResetTokens.update({
      where: { id: token.id },
      data: { status: PasswordResetStatus.INVOKED },
    });

    await database.$transaction([updateUserPassword, invalidateToken]);

    return res.status(200).json({
      status_code: 200,
      message: 'Berhasil mengubah password',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function renderResetPasswordPageHandler(req, res) {
  const html = ejs.render(resetPasswordPageTemplate.toString());
  res.send(html);
}
