# Emind

Emind connects your inbox to an AI that reads, understands, and remembers your emails — so you can ask them questions in natural language, just like you would with an assistant.

## ✨ Features

- **Admin Newsletter** — Send newsletter campaigns directly from the admin dashboard
- **AI-Powered Email Intelligence** — AI-powered email analysis and memory across conversations
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

Copy the template from `.env.example` and fill in each value:

```bash
# ─────────────────────────────────────────
# SUPABASE SERVICE ROLE
# Clé qui bypass toute la RLS — utiliser uniquement côté serveur.
# Jamais préfixée NEXT_PUBLIC_ (exposerait les droits admin côté client).
# ─────────────────────────────────────────
SUPABASE_SERVICE_ROLE_KEY=

# ─────────────────────────────────────────
# ADMIN EMAILS
# Liste d'emails autorisés à accéder à l'espace /admin (séparés par des virgules).
# Exemple: admin@example.com, founder@myapp.com
# ─────────────────────────────────────────
ADMIN_EMAILS=admin@yourdomain.com

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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Project Settings > API > anon/public key | Public key for client-side operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard > Project Settings > API > service_role key | Server-side admin operations (never expose to client) |
| `ADMIN_EMAILS` | Yes | Set manually in `.env.local` | Comma-separated list of emails allowed to access `/admin` |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | PostHog Dashboard > Project Settings > API Keys | Your PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | Set manually — use `https://eu.i.posthog.com` for EU hosting | PostHog API host URL |
| `RESEND_API_KEY` | Yes | Resend Dashboard > API Keys > Create API Key | Your Resend API key for transactional emails |
| `RESEND_FROM_EMAIL` | Yes | Set manually — must be a verified domain in Resend | Sender email address for outgoing emails |

## 📁 Project Structure

- `src/app/admin` — Admin dashboard page with newsletter management
- `src/app/api/admin/newsletter` — API route for newsletter operations
- `src/components/admin` — Admin UI components (NewsletterForm)
- `src/lib/supabase` — Supabase client utilities (admin.ts for server-side operations)
- `.env.example` — Environment variables template

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. **Import your repository** — Click the button above or go to Vercel Dashboard > New Project > Import Git Repository
2. **Select your repo** — Choose the GitHub/GitLab repo containing your Emind code
3. **Add environment variables** — In the Vercel dashboard, go to Settings > Environment Variables and add every variable from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAILS`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
4. **Deploy** — Click Deploy and wait for Vercel to build your project
5. **Visit your app** — Once deployed, Vercel provides a URL like `your-app.vercel.app`

> ⚠️ **Important**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel's environment variables. This key bypasses Row Level Security and is required for admin operations — it must never be exposed to the client-side, which Vercel handles automatically since it starts with `SUPABASE_` (not `NEXT_PUBLIC_`).

## 📝 License

MIT