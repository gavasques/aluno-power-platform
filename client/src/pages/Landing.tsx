import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, ShoppingBag, BarChart3, Users } from "lucide-react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // If user is authenticated, redirect to main app
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Aluno Power Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive e-commerce platform with AI-powered tools for Amazon FBA and marketplace success. 
            Optimize your listings, manage products, and grow your business with intelligent automation.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => window.location.href = "/api/login"}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Login with Replit
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <ShoppingBag className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive product catalog with pricing optimization, 
                multi-channel sales management, and inventory tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>AI-Powered Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced listing optimization through competitor analysis, 
                automated content generation, and performance insights.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Resource Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access tools, materials, supplier networks, and expert guidance 
                to accelerate your e-commerce success.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}