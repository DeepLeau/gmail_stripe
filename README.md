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
- **3 Pricing Plans** — Choose between Start (10 messages/month), Scale (50 messages/month), and Team (100 messages/month)
- **Usage Tracking** — See your remaining messages and current plan directly in the chat interface
- **Automatic Monthly Reset** — Message limits reset automatically at the start of each billing cycle

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase (Authentication, PostgreSQL, RLS, RPC functions)
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up here](https://stripe.com/) (free for testing)
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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services.

Add the following content to `.env.local`:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe — Payment Configuration
# Find these in: Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs — Create these in Stripe Dashboard > Products
# Create a product for each plan, then copy the Price ID (starts with price_)
STRIPE_START_PRICE_ID=price_your_start_plan_id
STRIPE_SCALE_PRICE_ID=price_your_scale_plan_id
STRIPE_TEAM_PRICE_ID=price_your_team_plan_id

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Get your Supabase credentials

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project (or create a new one)
3. Click **Project Settings** (the gear icon 🔧) in the left sidebar
4. Click **API**
5. Copy the **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** (the first one, labeled "anon public") → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Set up your Stripe account

#### Getting your Stripe keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy your **Secret key** (starts with `sk_test_` for development) → paste as `STRIPE_SECRET_KEY`

#### Creating your price IDs

1. In Stripe Dashboard, click **Products** in the left sidebar
2. Click **Add product** for the **Start** plan:
   - Name: "Start"
   - Price: however you want to charge (e.g., $9/month or $0 for free tier)
   - Click **Add product**
3. Copy the **Price ID** (starts with `price_`) → paste as `STRIPE_START_PRICE_ID`
4. Repeat for **Scale** (50 messages) and **Team** (100 messages) plans

#### Getting your webhook secret

1. In Stripe Dashboard, click **Developers** > **Webhooks**
2. Click **Add endpoint**
3. In **Endpoint URL**, enter: `https://your-domain.com/api/webhook/stripe` (use your actual domain later)
4. In **Select events**, check:
   - `checkout.session.completed`
   - `customer.subscription.updated`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) → paste as `STRIPE_WEBHOOK_SECRET`

### 6. Set up your Supabase database

Run the following SQL in the Supabase SQL Editor (**Database** > **SQL Editor** > **New query**):

```sql
-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update (webhook writes)
CREATE POLICY "Service role can insert" ON user_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update" ON user_subscriptions
  FOR UPDATE USING (true);

-- RPC: Decrement message count (atomic)
CREATE OR REPLACE FUNCTION decrement_message_count(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INTEGER;
  v_success BOOLEAN;
BEGIN
  UPDATE user_subscriptions
  SET messages_used = messages_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND messages_used < messages_limit
    AND subscription_status = 'active'
  RETURNING messages_limit - messages_used - 1 INTO v_remaining;

  IF v_remaining IS NULL THEN
    -- Either no subscription or limit reached
    SELECT messages_limit - messages_used INTO v_remaining
    FROM user_subscriptions
    WHERE user_id = p_user_id AND subscription_status = 'active';
    
    IF v_remaining IS NULL THEN
      RETURN json_build_object('success', false, 'remaining', -1, 'error', 'No active subscription');
    END IF;
    
    RETURN json_build_object('success', false, 'remaining', v_remaining, 'error', 'Message limit reached');
  END IF;

  RETURN json_build_object('success', true, 'remaining', v_remaining);
END;
$$;

-- RPC: Apply subscription changes (from webhook)
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
    user_id = COALESCE(user_id, p_user_id),
    plan = p_plan,
    stripe_customer_id = COALESCE(stripe_customer_id, p_stripe_customer_id),
    stripe_subscription_id = COALESCE(stripe_subscription_id, p_stripe_subscription_id),
    messages_limit = CASE p_plan
      WHEN 'start' THEN 10
      WHEN 'scale' THEN 50
      WHEN 'team' THEN 100
      ELSE 10
    END,
    messages_used = 0,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    subscription_status = 'active',
    updated_at = NOW()
  WHERE 
    stripe_customer_id = p_stripe_customer_id
    OR stripe_subscription_id = p_stripe_subscription_id
    OR session_id IN (
      SELECT session_id FROM user_subscriptions 
      WHERE user_id = p_user_id AND session_id IS NOT NULL
    );
END;
$$;
```

### 7. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac)

---

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Project Settings → API → anon/public key | Public key for Supabase client (safe to expose) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard → Developers → API keys → Secret key | Secret API key for Stripe server operations |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret | Verifies webhook requests are from Stripe |
| `STRIPE_START_PRICE_ID` | ✅ | Stripe Dashboard → Products → Start product → Price ID | Price ID for the Start plan ($10/month, 10 messages) |
| `STRIPE_SCALE_PRICE_ID` | ✅ | Stripe Dashboard → Products → Scale product → Price ID | Price ID for the Scale plan ($25/month, 50 messages) |
| `STRIPE_TEAM_PRICE_ID` | ✅ | Stripe Dashboard → Products → Team product → Price ID | Price ID for the Team plan ($50/month, 100 messages) |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Your deployment URL | Base URL for redirect after Stripe checkout |

---

## 📁 Project Structure

```
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/
│   │   │   ├── create-checkout-session/
│   │   │   │   └── route.ts          # POST: Creates Stripe Checkout session
│   │   │   └── webhook/
│   │   │       └── stripe/
│   │   │           └── route.ts      # POST: Handles Stripe webhook events
│   │   ├── pricing/
│   │   │   └── success/
│   │   │       └── page.tsx          # Post-checkout success + signup page
│   │   ├── chat/
│   │   │   └── page.tsx              # Main chat interface (protected)
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing page
│   │   └── pricing/
│   │       └── page.tsx              # Pricing plans page
│   ├── components/
│   │   ├── auth/
│   │   │   └── SignupForm.tsx        # Signup form with Stripe session linking
│   │   ├── chat/
│   │   │   └── ChatInput.tsx         # Chat input with message limit enforcement
│   │   ├── pricing/
│   │   │   └── PlanBadge.tsx         # Badge showing current plan + remaining messages
│   │   └── sections/
│   │       └── Pricing.tsx           # Pricing plan cards section
│   └── lib/
│       ├── stripe/
│       │   └── config.ts             # Stripe client initialization
│       └── supabase/
│           ├── client.ts             # Browser Supabase client
│           ├── middleware.ts          # Supabase SSR middleware
│           └── server.ts             # Server-side Supabase client
├── .env.example                      # Environment variables template
├── package.json
└── tailwind.config.ts
```

---

## 🚀 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-app.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import Git Repository**
   - Select your GitHub repo
   - Vercel will auto-detect Next.js settings

3. **Add environment variables**
   In Vercel dashboard, go to **Settings** → **Environment Variables** and add each variable from `.env.example`:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

4. **Update Stripe webhook URL**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/) → Developers → Webhooks
   - Edit your webhook endpoint
   - Update the URL to: `https://your-app.vercel.app/api/webhook/stripe`

5. **Deploy**
   - Click **Deploy** — Vercel builds and deploys automatically
   - Your app will be live at `https://your-app.vercel.app`

---

## 📝 How the Stripe checkout flow works

### Anonymous checkout with post-signup linking

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Landing Page  │ ───→ │  Select a Plan   │ ───→ │  Stripe Checkout │
│   /pricing      │      │  Click "Buy"     │      │  (hosted by      │
└─────────────────┘      └─────────────────┘      │  Stripe)         │
                                                   └────────┬────────┘
                                                            │
                    ┌────────────────────────────────────────┘
                    ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Success Page  │ ←─── │  Return URL     │ ←─── │  Payment        │
│   /pricing/     │      │  /signup?       │      │  Completed      │
│   success       │      │  session_id=xxx │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Create Account│ ───→ Server Action links Stripe session
│   with Supabase │      to the new user via user_id
└─────────────────┘
```

### Webhook handling

The Stripe webhook (`/api/webhook/stripe`) handles two events:

1. **`checkout.session.completed`** — When payment succeeds:
   - Creates/updates `user_subscriptions` record
   - Links by `session_id` or `stripe_customer_id`
   - If user already signed up: updates `user_id` immediately
   - If user not signed up yet: waits for the link via signup

2. **`customer.subscription.updated`** — When subscription renews:
   - Resets `messages_used` to 0
   - Updates `current_period_end`
   - Updates `subscription_status`

### Message limit enforcement

Before each chat message is sent:
1. Client calls `decrement_message_count(user.id)` RPC
2. If `success: true` → message is sent
3. If `success: false` and limit reached → shows upgrade prompt with link to `/pricing`

---

## 📝 License

MIT