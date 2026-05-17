# Security & Guardrails

This is the reviewer-facing security summary for the [Swiggy Builders Club](https://mcp.swiggy.com/builders/) application form. Everything here is enforced **in code**, not just UI.

---

## No secrets in the repo

- All credentials are loaded from `.env`. The repo only ships `.env.example` with empty values and inline documentation.
- `.gitignore` excludes `.env`, `*.db`, `node_modules/`, `.expo/`, build artifacts, and any `.pem` / `.key` files.
- The mock layer (`USE_MOCKS=true`) is the default — the entire app runs end-to-end without a single real key.

## Swiggy OAuth handling

- Swiggy `client_id` / `client_secret` live as backend env vars only — never shipped to the React Native client.
- Redirect URI registered: `http://localhost:8000/api/swiggy/callback` (dev) + `https://snapcal.app/api/swiggy/callback` (production-reserved).
- Tokens stored server-side, refreshed by the backend. The frontend never sees them.

## Checkout guardrails (hard, structural)

`POST /api/instamart/checkout` is **structurally impossible** without a server-issued single-use confirmation token. Three stages, in order:

1. `POST /api/instamart/cart` — build the cart. No money moved. Cart cap checked here.
2. `POST /api/instamart/confirm` — frontend's explicit "Place Order" tap. Backend issues a single-use `confirmationToken`, persists it on the cart row.
3. `POST /api/instamart/checkout` — frontend must present the matching token. Backend rejects with HTTP 403 if it's missing, doesn't match, or has already been used.

This means:

- **Auto-checkout is impossible.** No bug, regression, or rogue automation in the frontend can cause an order to be placed without an explicit user tap.
- **Replay attacks fail.** The token is cleared from the cart row after a successful checkout, so re-sending the same payload returns HTTP 409.
- See `backend/app/api/instamart.py` and `backend/tests/test_instamart.py::test_checkout_blocked_without_confirmation_token` for the exact enforcement.

## ₹1000 cart cap

- `CART_CAP_INR` (default 1000) enforced in `GapAnalyzer` before the cart is built.
- Exceeding the cap raises `CartCapExceeded` server-side and returns HTTP 409 — the UI never gets the chance to "just submit anyway".
- See `backend/app/services/gap_analyzer.py` and `tests/test_instamart.py::test_gap_analyzer_raises_when_over_cap`.

## COD warning

- Cash-on-delivery orders return `codWarning: true` from `/api/instamart/checkout`.
- The Instamart screen surfaces a warning toggle the user must acknowledge before COD becomes the selected payment method.
- COD orders cannot be cancelled from SnapCal — the order-confirmation screen surfaces this and directs the user to the Swiggy app.

## Image / data retention

- **Fridge photos:** never persisted. Sent to Vision AI, response captured, image discarded.
- **Meal photos:** opt-in only. The demo build does not store photo bytes; `photo_url` in `MealLog` is reserved for a future opt-in S3/Supabase path.
- **Nutrition logs:** stored only in the user's own row (SQLite locally, Supabase in production). Never used for training, never shared with third parties (including Swiggy).
- **Location:** only used for resolving Instamart delivery address — not tracked continuously.

## Rate limits

- 50 snaps per user per day (`DAILY_SNAP_LIMIT`) — prevents Vision AI cost abuse.
- Image upload size limit: 10 MB enforced in `/api/mealsnap/upload`.

## Failure-mode visibility

- `SwiggyRealClient` is a class in the codebase. Every method raises a deliberately specific `NotImplementedError("...pending Builders Club credentials...")` until credentials arrive. This is intentional — reviewers reading the code see exactly where the real wire-up will happen and what configuration unlocks it.
- Vision and recipe adapters degrade gracefully: if a real API call fails for any reason, the system falls back to the deterministic mock and logs the failure rather than 500ing.

## Production hardening still to come

These are explicitly out of scope for the demo build and called out in PRD §11:

- HTTPS termination via Vercel for production
- Proper Supabase RLS once we migrate off SQLite
- IP allowlisting per Swiggy's static-IP requirement
- Sentry / error reporting

---

If anything here is unclear or you'd like more detail on a specific guardrail, please email `amaan@oltaflock.ai`.
