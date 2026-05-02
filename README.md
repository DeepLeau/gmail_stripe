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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

> 💡 **VS Code tip**: open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > **Project URL** | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > **anon/public key** | Public key for client-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard > Project Settings > API > **service_role key** | Server-side admin key (keep secret!) |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) > Secret key | Stripe API secret key (never prefix with `NEXT_PUBLIC`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/webhooks) | Webhook signing secret (starts with `whsec_`) |
| `STRIPE_STARTER_PRICE_ID` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) | Price ID for the Starter plan |
| `STRIPE_GROWTH_PRICE_ID` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) | Price ID for the Growth plan |
| `STRIPE_PRO_PRICE_ID` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) | Price ID for the Pro plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) > **Publishable key** | Stripe publishable key (safe for client-side) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Set to `http://localhost:3000` locally | Your app's base URL for Stripe redirect URLs |

**How to find Supabase API keys:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Click **Project Settings** (gear icon)
4. Click **API** in the sidebar
5. Copy **Project URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public** key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Copy **service_role** key → use for `SUPABASE_SERVICE_ROLE_KEY`

## 📁 Project Structure

- `src/app` — Next.js App Router: pages, layouts, and server actions
- `src/app/api/stripe` — Stripe API routes (checkout session, webhook handler)
- `src/app/signup` — User signup page
- `src/app/chat` — AI chat interface page
- `src/components/chat` — Chat UI components (interface, input)
- `src/components/auth` — Authentication components (success view)
- `src/components/sections` — Page sections (pricing)
- `src/components/ui` — Reusable UI primitives (user menu)
- `src/lib` — Utility libraries (data fetching, Stripe configuration)

## 🚀 Deploy to Vercel

[![Deploy](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and click "Add New Project"
3. Import your repository
4. Add all environment variables in **Vercel > Settings > Environment Variables**:
   - Copy every variable from your `.env.local` file
5. Click **Deploy**

> ⚠️ **Important**: Make sure to add `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` — these are server-only and must not be exposed to the client bundle.

## 📝 License

MIT