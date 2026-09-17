# Win254

Win254 is a responsive sportsbook and **play-money casino demo** with animated sports cards, casino cards, wallet/profile UI, and referral UI.

## Run locally

```bash
npm install
cp .env.example .env
# Set JWT_SECRET to at least 32 random characters
npm start
```

Open `http://localhost:3000`.

## Demo-only scope

The interface includes visual Deposit and Withdraw controls, demo credits, referral UI, sports betting cards, and casino cards. These controls do **not** accept deposits, process withdrawals, hold user funds, settle gambling outcomes, or connect to payment providers. Casino games do not represent certified games or a licensed gambling product.

Before any real-money launch, obtain the required licences and legal review for each target jurisdiction, then add certified RNG/game testing, KYC/AML, age and geolocation checks, self-exclusion, deposit/loss/time limits, reality checks, responsible-gambling messaging, payment security, fraud monitoring, audit logs, incident response, privacy controls, and independent compliance verification.
