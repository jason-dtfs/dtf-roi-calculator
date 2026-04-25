# DTF Station ROI Calculator — Design Brainstorm

## Context
A professional ROI calculator tool for DTF Station NA. Target audience: dealers and end users evaluating the purchase of DTF printing equipment. Tone: technical, credible, modern, educational.

---

<response>
<text>
## Idea 1: Industrial Precision Dashboard

**Design Movement:** Bauhaus-meets-Industrial-Tech — form follows function, but with precision craftsmanship.

**Core Principles:**
- Grid-based data density with generous breathing room between sections
- Hard-edged typographic hierarchy using contrast weight (heavy headers, light data)
- Muted industrial palette with a single electric accent for key metrics
- Information architecture that mirrors a production floor workflow

**Color Philosophy:**
Charcoal (#1C1C1E) background with off-white (#F5F4F0) text. A single electric amber (#F5A623) for ROI highlights and CTA elements. Subtle warm gray (#2E2E30) for card surfaces. This evokes precision machinery and professional production environments.

**Layout Paradigm:**
Left-anchored two-column split: inputs on the left (40%), results dashboard on the right (60%). The right panel updates in real time as users adjust sliders. No centered hero — starts immediately with the calculator interface.

**Signature Elements:**
- Thick left-border accent lines on metric cards (amber)
- Monospaced font for all numeric outputs (JetBrains Mono)
- Subtle diagonal hatching texture on the header bar

**Interaction Philosophy:**
Sliders and dropdowns feel mechanical — precise, snappy. Number outputs animate with a counting-up effect when values change.

**Animation:**
- Numbers count up/down smoothly on input change (300ms ease-out)
- Cards slide in from left on page load (staggered 80ms delay)
- Hover on metric cards: subtle lift with amber left-border brightening

**Typography System:**
- Display: Space Grotesk Bold (headers, machine names)
- Body: Inter Regular (labels, descriptions)
- Data: JetBrains Mono (all numbers and metrics)
</text>
<probability>0.07</probability>
</response>

<response>
<text>
## Idea 2: Clean Professional Tool — Dark Navy Command Center

**Design Movement:** Enterprise SaaS Dashboard — the aesthetic of Bloomberg Terminal meets modern fintech.

**Core Principles:**
- Dark navy base creates authority and focus on data
- Bright cyan/teal accent for interactive elements and positive ROI indicators
- Structured card-based layout with clear visual hierarchy
- Progressive disclosure: simple inputs first, detailed breakdown on demand

**Color Philosophy:**
Deep navy (#0D1B2A) background, medium navy (#1A2E45) for cards. Bright cyan (#00D4FF) for primary actions and positive metrics. Warm white (#E8EDF2) for text. Red-orange (#FF6B4A) for cost/expense indicators. This palette signals financial precision and professional confidence.

**Layout Paradigm:**
Full-width header with DTF Station branding, then a three-section vertical flow: (1) Equipment Selector with visual cards, (2) Business Parameters with sliders, (3) Results Dashboard with charts and metrics. Sticky results sidebar on desktop.

**Signature Elements:**
- Glowing cyan borders on selected equipment cards
- Animated line chart showing monthly profit trajectory
- Circular progress rings for payback period visualization

**Interaction Philosophy:**
Equipment selection feels like choosing a product in an e-commerce context — visual cards with specs. Financial inputs use large, accessible sliders with live preview.

**Animation:**
- Equipment cards scale up on hover with glow effect
- Results section fades in after first input interaction
- Chart draws itself line-by-line on calculation

**Typography System:**
- Display: Syne ExtraBold (hero text, section headers)
- Body: DM Sans Regular (descriptions, labels)
- Data: Roboto Mono (financial figures)
</text>
<probability>0.09</probability>
</response>

<response>
<text>
## Idea 3: Modern Light — Structured Financial Tool

**Design Movement:** Contemporary B2B SaaS — clean, credible, and conversion-focused.

**Core Principles:**
- White/light gray base for maximum readability and trust
- Strong typographic hierarchy using weight contrast
- Color used sparingly — only for data differentiation and CTAs
- Structured step-by-step flow that guides users through the calculation

**Color Philosophy:**
Pure white (#FFFFFF) background, light gray (#F7F8FA) for alternating sections and cards. DTF Station's authoritative dark (#111827) for headlines. A bold red-orange (#E8421A) as the brand accent for CTAs and key metrics. Soft green (#22C55E) for profit indicators. This communicates professionalism and financial clarity.

**Layout Paradigm:**
Top navigation with DTF Station logo, then a stepped single-column layout on mobile that expands to a two-column layout on desktop. Equipment selector at top, inputs in the middle, results at bottom with a sticky summary bar.

**Signature Elements:**
- Bold red-orange section dividers and CTA buttons
- Clean data table for cost breakdown
- Bar chart comparing cost-to-outsource vs. in-house production

**Interaction Philosophy:**
Step-by-step wizard feel — each section clearly labeled. Tooltips explain technical terms. Print/export button for sharing results.

**Animation:**
- Smooth accordion open/close for sections
- Number flip animation on metric changes
- Subtle fade-in for results section

**Typography System:**
- Display: Outfit Bold/ExtraBold (headers)
- Body: Outfit Regular (body text, labels)
- Data: Outfit Medium with tabular-nums (financial figures)
</text>
<probability>0.08</probability>
</response>

---

## Selected Direction

**Idea 2: Dark Navy Command Center** is selected.

This direction best reflects DTF Station's positioning as a professional production ecosystem brand. The dark navy palette communicates authority and precision — qualities that resonate with dealers and business owners making significant capital equipment investments. The cyan accent creates a modern, technology-forward feel that differentiates from competitors. The structured layout with visual equipment cards makes the tool engaging and easy to use, while the animated charts make ROI tangible and compelling.
