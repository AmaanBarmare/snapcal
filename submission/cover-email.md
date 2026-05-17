# Cover email — `builders@swiggy.in`

Send right after submitting the Google Form. Same day, ideally within an hour.

---

**To:** `builders@swiggy.in`
**Subject:** SnapCal — Builders Club application (Oltaflock)

---

Hi Builders team,

Just submitted the Builders Club application for **SnapCal** — a camera-first food intelligence app for Indian users. The whole product is two flows you'll recognise from the demo: snap your fridge → get 3 Indian recipes → order missing ingredients from Instamart, and snap any meal → get India-accurate nutrition data (with a `search_menu` cross-reference when the meal came from a Swiggy order).

Two things worth your time:

1. **Demo video (60 seconds):** `[Loom URL]`
2. **GitHub repo:** https://github.com/AmaanBarmare/snapcal — the README is written for you. The sections most worth your time are *Why we need the Swiggy MCP* and *Security & guardrails*.

The entire app runs end-to-end on localhost today with `USE_MOCKS=true` — Vision AI, recipes, and the Swiggy MCP are all behind one-interface adapters, mock implementations are stable and shaped exactly like the real MCP tools (`search_products`, `your_go_to_items`, `update_cart`, `checkout`, `get_orders`, `search_menu`). Flipping to live MCP is one config change. The `SwiggyRealClient` stub class is already in the codebase, intentionally raising `NotImplementedError` until we have credentials.

The `search_menu` use case is the one we're most excited about — it's a novel application of the Food MCP that turns Swiggy's menu data into a grounding source for Indian dish nutrition, addressing a real gap (Indian cuisine being an afterthought in every Western nutrition database).

Happy to jump on a call any time. SnapCal is built for India, depends on Swiggy, and we'd love to be in the program.

Thanks,
Amaan Barmare
Oltaflock · `amaan@oltaflock.ai`
