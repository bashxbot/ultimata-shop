import { useState } from 'react';
import { Plus, Trash2, Upload, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function AdminFiles() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    productId: '',
    fileType: 'combo',
    fileName: '',
    fileContent: '',
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/products');
      return await res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/admin/files', data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'File uploaded successfully' });
      setFormData({ productId: '', fileType: 'combo', fileName: '', fileContent: '' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to upload file', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.fileName) {
      toast({ title: 'Error', description: 'Fill in all required fields', variant: 'destructive' });
      return;
    }
    createMutation.mutate({
      productId: parseInt(formData.productId),
      fileType: formData.fileType,
      fileName: formData.fileName,
      fileContent: formData.fileContent,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">File Management</h1>
          <p className="text-muted-foreground mb-8">Upload combo lists and distribution files for products</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product: any) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>File Type</Label>
                    <Select value={formData.fileType} onValueChange={(v) => setFormData({ ...formData, fileType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="combo">Combo List</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>File Name</Label>
                    <Input
                      placeholder="combos.txt"
                      value={formData.fileName}
                      onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                      data-testid="input-file-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>File Content</Label>
                    <textarea
                      placeholder="Paste file content here..."
                      value={formData.fileContent}
                      onChange={(e) => setFormData({ ...formData, fileContent: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md font-mono text-sm resize-none"
                      rows={6}
                      data-testid="textarea-file-content"
                    />
                  </div>

                  <Button type="submit" className="w-full" data-testid="button-upload-file">
                    Upload File
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Help Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <File className="h-5 w-5" />
                    How to Use File Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Combo Lists</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload lists of accounts, credentials, or combos. These files will be delivered to customers after purchase.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Guides</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload guides or instructions for using the products. These can be PDF or text files.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload any other documentation or resources related to the product.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Tip:</strong> Keep file content clear and organized. One combo/account per line for best results.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
