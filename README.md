# Batch Adjuster — Milk Fat Correction Calculator

A factory-floor tool for calculating batch adjustments when eggnog (or other dairy products) come out of spec. Replaces the manual two-step process of Pearson Square + Mass Balance with a one-click optimization that evaluates all options and ranks them by economics.

## What It Does

You made a batch of eggnog. You pulled a sample from the tank and your milk fat is off spec. This tool:

1. **Evaluates all fix options** — single ingredient additions, blends, bottle-off-and-adjust strategies
2. **Respects tank constraints** — won't suggest a fix that exceeds max capacity or drops below min
3. **Calculates true economics** — ingredient cost, labor, disposal, surplus waste, net outcome
4. **Compares to scrapping** — shows whether fixing is better than dumping the batch
5. **Shows the math** — full Pearson Square and mass balance breakdown for verification

## Why It's Better Than Manual Calculation

| Old Process | New Process |
|-------------|-------------|
| Calculate Pearson Square for one ingredient | Evaluates all ingredients simultaneously |
| Verify with mass balance | Auto-runs mass balance verification |
| Repeat for each ingredient | Considers bottle-off combinations |
| Manually compare costs | Ranks by net economic outcome |
| Hope you didn't miss something | Respects tank limits and sellable demand |

## Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/batch-adjuster)

### Option 2: Manual Deploy

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js — just click Deploy

### Option 3: Vercel CLI

```bash
npm i -g vercel
cd batch-adjuster
vercel
```

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Inputs

- **R&D Specification**: Target fat %, target flavor level, tolerances
- **Current Batch**: Size, actual fat %, actual flavor, cost to date
- **Tank Constraints**: Min/max capacity
- **Economics**: Finished value per lb, sellable demand, disposal cost, labor cost
- **Available Ingredients**: Which adjustment ingredients you have on hand (liquid and dry)

## Outputs

Ranked list of fix options showing:
- Action to take (add X lbs of Y, or remove Z lbs then add...)
- Resulting batch size and specs
- Whether result is in-spec
- Fix cost breakdown
- Net economic outcome
- Comparison to scrap cost
- Full Pearson Square and mass balance calculations for verification

## Customization

Edit `/src/lib/calculations.ts` to:
- Add new ingredient types
- Modify fix strategies
- Adjust economic calculations

Edit `/src/app/page.tsx` to:
- Change default values
- Add new input fields
- Modify UI layout

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- No external dependencies for calculations
