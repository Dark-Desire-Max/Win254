# Win254

A polished, responsive sportsbook interface with a real server-backed authentication system.

## Authentication setup

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env`.
3. Replace `JWT_SECRET` with a long random value (at least 32 characters).
4. Install and start the app:

```bash
npm install
npm start
```

Open `http://localhost:3000`. User accounts are stored in `data/win254.sqlite`, passwords are hashed with bcrypt, and sessions use an HTTP-only, signed JWT cookie. The `data/` directory and `.env` should not be committed.

The API provides `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`, with authentication rate limiting and security headers.

## Included

- Responsive sportsbook landing page
- Animated hero, live ticker, light/dark theme and mobile navigation
- Football, basketball, tennis and rugby sample markets
- Interactive odds selection, bet slip and potential-return calculator
- Real registration, login, session persistence and logout
- Secure password hashing, HTTP-only cookies, rate limiting and SQLite storage
- Demo-mode disclaimer: no real-money wagers or payments

For production, add HTTPS, a managed database, email verification, password reset, CSRF/origin protections, 2FA, KYC/AML, age/geolocation checks, audit logging, monitoring, backups and jurisdiction-specific legal/compliance review.
