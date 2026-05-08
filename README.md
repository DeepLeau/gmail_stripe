# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Email Intelligence** — AI-powered email analysis and memory across conversations
- **Multi-Model AI** — Powered by OpenRouter supporting Anthropic, OpenAI, Google, and more
- **Newsletter Management** — Admin dashboard to compose and send newsletters to your users
- **Analytics Integration** — PostHog for product analytics with GDPR-friendly EU hosting
- **Stripe Integration** — Seamless signup and subscription management via Stripe
- **Transactional Email** — Welcome emails and notifications via Resend

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase
- **Payments**: Stripe (subscriptions)
- **AI Integration**: OpenRouter API
- **Analytics**: PostHog
- **Email**: Resend
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A code editor** — We recommend [VS Code](https://code.visualstudio.com/) (it's free!)
- **Git** — [Install here](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME
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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive configuration like API keys — **it never gets committed to GitHub**.

Copy the template from `.env.example` and fill in each value:

```bash
# Website URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=YourAppName

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OPENROUTER
OPENROUTER_API_KEY=sk_YOUR_API_KEY_HERE

# STRIPE
STRIPE_SECRET_KEY=sk_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_YOUR_PUBLISHABLE_KEY_HERE
NEXT_PUBLIC_STRIPE_START_PRICE_ID=price_YOUR
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_YOUR
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_YOUR
STRIPE_START_PRICE_ID=price_YOUR
STRIPE_SCALE_PRICE_ID=price_YOUR
STRIPE_ENTERPRISE_PRICE_ID=price_YOUR

# POSTHOG ANALYTICS
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_KEY_HERE
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# RESEND EMAIL
RESEND_API_KEY=re_YOUR_API_KEY_HERE
RESEND_FROM_EMAIL=hello@yourdomain.com

# ADMIN
ADMIN_EMAILS=admin@emmind.ai,another-admin@emmind.ai
```

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → anon/public key | Supabase anonymous key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard → Project Settings → API → service_role key | Server-side only key — never expose |
| `OPENROUTER_API_KEY` | Yes | [OpenRouter Dashboard](https://openrouter.ai/keys) → Create API Key | Access key for AI models |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | Server-side Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard → Webhooks → Your endpoint | Validates incoming webhook events |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | Client-safe Stripe key (pk_...) |
| `NEXT_PUBLIC_STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard → Products | Price ID for "Start" plan |
| `NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard → Products | Price ID for "Scale" plan |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | Yes | Stripe Dashboard → Products | Price ID for "Enterprise" plan |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | [PostHog Dashboard](https://eu.posthog.com) → Project Settings → Project API Key | Analytics project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog dashboard URL | EU host: `https://eu.i.posthog.com` |
| `RESEND_API_KEY` | Yes | [Resend API Keys](https://resend.com/api-keys) → Create key | Email delivery API key |
| `RESEND_FROM_EMAIL` | Yes | Your verified domain in [Resend Domains](https://resend.com/domains) | Sender email address |
| `ADMIN_EMAILS` | Yes | You decide | Comma-separated list of admin emails |
| `NEXT_PUBLIC_APP_NAME` | No | You decide | Your app name for display |
| `NEXT_PUBLIC_BASE_URL` | No | Default: `http://localhost:3000` | Production website URL |

## 📁 Project Structure

- `src/lib/email` — Email utilities (newsletter sending via Resend)
- `src/app/api/admin/newsletter/send` — API route for sending newsletters
- `src/app/admin/newsletter` — Admin newsletter management page
- `src/components/admin` — Admin UI components (NewsletterForm)
- `src/middleware.ts` — Request middleware (auth, rate limiting)

## 🚀 Deploy to Vercel

[![Deploy](https://vercel.com/button)](https://vercel.com/new)

### Step by step

1. **Connect your GitHub repo**: Click "New Project" on Vercel → Select your repository
2. **Add environment variables**: Go to your project → Settings → Environment Variables → Add each variable from `.env.example`
   > ⚠️ Important: Add ALL variables from `.env.local` — Stripe keys, Supabase keys, Resend key, etc.
3. **Deploy**: Click "Deploy" — Vercel will automatically detect Next.js and run `npm run build`
4. **Set production URLs**: Update `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_APP_URL` to your production domain

Your app will be live at `https://your-project.vercel.app`

## 📝 License

MIT