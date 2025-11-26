import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Globe, MessageSquare, ArrowRight, Check, Zap, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

interface ServiceRequestData {
  name: string;
  email: string;
  serviceType: string;
  description: string;
  budget: string;
}

const services = [
  {
    id: 'web-dev',
    icon: Globe,
    title: 'Website Development',
    description: 'Custom websites and web applications built with modern technologies',
    features: [
      'Responsive design (mobile-first)',
      'Modern UI/UX with animations',
      'Fast performance & SEO optimized',
      'Admin panel integration',
      'Payment gateway setup',
      'Database & API development'
    ],
    pricing: 'Starting at $500',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'python',
    icon: Code,
    title: 'Python Scripts',
    description: 'Automation scripts, web scrapers, data processing tools',
    features: [
      'Web scraping & automation',
      'Data processing & analysis',
      'API integrations',
      'Bot development',
      'Custom business logic',
      'Well-documented code'
    ],
    pricing: 'Starting at $100',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'telegram',
    icon: MessageSquare,
    title: 'Telegram Bots',
    description: 'Feature-rich bots for customer service, sales, and automation',
    features: [
      'Custom commands & menus',
      'Payment processing',
      'User management',
      'Database integration',
      'Admin controls',
      'Analytics & reporting'
    ],
    pricing: 'Starting at $200',
    color: 'from-purple-500 to-pink-500'
  }
];

export default function Services() {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceRequestData>({
    name: '',
    email: '',
    serviceType: '',
    description: '',
    budget: ''
  });

  const requestMutation = useMutation({
    mutationFn: async (data: ServiceRequestData) => {
      return await apiRequest('POST', '/api/service-requests', data);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "We'll get back to you within 24 hours!",
      });
      setIsDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        serviceType: '',
        description: '',
        budget: ''
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (serviceId: string) => {
    setSelectedService(serviceId);
    setFormData({ ...formData, serviceType: serviceId });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [30, 0, 30], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-accent/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4"
            >
              <Zap className="h-7 w-7 text-white" />
            </motion.div>
          </div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent"
          >
            Custom Development Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Professional services to bring your ideas to life
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-border/50 bg-gradient-to-br from-card via-card/50 to-card/25 backdrop-blur-xl hover-elevate transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className={`h-12 w-12 rounded-lg bg-gradient-to-br ${service.color} p-2.5 mb-4 flex items-center justify-center`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-6">
                    {/* Features */}
                    <div className="space-y-3">
                      {service.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                          className="flex items-start gap-3"
                        >
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-4 border-t border-border/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-primary">{service.pricing}</p>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                      <Dialog open={isDialogOpen && selectedService === service.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full gap-2 group" 
                            onClick={() => handleOpenDialog(service.id)}
                            data-testid={`button-request-${service.id}`}
                          >
                            Request Service
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Service Request Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl border-border/50 bg-card/50 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Request Service</DialogTitle>
              <DialogDescription>
                Tell us about your project and we'll provide a custom quote
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="budget">Budget Range</Label>
                <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                  <SelectTrigger data-testid="select-budget">
                    <SelectValue placeholder="Select your budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5000-plus">$5,000+</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project and what you're looking for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={5}
                  data-testid="textarea-description"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                <Button 
                  type="submit" 
                  className="flex-1 gap-2 group"
                  disabled={requestMutation.isPending}
                  data-testid="button-submit-request"
                >
                  {requestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </motion.div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: 'Projects Completed', value: '200+', icon: Code },
            { label: 'Happy Clients', value: '150+', icon: Star },
            { label: 'Years Experience', value: '5+', icon: Zap }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="text-center border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-md hover-elevate">
                  <CardContent className="p-8 space-y-4">
                    <Icon className="h-8 w-8 text-primary mx-auto" />
                    <div>
                      <p className="text-3xl font-bold text-primary">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
