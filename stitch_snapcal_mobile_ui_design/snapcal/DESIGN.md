---
name: SnapCal
colors:
  surface: '#fff8f5'
  surface-dim: '#ebd6ca'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ea'
  surface-container: '#ffeadf'
  surface-container-high: '#fae4d8'
  surface-container-highest: '#f4ded3'
  on-surface: '#241912'
  on-surface-variant: '#574236'
  inverse-surface: '#3b2e26'
  inverse-on-surface: '#ffede4'
  outline: '#8b7264'
  outline-variant: '#dec1b0'
  surface-tint: '#984800'
  primary: '#984800'
  on-primary: '#ffffff'
  primary-container: '#fc8019'
  on-primary-container: '#5e2a00'
  inverse-primary: '#ffb689'
  secondary: '#6e5b48'
  on-secondary: '#ffffff'
  secondary-container: '#f8dec5'
  on-secondary-container: '#74614d'
  tertiary: '#006590'
  on-tertiary: '#ffffff'
  tertiary-container: '#00adf3'
  on-tertiary-container: '#003d59'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc8'
  primary-fixed-dim: '#ffb689'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#733500'
  secondary-fixed: '#f8dec5'
  secondary-fixed-dim: '#dbc2ab'
  on-secondary-fixed: '#26190a'
  on-secondary-fixed-variant: '#554432'
  tertiary-fixed: '#c8e6ff'
  tertiary-fixed-dim: '#87ceff'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6d'
  background: '#fff8f5'
  on-background: '#241912'
  surface-variant: '#f4ded3'
typography:
  display-calories:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  macro-number:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 20px
  stack-gap-lg: 24px
  stack-gap-md: 16px
  stack-gap-sm: 8px
  item-radius: 16px
  grid-margin: 20px
---

## Brand & Style

The design system is engineered for the fast-paced lifestyle of urban Indians, prioritizing speed, warmth, and dietary transparency. The brand personality is that of a "Knowledgeable Companion"—reliable and expert, yet approachable and encouraging rather than clinical. 

The aesthetic follows a **Modern/Warm** approach, blending the efficiency of high-utility SaaS with the inviting hospitality of food-tech. It utilizes a soft, off-white foundation to reduce eye strain and create a "kitchen-table" warmth, contrasted with crisp, high-confidence typography and vibrant macro-nutrient identifiers. The emotional goal is to transform the chore of calorie tracking into a seamless, high-reward interaction that feels as easy as ordering a meal.

## Colors

This color palette is designed for high scannability and emotional resonance. 

- **Primary Saffron (#FC8019):** Used for primary actions, progress indicators, and brand touchpoints to leverage existing mental models of food-tech reliability.
- **Warm Background (#FFFBF6):** Replaces clinical white to provide a premium, organic feel that complements food photography.
- **Macro-Nutrient Palette:** Distinctive, high-contrast colors for Protein, Carbs, and Fat ensure that users can interpret their nutritional balance at a glance without reading text.
- **Success & Warning:** Functional colors used for goal achievement and dietary alerts, maintaining high accessibility standards.

## Typography

The system utilizes **Plus Jakarta Sans** for its friendly yet precise geometric qualities. The hierarchy is optimized for **Nutrition-First Reading**:

- **Calorie Display:** Massive, bold weights for daily totals to provide immediate feedback.
- **Macro Numbers:** Emphasized weights to allow users to compare Protein/Carbs/Fat quickly.
- **Contextual Labels:** Small caps are used for category headers (e.g., "BREAKFAST", "LUNCH") to create clear section breaks without adding visual bulk.
- **iOS Optimization:** All sizes are tuned for the 390px width, ensuring comfortable tap targets and no awkward line breaks for long Indian dish names.

## Layout & Spacing

This design system employs a **Fluid-to-Edge** layout model optimized for iOS. 

- **The 20px Rule:** A consistent 20px margin is maintained on the left and right edges of the screen to ensure content sits comfortably within the hardware curves of the iPhone.
- **Vertical Rhythm:** A base-8 unit system is used for vertical spacing. Use 24px to separate distinct sections (e.g., Daily Summary vs. Logged Meals) and 16px for elements within a group.
- **Safe Areas:** Adhere strictly to the iOS Home Indicator and Status Bar safe areas, ensuring the Saffron primary actions (like "Snap a Photo") are never obscured.

## Elevation & Depth

Hierarchy is established through **Soft Tonal Elevation** rather than harsh borders.

- **Level 0 (Background):** The warm off-white `#FFFBF6` acts as the canvas.
- **Level 1 (Cards):** Pure white `#FFFFFF` surfaces used for meal logs and data cards. These use "Ambient Shadows": a 16px blur with 4% opacity black and a slight Y-offset (4px) to create a "floating" effect.
- **Level 2 (Modals/Overlays):** These utilize the same shadow profile but increase the opacity to 8% to suggest a closer proximity to the user.
- **Zero-Border Policy:** Do not use strokes for containers; let the subtle shadow and color contrast define the boundaries of the UI.

## Shapes

The shape language is **Warm & Modern**. 
- Standard UI cards and input fields use a **16px (rounded-lg)** radius to evoke a friendly, approachable feel.
- Interactive buttons for "Add Food" or "Start Scan" should utilize a **Pill-shape (full rounding)** to differentiate them from informational containers.
- Small indicators, like macro tags or unit toggles, use an **8px (soft)** radius.

## Components

### Buttons & Inputs
- **Primary Action:** Pill-shaped, Saffron (#FC8019) background with White text. Bold weight.
- **Secondary Action:** Pill-shaped, Soft Saffron (#FFE5CC) background with Saffron text.
- **AI Input:** Text fields should be pure white, 56px height for touch-ready interaction, using the 16px corner radius.

### Macro Indicators
- Small vertical pill shapes or circular progress rings. 
- Always pair the color with the label (e.g., Green circle next to "Protein") to assist color-blind users.

### The 'Powered by Swiggy' Badge
- **Style:** A horizontal capsule with a white or transparent background.
- **Content:** The Swiggy Saffron "S" monogram followed by "Powered by Swiggy" in the brand's signature wordmark style.
- **Placement:** Positioned at the bottom of nutrition cards or the "Scan" results screen to provide a trust signal for the data source.

### Food Cards
- Features a high-quality food image on the left (rounded 12px), dish name in `headline-md`, and calories in `macro-number` Saffron text.
- Swipe-to-delete functionality follows standard iOS patterns.