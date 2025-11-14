
'use client'

import { Sidebar } from '@/components/ui/sidebar'
import { DashboardNav } from '@/components/dashboard/nav'
import { FooterDashboard } from '@/components/layout/footer-dashboard'
import { useUser } from '@/firebase/auth/use-user'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getFirestore } from 'firebase/firestore'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import React from 'react'
import { useFirebase } from '@/firebase'
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates'
import { FirestorePermissionError, errorEmitter } from '@/firebase'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const [isDataLoading, setIsDataLoading] = useState(true)
  const { firestore } = useFirebase()

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  useEffect(() => {
    async function handleUserSetup() {
      if (user?.uid && firestore) {
        setIsDataLoading(true)
        const userRef = doc(firestore, 'users', user.uid)
        try {
          const userDoc = await getDoc(userRef)
          if (!userDoc.exists()) {
            const newUserDoc = {
              id: user.uid,
              userId: user.uid,
              displayName: user.displayName || 'Anonymous',
              email: user.email || '',
              totalPoints: 0,
              createdAt: serverTimestamp(),
            }
            // Use non-blocking setDoc with custom error handling
            setDoc(userRef, newUserDoc).catch((error) => {
              const contextualError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: newUserDoc,
              })
              errorEmitter.emit('permission-error', contextualError)
            })
          }
        } catch (error) {
          // Handle read error from getDoc
          const contextualError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'get',
          })
          errorEmitter.emit('permission-error', contextualError)
          console.error('Original getDoc error:', error)
        } finally {
          setIsDataLoading(false)
        }
      } else if (!isUserLoading) {
        setIsDataLoading(false)
      }
    }

    handleUserSetup()
  }, [user?.uid, user?.displayName, user?.email, isUserLoading, firestore])

  if (isUserLoading || isDataLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If we're done loading but still have no user, redirect (or show nothing)
  if (!user) {
    return null; // The first useEffect will handle the redirect
  }

  return (
    <div className="flex-1 flex">
      <Sidebar>
        <DashboardNav />
      </Sidebar>
      <div className="flex flex-col flex-1">
        <main className="flex-grow w-full">
          {children}
        </main>
        <FooterDashboard />
      </div>
    </div>
  )
}
