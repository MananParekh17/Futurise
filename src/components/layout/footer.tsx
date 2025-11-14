import Link from "next/link"
import { FuturiseIcon } from "@/components/icons"
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <FuturiseIcon className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline text-lg">Futurise</span>
            </Link>
            <p className="text-sm text-muted-foreground">AI-powered career guidance for the future.</p>
            <div className="flex gap-4">
              <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
              <Link href="#" aria-label="GitHub"><Github className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
              <Link href="#" aria-label="LinkedIn"><Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-headline font-medium">Product</h4>
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-headline font-medium">Company</h4>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-headline font-medium">Legal</h4>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Futurise. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
