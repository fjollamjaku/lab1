const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Users } = require('../models');
const { requireAuth } = require('../middleware/authMiddleware');
const { secret, expiresIn } = require('../config/jwt');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    secret,
    { expiresIn }
  );
}

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username dhe password janë të detyrueshme' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Passwordi duhet të ketë të paktën 6 karaktere' });
  }
  const exists = await Users.findOne({ where: { username } });
  if (exists) return res.status(409).json({ error: 'Ky përdorues ekziston' });
  const hash = await bcrypt.hash(password, 10);
  const user = await Users.create({ username, password: hash });
  const token = signToken(user);
  res.status(201).json({ token, user: { username: user.username } });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username dhe password janë të detyrueshme' });
  }
  const user = await Users.findOne({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Kredencialet janë të pasakta' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Kredencialet janë të pasakta' });
  const token = signToken(user);
  res.json({ token, user: { username: user.username } });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { username: req.user.username } });
});

module.exports = router;
