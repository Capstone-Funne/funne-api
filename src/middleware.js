import jwt from 'jsonwebtoken';

import { ClientError } from './exception/client-error.js';
import { AuthenticationError } from './exception/authentication-error.js';
import { errors } from './operations.js';

export function authMiddleware(req, _, next) {
  const authorizationHeader = req.headers.authorization;

  try {
    if (!authorizationHeader) {
      throw new AuthenticationError('Otorisasi header wajib di sertakan');
    }

    const [tokenType, accessToken] = authorizationHeader.split(' ');

    if (tokenType !== 'Bearer') {
      throw new AuthenticationError('Jenis token otorisasi tidak valid');
    }

    if (!accessToken) {
      throw new AuthenticationError('Akses token wajib di sertakan');
    }

    try {
      const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = { id: payload.id };

      return next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Akses token sudah kedaluwarsa');
      }

      throw new AuthenticationError('Akses token tidak valid');
    }
  } catch (error) {
    return next(error);
  }
}

// Express error middleware
// Reference: https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
// eslint-disable-next-line no-unused-vars
export function errorMiddleware(error, req, res, next) {
  if (error instanceof ClientError) {
    return res.status(error.statusCode).json({
      status_code: error.statusCode,
      message: error.message,
      data: null,
    });
  }

  errors.express(error, req, res, next);
  return res.status(500).json({
    status_code: 500,
    message: 'Internal Server Error',
    data: null,
  });
}
