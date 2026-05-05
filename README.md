# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language email search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience to interact with your email data
- **User Authentication** — Sign up and log in to access your personal email assistant
- **Subscription Plans** — Choose from Starter, Scale, and Team tiers powered by Stripe

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase
- **Payments**: Stripe (checkout, webhooks, subscription management)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)

### 1. Clone the repository

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

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services.

Copy the template from `.env.example` and fill in all values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_START_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Public key for Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard → Project Settings → API → service_role key | Server-side Supabase key (keep secret!) |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys) | Secret API key (starts with `sk_`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys) | Public key for Stripe.js (starts with `pk_`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) | Webhook signing secret (starts with `whsec_`) |
| `STRIPE_START_PRICE_ID` | Yes | [Stripe Dashboard → Products](https://dashboard.stripe.com/products) | Price ID for Starter plan (format: `price_xxx`) |
| `STRIPE_SCALE_PRICE_ID` | Yes | [Stripe Dashboard → Products](https://dashboard.stripe.com/products) | Price ID for Scale plan (format: `price_xxx`) |
| `STRIPE_TEAM_PRICE_ID` | Yes | [Stripe Dashboard → Products](https://dashboard.stripe.com/products) | Price ID for Team plan (format: `price_xxx`) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Local dev: `http://localhost:3000` / Production: your domain | Base URL for your app |

**How to find Supabase keys:**

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Scroll to **API**
5. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ this is sensitive — never expose publicly)

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/components` — React components organized by feature (auth, chat, sections, UI)
- `src/components/auth` — Authentication form components
- `src/components/chat` — Chat interface components
- `src/components/sections` — Landing page sections (CTA, pricing)
- `src/components/ui` — Reusable UI components
- `src/lib` — Utility libraries and data
- `src/lib/stripe` — Stripe client, config, and hooks
- `src/lib/stripe/hooks` — Custom React hooks for Stripe integration

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Connect your repository**
   - Click the "Deploy with Vercel" button above
   - Or go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository

2. **Add environment variables**
   - In the Vercel dashboard, go to **Settings → Environment Variables**
   - Add all the variables from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_START_PRICE_ID`
     - `STRIPE_SCALE_PRICE_ID`
     - `STRIPE_TEAM_PRICE_ID`
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

3. **Deploy**
   - Vercel will automatically build and deploy your app
   - Your app will be available at `https://your-app.vercel.app`

4. **Configure Stripe Webhook** (for production)
   - Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook secret to Vercel environment variables

## 📝 License

MIT