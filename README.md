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
# 3. Create a monthly "Growth" product at €29, copy the Price ID
STRIPE_PRICE_ID_GROWTH=price_...
# 4. Create a monthly "Pro" product at €79, copy the Price ID
STRIPE_PRICE_ID_PRO=price_...
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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > **Project URL** | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > **anon/public** key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys > **Secret key** | Server-side Stripe API key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys > **Publishable key** | Client-side Stripe key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks > your endpoint > **Signing secret** | Verifies webhook payloads (whsec_...) |
| `STRIPE_PRICE_ID_STARTER` | Yes | Stripe Dashboard > Products > Starter > Pricing > **Price ID** | Price ID for €9/month Starter plan |
| `STRIPE_PRICE_ID_GROWTH` | Yes | Stripe Dashboard > Products > Growth > Pricing > **Price ID** | Price ID for €29/month Growth plan |
| `STRIPE_PRICE_ID_PRO` | Yes | Stripe Dashboard > Products > Pro > Pricing > **Price ID** | Price ID for €79/month Pro plan |

## 📁 Project Structure

Only folders that contain actual files in this project:

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/app/api` — API endpoints for subscriptions, Stripe, chat, and user data
- `src/app/actions` — Server-side actions for subscription management
- `src/app/signup` — Signup page route
- `src/components/auth` — Authentication components (signup form)
- `src/components/chat` — Chat interface component
- `src/components/sections` — UI sections (pricing)
- `src/components/ui` — Reusable UI components (user menu)
- `src/lib/stripe` — Stripe client configuration, utilities, and custom hooks

## 🚀 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step

1. **Import your repository** — Click "Import Project" on Vercel, select your GitHub repo
2. **Add environment variables** — Go to your project > Settings > Environment Variables and add ALL variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_STARTER`
   - `STRIPE_PRICE_ID_GROWTH`
   - `STRIPE_PRICE_ID_PRO`
3. **Deploy** — Click "Deploy" and wait for the build to complete

> ⚠️ **Important**: Stripe webhook URL — After deploying, you must add your production webhook endpoint in the Stripe Dashboard with your Vercel URL (e.g., `https://your-app.vercel.app/api/stripe/webhook`)

## 📝 License

MIT