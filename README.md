# CADENCE MVP

CADENCE is a design studio and lifestyle brand, not a coffee shop. The MVP is organized around a commercial priority stack:

1. WeChat group coffee ordering for cashflow
2. Weekly Drop membership for repeat purchase
3. Unit Series parametric objects for higher order value
4. Journal studies for brand building

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma
- Supabase Postgres
- Vercel

## Routes

- `/` Home
- `/coffee` Weekly Cold Brew and Weekly Drop ordering
- `/objects` Unit Series and Unit01 product visuals
- `/journal` Coffee Studies, Object Studies, Tokyo Notes
- `/about` Brand positioning
- `/admin` Operations dashboard
- `/admin/orders`
- `/admin/customers`
- `/admin/products`
- `/admin/delivery`

## Delivery Logic

CADENCE delivers only inside the morning window `07:30 - 11:00`.

Customers select:

- Delivery date
- One of 8 preset delivery batches: `07:30`, `08:00`, `08:30`, `09:00`, `09:30`, `10:00`, `10:30`, `11:00`

Admin can set:

- Available dates
- Daily capacity
- Delivery status

When booked orders reach daily capacity, that date becomes unavailable.

## Unit01 Assets

The Unit01 images in `public/assets` are generated from the provided STL direction and latest references:

- `unit01-hero.png`
- `unit01-detail.png`
- `unit01-context.png`

Material intent:

- Upper body: frosted amber translucent resin
- Lower body: white terrazzo 3D printed base

## Local Setup

```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Copy the Postgres connection string into `DATABASE_URL` and `DIRECT_URL`.
3. Copy Supabase client values into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Push the schema:

```bash
npm run db:push
```

## WeChat Pay

`lib/wechat-pay.ts` is a reserved integration point. Add merchant certificate signing and JSAPI / H5 prepay creation before production payments.
