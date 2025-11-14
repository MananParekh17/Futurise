
"use server"

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initAdmin } from "@/firebase/server";

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

export async function updateStreakAndPoints({ userId, points }: UpdatePointsInput): Promise<void> {
    if (!userId || points <= 0) return;

    const adminApp = await initAdmin();
    if (!adminApp) {
        console.error("Firebase Admin SDK not initialized. Cannot update user points.");
        return;
    }
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(userId);

    try {
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                console.log(`User document ${userId} not found.`);
                return;
            };

            const data = userDoc.data() as UserData;
            
            const newTotalPoints = (data.totalPoints || 0) + points;

            transaction.update(userRef, { 
                totalPoints: newTotalPoints,
            });
        });
        console.log(`Awarded ${points} points to user ${userId}.`);
    } catch (error) {
        console.error("Error in updateStreakAndPoints transaction: ", error);
        throw new Error("Failed to update user points.");
    }
}
