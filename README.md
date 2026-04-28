# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **Contact insights** — Identify key contacts by topic or project
- **Question history** — Review all your past questions and answers
- **Secure data handling** — Encrypted storage, no data resale, revocable access
- **AI Chat Interface** — Clean, modern chat experience at `/chat` with typing indicators and auto-scroll
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Management** — Three pricing tiers (Start, Scale, Team) powered by Stripe

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication
- **Payments**: Stripe (Checkout, Webhooks, Subscription Management)

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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services like Supabase and Stripe.

Copy the template from `.env.example` and fill in your values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe — Payment Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
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
2. For `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: go to **Developers** > **API keys** — copy the secret key (sk_test_...) and publishable key (pk_test_...)
3. For price IDs: go to **Products** > create products for Start, Scale, and Team plans > copy the Price IDs (price_...)
4. For `STRIPE_WEBHOOK_SECRET`: go to **Developers** > **Webhooks** > **Add endpoint** — enter your URL (e.g., `http://localhost:3000/api/stripe/webhook`) and select events to listen for, then copy the signing secret

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

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase > Project Settings > API > anon/public key | Public key for Supabase client |
| `STRIPE_SECRET_KEY` | Yes | Stripe > Developers > API keys > Secret key | Backend Stripe API key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe > Developers > Webhooks > your endpoint > Signing secret | Validates incoming webhook events |
| `STRIPE_START_PRICE_ID` | Yes | Stripe > Products > your Start product > Price ID | Price ID for the Start plan |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe > Products > your Scale product > Price ID | Price ID for the Scale plan |
| `STRIPE_TEAM_PRICE_ID` | Yes | Stripe > Products > your Team product > Price ID | Price ID for the Team plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe > Developers > API keys > Publishable key | Frontend Stripe key (pk_test_...) |
| `NEXT_PUBLIC_APP_URL` | Yes | Set manually | Base URL of your app (http://localhost:3000 for dev) |

## 🧪 Running Tests

Unit tests help verify that individual pieces of your code work correctly. Jest is configured and ready — when you add test files, you can run them with the commands below.

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

**Reading the output:**

- `PASS` — all tests in that file passed ✅
- `FAIL` — something broke ❌ — the output will show which test failed and why
- `Tests: 2 passed, 1 failed` — summary shows passed vs. total

Currently no test files exist in the project. To add tests, create files with the `.test.ts` or `.test.tsx` extension in the same directory as the code you're testing.

## 📁 Project Structure

Only folders containing files from this project are listed below:

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/app/api` — API routes for Stripe webhooks, checkout, and subscription management
- `src/app/chat` — Chat page at `/chat`
- `src/app/actions` — Server actions for subscription management
- `src/components` — React components
- `src/components/sections` — Landing page section components (Pricing)
- `src/components/chat` — Chat interface components
- `src/lib` — Utility libraries
- `src/lib/stripe` — Stripe client configuration and helpers

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step-by-step deployment:

1. **Connect your repository** — Click the button above, then select "Import Git Repository" and choose your GitHub repo

2. **Add environment variables** — In the Vercel dashboard, go to your project > **Settings** > **Environment Variables** and add all variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_START_PRICE_ID`
   - `STRIPE_SCALE_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

3. **Deploy** — Vercel will automatically build and deploy your app

4. **Configure Stripe webhooks** — Add your Vercel deployment URL as a new webhook endpoint in Stripe Dashboard (e.g., `https://your-app.vercel.app/api/stripe/webhook`)

## 📝 License

MIT