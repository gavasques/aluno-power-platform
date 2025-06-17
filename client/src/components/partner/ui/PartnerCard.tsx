import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Shield, MapPin, Phone, Mail } from 'lucide-react';
import type { Partner, PartnerType } from '@shared/schema';

interface PartnerCardProps {
  partner: Partner;
  partnerType?: PartnerType;
  onView?: (partnerId: number) => void;
  onEdit?: (partnerId: number) => void;
  variant?: 'user' | 'admin';
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  partnerType,
  onView,
  onEdit,
  variant = 'user'
}) => {
  const averageRating = parseFloat(partner.averageRating || '0');

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              {partner.logo ? (
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-sm">
                  {partner.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{partner.name}</h3>
              {partnerType && (
                <Badge variant="secondary" className="text-xs">
                  {partnerType.name}
                </Badge>
              )}
            </div>
          </div>
          {partner.isVerified && (
            <div className="flex items-center gap-1 text-green-600">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Verificado</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {partner.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {partner.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {partner.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{partner.phone}</span>
            </div>
          )}
          {partner.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{partner.email}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.floor(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-1">
              {averageRating.toFixed(1)} ({partner.totalReviews || 0})
            </span>
          </div>

          <div className="flex gap-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(partner.id)}
              >
                {variant === 'admin' ? 'Gerenciar' : 'Ver Detalhes'}
              </Button>
            )}
            {onEdit && variant === 'admin' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onEdit(partner.id)}
              >
                Editar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};