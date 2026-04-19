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
- **Subscription Plans** — Choose from Start (10 messages/month), Scale (50 messages/month), or Team (100 messages/month) with secure Stripe checkout
- **Usage Tracking** — Real-time message quota tracking with automatic monthly reset
- **Upgrade Prompts** — Automatic notifications when approaching or reaching your message limit

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth**: Supabase Authentication
- **Payments**: Stripe Checkout & Webhooks
- **Database**: Supabase (PostgreSQL)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up free here](https://stripe.com/) for testing

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
# Find STRIPE_SECRET_KEY at: Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Find STRIPE_WEBHOOK_SECRET at: Stripe Dashboard > Developers > Webhooks
# Select "checkout.session.completed" and "customer.subscription.updated" events
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs — create products in Stripe Dashboard > Products
# Each product = one subscription plan
STRIPE_PRICE_ID_START=price_your_start_plan_id
STRIPE_PRICE_ID_SCALE=price_your_scale_plan_id
STRIPE_PRICE_ID_TEAM=price_your_team_plan_id

# Stripe Plans Configuration (matching your pricing page)
MESSAGES_START=10
MESSAGES_SCALE=50
MESSAGES_TEAM=100
```

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to create your Stripe products and get Price IDs:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Products** in the left sidebar
3. Click **Add product**
4. Fill in the product details:
   - **Name**: "Start" | **Price**: your monthly price | Click **Add pricing variant**
   - **Name**: "Scale" | **Price**: your monthly price | Click **Add pricing variant**
   - **Name**: "Team" | **Price**: your monthly price
5. For each product, set pricing to **Recurring > Monthly**
6. Click **Save product**
7. Copy each product's **Default price ID** (looks like `price_xxxxxxxxxxxxxx`)
8. Paste them into your `.env.local` as `STRIPE_PRICE_ID_START`, `STRIPE_PRICE_ID_SCALE`, `STRIPE_PRICE_ID_TEAM`

**How to set up your Stripe webhook for local testing:**

1. Install the Stripe CLI: [Stripe CLI installation guide](https://stripe.com/docs/stripe-cli)
2. Log in to Stripe: `stripe login`
3. Forward events to your local server: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret (starts with `whsec_`) and paste it as `STRIPE_WEBHOOK_SECRET`

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

### 5. How the subscription flow works

1. **Choose a plan** — Visit the landing page and select Start, Scale, or Team in the Pricing section
2. **Checkout** — Clicking a plan button redirects you to Stripe's secure checkout page
3. **Payment** — Enter your card details and complete the payment on Stripe
4. **Create account** — After successful payment, you're redirected to create your account
5. **Start chatting** — Once your account is created, you're redirected to the chat interface
6. **Track usage** — Your plan and remaining messages appear in your user menu
7. **Monthly reset** — Your message quota automatically resets on the first day of each month

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase > Project Settings > API > anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe > Developers > API keys > Secret key | Server-side Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe > Developers > Webhooks > select endpoint | Verifies incoming webhook requests |
| `STRIPE_PRICE_ID_START` | Yes | Stripe > Products > [product] > Default price ID | Price ID for the Start plan |
| `STRIPE_PRICE_ID_SCALE` | Yes | Stripe > Products > [product] > Default price ID | Price ID for the Scale plan |
| `STRIPE_PRICE_ID_TEAM` | Yes | Stripe > Products > [product] > Default price ID | Price ID for the Team plan |
| `MESSAGES_START` | Yes | Set manually | Message limit for Start plan (default: 10) |
| `MESSAGES_SCALE` | Yes | Set manually | Message limit for Scale plan (default: 50) |
| `MESSAGES_TEAM` | Yes | Set manually | Message limit for Team plan (default: 100) |

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                          # Next.js App Router pages and API routes
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── create-checkout/  # POST: Creates Stripe checkout session
│   │   │   │   └── webhook/          # POST: Handles Stripe webhook events
│   │   │   ├── messages/
│   │   │   │   └── decrement/        # POST: Decrements user message quota
│   │   │   ├── user/
│   │   │   │   └── subscription/     # GET: Returns user's current plan & usage
│   │   │   └── cron/
│   │   │       └── reset-quota/      # GET: Resets all user quotas monthly
│   │   ├── actions/
│   │   │   └── auth.ts               # Server actions for authentication
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing page
│   │   ├── chat/page.tsx             # Chat interface page
│   │   ├── signup/page.tsx           # Account creation page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── sections/
│   │   │   └── Pricing.tsx           # Subscription plan cards
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx     # Main chat container
│   │   │   └── ChatInput.tsx         # Message input with quota check
│   │   ├── ui/
│   │   │   └── UserMenu.tsx          # User dropdown showing plan & quota
│   │   └── auth/
│   │       └── SignupForm.tsx        # Account creation form
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase client for browser
│   │   │   ├── server.ts             # Supabase client for server
│   │   │   └── service-role.ts      # Supabase admin client (webhooks)
│   │   ├── stripe/
│   │   │   ├── server.ts            # Stripe server SDK instance
│   │   │   └── client.ts            # Stripe client utilities
│   │   └── constants.ts             # Plan limits and configuration
│   └── middleware.ts                 # Auth protection and quota checking
├── public/                           # Static assets
├── .env.local                        # Environment variables (create this)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Key files for subscription system

| File | Purpose |
|------|---------|
| `src/components/sections/Pricing.tsx` | Displays 3 plan cards (Start/Scale/Team) with prices and features |
| `src/components/chat/ChatInput.tsx` | Checks quota before sending, shows warning at 80% usage |
| `src/components/ui/UserMenu.tsx` | Shows current plan name and messages remaining |
| `src/lib/constants.ts` | Plan message limits configuration |
| `src/app/api/stripe/create-checkout/route.ts` | Creates Stripe checkout session with correct price ID |
| `src/app/api/stripe/webhook/route.ts` | Handles `checkout.session.completed` to create user |
| `src/app/api/messages/decrement/route.ts` | Decrements monthly message counter |
| `src/app/api/user/subscription/route.ts` | Returns user's subscription status and remaining messages |
| `src/middleware.ts` | Protects `/chat` route, redirects to pricing if not subscribed |

## 🚀 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step

1. **Push your code to GitHub** — Vercel will import from your repo
2. **Import project** — Select your GitHub repository
3. **Configure environment variables** — In Vercel dashboard, go to **Settings > Environment Variables** and add all variables from your `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   STRIPE_PRICE_ID_START
   STRIPE_PRICE_ID_SCALE
   STRIPE_PRICE_ID_TEAM
   MESSAGES_START
   MESSAGES_SCALE
   MESSAGES_TEAM
   ```

4. **Deploy** — Click **Deploy** and wait ~1 minute

### Set up Stripe webhook for production

1. In [Stripe Dashboard](https://dashboard.stripe.com/), go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the webhook signing secret to Vercel environment variables

### Set up Vercel Cron for monthly quota reset

1. In your project, create `vercel.json` in the root:

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-quota",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

2. Deploy to Vercel — the cron job will run on the 1st of every month at midnight UTC

## 📝 License

MIT