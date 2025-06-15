
export interface ToolType {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  typeId: string;
  description: string;
  logo: string;
  verified: boolean;
  officialRating: number;
  userRating: number;
  reviewCount: number;
  overview: string;
  features: string[];
  pricing: {
    plans: Array<{
      name: string;
      price: string;
      features: string[];
    }>;
  };
  availabilityBrazil: string;
  lvReview: {
    rating: number;
    review: string;
  };
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  discounts: Array<{
    description: string;
    link?: string;
    coupon?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserToolReview {
  id: string;
  toolId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
