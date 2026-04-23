# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural English, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **Contact insights** — Identify key contacts by topic or project
- **Question history** — Review all your past questions and answers
- **Gmail & Outlook integration** — Connect your inbox in one click
- **Secure data handling** — Encrypted storage, no data resale, revocable access
- **AI Chat Interface** — Clean, modern chat experience at `/chat` with typing indicators and auto-scroll
- **User Authentication** — Sign up and log in to access your personal chat
- **Stripe Subscription Plans** — Choose from Start (10 messages/month), Scale (50 messages/month), or Team (100 messages/month)
- **Usage Gating** — Chat blocks messages when you hit your limit with an upgrade prompt
- **Monthly Reset** — Message counts automatically reset on subscription renewal

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication + PostgreSQL
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up here](https://stripe.com/) for payment processing
- **Supabase account** — [Sign up here](https://supabase.com/) for authentication and database

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

Add the following content to `.env.local`:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe — configuration paiement
# Find these in: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook secret — generated after you set up the webhook endpoint
# See "Stripe Webhook Setup" section below
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs — create products in Stripe Dashboard > Products
STRIPE_PRICE_ID_START=price_...
STRIPE_PRICE_ID_SCALE=price_...
STRIPE_PRICE_ID_TEAM=price_...

# Base URL for Stripe redirect URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to find your Stripe keys:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** → **API keys**
3. Copy the **Secret key** (`sk_test_...`) as `STRIPE_SECRET_KEY`
4. Copy the **Publishable key** (`pk_test_...`) as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**How to create your Stripe products and Price IDs:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Products** in the left sidebar
3. Click **Add product**
4. For each plan, fill in:
   - **Name**: "Start", "Scale", or "Team"
   - **Price**: 10, 25, 50 (or your preferred pricing)
   - **Billing period**: Select "Monthly"
   - **Pricing model**: One-time or recurring as needed
5. Click **Save product**
6. On the product page, scroll to **Price details** and copy the **Price ID** (`price_...`)
7. Repeat for all three plans and add the Price IDs to your `.env.local`:
   - `STRIPE_PRICE_ID_START`
   - `STRIPE_PRICE_ID_SCALE`
   - `STRIPE_PRICE_ID_TEAM`

### Stripe Webhook Setup

1. Install the Stripe CLI on your machine:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (with scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-bucket
   scoop install stripe
   
   # Linux
   sudo apt-get install stripe
   ```

2. Log in to Stripe CLI:
   ```bash
   stripe login
   ```

3. Set up webhook forwarding (run this while your dev server is running):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the **webhook signing secret** (`whsec_...`) from the output and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Set up the database

Run the migration file to create the subscription tables and RPC functions:

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Copy the contents of `migrations/004_create_subscription_rpc_functions.sql`
4. Paste and click **Run**

This will create:
- `user_subscriptions` table with RLS policies
- `decrement_message_count(p_user_id)` — atomically decreases message count
- `apply_subscription_change(...)` — updates subscription on webhook events

### 5. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|-------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Project Settings → API → anon/public key | Supabase anonymous key for client-side auth |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard → Developers → API keys → Secret key | Stripe secret key for server-side operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard → Developers → API keys → Publishable key | Stripe publishable key for client-side |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe CLI `stripe listen` output | Webhook signature verification |
| `STRIPE_PRICE_ID_START` | ✅ | Stripe Dashboard → Products → [Start product] → Price ID | Price ID for Start plan |
| `STRIPE_PRICE_ID_SCALE` | ✅ | Stripe Dashboard → Products → [Scale product] → Price ID | Price ID for Scale plan |
| `STRIPE_PRICE_ID_TEAM` | ✅ | Stripe Dashboard → Products → [Team product] → Price ID | Price ID for Team plan |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Set manually or use `http://localhost:3000` for dev | Base URL for Stripe redirect URLs |

## 📁 Project Structure

```
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/
│   │   │   └── stripe/
│   │   │       ├── checkout/route.ts    # POST /api/stripe/checkout — create checkout session
│   │   │       └── webhook/route.ts      # POST /api/stripe/webhook — handle Stripe events
│   │   ├── chat/
│   │   │   └── page.tsx          # Chat interface with plan display
│   │   └── signup/
│   │       └── page.tsx          # Signup page shown after successful checkout
│   ├── components/
│   │   ├── auth/
│   │   │   └── SignupForm.tsx     # Signup form component
│   │   ├── chat/
│   │   │   └── ChatInterface.tsx  # Chat UI with message gating
│   │   ├── sections/
│   │   │   └── Pricing.tsx       # Pricing plans with Stripe checkout
│   │   └── ui/
│   │       └── UserMenu.tsx      # User dropdown with subscription info
│   └── lib/
│       ├── stripe/
│       │   └── config.ts         # Stripe client configuration
│       └── supabase/
│           └── server.ts         # Supabase server client with auth
├── migrations/
│   └── 004_create_subscription_rpc_functions.sql  # DB schema + RPC functions
├── .env.example                   # Template for environment variables
└── package.json                   # Dependencies and scripts
```

### Key Files Overview

- **Checkout Flow** (`src/app/api/stripe/checkout/route.ts`): Creates Stripe Checkout session with plan metadata
- **Webhook Handler** (`src/app/api/stripe/webhook/route.ts`): Handles `checkout.session.completed`, `customer.subscription.updated` events
- **Pricing Component** (`src/components/sections/Pricing.tsx`): Displays 3 plans with Stripe checkout buttons
- **Chat Interface** (`src/components/chat/ChatInterface.tsx`): Checks message limits before sending, shows upgrade prompt when limit reached
- **Signup Page** (`src/app/signup/page.tsx`): Post-checkout signup form that links Stripe session to user account

## 🚀 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step

1. **Import your repository**
   - Click "Import Project" on Vercel
   - Select your GitHub repo

2. **Configure environment variables**
   - Go to your project → **Settings** → **Environment Variables**
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_ID_START`
     - `STRIPE_PRICE_ID_SCALE`
     - `STRIPE_PRICE_ID_TEAM`
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

3. **Set up Stripe webhook for production**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
   - Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`
   - Copy the webhook secret to Vercel environment variables

4. **Deploy**
   - Click **Deploy** and wait for the build to complete

## 📝 License

MIT