# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe integration

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase Authentication
- **Payments**: Stripe (checkout, webhooks, subscription management)

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

Copy the contents from `.env.example` and fill in all the values. Here's what each variable means and where to find it:

**Supabase (Authentication & Database)**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** → **API**
4. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon/public key** under "Project API keys" → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Stripe (Payments)**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API keys**
3. Copy the **Secret key** (starts with `sk_`) → paste as `STRIPE_SECRET_KEY`
4. Copy the **Publishable key** (starts with `pk_`) → paste as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Stripe Webhook Secret**

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe` (or `http://localhost:3000/api/webhooks/stripe` for local dev)
4. Select these events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) → paste as `STRIPE_WEBHOOK_SECRET`

**Stripe Price IDs**

1. Go to [Stripe Products](https://dashboard.stripe.com/products)
2. Click **Add product**
3. Create a monthly **Starter** product at €9:
   - Name: "Starter"
   - Pricing model: "Standard pricing"
   - Amount: €9.00
   - Billing period: Monthly
4. Click **Save product**, then click on the pricing tier and copy the **Price ID** (starts with `price_`) → paste as `STRIPE_STARTER_PRICE_ID`
5. Repeat for **Growth** at €29 → paste as `STRIPE_GROWTH_PRICE_ID`
6. Repeat for **Pro** at €79 → paste as `STRIPE_PRO_PRICE_ID`

**Base URL**

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

For local development, use `http://localhost:3000`. For production, use your Vercel deployment URL (e.g., `https://your-app.vercel.app`).

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Project Settings → API → anon key | Public API key for client-side auth |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Dashboard → Project Settings → API → service role key | Server-side only key (never expose to client) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard → Developers → API keys → Secret key | Stripe secret key for server-side operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Dashboard → Developers → API keys → Publishable key | Stripe key for client-side Stripe.js |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard → Webhooks → your endpoint → Signing secret | Verifies incoming webhook requests |
| `STRIPE_STARTER_PRICE_ID` | ✅ | Stripe Dashboard → Products → Starter product → Pricing | Price ID for the €9/month Starter plan |
| `STRIPE_GROWTH_PRICE_ID` | ✅ | Stripe Dashboard → Products → Growth product → Pricing | Price ID for the €29/month Growth plan |
| `STRIPE_PRO_PRICE_ID` | ✅ | Stripe Dashboard → Products → Pro product → Pricing | Price ID for the €79/month Pro plan |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Set manually | Your app's URL (http://localhost:3000 for dev) |

## 📁 Project Structure

Only folders containing actual files are listed below:

- `src/app/api/checkout` — Stripe checkout session endpoint
- `src/app/api/webhooks/stripe` — Stripe webhook handler
- `src/components/auth` — User signup and authentication components
- `src/components/chat` — AI chat interface components
- `src/components/sections` — Landing page sections (pricing)
- `src/lib` — Stripe utility functions and configuration

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step:

1. **Import your repository**
   - Click the "Deploy with Vercel" button above, OR
   - Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo

2. **Add environment variables**
   - In the Vercel dashboard, go to **Settings** → **Environment Variables**
   - Add **all** variables from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_STARTER_PRICE_ID`
     - `STRIPE_GROWTH_PRICE_ID`
     - `STRIPE_PRO_PRICE_ID`
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

3. **Deploy**
   - Click **Deploy** — Vercel will automatically detect Next.js and build your app

4. **Update Stripe webhook**
   - After deployment, go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - Add a new endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select the same events as before
   - Copy the new signing secret to Vercel's environment variables

## 📝 License

MIT