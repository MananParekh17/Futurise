
'use server';
/**
 * @fileOverview Career prediction AI agent that uses a psychometric test to recommend careers.
 *
 * - careerPrediction - A function that handles the career prediction process.
 * - CareerPredictionInput - The input type for the careerPrediction function.
 * - CareerPredictionOutput - The return type for the careerPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { careerData } from '@/lib/career-data';

const allCareers = careerData.map(c => c.job);

const CareerPredictionInputSchema = z.object({
  answers: z
    .array(z.string())
    .describe('An array of answers from the psychometric test. There are 50 answers in total.'),
  careerAspirations: z
    .string()
    .describe('The careers the student is interested in.'),
});
export type CareerPredictionInput = z.infer<typeof CareerPredictionInputSchema>;

const CareerPredictionOutputSchema = z.object({
  suggestedCareers: z
    .array(z.string())
    .describe('A list of 3-5 careers suggested for the student from the provided list.'),
  reasoning: z.string().describe('A detailed reasoning (2-3 paragraphs) behind the career suggestions, analyzing the user\'s personality, behavior, interests, and reasoning based on their answers.'),
});
export type CareerPredictionOutput = z.infer<typeof CareerPredictionOutputSchema>;

export async function careerPrediction(input: CareerPredictionInput): Promise<CareerPredictionOutput> {
  return careerPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerPredictionPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: CareerPredictionInputSchema},
  output: {schema: CareerPredictionOutputSchema},
  prompt: `You are an expert career counselor and psychometric analyst. Your task is to provide insightful career recommendations to a student based on their answers to a comprehensive 50-question psychometric test.

**Your Task:**

1.  **Analyze the Answers:** Carefully analyze the student's answers.
2.  **Suggest Careers:** Based on your analysis, you MUST suggest 3 to 5 career paths from the following list of available careers:
    ${allCareers.join(', ')}
3.  **Provide Reasoning:** In the 'reasoning' field, provide a detailed, multi-paragraph analysis explaining *why* you are suggesting these specific careers. Connect the user's personality traits, behaviors, and values (as indicated by their answers) to the recommended career paths.
4.  **Consider Aspirations:** The user may have provided their own career aspirations. If they did, analyze how their test results align or misalign with their stated goals and incorporate this into your reasoning. If their stated aspiration is a good fit, you may include it in your suggestions.

**Student's Information:**
*   **Psychometric Test Answers:** {{{answers}}}
*   **Stated Career Aspirations:** {{{careerAspirations}}}

Provide a thoughtful, empowering, and actionable report that will genuinely help the student in their career journey.
`,
});

const careerPredictionFlow = ai.defineFlow(
  {
    name: 'careerPredictionFlow',
    inputSchema: CareerPredictionInputSchema,
    outputSchema: CareerPredictionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model returned an empty response. Please try again.');
    }
    return output;
  }
);
