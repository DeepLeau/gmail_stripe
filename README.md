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
- **Subscription Plans** — Choose from Start (10 messages/month), Scale (50 messages/month), or Team (100 messages/month)
- **Automatic Quota Tracking** — Your message counter decrements with each query; renewal resets monthly
- **Upgrade Prompts** — Clear messaging when you reach your limit, with easy upgrade path

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication + PostgreSQL
- **Payments**: Stripe Checkout + Stripe Webhooks + Stripe Customer Portal
- **Server Utilities**: @supabase/ssr

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)
- **A Stripe account** — [Sign up here](https://stripe.com/) (free for testing)
- **A Supabase account** — [Sign up here](https://supabase.com/) (free tier works)

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
# Find STRIPE_SECRET_KEY in: Stripe Dashboard > Developers > API keys > Secret key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Find STRIPE_WEBHOOK_SECRET by: Stripe Dashboard > Developers > Webhooks > Add endpoint
# The endpoint URL should be: https://your-domain.com/api/stripe/webhook
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Publishable Keys (public — safe to expose to client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# App URL (used for redirects after Stripe checkout)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to find your Supabase credentials:**

1. Go to [Supabase](https://supabase.com/) and log in
2. Select your project
3. Click **Project Settings** (the gear icon) in the left sidebar
4. Click **API**
5. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to find your Stripe credentials:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. For **STRIPE_SECRET_KEY** and **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**:
   - Click **Developers** in the left sidebar
   - Click **API keys**
   - You'll see your keys under "Standard keys" — copy the **Secret key** (starts with `sk_`) and **Publishable key** (starts with `pk_`)
   - If you don't see real keys, make sure "Test mode" is toggled on (for development)
3. For **STRIPE_WEBHOOK_SECRET**:
   - Click **Developers** in the left sidebar
   - Click **Webhooks**
   - Click **Add an endpoint**
   - Enter your endpoint URL: `https://your-domain.com/api/stripe/webhook` (use `http://localhost:3000/api/stripe/webhook` for local testing with Stripe CLI)
   - Under "Select events", add: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Click **Add endpoint**
   - Copy the **Signing secret** (starts with `whsec_`) and paste it as `STRIPE_WEBHOOK_SECRET`

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

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

### 5. Test the subscription flow

1. Visit the landing page — you'll see the **Pricing** section with 3 plans (Start, Scale, Team)
2. Click **Subscribe** on any plan
3. You'll be redirected to **Stripe Checkout** — enter test card details
4. After payment, you'll be redirected to create your account
5. Once signed up, you'll land in the **Chat** interface
6. Your plan and remaining messages appear in the **User Menu** (top-right)
7. Send messages to see your quota decrement; upgrade when you hit the limit

**Test card for Stripe (test mode):**

- Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any valid ZIP (e.g., `10001`)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project connection URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Project Settings → API → anon/public key | Public key for Supabase client (safe to expose) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard → Developers → API keys → Secret key | Secret key for Stripe server operations (never expose) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard → Developers → Webhooks → [your endpoint] → Signing secret | Verifies webhook requests are actually from Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard → Developers → API keys → Publishable key | Public key for Stripe.js (safe to expose) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your deployment URL | Used for Stripe redirect URLs after checkout |

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/route.ts  # Creates Stripe checkout sessions
│   │   │   │   ├── webhook/route.ts   # Handles Stripe webhook events
│   │   │   │   └── portal/route.ts    # Opens Stripe customer portal
│   │   │   └── billing/route.ts       # Fetches current plan & usage
│   │   ├── signup-with-plan/         # Account creation after Stripe checkout
│   │   │   └── page.tsx
│   │   ├── chat/                      # Chat interface (protected route)
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── chat/
│   │   │   └── ChatInterface.tsx      # Main chat component
│   │   ├── sections/
│   │   │   ├── Pricing.tsx            # Pricing section with 3 plans
│   │   │   ├── Hero.tsx               # Hero section
│   │   │   ├── Navbar.tsx             # Navigation with user menu
│   │   │   └── ...                    # Other landing page sections
│   │   └── ui/
│   │       ├── AnimatedCounter.tsx   # Animated number display
│   │       ├── LoadingButton.tsx      # Button with loading state
│   │       └── UserMenu.tsx           # User dropdown showing plan & quota
│   ├── lib/
│   │   └── stripe/
│   │       └── server.ts              # Stripe server utilities
│   ├── middleware.ts                  # Protects routes, handles auth
│   └── ...
├── .env.local                         # Your local environment variables
├── package.json
└── ...
```

**Key flow files:**

- `src/app/api/stripe/checkout/route.ts` — Creates a Stripe Checkout session when user selects a plan
- `src/app/api/stripe/webhook/route.ts` — Updates user's subscription in Supabase when Stripe confirms payment
- `src/app/signup-with-plan/page.tsx` — Account creation form after successful payment
- `src/components/sections/Pricing.tsx` — Displays the 3 subscription tiers
- `src/components/chat/ChatInterface.tsx` — Main chat; checks quota before sending messages
- `src/components/ui/UserMenu.tsx` — Shows current plan, messages used/remaining

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step deployment:

1. **Connect your repository**
   - Click the button above or go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select `my-app` as the project

2. **Add environment variables**
   - In Vercel dashboard, go to **Settings** → **Environment Variables**
   - Add all variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL, e.g., `https://my-app.vercel.app`)

3. **Update Stripe webhook URL**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/) → Developers → Webhooks
   - Add a new endpoint: `https://my-app.vercel.app/api/stripe/webhook`
   - Add events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in Vercel

4. **Deploy**
   - Click **Deploy** — Vercel will build and deploy automatically
   - Any push to `main` triggers a new deployment

> ⚠️ **Important**: Always use the same Stripe mode (test/live) in all environments. Test mode keys start with `sk_test_` and `pk_test_`.

## 📝 License

MIT