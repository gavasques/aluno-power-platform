import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Crown, 
  MessageCircle, 
  BookOpen, 
  Zap,
  ArrowUpRight,
  Bot,
  Image
} from 'lucide-react';

interface QuickActionsProps {
  onAction?: (action: string, data?: any) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const handleAction = (action: string, data?: any) => {
    if (onAction) {
      onAction(action, data);
    }
  };

  const quickActions = [
    {
      id: 'buy_credits',
      title: 'Comprar Créditos',
      description: 'Adicione mais créditos à sua conta',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      urgent: false,
    },
    {
      id: 'upgrade_plan',
      title: 'Fazer Upgrade',
      description: 'Upgrade para plano premium',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      urgent: false,
    },
    {
      id: 'contact_support',
      title: 'Contatar Suporte',
      description: 'Precisa de ajuda? Fale conosco',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      urgent: false,
    },
    {
      id: 'view_tutorials',
      title: 'Ver Tutoriais',
      description: 'Aprenda a usar nossas ferramentas',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      urgent: false,
    },
  ];

  const favoriteFeatures = [
    {
      id: 'amazon_listing',
      title: 'Otimizador Amazon',
      description: 'Otimize seus listings',
      icon: Bot,
      url: '/agents/amazon-listings-optimizer',
    },
    {
      id: 'image_upscale',
      title: 'Melhorar Imagens',
      description: 'Aumente a qualidade das suas imagens',
      icon: Image,
      url: '/ai/image-upscale',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={`${action.bgColor} border-0 flex flex-col items-center gap-2 h-auto py-3 px-2`}
                onClick={() => handleAction(action.id)}
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-900 leading-tight">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-600 leading-tight mt-1">
                    {action.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t pt-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-3">
              Ferramentas Favoritas
            </h4>
            
            {/* Favorite Features */}
            <div className="space-y-2">
              {favoriteFeatures.map((feature) => (
                <Button
                  key={feature.id}
                  variant="ghost"
                  className="w-full justify-start h-auto py-2 px-3"
                  onClick={() => window.location.href = feature.url}
                >
                  <feature.icon className="h-4 w-4 text-muted-foreground mr-3" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="border-t pt-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-3">
              Precisa de Ajuda?
            </h4>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleAction('view_documentation')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Documentação
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleAction('schedule_demo')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Agendar Demo
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};