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

> 💡 **What is a `.env.local` file?** It's a configuration file where you store secrets (API keys, passwords, etc.) that your app needs to work. Unlike regular code files, this file is excluded from Git so your secrets stay private.

Copy all variables from `.env.example` and fill in each value. Here's a detailed guide for each service:

### 4. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **VS Code tip**: Open the integrated terminal with `Ctrl+`` (or `Cmd+`` on Mac)

## 🔑 Environment Variables

| Variable | Required | Where to find it | Description |
|----------|----------|------------------|-------------|
| `NEXT_PUBLIC_BASE_URL` | Yes | Always `http://localhost:3000` for local dev | Your website URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Always `http://localhost:3000` for local dev | App URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API → Project URL | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API → `anon` key | Public Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API → `service_role` key | Server-side Supabase key (keep secret!) |
| `OPENROUTER_API_KEY` | Yes | [OpenRouter](https://openrouter.ai/keys) → Create Key | API key for AI models |
| `NEXT_PUBLIC_APP_NAME` | Yes | Your app name (e.g., "Emind") | Public app name |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → add endpoint → copy signing secret | Webhook verification secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Publishable key | Stripe public key |
| `NEXT_PUBLIC_STRIPE_START_PRICE_ID` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) → copy Price ID | Stripe price ID for Start plan |
| `NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) → copy Price ID | Stripe price ID for Scale plan |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) → copy Price ID | Stripe price ID for Enterprise plan |
| `STRIPE_START_PRICE_ID` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) → copy Price ID | Server-side Start price ID |
| `STRIPE_SCALE_PRICE_ID` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) → copy Price ID | Server-side Scale price ID |
| `STRIPE_ENTERPRISE_PRICE_ID` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/products) → copy Price ID | Server-side Enterprise price ID |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | [PostHog](https://eu.posthog.com/project/settings) → Project Settings → Project API Key | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | Always `https://eu.i.posthog.com` (EU hosting, GDPR-friendly) | PostHog API host |
| `RESEND_API_KEY` | Yes | [Resend](https://resend.com/api-keys) → Create API Key | Resend API key for transactional emails |
| `RESEND_FROM_EMAIL` | Yes | Your verified domain on [Resend](https://resend.com/domains) | Sender email address |
| `ADMIN_EMAILS` | Yes | List of admin email addresses separated by commas | Admins allowed to access admin dashboard |
| `NODE_ENV` | Yes | Always `development` for local dev | Node environment |

**Supabase steps in detail:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (or select existing)
3. Go to **Project Settings** (gear icon) → **API**
4. Find **Project URL** → copy to `NEXT_PUBLIC_SUPABASE_URL`
5. Find **anon public** key → copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Find **service_role secret** key → copy to `SUPABASE_SERVICE_ROLE_KEY`

**Stripe steps in detail:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create an account or sign in
3. Go to **Developers** → **API keys** → copy Secret key and Publishable key
4. Go to **Developers** → **Webhooks** → add endpoint URL → copy signing secret
5. Go to **Products** → create 3 products (Start, Scale, Enterprise) → copy each Price ID

**Resend steps in detail:**
1. Go to [resend.com](https://resend.com) → sign up
2. Go to [API Keys](https://resend.com/api-keys) → create a key with "Sending access"
3. Go to [Domains](https://resend.com/domains) → Add Domain → add DNS records (SPF, DKIM, DMARC)
4. Wait for domain verification → copy your verified email to `RESEND_FROM_EMAIL`

> ⚠️ **Important**: Without a verified domain on Resend, emails only go to the Resend account owner and only from `onboarding@resend.dev`.

## 📁 Project Structure

- `src/components/ui` — Reusable UI components (Navbar, navigation menu, CTAs)

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Step by step:**

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings** → **Environment Variables**
4. Add all variables from your `.env.local` file (one by one or paste them)
5. Click **Deploy**

> ⚠️ **Don't forget**: You must add ALL environment variables in Vercel, otherwise your app won't work properly. The most common deployment issue is missing environment variables.

## 📝 License

MIT