import Link from "next/link"
import { FuturiseIcon } from "@/components/icons"
import { Github, Twitter, Linkedin } from "lucide-react"

export function FooterDashboard() {
  return (
    <footer className="border-t bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Futurise. All rights reserved.
      </div>
    </footer>
  )
}
