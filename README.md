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
- **3 Flexible Plans** — Start (10 messages/month), Scale (50 messages/month), Team (100 messages/month)
- **Usage Tracking** — See your current plan and remaining messages directly in the chat
- **Smart Upgrade Prompts** — When you hit your limit, get a gentle nudge to upgrade
- **Monthly Reset** — Message counter resets automatically when your subscription renews

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication & Storage
- **Payments**: Stripe Checkout & Webhooks

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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services (databases, payment processors, etc.).

Add the following content to `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe Price IDs (create these in your Stripe Dashboard > Products)
STRIPE_START_PRICE_ID=price_your_start_price_id
STRIPE_SCALE_PRICE_ID=price_your_scale_price_id
STRIPE_TEAM_PRICE_ID=price_your_team_price_id
```

### How to find your Supabase credentials:

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to find your Stripe credentials:

**STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. You'll see **Publishable key** (starts with `pk_`) — copy this for `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Click **Reveal test key** next to **Secret key** (starts with `sk_`) — copy this for `STRIPE_SECRET_KEY`

**STRIPE_WEBHOOK_SECRET:**

1. In Stripe Dashboard, click **Developers** > **Webhooks**
2. Click **Add endpoint**
3. In **Endpoint URL**, enter your site's webhook URL (e.g., `https://your-site.com/api/webhooks/stripe`)
4. Under **Select events**, choose:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. On the next screen, find **Signing secret** (starts with `whsec_`) — copy this for `STRIPE_WEBHOOK_SECRET`

**STRIPE_START_PRICE_ID, STRIPE_SCALE_PRICE_ID, STRIPE_TEAM_PRICE_ID:**

1. In Stripe Dashboard, click **Products** in the left sidebar
2. Create a product for each plan:
   - **Start**: Name it "Start", Price: $X/month, Billing: Recurring > Monthly
   - **Scale**: Name it "Scale", Price: $Y/month, Billing: Recurring > Monthly
   - **Team**: Name it "Team", Price: $Z/month, Billing: Recurring > Monthly
3. For each product, click on it and copy the **Price ID** (starts with `price_`)
4. Paste them into your `.env.local`:
   - `STRIPE_START_PRICE_ID` = the Start plan's Price ID
   - `STRIPE_SCALE_PRICE_ID` = the Scale plan's Price ID
   - `STRIPE_TEAM_PRICE_ID` = the Team plan's Price ID

**NEXT_PUBLIC_BASE_URL:**

- For local development: `http://localhost:3000`
- For production: Your deployed URL (e.g., `https://your-app.vercel.app`)

### 4. Set up your Supabase database

After setting up your Supabase project, you'll need to create tables for user subscriptions and message tracking. The app expects:

- A `profiles` table with `id`, `email`, `stripe_customer_id`, `subscription_status`, `plan_type`, `messages_used`, `subscription_renewal_date`
- Row Level Security (RLS) policies so users can only access their own data

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
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard > Project Settings > API > anon/public key | Supabase anonymous key for client-side auth |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard > Developers > API keys > Secret key | Stripe secret key for server-side operations (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard > Developers > Webhooks > your endpoint > Signing secret | Verifies webhook requests are from Stripe (whsec_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard > Developers > API keys > Publishable key | Stripe publishable key for client-side (pk_test_...) |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Set manually | Your site's URL (http://localhost:3000 for dev) |
| `STRIPE_START_PRICE_ID` | ✅ | Stripe Dashboard > Products > Start product > Price ID | Price ID for the Start plan (10 messages/month) |
| `STRIPE_SCALE_PRICE_ID` | ✅ | Stripe Dashboard > Products > Scale product > Price ID | Price ID for the Scale plan (50 messages/month) |
| `STRIPE_TEAM_PRICE_ID` | ✅ | Stripe Dashboard > Products > Team product > Price ID | Price ID for the Team plan (100 messages/month) |

## 💳 How the Stripe Checkout Works

**For your users (no account required first):**

1. User browses the landing page and clicks "Choose Plan" on any of the 3 tiers
2. They click a Stripe-hosted checkout button — **no account needed yet**
3. They enter payment details on Stripe's secure page
4. After payment, they're redirected back to your site with a session ID
5. **Then** they create their account (or log in if they already have one)
6. The app automatically links their Stripe subscription to their new account via webhook

**For logged-in users in the chat:**

- Your current plan and remaining messages appear at the top of the chat
- When you send a message, the counter decreases
- When you hit your limit, a friendly message suggests upgrading
- At the start of each month (when Stripe renews your subscription), the counter resets to your plan's limit

## 🧪 Running Tests

Tests are configured with Jest but no test files have been added yet. Once you add tests (e.g., `*.test.ts` or `*.spec.ts` files), here's how to run them:

**What are unit tests?** Unit tests are small, automated checks that verify specific parts of your code work correctly — like checking that a function returns the right output.

**Run all tests:**

```bash
npx jest
```

**Run a specific test file:**

```bash
npx jest path/to/your-file.test.ts
```

**Watch mode (re-runs automatically when files change):**

```bash
npx jest --watch
```

**Reading Jest output:**

- `PASS` — All tests in that file passed ✅
- `FAIL` — Something broke ❌ — Jest will show which test failed and why
- `Test Suites: 1 passed, 1 failed` — Means 1 file passed, 1 failed

**What the tests will cover (once added):**

- Subscription creation and linking to user accounts
- Message counting logic and limits
- Plan upgrade prompts when limits are reached
- Webhook handling for subscription events
- Authentication flow with subscription state

## 📁 Project Structure

```
emind/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/
│   │   │   ├── auth/           # Supabase auth callbacks
│   │   │   ├── checkout/        # Stripe checkout session creation
│   │   │   ├── webhooks/        # Stripe webhook handlers
│   │   │   └── user/           # User data endpoints
│   │   ├── chat/               # Main chat interface page
│   │   ├── pricing/            # Pricing/plan selection page
│   │   ├── auth/               # Login/signup pages
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable React components
│   │   ├── chat/               # Chat-specific components (MessageList, ChatInput, etc.)
│   │   ├── pricing/            # Pricing cards and plan selection
│   │   ├── ui/                 # Generic UI components (buttons, modals, etc.)
│   │   └── auth/               # Authentication components
│   ├── lib/                    # Utility functions and helpers
│   │   ├── supabase/           # Supabase client setup and queries
│   │   ├── stripe/             # Stripe client and helper functions
│   │   └── utils.ts            # General utilities (class merging, formatting, etc.)
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets (images, fonts, etc.)
├── .env.local                  # Environment variables (create from .env.example)
├── .env.example                # Template for required environment variables
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── jest.config.ts              # Jest test configuration
```

## 🚀 Deploy to Vercel

### One-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step:

1. **Push your code to GitHub** — Make sure your `.env.local` is NOT committed (it should be in `.gitignore`)

2. **Connect to Vercel:**
   - Click the deploy button above or go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add environment variables:**
   - In Vercel dashboard, go to **Settings** > **Environment Variables**
   - Add each variable from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel URL, e.g., `https://your-app.vercel.app`)
     - `STRIPE_START_PRICE_ID`
     - `STRIPE_SCALE_PRICE_ID`
     - `STRIPE_TEAM_PRICE_ID`

4. **Update Stripe webhook URL:**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Edit your webhook endpoint
   - Change the URL to `https://your-app.vercel.app/api/webhooks/stripe`

5. **Deploy** — Click "Deploy" and wait for the build to complete

> ⚠️ **Important**: Never commit `.env.local` to version control. Use Vercel's environment variables or a `.env.local` file that's in your `.gitignore`.

## 📝 License

MIT — feel free to use, modify, and distribute this project.