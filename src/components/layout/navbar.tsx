
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FuturiseIcon } from "@/components/icons"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ThemeToggle } from "../theme-toggle"
import { SidebarTrigger } from "../ui/sidebar"

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#testimonials", label: "Testimonials" },
]

export function Navbar() {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith("/dashboard")
  const isAuthPage = pathname === "/login" || pathname === "/signup"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
            {isDashboard && <SidebarTrigger className="md:hidden"/>}
            <Link href="/" className="flex items-center gap-2 mr-6">
              <FuturiseIcon className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline text-lg">Futurise</span>
            </Link>
        </div>
        
        {!isDashboard && (
            <nav className="hidden md:flex items-center gap-6 text-sm">
                {navLinks.map(({ href, label }) => (
                    <Link
                    key={href}
                    href={href}
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                    {label}
                    </Link>
                ))}
            </nav>
        )}

        <div className="flex flex-1 items-center justify-end gap-2">
            <ThemeToggle />
            {!isDashboard && !isAuthPage ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Button asChild>
                      <Link href="/login">Sign In</Link>
                  </Button>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <FuturiseIcon className="h-6 w-6 text-primary" />
                                <span className="font-bold font-headline text-lg">Futurise</span>
                            </div>
                        </div>
                        <nav className="flex flex-col gap-4 text-lg">
                        {navLinks.map(({ href, label }) => (
                            <Link
                            key={href}
                            href={href}
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                            {label}
                            </Link>
                        ))}
                        </nav>
                        <div className="mt-auto flex flex-col gap-2">
                           <Button asChild><Link href="/login">Sign In</Link></Button>
                        </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : null }
        </div>
      </div>
    </header>
  )
}
