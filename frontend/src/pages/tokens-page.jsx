import React, { useState, useEffect } from "react"
import axios from "axios"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { 
  Coins,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Banknote,
  History,
  CreditCard,
  Wallet,
  Gift,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY)

// Purchase Component
function TokenPurchaseForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const { getTokenBalance } = useTokens()
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState("pro")
  const [clientSecret, setClientSecret] = useState("")

  const tokenPackages = {
    starter: {
      id: "starter",
      name: "Starter Pack",
      credits: 100,
      bonus: 0,
      price: 9.99,
      popular: false,
      description: "Perfect for trying premium content"
    },
    pro: {
      id: "pro", 
      name: "Pro Pack",
      credits: 500,
      bonus: 50,
      price: 39.99,
      popular: true,
      description: "Most popular choice for active creators"
    },
    business: {
      id: "business",
      name: "Business Pack", 
      credits: 1000,
      bonus: 150,
      price: 69.99,
      popular: false,
      description: "Great value for businesses and teams"
    },
    enterprise: {
      id: "enterprise",
      name: "Enterprise Pack",
      credits: 2500,
      bonus: 500,
      price: 149.99,
      popular: false,
      description: "Maximum value for power users"
    }
  }

  const handlePurchase = async () => {
    if (!stripe || !elements) return

    setLoading(true)
    try {
      // Create payment intent
      const response = await axios.post(`${API}/tokens/purchase`, {
        package_id: selectedPackage
      }, { withCredentials: true })

      const { client_secret } = response.data
      
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.display_name,
            email: user.email
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm purchase on backend
        await axios.post(`${API}/tokens/confirm-purchase`, {
          payment_intent_id: paymentIntent.id
        }, { withCredentials: true })

        alert(`Successfully purchased ${tokenPackages[selectedPackage].credits + tokenPackages[selectedPackage].bonus} credits!`)
        window.location.reload() // Refresh to show new balance
      }

    } catch (error) {
      alert(error.response?.data?.detail || error.message || 'Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Package Selection */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(tokenPackages).map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`cursor-pointer transition-all ${
              selectedPackage === pkg.id ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
            } ${pkg.popular ? 'border-primary' : ''}`}
            onClick={() => setSelectedPackage(pkg.id)}
          >
            {pkg.popular && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Most Popular</Badge>
              </div>
            )}
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold mb-2">{pkg.name}</h3>
              <div className="text-2xl font-bold text-primary mb-1">
                {pkg.credits + pkg.bonus}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {pkg.credits} + {pkg.bonus} bonus credits
              </div>
              <div className="text-lg font-semibold">${pkg.price}</div>
              <p className="text-xs text-muted-foreground mt-2">{pkg.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Form */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Card Details</Label>
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
            <span className="font-medium">Total:</span>
            <div className="text-right">
              <div className="text-lg font-bold">${tokenPackages[selectedPackage].price}</div>
              <div className="text-sm text-muted-foreground">
                {tokenPackages[selectedPackage].credits + tokenPackages[selectedPackage].bonus} credits
              </div>
            </div>
          </div>

          <Button 
            onClick={handlePurchase}
            disabled={!stripe || loading}
            className="w-full gaming-card"
            size="lg"
          >
            {loading ? "Processing..." : `Purchase ${tokenPackages[selectedPackage].name}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Withdrawal Component  
function TokenWithdrawal() {
  const { user } = useAuth()
  const { getTokenBalance } = useTokens()
  const [loading, setLoading] = useState(false)
  const [withdrawalData, setWithdrawalData] = useState({
    amount_credits: 100,
    payment_method: "stripe",
    payment_details: {}
  })

  const minWithdrawal = 100 // $10 equivalent
  const creditsToUSD = 0.10 // 1 credit = $0.10
  const maxWithdrawal = Math.min(getTokenBalance(), 5000) // Max $500 per withdrawal

  const handleWithdrawal = async () => {
    if (withdrawalData.amount_credits < minWithdrawal) {
      alert(`Minimum withdrawal is ${minWithdrawal} credits`)
      return
    }

    if (withdrawalData.amount_credits > getTokenBalance()) {
      alert("Insufficient credits")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API}/tokens/withdraw`, withdrawalData, {
        withCredentials: true
      })

      alert(`Withdrawal request submitted! You'll receive $${response.data.amount_usd} in 3-5 business days.`)
      setWithdrawalData({ ...withdrawalData, amount_credits: minWithdrawal })
      
    } catch (error) {
      alert(error.response?.data?.detail || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Banknote className="h-5 w-5" />
            <span>Withdraw to Real Money</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{getTokenBalance()}</div>
              <div className="text-sm text-muted-foreground">Available Credits</div>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${(getTokenBalance() * creditsToUSD).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">USD Value</div>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold">{minWithdrawal}</div>
              <div className="text-sm text-muted-foreground">Min Withdrawal</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount to Withdraw (Credits)</Label>
              <Input
                id="amount"
                type="number"
                min={minWithdrawal}
                max={maxWithdrawal}
                value={withdrawalData.amount_credits}
                onChange={(e) => setWithdrawalData({
                  ...withdrawalData,
                  amount_credits: parseInt(e.target.value) || minWithdrawal
                })}
              />
              <div className="text-sm text-muted-foreground mt-1">
                ≈ ${(withdrawalData.amount_credits * creditsToUSD).toFixed(2)} USD
              </div>
            </div>

            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select
                value={withdrawalData.payment_method}
                onValueChange={(value) => setWithdrawalData({
                  ...withdrawalData,
                  payment_method: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Bank Transfer (Stripe)</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Direct Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {withdrawalData.payment_method === "paypal" && (
              <div>
                <Label htmlFor="paypal_email">PayPal Email</Label>
                <Input
                  id="paypal_email"
                  type="email"
                  placeholder="your@email.com"
                  onChange={(e) => setWithdrawalData({
                    ...withdrawalData,
                    payment_details: { email: e.target.value }
                  })}
                />
              </div>
            )}

            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Processing Time</p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Withdrawals are processed within 3-5 business days. A small processing fee may apply.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleWithdrawal}
              disabled={loading || withdrawalData.amount_credits < minWithdrawal}
              className="w-full"
              size="lg"
            >
              {loading ? "Processing..." : `Withdraw $${(withdrawalData.amount_credits * creditsToUSD).toFixed(2)}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Transaction History Component
function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/tokens/transactions`, {
        withCredentials: true
      })
      setTransactions(response.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase': return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'earning': return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'spending': return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      case 'refund': return <ArrowDownLeft className="h-4 w-4 text-orange-500" />
      default: return <Coins className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <Card className="gaming-card">
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground">Your transaction history will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="gaming-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      ['purchase', 'earning', 'refund'].includes(transaction.transaction_type) 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {['purchase', 'earning', 'refund'].includes(transaction.transaction_type) ? '+' : '-'}
                      {transaction.amount} credits
                    </div>
                    {transaction.usd_amount && (
                      <div className="text-sm text-muted-foreground">
                        ${transaction.usd_amount}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Main Component
export function TokensPage() {
  const { user, isAuthenticated } = useAuth()
  const { getTokenBalance } = useTokens()

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Token Management</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to manage your tokens and credits.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Login to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-green-500 rounded-2xl flex items-center justify-center animate-gaming-pulse">
              <Coins className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            💰 Token 
            <span className="gradient-gaming bg-clip-text text-transparent"> Economy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Purchase credits, earn from your work, and withdraw real money. 
            1 credit = $0.10 USD
          </p>
        </div>

        {/* Balance Overview */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="gaming-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary">{getTokenBalance()}</div>
                  <div className="text-sm text-muted-foreground">Credits Available</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    ${(getTokenBalance() * 0.10).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">USD Value</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-3xl font-bold">{user?.total_earned || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="purchase" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="purchase">Purchase Credits</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw Money</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="purchase">
              <TokenPurchaseForm />
            </TabsContent>

            <TabsContent value="withdraw">
              <TokenWithdrawal />
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </div>

        {/* How it Works */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl">How the Token Economy Works</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Purchase Credits</h3>
                  <p className="text-sm text-muted-foreground">
                    Buy credit packages starting from $9.99
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Use for Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Hire creators, download content, use AI
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Gift className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Earn Credits</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete orders and sell content
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Banknote className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="font-semibold mb-2">4. Withdraw Money</h3>
                  <p className="text-sm text-muted-foreground">
                    Convert credits to real money
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Elements>
  )
}