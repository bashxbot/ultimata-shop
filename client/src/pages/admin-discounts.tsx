import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminDiscounts() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: '',
    percentage: '',
    totalUses: '-1',
    expiresAt: '',
    selectAllProducts: true,
    selectedProducts: [] as number[],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/products');
      return await res.json();
    },
  });

  const { data: discounts = [], refetch } = useQuery({
    queryKey: ['/api/admin/discount-codes'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/discount-codes');
      return await res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/admin/discount-codes', data),
    onSuccess: () => {
      refetch();
      toast({ title: 'Success', description: 'Discount code created' });
      setFormData({ code: '', percentage: '', totalUses: '-1', expiresAt: '', selectAllProducts: true, selectedProducts: [] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create discount', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/discount-codes/${id}`),
    onSuccess: () => {
      refetch();
      toast({ title: 'Success', description: 'Discount deleted' });
    },
  });

  const handleToggleProduct = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId],
    }));
  };

  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      selectAllProducts: !prev.selectAllProducts,
      selectedProducts: !prev.selectAllProducts ? [] : products.map((p: any) => p.id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.percentage) {
      toast({ title: 'Error', description: 'Fill in all required fields', variant: 'destructive' });
      return;
    }
    if (!formData.selectAllProducts && formData.selectedProducts.length === 0) {
      toast({ title: 'Error', description: 'Select at least one product', variant: 'destructive' });
      return;
    }
    createMutation.mutate({
      code: formData.code,
      discountPercentage: parseInt(formData.percentage),
      totalUses: parseInt(formData.totalUses),
      active: true,
      productIds: formData.selectAllProducts ? null : formData.selectedProducts,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Discount Management</h1>
          <p className="text-muted-foreground mb-8">Create and manage discount codes</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Discount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input
                      placeholder="SUMMER2024"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      data-testid="input-discount-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                      data-testid="input-discount-percent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Uses (-1 = unlimited)</Label>
                    <Input
                      type="number"
                      placeholder="-1"
                      value={formData.totalUses}
                      onChange={(e) => setFormData({ ...formData, totalUses: e.target.value })}
                      data-testid="input-discount-uses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expires At (optional)</Label>
                    <Input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      data-testid="input-discount-expires"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="selectAll"
                        checked={formData.selectAllProducts}
                        onCheckedChange={handleSelectAll}
                        data-testid="checkbox-select-all-products"
                      />
                      <Label htmlFor="selectAll" className="cursor-pointer font-semibold">
                        Apply to All Products
                      </Label>
                    </div>

                    {!formData.selectAllProducts && (
                      <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                        <Label className="text-xs text-muted-foreground">Select Products</Label>
                        {products.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No products available</p>
                        ) : (
                          products.map((product: any) => (
                            <div key={product.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`product-${product.id}`}
                                checked={formData.selectedProducts.includes(product.id)}
                                onCheckedChange={() => handleToggleProduct(product.id)}
                                data-testid={`checkbox-product-${product.id}`}
                              />
                              <label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer flex-1">
                                {product.name}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full" data-testid="button-create-discount">
                    Create Code
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Discounts List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Active Codes ({discounts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discounts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No discount codes yet</p>
                  ) : (
                    discounts.map((code: any) => {
                      const applicableProducts = code.productIds && code.productIds.length > 0
                        ? products.filter((p: any) => code.productIds.includes(p.id))
                        : products;
                      
                      return (
                        <div key={code.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50" data-testid={`card-discount-${code.id}`}>
                          <div className="flex-1">
                            <p className="font-semibold">{code.code}</p>
                            <p className="text-sm text-muted-foreground">
                              {code.discountPercentage}% off • Used: {code.usedCount}/{code.totalUses === -1 ? '∞' : code.totalUses}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {!code.productIds || code.productIds.length === 0 
                                ? 'All Products' 
                                : `${code.productIds.length} product${code.productIds.length !== 1 ? 's' : ''}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(code.id)}
                            data-testid={`button-delete-discount-${code.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
