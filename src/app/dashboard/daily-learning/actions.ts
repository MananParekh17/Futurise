
"use server"

import { generateLearningRoadmap, type LearningRoadmapInput, type LearningRoadmapOutput } from "@/ai/flows/daily-learning"
import { z } from "zod";

const RoadmapRequestSchema = z.object({
  userSkills: z.array(z.string()),
  desiredRole: z.string(),
  missingSkills: z.array(z.string()),
});

type RoadmapRequest = z.infer<typeof RoadmapRequestSchema>;

// This function is called directly from the client component with the required data
export async function createLearningRoadmap(
  data: RoadmapRequest
): Promise<LearningRoadmapOutput> {
  const validatedData = RoadmapRequestSchema.safeParse(data);
  if (!validatedData.success) {
    throw new Error("Invalid data provided to generate a learning plan.");
  }

  const { ...learningInput } = validatedData.data;

  if (!learningInput.missingSkills || learningInput.missingSkills.length === 0 || !learningInput.desiredRole || !learningInput.userSkills) {
    throw new Error("Insufficient data provided to generate a learning plan. Please complete skill gap analysis first.");
  }
  
  try {
    const result = await generateLearningRoadmap(learningInput);
    return result;
  } catch (error) {
    console.error("Learning roadmap generation failed:", error)
    if (error instanceof Error) {
        throw new Error(error.message || "An unexpected error occurred while creating your roadmap. Please try again later.");
    }
    throw new Error("An unexpected error occurred. Please try again later.");
  }
}
