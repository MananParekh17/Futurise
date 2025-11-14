
"use server"

import { generateTest, evaluateTest, type GenerateTestInput, type Test, type EvaluateTestInput, type EvaluateTestOutput } from "@/ai/flows/knowledge-test"
import { updateStreakAndPoints } from "@/app/dashboard/streak/actions";

export type QuizGenerateState = {
  status: "success" | "error" | "idle"
  message: string
  data?: Test
}

export async function generateCourseQuiz(topic: string): Promise<QuizGenerateState> {
  if (!topic || topic.length < 2) {
    return {
      status: "error",
      message: "Please provide a valid topic for the quiz.",
    }
  }

  try {
    const input: GenerateTestInput = { topic }
    const result = await generateTest(input)
    
    return {
      status: "success",
      message: "Quiz generated successfully!",
      data: result,
    }
  } catch (error) {
    console.error("Course quiz generation failed:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      status: "error",
      message: `Failed to generate quiz. Details: ${errorMessage}`,
    }
  }
}

export type QuizEvaluateState = {
    status: "success" | "error" | "idle"
    message: string
    data?: EvaluateTestOutput
}

type EvaluateQuizInput = EvaluateTestInput & {
    userId: string;
    pointsToAward: number;
}

export async function evaluateCourseQuiz(input: EvaluateQuizInput): Promise<QuizEvaluateState> {
    if (!input.questions || !input.userAnswers) {
        return { status: 'error', message: 'Invalid quiz data provided.' };
    }

    try {
        const result = await evaluateTest(input);
        const scorePercentage = result.total > 0 ? (result.score / result.total) * 100 : 0;
        
        // Award points for mastering an individual skill if score is 80% or higher
        if (scorePercentage >= 80) {
            await updateStreakAndPoints({ userId: input.userId, points: input.pointsToAward });
        }

        return {
            status: "success",
            message: "Quiz submitted and evaluated!",
            data: result,
        }
    } catch (error) {
        console.error("Course quiz evaluation failed:", error)
        return {
            status: "error",
            message: "An unexpected error occurred during evaluation. Please try again.",
        }
    }
}
