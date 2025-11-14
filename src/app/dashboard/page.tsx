
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, ArrowRight, Target, BrainCircuit, Star } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/firebase/auth/use-user"
import { useDoc } from "@/firebase/firestore/use-doc"
import { doc } from "firebase/firestore"
import { useFirestore, useMemoFirebase } from "@/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import type { UserData } from "./streak/actions"
import { Badge } from "@/components/ui/badge"
import type { EvaluateState } from "./knowledge-test/actions"

type ProgressTracker = {
    [roleSlug: string]: {
        [courseSlug: string]: {
            completedSteps: string[];
            quizPassed?: boolean;
        }
    }
}

const slugify = (text: string) => {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export default function DashboardPage() {
  const { user } = useUser()
  const firestore = useFirestore()
  const [totalPoints, setTotalPoints] = useState(0);
  const [masteredSkillsCount, setMasteredSkillsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, "users", user.uid) : null
  , [user, firestore]);

  const { data: userData, isLoading: isUserDocLoading } = useDoc<UserData>(userDocRef);

  useEffect(() => {
    const updateProgress = () => {
        setIsLoading(true);
        try {
            const desiredRole = localStorage.getItem('desiredRole');
            let skillsPoints = 0;
            let finalTestPoints = 0;
            let skillsCount = 0;

            if (desiredRole) {
                const roleSlug = slugify(desiredRole);
                const storedProgress = localStorage.getItem('learningProgress');
                
                // Calculate points from individual mastered skills
                if (storedProgress) {
                    const progress: ProgressTracker = JSON.parse(storedProgress);
                    const roleProgress = progress[roleSlug] || {};
                    const completedCount = Object.values(roleProgress).filter(p => p.quizPassed).length;
                    skillsCount = completedCount;
                    skillsPoints = completedCount * 10;
                }

                // Check for final test mastery points
                const storedFinalTestResult = localStorage.getItem(`finalTestResult-${roleSlug}`);
                if (storedFinalTestResult) {
                    const finalTestResult: EvaluateState = JSON.parse(storedFinalTestResult);
                    if (finalTestResult.roleMastered) {
                        finalTestPoints = 50;
                    }
                }
            }
            
            setMasteredSkillsCount(skillsCount);
            setTotalPoints(skillsPoints + finalTestPoints);

        } catch (e) {
            console.error("Failed to parse learning progress from local storage", e);
            setMasteredSkillsCount(0);
            setTotalPoints(0);
        } finally {
            setIsLoading(false);
        }
    }

    // Initial load
    updateProgress();
    
    // Listen for changes from other tabs or from the skill-gap/knowledge-test pages
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'learningProgress' || event.key === 'desiredRole' || event.key === 'missingSkills' || event.key?.startsWith('finalTestResult-')) {
            updateProgress();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also add focus listener to catch changes from other tabs
    window.addEventListener('focus', updateProgress);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', updateProgress);
    };

  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Welcome Back, {user?.displayName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-lg">Here's your progress summary for today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <Award className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <Skeleton className="h-10 w-28" />
             ) : (
                <div className="text-3xl font-bold">{totalPoints} pts</div>
             )}
            <p className="text-xs text-muted-foreground">Points earned from mastering skills.</p>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mastered Skills</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-12" />
            ) : (
              <div className="text-3xl font-bold">{masteredSkillsCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Skills mastered for current role.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-primary/10 border-primary/20">
              <CardHeader>
                  <CardTitle className="font-headline text-2xl">Start Your Journey Here</CardTitle>
                  <CardDescription className="text-muted-foreground">Identify your skills gaps to get a personalized learning plan.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground mb-6">Analyze your current skillset against your desired career path. Our AI will generate a tailored roadmap to help you bridge the gap and achieve your goals.</p>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/dashboard/skill-gap">
                        <Target className="mr-2"/>
                        Analyze My Skills
                    </Link>
                  </Button>
              </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Career Prediction</CardTitle>
                <CardDescription>Unsure about your path?</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground mb-4">Take our psychometric test to discover careers that match your personality.</p>
            </CardContent>
            <CardFooter>
                <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard/career-prediction">
                        <BrainCircuit className="mr-2"/>
                        Take the Test
                    </Link>
                </Button>
            </CardFooter>
          </Card>
      </div>
    </div>
  )
}
