import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, CreditCard, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
}

const PermissionsTestDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const runPermissionTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Permission Check Only
      const permissionResponse = await fetch('/api/test/feature-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ featureKey: 'amazon-listing-optimizer' })
      });
      
      const permissionData = await permissionResponse.json();
      setTestResults(prev => [...prev, {
        test: 'Permission Check',
        success: permissionResponse.ok,
        message: permissionResponse.ok ? 'Access granted' : permissionData.error,
        details: permissionData
      }]);

      // Test 2: Credit Debit with Permission
      const creditResponse = await fetch('/api/test/feature-with-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ inputData: 'Test product optimization' })
      });
      
      const creditData = await creditResponse.json();
      setTestResults(prev => [...prev, {
        test: 'Credit Debit Test',
        success: creditResponse.ok,
        message: creditResponse.ok ? 'Credits debited successfully' : creditData.error,
        details: creditData
      }]);

      // Test 3: Get User Group Info
      const groupResponse = await fetch('/api/permissions/group', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const groupData = await groupResponse.json();
      setTestResults(prev => [...prev, {
        test: 'User Group Info',
        success: groupResponse.ok,
        message: groupResponse.ok ? `Group: ${groupData.data?.name}` : groupData.error,
        details: groupData.data
      }]);

      // Test 4: Get Feature Permissions
      const featuresResponse = await fetch('/api/permissions/features', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const featuresData = await featuresResponse.json();
      setTestResults(prev => [...prev, {
        test: 'Feature Permissions',
        success: featuresResponse.ok,
        message: featuresResponse.ok ? `${featuresData.data?.length} features loaded` : featuresData.error,
        details: featuresData.data
      }]);

      toast({
        title: "Tests Completed",
        description: "All permission system tests have been executed",
      });

    } catch (error) {
      console.error('Test error:', error);
      setTestResults(prev => [...prev, {
        test: 'System Error',
        success: false,
        message: 'Network or system error occurred',
        details: { error: error.message }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTestIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="ml-2">
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <TestTube className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Permission System Test Dashboard</h1>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              BASIC, PREMIUM, MASTER, ADMIN, SUPER_ADMIN
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19</div>
            <p className="text-xs text-muted-foreground">
              Across 5 categories with granular permissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit System</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Automated debit and refund system
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Run Permission Tests</CardTitle>
          <CardDescription>
            Execute comprehensive tests to validate the permission system functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runPermissionTests} 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? 'Running Tests...' : 'Start Tests'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Live results from permission system validation tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 border rounded-lg"
                >
                  {getTestIcon(result.success)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{result.test}</h4>
                      {getStatusBadge(result.success)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer">
                          View Details
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Features */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Permission System Features</CardTitle>
          <CardDescription>
            Complete overview of implemented functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Core Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• 5-tier user group system (BASIC to SUPER_ADMIN)</li>
                <li>• 19 granular features across 5 categories</li>
                <li>• Automated credit debit and refund system</li>
                <li>• Permission verification middleware</li>
                <li>• Brazilian Portuguese interface</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Technical Architecture
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• TypeScript service layer with SOLID principles</li>
                <li>• Database-driven permission matrix</li>
                <li>• Middleware integration for route protection</li>
                <li>• Error handling with detailed logging</li>
                <li>• Comprehensive test coverage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsTestDashboard;