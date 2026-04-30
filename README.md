# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

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
# Get your keys from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Enter your endpoint URL (e.g., http://localhost:3000/api/stripe/webhook for local)
# 4. Select these events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
# 5. Click "Add endpoint" and copy the signing secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
# 1. Go to https://dashboard.stripe.com/products
# 2. Create a product for each plan, then click on it > Pricing > copy the Price ID
STRIPE_STARTER_PRICE_ID=price_...   # Starter plan: €9/month
STRIPE_GROWTH_PRICE_ID=price_...   # Growth plan: €29/month
STRIPE_PRO_PRICE_ID=price_...      # Pro plan: €79/month

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Your Supabase anonymous key |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Your Stripe secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Webhook signing secret (whsec_...) |
| `STRIPE_STARTER_PRICE_ID` | Yes | Stripe Dashboard > Products > Starter product > Pricing | Price ID for €9/month plan |
| `STRIPE_GROWTH_PRICE_ID` | Yes | Stripe Dashboard > Products > Growth product > Pricing | Price ID for €29/month plan |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Dashboard > Products > Pro product > Pricing | Price ID for €79/month plan |
| `NEXT_PUBLIC_APP_URL` | Yes | — | Your app URL (http://localhost:3000 for local) |

## 📁 Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/app/api` — API endpoints for Stripe webhooks, checkout, subscription, and linking
- `src/app/actions` — Server actions for authentication and subscription management
- `src/app/signup` — User signup page
- `src/app/chat` — AI chat interface page
- `src/components` — React components organized by feature (auth, chat, UI, sections)
- `src/lib` — Utility libraries for Supabase, Stripe configuration, and custom hooks

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add all environment variables in Vercel dashboard:
   - Go to your project > Settings > Environment Variables
   - Add each variable from `.env.example` with its value
4. Click **Deploy**

> ⚠️ **Important**: Make sure to add all environment variables before deploying. Missing variables will cause the app to fail.

For production Stripe webhooks, add an endpoint in Stripe Dashboard pointing to:
```
https://your-vercel-domain.vercel.app/api/stripe/webhook
```

## 📝 License

MIT