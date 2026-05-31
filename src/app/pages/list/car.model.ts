export interface CarCard {
  id: number;
  make: string;
  model: string;
  variant: string;

  price: string;
  mileage: string;

  safety_rating: string;

  specs: CarSpecs;

  user_reviews: string[];

  created_at: string;
  updated_at: string;

  images?: string[]; // optional since API does not send it
}

export interface CarFilters {
  make: string | null;
  model: string | null;
  variant: string | null;
  price: string | null;
  specs: string | null;
  mileage: string | null;

  safetyRating: string | null;
  userReview: string | null;
}

export interface FilterOptions {
  makes: string[];
  models: string[];
  variants: string[];
  prices: string[];
  specs: string[];
  mileage: string[];
  safetyRating: string[];
  userReviews: string[];
}

export interface CarSpecs {
  fuel: string;
  engine: string;
  transmission?: string;
}