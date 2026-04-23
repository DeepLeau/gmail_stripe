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
- **Subscription Plans** — Choose from Start (10 messages), Scale (50 messages), or Team (100 messages) per month
- **Stripe Checkout** — Secure payment with credit card via Stripe hosted checkout
- **Usage Tracking** — Real-time message count with monthly reset on subscription renewal

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth**: Supabase Authentication
- **Payments**: Stripe Checkout

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

Add the following content to `.env.local`:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
# Find secret key: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key

# Find publishable key in the same place as secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Find webhook secret: https://dashboard.stripe.com/webhooks
# After adding endpoint, copy the signing secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs — Create products in Stripe Dashboard > Products > Add Product
# Set price and copy the Price ID for each plan:
STRIPE_PRICE_ID_START=price_your_start_price_id
STRIPE_PRICE_ID_SCALE=price_your_scale_price_id
STRIPE_PRICE_ID_TEAM=price_your_team_price_id

# Your deployment URL (http://localhost:3000 for local development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon key | Public key for Supabase client (safe for browser) |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Server-side Stripe API key (keep secret!) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Client-side Stripe API key (safe for browser) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Webhooks > Your endpoint | Verifies incoming webhook requests from Stripe |
| `STRIPE_PRICE_ID_START` | Yes | Stripe Dashboard > Products > [Start product] > Price ID | Price ID for the Start plan ($X/month) |
| `STRIPE_PRICE_ID_SCALE` | Yes | Stripe Dashboard > Products > [Scale product] > Price ID | Price ID for the Scale plan ($X/month) |
| `STRIPE_PRICE_ID_TEAM` | Yes | Stripe Dashboard > Products > [Team product] > Price ID | Price ID for the Team plan ($X/month) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your deployment URL | Used for Stripe redirect URLs (localhost:3000 for dev) |

### How to find your Supabase credentials:

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to set up Stripe products and price IDs:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Navigate to **Products** in the left sidebar
3. Click **Add product** for each plan:

   **Start Plan** (10 messages/month):
   - Name: "Start"
   - Pricing: Recurring > Monthly > Enter price
   - Copy the **Price ID** → paste as `STRIPE_PRICE_ID_START`

   **Scale Plan** (50 messages/month):
   - Name: "Scale"
   - Pricing: Recurring > Monthly > Enter price
   - Copy the **Price ID** → paste as `STRIPE_PRICE_ID_SCALE`

   **Team Plan** (100 messages/month):
   - Name: "Team"
   - Pricing: Recurring > Monthly > Enter price
   - Copy the **Price ID** → paste as `STRIPE_PRICE_ID_TEAM`

4. Go to **Developers > API keys** and copy:
   - **Secret key** → `STRIPE_SECRET_KEY` (keep this secret!)
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

5. Go to **Webhooks** in the left sidebar
6. Click **Add endpoint**
7. Enter URL: `https://your-domain.com/api/webhooks/stripe`
8. Select events: `checkout.session.completed`, `customer.subscription.updated`
9. Click **Add endpoint** and copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

## 💳 Stripe Checkout Flow

The application implements an anonymous checkout flow with linking post-signup:

1. **User selects a plan** on the `/pricing` page
2. **Clicking "Subscribe"** redirects to Stripe Checkout hosted page
3. **After payment**, user is redirected to `/signup?session_id=xxx`
4. **User creates account** via Supabase Signup
5. **Server Action `linkStripeSessionToUser`** links the Stripe session to the new user account, creating a subscription record
6. **User is redirected to `/chat`** with active subscription

### Setting up the Stripe webhook locally:

To test webhooks locally, use the Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # Mac
# or: winget install Stripe.CLI  # Windows

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret shown and add it to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── auth.ts              # Auth server actions (login, signup, linkStripeSessionToUser)
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/
│   │   │   │       └── route.ts     # Stripe webhook handler
│   │   │   ├── stripe/
│   │   │   │   └── checkout/
│   │   │   │       └── route.ts     # Creates Stripe Checkout sessions
│   │   │   └── subscription/
│   │   │       └── limit-reached/
│   │   │           └── route.ts     # API for checking/subscribing to plan limits
│   │   ├── chat/
│   │   │   ├── page.tsx             # Main chat interface
│   │   │   └── layout.tsx           # Chat layout with subscription header
│   │   ├── signup/
│   │   │   └── page.tsx             # Signup form with Stripe session linking
│   │   ├── success/
│   │   │   └── page.tsx             # Post-checkout success page
│   │   ├── pricing/
│   │   │   └── page.tsx             # Pricing page with plan selection
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── auth/
│   │   │   └── SignupForm.tsx       # Signup form component
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx    # Main chat UI
│   │   │   ├── ChatInput.tsx        # Message input component
│   │   │   ├── SubscriptionBadge.tsx # Current plan badge in header
│   │   │   ├── LimitReachedBanner.tsx # Warning when limit reached
│   │   │   └── UserMenu.tsx         # User dropdown menu
│   │   ├── checkout-button.tsx      # Stripe checkout trigger button
│   │   ├── chat-header.tsx          # Chat page header
│   │   ├── sections/
│   │   │   └── Pricing.tsx          # Pricing section component
│   │   └── ui/                      # Reusable UI components
│   └── lib/
│       ├── stripe/
│       │   ├── server.ts            # Server-side Stripe utilities
│       │   ├── config.ts            # Stripe configuration (price IDs)
│       │   └── serviceRole.ts       # Stripe admin operations (webhooks)
│       └── chat/
│           └── mockApi.ts           # Mock chat API for testing
├── .env.example                     # Environment variable template
└── package.json
```

### Key files for Stripe integration:

| File | Purpose |
|------|---------|
| `src/app/api/stripe/checkout/route.ts` | Creates Stripe Checkout session with selected plan |
| `src/app/api/webhooks/stripe/route.ts` | Handles `checkout.session.completed` and `customer.subscription.updated` |
| `src/app/actions/auth.ts` | `linkStripeSessionToUser()` links Stripe session to new user |
| `src/lib/stripe/server.ts` | Server-side Stripe client configuration |
| `src/components/sections/Pricing.tsx` | Displays 3 plans (Start/Scale/Team) with checkout buttons |

## 🚀 Deploy to Vercel

### One-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual deploy steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Stripe checkout integration"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com/) and log in
   - Click **Import Project**
   - Select your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add environment variables**
   - In Vercel dashboard, go to **Settings > Environment Variables**
   - Add ALL variables from `.env.example`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_ID_START`
     - `STRIPE_PRICE_ID_SCALE`
     - `STRIPE_PRICE_ID_TEAM`
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

4. **Update Stripe webhook URL**
   - Go to Stripe Dashboard > Webhooks
   - Update your webhook endpoint to your Vercel URL: `https://your-app.vercel.app/api/webhooks/stripe`

5. **Deploy**
   - Click **Deploy** — Vercel will build and deploy automatically

### Supabase Database Setup

Run these SQL commands in Supabase SQL Editor to create the subscription table and RPC functions:

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
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Atomic message decrement function
CREATE OR REPLACE FUNCTION decrement_message_count(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  UPDATE user_subscriptions
  SET messages_used = messages_used + 1,
      updated_at = now()
  WHERE user_id = p_user_id
    AND messages_used < messages_limit
    AND subscription_status = 'active'
  RETURNING messages_limit - messages_used INTO v_remaining;

  IF v_remaining IS NULL THEN
    RETURN json_build_object('success', false, 'remaining', -1);
  END IF;

  RETURN json_build_object('success', true, 'remaining', v_remaining);
END;
$$;

-- Subscription change function for webhooks
CREATE OR REPLACE FUNCTION apply_subscription_change(
  p_user_id UUID,
  p_plan TEXT,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
    plan = p_plan,
    messages_limit = CASE p_plan
      WHEN 'start' THEN 10
      WHEN 'scale' THEN 50
      WHEN 'team' THEN 100
    END,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    subscription_status = 'active',
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Trigger to reset messages_used on new billing period
CREATE OR REPLACE FUNCTION reset_monthly_messages()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_period_end > OLD.current_period_end THEN
    NEW.messages_used = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_period_reset_messages
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION reset_monthly_messages();
```

## 📝 License

MIT