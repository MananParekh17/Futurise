"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { FuturiseIcon } from "@/components/icons"
import {
  LayoutDashboard,
  BrainCircuit,
  Target,
  BookOpen,
  TestTube,
  Award,
  Users,
  LogOut,
  Settings,
  ChevronLeft,
  User,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { signOut, useUser } from "@/firebase/auth/use-user"
import { Button } from "../ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/dashboard/career-prediction", label: "Career Prediction", icon: <BrainCircuit /> },
  { href: "/dashboard/skill-gap", label: "Skill Gap Analyzer", icon: <Target /> },
  { href: "/dashboard/daily-learning", label: "Daily Learning", icon: <BookOpen /> },
  { href: "/dashboard/knowledge-test", label: "Knowledge Test", icon: <TestTube /> },
  { href: "/dashboard/streak", label: "Points & Rewards", icon: <Award /> },
  { href: "/dashboard/community", label: "Community Chat", icon: <Users /> },
]

const bottomNavItems = [
    { href: "/dashboard/profile", label: "Profile", icon: <User /> },
    { href: "/#", label: "Settings", icon: <Settings /> },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const { user } = useUser()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <FuturiseIcon className="h-6 w-6 text-primary" />
            <span
              className="font-bold font-headline text-lg group-data-[collapsible=icon]:hidden"
            >
              Futurise
            </span>
          </Link>
          <SidebarTrigger>
            <ChevronLeft />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
            {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                >
                    <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
        <Separator className="my-2" />
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50 mb-2">
          <Avatar>
            <AvatarImage src={user?.photoURL ?? ""} alt={user?.displayName ?? ""} />
            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">{user?.displayName}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="ml-auto group-data-[collapsible=icon]:hidden">
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  )
}
