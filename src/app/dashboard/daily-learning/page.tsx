import { BookOpen } from "lucide-react"
import { LearningPlan } from "./learning-plan"

export default function DailyLearningPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold font-headline">Daily Learning Assistant</h1>
            <p className="text-muted-foreground">Your personalized feed of courses, articles, and videos based on your skill gaps.</p>
        </div>
      </div>
      <LearningPlan />
    </div>
  )
}
