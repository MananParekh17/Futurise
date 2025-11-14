import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://picsum.photos/1200/800"
          alt="Futuristic globe"
          data-ai-hint="futuristic globe AI"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-primary/30 dark:bg-primary/10 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
        <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight drop-shadow-2xl bg-gradient-to-b from-white to-gray-300 dark:to-gray-400 text-transparent bg-clip-text">
          Navigate Your Career with Futurise
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-3xl text-primary-foreground/90 drop-shadow-lg">
          Your personal AI mentor for career prediction, skill-gap analysis, and daily learning. Make smarter career choices with data-driven insights.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild className="text-base">
            <Link href="/login">
              Get Started For Free <ArrowRight className="ml-2"/>
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild className="text-base">
            <Link href="#how-it-works">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
