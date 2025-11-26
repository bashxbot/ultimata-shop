import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Package, Download, Eye, Clock, CheckCircle, CreditCard, Settings, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { SiPaypal } from 'react-icons/si';

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  productName: string;
  productType: string;
  product?: {
    id: number;
    name: string;
    price: string;
    imageUrl?: string;
    type: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  total: string;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  currency: string;
  paymentMethod: string;
  createdAt: string;
  items?: OrderItem[];
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('purchases');
  const tabsRef = useRef<HTMLDivElement>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });

  const scrollToTabs = () => {
    if (tabsRef.current) {
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Sign in to view dashboard</h2>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'PAYPAL':
        return <SiPaypal className="h-5 w-5 text-blue-600" />;
      case 'GCASH':
        return <div className="text-sm font-bold text-blue-500">GC</div>;
      case 'BINANCE':
        return <div className="text-sm font-bold text-yellow-500">₿</div>;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.email}
          </p>
        </motion.div>

        {/* Stats Cards - 3 Stats + Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl hover-elevate active-elevate-2 h-full cursor-pointer" onClick={() => { setActiveTab('purchases'); scrollToTabs(); }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                <Package className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-purchases">{completedOrders.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed orders</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl hover-elevate active-elevate-2 h-full cursor-pointer" onClick={() => { setActiveTab('pending'); scrollToTabs(); }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-pending-orders">{pendingOrders.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl hover-elevate active-elevate-2 h-full cursor-pointer" onClick={() => { setActiveTab('history'); scrollToTabs(); }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-spent">
                  ${completedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || o.total || '0'), 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={() => navigate('/settings')} variant="outline" className="gap-2 h-12">
            <Lock className="h-4 w-4" />
            Account Settings
          </Button>
          <Button onClick={() => navigate('/store')} variant="outline" className="gap-2 h-12">
            <Package className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} ref={tabsRef}>
          <TabsList className="mb-6">
            <TabsTrigger value="purchases" onClick={() => scrollToTabs()}>My Purchases</TabsTrigger>
            <TabsTrigger value="pending" onClick={() => scrollToTabs()}>Pending Orders</TabsTrigger>
            <TabsTrigger value="history" onClick={() => scrollToTabs()}>Order History</TabsTrigger>
          </TabsList>

          {/* My Purchases Tab */}
          <TabsContent value="purchases">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : completedOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start shopping to see your purchases here
                  </p>
                  <Button onClick={() => navigate('/store')}>Browse Store</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl hover-elevate active-elevate-2 cursor-pointer" onClick={() => navigate(`/purchases/${order.id}`)} data-testid={`card-order-${order.id}`}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Order Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>

                          {/* Order Items */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {order.items?.slice(0, 4).map((item) => (
                              <div key={item.id} className="rounded-lg border border-border/50 p-3 bg-muted/30 relative group" data-testid={`order-item-${item.id}`}>
                                <div className="w-full h-24 rounded bg-muted flex items-center justify-center mb-2 overflow-hidden">
                                  {item.product?.imageUrl ? (
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.productName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-xs font-semibold truncate">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                {item.product?.type === 'combo' && item.product?.id && (
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="w-full mt-2 h-8"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const res = await fetch(`/api/products/${item.product?.id}/download`);
                                        if (!res.ok) throw new Error('Failed to download');
                                        const data = await res.json();
                                        window.open(data.downloadLink, '_blank');
                                      } catch (error) {
                                        console.error('Download error:', error);
                                      }
                                    }}
                                    data-testid={`button-download-${item.id}`}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {order.items && order.items.length > 4 && (
                              <div className="rounded-lg border border-border/50 p-3 bg-muted/30 flex items-center justify-center">
                                <p className="text-xs text-muted-foreground">+{order.items.length - 4} more</p>
                              </div>
                            )}
                          </div>

                          {/* Order Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getPaymentMethodIcon(order.paymentMethod)}
                                <span className="text-sm text-muted-foreground capitalize">{order.paymentMethod?.toLowerCase()}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">${parseFloat(order.totalAmount || order.total || '0').toFixed(2)} {order.currency}</p>
                              <Button variant="ghost" size="sm" className="mt-1 gap-2" data-testid="button-view-details">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Orders Tab */}
          <TabsContent value="pending">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No pending orders</h3>
                  <p className="text-muted-foreground">
                    All your orders have been processed
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl hover-elevate" data-testid={`card-pending-${order.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{order.orderNumber}</CardTitle>
                            <CardDescription>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(order.paymentMethod)}
                            <span className="text-sm text-muted-foreground capitalize">{order.paymentMethod?.toLowerCase()}</span>
                          </div>
                          <p className="text-2xl font-bold">${parseFloat(order.totalAmount || order.total || '0').toFixed(2)} {order.currency}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="history">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't made any purchases yet
                  </p>
                  <Button onClick={() => navigate('/store')}>Start Shopping</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl hover-elevate p-4 cursor-pointer" onClick={() => navigate(`/purchases/${order.id}`)} data-testid={`order-history-${order.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">${parseFloat(order.totalAmount || order.total || '0').toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{order.currency}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(order.paymentMethod)}
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
