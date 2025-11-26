import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Copy, Eye, EyeOff, Package, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';

interface OrderDetail {
  id: number;
  total?: string;
  totalAmount?: string;
  status: string;
  createdAt: string;
  orderNumber?: string;
  items: Array<{
    id: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: string;
      type: string;
      accountUsername?: string;
      accountPassword?: string;
      fileUrl?: string;
    };
  }>;
}

export default function PurchaseDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id,
  });

  const refundMutation = useMutation({
    mutationFn: async () => {
      if (!order) return;
      const totalAmount = order.totalAmount || order.total || '0';
      return await apiRequest('POST', '/api/refunds', {
        orderId: order.id,
        reason: refundReason,
        amount: totalAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/refunds'] });
      toast({ title: 'Refund request submitted', description: 'We will review your request and get back to you soon.' });
      setRefundDialogOpen(false);
      setRefundReason('');
    },
    onError: () => {
      toast({ title: 'Failed to submit refund request', variant: 'destructive' });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const togglePassword = (itemId: number) => {
    setShowPasswords(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Order not found</h2>
            <Button onClick={() => setLocation('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-4xl font-bold mb-2">Order Details</h1>
        <p className="text-muted-foreground">Order #{order.id}</p>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge
                variant="default"
                className={
                  order.status === 'completed'
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : ''
                }
              >
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-2xl font-bold">
                    ${parseFloat(order.totalAmount || order.total || '0').toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Number of Items</span>
                  <span>{order.items.length}</span>
                </div>
              </div>
              {order.status === 'completed' && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setRefundDialogOpen(true)}
                  data-testid="button-request-refund"
                >
                  <RefreshCw className="h-4 w-4" />
                  Request Refund
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Purchased Items */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Your Purchases</h2>
        {order.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{item.product.name}</CardTitle>
                    <CardDescription>
                      {item.product.type === 'account' ? 'Account Access' : 'Digital Product'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Qty: {item.quantity}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.status === 'completed' && item.product.type === 'combo' ? (
                  <Button 
                    className="w-full gap-2"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/products/${item.product.id}/download`);
                        if (!res.ok) {
                          throw new Error('Failed to download file');
                        }
                        const data = await res.json();
                        window.open(data.downloadLink, '_blank');
                      } catch (error) {
                        toast({
                          title: 'Error',
                          description: 'Failed to download file',
                          variant: 'destructive',
                        });
                      }
                    }}
                    data-testid="button-download-file"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                ) : order.status === 'completed' && item.product.type === 'account' ? (
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Account credentials delivered. Check your email or contact support.
                    </p>
                  </div>
                ) : order.status === 'completed' ? (
                  <div className="p-4 bg-muted/50 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground">
                      No file available for this product.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground">
                      Your purchase is being processed. Check back soon!
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per item</span>
                  <span>${parseFloat(item.product.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Refund Request Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Refund</DialogTitle>
            <DialogDescription>
              Please tell us why you'd like a refund. We'll review your request and get back to you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for refund</Label>
              <Textarea
                id="reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Please describe why you're requesting a refund..."
                rows={4}
                data-testid="textarea-refund-reason"
              />
            </div>
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
              <p>Refund amount: ${parseFloat(order?.totalAmount || order?.total || '0').toFixed(2)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => refundMutation.mutate()}
              disabled={!refundReason.trim() || refundMutation.isPending}
              data-testid="button-submit-refund"
            >
              {refundMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}