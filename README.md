# RideTab

A minimalist mobile web app for comparing ride-hailing quotes side by side.

Uber, Lyft, Waymo, and any robotaxi/taxi service don't expose public APIs for
pulling live prices into a third-party app — so RideTab doesn't try to fake
that. Instead: open each app for a few seconds like you already do, type the
price and ETA it shows into RideTab, and it instantly scores every option on
a blended price/time value score you control with a slider. The best value
is highlighted.

## Features (v1)

- Uber, Lyft, Waymo quote rows out of the box, plus "+ Add another service"
  for anything else (a local robotaxi pilot, a taxi app, whatever you have).
- A single Cheaper ↔ Faster slider blends normalized price and ETA into one
  0–100 score per option; the top score is marked "Best value".
- Your price/time weighting is remembered locally between visits.
- No account, no backend, no data leaves your phone — everything runs
  client-side and state lives in `localStorage`.
- Installable as a home-screen app (PWA manifest) on iOS and Android.

## Not in v1 (by design)

- No live/automatic price pulling — see above for why.
- No credit-card rewards weighting — noted as a possible v2 addition.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On a phone, open the
deployed URL in Safari/Chrome and use "Add to Home Screen" to install it.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS. No backend, no database.
