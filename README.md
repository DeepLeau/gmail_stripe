# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask questions in natural language, just like you would with an assistant.

## ✨ Features

- **AI Chat Interface** — Ask questions about your emails in plain English through a clean, modern chat experience
- **User Authentication** — Sign up and log in to access your personal chat with Supabase
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe checkout
- **Webhook Integration** — Handles Stripe subscription events for seamless plan management

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
STRIPE_STARTER_PRICE_ID=price_...
# 3. Create a monthly "Growth" product at €29, copy the Price ID
STRIPE_GROWTH_PRICE_ID=price_...
# 4. Create a monthly "Pro" product at €49, copy the Price ID
STRIPE_PRO_PRICE_ID=price_...

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon key | Supabase anonymous (public) key |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe secret key (starts with `sk_`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Stripe publishable key (starts with `pk_`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Webhook signing secret (starts with `whsec_`) |
| `STRIPE_STARTER_PRICE_ID` | Yes | Stripe Dashboard > Products > Starter > Pricing | Price ID for Starter plan |
| `STRIPE_GROWTH_PRICE_ID` | Yes | Stripe Dashboard > Products > Growth > Pricing | Price ID for Growth plan |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Dashboard > Products > Pro > Pricing | Price ID for Pro plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your deployment URL | Base URL for your app |

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/components/auth` — Authentication components (signup forms)
- `src/components/chat` — Chat interface components (ChatInterface, ChatInput)
- `src/components/ui` — Reusable UI components (UserMenu)
- `src/components/sections` — Page sections (Pricing)
- `src/lib/stripe` — Stripe client configuration, utilities, and custom hooks

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add all environment variables in Vercel dashboard:
   - Go to your project > Settings > Environment Variables
   - Add each variable from `.env.example` with its value
4. Click Deploy

> ⚠️ **Important**: Make sure to add ALL environment variables — your app won't work without them, especially the Stripe and Supabase keys.

## 📝 License

MIT