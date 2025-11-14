
"use client"

import * as React from "react"
import { useActionState, useEffect, useRef, useState, useMemo } from "react"
import { useFormStatus } from "react-dom"
import { analyzeSkills, type FormState } from "./actions"
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
import { useToast } from "@/hooks/use-toast"
import { Loader2, Zap, Trophy, ClipboardCheck, ArrowRight, BookOpen, ChevronsUpDown, Check } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { careerData } from "@/lib/career-data"
import { MultiSelect } from "@/components/ui/multi-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useUser } from "@/firebase"
import { Skeleton } from "@/components/ui/skeleton"


const initialFormState: FormState = {
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
          Analyzing...
        </>
      ) : (
        <>
        <Zap className="mr-2"/>
        Analyze My Skills
        </>
      )}
    </Button>
  )
}

export function SkillGapForm() {
  const [state, formAction] = useActionState(analyzeSkills, initialFormState)
  const { toast } = useToast()
  const resultsRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()
  
  const [openRole, setOpenRole] = React.useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("")

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedSkills = localStorage.getItem("userSkills")
      const savedRole = localStorage.getItem("desiredRole")
      if (savedSkills) {
        setSelectedSkills(JSON.parse(savedSkills))
      }
      if (savedRole) {
        setSelectedRole(savedRole)
      }
    } catch (error) {
      console.error("Failed to parse data from local storage", error);
    }
  }, []);

  useEffect(() => {
    if (state.status === "error") {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      })
    }
    if (state.status === "success" && state.data) {
      try {
        // Store the results in local storage
        localStorage.setItem('missingSkills', JSON.stringify(state.data.missingSkills));
        localStorage.setItem('userSkills', JSON.stringify(selectedSkills));
        localStorage.setItem('desiredRole', selectedRole);

        // Dispatch a storage event so other components (like Knowledge Test) can react to the change
        window.dispatchEvent(new Event('storage'));

        toast({
          title: "Success!",
          description: "Your skill gap analysis is ready.",
        })
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      } catch (error) {
        console.error("Failed to save data to local storage", error);
        toast({
          title: "Error",
          description: "Could not save your preferences to the browser.",
          variant: "destructive"
        })
      }
    }
  }, [state, toast, selectedSkills, selectedRole])

  const allSkills = React.useMemo(() => 
    Array.from(new Set(careerData.flatMap(role => role.requiredSkills))).sort()
  , []);
  
  if (state.status === 'success' && state.data) {
    return (
      <div ref={resultsRef} className="space-y-8 animate-in fade-in-50 duration-500">
        <h2 className="text-3xl font-bold font-headline text-center">Your Personalized Skill Development Plan</h2>
        
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-3"><Trophy className="text-primary"/> Identified Skill Gaps</CardTitle>
            <CardDescription>
              {state.data.missingSkills.length > 0
                ? "These are the key areas to focus on to bridge the gap between your current profile and your desired role."
                : "Excellent! You have all the required skills for this role."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
              {state.data.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                      {state.data.missingSkills.map((skill) => (
                          <div key={skill} className="flex items-center gap-2 p-2 px-4 bg-background rounded-full border-2 border-primary/30 shadow-sm">
                              <Zap className="h-5 w-5 text-primary" />
                              <span className="font-semibold text-base text-foreground">{skill}</span>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-foreground">You are well-equipped for this role. Consider exploring advanced topics to further enhance your expertise.</p>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-3"><ClipboardCheck className="text-primary"/> Your Learning Roadmap</CardTitle>
            <CardDescription>Here is a step-by-step plan to help you on your journey.</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground/90 prose-headings:font-headline prose-headings:text-foreground prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-strong:text-foreground/90 prose-ul:list-disc prose-li:marker:text-primary">
            <ReactMarkdown>{state.data.learningPlan || ''}</ReactMarkdown>
          </CardContent>
           {state.data.missingSkills.length > 0 && (
              <CardFooter>
                  <Button asChild className="ml-auto">
                      <Link href="/dashboard/daily-learning">
                          <BookOpen className="mr-2"/>
                          Generate My Learning Roadmap
                          <ArrowRight className="ml-2"/>
                      </Link>
                  </Button>
              </CardFooter>
          )}
        </Card>
      </div>
    )
  }

  return (
    <>
      <form action={formAction}>
        {user?.uid && <input type="hidden" name="userId" value={user.uid} />}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Skill Gap Analysis</CardTitle>
            <CardDescription>
              Select your skills and the career you're aiming for to get a personalized analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="desiredRole" className="font-semibold">Your Desired Role</Label>
              <Popover open={openRole} onOpenChange={setOpenRole}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openRole}
                    className="w-full justify-between text-base h-auto"
                  >
                    {selectedRole
                      ? careerData.find((role) => role.job.toLowerCase() === selectedRole.toLowerCase())?.job
                      : "Select a job role..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search job role..." />
                    <CommandList>
                      <CommandEmpty>No role found.</CommandEmpty>
                      <CommandGroup>
                        {careerData.map((role) => (
                          <CommandItem
                              key={role.job}
                              value={role.job}
                              onSelect={(currentValue) => {
                                setSelectedRole(currentValue.toLowerCase() === selectedRole.toLowerCase() ? "" : currentValue)
                                setOpenRole(false)
                              }}
                              style={{ pointerEvents: "auto", opacity: 1 }}
                              className="cursor-pointer"
                            >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedRole.toLowerCase() === role.job.toLowerCase()
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {role.job}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <input type="hidden" name="desiredRole" value={selectedRole} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="currentSkills" className="font-semibold">Your Current Skills</Label>
              <MultiSelect 
                options={allSkills.map(skill => ({ label: skill, value: skill }))}
                selected={selectedSkills}
                onChange={setSelectedSkills}
                placeholder="Select your skills..."
                name="userSkills"
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </>
  )
}
