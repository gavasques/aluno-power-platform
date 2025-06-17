import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import type { PartnerReview } from '@shared/schema';

interface PartnerRatingDisplayProps {
  partnerId: number;
}

const PartnerRatingDisplay: React.FC<PartnerRatingDisplayProps> = ({ partnerId }) => {
  const { data: reviews = [] } = useQuery<PartnerReview[]>({
    queryKey: ['/api/partners', partnerId, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/partners/${partnerId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    }
  });

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const reviewCount = reviews.length;

  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
      const reviewsSection = document.getElementById('reviews-section');
      reviewsSection?.scrollIntoView({ behavior: 'smooth' });
    }}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= Math.floor(averageRating)
                ? 'text-yellow-400 fill-current'
                : 'text-white/40'
            }`}
          />
        ))}
      </div>
      <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
      <span className="text-white/80">({reviewCount} avaliações)</span>
    </div>
  );
};

export default PartnerRatingDisplay;