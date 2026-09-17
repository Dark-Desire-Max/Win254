# Win254

Win254 is a responsive sportsbook and **play-money casino demo** with account, wallet and referral UI.

## Run locally

```bash
npm install
cp .env.example .env
# Set JWT_SECRET to at least 32 random characters
npm start
```

Open `http://localhost:3000`.

## Account and wallet features

- Server-backed registration, login, session persistence and logout
- Profile center with account summary
- Wallet panel with deposit and withdrawal buttons
- Demo balance and referral code stored locally for UI demonstration
- Referral/share flow with anti-fraud and eligibility notice
- Casino lounge with Aviator-style, Mines, roulette, blackjack, slots and Plinko cards
- Explicit responsible-play, age, licensing and no-real-money warnings

The Deposit and Withdraw controls are intentionally non-functional demo controls. This repository does **not** accept deposits, process withdrawals, hold funds, settle gambling outcomes, or connect to payment providers. Do not use it for real-money gambling without licensing, certified games/RNG, KYC/AML, age and geolocation controls, responsible-gambling tooling, secure payments, audit logging, legal review and jurisdiction-specific compliance.
