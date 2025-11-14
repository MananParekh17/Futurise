
'use server';
/**
 * @fileOverview Generates a personalized learning roadmap based on skill gaps.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Model} from 'genkit/model';

// ------------------ Input / Output Schemas ------------------

const LearningRoadmapInputSchema = z.object({
  userSkills: z.array(z.string()).describe("The user's current skills."),
  desiredRole: z.string().describe("The user's desired career role."),
  missingSkills: z.array(z.string()).describe("The skills the user is missing for the desired role."),
});
export type LearningRoadmapInput = z.infer<typeof LearningRoadmapInputSchema>;

const RoadmapStepSchema = z.object({
  stepName: z.string().describe('A descriptive name for the learning step (e.g., "Master React Hooks").'),
  recommendedCourse: z.string().describe('A specific, high-quality, and concise course name or search term for YouTube (e.g., "React Hooks Crash Course").'),
  duration: z.string().describe('The estimated time to complete the step (e.g., "3 weeks", "25 hours").'),
  points: z.number().int().min(1).describe('The points awarded for completing this step, based on duration/effort (e.g., 5-20 points).'),
});

const LearningRoadmapOutputSchema = z.object({
  roadmap: z.array(RoadmapStepSchema).describe('A learning roadmap with at least one step for each missing skill.'),
});
export type LearningRoadmapOutput = z.infer<typeof LearningRoadmapOutputSchema>;

// ------------------ Dynamic Prompt ------------------

function buildRoadmapPrompt(input: LearningRoadmapInput): string {
  return `
You are an expert career coach and curriculum designer. Your task is to generate a personalized learning roadmap for a user aspiring to become a **${input.desiredRole}**.

**User's Profile:**
- **Existing Skills:** ${input.userSkills.join(', ') || 'None specified'}
- **Missing Skills to Learn:** ${input.missingSkills.join(', ')}

**Your Task:**

Generate a **learning roadmap** to help the user master the "Missing Skills to Learn". **Do not include skills from the "Existing Skills" list in your plan.**

For each step in the roadmap, you MUST provide:
1.  **stepName**: A clear and descriptive name for the learning step. This step name should clearly relate to one of the "Missing Skills to Learn".
2.  **recommendedCourse**: A specific, high-quality, and concise course name or search term suitable for YouTube. For example: "Advanced CSS and Sass" or "Python for Data Science Full Course".
3.  **duration**: An estimated time to complete the step (e.g., "3 weeks", "25 hours").
4.  **points**: An integer point value between 5 and 20 based on the estimated duration and complexity. Longer durations should have more points.

**CRITICAL:**
- You MUST generate at least one roadmap step for EACH skill listed in "Missing Skills to Learn".
- Respond strictly in the JSON format defined by the output schema. The final output must be a valid JSON object.
  `;
}

// ------------------ Main Function ------------------

export async function generateLearningRoadmap(
  input: LearningRoadmapInput
): Promise<LearningRoadmapOutput> {
  return generateLearningRoadmapFlow(input);
}

// ------------------ Flow Definition ------------------

const fallbackModel: Model = 'googleai/gemini-2.0-flash';

const generateLearningRoadmapFlow = ai.defineFlow(
  {
    name: 'generateLearningRoadmapFlow',
    inputSchema: LearningRoadmapInputSchema,
    outputSchema: LearningRoadmapOutputSchema,
  },
  async input => {
    const roadmapPrompt = buildRoadmapPrompt(input);
    console.log("Generated Prompt:", roadmapPrompt); // For debugging the prompt
    try {
      // Primary model call with raw logging
      const {output, raw} = await ai.generate({
        prompt: roadmapPrompt,
        output: {schema: LearningRoadmapOutputSchema},
      });

      console.log("Raw model output (primary):", JSON.stringify(raw, null, 2));
      return output!;
    } catch (error) {
      console.error("Primary model failed, switching to fallback.", error);

      const {output, raw} = await ai.generate({
        model: fallbackModel,
        prompt: buildRoadmapPrompt(input),
        output: {schema: LearningRoadmapOutputSchema},
      });

      console.log("Raw model output (fallback):", JSON.stringify(raw, null, 2));
      return output!;
    }
  }
);
