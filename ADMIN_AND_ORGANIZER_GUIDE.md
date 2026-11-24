# CampusConnect: admin and organizer roles

## One-time setup

1. **`.env`** (next to `pom.xml`) now has these extra keys:

   | Key | What it is |
   |---|---|
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | The one admin account, created on first startup if no admin exists. Change the password before demoing. |
   | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Your Razorpay **test** keys. Free: sign up at razorpay.com, switch the dashboard to *Test mode*, then Account & Settings > API Keys > Generate. |

2. Start MySQL, then the backend: `./mvnw spring-boot:run` (port 8080).
   Hibernate (`ddl-auto=update`) adds the new tables and columns itself. Your existing events and registrations are kept.
3. Start the frontend: `cd frontend && npm install && npm run dev` (port 5173).

## The three logins

| Role | URL | Created by |
|---|---|---|
| Student | `http://localhost:5173/` | Self signup |
| Admin | `http://localhost:5173/admin` | Seeded from `.env` |
| Organizer (club) | `http://localhost:5173/organizer` | Admin only, no public signup |

## Flow

1. Admin signs in, opens **Club accounts**, clicks **Create club login**, enters the club name.
   The system generates a login ID (e.g. `codingclub-4821`) and a temporary password, shown **once**.
2. The club signs in at `/organizer` and is **forced to set a new password** before anything else.
3. The club creates, edits and deletes only its own events. Admin can do this for every event.
4. Students register. Free events confirm instantly. Paid events hold a seat and open Razorpay checkout; the seat is confirmed only after the payment signature is verified on the server.
5. Organizer sees registered students and payment status per event (search, filter, CSV download). Admin sees everything college-wide.

## Rules built in

- **Seats:** every registration counts against the event's seats, enforced with a row lock so two students cannot take the last seat. Full events show "Sold out". Seats cannot be edited below the number already registered.
- **Unpaid holds:** a student who starts a paid registration but never pays keeps the seat for 30 minutes, then it is released. They can finish paying from *My Registrations*.
- **Deleting an event with registrations:** every registration becomes *Cancelled*, paid ones become *Refund due*, and each student gets an in-app notification (banner on the dashboard and My Registrations). The event row is kept as `CANCELLED` so history stays intact. An event nobody registered for is removed outright.
- **Refunds:** the app marks payments "Refund due"; an admin or the club presses **Mark refunded** after refunding in the Razorpay dashboard. It does not call Razorpay's refund API.
- **Clubs:** admin can reset a club's password (forces a change again) or deactivate it.

## Razorpay test payments

Use Razorpay's test credentials in the checkout popup: card `4111 1111 1111 1111`, any future expiry, any CVV, any OTP; or UPI ID `success@razorpay`. (Check Razorpay's test-mode docs if these have changed.)
Without keys in `.env`, paid-event registration shows "Payments are not set up yet"; free events work as normal.

## Security notes

- `.env` holds your DB password, JWT secret, admin password and Razorpay secret. It is in `.gitignore`. Do not upload it anywhere public; rotate every value if it ever reaches GitHub.
- Use Razorpay **test** keys only for this project.
