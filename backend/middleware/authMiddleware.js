const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Mungon token (Bearer)' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), secret);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: 'Token i pavlefshëm ose i skaduar' });
  }
}

module.exports = { requireAuth };
