
"use client"

import { Award, CheckCircle, ShieldCheck, Gift, Star } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { useUser } from "@/firebase/auth/use-user"
import { useDoc } from "@/firebase/firestore/use-doc"
import { doc } from "firebase/firestore"
import { useFirestore, useMemoFirebase } from "@/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { EvaluateState } from "../knowledge-test/actions"

type UserData = {
  totalPoints: number;
}

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


const rewards = [
    {
        name: "₹10 Amazon Voucher",
        points: 100,
        icon: <Gift className="h-8 w-8 text-yellow-500" />
    },
    {
        name: "₹50 Google Play Voucher",
        points: 500,
        icon: <Gift className="h-8 w-8 text-green-500" />
    },
    {
        name: "1-Month Premium Subscription",
        points: 1000,
        icon: <Award className="h-8 w-8 text-blue-500" />
    }
]

export default function RewardsPage() {
  const { user } = useUser();
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateProgress = () => {
        setIsLoading(true);
        try {
            const desiredRole = localStorage.getItem('desiredRole');
            let skillsPoints = 0;
            let finalTestPoints = 0;
            
            if (desiredRole) {
                const roleSlug = slugify(desiredRole);
                const storedProgress = localStorage.getItem('learningProgress');
                
                // Calculate points from individual mastered skills
                if (storedProgress) {
                    const progress: ProgressTracker = JSON.parse(storedProgress);
                    const roleProgress = progress[roleSlug] || {};
                    const completedCount = Object.values(roleProgress).filter(p => p.quizPassed).length;
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
            
            setTotalPoints(skillsPoints + finalTestPoints);

        } catch (e) {
            console.error("Failed to parse learning progress from local storage", e);
            setTotalPoints(0);
        } finally {
            setIsLoading(false);
        }
    }

    // Initial load
    updateProgress();
    
    // Listen for changes from other tabs or from other pages
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
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold font-headline">Points & Rewards</h1>
            <p className="text-muted-foreground">Earn points for your learning achievements and redeem them for rewards.</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-10 w-28" />
                ) : (
                    <div className="text-4xl font-bold">{totalPoints}</div>
                )}
                <p className="text-xs text-muted-foreground">Your lifetime accumulated points.</p>
            </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline">How to Earn Points</CardTitle>
                <CardDescription>Points are awarded for completing learning milestones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <p className="font-semibold">Master a Skill</p>
                        <p className="text-muted-foreground">Earn <span className="font-bold text-primary">10 points</span> for scoring 80% or more on a skill quiz.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <p className="font-semibold">Pass a Final Test</p>
                        <p className="text-muted-foreground">Earn <span className="font-bold text-primary">50 points</span> for passing the final test for a career role.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Rewards Marketplace</h2>
        <div className="grid md:grid-cols-3 gap-6">
            {rewards.map(reward => (
                <Card key={reward.name} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            {reward.icon}
                            <CardTitle>{reward.name}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-2xl font-bold text-primary">{reward.points} Points</p>
                    </CardContent>
                    <CardFooter>
                         <Button disabled={totalPoints < reward.points} className="w-full">
                            Redeem {totalPoints < reward.points && `(Need ${reward.points - totalPoints} more)`}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
