# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Newsletter Management** — Admin interface to compose and send newsletters to subscribers
- **Transactional Email** — Email delivery via Resend with DKIM/SPF authentication support
- **Analytics Integration** — PostHog for product analytics with GDPR-friendly EU hosting
- **Stripe Integration** — Seamless signup and subscription management via Stripe

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase
- **Payments**: Stripe (subscriptions)
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

Copy the template from `.env.example` and fill in each value:

```bash
# ─────────────────────────────────────────
# SUPABASE
# ─────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# ─────────────────────────────────────────
# POSTHOG ANALYTICS
# ─────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_KEY_HERE
NEXT_PUBLIC_POSTHOK_HOST=https://eu.i.posthog.com

# ─────────────────────────────────────────
# RESEND — Transactional Email
# ─────────────────────────────────────────
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public API key for client-side requests |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | [PostHog Dashboard](https://eu.posthog.com) > Project Settings > Project API Key | PostHog project API key (EU region) |
| `NEXT_PUBLIC_POSTHOK_HOST` | Yes | Leave as `https://eu.i.posthog.com` for EU hosting | PostHog proxy host |
| `RESEND_API_KEY` | Yes | [Resend API Keys](https://resend.com/api-keys) > Create key with "Sending access" permission | API key for sending emails |
| `RESEND_FROM_EMAIL` | Yes | Must be a verified domain in [Resend Domains](https://resend.com/domains) (or `onboarding@resend.dev` for dev) | Sender email address |

**Supabase Setup:**
1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to **Project Settings > API**
3. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon/public** key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 Project Structure

- `src/app` — Next.js App Router pages, layouts, and API routes
- `src/app/admin` — Admin dashboard pages (layout + newsletter management)
- `src/app/api/admin/newsletter/send` — API endpoint for sending newsletters
- `src/components/admin` — Admin UI components (NewsletterForm)
- `src/lib/email` — Email utility functions (newsletter sending via Resend)
- `src/middleware.ts` — Next.js middleware for request handling

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. In the Vercel dashboard, go to **Settings > Environment Variables**
4. Add all variables from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOK_HOST`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
5. Click **Deploy** — Vercel will automatically build and deploy your app

## 📝 License

MIT