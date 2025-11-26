import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Plus, Minus, Package, Shield, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@shared/schema';

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const { data: wishlistStatus } = useQuery<{ isInWishlist: boolean }>({
    queryKey: ['/api/wishlist', id, 'check'],
    enabled: !!id && !!user,
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (wishlistStatus?.isInWishlist) {
        return await apiRequest('DELETE', `/api/wishlist/${id}`);
      } else {
        return await apiRequest('POST', `/api/wishlist/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist', id, 'check'] });
      toast({
        title: wishlistStatus?.isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/cart', {
        productId: parseInt(id!),
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to Cart",
        description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    addToCartMutation.mutate();
    setTimeout(() => setLocation('/cart'), 500);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Product not found</p>
            <Button onClick={() => setLocation('/store')}>Back to Store</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button variant="ghost" onClick={() => setLocation('/store')} className="mb-8 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="aspect-square rounded-lg overflow-hidden bg-muted/50 backdrop-blur-sm border border-border">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="space-y-6"
        >
          {/* Title & Badge */}
          <div>
            <div className="flex items-start gap-3 mb-3">
              <Badge variant={product.type === 'account' ? 'default' : 'secondary'}>
                {product.type === 'account' ? 'Account' : 'Combo List'}
              </Badge>
              {product.featured && (
                <Badge variant="outline" className="border-primary">Featured</Badge>
              )}
              <Badge
                variant={isOutOfStock ? 'destructive' : 'default'}
                className={!isOutOfStock ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
              >
                {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold">{product.name}</h1>
          </div>

          {/* Price */}
          <div>
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ${parseFloat(product.price).toFixed(2)}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <h3 className="font-semibold">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-16 text-center font-medium">{quantity}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                Max: {product.stock}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleBuyNow}
              disabled={isOutOfStock || addToCartMutation.isPending}
            >
              Buy Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCartMutation.isPending}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            {user && (
              <Button
                size="icon"
                variant="outline"
                className={wishlistStatus?.isInWishlist ? 'text-red-500 border-red-500 hover:bg-red-500/10' : ''}
                onClick={() => toggleWishlistMutation.mutate()}
                disabled={toggleWishlistMutation.isPending}
                data-testid="button-toggle-wishlist"
              >
                <Heart className={`h-5 w-5 ${wishlistStatus?.isInWishlist ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>

          {/* Features */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Instant Delivery</p>
                    <p className="text-sm text-muted-foreground">Access immediately after purchase</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Secure Storage</p>
                    <p className="text-sm text-muted-foreground">Credentials encrypted in your dashboard</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}