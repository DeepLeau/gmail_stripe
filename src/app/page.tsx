import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { FeatureStrip } from '@/components/sections/FeatureStrip'
import { Features } from '@/components/sections/Features'
import { Workflow } from '@/components/sections/Workflow'
import { Pricing } from '@/components/sections/Pricing'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTA } from '@/components/sections/FinalCTA'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeatureStrip />
      <Features />
      <Workflow />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
