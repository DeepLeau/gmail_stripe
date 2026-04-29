# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Choose from Starter (€9/mo), Growth (€29/mo), and Pro (€79/mo) tiers with Stripe integration

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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services like payments and authentication.

Copy the template from `.env.example` and fill in all values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# App Configuration
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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) | Secret API key for Stripe server operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) | Publishable API key (safe to expose to client) |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) | Signing secret to verify webhook authenticity |
| `STRIPE_STARTER_PRICE_ID` | Yes | [Stripe Dashboard → Products](https://dashboard.stripe.com/products) | Price ID for the Starter plan (€9/mo) |
| `STRIPE_GROWTH_PRICE_ID` | Yes | [Stripe Dashboard → Products](https://dashboard.stripe.com/products) | Price ID for the Growth plan (€29/mo) |
| `STRIPE_PRO_PRICE_ID` | Yes | [Stripe Dashboard → Products](https://dashboard.stripe.com/products) | Price ID for the Pro plan (€79/mo) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your production URL | Base URL for your deployed app |

### Finding Supabase credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** (gear icon) → **API**
4. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon/public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Setting up Stripe products and prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → click **Add product**
3. Create three products:
   - **Starter**: €9/month
   - **Growth**: €29/month
   - **Pro**: €79/month
4. Click on each product → copy the **Price ID** (starts with `price_`)

### Setting up Stripe webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint** and copy the **Signing secret** (starts with `whsec_`)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages and layouts
│   ├── actions/                  # Server actions for subscription management
│   ├── api/                      # API routes for Stripe and chat
│   ├── chat/                     # Chat page
│   └── signup/                   # Signup page
├── components/
│   ├── auth/                     # Authentication components (SignupForm)
│   ├── chat/                     # Chat components (UsageBar)
│   └── sections/                 # Page sections (Pricing)
└── lib/
    └── stripe/                   # Stripe configuration, client, and hooks
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the **Deploy with Vercel** button above
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings** → **Environment Variables**
4. Add all variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_STARTER_PRICE_ID`
   - `STRIPE_GROWTH_PRICE_ID`
   - `STRIPE_PRO_PRICE_ID`
   - `NEXT_PUBLIC_BASE_URL`
5. Click **Deploy**

> ⚠️ **Important**: After deploying, update your Stripe webhook URL to point to your production domain (e.g., `https://yourapp.vercel.app/api/stripe/webhook`)

## 📝 License

MIT