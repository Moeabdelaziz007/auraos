export interface TravelPersona {
  travelStyle: 'luxury' | 'budget' | 'family' | 'adventure' | 'business';
  interests: string[];
  dietaryRestrictions: string[];
  preferredAirlines: string[];
  preferredHotelChains: string[];
  activityLevel: 'relaxed' | 'moderate' | 'active';
}

export interface FoodiePersona {
  favoriteCuisines: string[];
  diningStyle: 'casual' | 'fine_dining' | 'fast_food' | 'street_food';
  dietaryPreferences: string[];
  spiceLevel: 'mild' | 'medium' | 'hot';
  allergies: string[];
}

export interface UserPersona {
  travel?: TravelPersona;
  foodie?: FoodiePersona;
  // Other persona aspects can be added here
}
