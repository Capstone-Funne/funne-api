const jwt = require('jsonwebtoken');

const { ClientError } = require('./exception/client-error');

function authMiddleware(req, res, next) {
  const bearerToken = req.headers.authorization;

  if (!bearerToken) {
    return res.status(401).json({
      status_code: 401,
      message: 'Bad Request',
      error: 'Wajib memasukan otorisasi token header',
    });
  }

  const [tokenType, accessToken] = bearerToken.split(' ');

  if (tokenType !== 'Bearer') {
    return res.status(401).json({
      status_code: 401,
      message: 'Bad Request',
      error: 'Tipe otorisasi token tidak valid',
    });
  }

  if (!accessToken) {
    return res.status(401).json({
      status_code: 401,
      message: 'Bad Request',
      error: 'Wajib memasukan akses token',
    });
  }

  try {
    const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = { id: payload.id };
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        status_code: 401,
        message: 'Bad Request',
        error: 'Akses token sudah kedaluwarsa',
      });
    }

    return res.status(401).json({
      status_code: 401,
      message: 'Bad Request',
      error: 'Akses token tidak valid',
    });
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
