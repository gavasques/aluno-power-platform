
export interface ToolType {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureDetail {
  title: string;
  description: string;
  photos: string[];
}

export interface UserToolReview {
  id: string;
  toolId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: string;
  replies: Array<{
    id: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
  }>;
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
  features: FeatureDetail[];
  pricing: {
    plans: Array<{
      name: string;
      price: string;
      features: string[];
    }>;
  };
  brazilSupport: "works" | "partial" | "no";
  guilhermeReview: {
    rating: number;
    review: string;
    photos: string[];
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
