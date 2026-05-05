# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Choose from Start, Scale, and Team tiers with Stripe integration

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication
- **Payments**: Stripe (checkout, webhooks, subscription management)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)

### 1. Clone the repository

Open your terminal (more on this below) and run:

```bash
git clone https://github.com/YOUR_USERNAME/my-app.git
cd my-app
```

**Where is my terminal?**

- **VS Code**: Press `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac) — this opens the built-in terminal at the bottom of the window
- **Mac**: Open Spotlight (`Cmd+Space`), type "Terminal", press Enter
- **Windows**: Press `Win+R`, type "cmd", press Enter

### 2. Install dependencies

```bash
npm install
```

This will install all the packages listed in `package.json`.

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services.

Copy the template from `.env.example` and fill in all values:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
# Find these in: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
# 1. Go to https://dashboard.stripe.com/products
# 2. Click "Add product" and create a recurring price
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `` Ctrl+` `` (or `` Cmd+` `` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard → Developers → API keys → Secret key | Backend-only Stripe API key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret | Verifies webhook requests are from Stripe |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard → Products → your Start product → Pricing → Price ID | Price ID for the Start plan (€10/month) |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard → Products → your Scale product → Pricing → Price ID | Price ID for the Scale plan (€39/month) |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard → Products → your Team product → Pricing → Price ID | Price ID for the Team plan (€79/month) |

**How to find Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API**
5. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to create Stripe prices:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click **Add product**
3. Name it "Start" and set price €10/month recurring
4. Click on the product → **Pricing** → copy the **Price ID** (starts with `price_`)
5. Repeat for Scale (€39) and Team (€79)

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/components/auth` — Authentication UI components
- `src/components/chat` — Chat interface components
- `src/components/ui` — Reusable UI components
- `src/components/sections` — Page section components
- `src/lib/stripe` — Stripe integration utilities and hooks
- `src/lib/supabase` — Supabase server utilities

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add all environment variables in Vercel dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add each variable from `.env.example`
4. Click **Deploy**

Your app will be live at `https://your-project.vercel.app`!

## 📝 License

MIT