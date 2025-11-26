import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, CheckCircle, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { SiPaypal } from 'react-icons/si';

interface CartItemWithProduct {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl?: string;
    type: string;
  };
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState('USD');
  const [discount, setDiscount] = useState(0);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    paymentMethod: '',
  });

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const discountAmount = subtotal * (discount / 100);
  const tax = (subtotal - discountAmount) * 0.1;
  const total = subtotal - discountAmount + tax;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!formData.paymentMethod) {
        throw new Error('Please select a payment method');
      }
      return await apiRequest('POST', '/api/orders', {
        fullName: formData.fullName,
        email: formData.email,
        currency: currency,
        paymentMethod: formData.paymentMethod,
        items: cartItems,
        total: total.toString(),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      // Simulate payment processing with delay, then auto-succeed
      setTimeout(() => {
        setStep(5);
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to process order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step === 1) {
      if (cartItems.length === 0) {
        toast({
          title: "Error",
          description: "Your cart is empty",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.fullName.trim() || !formData.email.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.paymentMethod) {
        toast({
          title: "Error",
          description: "Please select a payment method",
          variant: "destructive",
        });
        return;
      }
      setStep(4);
      checkoutMutation.mutate();
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in to checkout</h2>
            <p className="text-muted-foreground mb-6">You need to be logged in to make a purchase</p>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [30, 0, 30] }}
          transition={{ duration: 10, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-4 gap-2" data-testid="button-back-to-cart">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Checkout</h1>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-2 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-shrink-0">
              <motion.div
                animate={{ scale: step >= s ? 1 : 0.9 }}
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </motion.div>
              {s < 5 && (
                <motion.div
                  animate={{ scaleX: step > s ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`h-1 w-8 md:w-12 ${step > s ? 'bg-primary' : 'bg-muted'}`}
                  style={{ transformOrigin: 'left' }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1: Review Order */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Review Your Order</CardTitle>
                      <CardDescription>Verify your items and select currency</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Currency Selector */}
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger id="currency" data-testid="select-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD (United States)</SelectItem>
                            <SelectItem value="PHP">PHP (Philippines)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Items ({cartItems.length})</h3>
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 p-4 rounded-lg border border-border/50 bg-muted/30"
                            data-testid={`cart-item-${item.product.id}`}
                          >
                            {/* Product Image */}
                            <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                              {item.product.imageUrl ? (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                  No image
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{item.product.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.product.type === 'account' ? 'Account' : 'Combo List'}</p>
                              <p className="text-sm mt-1">
                                {item.quantity}x ${parseFloat(item.product.price).toFixed(2)}
                              </p>
                            </div>

                            {/* Total */}
                            <div className="text-right">
                              <p className="font-bold">
                                ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Discount Code */}
                      <div className="space-y-2 pt-4 border-t border-border">
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          max="100"
                          value={discount}
                          onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          placeholder="Enter discount percentage"
                          data-testid="input-discount"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 2: Customer Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>Verify your information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                          data-testid="input-fullname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          data-testid="input-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          data-testid="input-phone"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 3: Payment Method Selection */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                      <CardDescription>Select your preferred payment gateway</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* PayPal */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, paymentMethod: 'paypal' })}
                        className={`w-full p-6 rounded-lg border-2 transition-all ${
                          formData.paymentMethod === 'paypal'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        data-testid="button-payment-paypal"
                      >
                        <div className="flex items-center gap-4">
                          <SiPaypal className="h-12 w-12 text-blue-600" />
                          <div className="text-left flex-1">
                            <div className="font-semibold flex items-center gap-2">
                              Pay with PayPal
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Most Popular</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Fast & Secure payment</p>
                          </div>
                          {formData.paymentMethod === 'paypal' && <CheckCircle className="h-6 w-6 text-primary" />}
                        </div>
                      </motion.button>

                      {/* GCash */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, paymentMethod: 'gcash' })}
                        className={`w-full p-6 rounded-lg border-2 transition-all ${
                          formData.paymentMethod === 'gcash'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        data-testid="button-payment-gcash"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">GC</span>
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold flex items-center gap-2">
                              Pay with GCash
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PHP Only</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Scan QR or use GCash app</p>
                          </div>
                          {formData.paymentMethod === 'gcash' && <CheckCircle className="h-6 w-6 text-primary" />}
                        </div>
                      </motion.button>

                      {/* Binance Pay */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, paymentMethod: 'binance' })}
                        className={`w-full p-6 rounded-lg border-2 transition-all ${
                          formData.paymentMethod === 'binance'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        data-testid="button-payment-binance"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">₿</span>
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold flex items-center gap-2">
                              Pay with Binance Pay
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Crypto</span>
                            </div>
                            <p className="text-sm text-muted-foreground">USDT, BTC, ETH accepted</p>
                          </div>
                          {formData.paymentMethod === 'binance' && <CheckCircle className="h-6 w-6 text-primary" />}
                        </div>
                      </motion.button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 4: Payment Processing */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl">
                    <CardContent className="p-12 text-center space-y-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="h-16 w-16 mx-auto rounded-full border-4 border-primary/30 border-t-primary"
                      />
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
                        <p className="text-muted-foreground">Please wait while we process your payment securely</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 py-4">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-muted-foreground">Secured by industry-leading encryption</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 5: Order Confirmation */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl">
                    <CardContent className="p-12 text-center space-y-6">
                      <motion.div
                        animate={{ scale: [0.5, 1.1, 1] }}
                        transition={{ duration: 0.6 }}
                      >
                        <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
                      </motion.div>
                      <div>
                        <h2 className="text-3xl font-bold mb-2 text-green-500">Payment Successful!</h2>
                        <p className="text-muted-foreground">Your purchase is ready. Access it in your dashboard.</p>
                      </div>
                      <div className="bg-muted/50 p-6 rounded-lg space-y-3 text-left">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order Number:</span>
                          <span className="font-mono font-semibold" data-testid="text-order-number">#ORD-2024-001</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="capitalize font-semibold" data-testid="text-payment-method">{formData.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-bold" data-testid="text-total-amount">${total.toFixed(2)} {currency}</span>
                        </div>
                      </div>
                      <div className="pt-4 space-y-3">
                        <Button
                          className="w-full"
                          onClick={() => navigate('/dashboard')}
                          size="lg"
                          data-testid="button-view-dashboard"
                        >
                          View in Dashboard
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => navigate('/store')}
                          data-testid="button-continue-shopping"
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 5 && step < 4 && (
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={handleNext}
                  disabled={checkoutMutation.isPending}
                  data-testid="button-continue"
                >
                  {step === 3 && checkoutMutation.isPending ? 'Processing...' : 'Continue'}
                  {step < 3 && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {step < 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-4 border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-500">
                        <span>Discount ({discount}%)</span>
                        <span data-testid="text-discount">-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (10%)</span>
                      <span data-testid="text-tax">${tax.toFixed(2)}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-total">
                      ${total.toFixed(2)} {currency}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
