import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isInStock = product.stock > 0;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/cart', { productId: product.id, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
    addToCartMutation.mutate();
  };

  return (
    <Card className="group overflow-hidden hover-elevate active-elevate-2 transition-all">
      {/* Product Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {product.featured && (
              <Badge className="bg-primary/90 backdrop-blur-sm">
                Featured
              </Badge>
            )}
            {!isInStock && (
              <Badge variant="destructive" className="backdrop-blur-sm">
                Out of Stock
              </Badge>
            )}
            {isInStock && product.stock < 5 && (
              <Badge variant="secondary" className="backdrop-blur-sm">
                Low Stock
              </Badge>
            )}
          </div>

          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="backdrop-blur-sm">
              {product.type === 'account' ? 'Account' : 'Combo List'}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid={`text-price-${product.id}`}>
              ${product.price}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {isInStock ? (
              <span className="text-green-500">{product.stock} in stock</span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant="outline"
          className="flex-1"
          asChild
          data-testid={`button-view-${product.id}`}
        >
          <Link href={`/product/${product.id}`}>
            View Details
          </Link>
        </Button>
        <Button
          className="flex-1 gap-2"
          disabled={!isInStock || addToCartMutation.isPending}
          onClick={handleAddToCart}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="h-4 w-4" />
          {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export { ProductCard };
export default ProductCard;