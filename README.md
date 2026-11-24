# Parcel

A React + Vite order dashboard for small businesses to create orders, assign dispatchers, and track each order through delivery.

## Run locally

```sh
npm install
npm run dev
```

Configure Supabase with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then apply the migration in `supabase/migrations`. Use the **New order** form to add a customer and assign a dispatcher. Team members can update delivery status, while owners can manage orders, finances, history, and team access.

## Email updates

The app records an email preview in the order activity at each milestone. It does not send email yet: sending customer emails requires a backend endpoint and an email provider, which should be configured with server-side credentials before connecting it to this UI.

## Build and lint

```sh
npm run build
npm run lint
```
