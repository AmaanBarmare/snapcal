# SnapCal — Product Requirements Document

**Version:** 1.1 (MVP / Builders Club Build)
**Status:** Pre-development — Spec Complete
**Author:** Oltaflock (khush@oltaflock.ai)
**Date:** May 2026
**Confidential**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Target Users](#4-target-users)
5. [Core Concept](#5-core-concept)
6. [Feature Specifications](#6-feature-specifications)
7. [Technical Architecture](#7-technical-architecture)
8. [Swiggy MCP Integration Detail](#8-swiggy-mcp-integration-detail)
9. [Indian Food Database](#9-indian-food-database)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [MVP Scope vs V2](#12-mvp-scope-vs-v2)
13. [Success Metrics](#13-success-metrics)
14. [Risks & Mitigations](#14-risks--mitigations)
15. [Builders Club Application Angle](#15-builders-club-application-angle)

---

## 1. Overview

**Product Name:** SnapCal
**Tagline:** *Snap your fridge. Get recipes. Know your nutrition.*
**Website:** snapcal.app (target)

**One-line concept:**
SnapCal is an AI-powered food intelligence app for Indian consumers — snap your fridge to get recipe suggestions and auto-order missing ingredients from Swiggy Instamart, and snap any meal to instantly get Indian-accurate nutrition data.

**What SnapCal is not:**
- A recipe website
- A calorie-counting app that requires manual entry
- A Swiggy clone or wrapper
- A chatbot

SnapCal is a **camera-first food intelligence product** that sits between your kitchen and Swiggy's infrastructure. The camera is the entire interface. There is no search bar. There is no manual input. You point, you snap, SnapCal handles everything else.

**Platform:** Native mobile app built with Expo (React Native). Runs on Android and iOS. During demo phase, accessed via Expo Go — no App Store submission required. Production release via Expo EAS build to Play Store and App Store.

**Integration:** Powered by Swiggy Instamart and Food MCP APIs via the Swiggy Builders Club program.

---

## 2. Problem Statement

### The Three Problems No Single App Solves

**Problem 1 — The daily "what do I cook?" paralysis**

Every day, in millions of Indian households, someone opens the fridge, stares at it for 30 seconds, and either:
- Cooks something repetitive because they can't think of what else to make
- Orders food on Swiggy because it feels easier than figuring out a meal
- Goes to a kirana store to buy ingredients for a specific dish they had in mind

There is no tool that looks at what you already have and tells you what you can cook right now. Existing recipe apps require you to manually type in your ingredients. Nobody does this. The friction is too high.

**Problem 2 — Indian food has no accurate nutrition layer**

Cal AI popularised photo-based calorie tracking globally. It works reasonably well for Western food. It fails significantly for Indian food because:

- Indian dishes have enormous macro variance based on cooking method, oil quantity, and regional variation. Dal makhani at a dhaba vs dal makhani at home are nutritionally different dishes.
- Many Indian dishes simply don't exist in Western nutrition databases at the level of accuracy required. Sabudana khichdi, poha, upma, rajma chawal, chole bhature — these are not edge cases, they are daily meals for hundreds of millions of people.
- No app has built an India-first nutrition database that understands these nuances.

The result: Indian users who want to track their food intake have no good tool. They either use apps built for the West (inaccurate), log manually in spreadsheets (high friction), or give up entirely.

**Problem 3 — The last-mile ingredient gap**

When someone decides to cook a specific meal, the most common blocker is one or two missing ingredients. Currently, the user either skips the meal plan or makes a separate trip / separate app journey to order those specific items.

No app connects the dots between "what I want to cook" and "order exactly what I'm missing" in a single, frictionless flow.

### Why Existing Apps Fail

| App | What it does | What it misses |
|---|---|---|
| Swiggy | Food ordering, grocery delivery | No nutrition layer, no recipe suggestions, no fridge intelligence |
| Cal AI | Photo-based calorie tracking | Western food database, no Indian cuisine accuracy, no ordering integration |
| Healthifyme | Calorie tracking, diet plans | Manual entry required, no camera-first flow, no Swiggy integration |
| Recipe apps (Sanjeev Kapoor, etc.) | Indian recipes | No fridge scan, no nutrition data, no ingredient ordering |
| Instamart | Grocery ordering | No intelligence layer, no recipe context, no nutrition |

**SnapCal fills the gap that sits between all of these.** It is the connective tissue between your kitchen, your nutrition goals, and Swiggy's commerce infrastructure.

---

## 3. Product Vision & Goals

### Vision Statement
SnapCal becomes the default food intelligence layer for urban Indian consumers — the app they open every time they're in the kitchen, not just when they want to order food.

### Goals by Priority

**Goal 1 — Primary (immediate): Get accepted into Swiggy Builders Club**
Build a working demo that demonstrates all three modes. Submit to builders@swiggy.in with a compelling demo video. Get approved, get production API credentials, get featured.

**Goal 2 — Secondary (3 months): Build daily habit via nutrition loop**
Mode 2 (Meal Snap) works without any Swiggy dependency and can be used for every meal every day. This is the retention engine. Target: users snapping 2+ meals per day.

**Goal 3 — Long-term (12 months): India's default food intelligence app**
SnapCal becomes the app Indian fitness-conscious, food-curious, and health-aware consumers use daily — not because they're dieting, but because it's frictionless and actually accurate for Indian food.

### What Success Looks Like in 12 Months
- Accepted and featured by Swiggy Builders Club
- 10,000+ daily active users
- Average 2.5 snaps per user per day
- 500+ Instamart orders triggered per day via FridgeScan
- India's most accurate Indian food nutrition database by dish count and accuracy

---

## 4. Target Users

### Primary Persona — Urban Indian, Health-Aware

**Name:** Aarav, 27
**Location:** Bangalore / Mumbai / Delhi / Pune / Hyderabad
**Occupation:** Works in tech, startup, or corporate
**Lives:** Alone in a rented apartment or with 1–2 flatmates

**Behaviour:**
- Orders Swiggy 3–4 times a week, cooks 3–4 times a week
- Goes to the gym or does some form of fitness activity
- Wants to eat healthier but finds calorie tracking too tedious
- Has ingredients in his fridge he doesn't know how to use together
- Spent ₹800 on groceries from Instamart last week, forgot he bought capsicum, it went bad
- Has tried and abandoned Healthifyme because manual logging is a chore

**What he wants from SnapCal:**
- To know what he can cook without going to the store
- To know roughly how many calories he's eating without entering anything manually
- A quick, honest nutrition read when he orders a biryani on Swiggy

**Why he stays:**
The Meal Snap mode. He uses it every day at lunch and dinner. It takes 3 seconds. He gets a nutrition summary without typing a single thing. After two weeks, he has a real picture of his eating patterns. He's never had that before.

---

### Secondary Persona — Fitness-Focused Indian User

**Name:** Priya, 24
**Location:** Bangalore, stays in a PG/flatshare
**Occupation:** Marketing or ops role, active on Instagram fitness content

**Behaviour:**
- Tracks macros loosely, knows her protein target but finds it hard to hit on Indian food
- Eats at the mess, cooks sometimes on weekends, orders Swiggy regularly
- Has tried multiple fitness apps, none of them know what idli macros are
- Very visual person, responds to numbers on a screen

**What she wants from SnapCal:**
- Accurate protein count for Indian food, specifically
- To know if the dal she's eating is actually a good protein source (it's not, but sabudana khichdi is worse)
- Recipe suggestions that are high protein and use what she already has

**Why she stays:**
The Indian nutrition database. SnapCal is the first app that actually knows the difference between paneer bhurji and egg bhurji. She trusts the numbers in a way she never trusted other apps.

---

### Who SnapCal is NOT for (right now)
- Users with complex dietary restrictions requiring medical supervision
- Users in smaller cities without Instamart coverage (Mode 2 still works for them, but Mode 1 ordering won't deliver)
- Older users unfamiliar with camera-first interfaces

---

## 5. Core Concept

### The Single Thesis
**One camera. Three modes. Everything food.**

The camera is not a feature in SnapCal. The camera is the product. Every interaction begins with a photo. There is no search bar. There is no text input for food logging. You point your phone at the thing in front of you — your fridge, your plate, your takeaway container — and SnapCal does the rest.

This is borrowed from the insight that made Cal AI successful: the single biggest barrier to calorie tracking is manual data entry. Remove manual entry completely, and the behaviour changes.

SnapCal removes manual entry completely. For everything.

### The Three-Mode System

```
SNAP YOUR FRIDGE          SNAP ANY MEAL           VIEW YOUR DAY
     |                         |                        |
  Mode 1                    Mode 2                   Mode 3
FridgeScan               Meal Snap               Nutrition Dashboard
     |                         |                        |
Recipes +               Calories +              Daily log, rings,
Instamart order         Macros for              weekly trends,
                        Indian food             streaks
```

The three modes are not separate products. They are three entry points to the same underlying intelligence. A user who starts with Mode 1 automatically populates Mode 3. A user who starts with Mode 2 builds a nutrition history that makes Mode 1 recipe suggestions smarter over time (understanding their preferences). Mode 3 is the summary layer that makes Modes 1 and 2 feel like they're building toward something.

### The Swiggy Connection
SnapCal is a consumer product in its own right. But the Swiggy MCP integration makes Mode 1 commercially valuable for Swiggy — every FridgeScan session has a real probability of generating an Instamart order. More importantly, when Mode 2 detects that the food being photographed came from Swiggy (packaging, branding, or user confirmation), SnapCal cross-references the actual restaurant menu via Swiggy's `search_menu` API to return more precise nutrition data than generic estimates. This is a genuinely novel and useful application of the Swiggy Food MCP that benefits both the user and Swiggy's data ecosystem.

---

## 6. Feature Specifications

### Mode 1 — FridgeScan

**Entry point:** User taps "Scan Fridge" button or the camera tab and selects "Fridge"

**Step 1 — Photo capture**
- User opens camera in fridge mode
- Camera interface shows a subtle grid overlay suggesting they capture the full fridge interior
- One shot only. SnapCal does not require multiple angles for MVP.
- Photo is sent to Vision AI for processing
- UI shows a loading state: *"Reading your fridge..."* with a simple animated indicator
- Target processing time: under 4 seconds

**Step 2 — Ingredient inventory display**
- Vision AI returns a structured ingredient list
- SnapCal displays the detected ingredients as clean pill tags:
  *"Eggs · Onions · Tomatoes · Capsicum · Paneer · Curd · Leftover rice · Butter"*
- User can tap any ingredient to remove it (if Vision AI was wrong)
- User can manually add an ingredient by tapping "Add more" (text input, single exception to no-manual-entry rule)
- Confirm button: *"These look right → Find recipes"*

**Step 3 — Recipe suggestions**
- Recipe engine processes the confirmed ingredient list
- Returns exactly 3 recipe suggestions. Never more, never less.
- Each recipe card shows:
  - Recipe name (in English, with Hindi name below where applicable)
  - Cook time in minutes
  - Approximate calories per serving
  - Approximate protein per serving
  - Difficulty: Easy / Medium
  - Which detected ingredients it uses (highlighted)
  - What ingredients are missing (shown distinctly, greyed out)
- Recipes are ranked by: fewest missing ingredients first
- All recipes are Indian. The recipe engine is specifically prompted for Indian cuisine.
- User selects one recipe by tapping it

**Step 4 — Gap analysis & Instamart cart**
- SnapCal runs gap analysis: recipe required ingredients minus confirmed fridge ingredients = missing list
- Missing ingredients are passed to Swiggy Instamart `search_products`
- `your_go_to_items` is called to cross-reference user's usual brands (post-login)
- SnapCal builds a proposed Instamart cart
- Confirmation screen displays:
  - List of items being ordered with quantities
  - Brand selected for each item
  - Total cart value in ₹
  - Estimated delivery time
  - Swiggy cart widget embedded inline (iframe)
- **User must explicitly tap "Place Order" — no automatic checkout ever**
- Secondary options: "Edit cart" / "Skip ordering, I'll manage"

**Step 5 — Order confirmation**
- On "Place Order" tap: `update_cart` → `checkout` executes
- Success state: order confirmed message with Instamart order ID
- Nutrition estimate for the chosen recipe is automatically logged to Mode 3 dashboard (flagged as "planned meal")

**Edge cases:**
- Vision AI can't read the fridge (dark, blurry, empty): show error with retry prompt and tip: *"Try better lighting or open the fridge door fully"*
- No recipes possible with detected ingredients: show *"Your fridge needs a restock"* and offer to open Instamart directly
- Missing ingredients unavailable on Instamart: show which items aren't available, proceed with available ones, note the rest
- Instamart not serviceable at user's location: notify clearly, offer recipe-only mode (no ordering)
- Cart total exceeds ₹1,000: flag this before checkout as per Swiggy's cart cap guardrail

---

### Mode 2 — Meal Snap

**Entry point:** Default camera mode. When user opens SnapCal, this is what they see first. This is the daily driver.

**Step 1 — Photo capture**
- User points camera at any food — home-cooked, restaurant, street food, Swiggy order, packed food
- Single tap to capture
- Photo sent to Vision AI for food identification
- Loading state: *"Identifying your meal..."*
- Target processing time: under 3 seconds

**Step 2 — Dish identification**
- Vision AI returns primary dish identification + confidence level
- If confidence is high (>80%): proceed directly to nutrition display
- If confidence is medium (50–80%): show top 2 options and ask user to confirm: *"Is this dal makhani or rajma?"*
- If confidence is low (<50%): ask user to type the dish name (one exception to no-manual-entry rule, necessary for accuracy)
- For mixed plates (thali, multiple dishes): identify up to 3 components, show breakdown for each

**Step 3 — Nutrition display**
Returned data per dish:
- Dish name
- Estimated serving size (visual estimate from image: "~300g / 1 katori / 2 rotis")
- Calories
- Protein (g)
- Carbohydrates (g)
- Fat (g)
- Fibre (g)
- Sodium estimate (where possible)

Data is pulled from the Indian Food Database (see Section 9) matched to the identified dish. Where a Swiggy order is detected (see below), `search_menu` cross-reference is used instead.

**Swiggy Order Detection:**
- If the photo contains visible Swiggy packaging, the Swiggy logo, or the user taps *"This is a Swiggy order"*:
  - SnapCal prompts: *"Which restaurant did this come from?"* (user selects from recent Swiggy orders via `get_orders`)
  - `search_menu` is called for that restaurant to find the exact dish and its listed nutritional information
  - This produces more accurate nutrition data than generic database estimates
  - Data source is shown as *"Nutrition from Swiggy menu data"* for transparency

**Step 4 — Log & feedback**
- User taps "Log this meal"
- Meal is added to Mode 3 dashboard with timestamp, photo thumbnail, nutrition data
- Quick feedback options: "Too much" / "Right amount" / "Still hungry" — used to improve serving size estimates over time
- Optional: user can adjust serving size (1x / 1.5x / 0.5x) before logging

**User journey without logging:**
Users can use Meal Snap purely to check nutrition without logging. No account required for this. Logging requires account creation. This reduces friction for first-time users.

---

### Mode 3 — Nutrition Dashboard

**Entry point:** "Today" tab in bottom navigation

**Daily view:**
- Date header with day and date
- Calorie ring: large, clean circular progress indicator
  - Shows: calories consumed vs daily target
  - Colour: green under target, amber approaching, red over
- Below the ring: three smaller rings or bars for Protein / Carbs / Fat
- Meal log for today: chronological list of logged meals with photo thumbnail, dish name, calories, time
- Each meal entry is tappable to see full macro breakdown

**Daily target setup:**
- On first use, SnapCal asks three questions only:
  1. What's your goal? (Lose weight / Maintain / Build muscle)
  2. Roughly how much do you weigh? (in kg, slider)
  3. How active are you? (Sedentary / Lightly active / Very active)
- SnapCal sets a daily calorie target and macro split automatically
- User can manually override at any time in settings
- No lengthy onboarding. Three questions, done.

**Weekly view (swipe left or tap "Week"):**
- 7-day bar chart showing daily calorie intake vs target
- Days under target shown in green, over in red
- Weekly average calories, protein, carbs, fat
- Streak indicator: consecutive days with at least one meal logged
- Most logged dish of the week (for fun, for personalisation)

**Insights (simple, no clutter):**
One rotating insight card below the charts:
- *"You've hit your protein target 4 out of 7 days this week"*
- *"Your average dinner is 680 calories — your biggest meal of the day"*
- *"Dal and rice is your most snapped meal. Add paneer to boost protein by ~15g"*

These insights are generated by a simple rules engine, not AI, for MVP. Speed over sophistication.

**No manual entry anywhere in Mode 3.** All data comes from Mode 2 snaps and Mode 1 planned meals. If the user wants to log something they didn't snap (e.g. a meal they forgot to photograph), they can describe it via text and SnapCal will estimate — but this is clearly a secondary path, not the primary one.

---

## 7. Technical Architecture

### Tech Stack at a Glance

| Layer | Technology | Purpose |
|---|---|---|
| Mobile App | Expo (React Native) | Native iOS + Android app, camera access |
| Demo runner | Expo Go | Scan QR, app runs on phone instantly, no App Store needed |
| Backend | FastAPI (Python) | API server, AI orchestration, Swiggy MCP calls |
| Backend hosting (demo) | Localhost | Runs on your laptop, Swiggy explicitly allows localhost for demo |
| Backend hosting (production) | Vercel (post-approval) | FastAPI serverless, free tier, one-command deploy |
| Database | Supabase | PostgreSQL + Auth + Storage, free tier |
| Vision AI primary | GPT-5.4-mini (`gpt-5.4-mini-2026-03-17`) | Strong accuracy on cluttered fridges + Indian dishes at ~6× lower input cost than legacy GPT-4o ($0.75 / $4.50 per 1M tok) |
| Vision AI fallback | Gemini 2.0 Flash | 10x cheaper, used for simple Meal Snap calls post-launch |
| Recipe engine | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | Near-frontier structured JSON output + Indian cuisine knowledge at Haiku price ($1 / $5 per 1M tok) |
| Nutrition estimation | Claude Haiku 4.5 | Same model, different prompt for unknown dishes |

### Demo Environment

For the Builders Club application, the entire stack runs locally:

```
Your Phone (Expo Go)           Your Laptop
──────────────────────         ─────────────────────────────────
Scan QR code            →      npx expo start     (port 8081)
App runs natively              FastAPI backend    (port 8000)
Camera works fully             │
                               ├── OpenAI GPT-5.4-mini API
                               ├── Anthropic Claude Haiku 4.5 API
                               └── Swiggy MCP (localhost allowed)
                                         ↓
                                    Supabase cloud
                                    (only cloud dependency)
```

Swiggy's own docs confirm `http://localhost` is an allowed redirect URI for dev and that a demo video of a local build is what speeds up review. No deployment needed to apply.

### System Architecture

```
┌────────────────────────────────────────┐
│        Expo (React Native) App         │
│   Three tabs: Snap / Today / History   │
│   Native camera via expo-camera        │
│   Zustand state management             │
└───────────────────┬────────────────────┘
                    │ HTTP to localhost:8000
                    │ (or Vercel in production)
┌───────────────────▼────────────────────┐
│         FastAPI Backend (Python)        │
│  /api/fridgescan                        │
│  /api/mealsnap                          │
│  /api/nutrition                         │
│  /api/swiggy/*                          │
└───┬──────────────┬──────────────┬───────┘
    │              │              │
┌───▼─────┐  ┌──────▼─────┐  ┌────▼───────────────┐
│GPT-5.4  │  │Claude      │  │ Swiggy MCP          │
│-mini Vis│  │Haiku 4.5   │  │ Instamart + Food    │
│API    │    │Recipe +   │  │ search_products     │
│       │    │Nutrition  │  │ update_cart         │
└───────┘    └───────────┘  │ checkout            │
                             │ search_menu         │
                             └────────────────────┘
                    │
┌───────────────────▼────────────────────┐
│              Supabase                   │
│  PostgreSQL — Indian food DB,           │
│  meal logs, user preferences            │
│  Auth — email + Google OAuth            │
│  Storage — optional meal photos         │
└────────────────────────────────────────┘
```

### Frontend — Expo (React Native)

**Framework:** Expo SDK (latest) with React Native
**Demo method:** Expo Go app — scan QR from terminal, app runs live on phone
**Production method:** Expo EAS Build → APK (Android) + IPA (iOS)

**Key libraries:**
- `expo-camera` — native camera access, full hardware control (focus, flash, resolution)
- `expo-image-picker` — fallback for selecting from gallery if needed
- `zustand` — lightweight global state (current user, today's log, camera mode)
- `react-native-svg` + `victory-native` — nutrition ring charts for Mode 3 dashboard
- `@supabase/supabase-js` — auth and database calls directly from app
- `axios` — HTTP calls to FastAPI backend

**Why Expo over bare React Native:**
- Zero native setup — no Xcode config, no Android Studio config for development
- Expo Go means the demo runs on a real phone in under 2 minutes from a fresh clone
- `expo-camera` gives full native camera hardware access that browser `getUserMedia` cannot match
- EAS Build handles App Store / Play Store production builds when needed, without ejecting

### Backend — FastAPI (Python)

**Runtime:** Python 3.12 + FastAPI + Uvicorn
**Demo:** `uvicorn main:app --reload` on localhost:8000
**Production:** Deployed to Vercel as a serverless Python function (post Builders Club approval)

**Key libraries:**
- `openai` — GPT-5.4-mini vision calls (base64 image → ingredient/dish JSON)
- `anthropic` — Claude Haiku 4.5 for recipe engine and nutrition estimation
- `google-generativeai` — Gemini 2.0 Flash for cost-optimised Meal Snap fallback
- `rapidfuzz` — fuzzy dish name matching against Indian food database
- `httpx` — async HTTP calls to Swiggy MCP endpoints
- `supabase` — Python client for DB reads/writes
- `python-dotenv` — environment variable management

**Responsibilities:**
- Receive base64 image from Expo app
- Route to correct Vision AI model based on mode and confidence threshold
- Parse Vision AI response into structured JSON
- Call Claude Sonnet recipe engine with ingredient list
- Run gap analysis (recipe needs minus fridge contents)
- Orchestrate Swiggy MCP API calls in correct sequence
- Query Indian food database for nutrition data via Supabase
- Write meal logs back to Supabase
- Return structured JSON response to Expo app

### Vision AI Layer

**Primary model:** GPT-5.4-mini (`gpt-5.4-mini-2026-03-17`, vision)
- Strong accuracy on complex scenes (cluttered fridge, mixed thali)
- Handles ambiguous Indian dishes well in testing
- Cost: $0.75 / $4.50 per 1M input/output tokens — ~6× cheaper input than legacy GPT-4o

**Optional escalation path:** GPT-5.5 / GPT-5.5 Pro
- Reserved for cases where Mode 1 (FridgeScan) confidence is low and the user is about to commit to a real Instamart order. Out of scope for v0.1; the GPT-5.4-mini results are already strong enough for the demo.

**Routing logic (v0.1):**
- Both Mode 1 (FridgeScan) and Mode 2 (MealSnap) use GPT-5.4-mini. Single-model deployment simplifies cost accounting and avoids prompt-drift across two vision models for the demo.

**Vision AI prompt structure (Mode 1 — FridgeScan):**
```
You are analysing a photo of a refrigerator interior.
Return a JSON array of ingredients you can identify with high confidence.
Only include items clearly visible. Do not guess.
For each item include: name (common Indian household name), 
estimated quantity (rough: "half onion", "2 eggs", "small piece paneer"),
confidence (high/medium/low).
Return only JSON. No preamble.
```

**Vision AI prompt structure (Mode 2 — Meal Snap):**
```
You are analysing a photo of food.
Identify the dish(es) visible. Prioritise Indian dishes.
For each dish return: name_english, name_hindi (if applicable),
serving_size_estimate (visual estimate in grams or common units like "1 katori"),
confidence_score (0-100).
If multiple dishes are visible (e.g. thali), list each separately.
Return only JSON. No preamble.
```

### Recipe Engine

**Model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`, via Anthropic API)
**Why Claude specifically:** Superior instruction-following for structured output, strong on Indian cuisine knowledge. Haiku 4.5 (released Oct 2025) gives near-frontier intelligence at Haiku price ($1 / $5 per 1M tok) — the right tradeoff for repeatable ingredient-list → JSON-recipes generation.

**Prompt structure:**
```
You are an Indian home cooking assistant.
Given these ingredients: [list]
Suggest exactly 3 recipes that can be made primarily with these ingredients.
Each recipe must be a real Indian dish (home-cooking style, not restaurant).
For each recipe return:
- name_english, name_hindi
- cook_time_minutes
- difficulty (Easy/Medium)
- calories_per_serving (estimate)
- protein_per_serving_g (estimate)
- ingredients_available (from the given list)
- ingredients_missing (not in the given list, with quantity needed)
Order by fewest missing ingredients first.
Return only JSON.
```

### Gap Analyzer

**Type:** Simple server-side logic, no AI required
- Receives: recipe's `ingredients_missing` array from recipe engine
- Passes each item to `search_products` (Swiggy Instamart MCP)
- Receives: product results with SKU, price, brand
- Applies `your_go_to_items` cross-reference to prefer familiar brands
- Builds cart array: `[{ sku, name, quantity, price, brand }]`
- Calculates total
- Returns to frontend for confirmation display

### User Data Layer

**Platform:** Supabase
**Tables:**
- `users` — auth, preferences, daily calorie target, macro targets
- `meal_logs` — user_id, timestamp, dish_name, photo_url (optional), calories, protein, carbs, fat, fibre, source (mode1/mode2), swiggy_order_id (nullable)
- `fridge_scans` — user_id, timestamp, detected_ingredients, recipe_chosen, instamart_order_id (nullable)
- `indian_food_db` — dish_id, name_english, name_hindi, aliases, calories_per_100g, protein, carbs, fat, fibre, serving_size_common, category, region

**Auth:** Supabase Auth (email + Google OAuth)
- Mode 2 (Meal Snap) works without login for first use
- Logging, dashboard, and Mode 1 (Instamart ordering) require login
- Login prompted contextually, not at app open

---

## 8. Swiggy MCP Integration Detail

### Authentication & Setup

- SnapCal backend holds Swiggy `client_id` and credentials as environment variables
- OAuth flow initiated on user's first Mode 1 or Mode 2 Swiggy interaction
- User authenticates with their existing Swiggy account
- Token stored securely in Supabase, refreshed automatically
- Per Swiggy's requirements: static IP, redirect URIs, and security contact registered at application time

### Mode 1 — FridgeScan API Call Sequence

```
1. user_confirms_ingredients
         ↓
2. recipe_engine → returns recipe + missing ingredients list
         ↓
3. FOR EACH missing ingredient:
   search_products(query=ingredient_name, location=user_delivery_address)
   → returns: [{ productId, name, brand, price, imageUrl }]
         ↓
4. your_go_to_items()
   → returns user's historically purchased items
   → cross-reference: prefer brand user has ordered before
         ↓
5. BUILD CART ARRAY
   → select best match per ingredient
   → calculate total
         ↓
6. SHOW CONFIRMATION SCREEN (mandatory, no skip)
   → display: items, brands, quantities, total ₹, delivery time
   → embed Swiggy cart widget (iframe)
         ↓
7. user_taps_place_order
         ↓
8. update_cart(items=[confirmed cart array])
         ↓
9. checkout()
   → returns: orderId, estimatedDelivery, totalCharged
         ↓
10. show_success_screen(orderId, estimatedDelivery)
    log_planned_meal(recipe_nutrition_estimate) → Mode 3
```

**Guardrails applied at every step:**
- Cart total checked against ₹1,000 limit before `update_cart` is called. If exceeded, show warning and ask user to reduce items.
- `checkout` is never called without explicit user tap on "Place Order"
- If `search_products` returns no results for an ingredient, it is flagged to user as "unavailable on Instamart" and excluded from cart — order proceeds with available items
- COD orders are flagged with an extra warning: *"Cash on delivery orders cannot be cancelled once placed. Confirm?"*

### Mode 2 — Swiggy Order Detection API Call Sequence

```
1. meal_snap_identifies_dish
         ↓
2. CHECK: Is this a Swiggy order?
   (packaging detected by Vision AI OR user taps "This is from Swiggy")
         ↓ YES
3. get_orders(limit=10)
   → returns recent Swiggy orders
   → show to user: "Which order is this from?" (restaurant name list)
         ↓
4. user_selects_restaurant
         ↓
5. search_menu(restaurantId=selected, query=identified_dish_name)
   → returns: dish details including listed nutritional information
         ↓
6. display_nutrition(source="Swiggy menu data")
   → more accurate than database estimate
   → source attribution displayed to user
         ↓ NO (not a Swiggy order)
3. query_indian_food_database(dish=identified_dish_name)
   → returns nutrition from SnapCal's internal database
   → display_nutrition(source="SnapCal estimates")
```

### Confirmation UX — Non-Negotiable Rules

Per Swiggy's platform requirements, SnapCal enforces the following at all times:

1. No order is placed without an explicit user confirmation tap labelled "Place Order"
2. The confirmation screen must show: item list, quantities, brands, total ₹, estimated delivery time
3. Cart widget is embedded inline at confirmation if Swiggy widgets are available
4. User always has the option to "Edit cart" or "Cancel" before placing
5. After placing, the order cannot be recalled through SnapCal — user is directed to Swiggy app for any cancellation

---

## 9. Indian Food Database

### Why This Is SnapCal's Core Moat

Every competitor in the global calorie-tracking space uses Western-biased food databases (USDA, Cronometer, MyFitnessPal). These databases have Indian dishes listed as afterthoughts — often with wildly inaccurate macros, missing dishes entirely, or using generic entries that don't reflect how Indians actually cook and eat.

SnapCal builds an India-first food database from scratch. This is a one-time investment that creates a durable competitive advantage no quick-moving Western competitor can replicate without the same effort.

### MVP Scope — 200 Dishes

For the Builders Club demo and V1 launch, the database covers 200 dishes. These are not 200 random dishes — they are the 200 dishes that cover 80%+ of what urban Indians eat daily.

**Category breakdown:**

| Category | Dish count | Examples |
|---|---|---|
| Breakfast | 30 | Idli, dosa, upma, poha, paratha, thepla, sabudana khichdi, aloo puri |
| Dal & curries | 40 | Dal tadka, dal makhani, rajma, chole, palak paneer, matar paneer |
| Rice dishes | 25 | Jeera rice, biryani, khichdi, curd rice, lemon rice, fried rice |
| Roti & breads | 15 | Roti, naan, paratha (plain, aloo, gobi), puri, bhatura |
| Snacks & street food | 30 | Samosa, vada pav, pani puri, bhel puri, misal pav, dhokla |
| Swiggy-common dishes | 30 | Butter chicken, chicken biryani, burger, pizza (Indian toppings), Chinese Indian dishes |
| Drinks & desserts | 15 | Lassi, chaas, kheer, gulab jamun, chai |
| Protein-focused | 15 | Paneer bhurji, egg bhurji, chicken curry, soya chunks sabzi, sprouts |

**Data fields per dish:**

```json
{
  "dish_id": "IND_001",
  "name_english": "Dal Tadka",
  "name_hindi": "दाल तड़का",
  "aliases": ["yellow dal", "tarka dal", "dal fry"],
  "category": "dal_curry",
  "region": "north_indian",
  "per_100g": {
    "calories": 90,
    "protein_g": 5.2,
    "carbs_g": 13.1,
    "fat_g": 2.4,
    "fibre_g": 3.8,
    "sodium_mg": 180
  },
  "common_serving": {
    "unit": "katori",
    "grams": 180,
    "calories": 162
  },
  "cooking_method_variance": "low",
  "notes": "Values based on home-cooked preparation with 1 tsp ghee tadka. Restaurant versions typically +30-50 calories due to more oil."
}
```

**`cooking_method_variance` field:**
This is unique to SnapCal's database. It flags dishes where calorie content varies significantly based on how they're cooked:
- `low` — dal, khichdi: variance is small regardless of preparation
- `medium` — rajma, chole: varies depending on oil quantity
- `high` — paratha, biryani, street food: significant variance, user shown a range not a single number

For `high` variance dishes, SnapCal shows: *"This dish ranges 350–550 cal depending on preparation. Showing midpoint estimate."*

### Data Sources & Methodology

**Primary sources:**
- IFCT (Indian Food Composition Tables) 2017 — published by NIN (National Institute of Nutrition, India)
- ICMR dietary guidelines
- Manual verification of top 50 dishes against multiple published sources

**Validation methodology:**
- Each dish entry cross-referenced against minimum 3 independent sources
- Where sources disagree by >15%, the `cooking_method_variance` is set to `medium` or `high`
- Swiggy menu nutritional data (where available via `search_menu`) used to validate restaurant-style entries

### How Vision AI Maps to the Database

Vision AI returns a dish name string (e.g. *"dal tadka"*, *"palak paneer"*, *"masala dosa"*). SnapCal backend runs:

1. **Exact match** against `name_english` and `aliases` fields
2. **Fuzzy match** (Levenshtein distance) if exact match fails
3. **Category fallback** — if dish can't be matched precisely, use category average (e.g. unknown curry → use "generic north Indian curry" entry with `high` variance flag)
4. **Manual confirmation** if fuzzy match confidence is below threshold — ask user *"Is this masala dosa or rava dosa?"*

### V2 Expansion
After MVP, the database expands to 500+ dishes via:
- User feedback loop (users flag wrong identifications → reviewed and corrected)
- Restaurant-specific dish data from Swiggy `search_menu` responses (dishes from popular chains logged and averaged)
- Regional dish additions based on user location data

---

## 10. UI/UX Requirements

### App Structure

**Bottom navigation — 3 tabs only:**

```
[ Snap ]  [ Today ]  [ History ]
```

- **Snap:** Camera interface. Default landing screen. Opens in camera mode immediately.
- **Today:** Mode 3 Nutrition Dashboard for current day.
- **History:** Past meal logs, past FridgeScan sessions, weekly and monthly views.

No hamburger menus. No deep navigation trees. Three taps covers everything.

### Camera Interface — Snap Tab

- Full-screen camera view on open
- Two modes switchable at top: **Fridge** | **Meal**
- Simple toggle — not a dropdown, not a menu — a two-option toggle pill at the top
- Shutter button centred at bottom
- No filters, no effects, no editing — this is a utility camera, not a social one
- After capture: brief 0.5s freeze of image → loading state with dish/ingredient name appearing as AI processes
- No gallery access required. SnapCal does not store photos unless user explicitly opts in.

### Key Screens

**Screen 1 — Camera (Meal mode)**
Full-screen camera. Toggle: Fridge | Meal (Meal selected). Large circular shutter button. Subtle overlay text: *"Point at your food"*

**Screen 2 — Meal identified**
Photo at top (small, not full screen). Dish name large. Confidence indicator (green dot = high, amber = medium). Nutrition card: calories large and centred, then protein / carbs / fat / fibre in a clean row. "Log this meal" primary button. "Not right?" secondary link.

**Screen 3 — Fridge scan result**
Detected ingredients as tags in a scrollable row. "Edit" link to add/remove. "Find recipes →" primary button.

**Screen 4 — Recipe selection**
Three recipe cards, vertical scroll. Each card: recipe name, cook time, difficulty, calories, which fridge ingredients it uses (green), what's missing (grey). Tap to select.

**Screen 5 — Instamart confirmation**
Clean list of items to order. Each item: name, brand, quantity, price. Total at bottom. Delivery time estimate. Swiggy cart widget embedded below. Two buttons: "Place Order" (primary, prominent) and "Skip ordering" (secondary, smaller).

**Screen 6 — Today dashboard**
Date at top. Large calorie ring (60% of screen width). Three smaller macro rings below. Meal log as a chronological card list below that. Clean, no clutter.

### Design Principles

1. **Speed over beauty.** Every screen should load in under 1 second after data returns. Skeleton loading states used everywhere — no blank screens.
2. **Indian context.** Font choices, colour palette, and tone feel modern but familiar to Indian users. Not a clone of Western health apps.
3. **Numbers are the hero.** Nutrition data is displayed large and clear. Not buried. Not de-emphasised. The number is the point.
4. **No dark patterns.** SnapCal never pushes users to order. The Instamart flow is always opt-in and always confirmable. Swiggy's branding is always visible and never hidden.
5. **Powered by Swiggy badge.** Displayed on all screens that surface Swiggy data (recipe ingredient availability, Instamart cart, menu nutrition data). Required by Swiggy's brand guidelines and genuinely adds trust for Indian users.

### React Native Implementation Notes

- All UI components are React Native primitives (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `FlatList`) — no web HTML elements
- Bottom tab navigation via `@react-navigation/bottom-tabs`
- Camera screen uses `expo-camera` with full native hardware access — not a webview
- Charts in Mode 3 use `victory-native` — renders as native SVG, not canvas
- All animations via React Native's built-in `Animated` API — smooth 60fps on device
- No WebView anywhere in the app — fully native throughout

### Mobile UX Specifics

- All tap targets minimum 44x44pt (iOS HIG standard)
- Bottom tab bar sits above system home indicator on iPhone
- Camera shutter button at natural right-thumb position (bottom-right quadrant)
- Text sizes: minimum 16sp body, 28sp+ for key nutrition numbers
- No horizontal scrolling except ingredient tags row
- Safe area insets handled via `react-native-safe-area-context` — works on notch and Dynamic Island devices

---

## 11. Non-Functional Requirements

### Performance

| Metric | Target | Hard limit |
|---|---|---|
| Vision AI response (Meal Snap) | < 3 seconds | < 6 seconds |
| Vision AI response (FridgeScan) | < 4 seconds | < 8 seconds |
| Recipe engine response | < 3 seconds | < 5 seconds |
| Swiggy API call (search_products) | < 2 seconds | < 4 seconds |
| Nutrition database query | < 200ms | < 500ms |
| App cold start (Expo Go, demo) | < 3 seconds | < 5 seconds |
| App cold start (production build) | < 1.5 seconds | < 3 seconds |
| Dashboard render | < 500ms | < 1 second |

### Privacy & Data

- **Fridge photos are not stored.** They are sent to Vision AI for processing and immediately discarded. No fridge images are retained on SnapCal's servers.
- **Meal Snap photos:** Not stored by default. User can opt in to save photos alongside meal logs for personal history. Opt-in is explicit, not assumed.
- **Nutrition logs:** Stored in user's Supabase account, not used for training, not shared with third parties including Swiggy.
- **Swiggy credentials:** OAuth tokens only. SnapCal never sees or stores Swiggy username or password.
- **Location data:** Used only for Instamart delivery address resolution. Not tracked continuously.
- GDPR-equivalent compliance (for international users): data deletion on account deletion, data export on request.

### Accuracy

| Scenario | Minimum accuracy target |
|---|---|
| Common Indian dish identification (top 100 dishes) | > 90% |
| Fridge ingredient identification (common items) | > 85% |
| Nutrition data accuracy vs IFCT database | Within 15% |
| Swiggy order detection from photo | > 75% |

Accuracy is measured and logged per Vision AI call. Confidence scores below threshold trigger the user confirmation step — accuracy is maintained by asking rather than guessing.

### Offline Behaviour

- Mode 3 (Nutrition Dashboard) works fully offline for viewing historical data — Supabase data cached locally via `@supabase/supabase-js` persistent storage
- Today's log syncs automatically when connection is restored
- Modes 1 and 2 require internet connection (Vision AI calls, Swiggy APIs)
- Offline state: show friendly native alert — *"SnapCal needs a connection to identify your meal. Your dashboard is still available."*
- React Native handles offline detection via `@react-native-community/netinfo`

### Security

- All API calls over HTTPS
- Swiggy `client_id` and API credentials stored as backend environment variables only — never exposed to frontend
- User authentication via Supabase Auth with JWT tokens
- Image uploads validated server-side (file type, size limit 10MB)
- Rate limiting on Vision AI calls: 50 snaps per user per day (free tier), prevents abuse

---

## 12. MVP Scope vs V2

### MVP — Builders Club Demo Build

The MVP contains exactly what is needed to win Builders Club acceptance and record a compelling demo video. Nothing more.

**In MVP:**

| Feature | Mode | Priority |
|---|---|---|
| Camera interface (Fridge + Meal toggle) | Both | P0 |
| Vision AI fridge reading | Mode 1 | P0 |
| Recipe engine (3 suggestions, Indian) | Mode 1 | P0 |
| Gap analyzer | Mode 1 | P0 |
| Swiggy Instamart: search_products | Mode 1 | P0 |
| Swiggy Instamart: update_cart + checkout | Mode 1 | P0 |
| Confirmation screen before checkout | Mode 1 | P0 |
| Vision AI food identification | Mode 2 | P0 |
| Nutrition display (calories + macros) | Mode 2 | P0 |
| Indian Food Database (top 100 dishes for demo) | Mode 2 | P0 |
| Swiggy order detection + search_menu | Mode 2 | P1 |
| Daily calorie ring dashboard | Mode 3 | P1 |
| Meal log (chronological) | Mode 3 | P1 |
| User auth (Supabase) | All | P1 |
| Calorie target setup (3 questions) | Mode 3 | P1 |

**Explicitly cut from MVP:**

| Feature | Reason | Version |
|---|---|---|
| Weekly history view | Not needed for demo | V1.1 |
| AI-generated insights | Rules engine sufficient for MVP | V1.1 |
| Serving size adjustment | UX complexity | V1.1 |
| Social sharing of meals | Out of scope | V2 |
| Voice mode | Separate integration | V2 |
| Family profiles / multiple users | Product complexity | V2 |
| Dietary restriction filters (allergies) | V2 feature | V2 |
| Streak system | Nice-to-have | V1.1 |
| Full 200-dish database | Demo needs top 100 only | V1 (post-approval) |
| Swiggy Food MCP (restaurant ordering) | MVP is Instamart-only | V1.1 |
| Dineout integration | No fit with current product | V2 |
| Swiggy widget iframe (cart-widget) | Not live in Swiggy v1.0 | V1.1 (when Swiggy ships) |
| Gemini Flash fallback for Vision AI | Cost optimisation, not demo priority | V1 (post-launch) |
| Offline mode | Not critical for demo | V1.1 |

### What the Demo Build Is

The demo runs entirely on localhost. The Expo app runs on a real phone via Expo Go (scan QR from terminal). The FastAPI backend runs on the same laptop. Swiggy explicitly allows `http://localhost` as a redirect URI for dev — no deployment needed.

**Demo environment setup:**
- Phone: Expo Go installed, connected to same WiFi as laptop
- Laptop: `uvicorn main:app --reload` (port 8000) + `npx expo start` (port 8081)
- Cloud: Supabase project (free tier, takes 5 minutes to set up)
- API keys: OpenAI, Anthropic in `.env` file

**The demo video shows:**
1. Phone opens SnapCal via Expo Go — camera opens automatically
2. Camera pointed at a fridge — toggle set to Fridge mode
3. Ingredients detected and displayed as tags in under 4 seconds
4. Three Indian recipe suggestions appear with cook time and calories
5. User selects one recipe
6. Missing ingredients listed, Instamart cart built with prices
7. Confirmation screen — total in ₹, items, brands
8. Order placed (or simulated if no production credentials yet)
9. Cut to: camera pointed at a plate of dal chawal — toggle set to Meal mode
10. Dish identified, nutrition data appears instantly
11. User logs it, calorie ring in Today tab updates

Total demo video: 60–90 seconds. Record on the actual phone screen. No voiceover needed — the flow is self-explanatory.

---

## 13. Success Metrics

### Tier 1 — Builders Club Metrics (immediate)

| Metric | Target |
|---|---|
| Accepted into Swiggy Builders Club | Yes |
| Featured by Swiggy on their channels | Yes |
| Demo video views (post-submission sharing on LinkedIn) | 5,000+ |
| Swiggy engineering team Slack access | Yes |

### Tier 2 — User Metrics (90 days post-launch)

| Metric | Target |
|---|---|
| Registered users | 1,000+ |
| Daily Active Users (DAU) | 200+ |
| Average snaps per user per day | 2.0+ |
| Mode 1 sessions per week | 500+ |
| Mode 2 sessions per day | 400+ |
| Instamart orders triggered by SnapCal per day | 50+ |

### Tier 3 — Retention Metrics (90 days)

| Metric | Target |
|---|---|
| D7 retention | > 35% |
| D30 retention | > 20% |
| Users who snap 5+ days in a week | > 30% of active users |

### Quality Metrics

| Metric | Target |
|---|---|
| Dish identification accuracy (user-reported) | > 88% |
| FridgeScan ingredient accuracy (user-reported) | > 82% |
| Vision AI response time p90 | < 4 seconds |
| Zero incorrect Instamart orders placed without confirmation | Always |

---

## 14. Risks & Mitigations

### Risk 1 — Vision AI accuracy on Indian food and cluttered fridges

**Probability:** Medium
**Impact:** High — if the core feature doesn't work reliably, the product fails

**Mitigation:**
- Use GPT-5.4-mini (current cost/quality sweet spot for multimodal) for Mode 1
- Implement confidence thresholds with user confirmation fallback — never guess silently
- Fridge photo guidance UI (grid overlay, lighting tips) reduces image quality issues
- User can always manually add/remove detected ingredients
- "Not right?" always available on Meal Snap to correct identification

---

### Risk 2 — Swiggy API approval timeline creates demo delay

**Probability:** Medium
**Impact:** Medium — can demo on localhost, but production testing is limited

**Mitigation:**
- Build demo on localhost per Swiggy's documented process — no production credentials needed to impress reviewers
- Demo video recorded on localhost build — this is explicitly expected and acceptable
- Apply to Builders Club early, before production features are complete
- The demo video is what drives fast-track review — invest disproportionately in making it polished

---

### Risk 3 — Indian nutrition database accuracy challenged by users

**Probability:** Medium
**Impact:** Medium — trust damage if numbers are visibly wrong

**Mitigation:**
- Display `cooking_method_variance` clearly — show ranges for high-variance dishes instead of false precision
- Source attribution: *"Based on IFCT data"* shown to user
- "Report inaccuracy" button on every nutrition result — feeds into database improvement queue
- Never claim clinical accuracy. SnapCal's positioning is *"useful estimates"* not *"medical-grade tracking"*

---

### Risk 4 — Other Builders Club submissions also build vision-based Instamart apps

**Probability:** Low-Medium (window is open right now, narrows fast)
**Impact:** High if someone ships before us

**Mitigation:**
- The Cal AI nutrition layer is what differentiates — pure FridgeScan-to-Instamart apps don't have this
- The Indian food database is a moat that can't be replicated in days
- Expo Go means the demo is running on a real native phone — visually more impressive than any web demo
- Move fast. Demo within 3–4 weeks of this PRD.

---

### Risk 5 — Swiggy Instamart not serviceable for demo user's location

**Probability:** Low (Instamart covers 131 cities)
**Impact:** Low — demo can be done from Bangalore, full Instamart coverage

**Mitigation:**
- Record demo from Bangalore where Instamart coverage is strongest
- Have a fallback demo mode that simulates the Instamart response for locations not covered

---

## 15. Builders Club Application Angle

### Why SnapCal Gets Accepted

Swiggy's Builders Club review team is looking for three things: technical credibility, genuine user value, and novel use of their APIs. SnapCal delivers all three.

**Technical credibility:**
The Expo (React Native) + FastAPI + GPT-5.4-mini + Claude Haiku 4.5 stack demonstrates real engineering capability across mobile, backend, and AI. It's not a chatbot wrapper or a web form. It uses multiple Swiggy APIs in a deliberate, sequenced flow with a fully native camera interface — showing genuine understanding of both the platform and the product.

**Genuine user value:**
SnapCal solves a real daily problem for the exact user base Swiggy serves — urban Indians who cook sometimes and order sometimes. The nutrition layer works even without Swiggy, which means the app has standalone utility. This is not a thin integration; it's a product that happens to use Swiggy as its commerce layer.

**Novel API use:**
The `search_menu` cross-reference for Swiggy order nutrition data (Mode 2) is a use of the Food MCP that Swiggy themselves have not documented as a use case. It's genuinely new. This is exactly the kind of creative application Builders Club is designed to surface.

**What the demo video shows:**
The demo is two flows back to back, under 90 seconds. Flow 1: FridgeScan → recipe → Instamart order. Flow 2: Meal Snap → nutrition data for a typical Indian meal. No voiceover required. The product explains itself. The only title card needed: *"SnapCal — Snap your fridge. Get recipes. Know your nutrition."*

### How This PRD Supports the Application

When submitting to Builders Club, SnapCal attaches:
1. Demo video (primary)
2. Link to working localhost demo or staging app
3. GitHub repository (clean, documented)
4. This PRD (as evidence of product thinking and seriousness)
5. Brief cover note to builders@swiggy.in — one paragraph, link to demo

### What SnapCal Does for Swiggy

Swiggy's business case for approving SnapCal is clear:

- Every FridgeScan session has a real probability of generating a new Instamart order the user would not have placed otherwise
- The user intent is "I want to cook this recipe" — the order is incidental but natural
- SnapCal reaches Swiggy's target demographic (urban, 22–35, health-aware) through a daily nutrition habit that has nothing to do with delivery — and converts that daily engagement into occasional ordering
- The Indian food nutrition database, once built, is a data asset that could eventually benefit Swiggy's own product if a deeper partnership develops

This is the framing to lead with in the application: *SnapCal doesn't compete with Swiggy. SnapCal extends Swiggy's reach into the moments when users are in their kitchen, before they've decided whether to cook or order.*

---

*SnapCal PRD v1.1 — Oltaflock — May 2026*
*For Swiggy Builders Club application and internal development use*
