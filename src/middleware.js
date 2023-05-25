const jwt = require('jsonwebtoken');

const { ClientError } = require('./exception/client-error');
const { AuthenticationError } = require('./exception/authentication-error');

function authMiddleware(req, _, next) {
  const bearerToken = req.headers.authorization;

  try {
    if (!bearerToken) {
      throw new AuthenticationError('Otorisasi token header wajib di sertakan');
    }

    const [tokenType, accessToken] = bearerToken.split(' ');

    if (tokenType !== 'Bearer') {
      throw new AuthenticationError('Tipe otorisasi token tidak valid');
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
function errorMiddleware(error, req, res, next) {
  if (error instanceof ClientError) {
    return res.status(error.statusCode).json({
      status_code: error.statusCode,
      message: error.message,
      data: null,
    });
  }

  console.error(error);
  return res.status(500).json({
    status_code: 500,
    message: 'Internal Server Error',
    data: null,
  });
}

module.exports = { authMiddleware, errorMiddleware };
