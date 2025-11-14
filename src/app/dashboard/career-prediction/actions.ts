
"use server"

import { careerPrediction, type CareerPredictionInput, type CareerPredictionOutput } from "@/ai/flows/career-prediction"
import { z } from "zod"
import { psychometricQuestions } from "@/lib/constants"

const answersSchema = z.record(z.string().min(1, "Answer cannot be empty."));

const CareerFormSchema = z.object({
  allAnswers: answersSchema.refine(
    (answers) => Object.keys(answers).length === psychometricQuestions.length,
    { message: "Please answer all 50 questions." }
  ),
  careerAspirations: z.string().optional(),
})

export type FormState = {
  status: "success" | "error" | "idle"
  message: string
  data?: CareerPredictionOutput
}

export async function predictCareer(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const allAnswersData = formData.get("allAnswers") as string
  const careerAspirations = formData.get("careerAspirations") as string

  let allAnswers = {}
  try {
    if (allAnswersData) {
      allAnswers = JSON.parse(allAnswersData)
    }
  } catch (e) {
    return {
      status: "error",
      message: "There was an error processing your answers.",
    }
  }
  
  const validatedFields = CareerFormSchema.safeParse({ allAnswers, careerAspirations });
  
  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.issues.map((issue) => issue.message).join(", ");
    return {
      status: "error",
      message: errorMessage || "Please answer all questions before submitting.",
    }
  }

  try {
    // The AI expects an array of strings, not an object.
    const answersArray = psychometricQuestions.map(q => validatedFields.data.allAnswers[q.id] || "");

    const input: CareerPredictionInput = {
      answers: answersArray,
      careerAspirations: validatedFields.data.careerAspirations || "None specified",
    }
    const result = await careerPrediction(input)
    
    return {
      status: "success",
      message: "Prediction successful!",
      data: result,
    }
  } catch (error) {
    console.error("Career prediction failed:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again later.";
    return {
      status: "error",
      message: `The AI service failed to respond. This may be due to a network issue, an invalid API key, or a problem with the AI model. Details: ${errorMessage}`,
    }
  }
}
