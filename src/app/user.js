import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { database } from '../database.js';
import { InvariantError } from '../exception/invariant-error.js';
import { EMAIL_REGEX, SALT_ROUNDS } from '../constant.js';
import { getPictureByName } from '../utilities.js';
import { getProfilePictureUrl, uploadProfilePicture } from '../storage.js';

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
        picture:
          getProfilePictureUrl(user.picture) ?? getPictureByName(user.name),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function editCurrentUserHandler(req, res, next) {
  const payload = req.body;

  try {
    let pictureId;
    if (req.file) {
      pictureId = await uploadProfilePicture(req.file);
    }

    await database.user.update({
      where: { id: req.user.id },
      data: {
        name: payload.name,
        gender: payload.gender && parseInt(payload.gender, 10),
        picture: pictureId,
      },
    });

    return res.status(200).json({
      status_code: 200,
      message: 'OK',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}
