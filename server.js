const fs = require('node:fs');
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

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'win254.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );
  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    balance REAL NOT NULL DEFAULT 0,
    bonus REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'KES',
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS bets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    market TEXT NOT NULL,
    stake REAL NOT NULL,
    odds REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS referral_codes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );
`);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use(express.static(__dirname, { extensions: ['html'] }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' }
});
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true' || isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, createdAt: user.created_at };
}

function issueSession(user, res) {
  const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d', issuer: 'win254' });
  res.cookie('win254_session', token, cookieOptions);
}

function currentUser(req) {
  const token = req.cookies.win254_session;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, jwtSecret, { issuer: 'win254' });
    return db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) || null;
  } catch {
    return null;
  }
}

function ensureWallet(userId) {
  const existing = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
  if (existing) return existing;
  const wallet = { id: crypto.randomUUID(), user_id: userId, balance: 10000, bonus: 0, currency: 'KES', updated_at: new Date().toISOString() };
  db.prepare('INSERT INTO wallets (id, user_id, balance, bonus, currency, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(wallet.id, wallet.user_id, wallet.balance, wallet.bonus, wallet.currency, wallet.updated_at);
  return wallet;
}

function stableReferralCode() {
  return 'WIN254-' + crypto.randomInt(100000, 999999).toString();
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
  const error = validateCredentials(req.body, true);
  if (error) return res.status(400).json({ error });

  const email = req.body.email.trim().toLowerCase();
  const name = req.body.name.trim();
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = {
    id: crypto.randomUUID(),
    email,
    name,
    created_at: new Date().toISOString()
  };

  const hash = bcrypt.hashSync(req.body.password, 12);
  db.prepare('INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(user.id, user.email, user.name, hash, user.created_at);

  ensureWallet(user.id);
  const referralCode = stableReferralCode();
  db.prepare('INSERT INTO referral_codes (id, user_id, code, created_at) VALUES (?, ?, ?, ?)')
    .run(crypto.randomUUID(), user.id, referralCode, new Date().toISOString());

  issueSession(user, res);
  return res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const error = validateCredentials(req.body);
  if (error) return res.status(400).json({ error });

  const email = req.body.email.trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(req.body.password, user.password_hash)) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(new Date().toISOString(), user.id);
  ensureWallet(user.id);
  issueSession(user, res);
  return res.json({ user: publicUser(user) });
});

app.get('/api/auth/me', (req, res) => {
  const user = currentUser(req);
  res.json({ user: user ? publicUser(user) : null });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('win254_session', { httpOnly: true, sameSite: 'lax', secure: cookieOptions.secure, path: '/' });
  res.status(204).end();
});

app.get('/api/wallet', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });
  const wallet = ensureWallet(user.id);
  return res.json({ wallet: { ...wallet, balance: Number(wallet.balance), bonus: Number(wallet.bonus) } });
});

app.post('/api/wallet/deposit', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });
  const amount = Number(req.body.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid deposit amount.' });

  const wallet = ensureWallet(user.id);
  const nextBalance = Number(wallet.balance) + amount;
  db.prepare('UPDATE wallets SET balance = ?, updated_at = ? WHERE user_id = ?').run(nextBalance, new Date().toISOString(), user.id);
  return res.json({ wallet: { ...wallet, balance: nextBalance } });
});

app.post('/api/wallet/withdraw', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });
  const amount = Number(req.body.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid withdrawal amount.' });

  const wallet = ensureWallet(user.id);
  const currentBalance = Number(wallet.balance);
  if (amount > currentBalance) return res.status(400).json({ error: 'Insufficient funds.' });

  const nextBalance = currentBalance - amount;
  db.prepare('UPDATE wallets SET balance = ?, updated_at = ? WHERE user_id = ?').run(nextBalance, new Date().toISOString(), user.id);
  return res.json({ wallet: { ...wallet, balance: nextBalance } });
});

app.get('/api/referrals', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });
  const referral = db.prepare('SELECT * FROM referral_codes WHERE user_id = ?').get(user.id);
  return res.json({ referral: referral || null });
});

app.get('/api/bets', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });
  const list = db.prepare('SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  return res.json({ bets: list });
});

app.post('/api/bets', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });

  const market = String(req.body.market || '').trim();
  const stake = Number(req.body.stake || 0);
  const odds = Number(req.body.odds || 0);
  if (!market || !Number.isFinite(stake) || stake <= 0 || !Number.isFinite(odds) || odds <= 1) {
    return res.status(400).json({ error: 'Invalid bet payload.' });
  }

  const wallet = ensureWallet(user.id);
  if (stake > Number(wallet.balance)) return res.status(400).json({ error: 'Insufficient funds for this bet.' });

  const nextBalance = Number(wallet.balance) - stake;
  db.prepare('UPDATE wallets SET balance = ?, updated_at = ? WHERE user_id = ?').run(nextBalance, new Date().toISOString(), user.id);

  const bet = {
    id: crypto.randomUUID(),
    user_id: user.id,
    market,
    stake,
    odds,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  db.prepare('INSERT INTO bets (id, user_id, market, stake, odds, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(bet.id, bet.user_id, bet.market, bet.stake, bet.odds, bet.status, bet.created_at);

  return res.status(201).json({ bet, wallet: { ...wallet, balance: nextBalance } });
});

app.post('/api/casino/play', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required.' });

  const game = String(req.body.game || '');
  const wager = Number(req.body.wager || 0);
  if (!game || !Number.isFinite(wager) || wager <= 0) {
    return res.status(400).json({ error: 'Invalid casino play payload.' });
  }

  const wallet = ensureWallet(user.id);
  if (wager > Number(wallet.balance)) return res.status(400).json({ error: 'Insufficient funds for this play.' });

  const payoutMultiplier = Number((Math.random() * 2.4 + 1.1).toFixed(2));
  const win = Math.random() > 0.4;
  const payout = win ? Number((wager * payoutMultiplier).toFixed(2)) : 0;
  const nextBalance = Number(wallet.balance) - wager + payout;

  db.prepare('UPDATE wallets SET balance = ?, updated_at = ? WHERE user_id = ?').run(nextBalance, new Date().toISOString(), user.id);
  return res.json({
    game,
    wager,
    win,
    payout,
    payoutMultiplier,
    wallet: { ...wallet, balance: nextBalance }
  });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`Win254 running at http://localhost:${port}`));
