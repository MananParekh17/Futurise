import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Target, BookOpen, TestTube, TrendingUp, Users, Award } from "lucide-react";

const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: "Career Prediction",
    description: "Take our psychometric test to get AI-powered career recommendations.",
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Skill Gap Analyzer",
    description: "Identify the skills you need for your dream career and get a clear roadmap.",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "Daily Learning",
    description: "Receive personalized content suggestions to stay ahead in your field.",
  },
  {
    icon: <TestTube className="w-8 h-8 text-primary" />,
    title: "Knowledge Tests",
    description: "Test your understanding with quizzes and track your learning progress.",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
    title: "Streak Counter",
    description: "Build a consistent learning habit by maintaining your daily streak.",
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Community Support",
    description: "Connect with peers, mentors, and experts in our community chat.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">A Future-Proof Career Starts Here</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to confidently choose and pursue a career path that's right for you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6 transition-transform transform hover:-translate-y-2">
              <CardHeader className="p-0">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                    {feature.icon}
                </div>
                <CardTitle className="font-headline">{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription className="mt-2">
                {feature.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
