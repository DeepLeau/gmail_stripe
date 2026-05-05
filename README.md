# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Three tiers (Start €10/mo, Scale €39/mo, Team €79/mo) with Stripe integration

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

Copy the template below and fill in all values:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API > Project URL and anon/public key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
# Find your API keys at: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Enter your endpoint URL (e.g., https://yourdomain.com/api/stripe/webhook)
# 4. Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
# 5. Copy the webhook signing secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
# Go to https://dashboard.stripe.com/prices and create these three monthly prices:
# - Start plan: €10/month, recurring monthly, EUR
# - Scale plan: €39/month, recurring monthly, EUR
# - Team plan: €79/month, recurring monthly, EUR
# Copy each Price ID (starts with price_)
STRIPE_PRICE_START=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_PRICE_TEAM=price_...

# App URL
# Your app's URL (use http://localhost:3000 for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys > Secret key | Server-side Stripe API key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys > Publishable key | Client-side Stripe API key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks > your endpoint | Verifies incoming webhook requests (whsec_...) |
| `STRIPE_PRICE_START` | Yes | Stripe Dashboard > Products > your Start product > Pricing | Price ID for the €10/month Start plan |
| `STRIPE_PRICE_SCALE` | Yes | Stripe Dashboard > Products > your Scale product > Pricing | Price ID for the €39/month Scale plan |
| `STRIPE_PRICE_TEAM` | Yes | Stripe Dashboard > Products > your Team product > Pricing | Price ID for the €79/month Team plan |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployed app URL or http://localhost:3000 | Used for Stripe success/cancel redirect URLs |

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/app/api/stripe` — Stripe API routes for checkout and webhooks
- `src/app/api/subscription` — Subscription management API
- `src/app/actions` — Server actions for authentication and subscriptions
- `src/app/components` — React components including auth forms
- `src/lib/stripe` — Stripe client configuration, utilities, and React hooks
- `.env.example` — Template for required environment variables

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository** — Click "Import Git Repository" and select your GitHub repo
2. **Configure project** — Vercel will auto-detect Next.js settings
3. **Add environment variables** — Go to Settings > Environment Variables and add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_START`
   - `STRIPE_PRICE_SCALE`
   - `STRIPE_PRICE_TEAM`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL)
4. **Deploy** — Click "Deploy" and wait for the build to complete

> ⚠️ **Important**: After deploying, you must add your Vercel URL (`https://your-app.vercel.app`) as a webhook endpoint in the Stripe Dashboard with the same events you configured locally.

## 📝 License

MIT