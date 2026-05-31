export const CAR_FILTERS = {
  makes: ['Toyota', 'Hyundai', 'Maruti Suzuki', 'Kia', 'Mahindra'],

  models: ['Fortuner', 'Creta', 'Swift', 'Seltos', 'Thar'],

  variants: ['Base', 'Mid', 'Premium', 'Sport', 'Top'],

  prices: ['< 10L', '10L - 20L', '20L - 30L', '30L - 40L', '> 40L'],

  specs: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],

  mileage: ['10-15 kmpl', '15-20 kmpl', '20-25 kmpl', '25+ kmpl'],

  safetyRating: ['3', '4', '5'],

  userReviews: ['Excellent', 'Good', 'Average', 'Below Average']
} as const;