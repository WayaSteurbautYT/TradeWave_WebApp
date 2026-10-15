import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Radio, Users, MessageSquare, Play, Heart, Send } from "lucide-react"
import { showToast } from "@/components/ui/toaster"

export function StreamingPage() {
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState([
    { user: "DevGamer", text: "Are you using Blender 4.2 for the retopology?", time: "12:01" },
    { user: "PixelArtist", text: "That trim sheet technique saves so much texture memory!", time: "12:03" },
    { user: "IndieStudio", text: "Can we use this modular asset in commercial games?", time: "12:04" },
  ])

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    setChatMessages(prev => [...prev, { user: "You", text: chatInput, time: "Just now" }])
    setChatInput("")
  }

  return (
    <div className="container py-8 max-w-6xl space-y-6">
      {/* Stream Player Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border shadow-2xl flex items-center justify-center">
            {/* Stream Simulation Canvas */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-primary/20 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary animate-pulse mb-3">
                <Play className="h-8 w-8 ml-1 fill-current" />
              </div>
              <h3 className="text-xl font-bold text-white">Live Workshop: Building Sci-Fi Game Props</h3>
              <p className="text-xs text-white/70 max-w-md mt-1">
                Hosted by Waya Steurbaut • Live sculpting, retopology &amp; UE5 master material setup
              </p>
            </div>

            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <Badge className="bg-red-600 text-white animate-pulse text-xs font-bold px-2 py-0.5">
                ● LIVE NOW
              </Badge>
              <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0 text-xs">
                <Users className="h-3 w-3 mr-1 inline" />
                1,420 Viewers
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border border-primary">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" />
                <AvatarFallback className="bg-gradient-gaming text-white">W</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-base">Waya Steurbaut Live Stream</h2>
                <p className="text-xs text-muted-foreground">Lead YouTube Creator • WayaCreate</p>
              </div>
            </div>

            <Button
              size="sm"
              className="bg-primary text-primary-foreground text-xs"
              onClick={() => showToast({ title: "Followed Creator", description: "You will be alerted when Waya goes live." })}
            >
              <Heart className="mr-1.5 h-3.5 w-3.5 text-red-500 fill-current" />
              Follow Stream
            </Button>
          </div>
        </div>

        {/* Live Chat Sidebar */}
        <div className="border rounded-2xl bg-card flex flex-col h-[480px]">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Stream Live Chat</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold">Slow Mode: Off</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {chatMessages.map((msg, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-primary text-[11px]">{msg.user}</span>
                  <span className="text-[9px] text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-foreground/90">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-2 border-t flex gap-1.5">
            <Input
              placeholder="Chat in live stream..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="h-8 text-xs"
            />
            <Button type="submit" size="sm" className="h-8 px-2.5 bg-primary text-primary-foreground">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
