
'use server';
/**
 * @fileOverview A skill gap analysis AI agent.
 *
 * - calculateMissingSkills - A function that analyzes skill gaps for a desired career.
 * - skillGapAnalysis - A function that analyzes skill gaps for a desired career.
 * - SkillGapAnalysisInput - The input type for the skillGapAnalysis function.
 * - SkillGapAnalysisOutput - The return type for the skillGapAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Model} from 'genkit/model';
import { careerData } from '../../lib/career-data';

// This function is now the primary export and handles the logic locally.
export async function calculateMissingSkills(userSkills: string[], desiredRole: string): Promise<string[]> {
  const role = careerData.find(r => r.job.toLowerCase() === desiredRole.toLowerCase());
  if (!role) return []; // role not found

  // Subtract userSkills from requiredSkills
  const missing = role.requiredSkills.filter(skill => !userSkills.includes(skill));
  return missing;
}


// --- The AI flow below is temporarily disabled to focus on data-driven calculation. ---

const SkillGapAnalysisInputSchema = z.object({
  missingSkills: z
    .array(z.string())
    .describe('A list of skills the user is missing for their desired role.'),
  desiredRole: z.string().describe('The specific job role or career the user is aspiring to achieve.'),
});
export type SkillGapAnalysisInput = z.infer<typeof SkillGapAnalysisInputSchema>;

// The output from the AI will only be the learning plan now.
const AIOutputSchema = z.object({
  learningPlan: z.string().describe('A detailed, actionable, and encouraging step-by-step learning plan (3-5 steps) to acquire the missing skills. It MUST be formatted as Markdown with "###" for headings and "-" for bullet points.'),
});

// The final output of the flow includes the skills that were passed in.
const SkillGapAnalysisOutputSchema = AIOutputSchema.extend({
    missingSkills: z
    .array(z.string())
    .describe('A list of 5-8 crucial skills or knowledge areas the user is missing for their desired role.'),
});

export type SkillGapAnalysisOutput = z.infer<typeof SkillGapAnalysisOutputSchema>;


// export async function skillGapAnalysis(input: SkillGapAnalysisInput): Promise<SkillGapAnalysisOutput> {
//   return skillGapAnalysisFlow(input);
// }

const skillGapAnalysisSystemPrompt = `
You are an expert career coach. The user is aiming for the role of "{{desiredRole}}".
Here is a list of skills they are missing:
{{#each missingSkills}}
- {{this}}
{{/each}}

Your task is to generate a 3-5 step learning plan to help them acquire these skills.

CRITICAL FORMATTING: The plan must be formatted using Markdown. Use "### " for each step's heading and "- " for bullet points. For example:
\`\`\`markdown
### Step 1: Master Foundational Concepts
- Enroll in an online course on Coursera or edX covering the basics.
- Read a foundational book to build a strong theoretical base.

### Step 2: Build Practical Skills
- Complete 2-3 hands-on projects and host them on GitHub.
- Contribute to an open-source project in this domain.
\`\`\`

Provide a practical and motivational report that empowers the user to take the next steps in their career journey.
`;

const prompt = ai.definePrompt({
  name: 'skillGapAnalysisPrompt',
  input: {schema: SkillGapAnalysisInputSchema},
  output: {schema: AIOutputSchema},
  prompt: skillGapAnalysisSystemPrompt,
});

const fallbackModel: Model = 'googleai/gemini-2.0-flash';

// const skillGapAnalysisFlow = ai.defineFlow(
//   {
//     name: 'skillGapAnalysisFlow',
//     inputSchema: SkillGapAnalysisInputSchema,
//     outputSchema: SkillGapAnalysisOutputSchema,
//   },
//   async (input) => {
//     let aiResult;
//     try {
//       const {output} = await prompt(input);
//       aiResult = output!;
//     } catch (error) {
//       console.log('Primary model failed, switching to fallback.', error);
//       const {output} = await ai.generate({
//         model: fallbackModel,
//         prompt: skillGapAnalysisSystemPrompt,
//         input: input,
//         output: {
//           schema: AIOutputSchema,
//         },
//       });
//       aiResult = output!;
//     }

//     return {
//       ...aiResult,
//       missingSkills: input.missingSkills, // Add the original missing skills to the final output
//     };
//   }
// );
