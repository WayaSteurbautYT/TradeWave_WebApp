import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Coins, Star, CreditCard } from 'lucide-react'
import { useTokens } from '@/contexts/TokenContext'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)

function PaymentForm({ selectedPackage, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const { confirmPayment } = useTokens()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      selectedPackage.client_secret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      }
    )

    if (error) {
      onError(error.message)
    } else {
      // Confirm payment on our backend
      const result = await confirmPayment(paymentIntent.id)
      if (result.success) {
        onSuccess(result.data)
      } else {
        onError(result.error)
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
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
      
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Pay ${selectedPackage.package?.price_usd}
      </Button>
    </form>
  )
}

export function TokenPurchaseModal({ isOpen, onClose }) {
  const { packages, purchaseTokens, loading } = useTokens()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [paymentStep, setPaymentStep] = useState('select') // 'select' | 'payment' | 'success'
  const [error, setError] = useState('')
  const [paymentData, setPaymentData] = useState(null)

  const handlePackageSelect = async (pkg) => {
    setError('')
    const result = await purchaseTokens(pkg.id)
    
    if (result.success) {
      setSelectedPackage({
        ...result,
        package: pkg
      })
      setPaymentStep('payment')
    } else {
      setError(result.error)
    }
  }

  const handlePaymentSuccess = (data) => {
    setPaymentData(data)
    setPaymentStep('success')
  }

  const handlePaymentError = (error) => {
    setError(error)
  }

  const handleClose = () => {
    setPaymentStep('select')
    setSelectedPackage(null)
    setError('')
    setPaymentData(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            {paymentStep === 'select' && 'Purchase Tokens'}
            {paymentStep === 'payment' && 'Complete Payment'}
            {paymentStep === 'success' && 'Payment Successful!'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {paymentStep === 'select' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Choose a token package to unlock premium content and services
            </p>
            
            <div className="grid gap-4">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    pkg.is_popular ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {pkg.is_popular && (
                        <Badge className="bg-primary">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl font-bold">${pkg.price_usd}</div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold text-primary">
                          {pkg.tokens.toLocaleString()} TW
                        </div>
                        {pkg.bonus_tokens > 0 && (
                          <div className="text-sm text-green-600">
                            +{pkg.bonus_tokens} bonus tokens
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {(pkg.tokens + pkg.bonus_tokens).toLocaleString()} tokens
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {paymentStep === 'payment' && selectedPackage && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{selectedPackage.package.name} Package</h3>
                    <p className="text-sm text-muted-foreground">
                      {(selectedPackage.package.tokens + selectedPackage.package.bonus_tokens).toLocaleString()} tokens
                    </p>
                  </div>
                  <div className="text-2xl font-bold">
                    ${selectedPackage.package.price_usd}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Elements stripe={stripePromise}>
              <PaymentForm
                selectedPackage={selectedPackage}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>

            <Button variant="outline" onClick={() => setPaymentStep('select')} className="w-full">
              Back to Packages
            </Button>
          </div>
        )}

        {paymentStep === 'success' && paymentData && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Coins className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Payment Successful!</h3>
              <p className="text-muted-foreground">
                {paymentData.tokens_added.toLocaleString()} tokens have been added to your account
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span>New Token Balance:</span>
                  <span className="text-2xl font-bold text-primary">
                    {paymentData.new_balance.toLocaleString()} TW
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleClose} className="w-full">
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}