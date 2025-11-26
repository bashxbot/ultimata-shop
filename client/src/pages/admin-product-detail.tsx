import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Minus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AdminSidebar } from '@/components/AdminSidebar';
import type { Product } from '@shared/schema';

interface ProductBuyer {
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  quantity: number;
  purchaseDate: string;
  orderId: number;
  orderStatus: string;
  paymentStatus: string;
}

export default function AdminProductDetail() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState<number | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<string>('');

  useEffect(() => {
    const path = window.location.pathname;
    const id = parseInt(path.split('/').pop() || '0');
    if (id) setProductId(id);
  }, []);

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  const { data: buyers = [], isLoading: buyersLoading } = useQuery<ProductBuyer[]>({
    queryKey: ['/api/admin/products', productId, 'buyers'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/products/${productId}/buyers`);
      if (!response.ok) throw new Error('Failed to fetch buyers');
      return response.json();
    },
    enabled: !!productId,
  });

  const adjustStockMutation = useMutation({
    mutationFn: async (adjustment: number) => {
      return await apiRequest('POST', `/api/admin/products/${productId}/adjust-stock`, { adjustment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
      setStockAdjustment('');
      toast({ title: 'Stock updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error?.message || 'Failed to adjust stock', variant: 'destructive' });
    },
  });

  if (!productId) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (productLoading) {
    return <div className="container mx-auto px-4 py-8">Loading product...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Info */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-semibold">${product.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <Badge>{product.type === 'account' ? 'Account' : 'Combo'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Featured</p>
                      <Badge variant={product.featured ? 'default' : 'secondary'}>
                        {product.featured ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {product.fileName && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">File</p>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Download className="h-4 w-4" />
                        <span className="text-sm">{product.fileName}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {product.fileSize ? `${(product.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stock Management */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Stock</p>
                  <p className="text-3xl font-bold">{product.stock}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-3">Adjust Stock</p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Adjustment value"
                        value={stockAdjustment}
                        onChange={(e) => setStockAdjustment(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          if (product.stock > 0) {
                            adjustStockMutation.mutate(-1);
                          }
                        }}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove 1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => adjustStockMutation.mutate(1)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add 1
                      </Button>
                    </div>
                    <Button
                      className="w-full"
                      disabled={!stockAdjustment}
                      onClick={() => {
                        const value = parseInt(stockAdjustment);
                        if (isNaN(value)) {
                          toast({ title: 'Error', description: 'Please enter a valid number', variant: 'destructive' });
                          return;
                        }
                        adjustStockMutation.mutate(value);
                      }}
                    >
                      Apply Adjustment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>People who bought this product ({buyers.length})</CardDescription>
            </CardHeader>
            <CardContent>
              {buyersLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : buyers.length === 0 ? (
                <p className="text-muted-foreground">No purchases yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Order Status</TableHead>
                        <TableHead>Payment Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buyers.map((buyer, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{buyer.buyerName || 'Anonymous'}</TableCell>
                          <TableCell>{buyer.buyerEmail}</TableCell>
                          <TableCell>{buyer.quantity}</TableCell>
                          <TableCell>{new Date(buyer.purchaseDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={buyer.orderStatus === 'completed' ? 'default' : 'secondary'}>
                              {buyer.orderStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={buyer.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                              {buyer.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
