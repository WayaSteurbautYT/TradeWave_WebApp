import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { 
  MessageSquare, 
  Send, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile,
  Phone,
  Video,
  Star,
  Shield,
  Archive,
  Trash2,
  Plus,
  Clock,
  CheckCheck,
  Circle,
  User,
  Briefcase
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function MessagesPage() {
  const { user, isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
      // Simulate real-time updates every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/conversations`, {
        withCredentials: true
      })
      
      // Mock conversations for demo - replace with response.data when API is ready
      const mockConversations = [
        {
          id: "conv1",
          participants: [user.id, "creator1"],
          order_id: "order1",
          last_message_at: new Date().toISOString(),
          other_user: {
            id: "creator1",
            name: "Waya Steurbaut",
            username: "@wayacreate",
            avatar: "",
            status: "online",
            verified: true
          },
          last_message: "Thanks for the amazing Minecraft tutorial! The castle build was perfect.",
          unread_count: 2,
          project: {
            title: "Epic Castle Build Tutorial",
            status: "completed"
          }
        },
        {
          id: "conv2", 
          participants: [user.id, "creator2"],
          order_id: "order2",
          last_message_at: new Date(Date.now() - 3600000).toISOString(),
          other_user: {
            id: "creator2",
            name: "Alex Chen",
            username: "@blendermaster",
            avatar: "",
            status: "away",
            verified: true
          },
          last_message: "I've uploaded the revised 3D model. Let me know what you think!",
          unread_count: 0,
          project: {
            title: "Character 3D Model",
            status: "in_progress"
          }
        },
        {
          id: "conv3",
          participants: [user.id, "client1"],
          order_id: null,
          last_message_at: new Date(Date.now() - 7200000).toISOString(),
          other_user: {
            id: "client1",
            name: "Sarah Johnson",
            username: "@videoeditor",
            avatar: "",
            status: "offline",
            verified: false
          },
          last_message: "The video editing service looks great! When can we start?",
          unread_count: 1,
          project: {
            title: "YouTube Intro Video",
            status: "pending"
          }
        }
      ]
      
      setConversations(mockConversations)
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      // Mock messages for demo - replace with API call when ready
      const mockMessages = [
        {
          id: "msg1",
          conversation_id: conversationId,
          sender_id: conversationId === "conv1" ? "creator1" : user.id,
          message: "Hi! I'm interested in your Minecraft building service. Can you create a medieval castle for my server?",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true
        },
        {
          id: "msg2",
          conversation_id: conversationId,
          sender_id: conversationId === "conv1" ? user.id : "creator1",
          message: "Absolutely! I'd be happy to help. I can create an epic medieval castle with full tutorial included. What's your budget and timeline?",
          timestamp: new Date(Date.now() - 82800000).toISOString(),
          read: true
        },
        {
          id: "msg3",
          conversation_id: conversationId,
          sender_id: conversationId === "conv1" ? "creator1" : user.id,
          message: "Perfect! Budget is around 500 credits and I need it within a week. Can you also include the schematic files?",
          timestamp: new Date(Date.now() - 79200000).toISOString(),
          read: true
        },
        {
          id: "msg4",
          conversation_id: conversationId,
          sender_id: conversationId === "conv1" ? user.id : "creator1",
          message: "That works perfectly! I'll include:\n• Complete castle build\n• Step-by-step tutorial video\n• Schematic files\n• Bonus interior design tips\n\nShall we start?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        {
          id: "msg5",
          conversation_id: conversationId,
          sender_id: conversationId === "conv1" ? "creator1" : user.id,
          message: "Amazing! Let's do it. I'm sending the order now.",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: false
        }
      ]
      
      setMessages(mockMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const tempMessage = {
      id: `temp_${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      message: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage("")

    try {
      await axios.post(`${API}/conversations/${selectedConversation.id}/messages`, {
        message: newMessage
      }, { withCredentials: true })
      
      // Refresh messages after sending
      setTimeout(() => fetchMessages(selectedConversation.id), 500)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"  
      case "offline": return "bg-gray-400"
      default: return "bg-gray-400"
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to access your messages and communicate with creators.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Login to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          💬 Messages 
          <span className="gradient-gaming bg-clip-text text-transparent"> Hub</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stay connected with your clients and creators in real-time
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="gaming-card h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Conversations</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation by messaging a creator or client
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 cursor-pointer transition-colors border-b hover:bg-accent ${
                          selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.other_user.avatar} />
                              <AvatarFallback className="bg-gradient-gaming text-white">
                                {conversation.other_user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(conversation.other_user.status)} rounded-full border-2 border-background`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm truncate">
                                {conversation.other_user.name}
                              </span>
                              {conversation.other_user.verified && (
                                <Badge className="text-xs bg-blue-500">✓</Badge>
                              )}
                              {conversation.unread_count > 0 && (
                                <Badge className="bg-red-500 text-white text-xs">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground truncate mb-1">
                              {conversation.last_message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(conversation.last_message_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <div className="flex items-center space-x-2">
                                {conversation.order_id && (
                                  <div className="flex items-center space-x-1">
                                    <Briefcase className="h-3 w-3" />
                                    <span className="text-xs">Order</span>
                                  </div>
                                )}
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    conversation.project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    conversation.project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {conversation.project.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          <Card className="gaming-card h-full flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.other_user.avatar} />
                          <AvatarFallback className="bg-gradient-gaming text-white">
                            {selectedConversation.other_user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(selectedConversation.other_user.status)} rounded-full border-2 border-white`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{selectedConversation.other_user.name}</h3>
                          {selectedConversation.other_user.verified && (
                            <Badge className="text-xs bg-blue-500">✓</Badge>
                          )}
                          <Badge variant="secondary" className={`text-xs capitalize ${
                            selectedConversation.other_user.status === 'online' ? 'bg-green-100 text-green-800' :
                            selectedConversation.other_user.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedConversation.other_user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Project: {selectedConversation.project.title}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user.id
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`p-3 rounded-lg ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground ml-auto'
                                  : 'bg-accent'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                            </div>
                            <div className={`flex items-center space-x-1 mt-1 text-xs text-muted-foreground ${
                              isOwn ? 'justify-end' : 'justify-start'
                            }`}>
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isOwn && (
                                <CheckCheck className={`h-3 w-3 ${message.read ? 'text-blue-500' : 'text-gray-400'}`} />
                              )}
                            </div>
                          </div>
                          
                          {!isOwn && (
                            <Avatar className="h-8 w-8 order-1 mr-2">
                              <AvatarImage src={selectedConversation.other_user.avatar} />
                              <AvatarFallback className="bg-gradient-gaming text-white text-xs">
                                {selectedConversation.other_user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="min-h-[40px] max-h-[120px] resize-none"
                        rows="1"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="gaming-card"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* No Conversation Selected */
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the left to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card className="gaming-card">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Rate Creator</h3>
            <p className="text-sm text-muted-foreground">Leave feedback after project completion</p>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Report Issue</h3>
            <p className="text-sm text-muted-foreground">Get help with any problems</p>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-4 text-center">
            <Archive className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Archive Chat</h3>
            <p className="text-sm text-muted-foreground">Archive completed conversations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}