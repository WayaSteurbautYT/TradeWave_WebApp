import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Conversation } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  CheckCheck, 
  Phone, 
  Video, 
  Info 
} from "lucide-react"

export function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>(() => MockStore.getConversations())
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || "conv_1")
  const [messageText, setMessageText] = useState("")
  
  const [messages, setMessages] = useState([
    { id: "m1", sender_id: "usr_client_001", text: "Hey Waya! We loved the blockout on the modular sci-fi hovercrafts.", time: "10:14 AM" },
    { id: "m2", sender_id: "usr_waya_001", text: "Thanks! I'm currently unwrapping the UVs to optimize for 4K PBR textures with zero stretching.", time: "10:16 AM" },
    { id: "m3", sender_id: "usr_client_001", text: "Milestone 1 looks fantastic! Proceed with the substance texturing pass.", time: "10:20 AM" },
  ])

  const activeConv = conversations.find(c => c.id === activeConvId)
  const otherParticipant = activeConv?.participants.find(p => p.id !== user?.id) || activeConv?.participants[0]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender_id: user?.id || "usr_waya_001",
      text: messageText,
      time: "Just now"
    }

    setMessages(prev => [...prev, newMsg])
    MockStore.sendMessage(activeConvId, messageText)
    setMessageText("")

    // Simulated reply after 1.5 seconds
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_reply_${Date.now()}`,
          sender_id: otherParticipant?.id || "client",
          text: "Received! Looking forward to the next update on the project files.",
          time: "Just now"
        }
      ])
    }, 1500)
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-gradient-gaming rounded-xl text-white">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Messages &amp; Inquiries</h1>
          <p className="text-xs text-muted-foreground">Chat directly with clients and fellow creators.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 h-[600px] border rounded-2xl overflow-hidden bg-card">
        {/* Conversations Sidebar */}
        <div className="border-r flex flex-col">
          <div className="p-4 border-b">
            <Input placeholder="Search messages..." className="h-8 text-xs" />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {conversations.map((conv) => {
              const other = conv.participants.find(p => p.id !== user?.id) || conv.participants[0]
              const isSelected = conv.id === activeConvId
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? "bg-accent/60" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={other?.avatar_url} />
                      <AvatarFallback className="bg-gradient-gaming text-white text-xs">
                        {other?.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-bold text-xs truncate">{other?.display_name}</span>
                        <span className="text-[10px] text-muted-foreground">{conv.last_message_at}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{conv.last_message}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 flex flex-col h-full bg-background/50">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-card">
            <div className="flex items-center space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={otherParticipant?.avatar_url} />
                <AvatarFallback className="bg-gradient-gaming text-white text-xs">
                  {otherParticipant?.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-sm">{otherParticipant?.display_name}</h3>
                <span className="text-[10px] text-emerald-500 font-medium">● Online</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m) => {
              const isMine = m.sender_id === user?.id
              return (
                <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                  <div className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                    isMine 
                      ? "bg-primary text-primary-foreground rounded-br-none" 
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">{m.time}</span>
                </div>
              )
            })}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t bg-card flex items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 h-9 text-xs"
            />
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground h-9 px-3">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
