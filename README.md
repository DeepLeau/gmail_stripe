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

Copy the template from `.env.example` and fill in all values:

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
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_START_PRICE_ID=price_...
# 3. Create a monthly "Growth" product at €29, copy the Price ID
STRIPE_PRICE_ID_GROWTH=price_...
STRIPE_SCALE_PRICE_ID=price_...
# 4. Create a monthly "Pro" product at €79, copy the Price ID
STRIPE_PRICE_ID_PRO=price_...
STRIPE_TEAM_PRICE_ID=price_...

# Cron Secret — generate a random secure string
CRON_SECRET=your_random_secret_string

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with Ctrl+` (or Cmd+` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard > Project Settings > API > anon/key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | ✅ | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | Secret key for Stripe API (starts with `sk_live_` or `sk_test_`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | Publishable key for Stripe.js (starts with `pk_live_` or `pk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) — create an endpoint and copy the signing secret | Validates Stripe webhook payloads |
| `STRIPE_PRICE_ID_STARTER` | ✅ | Stripe Dashboard > Products > Starter product > Pricing | Price ID for €9/mo Starter plan |
| `STRIPE_PRICE_ID_GROWTH` | ✅ | Stripe Dashboard > Products > Growth product > Pricing | Price ID for €29/mo Growth plan |
| `STRIPE_PRICE_ID_PRO` | ✅ | Stripe Dashboard > Products > Pro product > Pricing | Price ID for €79/mo Pro plan |
| `STRIPE_START_PRICE_ID` | ✅ | Stripe Dashboard > Products > Start plan > Pricing | Alternative Starter price ID |
| `STRIPE_SCALE_PRICE_ID` | ✅ | Stripe Dashboard > Products > Scale plan > Pricing | Alternative Scale price ID |
| `STRIPE_TEAM_PRICE_ID` | ✅ | Stripe Dashboard > Products > Team plan > Pricing | Alternative Team price ID |
| `CRON_SECRET` | ✅ | Generate a random string (e.g., run `openssl rand -base64 32` in terminal) | Secures the usage reset endpoint |
| `NEXT_PUBLIC_BASE_URL` | ✅ | `http://localhost:3000` for local dev | Base URL of your app |

## 📁 Project Structure

```
src/app — Next.js App Router pages and API routes
src/app/api — API endpoints (Stripe webhooks, checkout, subscription, usage recording)
src/app/signup — Signup page
src/app/chat — Chat page
src/components/auth — Authentication components (signup form)
src/components/chat — Chat interface components (chat window, input)
src/components/ui — Reusable UI components (user menu)
src/components/sections — Section components (pricing display)
src/lib/stripe — Stripe client utilities, configuration, and custom hooks
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository** — Click "Import Project" on Vercel, select your GitHub repo
2. **Add environment variables** — In the Vercel dashboard, go to your project > Settings > Environment Variables and add all the variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_STARTER`
   - `STRIPE_PRICE_ID_GROWTH`
   - `STRIPE_PRICE_ID_PRO`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (set to your production URL, e.g., `https://your-app.vercel.app`)
3. **Deploy** — Vercel will automatically build and deploy your app

> ⚠️ **Important**: After deploying, go to Stripe Dashboard > Webhooks and add your production URL (e.g., `https://your-app.vercel.app/api/stripe/webhook`) with the same events you selected locally.

## 📝 License

MIT