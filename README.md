# Win254

A polished responsive sportsbook and play-money casino demo.

## Included

- Animated sportsbook landing page with live ticker and themes
- Football, basketball, tennis and rugby sample markets
- Interactive odds selection, bet slip and potential-return calculator
- Server-backed registration, login, session persistence and logout
- Casino lounge with demo-only Aviator-style crash, Mines, roulette, blackjack, slots and Plinko game cards
- Responsible-play messaging and explicit no-real-money disclaimer

## Run locally

```bash
npm install
cp .env.example .env
# Set a JWT_SECRET with at least 32 random characters
npm start
```

Open `http://localhost:3000`.

Casino games in this repository are presentation/demo experiences only. They do not generate random outcomes, accept stakes, process deposits or withdrawals, or represent a licensed gambling product. Production use requires independent game certification, secure RNG, age/geolocation checks, KYC/AML, responsible-gambling controls, payments compliance, licensing and jurisdiction-specific legal review.
