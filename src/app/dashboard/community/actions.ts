
"use client";

import { addDoc, collection, serverTimestamp, type Firestore } from "firebase/firestore";
import { z } from "zod";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const ChatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
  userName: z.string().min(1),
  userAvatar: z.string().url().or(z.literal("")),
  userUid: z.string().min(1),
});

export type SendMessageInput = z.infer<typeof ChatFormSchema>;

export function sendMessage(
  firestore: Firestore | null,
  data: SendMessageInput
): { success: boolean; message: string } {
  const validatedFields = ChatFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Message cannot be empty or user data is missing.",
    };
  }

  if (!firestore) {
    return {
      success: false,
      message: "Database connection is not available. Please try again later.",
    };
  }

  const communityPostsCol = collection(firestore, "community_posts");

  const postData = {
      text: validatedFields.data.message,
      user: {
        name: validatedFields.data.userName,
        avatar: validatedFields.data.userAvatar,
        uid: validatedFields.data.userUid,
      },
      createdAt: serverTimestamp(),
    };

  // Use addDoc via the non-blocking helper
  addDocumentNonBlocking(communityPostsCol, postData);
    
  // Optimistically return success
  return {
    success: true,
    message: "Message sent!",
  };
}
