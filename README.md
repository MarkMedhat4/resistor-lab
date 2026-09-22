# Ω Resistor Lab

**Read. Calculate. Learn.**

Resistor Lab is an interactive, client-side educational web app that teaches engineering students how to read resistor color codes and calculate resistance values. It supports 4-band, 5-band and 6-band resistors, a reverse (resistance → color code) calculator, a full color-code reference table, eight short lessons, and a scored practice quiz.

Instructor by **Eng. Mark Medhat**

---

## Features

- **4-band support** — digit, digit, multiplier, tolerance
- **5-band support** — digit, digit, digit, multiplier, tolerance
- **6-band support** — adds a temperature-coefficient band (ppm/K)
- **Interactive resistor visualization** — a realistic SVG resistor (leads, body, bands) that updates live as colors are chosen
- **Step-by-step "How did we get this?" explanation** for every calculation
- **Reverse calculator** — enter a resistance + tolerance and get the matching band colors
- **Color code reference table** — every digit, multiplier, tolerance and temperature-coefficient value, with filters
- **Learn section** — 8 short lessons on resistor theory, tolerance, temperature coefficient and reading direction
- **Practice mode** — a 10-question scored quiz with Easy (4-band) / Medium (5-band) / Hard (6-band) difficulty, a progress bar, and end-of-quiz statistics
- **Copy & share results** — Clipboard API and Web Share API (with clipboard fallback)
- **Shareable URLs** — the calculator's selected bands are encoded in the URL query string and restored on load
- **Fully responsive** — desktop, tablet and mobile, down to 375px, with a mobile hamburger menu
- **Accessible** — semantic HTML, keyboard navigation, ARIA labels, visible focus states
- **Dark engineering UI** — a premium, technical, high-contrast design system

## Technology

- HTML5
- CSS3 (no preprocessor, two stylesheets: base + responsive)
- Vanilla JavaScript (ES6+, no frameworks, no build step)
- Inline SVG for the resistor visualization and logo
- Google Fonts: Inter (UI) and JetBrains Mono (numeric/engineering values)

No backend. No database. No build process. The app runs entirely in the browser and works by simply opening `index.html`.

## Project structure

```
resistor-lab/
├── index.html
├── css/
│   ├── style.css          # design system + layout
│   └── responsive.css     # tablet/mobile breakpoints
├── js/
│   ├── resistor-data.js       # color code reference data
│   ├── calculator.js          # bands → resistance
│   ├── reverse-calculator.js  # resistance → bands
│   ├── visualization.js       # SVG resistor renderer
│   ├── practice.js            # quiz generation & scoring
│   └── app.js                 # UI wiring / event handlers
├── assets/
│   ├── logo.svg
│   └── icons/
│       └── favicon.svg
├── README.md
├── LICENSE
└── .gitignore
```

## Local usage

No installation or build step is required.

```bash
# just open it
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or serve it locally with any static server, for example:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deploying to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Resistor Lab"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Deploying to Vercel

1. Push the repository to GitHub (see above).
2. In the [Vercel dashboard](https://vercel.com/new), import the repository.
3. Framework preset: **Other** (static site). No build command and no output directory override are needed — `index.html` is served from the project root as-is.
4. Deploy.

You can also deploy with the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Customization

- **Colors & typography** — edit the CSS custom properties at the top of `css/style.css` (`:root { --bg, --card, --accent-blue, ... }`).
- **Resistor color-code values** — edit `js/resistor-data.js`; every other module reads from this single source of truth.
- **Lessons** — edit the `<details class="lesson card">` blocks inside the `#learn` section of `index.html`.
- **Quiz length** — change `QUESTIONS_PER_QUIZ` in `js/practice.js`.

## Engineering calculation logic

**4-band:** `resistance = (digit1 × 10 + digit2) × multiplier`, tolerance from band 4.

**5-band:** `resistance = (digit1 × 100 + digit2 × 10 + digit3) × multiplier`, tolerance from band 5.

**6-band:** same as 5-band, plus a temperature coefficient (ppm/K) read from band 6.

**Reverse calculation:** the target resistance is normalized to 2 (4-band) or 3 (5-band) significant digits and an appropriate power-of-ten multiplier, then each digit and the multiplier/tolerance are mapped back to their colors.

Verified test cases (see `js/calculator.js` / `js/reverse-calculator.js`):

| Bands | Result |
|---|---|
| Brown, Red, Orange, Gold | 12 kΩ ±5% |
| Yellow, Violet, Red, Gold | 4.7 kΩ ±5% |
| Brown, Black, Black, Red, Brown | 10 kΩ ±1% |
| Red, Violet, Yellow, Black, Red, Black | 274 Ω ±2%, 250 ppm/K |

## Credits

Built as **Resistor Lab** — an interactive engineering education tool.

Instructor by **Eng. Mark Medhat**

© 2026
