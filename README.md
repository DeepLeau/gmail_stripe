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
- **Flexible Pricing Plans** — Choose from Start (10 messages/mo), Scale (50 messages/mo), or Team (100 messages/mo)
- **Usage Tracking** — See your remaining messages in real-time in the chat header
- **Automatic Renewal** — Monthly message limits reset automatically on plan renewal

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase (Authentication + PostgreSQL)
- **Payments**: Stripe (Checkout, Webhooks, Subscriptions)

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

# Stripe — Payment Configuration
# Find your API keys at: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret — Create a webhook at: https://dashboard.stripe.com/webhooks
# Endpoint URL: https://your-domain.com/api/webhooks/stripe
# Events to listen for: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs — Create products at: https://dashboard.stripe.com/products
# Go to each product > Pricing > copy the Price ID
STRIPE_PRICE_ID_START=price_...
STRIPE_PRICE_ID_SCALE=price_...
STRIPE_PRICE_ID_TEAM=price_...

# Application Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to create Stripe products and get Price IDs:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Products** in the left sidebar
3. Click **Add product**
4. Fill in the product details:
   - **Name**: "Start", "Scale", or "Team"
   - **Pricing model**: Recurring > Monthly
   - **Amount**: Start: $9, Scale: $29, Team: $79 (or your preferred prices)
5. Click **Save product**
6. On the product page, click the **Pricing** section
7. Copy the **Price ID** (starts with `price_`)
8. Repeat for all three plans

**How to set up the Stripe webhook:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
4. **Listen for events**: Select and add:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and paste it as `STRIPE_WEBHOOK_SECRET`

**For local development testing:**

To test webhooks locally, use the Stripe CLI:
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the webhook signing secret from the output and add it to your `.env.local`.

### 4. Set up the database

Create the following table in your Supabase SQL Editor:

```sql
-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_session_id TEXT UNIQUE,
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

-- Service role can do everything (for webhooks and server actions)
CREATE POLICY "Service role full access" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to decrement message count atomically
CREATE OR REPLACE FUNCTION decrement_message_count(p_user_id UUID)
RETURNS JSONB AS $$
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
  RETURNING (messages_limit - messages_used - 1) INTO v_remaining;

  IF v_remaining IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'remaining', v_remaining);
  ELSE
    RETURN jsonb_build_object('success', false, 'remaining', -1);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to apply subscription changes
CREATE OR REPLACE FUNCTION apply_subscription_change(
  p_user_id UUID,
  p_plan TEXT,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_subscriptions (
    user_id, stripe_customer_id, stripe_subscription_id, plan,
    messages_limit, messages_used, current_period_start,
    current_period_end, subscription_status
  )
  VALUES (
    p_user_id, p_stripe_customer_id, p_stripe_subscription_id, p_plan,
    CASE p_plan
      WHEN 'start' THEN 10
      WHEN 'scale' THEN 50
      WHEN 'team' THEN 100
    END,
    0, p_current_period_start, p_current_period_end, 'active'
  )
  ON CONFLICT (stripe_subscription_id)
  DO UPDATE SET
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_subscriptions.stripe_customer_id),
    plan = EXCLUDED.plan,
    messages_limit = EXCLUDED.messages_limit,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    subscription_status = EXCLUDED.subscription_status,
    updated_at = NOW();

  -- If there's an old subscription for this user, update it to link via session
  UPDATE user_subscriptions
  SET stripe_subscription_id = p_stripe_subscription_id
  WHERE user_id = p_user_id
    AND stripe_subscription_id IS DISTINCT FROM p_stripe_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

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

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys | Secret API key for Stripe server operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > Developers > API keys | Public key for Stripe client operations |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Developers > Webhooks > your webhook | Signing secret to verify webhook authenticity |
| `STRIPE_PRICE_ID_START` | Yes | Stripe Dashboard > Products > Start > Pricing | Price ID for the Start plan ($9/mo) |
| `STRIPE_PRICE_ID_SCALE` | Yes | Stripe Dashboard > Products > Scale > Pricing | Price ID for the Scale plan ($29/mo) |
| `STRIPE_PRICE_ID_TEAM` | Yes | Stripe Dashboard > Products > Team > Pricing | Price ID for the Team plan ($79/mo) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your deployment URL | Base URL for redirect URIs (e.g., `http://localhost:3000` in dev) |

## 🧪 Running Tests

Unit tests verify that specific parts of your code work correctly. When tests are added to this project, run them with:

**Run all tests:**
```bash
npx jest
```

**Run a specific test file:**
```bash
npx jest path/to/file.test.ts
```

**Watch mode (re-runs automatically when files change):**
```bash
npx jest --watch
```

**How to read Jest output:**
- `✓` or `PASS` — All tests in that file passed ✅
- `✕` or `FAIL` — Something broke ❌ — the output shows which test failed and why

Currently no tests exist, but you can add them in the same directory as the files you're testing:
```
src/lib/stripe/__tests__/config.test.ts
src/lib/db/__tests__/subscription.test.ts
src/app/api/stripe/__tests__/checkout.test.ts
```

## 📁 Project Structure

```
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/         # POST /api/stripe/checkout - Create Stripe Checkout session
│   │   │   │   └── link-customer/    # POST /api/stripe/link-customer - Link session to user
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/           # POST /api/webhooks/stripe - Handle Stripe events
│   │   │   ├── subscription/         # POST /api/subscription - Manage subscriptions
│   │   │   └── messages/             # POST /api/messages - Send messages (with limit check)
│   │   ├── chat/
│   │   │   └── page.tsx              # Main chat interface
│   │   ├── pricing/
│   │   │   └── page.tsx              # Pricing plans page
│   │   ├── signup/
│   │   │   └── page.tsx              # Signup page (receives session_id from Stripe)
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx        # User registration form
│   │   │   └── SignupSuccess.tsx     # Post-signup success page
│   │   ├── chat/
│   │   │   ├── ChatHeader.tsx        # Header showing plan + remaining messages
│   │   │   ├── ChatInterface.tsx     # Message display area
│   │   │   ├── ChatInput.tsx         # Message input with limit enforcement
│   │   │   └── LimitBanner.tsx       # Banner shown when limit reached
│   │   └── checkout-button.tsx       # Button that initiates Stripe Checkout
│   └── lib/
│       ├── stripe/
│       │   ├── client.ts             # Client-side Stripe utilities
│       │   ├── config.ts             # Stripe configuration and plan definitions
│       │   ├── webhook.ts            # Webhook event handlers
│       │   └── subscription.ts       # Subscription management utilities
│       ├── db/
│       │   └── subscription.ts       # Database operations for subscriptions
│       └── supabase/
│           ├── client.ts             # Browser-side Supabase client
│           └── server.ts             # Server-side Supabase client with service role
├── public/                           # Static assets
├── .env.local                        # Environment variables (create from .env.example)
├── .env.example                      # Template for environment variables
└── package.json                      # Dependencies and scripts
```

### Key Files for Stripe Integration

| File | Purpose |
|------|---------|
| `src/lib/stripe/config.ts` | Defines plan details (name, messages, price IDs) |
| `src/app/api/stripe/checkout/route.ts` | Creates Stripe Checkout session |
| `src/app/api/webhooks/stripe/route.ts` | Receives and processes Stripe webhooks |
| `src/lib/stripe/webhook.ts` | Handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` |
| `src/app/pricing/page.tsx` | Displays pricing plans with checkout buttons |
| `src/components/checkout-button.tsx` | Reusable checkout button component |
| `src/app/signup/page.tsx` | Receives Stripe session and creates user account |
| `src/components/chat/ChatHeader.tsx` | Shows current plan and remaining messages |
| `src/app/api/messages/route.ts` | Decrements message count before allowing sends |

## 🚀 Deploy to Vercel

### One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step Deployment

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

3. **Add Environment Variables**
   In Vercel dashboard, go to your project > **Settings** > **Environment Variables** and add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_START`
   - `STRIPE_PRICE_ID_SCALE`
   - `STRIPE_PRICE_ID_TEAM`
   - `NEXT_PUBLIC_BASE_URL` (set to `https://your-domain.vercel.app`)

4. **Deploy**
   - Click **Deploy**
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

5. **Update Stripe webhook URL**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Update your webhook endpoint to `https://your-domain.vercel.app/api/webhooks/stripe`

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.