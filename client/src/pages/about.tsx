import { motion } from 'framer-motion';
import { Zap, Shield, Users, Globe, Award, Clock, Target, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function AboutPage() {
  const stats = [
    { label: 'Happy Customers', value: '10,000+', icon: Users },
    { label: 'Products Delivered', value: '50,000+', icon: Zap },
    { label: 'Years of Experience', value: '5+', icon: Clock },
    { label: 'Satisfaction Rate', value: '99%', icon: Heart },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'We prioritize the security of your data and transactions. All payments are processed through secure, encrypted channels.',
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Get your digital products immediately after purchase. No waiting, no delays - just instant access to what you need.',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'We carefully verify all products before listing. If something doesn\'t work, we\'ll make it right.',
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: 'Our dedicated support team is here 24/7 to help you with any questions or issues you may have.',
    },
  ];

  const team = [
    {
      name: 'Product Team',
      role: 'Quality & Verification',
      description: 'Ensuring every product meets our high standards before it reaches you.',
    },
    {
      name: 'Support Team',
      role: 'Customer Success',
      description: 'Available around the clock to assist with any questions or concerns.',
    },
    {
      name: 'Development Team',
      role: 'Custom Solutions',
      description: 'Building tailored software solutions for unique business needs.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About <span className="text-primary">Ultimata Shop</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          We're a premier digital marketplace specializing in gaming accounts, streaming services, 
          and custom development solutions. Our mission is to provide high-quality digital products 
          with instant delivery and exceptional customer service.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="text-center">
                <CardContent className="p-6">
                  <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Our Story */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 flex items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Ultimata Shop was founded with a simple vision: to create a trusted marketplace 
                    where customers can access premium digital products with confidence and ease.
                  </p>
                  <p>
                    What started as a small operation has grown into a thriving community of 
                    satisfied customers. We've expanded our offerings to include gaming accounts, 
                    streaming services, security research tools, and custom development services.
                  </p>
                  <p>
                    Today, we continue to innovate and improve, always putting our customers first. 
                    Our commitment to quality, security, and excellent service remains unwavering.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
              <div className="text-center">
                <Target className="h-24 w-24 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-2">Our Mission</h3>
                <p className="text-muted-foreground max-w-sm">
                  To provide the highest quality digital products and services 
                  while maintaining the trust and satisfaction of our customers.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Our Values */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Team */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join thousands of satisfied customers and discover our premium digital products today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/store">
                <Button size="lg" data-testid="button-browse-store">Browse Our Store</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" data-testid="button-contact-us">Contact Us</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
