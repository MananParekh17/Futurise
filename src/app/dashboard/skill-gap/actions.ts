
"use server"

import { calculateMissingSkills } from "@/ai/flows/skill-gap-analyzer"
import { z } from "zod"

const SkillGapFormSchema = z.object({
  userSkills: z.array(z.string()).min(1, "Please select at least one skill."),
  desiredRole: z.string().min(3, "Please select your desired role."),
})

export type FormState = {
  status: "success" | "error" | "idle"
  message: string
  data?: {
    missingSkills: string[];
    learningPlan: string;
  }
}

export async function analyzeSkills(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
    
  const userSkills = formData.getAll("userSkills") as string[];
  const desiredRole = formData.get("desiredRole") as string;

  const validatedFields = SkillGapFormSchema.safeParse({
    userSkills,
    desiredRole,
  })

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.issues.map((issue) => issue.message).join(", ")
    return {
      status: "error",
      message: errorMessage || "Please fill in all required fields.",
    }
  }

  const missingSkills = await calculateMissingSkills(validatedFields.data.userSkills, validatedFields.data.desiredRole);
  
  const learningPlan = missingSkills.length === 0 
    ? "### Congratulations!\n\nBased on your selections, you already possess all the required skills for the **" + validatedFields.data.desiredRole + "** role. Keep your skills sharp and consider exploring advanced topics to stay ahead in your field!"
    : "### Your Next Steps\n\nFocus on acquiring the skills listed above. You can use the **Daily Learning** and **Knowledge Test** pages to find resources and test your understanding of these specific topics.";

  return {
    status: "success",
    message: "Analysis successful!",
    data: {
        missingSkills,
        learningPlan,
    },
  }
}
