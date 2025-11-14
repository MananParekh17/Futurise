import { CareerForm } from "./career-form"
import { BrainCircuit } from "lucide-react"

export default function CareerPredictionPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <BrainCircuit className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold font-headline">AI Career Prediction</h1>
            <p className="text-muted-foreground">Answer these questions to discover career paths tailored to you.</p>
        </div>
      </div>
      <CareerForm />
    </div>
  )
}
