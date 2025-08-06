import { UltraEnhanceToolRefactored } from '@/components/ultra-enhance/UltraEnhanceToolRefactored';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, CreditCard } from 'lucide-react';
import { Link } from 'wouter';

export default function Tool_UltraMelhoradorPro() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/ferramentas">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
                <h1 className="text-2xl font-bold text-foreground">Ultra Melhorador PRO</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <CreditCard className="w-3 h-3 mr-1" />
                8 créditos por uso
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tool */}
      <div className="py-8">
        <UltraEnhanceToolRefactored />
      </div>

    </div>
  );
}