# SnapCal — 60–90 second demo storyboard

Record on a real phone via Expo Go. Screen recording at 1080p60. No voiceover required — the product self-explains. Add the single title card at the start and you're done.

---

## Pre-flight (do this once before recording)

1. **Backend:** `cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. **Find your LAN IP:** `ipconfig getifaddr en0` (macOS Wi-Fi)
3. **Expo client env:** `EXPO_PUBLIC_API_URL=http://<lan-ip>:8000 npx expo start` in `app/`
4. **Phone:** install Expo Go from the App Store / Play Store, scan the QR. Confirm camera permission once.
5. **Stage props:**
   - A reasonably full fridge with paneer, tomatoes, onions, coriander visible — or any fridge with several items
   - A plate of dal chawal (or any Indian meal you have) for Mode 2
   - Quiet room — we don't need audio

---

## Shot list (target 75s, hard limit 90s)

| # | Time | Shot | What we show | Why it matters to Swiggy |
|---|------|------|--------------|--------------------------|
| 0 | 0–2s | Title card | "SnapCal — Snap your fridge. Get recipes. Know your nutrition." Logo + Powered by Swiggy badge | Sets context immediately |
| 1 | 2–5s | App opens | SnapCal launches on phone via Expo Go, camera open, Fridge/Meal toggle visible, Powered-by-Swiggy chip top-left | Real native app, not a webview |
| 2 | 5–10s | Toggle to **Fridge**, point at fridge interior, tap shutter | "Reading your fridge…" overlay | Camera-first interaction; <4s vision call |
| 3 | 10–18s | Fridge result screen: 7–8 ingredient pills appear, tap × on one ("we got this wrong"), tap **Find recipes →** | Editable detected ingredients; user has control | Trust + accuracy framing |
| 4 | 18–28s | 3 Indian recipe cards: Paneer Bhurji at the top with kcal, protein, cook time, ingredients you have (green) vs need (grey). Tap first card. | Claude Sonnet recipe engine; ranking by fewest missing | Recipe relevance to Indian users |
| 5 | 28–42s | Instamart cart screen: Amul Paneer, Mother Dairy curd, Tata salt etc with ₹ prices, total ₹X, ETA, Powered-by-Swiggy badge, payment toggle. Tap **Place Order**. | Real Instamart-shaped data; brand preferences; explicit confirm | **This is the Swiggy commerce moment** |
| 6 | 42–48s | Order confirmation screen: green tick, order ID `SW_ORD_…`, ETA, Powered-by-Swiggy badge | Mock order placed — `update_cart` → `checkout` flow | Demonstrates the MCP call sequence end-to-end |
| 7 | 48–53s | Swipe back to camera, toggle to **Meal**, point at dal chawal plate, tap shutter | "Identifying your meal…" | Daily-use mode |
| 8 | 53–65s | Meal result: "Dal Tadka" (hindi underneath), big 162 kcal, P/C/F/Fibre row, "From SnapCal Indian food DB" source. Tap **This is from Swiggy** | India-accurate nutrition + the novel `search_menu` path | **The standout API use** |
| 9 | 65–70s | Restaurant picker (mock get_orders results) → pick one → menu match | `get_orders` + `search_menu` cross-reference | Concrete Food MCP usage |
| 10 | 70–75s | Updated meal result now shows "Nutrition from Swiggy menu data" badge. Tap **Log this meal**. | Source attribution is visible | Honest about where numbers come from |
| 11 | 75–80s | Today tab opens: large calorie ring, macro rings, the meal we just logged + the planned Paneer Bhurji from Mode 1 (with PLANNED badge) | Three modes connecting | Retention engine, not a one-off interaction |

---

## What to NOT do

- Don't add a voiceover. The product explains itself in motion.
- Don't speed it up. 75 seconds at real time looks like a real product. Sped up looks like a tech demo.
- Don't try to type or scroll into screens we haven't pre-staged.
- Don't show the OpenAI / Anthropic billing dashboard or the terminal. Reviewers don't care about logs; they care about the phone screen.

## After recording

1. Trim head + tail, normalise audio (or remove it), export H.264 mp4.
2. Upload to Loom or YouTube (unlisted).
3. Paste the URL into [`application-answers.md`](application-answers.md) and [`cover-email.md`](cover-email.md), commit, push.
4. Submit the form, send the email.
