# Threadly provider usability prototype

A clean-room, test-only recreation of the public Threadly customer experience with a seamstress workspace added for moderated usability testing.

## Included flows

- Customer search, listings, public profiles, and quote-request preview
- Seamstress dashboard and incoming request inbox
- Request detail, test quoting, accepting, declining, and asking for information
- Public profile editing and preview
- Service/pricing editing
- Weekly availability controls
- Accepted-job tracking

All changes are stored in the browser with `localStorage`. Nothing is sent to a backend, customer, business, payment provider, or booking system.

## Run locally

From this directory:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Suggested provider usability tasks

1. Review a new customer request and decide what to do.
2. Send a test quote and explain what information influenced the price.
3. Identify what is missing from the customer request.
4. Edit the public studio profile and preview the customer view.
5. Update starting prices and availability.
6. Find an accepted job and determine its current status.

