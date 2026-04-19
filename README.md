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
- **Subscription Plans** — Choose from 3 tiers: Start (10 msg/mo), Scale (50 msg/mo), Team (100 msg/mo)
- **Secure Checkout** — Pay via Stripe and get redirected to create your account
- **Usage Tracking** — Your message quota decrements with each query, resets monthly
- **Upgrade Prompts** — Friendly banner when you hit your limit, with easy upgrade option
- **Plan Dashboard** — See your current plan and remaining messages in your interface

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth**: Supabase Authentication
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal)
- **Testing**: Jest

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **Stripe account** — [Sign up free here](https://stripe.com/)
- **Supabase account** — [Sign up free here](https://supabase.com/)

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

Copy the template from `.env.example` or create your own:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_START=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_PRICE_TEAM=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to set up Stripe:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Get your **Secret Key**: Click **Developers** > **API keys** > copy the **Secret key** (starts with `sk_`)
3. Get your **Publishable Key**: Same page, copy the **Publishable key** (starts with `pk_`)
4. Create 3 products with monthly recurring prices:
   - Click **Products** > **Add Product**
   - Name: "Start", Price: however you want (e.g., $9/month), Billing: Recurring > Monthly
   - Click **Add product**
   - Copy the **Price ID** (starts with `price_`)
   - Repeat for "Scale" and "Team" plans
5. Get your **Webhook Secret**:
   - Click **Developers** > **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook` (use localhost for dev: `http://localhost:3000/api/stripe/webhook`)
   - Click **Select events** > check: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Click **Add endpoint**
   - Copy the **Signing secret** (starts with `whsec_`)

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

### 5. Test the subscription flow

1. Visit the landing page — you'll see 3 pricing plans in the **Pricing** section
2. Click **Choose Plan** on any plan (Start, Scale, or Team)
3. You'll be redirected to Stripe Checkout to enter your card details
4. After payment, you'll be redirected to `/create-account` to set up your account
5. After creating your account, you're taken to `/chat` where you can start chatting
6. Watch the **Quota Banner** at the top — it shows your plan and remaining messages
7. When you hit your limit, a message invites you to upgrade

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase > Project Settings > API > anon/public key | Public API key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe > Developers > API keys > Secret key | Backend Stripe API key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe > Developers > Webhooks > your endpoint > Signing secret | Verifies webhook requests from Stripe |
| `STRIPE_PRICE_START` | Yes | Stripe > Products > Start product > Price ID | Price ID for the Start plan (price_...) |
| `STRIPE_PRICE_SCALE` | Yes | Stripe > Products > Scale product > Price ID | Price ID for the Scale plan (price_...) |
| `STRIPE_PRICE_TEAM` | Yes | Stripe > Products > Team product > Price ID | Price ID for the Team plan (price_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe > Developers > API keys > Publishable key | Client-side Stripe key (pk_test_...) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set manually | Base URL for redirect URLs (http://localhost:3000 for dev) |

## 🧪 Running Tests

Unit tests help verify that individual parts of the code work correctly. When you add test files, run them like this:

**Run all tests:**

```bash
npx jest
```

**Run a specific test file:**

```bash
npx jest path/to/file.test.ts
```

**Watch mode (re-runs tests automatically when files change):**

```bash
npx jest --watch
```

**Reading the output:**

- `PASS` — All tests in that file passed ✅
- `FAIL` — Something broke ❌ — the error message shows which test failed and why

**What tests would cover (once added):**

- Subscription plan configuration and pricing display
- Message quota decrement logic
- Stripe checkout session creation
- Webhook handling for successful payments
- Authentication flow with plan linking

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── actions/                  # Server actions (subscription.ts)
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── create-checkout/   # Creates Stripe checkout session
│   │   │   │   ├── verify-session/    # Verifies Stripe session status
│   │   │   │   └── webhook/          # Handles Stripe webhooks
│   │   │   ├── subscription/         # Manage user subscriptions
│   │   │   └── messages/
│   │   │       └── decrement/        # Decrements message quota
│   │   ├── chat/                     # Chat interface page
│   │   ├── create-account/           # Account creation after checkout
│   │   ├── signup/                   # Direct signup page
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── auth/                     # Authentication components (SignupForm, SignupFormWithPlan)
│   │   ├── chat/                     # Chat components (ChatInterface, ChatInput, ChatMessage, QuotaBanner)
│   │   ├── sections/                # Landing page sections (Hero, Pricing, Features, etc.)
│   │   └── ui/                      # Reusable UI components (Navbar, Spinner, Toast, Accordion)
│   ├── lib/
│   │   ├── stripe/
│   │   │   ├── client.ts             # Stripe client-side utilities
│   │   │   ├── config.ts             # Stripe configuration
│   │   │   └── plans.ts              # Plan definitions (Start, Scale, Team)
│   │   └── supabase/
│   │       └── admin.ts              # Supabase admin client
│   ├── types/
│   │   └── subscriptions.ts          # TypeScript types for subscriptions
│   └── hooks/                       # Custom React hooks (待添加)
├── public/                          # Static assets
├── .env.local                       # Environment variables (create from .env.example)
├── .env.example                     # Environment variables template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── jest.config.ts
```

**Key files for the subscription flow:**

| File | Purpose |
|------|---------|
| `src/lib/stripe/plans.ts` | Defines the 3 plans with names, prices, message limits |
| `src/lib/stripe/client.ts` | Client-side Stripe utilities |
| `src/components/sections/Pricing.tsx` | Displays pricing cards on landing page |
| `src/app/api/stripe/create-checkout/route.ts` | Creates Stripe checkout session when user selects a plan |
| `src/app/api/stripe/webhook/route.ts` | Handles Stripe events (payment success, subscription updates) |
| `src/app/create-account/page.tsx` | Account creation page after successful payment |
| `src/components/auth/SignupFormWithPlan.tsx` | Signup form that links user to their Stripe plan |
| `src/app/chat/page.tsx` | Main chat interface |
| `src/components/chat/QuotaBanner.tsx` | Shows current plan and remaining messages |
| `src/app/api/messages/decrement/route.ts` | Decrements quota when user sends a message |

## 🚀 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step deployment

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
   - In Vercel dashboard, go to **Settings** > **Environment Variables**
   - Add ALL variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_START`
     - `STRIPE_PRICE_SCALE`
     - `STRIPE_PRICE_TEAM`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `NEXT_PUBLIC_BASE_URL` (change to your production URL, e.g., `https://your-app.vercel.app`)

4. **Update Stripe webhook**
   - In Stripe Dashboard > Developers > Webhooks
   - Add a new endpoint: `https://your-production-domain.com/api/stripe/webhook`
   - Select the same events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

5. **Deploy**
   - Click **Deploy** — Vercel builds and deploys automatically

## 📝 License

MIT

---

**Need help?** Open an issue on GitHub or check the [Supabase docs](https://supabase.com/docs) and [Stripe docs](https://stripe.com/docs) for detailed API references.