
'use client'

import { useUser } from '@/firebase'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { List, CheckCircle, Target, User as UserIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type StoredAnalysis = {
  desiredRole: string | null
  userSkills: string[]
  missingSkills: string[]
}

type ProgressTracker = {
  [roleSlug: string]: {
    [courseSlug: string]: {
      quizPassed?: boolean
    }
  }
}

const slugify = (text: string) => {
  if (!text) return ''
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

export default function ProfilePage() {
  const { user } = useUser()
  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null)
  const [achievedSkills, setAchievedSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = () => {
      setLoading(true);
      try {
        const desiredRole = localStorage.getItem('desiredRole');
        const userSkills = localStorage.getItem('userSkills');
        const missingSkills = localStorage.getItem('missingSkills');
        const storedProgress = localStorage.getItem('learningProgress');

        const parsedAnalysis: StoredAnalysis = {
          desiredRole: desiredRole || null,
          userSkills: userSkills ? JSON.parse(userSkills) : [],
          missingSkills: missingSkills ? JSON.parse(missingSkills) : [],
        };
        setAnalysis(parsedAnalysis);

        if (storedProgress && desiredRole) {
          const progress: ProgressTracker = JSON.parse(storedProgress);
          const roleSlug = slugify(desiredRole);
          const roleProgress = progress[roleSlug] || {};
          
          const mastered: string[] = [];
          if (parsedAnalysis.missingSkills) {
              parsedAnalysis.missingSkills.forEach(skill => {
                  const skillSlug = slugify(skill);
                  if (roleProgress[skillSlug]?.quizPassed) {
                      mastered.push(skill);
                  }
              });
          }
          setAchievedSkills(mastered);
        } else {
          setAchievedSkills([]);
        }
      } catch (e) {
        console.error('Failed to load profile data from local storage', e);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch data on initial load
    fetchProfileData();

    // Add event listener to refetch data on storage change
    window.addEventListener('storage', fetchProfileData);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', fetchProfileData);
    };
  }, []);
  
  const remainingSkills = analysis?.missingSkills.filter(s => !achievedSkills.includes(s)) || [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <UserIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold font-headline">User Profile</h1>
            <p className="text-muted-foreground">Your personal information and learning journey summary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Details Card */}
        <div className="lg:col-span-1">
            <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                        <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                        <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-2xl">{user?.displayName}</CardTitle>
                    <CardDescription>{user?.email}</CardDescription>
                </CardHeader>
            </Card>
        </div>

        {/* Skills and Goals */}
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-3"><Target className="text-primary"/> Career Goal</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-48" /> : (
                        analysis?.desiredRole ? <Badge variant="secondary" className="text-xl py-2 px-4">{analysis.desiredRole}</Badge> : <p className="text-muted-foreground">No desired role set. Go to the Skill Gap Analyzer to set your goal.</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-3"><List className="text-primary"/> Existing Skills</CardTitle>
                        <CardDescription>Skills you already have.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {loading ? Array(3).fill(0).map((_,i) => <Skeleton key={i} className="h-6 w-24 rounded-full" />) : (
                            analysis?.userSkills && analysis.userSkills.length > 0 ? (
                                analysis.userSkills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)
                            ) : <p className="text-sm text-muted-foreground">No existing skills selected.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-3"><CheckCircle className="text-green-500"/> Achieved Skills</CardTitle>
                         <CardDescription>Skills you've mastered.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                         {loading ? Array(2).fill(0).map((_,i) => <Skeleton key={i} className="h-6 w-20 rounded-full" />) : (
                            achievedSkills.length > 0 ? (
                                achievedSkills.map(skill => <Badge key={skill} className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">{skill}</Badge>)
                            ) : <p className="text-sm text-muted-foreground">No skills mastered yet. Keep learning!</p>
                        )}
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Remaining Skills to Achieve</CardTitle>
                    <CardDescription>Focus on these areas to reach your goal.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {loading ? Array(4).fill(0).map((_,i) => <Skeleton key={i} className="h-6 w-28 rounded-full" />) : (
                        remainingSkills.length > 0 ? (
                            remainingSkills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)
                        ) : <p className="text-sm text-muted-foreground">You've mastered all the required skills for this role!</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
