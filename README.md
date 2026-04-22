# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **Contact insights** — Identify key contacts by topic or project
- **Question history** — Review all your past questions and answers
- **Gmail & Outlook integration** — Connect your inbox in one click
- **Secure data handling** — Encrypted storage, no data resale, revocable access
- **AI Chat Interface** — Clean, modern chat experience at `/chat` with typing indicators and auto-scroll
- **User Authentication** — Sign up and log in to access your personal chat
- **3 Subscription Plans** — Start (10 messages/month), Scale (50 messages/month), Team (100 messages/month)
- **Usage Tracking** — Real-time message count with monthly reset on plan renewal
- **Automatic Upgrades** — Stripe webhook handles subscription changes and renewals
- **Message Gating** — Chat blocked when limit reached with upgrade prompt

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication + PostgreSQL
- **Payments**: Stripe Checkout + Webhooks
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up here](https://stripe.com/) (free, no credit card required for testing)
- **Supabase account** — [Sign up here](https://supabase.com/) (free tier works)

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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services like Stripe and Supabase.

Add the following content to `.env.local`:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Configuration
# Find these in: Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs
# Find these in: Stripe Dashboard > Products > your product > Price ID
STRIPE_START_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_SCALE_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_TEAM_PRICE_ID=price_xxxxxxxxxxxxx

# Application URL
# Use http://localhost:3000 for local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set up Supabase database

Before running the app, you need to create the `user_subscriptions` table in your Supabase project.

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Run this SQL to create the table and all required objects:

```sql
-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  session_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('start', 'scale', 'team')),
  messages_limit INTEGER NOT NULL,
  messages_used INTEGER DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (for webhook and server actions)
CREATE POLICY "Service role full access" ON user_subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RPC: Atomically decrement message count
CREATE OR REPLACE FUNCTION decrement_message_count(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INTEGER;
  v_success BOOLEAN;
BEGIN
  UPDATE user_subscriptions
  SET messages_used = messages_used + 1, updated_at = NOW()
  WHERE user_id = p_user_id
    AND messages_used < messages_limit
    AND subscription_status = 'active'
  RETURNING messages_limit - messages_used INTO v_remaining;

  IF v_remaining IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'remaining', v_remaining);
  ELSE
    RETURN jsonb_build_object('success', false, 'remaining', -1);
  END IF;
END;
$$;

-- RPC: Apply subscription changes from webhook
CREATE OR REPLACE FUNCTION apply_subscription_change(
  p_user_id UUID,
  p_plan TEXT,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_messages_limit INTEGER;
BEGIN
  v_messages_limit := CASE p_plan
    WHEN 'start' THEN 10
    WHEN 'scale' THEN 50
    WHEN 'team' THEN 100
    ELSE 0
  END;

  INSERT INTO user_subscriptions (
    user_id, stripe_customer_id, stripe_subscription_id, plan,
    messages_limit, messages_used, current_period_start,
    current_period_end, subscription_status
  )
  VALUES (
    p_user_id, p_stripe_customer_id, p_stripe_subscription_id, p_plan,
    v_messages_limit, 0, p_current_period_start,
    p_current_period_end, 'active'
  )
  ON CONFLICT (stripe_customer_id)
  DO UPDATE SET
    plan = EXCLUDED.plan,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    messages_limit = EXCLUDED.messages_limit,
    messages_used = 0,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    subscription_status = 'active',
    updated_at = NOW();
END;
$$;
```

4. Click **Run** to execute the SQL

### 5. Set up Stripe products and webhooks

**Create 3 products in Stripe Dashboard:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Products** → **Add product**
2. Create each product with a monthly price:

| Plan | Product Name | Price | Messages |
|------|-------------|-------|----------|
| Start | Start | $9.99/month | 10 messages |
| Scale | Scale | $29.99/month | 50 messages |
| Team | Team | $79.99/month | 100 messages |

3. For each product, copy the **Price ID** (format: `price_xxxxx`) and add to your `.env.local`

**Configure Stripe webhook (for local development):**

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac) or [download here](https://stripe.com/docs/stripe-cli)
2. Log in: `stripe login`
3. Forward webhooks to localhost: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret (`whsec_...`) from the output into `STRIPE_WEBHOOK_SECRET`

### 6. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public key for client-side Supabase access |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard → Developers → API keys → Secret key | Secret key for server-side Stripe operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard → Developers → API keys → Publishable key | Public key for client-side Stripe |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Webhooks → your endpoint → Signing secret | Verifies webhook requests are from Stripe |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard → Products → Start product → Price ID | Price ID for the Start plan ($9.99) |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard → Products → Scale product → Price ID | Price ID for the Scale plan ($29.99) |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard → Products → Team product → Price ID | Price ID for the Team plan ($79.99) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set manually | Your app's URL (http://localhost:3000 for dev) |

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes
│   │   │   ├── checkout/         # Stripe checkout session creation
│   │   │   ├── stripe/           # Stripe-related endpoints
│   │   │   │   ├── checkout/     # Checkout session handler
│   │   │   │   ├── verify-session/ # Verify checkout session status
│   │   │   │   └── webhook/      # Stripe webhook handler
│   │   │   ├── subscriptions/    # Subscription management
│   │   │   │   └── link/         # Link checkout session to user
│   │   │   └── webhooks/         # Legacy webhook route
│   │   │       └── stripe/       # Legacy Stripe webhook handler
│   │   ├── pricing/              # Pricing page with plan selection
│   │   ├── success/              # Post-checkout success page
│   │   ├── signup/               # Signup page (receives session_id)
│   │   ├── chat/                 # Chat interface
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── auth/                 # Authentication components
│   │   │   └── SignupForm.tsx    # Signup form with session linking
│   │   ├── subscription/         # Subscription-related components
│   │   │   ├── SubscriptionStatus.tsx # Shows current plan + messages
│   │   │   └── UpgradePrompt.tsx  # Shown when limit reached
│   │   └── ui/                   # UI components
│   │       └── Navbar.tsx        # Navigation with subscription status
│   ├── lib/
│   │   ├── billing/
│   │   │   └── gate.ts           # Message counting + gating logic
│   │   ├── stripe/
│   │   │   ├── config.ts         # Stripe client initialization
│   │   │   └── webhook.ts        # Webhook processing utilities
│   │   └── supabase/
│   │       ├── client.ts        # Client-side Supabase client
│   │       └── server.ts        # Server-side Supabase client
│   └── middleware.ts            # Next.js middleware for auth
├── .env.local                    # Environment variables (create from .env.example)
├── .env.example                  # Example environment variables
└── package.json                  # Dependencies and scripts
```

## 🚀 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step deployment

1. **Connect your repository**
   - Click the deploy button above or go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select `my-app` as the project

2. **Add environment variables**
   - In Vercel dashboard, go to **Settings** → **Environment Variables**
   - Add all variables from `.env.local`:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `STRIPE_SECRET_KEY` | Your Stripe secret key |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Stripe |
   | `STRIPE_START_PRICE_ID` | `price_...` for Start plan |
   | `STRIPE_SCALE_PRICE_ID` | `price_...` for Scale plan |
   | `STRIPE_TEAM_PRICE_ID` | `price_...` for Team plan |
   | `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` |

3. **Update Stripe webhook URL**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Webhooks**
   - Update your endpoint URL to: `https://your-app.vercel.app/api/stripe/webhook`

4. **Deploy**
   - Click **Deploy** — Vercel will build and deploy your app

5. **Test in production**
   - Visit your deployed URL
   - Go to `/pricing`, select a plan, complete checkout
   - After payment, you should land on `/success`

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.