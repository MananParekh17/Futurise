
"use client"

import { useEffect, useState, useRef, useMemo, useTransition, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { generateFinalMasteryQuiz, evaluateFinalMasteryQuiz, type EvaluateState, type GenerateState } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Loader2, HelpCircle, Award, BarChart, Target, TestTube, ArrowRight, BookOpen, Lock, Trophy, CheckCircle, XCircle } from "lucide-react"
import type { Test } from "@/ai/flows/knowledge-test"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/firebase"

type ProgressTracker = {
    [roleSlug: string]: {
        [courseSlug: string]: {
            completedSteps: string[];
            quizPassed?: boolean;
            score?: number;
        }
    }
}

const slugify = (text: string) => {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const initialGenerateState: GenerateState = { status: 'idle', message: '' };
const initialEvaluateState: EvaluateState = { status: 'idle', message: '' };

function FinalTestGenerateButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending || disabled}>
            {pending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Final Test...</>
            ) : (
                <><Trophy className="mr-2"/>Generate Final Mastery Test</>
            )}
        </Button>
    )
}

export function KnowledgeTest() {
    const { toast } = useToast()
    const [quiz, setQuiz] = useState<Test | null>(null)
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null)
    const quizRef = useRef<HTMLDivElement>(null)
    
    const [isSubmitting, startSubmitTransition] = useTransition();

    const [skills, setSkills] = useState<string[] | null>(null);
    const [desiredRole, setDesiredRole] = useState<string | null>(null);
    const [progress, setProgress] = useState<ProgressTracker>({});

    const [generateState, generateAction] = useActionState(generateFinalMasteryQuiz, initialGenerateState);
    const [evaluateState, setEvaluateState] = useState<EvaluateState>(initialEvaluateState);

    const { user } = useUser();

    useEffect(() => {
        if (generateState.status === 'success' && generateState.data) {
            setQuiz(generateState.data);
            setUserAnswers(new Array(generateState.data.questions.length).fill(""));
            if (desiredRole) {
                localStorage.removeItem(`finalTestResult-${slugify(desiredRole)}`);
            }
            setEvaluateState(initialEvaluateState);
            toast({ title: "Success!", description: "Your Final Mastery quiz is ready." });
            setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } else if (generateState.status === 'error') {
            toast({ title: "Error", description: generateState.message, variant: "destructive" });
        }
    }, [generateState, desiredRole, toast]);


    const handleSubmitQuiz = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!quiz || !user) return;
        
        startSubmitTransition(async () => {
            const result = await evaluateFinalMasteryQuiz({ 
                questions: quiz.questions, 
                userAnswers,
                userId: user.uid,
            });
            setEvaluateState(result);

            if (result.status === 'success') {
                if (desiredRole && result.roleMastered) {
                    localStorage.setItem(`finalTestResult-${slugify(desiredRole)}`, JSON.stringify(result));
                    window.dispatchEvent(new Event('storage'));
                }
                toast({ title: "Quiz Submitted!", description: "Your results are in." });
                setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            } else {
                 toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };
  
    const handleAnswerChange = (questionIndex: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = value;
        setUserAnswers(newAnswers);
    };

    const fetchProgressData = () => {
        try {
            const storedSkills = localStorage.getItem('missingSkills');
            const storedRole = localStorage.getItem('desiredRole');
            const storedProgress = localStorage.getItem('learningProgress');

            setSkills(storedSkills ? JSON.parse(storedSkills) : []);
            setDesiredRole(storedRole);
            setProgress(storedProgress ? JSON.parse(storedProgress) : {});
            
            if (storedRole) {
                const storedResult = localStorage.getItem(`finalTestResult-${slugify(storedRole)}`);
                if (storedResult) {
                    const parsedResult: EvaluateState = JSON.parse(storedResult);
                    if (parsedResult.status === 'success') {
                        setEvaluateState(parsedResult);
                    }
                } else {
                    setEvaluateState(initialEvaluateState);
                }
            } else {
                 setEvaluateState(initialEvaluateState);
            }
        } catch (error) {
            console.error("Failed to parse data from local storage", error);
            setSkills([]);
            setDesiredRole(null);
            setProgress({});
        }
    };

    useEffect(() => {
        fetchProgressData();
        const handleStorageChange = () => {
            fetchProgressData();
            setQuiz(null); // Reset quiz if skills change
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const { allSkillsMastered, masteryProgress } = useMemo(() => {
        if (!skills || !desiredRole) return { allSkillsMastered: false, masteryProgress: 0 };
        
        const roleSlug = slugify(desiredRole);
        const roleProgress = progress[roleSlug] || {};
        const masteredSkillsCount = skills.filter(skill => roleProgress[slugify(skill)]?.quizPassed).length;
        const allMastered = skills.length > 0 && masteredSkillsCount === skills.length;
        const progressPercentage = skills.length > 0 ? (masteredSkillsCount / skills.length) * 100 : 0;
        
        return { allSkillsMastered: allMastered, masteryProgress: progressPercentage };
    }, [skills, desiredRole, progress]);

    if (skills === null) {
        return (
            <Card className="flex flex-col items-center justify-center p-10 text-center min-h-[400px]">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Loading your skill data...</p>
            </Card>
        );
    }

    if (skills.length === 0 || !desiredRole) {
        return (
            <Card className="text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        <Target className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="font-headline mt-4 text-2xl">Start with Skill Gap Analysis</CardTitle>
                    <CardDescription className="text-base">To generate a relevant quiz, you first need to identify your skill gaps.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Head over to the Skill Gap Analyzer, tell us about your goals, and we'll create a plan for you.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/skill-gap">Analyze My Skills <ArrowRight className="ml-2"/></Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-12">
            {/* Final Mastery Test Card */}
            <Card className={cn("border-2", allSkillsMastered ? "border-primary" : "border-dashed")}>
                <form action={generateAction}>
                    {skills.map(skill => <input key={skill} type="hidden" name="topics" value={skill} />)}
                    {desiredRole && <input type="hidden" name="desiredRole" value={desiredRole} />}
                    <CardHeader>
                        <CardTitle className="font-headline">Final Mastery Test</CardTitle>
                        <CardDescription>Test your knowledge across all required skills for your desired role of <strong>{desiredRole}</strong>. This test is unlocked once you master all individual skills.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <Label>Mastery Progress</Label>
                                <span className="text-sm font-bold text-primary">{masteryProgress.toFixed(0)}%</span>
                            </div>
                            <Progress value={masteryProgress} />
                        </div>
                        {!allSkillsMastered && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                                <Lock className="h-5 w-5 shrink-0"/>
                                <span>Complete all individual skill modules in the Daily Learning section to unlock this test.</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                         <FinalTestGenerateButton disabled={!allSkillsMastered} />
                    </CardFooter>
                </form>
            </Card>

            {/* Individual Skill Quiz Card - Directs to Daily Learning */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Practice Individual Skills</CardTitle>
                    <CardDescription>To test your knowledge on a specific skill, please visit the "Daily Learning" page and select the skill you wish to be tested on.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild>
                        <Link href="/dashboard/daily-learning"><BookOpen className="mr-2" />Go to Daily Learning</Link>
                    </Button>
                </CardFooter>
            </Card>

            {/* Quiz Taking UI */}
            {quiz && !evaluateState.data && (
                <div ref={quizRef} className="animate-in fade-in-50 duration-500">
                    <form onSubmit={handleSubmitQuiz}>
                        <Card>
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="font-headline text-xl">Quiz on: {quiz.topic}</CardTitle>
                                <CardDescription>Answer the following questions to the best of your ability.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 p-6">
                                {quiz.questions.map((q, index) => (
                                    <div key={index}>
                                        <Label className="text-base font-medium flex gap-3"><HelpCircle className="mt-1 h-5 w-5 text-primary shrink-0" /><span>{index + 1}. {q.questionText}</span></Label>
                                        <RadioGroup name={`answer_${index}`} className="mt-4 space-y-3 pl-8" required value={userAnswers[index]} onValueChange={(value) => handleAnswerChange(index, value)}>
                                            {q.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center space-x-3">
                                                    <RadioGroupItem value={opt} id={`q${index}-opt${optIndex}`} />
                                                    <Label htmlFor={`q${index}-opt${optIndex}`} className="font-normal text-muted-foreground hover:text-foreground cursor-pointer">{opt}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="bg-muted/30 p-6">
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Answers"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            )}

            {/* Results UI */}
            {evaluateState.status === "success" && evaluateState.data && (
                <div ref={resultsRef} className="mt-12 space-y-8 animate-in fade-in-50 duration-500">
                    <h2 className="text-3xl font-bold font-headline text-center">Your Quiz Results</h2>
                    
                    {evaluateState.roleMastered && (
                        <Card className="bg-green-500/10 border-green-500/50 text-center">
                            <CardHeader>
                                <div className="mx-auto bg-green-500/20 p-4 rounded-full w-fit"><Trophy className="h-10 w-10 text-green-600 dark:text-green-400" /></div>
                                <CardTitle className="font-headline mt-4 text-2xl text-green-700 dark:text-green-300">Congratulations! Role Mastered!</CardTitle>
                                <CardDescription className="text-base text-green-600 dark:text-green-400">You have successfully passed the final mastery test for the <strong>{desiredRole}</strong> role!</CardDescription>
                            </CardHeader>
                        </Card>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2"><BarChart className="text-primary"/>Your Score</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-7xl font-bold">{evaluateState.data.score}<span className="text-3xl text-muted-foreground">/{evaluateState.data.total}</span></p>
                                <p className="text-xl text-muted-foreground mt-2">({((evaluateState.data.score / evaluateState.data.total) * 100).toFixed(0)}%)</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2"><Award className="text-primary"/>AI Feedback</CardTitle>
                                {evaluateState.roleMastered ? (
                                    <Badge className="w-fit bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="mr-1"/>Pass</Badge>
                                ) : (
                                    <Badge variant="destructive" className="w-fit"><XCircle className="mr-1"/>Fail</Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-base">{evaluateState.data.feedback}</p>
                            </CardContent>
                        </Card>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Next Steps</CardTitle>
                            <CardDescription>What would you like to do now?</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex gap-4">
                            <Button asChild>
                                <Link href="/dashboard/daily-learning"><BookOpen className="mr-2" /> Review Learning Resources</Link>
                            </Button>
                            <Button variant="outline" onClick={() => {
                                setQuiz(null);
                                setEvaluateState({ status: 'idle', message: '' });
                                if (desiredRole) localStorage.removeItem(`finalTestResult-${slugify(desiredRole)}`);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}>
                                <TestTube className="mr-2" /> Take Another Quiz
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    )
}
