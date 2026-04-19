import { Navbar } from '@/components/sections/Navbar'
import { Hero } from '@/components/sections/Hero'
import { ProofStrip } from '@/components/sections/ProofStrip'
import { Problem } from '@/components/sections/Problem'
import { ProductFeature } from '@/components/sections/ProductFeature'
import { Workflow } from '@/components/sections/Workflow'
import { Integrations } from '@/components/sections/Integrations'
import { Pricing } from '@/components/sections/Pricing'
import { Testimonials } from '@/components/sections/Testimonials'
import { DemoCta } from '@/components/sections/DemoCta'
import { Footer } from '@/components/sections/Footer'
import { Ticker } from '@/components/sections/Ticker'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProofStrip />
      <Problem />
      <ProductFeature />
      <Workflow />
      <Integrations />
      <Pricing />
      <Testimonials />
      <DemoCta />
      <Footer />
      <Ticker />
    </main>
  )
}
