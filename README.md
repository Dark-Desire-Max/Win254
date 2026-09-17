# Win254

Win254 is a Demo sportsbook + casino platform designed to look and behave like a modern real gambling site while remaining clearly a play-money, demo-only front-end.

## Features included

- sportsbook betting page with odds and bet slip
- casino lounge with Aviator-style, Mines, Roulette, Blackjack, Slots, and Plinko cards
- account registration and login with SQLite-backed authentication
- wallet, profile panel, demo deposit and withdrawal buttons
- referral code and share flow
- responsive layout with animated UI and motion polish
- responsible-play disclaimer and legal notice

## Run locally

```bash
npm install
cp .env.example .env
# set a JWT_SECRET with at least 32 random characters
npm start
```

Open `http://localhost:3000`.

## Important

This project is still a demo/play-money implementation. It does not process real funds, does not hold user money, and is not a licensed gambling operator. Any real-money deployment requires jurisdiction-specific licensing, payment compliance, certified RNG/game validation, KYC/AML, geolocation/age controls, deposit and withdrawal policies, responsible-gambling systems, risk monitoring, and legal review before launch.
