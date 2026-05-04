# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Choose from Starter, Scale, and Team tiers with Stripe integration

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
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

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to Stripe and Supabase.

Copy the template below and fill in all the values. Each variable tells you exactly where to find it:

```bash
# Supabase — your database and auth service
# Go to: https://supabase.com > Your Project > Project Settings > API
# Copy "Project URL" for the first value
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
# Copy "anon public" key (safe to expose to browsers)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Stripe — your payment processing
# Go to: https://dashboard.stripe.com/apikeys
# Copy the secret key (starts with sk_)
STRIPE_SECRET_KEY=sk_test_...
# Copy the publishable key (starts with pk_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret — to verify payment events are real
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Enter: https://yourdomain.com/api/stripe/webhook
# 4. Under "Select events", add: checkout.session.completed, customer.subscription.updated
# 5. Click "Add endpoint" and copy the "Signing secret" (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — your subscription plan prices
# 1. Go to https://dashboard.stripe.com/products
# 2. Create a product (e.g., "Starter") and click into it
# 3. Click "Pricing" and copy the Price ID (starts with price_)
STRIPE_PRICE_START=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_PRICE_TEAM=price_...

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac) — then you can run all the commands above without leaving your editor.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project connection URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Project Settings → API → anon/public key | Public key for browser-safe Supabase access |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard → Developers → API Keys → Secret key | Private API key for server-side Stripe (never share this) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard → Developers → API Keys → Publishable key | Public key for browser Stripe integration |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard → Webhooks → your endpoint → Signing secret | Verifies incoming webhook events are from Stripe |
| `STRIPE_PRICE_START` | ✅ | Stripe Dashboard → Products → Starter product → Pricing | Price ID for the Start subscription plan |
| `STRIPE_PRICE_SCALE` | ✅ | Stripe Dashboard → Products → Scale product → Pricing | Price ID for the Scale subscription plan |
| `STRIPE_PRICE_TEAM` | ✅ | Stripe Dashboard → Products → Team product → Pricing | Price ID for the Team subscription plan |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Use `http://localhost:3000` locally | Base URL of your application |

## 📁 Project Structure

- src/app — Next.js App Router pages and API routes (authentication, checkout, subscription, webhooks, chat status)
- src/components/auth — Authentication components (SignupForm)
- src/components/chat — Chat UI components (ChatInterface, ChatInput)
- src/components/sections — Page section components (Pricing)
- src/components/ui — Reusable UI components (UserMenu)
- src/lib/stripe — Stripe client configuration, server config, and React hooks for signup/payment linking
- src/lib — Shared utilities and data helpers

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings → Environment Variables**
4. Add all the variables from your `.env.local` file (copy each key-value pair)
5. Click **Deploy**

> ⚠️ **Important**: Make sure to add ALL environment variables from your `.env.local` to Vercel, especially `STRIPE_WEBHOOK_SECRET` — your payments won't work without it.

## 📝 License

MIT