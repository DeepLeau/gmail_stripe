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
- **Subscription Plans** — Choose from Start, Scale, or Team plans with different monthly message limits

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

# Stripe — Payment Configuration
# Find these in: Stripe Dashboard > Developers > API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx_or_pk_test_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx_or_sk_test_xxxxx

# Stripe Webhook Secret
# Setup: Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
# Then copy the webhook signing secret from the output
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Price IDs
# Find these in: Stripe Dashboard > Products > [Plan Name] > Pricing > Price ID
STRIPE_START_PRICE_ID=price_xxxxx
STRIPE_SCALE_PRICE_ID=price_xxxxx
STRIPE_TEAM_PRICE_ID=price_xxxxx

# App URL
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

### 5. Create an account

Visit [http://localhost:3000/signup](http://localhost:3000/signup) to create your account.

## 💳 Subscription & Billing

### Available Plans

| Plan | Price | Monthly Messages | Best For |
|------|-------|-----------------|----------|
| **Start** | $X/month | 10 messages | Light users, try it out |
| **Scale** | $Y/month | 50 messages | Regular users, productive workflows |
| **Team** | $Z/month | 100 messages | Power users, heavy usage |

### How the Checkout Flow Works

1. **Select a plan** — Visit `/pricing` and click on your chosen plan
2. **Pay with Stripe** — You're redirected to Stripe Checkout (hosted payment page)
3. **Return to signup** — After payment, you return to `/signup?session_id=xxx`
4. **Create your account** — Sign up with email/password
5. **Auto-linking** — The system automatically links your Stripe session to your new account

> ⚠️ **Important**: The webhook may arrive before or after signup. Both scenarios are handled — your subscription will be linked correctly in either case.

### Message Limits

- Each plan provides a set number of messages per month
- The counter resets automatically on the first day of each billing cycle
- **At limit**: When you reach your message limit, the chat will show: *"Limite atteinte — upgrade vers plan supérieur"* with a link to `/pricing`

### Your Current Plan

When logged in, the chat header displays:
- Your current plan name (Start / Scale / Team)
- Messages remaining this billing period
- Progress indicator

## 🔑 Environment Variables

| Variable | Required | Where to Find | Description |
|----------|----------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Project Settings → API → Project URL | Supabase project connection URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Project Settings → API → anon/public key | Supabase client-side authentication key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard → Developers → API keys → publishable key | Stripe client-side key (starts with `pk_`) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard → Developers → API keys → secret key | Stripe server-side key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` | Stripe webhook signature verification |
| `STRIPE_START_PRICE_ID` | ✅ | Stripe Dashboard → Products → Start → Pricing → Price ID | Stripe price ID for Start plan |
| `STRIPE_SCALE_PRICE_ID` | ✅ | Stripe Dashboard → Products → Scale → Pricing → Price ID | Stripe price ID for Scale plan |
| `STRIPE_TEAM_PRICE_ID` | ✅ | Stripe Dashboard → Products → Team → Pricing → Price ID | Stripe price ID for Team plan |
| `NEXT_PUBLIC_BASE_URL` | ✅ | `http://localhost:3000` (dev) or your production domain | Your app's base URL for Stripe redirects |

### Finding Stripe Credentials

**API Keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy the **Publishable key** (for frontend) and **Secret key** (for backend)

**Price IDs:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Products** in the left sidebar
3. Select your product (Start, Scale, or Team)
4. Click on the pricing option
5. Copy the **Price ID** (starts with `price_`)

**Webhook Secret:**
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac) or [see other options](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Start listening: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the **webhook signing secret** shown in the output (starts with `whsec_`)

## 🗄️ Database Schema

### Table: `user_subscriptions`

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Reference to auth.users |
| `stripe_customer_id` | TEXT | Stripe customer identifier |
| `stripe_subscription_id` | TEXT | Stripe subscription identifier |
| `stripe_session_id` | TEXT | One-time checkout session ID |
| `plan` | TEXT | Plan name: 'start', 'scale', or 'team' |
| `messages_limit` | INTEGER | Monthly message allowance |
| `messages_used` | INTEGER | Messages used this period |
| `current_period_start` | TIMESTAMPTZ | Billing cycle start |
| `current_period_end` | TIMESTAMPTZ | Billing cycle end |
| `subscription_status` | TEXT | 'active', 'past_due', 'canceled', etc. |

**Row Level Security (RLS):**
- Users can only **read** their own subscription row
- All **writes** are handled via service_role (for webhooks and server actions)

### Stored Procedures

- `decrement_message_count(p_user_id)` — Atomically decrements message count, returns `{ success, remaining }`. If remaining < 0, the message is rejected.
- `apply_subscription_change(...)` — Called by webhook to upsert subscription data and reset `messages_used` on renewal.

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── chat/               # Chat interface (protected)
│   │   ├── pricing/            # Subscription plans page
│   │   ├── signup/             # Sign up with Stripe session handling
│   │   └── api/
│   │       └── webhooks/
│   │           └── stripe/     # Stripe webhook endpoint
│   ├── components/             # Reusable UI components
│   │   ├── pricing/            # Pricing cards and plan selectors
│   │   └── chat/               # Chat UI components
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server-side client
│   │   │   └── middleware.ts   # Auth middleware
│   │   └── stripe.ts           # Stripe client and helpers
│   └── actions/                # Server Actions
│       └── subscription.ts     # linkStripeSessionToUser, etc.
├── supabase/
│   └── migrations/             # Database schema and functions
├── .env.local                  # Environment variables (gitignored)
└── package.json
```

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy Steps

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/my-app.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Click **New Project**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**
   - In Vercel dashboard, go to **Settings** → **Environment Variables**
   - Add ALL variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_START_PRICE_ID`
     - `STRIPE_SCALE_PRICE_ID`
     - `STRIPE_TEAM_PRICE_ID`
     - `NEXT_PUBLIC_BASE_URL` (update to your production URL)

4. **Deploy**
   - Click **Deploy** — Vercel builds and deploys automatically

### Stripe Webhook for Production

For production webhooks on Vercel, use Stripe CLI to forward to your deployed URL:

```bash
stripe listen --forward-to your-domain.com/api/webhooks/stripe
```

Or set up a permanent webhook endpoint in Stripe Dashboard → Developers → Webhooks.

## 📝 License

MIT