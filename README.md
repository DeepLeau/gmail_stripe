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
- **Subscription Plans** — Choose between Start (10 messages/mois), Scale (50 messages/mois), or Team (100 messages/mois)
- **Message Usage Tracking** — Real-time display of remaining messages in the chat header

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
- **Stripe account** — [Sign up here](https://stripe.com/) (free for testing)

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
# Find these in: Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Stripe Webhook Secret — found in Stripe Dashboard > Webhooks
# Generate with: stripe listen --forward-to localhost:3000/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs — create products in Stripe Dashboard > Products
# Each product needs a recurring price (monthly billing)
STRIPE_START_PRICE_ID=price_your_start_plan_id
STRIPE_SCALE_PRICE_ID=price_your_scale_plan_id
STRIPE_TEAM_PRICE_ID=price_your_team_plan_id

# Application base URL (change for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to find/create your Stripe credentials:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. For **Publishable Key** and **Secret Key**: Click **Developers** (top right) → **API keys** → copy the keys (use test mode keys prefixed with `pk_test_` and `sk_test_` for development)
3. For **Webhook Secret**: Click **Developers** → **Webhooks** → **Add endpoint**:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`
   - Copy the **Signing Secret** (starts with `whsec_`)
4. For **Price IDs**: Click **Products** → **Add product** → create a recurring price (e.g., "Start Plan" for $9.99/month) → copy the **Price ID** (starts with `price_`)

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

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public key for client-side auth |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard → Developers → API keys → Secret key | Backend-only Stripe API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard → Developers → API keys → Publishable key | Client-side Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Developers → Webhooks → select endpoint | Verifies webhook authenticity |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard → Products → select product → Pricing | Price ID for Start plan ($9.99/mo) |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard → Products → select product → Pricing | Price ID for Scale plan |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe Dashboard → Products → select product → Pricing | Price ID for Team plan |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set manually | Base URL of your app (http://localhost:3000 for dev) |

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts          # Creates Stripe Checkout sessions
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts      # Handles Stripe webhook events
│   │   ├── chat/
│   │   │   └── page.tsx              # Main chat interface (protected)
│   │   ├── signup/
│   │   │   └── page.tsx              # Signup page with session linking
│   │   └── actions/
│   │       └── subscriptions.ts       # Server Actions for subscription logic
│   ├── components/
│   │   ├── auth/
│   │   │   └── SignupForm.tsx         # Signup form with Stripe session linking
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx      # Chat UI with message usage display
│   │   │   └── ChatInput.tsx          # Message input with usage check
│   │   └── sections/
│   │       └── Pricing.tsx            # Pricing cards for 3 plans
│   ├── lib/
│   │   ├── stripe/
│   │   │   ├── server.ts              # Server-side Stripe utilities
│   │   │   └── config.ts              # Plan configuration (limits, prices)
│   │   └── supabase/
│   │       └── client.ts              # Supabase client setup
│   └── middleware.ts                  # Auth protection for /chat route
├── supabase/
│   └── migrations/
│       └── 001_create_user_subscriptions.sql  # DB schema + RPC functions
└── .env.example                       # Environment variable template
```

## 💳 Stripe Checkout Flow

### Anonymous Checkout with Post-Signup Linking

1. **User selects a plan** on the pricing page (/pricing or landing)
2. **Creates Stripe Checkout session** — user is redirected to Stripe's hosted checkout page
3. **Payment completed** — user returns to `/signup?session_id=xxx`
4. **User creates account** — during signup, the server action `linkStripeSessionToUser(sessionId, userId)` links the Stripe session to the new Supabase user
5. **Webhook confirmation** — `checkout.session.completed` webhook confirms the payment (may arrive before or after signup — both cases handled via upsert)

### Plan Details

| Plan | Messages/Month | Price |
|------|----------------|-------|
| Start | 10 | $9.99/mo |
| Scale | 50 | $29.99/mo |
| Team | 100 | $59.99/mo |

### Message Usage Flow

1. User sends message in chat
2. Before accepting, `decrement_message_count(userId)` RPC is called
3. If `remaining >= 0`: message is sent, remaining count is displayed in header
4. If `remaining < 0`: message is refused with "Limite atteinte — upgrade vers plan supérieur" + link to /pricing

### Monthly Reset

When a subscription renews, the `customer.subscription.updated` webhook:
- Resets `messages_used` to 0
- Updates `current_period_end` to new period

## 📂 Database Schema

### Table: `user_subscriptions`

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | uuid | FK to auth.users |
| `stripe_customer_id` | text | Stripe customer identifier |
| `stripe_subscription_id` | text | Stripe subscription identifier |
| `stripe_session_id` | text | Checkout session ID (for linking) |
| `plan` | text | 'start', 'scale', or 'team' |
| `messages_limit` | integer | Monthly message limit (10, 50, or 100) |
| `messages_used` | integer | Messages used this period |
| `current_period_start` | timestamptz | Subscription period start |
| `current_period_end` | timestamptz | Subscription period end |
| `subscription_status` | text | 'active', 'past_due', 'canceled', etc. |

### RPC Functions

- `decrement_message_count(p_user_id)` — Atomically decrements `messages_used`, returns `{ success, remaining }`. If remaining < 0, returns failure.
- `apply_subscription_change(...)` — Called by webhook to create/update subscription record

### Row Level Security (RLS)

- Users can only read their own subscription row
- All writes go through `service_role` key (server-side only)

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy

1. **Push your code to GitHub** (create a repo if you haven't)
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repository
3. **Add environment variables**:
   - In Vercel dashboard → Your Project → Settings → Environment Variables
   - Add ALL variables from `.env.example`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_START_PRICE_ID`
     - `STRIPE_SCALE_PRICE_ID`
     - `STRIPE_TEAM_PRICE_ID`
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel domain, e.g., `https://your-app.vercel.app`)
4. **Deploy** — Vercel will automatically build and deploy

### Stripe Webhook for Production

When deploying, update your Stripe webhook URL to your production domain:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Update endpoint URL to `https://your-domain.com/api/webhooks/stripe`
3. Use `stripe listen` CLI to test locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the webhook signing secret and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## 📝 License

MIT