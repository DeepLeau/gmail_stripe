# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Newsletter Management** — Admin interface for composing and sending newsletters to subscribers
- **Email Intelligence** — AI-powered email analysis and memory across conversations
- **Multi-Model AI** — Powered by OpenRouter supporting Anthropic, OpenAI, Google, and more
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

Create a file named `.env.local` in the root of your project (same folder as `package.json`). This file stores sensitive configuration like API keys — it never gets committed to GitHub.

Copy the template from `.env.example` and fill in each value. Below is the complete list of all environment variables you need:

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
STRIPE_WEBHOOK_SECRET=whsec_YOUR
NEXT_PUBLIC_STRIPE_START_PRICE_ID=price_YOUR
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_YOUR
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_YOUR
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_START_PRICE_ID=price_YOUR
STRIPE_SCALE_PRICE_ID=price_YOUR
STRIPE_ENTERPRISE_PRICE_ID=price_YOUR
STRIPE_SECRET_KEY=sk_YOUR_SECRET_KEY

# POSTHOG ANALYTICS
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_KEY_HERE
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
NEXT_PUBLIC_POSTHOK_HOST=https://eu.i.posthog.com
NODE_ENV=development

# RESEND
RESEND_API_KEY=re_YOUR_API_KEY_HERE
RESEND_FROM_EMAIL=hello@yourdomain.com
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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Your Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard > Project Settings > API > service_role key | Your Supabase service role key (keep secret) |
| `OPENROUTER_API_KEY` | Yes | [OpenRouter Dashboard](https://openrouter.ai/keys) > Create Key | API key for AI model access |
| `NEXT_PUBLIC_APP_NAME` | Yes | Your choice | Display name for your app |
| `STRIPE_SECRET_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) > Secret key | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Webhooks > your endpoint > Signing secret | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) > Publishable key | Stripe publishable key |
| `STRIPE_START_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > API ID | Price ID for Start plan |
| `STRIPE_SCALE_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > API ID | Price ID for Scale plan |
| `STRIPE_ENTERPRISE_PRICE_ID` | Yes | Stripe Dashboard > Products > your product > API ID | Price ID for Enterprise plan |
| `NEXT_PUBLIC_STRIPE_START_PRICE_ID` | Yes | Same as above | Publishable Stripe price ID for Start plan |
| `NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID` | Yes | Same as above | Publishable Stripe price ID for Scale plan |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | Yes | Same as above | Publishable Stripe price ID for Enterprise plan |
| `RESEND_API_KEY` | Yes | [Resend Dashboard](https://resend.com/api-keys) > Create API Key | API key for sending transactional emails |
| `RESEND_FROM_EMAIL` | Yes | Your verified domain on [Resend](https://resend.com/domains) | Sender email address |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | [PostHog Dashboard](https://eu.posthog.com) > Project Settings > Project API Key | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Defaults to EU server | PostHog server URL (EU: `https://eu.i.posthog.com`, US: `https://us.i.posthog.com`) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your choice | Base URL for your application |
| `NODE_ENV` | No | Defaults to `development` | Environment mode |

## 📁 Project Structure

- `supabase/migrations` — Database migrations (Supabase schema setup)
- `src/app/admin/newsletter` — Admin panel for composing and sending newsletters
- `src/app/api/admin/newsletter` — API routes for newsletter sending
- `src` — App core including middleware for auth and route protection

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the **Deploy with Vercel** button above
2. Import your GitHub repository
3. Add all environment variables in Vercel > Settings > Environment Variables:
   - Copy every variable from your `.env.local` file
   - Mark each as a **Production** variable
   - For `STRIPE_WEBHOOK_SECRET`, mark it as a **Production** variable only (not Build)
4. Click **Deploy**

Vercel will automatically install dependencies and start your app at your deployed URL.

## 📝 License

MIT