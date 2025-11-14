import { FileText, Lightbulb, TrendingUp, Award } from "lucide-react";

const steps = [
  {
    icon: <FileText className="w-10 h-10 text-primary" />,
    title: "Take the Test",
    description: "Start with our comprehensive psychometric test to discover your strengths and interests.",
  },
  {
    icon: <Lightbulb className="w-10 h-10 text-primary" />,
    title: "Get AI Insights",
    description: "Receive personalized career paths and skill recommendations from our AI mentor.",
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-primary" />,
    title: "Learn & Grow",
    description: "Engage with daily learning content and track your progress with streaks.",
  },
  {
    icon: <Award className="w-10 h-10 text-primary" />,
    title: "Achieve Your Goals",
    description: "Build your skills, connect with the community, and land your dream career.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-secondary">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">Your Journey to Career Clarity</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple, guided process to unlock your potential.
          </p>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="flex items-center justify-center bg-background rounded-full p-4 border-2 border-primary mb-4 z-10">
                    {step.icon}
                </div>
                <h3 className="font-headline text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
