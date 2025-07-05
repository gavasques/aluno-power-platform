import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Mail, Shield, CheckCircle } from "lucide-react";

export default function Home() {
  const { user, isAdmin, hasAdminAccess } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Aluno Power Platform</h1>
            <p className="text-gray-600 mt-2">You are successfully authenticated with Replit Auth</p>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/api/logout"}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User ID:</span>
                <span className="font-mono text-sm">{user?.id}</span>
              </div>
              
              {user?.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm">{user.email}</span>
                </div>
              )}
              
              {user?.firstName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">First Name:</span>
                  <span className="text-sm">{user.firstName}</span>
                </div>
              )}
              
              {user?.lastName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Name:</span>
                  <span className="text-sm">{user.lastName}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <span className="text-sm font-medium">{user?.role}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Replit Auth Integration</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Session Management</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Database Storage</span>
              </div>
              
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Admin Access</span>
                </div>
              )}
              
              {hasAdminAccess && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Elevated Permissions</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Integration Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                The Replit Auth integration has been successfully implemented with the following features:
              </p>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>OAuth-based authentication replacing custom email/password system</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Secure session management with PostgreSQL storage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>User data synchronization with database</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Protected routes with authentication middleware</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Landing page for unauthenticated users</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}