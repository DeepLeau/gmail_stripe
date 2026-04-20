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
- **Subscription Plans** — Choose from Start, Scale, or Team plans with different message quotas
- **Usage Tracking** — Track monthly message usage with automatic quota reset

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth**: Supabase Authentication
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal)
- **Database**: Supabase (PostgreSQL)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up free](https://stripe.com/) for development
- **Supabase account** — [Create a project](https://supabase.com/) (free tier works)

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

Copy the contents of `.env.example` to `.env.local`, then fill in each value:

```bash
# Supabase Configuration
# Find these in: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe API Keys
# Find these in: Stripe Dashboard > Developers > API keys
# Use test mode keys (sk_test_... / pk_test_...) for development
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret

# Stripe Price IDs
# Find these in: Stripe Dashboard > Products > [your product] > Pricing
# Create 3 products with recurring prices:
STRIPE_PRICE_ID_START=price_your_start_plan_id
STRIPE_PRICE_ID_SCALE=price_your_scale_plan_id
STRIPE_PRICE_ID_TEAM=price_your_team_plan_id

# Application URL
# Use http://localhost:3000 for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to find each credential:**

**Supabase credentials:**
1. Log in to [Supabase](https://supabase.com/) and select your project
2. Click **Project Settings** (gear icon) in the left sidebar
3. Click **API**
4. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Stripe Secret Key:**
1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy the **Secret key** (starts with `sk_test_` for development)
5. Paste it as `STRIPE_SECRET_KEY`

**Stripe Price IDs (create your products first):**
1. In Stripe Dashboard, click **Products** in the left sidebar
2. Click **Add product** for each plan:
   - **Start** — $X/month, 10 messages/month limit
   - **Scale** — $Y/month, 50 messages/month limit
   - **Team** — $Z/month, 100 messages/month limit
3. For each product, click on the pricing section and copy the **Price ID** (starts with `price_`)
4. Paste each Price ID into the corresponding variable

**Stripe Webhook Secret (for local development):**
1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copy the webhook signing secret (`whsec_...`) it outputs
4. Paste it as `STRIPE_WEBHOOK_SECRET`

### 4. Run the development server

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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > Developers > API keys > Secret key | Backend API key for Stripe (never expose to frontend) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe CLI (`stripe listen`) or webhook endpoint settings | Verifies incoming webhook requests are from Stripe |
| `STRIPE_PRICE_ID_START` | Yes | Stripe Dashboard > Products > [Start product] > Pricing | Price ID for the Start plan |
| `STRIPE_PRICE_ID_SCALE` | Yes | Stripe Dashboard > Products > [Scale product] > Pricing | Price ID for the Scale plan |
| `STRIPE_PRICE_ID_TEAM` | Yes | Stripe Dashboard > Products > [Team product] > Pricing | Price ID for the Team plan |
| `NEXT_PUBLIC_APP_URL` | Yes | Set to `http://localhost:3000` locally | Base URL for Stripe redirect URLs |

## 🧪 Running Tests

Unit tests verify that specific parts of the code work correctly (e.g., a function returns the right output for a given input).

**Run all tests:**
```bash
npm run test
```

**Run a specific test file:**
```bash
npm run test -- path/to/file.test.ts
```

**Run tests in watch mode (re-runs automatically when files change):**
```bash
npm run test -- --watch
```

**Reading Jest output:**
- `PASS` — All tests in that file passed ✅
- `FAIL` — Something broke ❌ — Jest shows which test failed and why (expected vs received values)

When test files are added, they will cover: authentication actions, message quota tracking, Stripe webhook handlers, and UI components.

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── actions/              # Server actions (auth.ts, messages.ts)
│   ├── api/
│   │   └── stripe/           # Stripe API routes
│   │       ├── checkout/route.ts    # Creates Stripe checkout sessions
│   │       ├── webhook/route.ts     # Handles Stripe webhook events
│   │       └── create-portal/route.ts # Creates billing portal session
│   ├── auth/
│   │   └── stripe/callback/route.ts  # Handles post-checkout redirect
│   ├── signup/               # Signup flow after Stripe checkout
│   │   ├── [plan]/           # Plan selection page
│   │   └── success/          # Post-signup success page
│   └── page.tsx              # Landing page with pricing
├── components/
│   ├── sections/
│   │   └── Pricing.tsx       # Pricing table with 3 plans
│   ├── chat/
│   │   ├── ChatInterface.tsx # Main chat UI
│   │   ├── ChatInput.tsx     # Message input with quota tracking
│   │   ├── QuotaBanner.tsx   # Shows remaining messages
│   │   └── UserMenu.tsx      # User dropdown with plan info
│   └── ui/                   # Reusable UI components
└── lib/
    ├── stripe/
    │   └── config.ts         # Stripe client and plan definitions
    ├── chat/
    │   └── types.ts         # TypeScript types for chat
    └── data.ts               # Supabase data helpers
```

**Key flows:**

1. **Subscribe flow**: Landing → `/signup/[plan]` → Stripe Checkout → `/auth/stripe/callback` → `/signup/success`
2. **Signup flow**: `/signup/success` → Create account → Redirect to `/chat`
3. **Chat flow**: ChatInterface → ChatInput (decrement quota) → QuotaBanner (shows usage)

## 🚀 Deploy to Vercel

One-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Step by step:**

1. Connect your GitHub repository to Vercel
2. In **Environment Variables**, add ALL variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_START`
   - `STRIPE_PRICE_ID_SCALE`
   - `STRIPE_PRICE_ID_TEAM`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel domain, e.g., `https://your-app.vercel.app`)

3. Click **Deploy**

**Webhook setup for production:**
1. In Stripe Dashboard > Webhooks, add your production endpoint: `https://your-domain.com/api/stripe/webhook`
2. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`
3. Copy the webhook signing secret to Vercel's `STRIPE_WEBHOOK_SECRET` variable

## 📝 License

MIT