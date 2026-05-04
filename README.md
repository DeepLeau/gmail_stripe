# Emind

Your AI-powered workspace assistant — connect, search, and chat with your data in natural language.

## ✨ Features

- **Subscription Management** — Three pricing tiers (Starter, Growth, Team) with Stripe integration
- **AI Chat Interface** — Clean, modern chat experience with usage tracking
- **User Authentication** — Sign up and log in with Supabase
- **Stripe Checkout** — Secure payment flow with webhook support for subscription events
- **Stripe Linking** — Connect your Stripe account for enhanced features

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication
- **Payments**: Stripe (checkout, webhooks, subscriptions)

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

Copy everything from `.env.example` and fill in each value as described below.

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac)

## 🔑 Environment Variables

Create a `.env.local` file in your project root with these variables:

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase Dashboard → Project Settings → API → anon key | Public key for Supabase client |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Use `http://localhost:3000` for local dev | Your app's base URL |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe Dashboard → Developers → API keys → Secret key | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ Yes | Stripe Dashboard → Developers → Webhooks | Signing secret for webhook events |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | Stripe Dashboard → Developers → API keys → Publishable key | Stripe public key for client |
| `STRIPE_START_PRICE_ID` | ✅ Yes | Stripe Dashboard → Products → select product → Pricing → copy Price ID | Price ID for Starter plan (10€/mo) |
| `STRIPE_SCALE_PRICE_ID` | ✅ Yes | Stripe Dashboard → Products → select product → Pricing → copy Price ID | Price ID for Scale plan (39€/mo) |
| `STRIPE_TEAM_PRICE_ID` | ✅ Yes | Stripe Dashboard → Products → select product → Pricing → copy Price ID | Price ID for Team plan (79€/mo) |

**How to find Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Click **Project Settings** (gear icon)
4. Go to the **API** section
5. Copy **Project URL** for `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon public** key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to find Stripe credentials:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign in
2. For API keys: click **Developers** → **API keys** — copy the secret key (starts with `sk_`)
3. For publishable key: copy the key starting with `pk_`

**How to create Stripe products and get Price IDs:**
1. Go to **Products** in Stripe Dashboard
2. Click **Add product**
3. Name it (e.g., "Starter") and set price (e.g., €10/month)
4. Click **Add pricing** → select **Recurring** → set amount
5. Save the product
6. Click on the product → click on the pricing option → copy the **Price ID** (starts with `price_`)

## 📁 Project Structure

src/app/actions — Server actions for subscription and Stripe operations
src/app/api/subscription — Subscription management API routes
src/app/api/stripe — Stripe API routes (checkout, webhook, link)
src/components/auth — Authentication components (SignupForm)
src/components/chat — Chat interface components
src/components/sections — Page sections (Pricing)
src/lib/stripe — Stripe configuration, client utilities, and custom hooks
src/lib/data — Data utilities
src/lib/chat — Mock API for chat functionality

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings** → **Environment Variables**
4. Add ALL the environment variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
5. Click **Deploy**

> ⚠️ **Important**: After deploying, you must update your Stripe webhook URL to point to your production URL (e.g., `https://your-app.vercel.app/api/stripe/webhook`) and update `NEXT_PUBLIC_APP_URL` to your production URL.

## 📝 License

MIT