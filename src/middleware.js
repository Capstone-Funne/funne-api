const jwt = require('jsonwebtoken');

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

module.exports = { authMiddleware };
