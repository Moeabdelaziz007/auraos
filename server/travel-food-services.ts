import { User, users } from '@shared/schema';
import { UserPersona } from '@shared/personas';
import { storage } from './storage.js';
import { eq } from 'drizzle-orm';

interface TravelService {
  id: string;
  name: string;
  type: 'flight' | 'hotel' | 'car_rental' | 'package_deal' | 'activity';
  description: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  features: string[];
  aiCapabilities: string[];
  automationTasks: string[];
}

interface FoodService {
  id: string;
  name: string;
  type: 'restaurant' | 'delivery' | 'grocery' | 'meal_plan' | 'catering';
  description: string;
  cuisine: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  features: string[];
  aiCapabilities: string[];
  automationTasks: string[];
}

interface SmartShoppingAgent {
  id: string;
  name: string;
  category: 'travel' | 'food' | 'general';
  capabilities: {
    priceComparison: boolean;
    dealDetection: boolean;
    bookingAutomation: boolean;
    preferenceLearning: boolean;
    budgetOptimization: boolean;
  };
  integrations: string[];
  automationRules: string[];
}

// Helper function to calculate AI score based on persona
const calculateAIScore = (service: TravelService | FoodService, persona: UserPersona | null): number => {
  if (!persona) {
    return Math.random() * 2 + 8; // Default score if no persona
  }

  let score = 8.0;

  // Travel persona scoring
  if ('travelStyle' in persona && persona.travel) {
    const travelPersona = persona.travel;
    if (service.type === 'hotel' && travelPersona.preferredHotelChains.some(chain => service.name.includes(chain))) {
      score += 1.5;
    }
    if (service.type === 'flight' && travelPersona.preferredAirlines.some(airline => service.name.includes(airline))) {
      score += 1.5;
    }
    if (('interests' in service) && service.interests.some(interest => travelPersona.interests.includes(interest))) {
      score += 1.0;
    }
  }

  // Foodie persona scoring
  if ('favoriteCuisines' in persona && persona.foodie) {
    const foodiePersona = persona.foodie;
    if ('cuisine' in service && service.cuisine.some(c => foodiePersona.favoriteCuisines.includes(c))) {
      score += 1.5;
    }
    if ('diningStyle' in service && foodiePersona.diningStyle === service.diningStyle) {
      score += 1.0;
    }
  }

  return Math.min(10, score + Math.random() * 0.5); // Add a small random factor
};

/**
 * Manages travel and food services, as well as smart shopping agents.
 */
export class TravelFoodServiceManager {
  private travelServices: Map<string, TravelService> = new Map();
  private foodServices: Map<string, FoodService> = new Map();
  private smartAgents: Map<string, SmartShoppingAgent> = new Map();

  /**
   * Creates an instance of TravelFoodServiceManager.
   */
  constructor() {
    this.initializeTravelServices();
    this.initializeFoodServices();
    this.initializeSmartAgents();
  }

  private initializeTravelServices() {
    // Flight Booking Agent
    this.travelServices.set('flight_booking_agent', {
      id: 'flight_booking_agent',
      name: 'AI Flight Booking Assistant',
      type: 'flight',
      description: 'Intelligent flight search and booking with price optimization and deal detection',
      priceRange: { min: 50, max: 2000, currency: 'USD' },
      features: [
        'Real-time price monitoring',
        'Multi-airline comparison',
        'Flexible date suggestions',
        'Seat preference optimization',
        'Baggage fee calculation',
        'Layover optimization'
      ],
      aiCapabilities: [
        'Predictive pricing analysis',
        'Optimal booking timing',
        'Route optimization',
        'Personalized recommendations',
        'Price drop alerts',
        'Alternative route suggestions'
      ],
      automationTasks: [
        'Monitor price drops',
        'Auto-book when criteria met',
        'Send price alerts',
        'Update travel calendar',
        'Manage seat preferences',
        'Track flight status'
      ]
    });

    // Hotel Booking Agent
    this.travelServices.set('hotel_booking_agent', {
      id: 'hotel_booking_agent',
      name: 'AI Hotel Booking Assistant',
      type: 'hotel',
      description: 'Smart hotel search with location optimization and amenity matching',
      priceRange: { min: 30, max: 1000, currency: 'USD' },
      features: [
        'Location-based recommendations',
        'Amenity matching',
        'Review sentiment analysis',
        'Cancellation policy optimization',
        'Loyalty program integration',
        'Group booking management'
      ],
      aiCapabilities: [
        'Location scoring algorithm',
        'Amenity preference learning',
        'Review sentiment analysis',
        'Price trend prediction',
        'Availability forecasting',
        'Personalized recommendations'
      ],
      automationTasks: [
        'Monitor hotel availability',
        'Auto-book preferred hotels',
        'Send deal notifications',
        'Manage cancellations',
        'Update preferences',
        'Track loyalty points'
      ]
    });

    // Car Rental Agent
    this.travelServices.set('car_rental_agent', {
      id: 'car_rental_agent',
      name: 'AI Car Rental Assistant',
      type: 'car_rental',
      description: 'Intelligent car rental with route optimization and cost analysis',
      priceRange: { min: 20, max: 200, currency: 'USD' },
      features: [
        'Vehicle type optimization',
        'Route planning integration',
        'Fuel efficiency analysis',
        'Insurance optimization',
        'Pickup/dropoff optimization',
        'Multi-day discount detection'
      ],
      aiCapabilities: [
        'Route optimization',
        'Fuel cost calculation',
        'Vehicle suitability analysis',
        'Insurance risk assessment',
        'Price trend analysis',
        'Usage pattern learning'
      ],
      automationTasks: [
        'Monitor rental prices',
        'Auto-book optimal vehicles',
        'Send price alerts',
        'Manage reservations',
        'Track usage patterns',
        'Optimize pickup times'
      ]
    });

    // Travel Package Agent
    this.travelServices.set('travel_package_agent', {
      id: 'travel_package_agent',
      name: 'AI Travel Package Assistant',
      type: 'package_deal',
      description: 'Complete travel package optimization with AI-powered bundling',
      priceRange: { min: 200, max: 5000, currency: 'USD' },
      features: [
        'Multi-service bundling',
        'Cost optimization',
        'Itinerary generation',
        'Activity recommendations',
        'Transportation coordination',
        'Accommodation matching'
      ],
      aiCapabilities: [
        'Package optimization algorithm',
        'Itinerary generation',
        'Cost-benefit analysis',
        'Preference learning',
        'Seasonal optimization',
        'Group coordination'
      ],
      automationTasks: [
        'Monitor package deals',
        'Auto-create itineraries',
        'Send deal alerts',
        'Manage bookings',
        'Update preferences',
        'Coordinate services'
      ]
    });

    // Activity Booking Agent
    this.travelServices.set('activity_booking_agent', {
      id: 'activity_booking_agent',
      name: 'AI Activity Booking Assistant',
      type: 'activity',
      description: 'Smart activity recommendations with booking automation',
      priceRange: { min: 10, max: 500, currency: 'USD' },
      features: [
        'Personalized recommendations',
        'Weather-based suggestions',
        'Group size optimization',
        'Time slot optimization',
        'Review analysis',
        'Local expert integration'
      ],
      aiCapabilities: [
        'Interest matching',
        'Weather prediction integration',
        'Crowd level analysis',
        'Review sentiment analysis',
        'Personalization engine',
        'Optimal timing prediction'
      ],
      automationTasks: [
        'Monitor activity availability',
        'Auto-book popular activities',
        'Send recommendations',
        'Manage reservations',
        'Update preferences',
        'Track activity history'
      ]
    });
  }

  private initializeFoodServices() {
    // Restaurant Discovery Agent
    this.foodServices.set('restaurant_discovery_agent', {
      id: 'restaurant_discovery_agent',
      name: 'AI Restaurant Discovery Assistant',
      type: 'restaurant',
      description: 'Intelligent restaurant discovery with cuisine matching and reservation automation',
      priceRange: { min: 15, max: 200, currency: 'USD' },
      features: [
        'Cuisine preference learning',
        'Location-based recommendations',
        'Dietary restriction handling',
        'Reservation management',
        'Review sentiment analysis',
        'Menu optimization'
      ],
      aiCapabilities: [
        'Cuisine preference learning',
        'Location scoring',
        'Dietary analysis',
        'Review sentiment analysis',
        'Menu recommendation',
        'Optimal timing prediction'
      ],
      automationTasks: [
        'Monitor restaurant availability',
        'Auto-make reservations',
        'Send recommendations',
        'Manage dietary preferences',
        'Track dining history',
        'Update cuisine preferences'
      ]
    });

    // Food Delivery Agent
    this.foodServices.set('food_delivery_agent', {
      id: 'food_delivery_agent',
      name: 'AI Food Delivery Assistant',
      type: 'delivery',
      description: 'Smart food delivery with order optimization and cost analysis',
      priceRange: { min: 10, max: 100, currency: 'USD' },
      features: [
        'Order optimization',
        'Delivery time prediction',
        'Cost comparison',
        'Dietary filtering',
        'Repeat order automation',
        'Group order coordination'
      ],
      aiCapabilities: [
        'Order pattern learning',
        'Delivery time prediction',
        'Cost optimization',
        'Dietary analysis',
        'Preference learning',
        'Timing optimization'
      ],
      automationTasks: [
        'Monitor delivery options',
        'Auto-place repeat orders',
        'Send order suggestions',
        'Manage dietary preferences',
        'Track order history',
        'Optimize delivery times'
      ]
    });

    // Grocery Shopping Agent
    this.foodServices.set('grocery_shopping_agent', {
      id: 'grocery_shopping_agent',
      name: 'AI Grocery Shopping Assistant',
      type: 'grocery',
      description: 'Intelligent grocery shopping with inventory management and cost optimization',
      priceRange: { min: 20, max: 300, currency: 'USD' },
      features: [
        'Inventory tracking',
        'Price comparison',
        'Meal planning integration',
        'Expiry date monitoring',
        'Bulk buying optimization',
        'Nutritional analysis'
      ],
      aiCapabilities: [
        'Inventory prediction',
        'Price trend analysis',
        'Meal planning algorithm',
        'Nutritional optimization',
        'Expiry prediction',
        'Cost optimization'
      ],
      automationTasks: [
        'Monitor grocery prices',
        'Auto-add to cart',
        'Send shopping lists',
        'Manage inventory',
        'Track nutrition goals',
        'Optimize shopping trips'
      ]
    });

    // Meal Planning Agent
    this.foodServices.set('meal_planning_agent', {
      id: 'meal_planning_agent',
      name: 'AI Meal Planning Assistant',
      type: 'meal_plan',
      description: 'Smart meal planning with nutritional optimization and shopping automation',
      priceRange: { min: 50, max: 500, currency: 'USD' },
      features: [
        'Nutritional optimization',
        'Dietary restriction handling',
        'Shopping list generation',
        'Recipe recommendations',
        'Budget optimization',
        'Family coordination'
      ],
      aiCapabilities: [
        'Nutritional analysis',
        'Dietary optimization',
        'Recipe matching',
        'Budget optimization',
        'Family preference learning',
        'Meal timing optimization'
      ],
      automationTasks: [
        'Generate meal plans',
        'Create shopping lists',
        'Send recipe suggestions',
        'Manage dietary goals',
        'Track nutrition intake',
        'Optimize meal timing'
      ]
    });

    // Catering Service Agent
    this.foodServices.set('catering_service_agent', {
      id: 'catering_service_agent',
      name: 'AI Catering Service Assistant',
      type: 'catering',
      description: 'Intelligent catering coordination with event planning and cost optimization',
      priceRange: { min: 100, max: 2000, currency: 'USD' },
      features: [
        'Event planning integration',
        'Menu customization',
        'Guest count optimization',
        'Dietary accommodation',
        'Cost per person analysis',
        'Vendor coordination'
      ],
      aiCapabilities: [
        'Event analysis',
        'Menu optimization',
        'Guest preference learning',
        'Cost optimization',
        'Vendor matching',
        'Timing coordination'
      ],
      automationTasks: [
        'Monitor catering options',
        'Auto-coordinate vendors',
        'Send menu suggestions',
        'Manage guest preferences',
        'Track event history',
        'Optimize catering costs'
      ]
    });
  }

  private initializeSmartAgents() {
    // Travel Shopping Agent
    this.smartAgents.set('travel_shopping_agent', {
      id: 'travel_shopping_agent',
      name: 'AI Travel Shopping Agent',
      category: 'travel',
      capabilities: {
        priceComparison: true,
        dealDetection: true,
        bookingAutomation: true,
        preferenceLearning: true,
        budgetOptimization: true
      },
      integrations: [
        'Skyscanner API',
        'Booking.com API',
        'Expedia API',
        'Google Flights API',
        'Airbnb API',
        'RentalCars API'
      ],
      automationRules: [
        'Monitor price drops for watched flights',
        'Auto-book when price drops below threshold',
        'Send deal alerts for preferred destinations',
        'Optimize booking timing based on historical data',
        'Coordinate multi-service bookings',
        'Manage loyalty program points'
      ]
    });

    // Food Shopping Agent
    this.smartAgents.set('food_shopping_agent', {
      id: 'food_shopping_agent',
      name: 'AI Food Shopping Agent',
      category: 'food',
      capabilities: {
        priceComparison: true,
        dealDetection: true,
        bookingAutomation: true,
        preferenceLearning: true,
        budgetOptimization: true
      },
      integrations: [
        'Uber Eats API',
        'DoorDash API',
        'Grubhub API',
        'Instacart API',
        'Amazon Fresh API',
        'Local restaurant APIs'
      ],
      automationRules: [
        'Monitor food delivery prices',
        'Auto-order repeat meals',
        'Send restaurant recommendations',
        'Optimize grocery shopping lists',
        'Track dietary preferences',
        'Manage meal planning schedules'
      ]
    });

    // Universal Shopping Agent
    this.smartAgents.set('universal_shopping_agent', {
      id: 'universal_shopping_agent',
      name: 'AI Universal Shopping Agent',
      category: 'general',
      capabilities: {
        priceComparison: true,
        dealDetection: true,
        bookingAutomation: true,
        preferenceLearning: true,
        budgetOptimization: true
      },
      integrations: [
        'Amazon API',
        'eBay API',
        'Google Shopping API',
        'Price comparison APIs',
        'Deal aggregation APIs',
        'Wishlist management APIs'
      ],
      automationRules: [
        'Monitor prices across multiple platforms',
        'Auto-purchase when criteria met',
        'Send deal alerts for watched items',
        'Optimize shopping timing',
        'Manage wishlists and budgets',
        'Track purchase history and preferences'
      ]
    });
  }

  /**
   * Gets all travel services.
   * @returns {TravelService[]} A list of all travel services.
   */
  getTravelServices(): TravelService[] {
    return Array.from(this.travelServices.values());
  }

  /**
   * Gets all food services.
   * @returns {FoodService[]} A list of all food services.
   */
  getFoodServices(): FoodService[] {
    return Array.from(this.foodServices.values());
  }

  /**
   * Gets all smart shopping agents.
   * @returns {SmartShoppingAgent[]} A list of all smart shopping agents.
   */
  getSmartAgents(): SmartShoppingAgent[] {
    return Array.from(this.smartAgents.values());
  }

  /**
   * Gets a travel service by its ID.
   * @param {string} id The ID of the travel service.
   * @returns {TravelService | undefined} The travel service, or undefined if not found.
   */
  getTravelService(id: string): TravelService | undefined {
    return this.travelServices.get(id);
  }

  /**
   * Gets a food service by its ID.
   * @param {string} id The ID of the food service.
   * @returns {FoodService | undefined} The food service, or undefined if not found.
   */
  getFoodService(id: string): FoodService | undefined {
    return this.foodServices.get(id);
  }

  /**
   * Gets a smart shopping agent by its ID.
   * @param {string} id The ID of the smart shopping agent.
   * @returns {SmartShoppingAgent | undefined} The smart shopping agent, or undefined if not found.
   */
  getSmartAgent(id: string): SmartShoppingAgent | undefined {
    return this.smartAgents.get(id);
  }

  /**
   * Creates a custom agent template.
   * @param {string} name The name of the agent.
   * @param {'travel' | 'food' | 'general'} category The category of the agent.
   * @param {Partial<SmartShoppingAgent['capabilities']>} capabilities The capabilities of the agent.
   * @param {string[]} integrations The integrations of the agent.
   * @param {string[]} automationRules The automation rules of the agent.
   * @returns {SmartShoppingAgent} The newly created smart shopping agent.
   */
  createCustomAgentTemplate(
    name: string,
    category: 'travel' | 'food' | 'general',
    capabilities: Partial<SmartShoppingAgent['capabilities']>,
    integrations: string[],
    automationRules: string[]
  ): SmartShoppingAgent {
    const id = `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    
    const agent: SmartShoppingAgent = {
      id,
      name,
      category,
      capabilities: {
        priceComparison: capabilities.priceComparison || false,
        dealDetection: capabilities.dealDetection || false,
        bookingAutomation: capabilities.bookingAutomation || false,
        preferenceLearning: capabilities.preferenceLearning || false,
        budgetOptimization: capabilities.budgetOptimization || false
      },
      integrations,
      automationRules
    };

    this.smartAgents.set(id, agent);
    return agent;
  }

  /**
   * Generates AI-powered travel recommendations.
   * @param {string} userId The user's ID.
   * @param {string} destination The destination.
   * @param {number} budget The budget.
   * @param {any} preferences The user's preferences.
   * @returns {Promise<{ flights: any[]; hotels: any[]; activities: any[]; packages: any[]; }>} A promise that resolves with travel recommendations.
   */
  async generateTravelRecommendations(
    userId: string,
    destination: string,
    budget: number,
    preferences: any
  ): Promise<{
    flights: any[];
    hotels: any[];
    activities: any[];
    packages: any[];
  }> {
    const user = await storage.select().from(users).where(eq(users.id, userId)).first();
    const persona = user?.persona ?? null;
    const allTravelServices = this.getTravelServices();

    const flights = allTravelServices
      .filter(service => service.type === 'flight' && service.priceRange.max <= budget * 0.4)
      .map(service => ({
        airline: service.name,
        price: service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min),
        duration: '5h 30m', // Placeholder
        stops: Math.floor(Math.random() * 2), // Placeholder
        departure: '2024-01-15 08:00', // Placeholder
        arrival: '2024-01-15 13:30', // Placeholder
        aiScore: calculateAIScore(service, persona)
      }));

    const hotels = allTravelServices
      .filter(service => service.type === 'hotel' && service.priceRange.max <= budget * 0.5)
      .map(service => ({
        name: service.name,
        price: service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min),
        rating: Math.random() * 1 + 4, // 4.0-5.0
        location: 'City Center', // Placeholder
        amenities: service.features.slice(0, 4),
        aiScore: calculateAIScore(service, persona)
      }));

    const activities = allTravelServices
      .filter(service => service.type === 'activity' && service.priceRange.max <= budget * 0.1)
      .map(service => ({
        name: service.name,
        price: service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min),
        duration: '3 hours', // Placeholder
        rating: Math.random() * 1 + 4, // 4.0-5.0
        aiScore: calculateAIScore(service, persona)
      }));

    const packages = allTravelServices
      .filter(service => service.type === 'package_deal' && service.priceRange.max <= budget)
      .map(service => ({
          name: service.name,
          price: service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min),
          savings: (service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min)) * 0.2,
          includes: service.features.slice(0,4),
          aiScore: calculateAIScore(service, persona)
      }));


    return { flights, hotels, activities, packages };
  }

  /**
   * Generates AI-powered food recommendations.
   * @param {string} userId The user's ID.
   * @param {string} location The location.
   * @param {number} budget The budget.
   * @param {any} preferences The user's preferences.
   * @returns {Promise<{ restaurants: any[]; delivery: any[]; groceries: any[]; mealPlans: any[]; }>} A promise that resolves with food recommendations.
   */
  async generateFoodRecommendations(
    userId: string,
    location: string,
    budget: number,
    preferences: any
  ): Promise<{
    restaurants: any[];
    delivery: any[];
    groceries: any[];
    mealPlans: any[];
  }> {
      const user = await storage.select().from(users).where(eq(users.id, userId)).first();
      const persona = user?.persona ?? null;
      const allFoodServices = this.getFoodServices();

      const restaurants = allFoodServices
          .filter(service => service.type === 'restaurant' && service.priceRange.max <= budget * 0.3)
          .map(service => ({
              name: service.name,
              cuisine: service.cuisine.join(', '),
              price: service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min),
              rating: Math.random() * 1 + 4, // 4.0-5.0
              distance: `${(Math.random() * 5).toFixed(1)} miles`, // Placeholder
              aiScore: calculateAIScore(service, persona)
          }));

      const delivery = allFoodServices
          .filter(service => service.type === 'delivery' && service.priceRange.max <= budget * 0.2)
          .map(service => ({
              name: service.name,
              cuisine: service.cuisine.join(', '),
              price: service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min),
              deliveryTime: `${Math.floor(Math.random() * 30 + 15)} min`, // 15-45 min
              rating: Math.random() * 1 + 4, // 4.0-5.0
              aiScore: calculateAIScore(service, persona)
          }));

      const groceries = allFoodServices
          .filter(service => service.type === 'grocery' && service.priceRange.max <= budget * 0.4)
          .map(service => ({
              name: service.name,
              items: service.features.slice(0, 3),
              price: service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min),
              savings: (service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min)) * 0.1,
              aiScore: calculateAIScore(service, persona)
          }));

      const mealPlans = allFoodServices
          .filter(service => service.type === 'meal_plan' && service.priceRange.max <= budget * 0.5)
          .map(service => ({
              name: service.name,
              duration: '7 days', // Placeholder
              price: service.priceRange.min + Math.random() * (service.priceRange.max - service.priceRange.min),
              meals: 21, // Placeholder
              nutritionScore: Math.random() + 9, // 9.0-10.0
              aiScore: calculateAIScore(service, persona)
          }));

    return { restaurants, delivery, groceries, mealPlans };
  }
}

// Export singleton instance
let travelFoodServiceManager: TravelFoodServiceManager | null = null;

/**
 * Gets the singleton instance of the TravelFoodServiceManager.
 * @returns {TravelFoodServiceManager} The singleton instance of the TravelFoodServiceManager.
 */
export function getTravelFoodServiceManager(): TravelFoodServiceManager {
  if (!travelFoodServiceManager) {
    travelFoodServiceManager = new TravelFoodServiceManager();
  }
  return travelFoodServiceManager;
}
