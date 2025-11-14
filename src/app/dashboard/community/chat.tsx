
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage, type SendMessageInput } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useMemoFirebase } from "@/firebase";

type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar: string;
    uid: string;
  };
  createdAt: Timestamp | null;
};

export function Chat() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, "community_posts"), orderBy("createdAt", "asc")) : null
  , [firestore]);
  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 100)
    }
  }, [messages]);

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !firestore) return;

    const formData = new FormData(event.currentTarget);
    const message = formData.get("message") as string;
    
    if (!message) {
        toast({ title: "Error", description: "Message cannot be empty.", variant: "destructive" });
        return;
    }

    const input: SendMessageInput = {
      message,
      userName: user.displayName || "Anonymous",
      userAvatar: user.photoURL || "",
      userUid: user.uid,
    };

    startTransition(() => {
        const result = sendMessage(firestore, input);
        if (result.success) {
          formRef.current?.reset();
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
        }
    });
  }

  return (
    <Card className="h-[75vh] flex flex-col">
      <CardHeader>
        <CardTitle>Live Community Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 p-6">
            {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {messages?.map((msg) => (
              <div key={msg.id} className={cn("flex items-start gap-4", msg.user.uid === user?.uid && "flex-row-reverse")}>
                <Avatar className="w-10 h-10 border">
                  <AvatarImage src={msg.user.avatar} />
                  <AvatarFallback>{msg.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={cn("flex-1", msg.user.uid === user?.uid && "text-right")}>
                  <div className={cn("flex items-baseline gap-2", msg.user.uid === user?.uid && "flex-row-reverse")}>
                    <p className="font-semibold text-base">{msg.user.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {isClient && msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={cn("mt-1 bg-secondary p-3 rounded-lg", msg.user.uid === user?.uid ? "bg-primary text-primary-foreground rounded-br-none" : "rounded-tl-none")}>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t bg-background">
        <form ref={formRef} onSubmit={handleSendMessage} className="flex w-full items-center gap-4">
          <Input name="message" placeholder="Type your message..." autoComplete="off" className="h-12 text-base"/>
          <Button type="submit" size="icon" disabled={isPending} className="shrink-0">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5"/>}
            <span className="sr-only">Send Message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
