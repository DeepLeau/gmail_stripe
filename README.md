# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe integration

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

Copy the template from `.env.example` and fill in the values:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
# Find these in: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Enter your endpoint URL (e.g., https://yourdomain.com/api/stripe/webhook)
# 4. Select "checkout.session.completed" and "customer.subscription.updated"
# 5. Copy the webhook signing secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
# 1. Go to https://dashboard.stripe.com/products
# 2. Create a monthly "Starter" product at €9, click on it > Pricing > copy the Price ID
STRIPE_STARTER_PRICE_ID=price_...
# 3. Create a monthly "Growth" product at €29, copy the Price ID
STRIPE_GROWTH_PRICE_ID=price_...
# 4. Create a monthly "Pro" product at €49, copy the Price ID
STRIPE_PRO_PRICE_ID=price_...

# Base URL
# Use http://localhost:3000 for local development
# Use your production URL (e.g., https://yourapp.vercel.app) when deployed
NEXT_PUBLIC_BASE_URL=http://localhost:3000
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
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Webhooks > your endpoint > Signing secret | Verifies incoming webhook requests |
| `STRIPE_STARTER_PRICE_ID` | Yes | Stripe Dashboard > Products > Starter > Pricing > Price ID | Price ID for the Starter subscription plan |
| `STRIPE_GROWTH_PRICE_ID` | Yes | Stripe Dashboard > Products > Growth > Pricing > Price ID | Price ID for the Growth subscription plan |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Dashboard > Products > Pro > Pricing > Price ID | Price ID for the Pro subscription plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set manually | `http://localhost:3000` for dev, your production URL for live |

**How to find Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click on **API**
5. Copy **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/app/api` — API routes for Stripe checkout, webhooks, subscriptions, and chat
- `src/app/actions` — Server-side actions for subscription management
- `src/app/chat` — Chat page with AI interface
- `src/app/signup` — User registration page
- `src/components/auth` — Authentication components (signup form)
- `src/components/chat` — Chat interface components
- `src/components/sections` — UI sections (pricing)
- `src/lib/stripe` — Stripe client configuration, utilities, and React hooks
- `src/lib/stripe/hooks` — Custom hooks for Stripe integration

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository** — Click "Import Project" on Vercel and select your GitHub repo
2. **Add environment variables** — Before deploying, go to your project > **Settings** > **Environment Variables** and add all variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_STARTER_PRICE_ID`
   - `STRIPE_GROWTH_PRICE_ID`
   - `STRIPE_PRO_PRICE_ID`
   - `NEXT_PUBLIC_BASE_URL` (set to your production URL, e.g., `https://yourapp.vercel.app`)
3. **Deploy** — Click "Deploy" and wait for the build to complete
4. **Configure Stripe webhook** — Add your new production URL as a webhook endpoint in Stripe Dashboard: `https://yourapp.vercel.app/api/stripe/webhook`

> ⚠️ **Important**: Make sure to add all environment variables in Vercel before deploying. If you forget, you'll need to redeploy after adding them.

## 📝 License

MIT