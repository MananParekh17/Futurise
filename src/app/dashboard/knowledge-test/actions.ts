
"use server"

import { generateTest, evaluateTest, type GenerateTestInput, type Test, type EvaluateTestInput, type EvaluateTestOutput } from "@/ai/flows/knowledge-test"
import { updateStreakAndPoints } from "@/app/dashboard/streak/actions"
import { z } from "zod"

const generateFinalTestSchema = z.object({
    topics: z.array(z.string()).min(1, "There are no skills to test."),
    desiredRole: z.string().min(1, "Desired role is not specified."),
})

export type GenerateState = {
  status: "success" | "error" | "idle"
  message: string
  data?: Test
}

export async function generateFinalMasteryQuiz(
  prevState: GenerateState,
  formData: FormData
): Promise<GenerateState> {
    const topics = formData.getAll('topics') as string[];
    const desiredRole = formData.get('desiredRole') as string;

    const validatedFields = generateFinalTestSchema.safeParse({ topics, desiredRole });
    if (!validatedFields.success) {
        const errorMessage = validatedFields.error.issues.map((issue) => issue.message).join(", ");
        return {
            status: "error",
            message: errorMessage || "Cannot generate test without topics.",
        }
    }

    try {
        const input: GenerateTestInput = { 
            topic: `Final Mastery Test for ${validatedFields.data.desiredRole} covering: ${validatedFields.data.topics.join(', ')}` 
        }
        const result = await generateTest(input)
        
        return {
            status: "success",
            message: "Final Mastery Quiz generated successfully!",
            data: result,
        }
    } catch (error) {
        console.error("Final quiz generation failed:", error)
        return {
            status: "error",
            message: "An unexpected error occurred while generating the final quiz. Please try again later.",
        }
    }
}

export type EvaluateState = {
    status: 'success' | 'error' | 'idle';
    message: string;
    data?: EvaluateTestOutput;
    roleMastered?: boolean;
};

type FinalEvaluateInput = EvaluateTestInput & {
    userId: string;
}

export async function evaluateFinalMasteryQuiz(input: FinalEvaluateInput): Promise<EvaluateState> {
    if (!input.questions || !input.userAnswers) {
        return { status: 'error', message: 'Invalid quiz data provided.' };
    }

    try {
        const result = await evaluateTest(input);
        const scorePercentage = result.total > 0 ? (result.score / result.total) * 100 : 0;
        const roleMastered = scorePercentage >= 80;

        if (roleMastered) {
             // Award a significant point bonus for mastering a role
             await updateStreakAndPoints({ userId: input.userId, points: 50 });
        }
        
        return {
            status: "success",
            message: "Quiz submitted and evaluated!",
            data: result,
            roleMastered: roleMastered,
        }
    } catch (error) {
        console.error("Final quiz evaluation failed:", error)
        return {
            status: "error",
            message: "An unexpected error occurred during evaluation. Please try again.",
        }
    }
}
