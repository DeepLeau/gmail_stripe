# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Natural language search** — Ask questions about your emails in plain English
- **Smart email summaries** — Get instant summaries of any email thread
- **AI Chat Interface** — Clean, modern chat experience with usage meters and upgrade prompts
- **User Authentication** — Sign up and log in to access your personal chat
- **Subscription Plans** — Choose from Starter, Growth, and Pro tiers with Stripe integration
- **Stripe Checkout Integration** — Secure payment flow for subscription purchases
- **Webhook Handling** — Real-time subscription status updates via Stripe webhooks

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Auth & Database**: Supabase (SSR + Client)
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

- **VS Code**: Press `` Ctrl+` `` (Windows/Linux) or `` Cmd+` `` (Mac) — this opens the built-in terminal at the bottom of the window
- **Mac**: Open Spotlight (`` Cmd+Space ``), type "Terminal", press Enter
- **Windows**: Press `Win+R`, type "cmd", press Enter

### 2. Install dependencies

```bash
npm install
```

This will install all the packages listed in `package.json`.

### 3. Set up environment variables

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive settings that your app needs to connect to external services.

> **For no-code users**: A `.env.local` file is a hidden configuration file. In VS Code, simply create a new file named `.env.local` and paste the contents below. This file is never committed to Git (it's in `.gitignore`) so your secrets stay safe.

Copy the template from `.env.example` and fill in all values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Secret Key
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret
# Get from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
# Create products in: https://dashboard.stripe.com/products
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_PRO=price_...

# Supabase Service Role Key (server-side only)
# Get from: Supabase Dashboard > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `` Ctrl+` `` (or `` Cmd+` `` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard > Project Settings > API > anon/public key | Public key for client-side auth |
| `STRIPE_SECRET_KEY` | ✅ | [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys) | Secret key for server-side Stripe operations |
| `STRIPE_WEBHOOK_SECRET` | ✅ | [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks) | Signing secret to verify webhook authenticity |
| `STRIPE_PRICE_STARTER` | ✅ | Stripe Dashboard > Products > Starter product > Pricing | Price ID for Starter plan |
| `STRIPE_PRICE_GROWTH` | ✅ | Stripe Dashboard > Products > Growth product > Pricing | Price ID for Growth plan |
| `STRIPE_PRICE_PRO` | ✅ | Stripe Dashboard > Products > Pro product > Pricing | Price ID for Pro plan |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Dashboard > Settings > API > service_role key | Server-only key (never expose to client) |

### How to get your Supabase API keys

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click on your project
3. Go to **Settings** (gear icon) > **API**
4. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
5. Under "API Settings", copy the **anon public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy the **service_role** secret → paste as `SUPABASE_SERVICE_ROLE_KEY`

### How to get your Stripe Price IDs

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign in
2. Click **Products** in the left sidebar
3. Click **Add product** to create your Starter plan
4. Set price (e.g., €9/month), click **Add product**
5. Click on the created product > **Pricing** > copy the **Price ID** (starts with `price_`)
6. Repeat for Growth and Pro plans

## 📁 Project Structure

- `src/app` — Next.js App Router pages, API routes, and server actions
- `src/components` — React components (auth forms, chat interface, pricing section)
- `src/lib/stripe` — Stripe client configuration, utilities, and React hooks

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Step by step

1. **Push your code to GitHub** — if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/my-app.git
   git push -u origin main
   ```

2. **Import to Vercel** — Click the deploy button above or go to [vercel.com/new](https://vercel.com/new)

3. **Import your repository** — Select your GitHub repo from the list

4. **Add environment variables** — In the Vercel dashboard, go to:
   - **Settings** > **Environment Variables**
   - Add each variable from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_STARTER`
     - `STRIPE_PRICE_GROWTH`
     - `STRIPE_PRICE_PRO`
     - `SUPABASE_SERVICE_ROLE_KEY`

5. **Deploy** — Click **Deploy**. Vercel will build and deploy your app.

6. **Configure Stripe Webhook** — After deployment, update your Stripe webhook URL:
   - Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Update the endpoint URL to `https://your-domain.com/api/stripe/webhook`

## 📝 License

MIT