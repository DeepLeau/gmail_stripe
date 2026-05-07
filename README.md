# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Email Intelligence** — AI-powered email analysis and memory across conversations
- **Admin Newsletter** — Manage and send newsletters directly from the admin dashboard
- **Multi-Model AI** — Powered by OpenRouter supporting Anthropic, OpenAI, Google, and more
- **Analytics Integration** — PostHog for product analytics with GDPR-friendly EU hosting
- **Stripe Integration** — Seamless signup and subscription management via Stripe
- **Transactional Email** — Newsletter delivery and notifications via Resend

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
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Client-side API key (safe to expose) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | [PostHog](https://eu.posthog.com) > Project Settings > Project API Key | PostHog analytics key (EU host) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | Defaults to `https://eu.i.posthog.com` | PostHog server address (EU for GDPR compliance) |
| `RESEND_API_KEY` | Yes | [Resend API Keys](https://resend.com/api-keys) | API key for sending transactional emails |
| `RESEND_FROM_EMAIL` | Yes | Must be a verified domain in Resend | Sender email address for newsletters |

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings** (gear icon) > **API**
3. Copy the **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon/public key** under "Project API keys" → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### PostHog Setup

1. Sign up at [posthog.com](https://posthog.com)
2. Create a new project (EU hosting recommended for GDPR compliance)
3. Go to **Project Settings** > **Project API Key**
4. Copy the key starting with `phc_` → paste as `NEXT_PUBLIC_POSTHOG_KEY`
5. The host URL should already be `https://eu.i.posthog.com` for EU projects

### Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys) and create a new key with "Sending access" permissions
3. Copy the key starting with `re_` → paste as `RESEND_API_KEY`
4. To send emails from your own domain:
   - Go to [Domains](https://resend.com/domains) > **Add Domain**
   - Add the DNS records (SPF, DKIM, DMARC) shown by Resend
   - Wait for verification (can take up to 24-48 hours)
   - Set `RESEND_FROM_EMAIL` to any email on your verified domain (e.g., `hello@yourdomain.com`)

## 📁 Project Structure

- `src/lib/email` — Email utilities and newsletter helpers
- `src/app/api/admin/newsletter` — Admin newsletter API route
- `src/app/actions/admin/newsletter` — Server actions for newsletter management
- `src/components/admin` — Reusable admin components (NewsletterForm)
- `src/app/admin/newsletter` — Newsletter management page

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. **Import your repository** — Click "Import Git Repository" and select your GitHub/GitLab repo
2. **Configure project** — Vercel auto-detects Next.js, click "Deploy"
3. **Add Environment Variables** — Go to your project > Settings > Environment Variables and add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
4. **Redeploy** — After adding env vars, click "Redeploy" to apply them

> ⚠️ Make sure all environment variables are added in Vercel before deploying — the app won't work correctly without them.

## 📝 License

MIT