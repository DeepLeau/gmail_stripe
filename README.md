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
- **3 Pricing Plans** — Start (10 messages/month), Scale (50 messages/month), Team (100 messages/month)
- **Usage Gating** — Message limits enforced per plan with upgrade prompts
- **Monthly Reset** — Message counts reset automatically on subscription renewal

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication & PostgreSQL
- **Payments**: Stripe Checkout & Webhooks
- **API Utilities**: @supabase/ssr, @supabase/supabase-js, stripe

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up here](https://stripe.com/) for test mode (free)
- **Supabase account** — [Create one here](https://supabase.com/) (free tier works)

### 1. Clone the repository

Open your terminal (more on this below) and run:

```bash
git clone https://github.com/YOUR_USERNAME/emind.git
cd emind
```

**Where is my terminal?**

- **VS Code**: Press `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac) — this opens the built-in terminal at the bottom of the window
- **Mac**: Open Spotlight (`Cmd+Space`), type "Terminal", press Enter
- **Windows**: Press `Win+R`, type "cmd", press Enter

### 2. Install dependencies

```bash
npm install
```

This will install all the packages listed in `package.json`, including Stripe and Supabase SDKs.

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services.

Add the following content to `.env.local`:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe — Payment Configuration
# Find these in: Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret — generated when you create a webhook endpoint
# See "Webhook Setup" section below
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — found in Stripe Dashboard > Products
STRIPE_PRICE_START=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_PRICE_TEAM=price_...

# Base URL for Stripe redirect URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set up Supabase

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Create the database schema:**

In your Supabase SQL Editor, run this to create the `user_subscriptions` table and supporting functions:

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
  subscription_status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (for server actions/webhooks)
CREATE POLICY "Service role full access" ON user_subscriptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- RPC: Decrement message count atomically
CREATE OR REPLACE FUNCTION decrement_message_count(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_remaining INTEGER;
  v_success BOOLEAN;
BEGIN
  UPDATE user_subscriptions
  SET messages_used = messages_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND subscription_status = 'active'
    AND messages_used < messages_limit
  RETURNING messages_limit - messages_used - 1 INTO v_remaining;

  IF v_remaining IS NOT NULL THEN
    RETURN json_build_object('success', true, 'remaining', v_remaining);
  ELSE
    RETURN json_build_object('success', false, 'remaining', 0);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Apply subscription changes (called by webhook)
CREATE OR REPLACE FUNCTION apply_subscription_change(
  p_user_id UUID,
  p_plan TEXT,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_subscriptions (
    user_id, plan, stripe_customer_id, stripe_subscription_id,
    messages_limit, messages_used, current_period_start, current_period_end,
    subscription_status
  ) VALUES (
    p_user_id, p_plan, p_stripe_customer_id, p_stripe_subscription_id,
    CASE p_plan
      WHEN 'start' THEN 10
      WHEN 'scale' THEN 50
      WHEN 'team' THEN 100
    END,
    0, p_current_period_start, p_current_period_end, 'active'
  )
  ON CONFLICT (stripe_customer_id)
  DO UPDATE SET
    user_id = COALESCE(user_subscriptions.user_id, p_user_id),
    plan = p_plan,
    stripe_subscription_id = p_stripe_subscription_id,
    messages_limit = CASE p_plan
      WHEN 'start' THEN 10
      WHEN 'scale' THEN 50
      WHEN 'team' THEN 100
    END,
    messages_used = 0,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    subscription_status = 'active',
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Set up Stripe

**How to find your Stripe keys:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy the **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`
5. Copy the **Publishable key** (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Create your pricing products:**

1. In Stripe Dashboard, click **Products** in the left sidebar
2. Click **Add product** for each plan:
   - **Start**: Name it "Start", price $X/month, recurring, monthly
   - **Scale**: Name it "Scale", price $Y/month, recurring, monthly
   - **Team**: Name it "Team", price $Z/month, recurring, monthly
3. For each product, copy the **Price ID** (looks like `price_...`) and add to your `.env.local`:
   - `STRIPE_PRICE_START=price_...`
   - `STRIPE_PRICE_SCALE=price_...`
   - `STRIPE_PRICE_TEAM=price_...`

**Webhook setup (critical for payments to work):**

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   - For local development: use a tool like [Stripe CLI](https://stripe.com/docs/stripe-cli):
     ```bash
     # Install Stripe CLI, then:
     stripe login
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
   - Copy the webhook signing secret (`whsec_...`) shown by Stripe CLI → `STRIPE_WEBHOOK_SECRET`
4. For production (Vercel), add the webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase > Project Settings > API > anon/public key | Public key for client-side Supabase access |
| `STRIPE_SECRET_KEY` | Yes | Stripe > Developers > API keys > Secret key | Private key for server-side Stripe operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe > Developers > API keys > Publishable key | Public key for Stripe.js (frontend) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe > Developers > Webhooks > Your endpoint | Validates webhook requests are from Stripe |
| `STRIPE_PRICE_START` | Yes | Stripe > Products > Start product > Price ID | Monthly price ID for Start plan |
| `STRIPE_PRICE_SCALE` | Yes | Stripe > Products > Scale product > Price ID | Monthly price ID for Scale plan |
| `STRIPE_PRICE_TEAM` | Yes | Stripe > Products > Team product > Price ID | Monthly price ID for Team plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your deployment URL | Used for Stripe redirect URLs |

## 💳 How the Checkout Flow Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Landing    │ ──▶ │  Select Plan │ ──▶ │  Stripe Checkout    │
│  Page       │     │  (Pricing)   │     │  (hosted by Stripe) │
└─────────────┘     └──────────────┘     └─────────────────────┘
                                                   │
                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Chat Page  │ ◀── │  Sign Up     │ ◀── │  Redirect to        │
│  (authenticated)│   │  Form        │     │  /signup?session_id │
└─────────────┘     └──────────────┘     └─────────────────────┘
```

**Anonymous checkout with post-signup linking:**

1. User selects a plan on `/pricing` and clicks "Subscribe"
2. They're redirected to Stripe's hosted checkout page
3. After payment, Stripe redirects to `/signup?session_id=cs_xxx`
4. User creates their Supabase account
5. Server action `linkStripeSessionToUser()` links the Stripe session to the new user account
6. User is now authenticated and can access `/chat`

**Webhook handling:**

The webhook endpoint handles `checkout.session.completed` to ensure subscription data is stored. If the webhook arrives before signup, the `session_id` is stored. When the user signs up, the account is linked to the existing subscription.

Monthly renewal via `customer.subscription.updated` resets `messages_used` to 0.

## 📊 Pricing Plans

| Plan | Messages/Month | Use Case |
|------|----------------|----------|
| **Start** | 10 | Try it out |
| **Scale** | 50 | Regular users |
| **Team** | 100 | Power users & teams |

When a user exceeds their message limit, they see: **"Limite atteinte — upgrade vers plan supérieur"** with a link to `/pricing`.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts         # Stripe checkout session creation
│   │   └── webhooks/stripe/route.ts  # Stripe webhook handler
│   ├── chat/page.tsx                 # Protected chat page
│   ├── pricing/page.tsx              # Pricing plans page
│   ├── signup/page.tsx               # Signup with session linking
│   └── layout.tsx                    # Root layout with providers
├── components/
│   ├── auth/
│   │   └── SignupForm.tsx            # Signup form component
│   ├── chat/
│   │   ├── ChatInterface.tsx        # Main chat UI
│   │   └── ChatPageContent.tsx       # Chat page with auth check
│   ├── payment/
│   │   ├── CheckoutButton.tsx        # Stripe checkout trigger
│   │   └── PaymentBanner.tsx         # Subscription status banner
│   └── sections/
│       └── Pricing.tsx              # Pricing plans section
└── lib/
    ├── stripe/
    │   └── config.ts                 # Stripe client initialization
    └── supabase/
        └── client.ts                 # Supabase client setup
```

## 🚀 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository**
   - Click "Import Git Repository"
   - Select your GitHub repo

2. **Add environment variables**
   - In Vercel dashboard, go to **Settings > Environment Variables**
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_START`
     - `STRIPE_PRICE_SCALE`
     - `STRIPE_PRICE_TEAM`
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

3. **Update Stripe webhook for production**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add a new endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select the same events as local: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the new webhook secret to Vercel environment variables

4. **Deploy**
   - Click "Deploy" — Vercel will build and deploy automatically

## 📝 License

MIT