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
- **Subscription Plans** — Choose from Start (10 msgs/mo), Scale (50 msgs/mo), or Team (100 msgs/mo) with secure Stripe checkout

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication + PostgreSQL
- **Payments**: Stripe (Checkout + Webhooks)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up here](https://stripe.com/) (free test mode available)
- **Supabase account** — [Create one here](https://supabase.com/) (free tier works)

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
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe — Server-side (private, never share these)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe — Product Price IDs
# Create these in Stripe Dashboard > Products > Create Product
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# Stripe — Client-side (safe to expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set up Supabase

1. Go to [Supabase](https://supabase.com/) and create a new project
2. In the **SQL Editor**, run the migration `migrations/002_user_subscriptions.sql` to create the subscriptions table
3. Go to **Project Settings > API**
4. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy the **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Set up Stripe

**Step 1: Create a Stripe account**

1. Go to [stripe.com](https://stripe.com/) and sign up
2. Go to **Developers > API keys** in the left sidebar
3. Copy your **Secret key** (starts with `sk_test_`) → `STRIPE_SECRET_KEY`
4. Copy your **Publishable key** (starts with `pk_test_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Step 2: Create your 3 pricing plans**

1. Go to **Stripe Dashboard > Products > Add Product**
2. Create **Start** plan:
   - Name: "Start"
   - Price: choose your amount (e.g., $9/month or $0)
   - Billing interval: Monthly
   - Copy the **Price ID** (starts with `price_`) → `STRIPE_START_PRICE_ID`
3. Repeat for **Scale** and **Team** plans
4. Note: Use the same price IDs across all environments (test/prod)

**Step 3: Set up Webhooks for local testing**

1. Install the Stripe CLI: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Log in: `stripe login`
3. Forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the **webhook signing secret** shown (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### 6. Run the development server

```bash
npm run dev
```

After a few seconds, you'll see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the landing page.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase > Project Settings > API > anon key | Public key for client-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase > Project Settings > API > service_role key | Server-side admin key (keep secret!) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe > Developers > API keys > Secret key | Server-side Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe > Developers > Webhooks > your endpoint | Validates incoming webhook events |
| `STRIPE_START_PRICE_ID` | ✅ | Stripe > Products > Start plan > Price ID | Price ID for Start tier |
| `STRIPE_SCALE_PRICE_ID` | ✅ | Stripe > Products > Scale plan > Price ID | Price ID for Scale tier |
| `STRIPE_TEAM_PRICE_ID` | ✅ | Stripe > Products > Team plan > Price ID | Price ID for Team tier |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe > Developers > API keys > Publishable key | Client-side Stripe key |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Your choice | Base URL of your app (http://localhost:3000 for dev) |

## 💳 Subscription Flow

The subscription flow works as follows:

1. **Choose a plan** on the landing page pricing section
2. **Checkout** → user is redirected to secure Stripe Checkout page
3. **Payment** → user enters card details and confirms
4. **Redirect** → Stripe redirects to `/signup?session_id=xxx`
5. **Create account** → user signs up on `/signup` page
6. **Activate subscription** → account is created AND subscription is linked
7. **Access chat** → user is redirected to `/chat` with their plan active

### Viewing Your Plan & Quota

Once logged in, you can see:
- Current plan name (Start / Scale / Team)
- Messages remaining this month
- Upgrade options when limit is reached

### Message Quota System

- Each plan has a monthly message limit (Start: 10, Scale: 50, Team: 100)
- Counter decrements with each message sent in the chat
- When limit is reached, a prompt invites upgrading
- Quota resets automatically each month (handled by Stripe webhook)

## 📁 Project Structure

```
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/route.ts # Creates Stripe checkout session
│   │   │   │   └── webhook/route.ts  # Handles Stripe events
│   │   │   └── billing/
│   │   │       ├── init/route.ts     # Initialize subscription after signup
│   │   │       └── quota/route.ts    # Get/update message quota
│   │   ├── signup/page.tsx           # Account creation page (post-payment)
│   │   └── chat/page.tsx             # Main chat interface
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── PricingCard.tsx        # Pricing plan card
│   │   │   ├── Button.tsx             # Button component
│   │   │   └── ...
│   │   ├── auth/
│   │   │   └── SignupForm.tsx         # Signup form with plan activation
│   │   ├── chat/
│   │   │   └── ChatInterface.tsx      # Main chat component with quota logic
│   │   ├── sections/
│   │   │   └── Pricing.tsx            # Pricing section for landing page
│   │   └── ui/
│   │       └── UserMenu.tsx          # User dropdown with plan info
│   ├── lib/
│   │   └── stripe/
│   │       └── config.ts             # Stripe configuration and helpers
│   └── middleware.ts                 # Auth + quota checking middleware
├── migrations/
│   └── 002_user_subscriptions.sql    # Creates subscriptions table
├── .env.example                      # Template for environment variables
└── package.json
```

## 🚀 Deploy to Vercel

### One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy

1. **Push your code** to GitHub if you haven't already
2. **Import** your repository in Vercel dashboard
3. **Add environment variables** in Vercel > Settings > Environment Variables:
   - Copy ALL variables from your `.env.local` (Supabase, Stripe, etc.)
4. **Deploy** — Vercel will automatically build and deploy

### Stripe Webhook Setup for Production

After deploying to Vercel:

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
4. Copy the webhook signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

### Supabase Auth Redirect for Production

In Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/auth/callback`

## 📝 License

MIT