# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **User Signup** — Create an account and manage your subscription
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe integration
- **Stripe Checkout** — Secure payment flow for subscription management
- **Webhook Processing** — Real-time subscription status updates via Stripe webhooks

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

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_PRO=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|-----------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Your Supabase anonymous key |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Your Stripe secret key (sk_live_... or sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Your Stripe publishable key (pk_live_... or pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks | Signing secret for webhook verification (whsec_...) |
| `STRIPE_PRICE_STARTER` | Yes | Stripe Dashboard > Products | Price ID for the Starter plan |
| `STRIPE_PRICE_GROWTH` | Yes | Stripe Dashboard > Products | Price ID for the Growth plan |
| `STRIPE_PRICE_PRO` | Yes | Stripe Dashboard > Products | Price ID for the Pro plan |
| `NEXT_PUBLIC_APP_URL` | Yes | — | Your app's base URL (http://localhost:3000 for local dev) |

**How to find Supabase credentials:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API**
5. Find **Project URL** — copy it into `NEXT_PUBLIC_SUPABASE_URL`
6. Find **anon/public** key under "Project API keys" — copy it into `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to create Stripe price IDs:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Products** in the left sidebar
3. Click **Add product**
4. Enter name (e.g., "Starter"), price (e.g., €9/month), and make sure it's recurring
5. Click **Save product**
6. Click on the pricing option > copy the **Price ID** (starts with `price_`)
7. Repeat for Growth and Pro plans

## 📁 Project Structure

- **src/app** — Next.js App Router pages and API routes
- **src/app/api** — API routes for checkout, Stripe webhooks, subscription, and linking
- **src/app/actions** — Server actions for subscription management
- **src/app/signup** — Signup page
- **src/components** — React components (auth forms, pricing section)
- **src/lib/stripe** — Stripe client configuration, hooks, and utilities

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Connect your repository**
   - Click the deploy button above or go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository

2. **Add environment variables**
   - In Vercel dashboard, go to **Settings > Environment Variables**
   - Add all the variables from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_STARTER`
     - `STRIPE_PRICE_GROWTH`
     - `STRIPE_PRICE_PRO`
     - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL, e.g., https://your-app.vercel.app)

3. **Deploy**
   - Vercel will automatically detect Next.js and configure the build settings
   - Click **Deploy**

4. **Set up Stripe webhook for production**
   - In Stripe Dashboard > Webhooks, add your production endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## 📝 License

MIT