
'use server';
/**
 * @fileOverview Generates knowledge tests and evaluates answers.
 *
 * - generateTest - Creates a quiz on a given topic.
 * - evaluateTest - Evaluates the user's answers and provides a score.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Model} from 'genkit/model';

// Schema for a single question
const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the quiz question.'),
  options: z.array(z.string()).length(4).describe('A list of 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options.'),
});

// Schema for the generated quiz
const TestSchema = z.object({
  topic: z.string(),
  questions: z.array(QuestionSchema).min(5).max(10).describe('A list of 5-10 quiz questions.'),
});
export type Test = z.infer<typeof TestSchema>;

// Input for generating a test
const GenerateTestInputSchema = z.object({
  topic: z.string().describe('The topic for the knowledge test. Can be a single topic or a comma-separated list for a comprehensive test.'),
});
export type GenerateTestInput = z.infer<typeof GenerateTestInputSchema>;

const fallbackModel: Model = 'googleai/gemini-2.0-flash';

const generateTestPrompt = ai.definePrompt({
    name: 'generateTestPrompt',
    input: { schema: GenerateTestInputSchema },
    output: { schema: TestSchema },
    prompt: `You are an expert educator. Create a multiple-choice quiz with 5-10 questions on the topic of "{{{topic}}}". If multiple topics are provided, create a balanced quiz covering all of them. Each question should have 4 options and a clearly identified correct answer. The questions should be challenging but fair.`,
});

// Flow to generate a knowledge test
const generateTestFlow = ai.defineFlow(
  {
    name: 'generateTestFlow',
    inputSchema: GenerateTestInputSchema,
    outputSchema: TestSchema,
  },
  async input => {
    try {
      const { output } = await generateTestPrompt(input);
      if (!output) throw new Error("Primary model returned no output.");
      return output;
    } catch (error) {
      console.log('Primary model failed, switching to fallback.', error);
      const { output } = await ai.generate({
        model: fallbackModel,
        prompt: `You are an expert educator. Create a multiple-choice quiz with 5-10 questions on the topic of "${input.topic}". If multiple topics are provided, create a balanced quiz covering all of them. Each question should have 4 options and a clearly identified correct answer. The questions should be challenging but fair.`,
        output: {
          schema: TestSchema,
        },
      });
      if (!output) throw new Error("Fallback model also returned no output.");
      return output;
    }
  }
);

export async function generateTest(input: GenerateTestInput): Promise<Test> {
  return generateTestFlow(input);
}

// Input for evaluating a test
const EvaluateTestInputSchema = z.object({
  questions: z.array(QuestionSchema),
  userAnswers: z.array(z.string()).describe('The user\'s selected answers for each question.'),
});
export type EvaluateTestInput = z.infer<typeof EvaluateTestInputSchema>;

// Output for the evaluation
const EvaluateTestOutputSchema = z.object({
  score: z.number().int().min(0).describe('The number of correct answers.'),
  total: z.number().int().min(0).describe('The total number of questions.'),
  feedback: z.string().describe('Overall feedback for the user based on their performance.'),
});
export type EvaluateTestOutput = z.infer<typeof EvaluateTestOutputSchema>;


// Flow to evaluate the user's answers
export async function evaluateTest(input: EvaluateTestInput): Promise<EvaluateTestOutput> {
  let correctCount = 0;
  input.questions.forEach((q, index) => {
    if (q.correctAnswer === input.userAnswers[index]) {
      correctCount++;
    }
  });

  const score = correctCount;
  const total = input.questions.length;
  let feedback = '';

  const percentage = total > 0 ? (score / total) : 0;

  if (percentage < 0.5) {
    feedback = "You have some foundational gaps. It's a great opportunity to review the basics of this topic. Keep learning!";
  } else if (percentage < 0.8) {
    feedback = "Good effort! You have a decent understanding, but there's still room for improvement. Focus on the areas where you made mistakes.";
  } else {
    feedback = "Excellent work! You have a strong grasp of this topic. Keep up the great work and continue to challenge yourself.";
  }
  
  return { score, total, feedback };
}
