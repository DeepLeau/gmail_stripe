import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { Hero } from '@/components/sections/Hero'
import { QuestionExamples } from '@/components/sections/QuestionExamples'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Features } from '@/components/sections/Features'
import { TrustSecurity } from '@/components/sections/TrustSecurity'
import { Pricing } from '@/components/sections/Pricing'
import { FinalCTA } from '@/components/sections/FinalCTA'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <QuestionExamples />
      <HowItWorks />
      <Features />
      <TrustSecurity />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  )
}
