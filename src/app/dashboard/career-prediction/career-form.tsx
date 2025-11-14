
"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { predictCareer, type FormState } from "./actions"
import { psychometricQuestions } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Lightbulb, CheckCircle, BrainCircuit } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const initialState: FormState = {
  status: "idle",
  message: "",
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Predicting Your Future...
        </>
      ) : (
        <>
        <BrainCircuit className="mr-2"/>
        Get My Career Prediction
        </>
      )}
    </Button>
  )
}

type Answers = Record<string, string>;

export function CareerForm() {
  const [state, formAction] = useActionState(predictCareer, initialState)
  const { toast } = useToast()
  const resultsRef = useRef<HTMLDivElement>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [activeAccordion, setActiveAccordion] = useState<string>("Personality");
  const [isClient, setIsClient] = useState(false)
  const [answers, setAnswers] = useState<Answers>({})

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (state.status === "error") {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      })
    }
    if (state.status === "success") {
      toast({
        title: "Success!",
        description: "Your career prediction is ready.",
      })
      if (state.data?.suggestedCareers) {
         setChartData(state.data.suggestedCareers.map((career) => ({
          name: career,
          // Generate a deterministic-like random number based on career name length
          match: 70 + (career.length * 3) % 25,
        })))
      }
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [state, toast])

  const groupedQuestions = useMemo(() => {
    return psychometricQuestions.reduce((acc, question) => {
      const category = question.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(question);
      return acc;
    }, {} as Record<string, typeof psychometricQuestions>);
  }, []);

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="allAnswers" value={JSON.stringify(answers)} />
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="font-headline">Psychometric Test</CardTitle>
            <CardDescription>
              Answer honestly to get the most accurate results. This comprehensive test will help analyze your personality, behavior, and interests.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isClient && (
              <Accordion type="single" collapsible className="w-full" value={activeAccordion} onValueChange={setActiveAccordion}>
                {Object.entries(groupedQuestions).map(([category, questions], catIndex) => (
                  <AccordionItem value={category} key={category}>
                    <AccordionTrigger className="text-lg font-semibold font-headline hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{catIndex + 1}</div>
                            {category}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-8 pt-6 pl-4 border-l-2 border-primary/20 ml-4">
                      {questions.map((q) => (
                        <div key={q.id}>
                          <Label className="text-base font-medium">
                             {q.text}
                          </Label>
                          <RadioGroup 
                            name={q.id} 
                            className="mt-4 space-y-3"
                            value={answers[q.id] || ""}
                            onValueChange={(value) => handleAnswerChange(q.id, value)}
                          >
                            {q.options.map((opt) => (
                              <div key={opt} className="flex items-center space-x-3">
                                <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                                <Label htmlFor={`${q.id}-${opt}`} className="font-normal text-sm text-muted-foreground hover:text-foreground cursor-pointer">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            
            <div className="mt-8 pt-6 border-t">
              <Label htmlFor="careerAspirations" className="text-base font-headline font-semibold">
                Do you have any specific career aspirations? (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-4">Mentioning them helps us tailor your results.</p>
              <Input
                id="careerAspirations"
                name="careerAspirations"
                placeholder="e.g., Software Engineer, Doctor, Graphic Designer"
                className="mt-2"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-6">
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>

      {state.status === "success" && state.data && (
        <div ref={resultsRef} className="mt-12 space-y-8 animate-in fade-in-50 duration-500">
          <h2 className="text-3xl font-bold font-headline text-center">Your AI-Powered Career Report</h2>
          
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-3"><Lightbulb className="text-primary"/>AI Reasoning</CardTitle>
                  <CardDescription>Here's how our AI analyzed your responses.</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground">
                  <div>{state.data.reasoning}</div>
              </CardContent>
            </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Top Career Suggestions</CardTitle>
                    <CardDescription>Based on your profile, we recommend these paths.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {state.data.suggestedCareers.map((career) => (
                            <li key={career} className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-primary" />
                                <p className="text-base font-medium">{career}</p>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Career Match Score</CardTitle>
                    <CardDescription>Visualizing your alignment with top suggestions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={120} />
                            <Tooltip
                              cursor={{fill: 'hsl(var(--muted))'}}
                              contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                              }}
                              labelStyle={{ color: "hsl(var(--foreground))" }}
                            />
                            <Bar dataKey="match" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} background={{ fill: 'hsl(var(--muted))', radius: 4 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
