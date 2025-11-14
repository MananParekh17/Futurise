
'use client'

import { use, useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, Clock, Youtube, AlertTriangle, Loader2, HelpCircle, Award, CheckCircle, Trophy, Star } from 'lucide-react';
import Link from 'next/link';
import type { LearningRoadmapOutput } from '@/ai/flows/daily-learning';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { generateCourseQuiz, evaluateCourseQuiz, type QuizEvaluateState } from './actions';
import type { Test } from "@/ai/flows/knowledge-test";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';

type RoadmapStep = LearningRoadmapOutput['roadmap'][0];

const slugify = (text: string) => {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const unslugify = (slug: string) => {
    if (!slug) return '';
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


export default function CoursePage({ params }: { params: { slug: string } }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { toast } = useToast();
  const { user } = useUser();

  const [skillName, setSkillName] = useState<string>("");
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desiredRoleSlug, setDesiredRoleSlug] = useState<string>("");


  const [quiz, setQuiz] = useState<Test | null>(null);
  const [quizResult, setQuizResult] = useState<QuizEvaluateState['data'] | null>(null);
  const [isQuizPassed, setIsQuizPassed] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();

  const totalPointsForSkill = steps.reduce((acc, step) => acc + step.points, 0);

  useEffect(() => {
    if (!slug) return;
    try {
      const storedRoadmap = localStorage.getItem('learningRoadmap');
      const allMissingSkills: string[] = JSON.parse(localStorage.getItem('missingSkills') || '[]');
      const currentSkill = allMissingSkills.find(s => slugify(s) === slug);
      
      const desiredRole = localStorage.getItem('desiredRole');
      if (desiredRole) {
        setDesiredRoleSlug(slugify(desiredRole));
      }
      
      if (currentSkill) {
          setSkillName(currentSkill);
      } else {
          setSkillName(unslugify(slug));
      }
      
      if (storedRoadmap && currentSkill) {
        const roadmap: RoadmapStep[] = JSON.parse(storedRoadmap);
        const relevantSteps = roadmap.filter(step => {
            const stepNameLower = step.stepName.toLowerCase();
            const courseLower = step.recommendedCourse.toLowerCase();
            const skillLower = currentSkill.toLowerCase();
            return stepNameLower.includes(skillLower) || courseLower.includes(skillLower);
        });
        setSteps(relevantSteps);
      } else {
        setSteps([]);
      }
      
      const storedProgress = localStorage.getItem('learningProgress');
      const progress = storedProgress ? JSON.parse(storedProgress) : {};
      if (desiredRole) {
        const roleSlug = slugify(desiredRole);
        const skillProgress = progress[roleSlug]?.[slug];
        setCompletedSteps(skillProgress?.completedSteps || []);
        setIsQuizPassed(skillProgress?.quizPassed || false);
        setHighScore(skillProgress?.score || 0);
      }

    } catch (e) {
      setError('Failed to load course details from your browser.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const saveProgress = (newCompletedSteps: string[], quizPassed: boolean, newScore?: number) => {
    if (!desiredRoleSlug || !slug) return;
    try {
        const storedProgress = localStorage.getItem('learningProgress');
        const progress = storedProgress ? JSON.parse(storedProgress) : {};

        if (!progress[desiredRoleSlug]) {
            progress[desiredRoleSlug] = {};
        }
        if (!progress[desiredRoleSlug][slug]) {
            progress[desiredRoleSlug][slug] = {
              completedSteps: [],
              quizPassed: false,
              score: 0,
            };
        }

        progress[desiredRoleSlug][slug].completedSteps = newCompletedSteps;
        progress[desiredRoleSlug][slug].quizPassed = quizPassed;
        if (newScore && newScore > (progress[desiredRoleSlug][slug].score || 0)) {
            progress[desiredRoleSlug][slug].score = newScore;
            setHighScore(newScore);
        }
        
        localStorage.setItem('learningProgress', JSON.stringify(progress));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.error("Failed to save progress to local storage", e);
    }
  }
  
  const handleProgressChange = (stepIdentifier: string) => {
    const newCompletedSteps = completedSteps.includes(stepIdentifier)
      ? completedSteps.filter(id => id !== stepIdentifier)
      : [...completedSteps, stepIdentifier];

    setCompletedSteps(newCompletedSteps);
    saveProgress(newCompletedSteps, isQuizPassed);
  };
  
  const handleGenerateQuiz = () => {
    startGenerateTransition(async () => {
        setQuiz(null);
        setQuizResult(null);
        const result = await generateCourseQuiz(skillName);
        if (result.status === 'success' && result.data) {
            setQuiz(result.data);
            setUserAnswers(new Array(result.data.questions.length).fill(""));
            toast({ title: "Quiz Generated!", description: "Your quiz is ready to be taken." });
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    });
  }

  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    if (!quiz || !user) return;
    const unanswered = userAnswers.filter(a => a === "").length;
    if (unanswered > 0) {
        toast({ title: "Incomplete Quiz", description: "Please answer all questions before submitting.", variant: "destructive"});
        return;
    }

    startSubmitTransition(async () => {
        const result = await evaluateCourseQuiz({ 
            questions: quiz.questions, 
            userAnswers, 
            userId: user.uid,
            pointsToAward: totalPointsForSkill
        });
        if (result.status === 'success' && result.data) {
            setQuizResult(result.data);
            const scorePercentage = (result.data.score / result.data.total) * 100;
            const passed = scorePercentage >= 80;
            const currentBestScore = (highScore / result.data.total) * 100;

            if (passed) {
                setIsQuizPassed(true);
                saveProgress(completedSteps, true, result.data.score);
                toast({ title: `Congratulations! You earned ${totalPointsForSkill} points!`, description: "You passed the quiz and mastered this skill!" });
            } else if (scorePercentage > currentBestScore) {
                saveProgress(completedSteps, isQuizPassed, result.data.score);
                toast({ title: "Keep Trying!", description: "You didn't pass this time, but you improved your score! Review the material and try again.", variant: "default" });
            } else {
                 toast({ title: "Keep Trying!", description: "You didn't pass this time. Review the material and try again.", variant: "destructive"});
            }
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    });
  }

  const progressPercentage = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

  if (loading) {
    return <div className="flex justify-center items-center h-full p-8"><Loader2 className="animate-spin h-8 w-8 mr-2" /> Loading course details...</div>;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 py-8">
        <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
                <CardTitle className="font-headline mt-4 text-2xl">
                    Could not load course
                </CardTitle>
                <CardDescription className="text-base">
                    {error}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild className="mx-auto">
                    <Link href="/dashboard/daily-learning">
                        <ArrowLeft className="mr-2"/>
                        Back to Learning Plan
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 py-8">
       <Button asChild variant="outline" className="mb-4">
          <Link href="/dashboard/daily-learning">
              <ArrowLeft className="mr-2"/>
              Back to Learning Plan
          </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="font-headline text-3xl">{skillName}</CardTitle>
                  <CardDescription>
                    A curated list of resources to help you master this skill.
                  </CardDescription>
              </div>
              {isQuizPassed && <Badge className="bg-green-500 hover:bg-green-600 text-white text-base py-2 px-4"><Trophy className="mr-2"/>Mastered</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {steps.length > 0 && (
                <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Learning Resource Progress</span>
                    <span>{completedSteps.length}/{steps.length} completed</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                </div>
            )}

            <div className="space-y-6 pt-4">
              {steps.length > 0 ? steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/20">
                   <Checkbox 
                        id={`step-${index}`} 
                        className="h-6 w-6 mt-1"
                        checked={completedSteps.includes(step.stepName)}
                        onCheckedChange={() => handleProgressChange(step.stepName)}
                    />
                  <div className="flex-1">
                    <Label htmlFor={`step-${index}`} className="text-lg font-semibold font-headline cursor-pointer">{step.stepName}</Label>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                        <div className="flex items-center gap-2"><Book className="h-4 w-4"/> {step.recommendedCourse}</div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4"/> {step.duration}</div>
                        <div className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500"/> {step.points} Points</div>
                    </div>
                     <Button asChild size="sm" className="mt-4">
                        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(step.recommendedCourse)}`} target="_blank" rel="noopener noreferrer">
                            <Youtube className="mr-2 h-4 w-4 text-red-500" />
                            Start Learning
                        </a>
                    </Button>
                  </div>
                </div>
              )) : (
                 <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">No specific learning steps were generated by the AI for this skill.</p>
                     <Button variant="outline" asChild>
                        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + ' tutorial')}`} target="_blank" rel="noopener noreferrer">
                            <Youtube className="mr-2 h-4 w-4 text-red-500" />
                            Search for "{skillName}" on YouTube
                        </a>
                    </Button>
                 </div>
              )}
            </div>
        </CardContent>
      </Card>
      
      {/* Quiz Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Test Your Knowledge</CardTitle>
          <CardDescription>
            Once you've gone through the resources, take this quiz to see if you've mastered the skill. You need 80% to pass and earn <span className="font-bold text-primary">{totalPointsForSkill} points</span>.
          </CardDescription>
        </CardHeader>
        
        {quizResult ? (
          // Quiz Results View
           <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">Your Score</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-6xl font-bold">{quizResult.score}<span className="text-2xl text-muted-foreground">/{quizResult.total}</span></p>
                        <p className="text-lg text-muted-foreground mt-1">({((quizResult.score/quizResult.total)*100).toFixed(0)}%)</p>
                    </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2"><Award className="text-primary"/>AI Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground text-base">{quizResult.feedback}</p>
                  </CardContent>
                </Card>
              </div>
              <CardFooter className="justify-center">
                  <Button onClick={handleGenerateQuiz} disabled={isGenerating}>
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Try Again
                  </Button>
              </CardFooter>
           </CardContent>
        ) : quiz ? (
            // Quiz Taking View
            <CardContent className="space-y-8 p-6">
                {quiz.questions.map((q, index) => (
                    <div key={index}>
                        <Label className="text-base font-medium flex gap-3"><HelpCircle className="mt-1 h-5 w-5 text-primary shrink-0" /><span>{index + 1}. {q.questionText}</span></Label>
                        <RadioGroup 
                          name={`answer_${index}`} 
                          className="mt-4 space-y-3 pl-8" 
                          required 
                          value={userAnswers[index]}
                          onValueChange={(value) => handleAnswerChange(index, value)}
                        >
                            {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-3">
                                <RadioGroupItem value={opt} id={`q${index}-opt${optIndex}`} />
                                <Label htmlFor={`q${index}-opt${optIndex}`} className="font-normal text-muted-foreground hover:text-foreground cursor-pointer">{opt}</Label>
                            </div>
                            ))}
                        </RadioGroup>
                    </div>
                ))}
                <CardFooter>
                    <Button onClick={handleSubmitQuiz} disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Quiz
                    </Button>
                </CardFooter>
            </CardContent>
        ) : (
            // Initial View
            <CardFooter className="flex-col gap-4">
              {isQuizPassed && (
                <div className="text-sm text-center text-muted-foreground mb-2">
                  <p>You've mastered this skill! Your highest score is <strong>{highScore}/{quiz?.questions.length ?? 10}</strong>.</p>
                  <p>Feel free to retake the quiz to strengthen your knowledge.</p>
                </div>
              )}
              <Button onClick={handleGenerateQuiz} disabled={isGenerating} className="w-full">
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isQuizPassed ? "Retake Mastery Quiz" : "Generate Mastery Quiz"}
              </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
