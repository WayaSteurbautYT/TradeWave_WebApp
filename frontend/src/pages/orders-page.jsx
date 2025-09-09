import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  MessageSquare,
  FileText,
  Download,
  Upload,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  TrendingUp,
  Play,
  Pause,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function OrdersPage() {
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated])

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        withCredentials: true
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, 
        { new_status: newStatus },
        { withCredentials: true }
      )
      
      // Refresh orders
      fetchOrders()
      alert(`Order status updated to ${newStatus}`)
      
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update order status')
    }
  }

  const approveMilestone = async (orderId, milestoneId) => {
    try {
      await axios.post(`${API}/orders/${orderId}/milestones/${milestoneId}/approve`, {}, {
        withCredentials: true
      })
      
      fetchOrders()
      alert('Milestone approved and payment released!')
      
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to approve milestone')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'accepted': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'in_progress': return <Play className="h-4 w-4 text-green-500" />
      case 'delivered': return <Upload className="h-4 w-4 text-purple-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      case 'disputed': return <AlertCircle className="h-4 w-4 text-orange-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'accepted': return 'bg-blue-500'
      case 'in_progress': return 'bg-green-500'
      case 'delivered': return 'bg-purple-500'
      case 'completed': return 'bg-green-600'
      case 'cancelled': return 'bg-red-500'
      case 'disputed': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getMilestoneProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0
    const completed = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length
    return (completed / milestones.length) * 100
  }

  const filterOrders = (status) => {
    switch (status) {
      case 'active':
        return orders.filter(order => 
          ['pending', 'accepted', 'in_progress', 'delivered'].includes(order.status)
        )
      case 'completed':
        return orders.filter(order => order.status === 'completed')
      case 'cancelled':
        return orders.filter(order => 
          ['cancelled', 'disputed'].includes(order.status)
        )
      default:
        return orders
    }
  }

  const OrderCard = ({ order }) => {
    const isClient = order.client_id === user.id
    const isCreator = order.creator_id === user.id
    
    return (
      <Card className="gaming-card hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          {/* Order Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-gaming text-white">
                  {isClient ? "C" : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold line-clamp-1">Order #{order.id.slice(0, 8)}</h3>
                <p className="text-sm text-muted-foreground">
                  {isClient ? "You hired" : "You were hired by"} {isClient ? "Creator" : "Client"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
              </Badge>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3 mb-4">
            <div className="text-sm">
              <span className="font-medium">Package:</span> {order.package_type}
            </div>
            <div className="text-sm">
              <span className="font-medium">Amount:</span> {order.total_amount} credits
            </div>
            <div className="text-sm">
              <span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleDateString()}
            </div>
            {order.delivery_date && (
              <div className="text-sm">
                <span className="font-medium">Delivery:</span> {new Date(order.delivery_date).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Milestones Progress */}
          {order.has_milestones && order.milestones && order.milestones.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {order.milestones.filter(m => m.status === 'approved').length} / {order.milestones.length} milestones
                </span>
              </div>
              <Progress value={getMilestoneProgress(order.milestones)} className="h-2" />
            </div>
          )}

          {/* Requirements Preview */}
          <div className="mb-4">
            <span className="text-sm font-medium">Requirements:</span>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {order.requirements}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedOrder(order)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {/* Creator Actions */}
              {isCreator && order.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                    className="gaming-card"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  >
                    Decline
                  </Button>
                </>
              )}
              
              {isCreator && order.status === 'accepted' && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'in_progress')}
                  className="gaming-card"
                >
                  Start Work
                </Button>
              )}
              
              {isCreator && order.status === 'in_progress' && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                  className="gaming-card"
                >
                  Mark Delivered
                </Button>
              )}
              
              {/* Client Actions */}
              {isClient && order.status === 'delivered' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="gaming-card"
                  >
                    Accept Delivery
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrderStatus(order.id, 'revision_requested')}
                  >
                    Request Revision
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null

    const isClient = order.client_id === user.id
    
    return (
      <Dialog open={!!order} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Order #{order.id.slice(0, 8)}</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ')}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Package:</span> {order.package_type}
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span> {order.total_amount} credits
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  {order.delivery_date && (
                    <div>
                      <span className="font-medium">Due Date:</span> {new Date(order.delivery_date).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{order.requirements}</p>
                </CardContent>
              </Card>
            </div>

            {/* Milestones */}
            {order.has_milestones && order.milestones && order.milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span>{milestone.amount} credits</span>
                            {milestone.due_date && (
                              <span className="text-muted-foreground">
                                Due: {new Date(milestone.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              milestone.status === 'approved' ? 'bg-green-500' :
                              milestone.status === 'pending' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }
                          >
                            {milestone.status}
                          </Badge>
                          {isClient && milestone.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => approveMilestone(order.id, milestone.id)}
                              className="gaming-card"
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivered Files */}
            {order.delivered_files && order.delivered_files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivered Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.delivered_files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Order Management</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view your orders.
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
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          📋 Order 
          <span className="gradient-gaming bg-clip-text text-transparent"> Management</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track your active orders, manage milestones, and communicate with clients and creators.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Active Orders",
            value: filterOrders('active').length,
            icon: Play,
            color: "text-blue-500"
          },
          {
            label: "Completed",
            value: filterOrders('completed').length,
            icon: CheckCircle,
            color: "text-green-500"
          },
          {
            label: "In Progress",
            value: orders.filter(o => o.status === 'in_progress').length,
            icon: RefreshCw,
            color: "text-purple-500"
          },
          {
            label: "Total Orders",
            value: orders.length,
            icon: TrendingUp,
            color: "text-orange-500"
          }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="gaming-card">
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Orders List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filterOrders('active').length === 0 ? (
            <Card className="gaming-card">
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
                <p className="text-muted-foreground">
                  Start by hiring creators or creating services to get orders.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterOrders('active').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterOrders('completed').length === 0 ? (
            <Card className="gaming-card">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Orders</h3>
                <p className="text-muted-foreground">
                  Completed orders will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterOrders('completed').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filterOrders('cancelled').length === 0 ? (
            <Card className="gaming-card">
              <CardContent className="p-8 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cancelled Orders</h3>
                <p className="text-muted-foreground">
                  Cancelled and disputed orders will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterOrders('cancelled').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  )
}