
"use server"

import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/firebase/server";
import { FieldValue } from 'firebase-admin/firestore';


export type UserData = {
    id: string;
    userId: string;
    displayName: string;
    email: string;
    totalPoints: number;
    createdAt: Date;
}

type UpdatePointsInput = {
    userId: string;
    points: number;
}

export async function updateStreakAndPoints({ userId, points }: UpdatePointsInput): Promise<{success: boolean, message: string}> {
    if (!userId || !points || points <= 0) {
        const message = `Invalid input for points update: userId=${userId}, points=${points}`;
        console.log(message);
        return { success: false, message };
    };

    try {
        const adminApp = await initAdmin();
        const db = getFirestore(adminApp);
        const userRef = db.collection('users').doc(userId);

        // Use the atomic increment operation. This is robust and safe.
        await userRef.update({
            totalPoints: FieldValue.increment(points)
        });
        
        const successMessage = `Successfully awarded ${points} points to user ${userId}.`;
        console.log(successMessage);
        return { success: true, message: successMessage };

    } catch (error) {
        const errorMessage = `Error in updateStreakAndPoints for user ${userId}:`;
        console.error(errorMessage, error);
        
        // If the error is because the document doesn't exist, let's be more specific.
        if ((error as any).code === 5) { // 'NOT_FOUND' error code
             const notFoundMessage = `Transaction failed: User document does not exist for userId: ${userId}. Cannot increment points.`;
             console.error(notFoundMessage);
             return { success: false, message: notFoundMessage };
        }
        
        const message = error instanceof Error ? error.message : "Failed to update points due to a database error.";
        return { success: false, message };
    }
}
