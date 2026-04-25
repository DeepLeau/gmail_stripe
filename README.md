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
- **Simple Pricing Plans** — Start (10 messages/month), Scale (50 messages/month), Team (100 messages/month)
- **Usage Tracking** — See your current plan and remaining messages in the chat interface
- **Smart Upgrade Prompts** — Get a gentle nudge to upgrade when you hit your message limit

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
# Find these in: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Stripe — Webhook Secret (set up in Stripe Dashboard > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe — Price IDs (create products in Stripe Dashboard > Products)
STRIPE_START_PRICE_ID=price_start_plan_id
STRIPE_SCALE_PRICE_ID=price_scale_plan_id
STRIPE_TEAM_PRICE_ID=price_team_plan_id
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

### 5. Create your Stripe Products

Before using the pricing page, you need to create 3 products in Stripe:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) and log in
2. Click **Products** in the left sidebar
3. Click **Add product** for each plan:

| Plan | Name | Price | Interval | Features |
|------|------|-------|----------|----------|
| Start | Start Plan | $9.00 | Monthly | 10 messages/month |
| Scale | Scale Plan | $29.00 | Monthly | 50 messages/month |
| Team | Team Plan | $79.00 | Monthly | 100 messages/month |

4. For each product, copy the **Price ID** (starts with `price_`) and add it to your `.env.local`

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase > Project Settings > API > Project URL | Supabase project connection URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase > Project Settings > API > anon/public key | Public API key for Supabase |
| `STRIPE_SECRET_KEY` | Yes | Stripe > Developers > API keys > Secret key | Secret key for Stripe server-side operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe > Developers > API keys > Publishable key | Public key for Stripe client-side |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe > Developers > Webhooks > your endpoint | Validates incoming webhook events |
| `STRIPE_START_PRICE_ID` | Yes | Stripe > Products > your product > Price ID | Price ID for Start plan |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe > Products > your product > Price ID | Price ID for Scale plan |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe > Products > your product > Price ID | Price ID for Team plan |

**Supabase Setup:**
1. Go to [Supabase](https://supabase.com/) and create a project
2. Navigate to **Project Settings** (gear icon) > **API**
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Stripe Setup:**
1. Create a [Stripe account](https://stripe.com/)
2. Go to **Developers** > **API keys**
3. Copy the **Secret key** → `STRIPE_SECRET_KEY`
4. Copy the **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Go to **Developers** > **Webhooks** > **Add endpoint**
6. Enter `https://your-domain.com/api/webhooks/stripe` and select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
7. Copy the **Webhook secret** → `STRIPE_WEBHOOK_SECRET`

## 💳 How the Payment Flow Works

1. **User selects a plan** on the landing page pricing section
2. **User clicks "Subscribe"** — they are redirected to Stripe Checkout
3. **User pays on Stripe** — no account creation required at this step
4. **Stripe redirects back** to your app with a session ID
5. **User creates their account** — during signup, the system links the paid subscription to their new account
6. **User can chat** — they see their plan and remaining messages in the chat interface

When the user reaches their message limit, they'll see a friendly prompt suggesting they upgrade to a higher plan.

Message counts reset automatically each month when the subscription renews.

## 🧪 Running Tests

Unit tests check that the UI components work correctly — they verify that buttons, badges, and prompts display the right information for different user states.

```bash
# Run all tests
npx jest

# Run a specific test file
npx jest __tests__/PlanBadge.test.tsx
npx jest __tests__/SignupPrompt.test.tsx

# Watch mode (re-runs tests automatically when files change)
npx jest --watch
```

**Reading the output:**
- `PASS` — All tests passed, everything works correctly
- `FAIL` — Something is broken, the output shows which test failed and why

The test suite covers:
- `PlanBadge.test.tsx` — Pricing plan display component
- `SignupPrompt.test.tsx` — Signup call-to-action component

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions and helpers
│   └── styles/           # Global styles
├── __tests__/            # Jest unit tests
├── public/               # Static assets
├── .env.local            # Environment variables (create this)
└── package.json          # Dependencies and scripts
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step deployment:

1. **Push your code to GitHub** (if you haven't already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-app.git
   git push -u origin main
   ```

2. **Go to [Vercel](https://vercel.com/)** and click "New Project"

3. **Import your GitHub repository** — select `my-app` from the list

4. **Add your environment variables** — click "Environment Variables" and add each variable from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`

5. **Click "Deploy"** — Vercel will build and deploy your app

6. **Set up your Stripe webhook** — update your Stripe webhook endpoint to use your new Vercel URL (e.g., `https://your-app.vercel.app/api/webhooks/stripe`)

## 📝 License

MIT License — feel free to use, modify, and distribute this project.