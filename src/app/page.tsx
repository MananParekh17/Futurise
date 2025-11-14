import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Testimonials } from '@/components/landing/testimonials';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
    </div>
  );
}
