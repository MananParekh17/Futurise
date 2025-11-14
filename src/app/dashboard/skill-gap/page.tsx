import { Target } from "lucide-react"
import { SkillGapForm } from "./skill-gap-form"

export default function SkillGapPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold font-headline">Skill Gap Analyzer</h1>
            <p className="text-muted-foreground">Analyze your current skillset against your desired career path and get a plan to fill the gaps.</p>
        </div>
      </div>
      <SkillGapForm />
    </div>
  )
}
