
"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FuturiseIcon } from "@/components/icons"
import { signInWithGoogle, useUser } from "@/firebase/auth/use-user"
import { useFirebase } from "@/firebase"

function LoginPageContent() {
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const { auth } = useFirebase()

  useEffect(() => {
    // This effect is now the single source of truth for redirection.
    // If the auth state is resolved and a user exists, redirect to the dashboard.
    if (!isUserLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isUserLoading, router])

  const handleGoogleSignIn = async () => {
    // The sign-in function's only job is to initiate the login.
    // The useEffect above will handle the redirection automatically
    // once the user state changes.
    await signInWithGoogle(auth)
  }

  // Render a loader while checking auth state. 
  // If a user exists, the useEffect above will redirect, so this page's content won't be shown for long.
  if (isUserLoading) {
    return <div className="w-full flex justify-center items-center min-h-[calc(100vh-4rem)]">Loading...</div>; 
  }
  
  // If not loading and no user, show the login page.
  // If a user IS present, this part won't be rendered because the useEffect will have already triggered the redirect.
  if (!user) {
    return (
      <div className="w-full lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 xl:min-h-[calc(100vh-4rem)]">
        <div className="hidden bg-muted lg:flex flex-col items-center justify-center p-10 text-center">
          <FuturiseIcon className="h-16 w-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold font-headline">Welcome Back to Futurise</h1>
          <p className="text-muted-foreground mt-4 text-lg">Your journey to career clarity continues here. Sign in to access your personalized dashboard.</p>
        </div>
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold font-headline">Login</h1>
              <p className="text-balance text-muted-foreground">
                Sign in to continue to your dashboard
              </p>
            </div>
            <Button variant="outline" className="w-full text-base py-6" onClick={handleGoogleSignIn}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px" className="mr-2 h-5 w-5">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.373-11.303-8H6.306C9.656,39.663,16.318,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.816,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Sign In with Google
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If there's a user and we're not loading, we're in the process of redirecting.
  // Return null or a loader to avoid flashing the login page.
  return null;
}


export default function LoginPage() {
  return (
    <LoginPageContent />
  )
}
