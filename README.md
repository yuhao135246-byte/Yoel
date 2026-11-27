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
- Supabase Postgres
- Vercel

## Routes

- `/` Home
- `/coffee` Weekly Cold Brew and Weekly Drop ordering
- `/objects` Unit Series and Unit01 product visuals
- `/journal` Coffee Studies, Object Studies, Tokyo Notes
- `/about` Brand positioning
- `/my-orders` Order history for the current browser
- `/admin` Operations dashboard
- `/admin/orders`
- `/admin/customers`
- `/admin/products`
- `/admin/delivery`

## Delivery Logic

Bookings open from `12:00` until `22:00` Beijing time for next-day delivery.
Customers select a date and area. The selected area determines the window:

- Huiji: `07:00-07:30`
- Jinshui and Zhengdong: `08:00-12:30`

Existing orders retain their recorded delivery windows.

## Customer Order History

Apply `supabase/customer-device-orders-v1.sql` before deploying the order history.
It makes the orders table server-only, so checkout must use a working
`SUPABASE_SERVICE_ROLE_KEY`. New orders are linked to an opaque browser cookie.
The same browser can view order dates and status from `/my-orders`. Existing
orders, other browsers, and devices that clear the cookie cannot be linked
automatically.

## Admin Delivery Planner

Set `AMAP_WEB_SERVICE_KEY` in `.env.local` (or server-side deployment settings)
to an Amap Web Service API key. The planner at `/admin/delivery` uses the
existing admin login and Supabase configuration. After the signed-session update,
sign in again.

Select a delivery date, enter the departure address or Amap coordinates, and
locate unmarked addresses. Review approximate matches and adjust coordinates
before ordering the stops. The calculation uses the driving time for each leg
and adds 15 minutes on arrival for heating. The map and schedule are working
drafts on the page and do not update orders or notify customers.

Apply `supabase/delivery-tracking-v1.sql` to the target database before enabling
vehicle tracking. Today's delivery page lets the driver start and stop sharing
from a phone on HTTPS. Keep that page visible while sharing. The signed-in
dashboard refreshes the latest position and marks stale readings. Ending delivery
removes the position. Expired records are hidden and removed on the next start.

Apply `supabase/customer-order-tracking-v1.sql` for per-order tracking. After
starting the trip, the driver confirms a stop coordinate and selects that order
for delivery. The matching customer browser can see the latest fresh map and
remaining driving distance. Marking the active stop delivered clears its location
and advances its order to the existing completed status.

## Unit01 Assets

The Unit01 images in `public/assets` are generated from the provided STL direction and latest references:

- `Unit0100.png`
- `Unit0101.png`
- `Unit0102.png`
- `Unit0103.png`
- `Unit0105.png`
- `Unit0106.png`
- `Unit0107.png`
- `Unit0108.png`
- `Unit0109.png`
- `Unit0110.png`

Material intent:

- Upper body: frosted amber translucent resin
- Lower body: white terrazzo 3D printed base

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Copy Supabase client values into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for server-side writes.

The checkout flow reuses the existing local device memory plus the saved `orders` records for the current browser, without requiring any login or OTP flow.

## WeChat Pay

`lib/wechat-pay.ts` is a reserved integration point. Add merchant certificate signing and JSAPI / H5 prepay creation before production payments.
