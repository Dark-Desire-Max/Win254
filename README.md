# Win254

Win254 now includes a broad **worldwide sports catalogue demo** with sport, country, league, live/upcoming status and event search filters.

## Worldwide event data

The browser shows a large provider-ready catalogue covering football, basketball, tennis, cricket, rugby, baseball, ice hockey, volleyball, handball, motorsport, golf, boxing, MMA and esports across international and regional competitions. It is intentionally mock data until a licensed sports-data/odds provider is configured.

For real worldwide fixtures, scores and odds, add a commercial provider server-side using environment variables such as:

```env
SPORTS_API_BASE_URL=https://your-provider.example/api
SPORTS_API_KEY=keep-this-server-side
SPORTS_API_PROVIDER=provider-name
```

Never expose an API key in browser JavaScript. A production adapter should normalize provider responses, cache fixtures, validate odds, suspend stale markets, handle rate limits, reconcile results, and log provider failures.

## Run locally

```bash
npm install
cp .env.example .env
# Set JWT_SECRET to at least 32 random characters
npm start
```

Open `http://localhost:3000`.

This remains a play-money demo. It does not process real funds or represent a licensed operator. Worldwide real-money betting requires provider rights, jurisdiction-specific licensing, KYC/AML, age/geolocation controls, certified settlement, responsible-gambling systems, payment compliance and legal review.
