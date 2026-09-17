const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) throw new Error('JWT_SECRET must be set and at least 32 characters long');

const db = new Database(path.join(__dirname, 'data', 'win254.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
  password_hash TEXT NOT NULL, created_at TEXT NOT NULL, last_login_at TEXT
)`);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use(express.static(__dirname, { extensions: ['html'] }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many authentication attempts. Try again later.' } });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true' || isProduction, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' };

function publicUser(user) { return { id: user.id, email: user.email, name: user.name, createdAt: user.created_at }; }
function issueSession(user, res) { const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d', issuer: 'win254' }); res.cookie('win254_session', token, cookieOptions); }
function currentUser(req) {
  const token = req.cookies.win254_session;
  if (!token) return null;
  try { const payload = jwt.verify(token, jwtSecret, { issuer: 'win254' }); return db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) || null; }
  catch { return null; }
}
function validateCredentials(body, includeName = false) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const name = String(body.name || '').trim();
  if (!emailPattern.test(email) || email.length > 254) return 'Enter a valid email address.';
  if (password.length < 8 || password.length > 128) return 'Password must be between 8 and 128 characters.';
  if (includeName && (name.length < 2 || name.length > 80)) return 'Enter your name.';
  return null;
}

app.post('/api/auth/register', authLimiter, (req, res) => {
  const error = validateCredentials(req.body, true); if (error) return res.status(400).json({ error });
  const email = req.body.email.trim().toLowerCase(); const name = req.body.name.trim();
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) return res.status(409).json({ error: 'An account with that email already exists.' });
  const user = { id: crypto.randomUUID(), email, name, created_at: new Date().toISOString() };
  const hash = bcrypt.hashSync(req.body.password, 12);
  db.prepare('INSERT INTO users (id,email,name,password_hash,created_at) VALUES (?,?,?,?,?)').run(user.id, user.email, user.name, hash, user.created_at);
  issueSession(user, res); res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const error = validateCredentials(req.body); if (error) return res.status(400).json({ error });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(req.body.email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(req.body.password, user.password_hash)) return res.status(401).json({ error: 'Email or password is incorrect.' });
  db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(new Date().toISOString(), user.id);
  issueSession(user, res); res.json({ user: publicUser(user) });
});

app.get('/api/auth/me', (req, res) => { const user = currentUser(req); res.json({ user: user ? publicUser(user) : null }); });
app.post('/api/auth/logout', (req, res) => { res.clearCookie('win254_session', { httpOnly: true, sameSite: 'lax', secure: cookieOptions.secure, path: '/' }); res.status(204).end(); });
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(port, () => console.log(`Win254 running at http://localhost:${port}`));
