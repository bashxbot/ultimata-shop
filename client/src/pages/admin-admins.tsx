import { useQuery, useMutation } from '@tanstack/react-query';
import { Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminAdmins() {
  const { toast } = useToast();

  const { data: admins = [], refetch } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users');
      const data = await res.json();
      return data.filter((u: any) => u.role === 'admin');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiRequest('PUT', `/api/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      refetch();
      toast({ title: 'Success', description: 'Admin role updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => apiRequest('DELETE', `/api/admin/users/${userId}`),
    onSuccess: () => {
      refetch();
      toast({ title: 'Success', description: 'Admin deleted' });
    },
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Admin Management</h1>
          <p className="text-muted-foreground mb-8">Manage admin users and permissions</p>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Admin Users ({admins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {admins.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No admin users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin: any) => (
                        <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`}>
                          <TableCell className="font-medium">{admin.email}</TableCell>
                          <TableCell>{admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : admin.firstName || admin.email?.split('@')[0] || 'Unknown'}</TableCell>
                          <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateRoleMutation.mutate({
                                    userId: admin.id,
                                    role: 'user',
                                  })
                                }
                                data-testid={`button-demote-admin-${admin.id}`}
                              >
                                Demote
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteMutation.mutate(admin.id)}
                                data-testid={`button-delete-admin-${admin.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
