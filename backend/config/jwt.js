module.exports = {
  secret: process.env.JWT_SECRET || 'lab1-jwt-dev-nuk-per-prod',
  expiresIn: process.env.JWT_EXPIRES || '7d',
};
