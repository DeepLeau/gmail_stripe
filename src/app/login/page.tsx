'use client'

import { useState, type FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

type FormState = 'idle' | 'loading' | 'error'

interface FieldErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const validateFields = (): boolean => {
    const errors: FieldErrors = {}

    if (!email.trim()) {
      errors.email = "L'adresse email est requise"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Adresse email invalide'
    }

    if (!password) {
      errors.password = 'Le mot de passe est requis'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateFields()) return

    const supabase = createClient()
    if (!supabase) {
      setFieldErrors({ general: 'Configuration Supabase manquante. Vérifiez les variables d\'environnement.' })
      setFormState('error')
      return
    }

    setFormState('loading')
    setFieldErrors({})

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setFieldErrors({ general: error.message })
        setFormState('error')
        return
      }

      router.push('/chat')
      router.refresh()
    } catch {
      setFieldErrors({ general: 'Une erreur inattendue est survenue' })
      setFormState('error')
    }
  }

  return (
    <AuthCard
      title="Se connecter"
      subtitle="Bienvenue ! Renseigne tes identifiants pour accéder à Emind."
      footer={
        <p className="text-sm text-[var(--text-2)]">
          Pas encore de compte ?{' '}
          <Link
            href="/signup"
            className="font-medium text-[var(--accent)] hover:text-[var(--accent-hi)] transition-colors duration-150"
          >
            Créer un compte
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formState === 'error' && fieldErrors.general && (
          <div className="px-3 py-2.5 rounded-lg bg-[var(--red)]/8 border border-[var(--red)]/20">
            <p className="text-xs text-[var(--red)] leading-relaxed">
              {fieldErrors.general}
            </p>
          </div>
        )}

        <AuthInput
          label="Email"
          type="email"
          placeholder="marie@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={formState === 'loading'}
          error={fieldErrors.email}
        />

        <AuthInput
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={formState === 'loading'}
          error={fieldErrors.password}
        />

        <AuthButton
          type="submit"
          loading={formState === 'loading'}
          className="mt-1 w-full"
        >
          Se connecter
        </AuthButton>
      </form>
    </AuthCard>
  )
}
