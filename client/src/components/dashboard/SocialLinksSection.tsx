import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, MessageCircle, MessageSquare, Star, Users, School, BookCopy } from 'lucide-react';

interface SocialLinksSectionProps {
  variant?: 'full' | 'simple';
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({ variant = 'full' }) => {
  const instagramUrl = variant === 'full' 
    ? 'https://instagram.com/guivasques_' 
    : 'https://www.instagram.com/guilhermevasques.oficial/';

  const whatsAppLabel = variant === 'full' ? 'Contato direto' : 'nosso Grupo Aberto';

  return (
    <Card className="bg-white border border-gray-200 shadow-sm mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          {variant === 'full' && (
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
          )}
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {variant === 'simple' && <MessageSquare className="h-5 w-5 text-blue-600" />}
              Conecte-se Conosco
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Siga nossas redes sociais e participe da nossa comunidade
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="justify-start bg-pink-50 hover:bg-pink-100 text-gray-700 border-pink-200 hover:border-pink-300 h-12"
            onClick={() => window.open(instagramUrl, '_blank')}
          >
            <Instagram className="h-4 w-4 mr-3 text-pink-500" />
            <div className="text-left">
              <p className="font-medium">Instagram</p>
              <p className="text-xs text-gray-500">Dicas diárias</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start bg-green-50 hover:bg-green-100 text-gray-700 border-green-200 hover:border-green-300 h-12"
            onClick={() => window.open('https://wa.me/5545999858475', '_blank')}
          >
            <MessageCircle className="h-4 w-4 mr-3 text-green-600" />
            <div className="text-left">
              <p className="font-medium">WhatsApp</p>
              <p className="text-xs text-gray-500">{whatsAppLabel}</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start bg-blue-50 hover:bg-blue-100 text-gray-700 border-blue-200 hover:border-blue-300 h-12"
            onClick={() => window.open('https://discord.gg/guilhermevasques', '_blank')}
          >
            <MessageSquare className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <p className="font-medium">Discord</p>
              <p className="text-xs text-gray-500">Comunidade oficial</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start bg-purple-50 hover:bg-purple-100 text-gray-700 border-purple-200 hover:border-purple-300 h-12"
            onClick={() => window.open('https://portal.guilhermevasques.club', '_blank')}
          >
            <Star className="h-4 w-4 mr-3 text-purple-600" />
            <div className="text-left">
              <p className="font-medium">{variant === 'simple' ? 'Portal' : 'Portal do Curso'}</p>
              <p className="text-xs text-gray-500">Acesso exclusivo</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start bg-yellow-50 hover:bg-yellow-100 text-gray-700 border-yellow-200 hover:border-yellow-300 h-12"
            onClick={() => window.open('https://produtos.guilhermevasques.club/', '_blank')}
          >
            <School className="h-4 w-4 mr-3 text-yellow-600" />
            <div className="text-left">
              <p className="font-medium">Nossos Cursos</p>
              <p className="text-xs text-gray-500">Conheça todos os cursos</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start bg-emerald-50 hover:bg-emerald-100 text-gray-700 border-emerald-200 hover:border-emerald-300 h-12"
            onClick={() => window.open('https://portal.guilhermevasques.club', '_blank')}
          >
            <BookCopy className="h-4 w-4 mr-3 text-emerald-600" />
            <div className="text-left">
              <p className="font-medium">Ir para o Curso</p>
              <p className="text-xs text-gray-500">Área do aluno</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(SocialLinksSection);