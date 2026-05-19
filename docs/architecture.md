# SnapCal Architecture

Engineering-focused deep-dive. The high-level summary is in the main [README](../README.md); this doc is for anyone (reviewer, future contributor, future-you) who wants the full picture.

---

## System diagram

```mermaid
flowchart TB
    subgraph Phone[Phone — Expo Go in demo, EAS build in production]
        Cam["expo-camera<br/>full native HW access"]
        UI["Bottom tabs:<br/>Snap · Today · History"]
        State["Zustand stores<br/>+ AsyncStorage"]
        Cam --> UI
        UI <--> State
    end

    subgraph BE["FastAPI Backend (Python 3.12)"]
        R1[/"POST /api/mealsnap"/]
        R2[/"POST /api/fridgescan"/]
        R3[/"POST /api/recipes"/]
        R4[/"POST /api/instamart/cart"/]
        R5[/"POST /api/instamart/confirm"/]
        R6[/"POST /api/instamart/checkout"/]
        R7[/"GET /api/swiggy/orders"/]
        R8[/"GET /api/swiggy/menu/nutrition"/]
        R9[/"GET /api/dashboard/today"/]
    end

    subgraph Adapters
        VA["VisionAdapter<br/>Mock | GPT-5.4-mini"]
        RA["RecipeAdapter<br/>Mock | Claude Haiku 4.5"]
        SW["SwiggyClient<br/>Mock | Real MCP"]
    end

    DB[("SQLite<br/>indian_food_db · meal_logs<br/>fridge_scans · users<br/>instamart_carts")]

    Phone -- HTTPS / LAN HTTP --> R1
    Phone --> R2
    Phone --> R3
    Phone --> R4
    Phone --> R5
    Phone --> R6
    Phone --> R7
    Phone --> R8
    Phone --> R9

    R1 --> VA
    R2 --> VA
    R3 --> RA
    R4 --> SW
    R5 --> DB
    R6 --> SW
    R7 --> SW
    R8 --> SW
    R9 --> DB
    R1 --> DB
    R2 --> DB
```

---

## Repo layout

```
snapcal/
├── backend/
│   ├── app/
│   │   ├── main.py                  ← FastAPI entrypoint + CORS + startup seed
│   │   ├── settings.py              ← pydantic-settings; reads repo-root .env
│   │   ├── api/
│   │   │   ├── health.py            ← /api/health
│   │   │   ├── mealsnap.py          ← /api/mealsnap{,/upload}
│   │   │   ├── fridgescan.py        ← /api/fridgescan + /api/recipes
│   │   │   ├── instamart.py         ← /api/instamart/{cart,confirm,checkout}
│   │   │   ├── swiggy.py            ← /api/swiggy/{orders,menu/nutrition}
│   │   │   ├── dashboard.py         ← /api/onboarding, /meallog, /dashboard/today, /history
│   │   │   └── nutrition.py         ← /api/nutrition/lookup
│   │   ├── services/
│   │   │   ├── nutrition_lookup.py  ← exact → alias → fuzzy → category fallback
│   │   │   ├── meal_snap.py         ← vision → lookup pipeline
│   │   │   ├── gap_analyzer.py      ← missing-ingredients → cart, brand-aware
│   │   │   └── targets.py           ← 3-question → daily calorie/macro targets
│   │   ├── adapters/
│   │   │   ├── vision.py            ← VisionAdapter Protocol + Mock + OpenAI GPT-5.4-mini
│   │   │   ├── recipes.py           ← RecipeAdapter + Mock + Claude Haiku 4.5
│   │   │   └── swiggy.py            ← SwiggyClient + MockSwiggy + SwiggyRealClient stub
│   │   ├── db/
│   │   │   ├── session.py           ← SQLAlchemy engine + sessionmaker
│   │   │   ├── models.py            ← IndianDish, User, MealLog, FridgeScan, InstamartCart
│   │   │   └── seed.py              ← init_db() + Indian food DB seed loader
│   │   └── data/
│   │       └── indian_food_seed.json ← 100 hand-curated Indian dishes
│   └── tests/                       ← pytest — 30 tests, all green
├── app/                             ← Expo (React Native, TypeScript)
│   ├── app/                         ← expo-router pages
│   │   ├── _layout.tsx              ← root stack + onboarding redirect
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx          ← bottom tabs
│   │   │   ├── index.tsx            ← Snap tab — camera + Fridge/Meal toggle
│   │   │   ├── today.tsx            ← Mode 3 dashboard
│   │   │   └── history.tsx          ← 14-day history
│   │   ├── onboarding.tsx           ← 3-question setup
│   │   ├── result/
│   │   │   ├── meal.tsx             ← Mode 2 result + nutrition card
│   │   │   ├── fridge.tsx           ← Mode 1 ingredient editor
│   │   │   ├── recipes.tsx          ← 3 recipe cards
│   │   │   ├── instamart.tsx        ← Cart + guardrailed checkout
│   │   │   └── order.tsx            ← Order confirmation
│   │   └── swiggy-restaurants.tsx   ← Mode 2 → get_orders → search_menu picker
│   └── src/
│       ├── lib/api.ts               ← axios client + typed wrappers for every backend route
│       ├── lib/theme.ts             ← design tokens (colors, spacing, radius)
│       ├── store/                   ← Zustand: camera mode, session onboarding
│       └── components/              ← Ring, MacroBar, PillTag, Button, PoweredBySwiggy
└── submission/                      ← Phase-11 deliverables
    ├── application-answers.md
    ├── cover-email.md
    └── demo-script.md
```

---

## Mode 1 — FridgeScan call sequence (PRD §8)

```mermaid
sequenceDiagram
    autonumber
    participant App as Expo App
    participant BE as FastAPI
    participant V as VisionAdapter
    participant R as RecipeAdapter
    participant S as SwiggyClient
    participant DB as SQLite

    App->>BE: POST /api/fridgescan { image_b64 }
    BE->>V: identify_fridge_contents()
    V-->>BE: [{name,quantity,confidence}, ...]
    BE->>DB: insert FridgeScan row
    BE-->>App: scan_id + ingredients

    Note over App: user edits tags
    App->>BE: POST /api/recipes { ingredients }
    BE->>R: suggest_recipes()
    R-->>BE: 3 recipes sorted by missing_count
    BE-->>App: recipes[]

    Note over App: user picks a recipe
    App->>BE: POST /api/instamart/cart { recipeName, missing }
    BE->>S: search_products() for each missing
    BE->>S: your_go_to_items()
    BE->>BE: GapAnalyzer (prefer go-to brands, enforce ₹1000 cap)
    BE->>DB: insert InstamartCart row
    BE-->>App: cart preview

    Note over App: user taps Place Order
    App->>BE: POST /api/instamart/confirm { cart_id }
    BE->>DB: write confirmation_token to cart row
    BE-->>App: confirmation_token

    App->>BE: POST /api/instamart/checkout { cart_id, token, payment_mode }
    BE->>BE: verify token (HTTP 403 if invalid)
    BE->>S: update_cart()
    BE->>S: checkout()
    S-->>BE: orderId, ETA, total
    BE->>DB: log planned meal (mode1)
    BE->>DB: invalidate token (single-use)
    BE-->>App: orderId + ETA + cod_warning
```

## Mode 2 — Meal Snap with Swiggy order detection

```mermaid
sequenceDiagram
    autonumber
    participant App as Expo App
    participant BE as FastAPI
    participant V as VisionAdapter
    participant DB as SQLite (Indian Food DB)
    participant S as SwiggyClient

    App->>BE: POST /api/mealsnap { image_b64 }
    BE->>V: identify_meal()
    V-->>BE: [{name_english, name_hindi, serving_grams, confidence}]
    BE->>DB: nutrition_lookup (exact → alias → fuzzy → category)
    DB-->>BE: dish + per-serving macros
    BE-->>App: primary dish + nutrition (source = snapcal_indian_food_db)

    Note over App: user taps "This is from Swiggy"
    App->>BE: GET /api/swiggy/orders
    BE->>S: get_orders(limit=10)
    S-->>BE: recent restaurants
    BE-->>App: restaurant picker
    App->>BE: GET /api/swiggy/menu/nutrition?restaurant_id=X&dish=Y
    BE->>S: search_menu(X, Y)
    S-->>BE: menu item + calories + macros
    BE-->>App: nutrition (source = swiggy_menu_data)

    Note over App: user taps Log this meal
    App->>BE: POST /api/meallog
    BE->>DB: insert MealLog row
    BE-->>App: { id, timestamp }
```

---

## Why these design choices

### Three adapters, one interface each

- `VisionAdapter`, `RecipeAdapter`, `SwiggyClient` are Python `Protocol`s.
- For each, we ship a deterministic `Mock*` and a real implementation.
- `get_*_adapter()` factories pick based on `USE_MOCKS` plus the presence of the relevant API key.
- This is why the entire demo runs end-to-end without any external dependency.

### `SwiggyRealClient` is a deliberate stub

It's in the codebase. Every method raises a clear `NotImplementedError("...pending Builders Club credentials...")`. The point: a reviewer reading the source can see exactly where the real MCP calls will land, what env vars unlock them, and what the contract looks like. There's nothing to discover later.

### Three-stage checkout

Stage 1 (`/cart`) builds. Stage 2 (`/confirm`) issues a single-use server-side token in response to an explicit user tap. Stage 3 (`/checkout`) requires that token. The frontend cannot forge the token because it's generated in `confirm_cart` from `secrets.token_urlsafe(24)` and persisted on the cart row before the response is sent.

### SQLite for demo, Supabase for production

Repository pattern (`db/models.py` + the route handlers' DB usage) is plain SQLAlchemy. Swapping to Supabase's Postgres is a `DB_URL` change. The `Supabase*` env vars are in `.env.example` already so future-you doesn't have to think about it.

---

## Test coverage snapshot

`pytest -q` from `backend/` runs **30 tests** covering:

- Health check
- Indian Food DB exact / alias / fuzzy / fallback / payload scaling
- Mode 2 meal-snap pipeline + size limits + Swiggy hint flag
- Mode 1 fridge scan + recipe shape + missing-count ordering
- Gap analyzer brand preferences + unavailability + cart-cap exception
- Three-stage checkout: build → confirm → checkout
- Checkout blocked without token, with forged token, with reused token
- COD warning surfacing
- Onboarding → targets → today dashboard wiring
- Swiggy `get_orders` + `search_menu` cross-reference

All 30 currently green.

---

## Production roadmap (post-Builders-Club)

1. Real `SwiggyRealClient` implementation hitting `https://mcp.swiggy.com/...` once we have credentials.
2. Supabase swap — replace `SessionLocal` with the Supabase Python client behind the same repo interface.
3. Vercel deployment of the FastAPI backend (per PRD §7).
4. EAS Build → Play Store + App Store.
5. Gemini 2.0 Flash routing for cost-optimised Meal Snap calls (PRD §7).
