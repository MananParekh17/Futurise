import { Users } from "lucide-react"
import { Chat } from "./chat"

export default function CommunityPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold font-headline">Community Hub</h1>
            <p className="text-muted-foreground">Connect with peers, mentors, and industry experts.</p>
        </div>
      </div>

      <Chat />
    </div>
  )
}
