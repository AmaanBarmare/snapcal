# SnapCal — Builders Club application answers

Copy-paste-ready answers for the [Swiggy Builders Club Developer Application form](https://docs.google.com/forms/d/e/1FAIpQLSfUhtaGOQjnxS0o8uHFZwZGNxJhJzyYhxiYVotlqdBCpizpUw/viewform). Replace anything in `[brackets]` with your final value at submission time.

---

### Full Name
`Amaan Barmare`

### Email
`amaan@oltaflock.ai`

### Are you applying as…
**Startup** (Oltaflock)

### Team / Project Name
`SnapCal by Oltaflock`

### GitHub or Portfolio URL
`https://github.com/AmaanBarmare/snapcal`

### LinkedIn
`https://www.linkedin.com/in/[your-linkedin-handle]`

### What are you building? (2–3 sentences)

> SnapCal is a camera-first food intelligence mobile app for Indian users — snap your fridge to get Indian recipe suggestions and auto-order missing ingredients from Swiggy Instamart, and snap any meal to get India-accurate nutrition data. It uses Swiggy Instamart for the last-mile ingredient gap and Swiggy Food's `search_menu` as a novel cross-reference to ground nutrition estimates in real restaurant menu data when the meal came from a Swiggy order.

### Which MCP servers do you need?
- [x] **Swiggy Food**
- [x] **Swiggy Instamart**
- [ ] Swiggy Dineout *(not used in MVP)*

### What type of integration is this?
**Mobile App** *(native iOS + Android via Expo / React Native; the entire UI is the phone camera)*

### Tech stack & architecture overview

> Expo (React Native, expo-camera) mobile client → FastAPI (Python 3.12) backend orchestrating GPT-5.4-mini for vision, Claude Haiku 4.5 for the Indian recipe engine, and the Swiggy MCP for Instamart (`search_products`, `your_go_to_items`, `update_cart`, `checkout`) and Food (`get_orders`, `search_menu`). SQLite for the demo, Supabase swap-ready behind a repository interface. Mock and real adapters share one interface (`SwiggyClient`, `VisionAdapter`, `RecipeAdapter`), so the demo runs end-to-end on localhost today with `USE_MOCKS=true` and flips to the live MCP the moment Builders Club credentials arrive. Checkout is structurally gated by a server-issued single-use confirmation token — no auto-orders possible, ₹1000 cart cap enforced as a backend exception, not just a UI guard.

### Redirect URI(s) for auth flows

```
http://localhost:8000/api/swiggy/callback
https://snapcal.app/api/swiggy/callback
```

*(First is for demo / development per Swiggy's allowed localhost dev policy; second is reserved for production post-approval.)*

### Expected request volume
**< 1K/day** during demo and private beta. Scaling to **1K–10K/day** within 90 days post-launch as Mode 2 (daily nutrition) becomes the retention loop.

### Demo link, GitHub repo, or anything else

> **Demo video:** `[Loom URL — fill in after recording per submission/demo-script.md]`
> **GitHub:** https://github.com/AmaanBarmare/snapcal *(README is written for reviewers — please skim the [Why we need the Swiggy MCP](https://github.com/AmaanBarmare/snapcal#why-we-need-the-swiggy-mcp) and [Security & guardrails](https://github.com/AmaanBarmare/snapcal#security--guardrails) sections specifically)*
> **PRD:** [docs/snapcal-prd.md in the repo](https://github.com/AmaanBarmare/snapcal/blob/main/docs/snapcal-prd.md) — 40+ pages of product thinking
>
> The build is structured so swapping mocks for the real MCP is a single config flip (`USE_MOCKS=false` + populating `SWIGGY_CLIENT_ID/SECRET/MCP_BASE_URL`). `SwiggyRealClient` is already a class in the codebase, intentionally raising `NotImplementedError` until credentials arrive — so the wire-up path is visible to reviewers reading the code.

### I acknowledge Swiggy's MCP integration terms
**Yes**

---

## Submission checklist

- [ ] Record 60–90s demo video per [`demo-script.md`](demo-script.md)
- [ ] Upload demo to Loom / YouTube (unlisted is fine), grab the URL
- [ ] Replace `[Loom URL]` placeholder above and in [`cover-email.md`](cover-email.md)
- [ ] Confirm the GitHub repo is public and the README renders cleanly
- [ ] Submit the Google Form
- [ ] Send the [cover email](cover-email.md) to `builders@swiggy.in`
