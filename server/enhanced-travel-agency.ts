import { storage } from './storage.js';
import { generateContent } from './gemini.js';

interface TravelDestination {
  id: string;
  name: string;
  country: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  bestTimeToVisit: string[];
  attractions: string[];
  localCurrency: string;
  visaRequirements: string;
  safetyLevel: 'low' | 'medium' | 'high';
  aiRecommendations: string[];
}

interface FlightSearch {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  class: 'economy' | 'premium_economy' | 'business' | 'first';
  preferences: {
    preferredAirlines?: string[];
    maxStops?: number;
    preferredAirports?: string[];
    seatPreferences?: string[];
  };
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration: string;
  stops: number;
  price: {
    amount: number;
    currency: string;
    breakdown: {
      base: number;
      taxes: number;
      fees: number;
    };
  };
  aircraft: string;
  amenities: string[];
  baggageAllowance: {
    carryOn: string;
    checked: string;
  };
  aiScore: number;
  aiInsights: string[];
}

interface HotelSearch {
  id: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  preferences: {
    starRating?: number;
    amenities?: string[];
    location?: string;
    maxDistanceFromCenter?: number;
  };
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface HotelOption {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  starRating: number;
  price: {
    amount: number;
    currency: string;
    perNight: number;
    total: number;
  };
  amenities: string[];
  images: string[];
  reviews: {
    rating: number;
    count: number;
    highlights: string[];
  };
  availability: boolean;
  cancellationPolicy: string;
  aiScore: number;
  aiInsights: string[];
}

interface TravelPackage {
  id: string;
  name: string;
  destination: string;
  duration: number;
  price: {
    amount: number;
    currency: string;
    perPerson: number;
  };
  includes: string[];
  highlights: string[];
  itinerary: TravelItinerary[];
  aiRecommendations: string[];
  bestFor: string[];
}

interface TravelItinerary {
  day: number;
  date: string;
  activities: Activity[];
  meals: Meal[];
  accommodation?: string;
  transportation: Transportation[];
  notes: string[];
}

interface Activity {
  id: string;
  name: string;
  type: string;
  duration: string;
  price: number;
  location: string;
  description: string;
  aiRating: number;
}

interface Meal {
  id: string;
  restaurant: string;
  cuisine: string;
  priceRange: string;
  location: string;
  time: string;
  aiRecommendation: string;
}

interface Transportation {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'taxi' | 'rental_car' | 'walking';
  from: string;
  to: string;
  duration: string;
  price: number;
  bookingRequired: boolean;
}

interface TravelBooking {
  id: string;
  type: 'flight' | 'hotel' | 'package' | 'activity';
  reference: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  bookingDate: Date;
  travelDate: Date;
  details: any;
  price: {
    amount: number;
    currency: string;
  };
  confirmationCode: string;
  cancellationPolicy: string;
}

interface UserTravelProfile {
  userId: string;
  preferences: {
    destinations: string[];
    travelStyle: 'budget' | 'comfort' | 'luxury';
    interests: string[];
    dietaryRestrictions: string[];
    accessibilityNeeds: string[];
  };
  history: {
    bookings: TravelBooking[];
    destinations: string[];
    airlines: string[];
    hotels: string[];
  };
  budget: {
    averageTripBudget: number;
    currency: string;
    flexibility: 'low' | 'medium' | 'high';
  };
  aiInsights: {
    preferredTravelTimes: string[];
    favoriteDestinations: string[];
    spendingPatterns: any;
    recommendations: string[];
  };
}

/**
 * Manages an enhanced travel agency with AI-powered features.
 */
export class EnhancedTravelAgency {
  private destinations: Map<string, TravelDestination> = new Map();
  private userProfiles: Map<string, UserTravelProfile> = new Map();
  private bookings: Map<string, TravelBooking> = new Map();
  private aiRecommendations: Map<string, any> = new Map();

  /**
   * Creates an instance of EnhancedTravelAgency.
   */
  constructor() {
    this.initializeDestinations();
    this.startAITravelEngine();
  }

  private initializeDestinations() {
    // Popular destinations with AI-enhanced data
    const destinations = [
      {
        id: 'paris_france',
        name: 'Paris',
        country: 'France',
        city: 'Paris',
        coordinates: { latitude: 48.8566, longitude: 2.3522 },
        timezone: 'CET',
        bestTimeToVisit: ['April', 'May', 'September', 'October'],
        attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
        localCurrency: 'EUR',
        visaRequirements: 'Schengen visa required for most non-EU citizens',
        safetyLevel: 'medium',
        aiRecommendations: [
          'Best visited in spring for pleasant weather and fewer crowds',
          'Book museum tickets in advance to avoid long queues',
          'Try local cuisine at neighborhood bistros for authentic experience',
          'Use public transport - efficient and affordable'
        ]
      },
      {
        id: 'tokyo_japan',
        name: 'Tokyo',
        country: 'Japan',
        city: 'Tokyo',
        coordinates: { latitude: 35.6762, longitude: 139.6503 },
        timezone: 'JST',
        bestTimeToVisit: ['March', 'April', 'May', 'September', 'October', 'November'],
        attractions: ['Senso-ji Temple', 'Tokyo Skytree', 'Shibuya Crossing', 'Tsukiji Fish Market'],
        localCurrency: 'JPY',
        visaRequirements: 'Visa-free for 90 days for most countries',
        safetyLevel: 'high',
        aiRecommendations: [
          'Spring (March-May) offers cherry blossoms and mild weather',
          'Autumn (September-November) has beautiful foliage',
          'Learn basic Japanese phrases for better experience',
          'Use JR Pass for efficient train travel'
        ]
      },
      {
        id: 'new_york_usa',
        name: 'New York City',
        country: 'USA',
        city: 'New York',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        timezone: 'EST',
        bestTimeToVisit: ['April', 'May', 'September', 'October'],
        attractions: ['Statue of Liberty', 'Central Park', 'Times Square', 'Brooklyn Bridge'],
        localCurrency: 'USD',
        visaRequirements: 'ESTA required for visa waiver program countries',
        safetyLevel: 'medium',
        aiRecommendations: [
          'Book Broadway shows well in advance',
          'Use subway system for efficient city travel',
          'Visit during shoulder seasons for better prices',
          'Try diverse cuisines in different neighborhoods'
        ]
      }
    ];

    destinations.forEach(dest => {
      this.destinations.set(dest.id, dest);
    });
  }

  private startAITravelEngine() {
    console.log('✈️ Enhanced AI Travel Agency Engine started');
    
    // Start AI-powered travel monitoring
    setInterval(() => {
      this.runAITravelAnalysis();
    }, 300000); // Every 5 minutes

    // Start price monitoring
    setInterval(() => {
      this.monitorTravelPrices();
    }, 600000); // Every 10 minutes
  }

  /**
   * Searches for flights using AI.
   * @param {FlightSearch} searchParams The flight search parameters.
   * @returns {Promise<FlightOption[]>} A promise that resolves with a list of flight options.
   */
  async searchFlights(searchParams: FlightSearch): Promise<FlightOption[]> {
    console.log(`🔍 AI-powered flight search: ${searchParams.origin} → ${searchParams.destination}`);
    
    try {
      // Generate AI-powered flight search prompt
      const prompt = `Find the best flight options from ${searchParams.origin} to ${searchParams.destination} 
      departing ${searchParams.departureDate}${searchParams.returnDate ? `, returning ${searchParams.returnDate}` : ''}.
      
      Passenger details:
      - Passengers: ${searchParams.passengers}
      - Class: ${searchParams.class}
      - Budget: ${searchParams.budget ? `${searchParams.budget.min}-${searchParams.budget.max} ${searchParams.budget.currency}` : 'Flexible'}
      
      Preferences:
      - Preferred airlines: ${searchParams.preferences.preferredAirlines?.join(', ') || 'Any'}
      - Max stops: ${searchParams.preferences.maxStops || 'Any'}
      
      Provide 5 flight options with detailed information including:
      1. Airline and flight number
      2. Departure and arrival times
      3. Duration and stops
      4. Price breakdown
      5. AI recommendations for each option
      6. Pros and cons
      
      Format as JSON array of flight options.`;

      const aiResponse = await generateContent(prompt);
      
      // Parse AI response and create flight options
      const flightOptions = this.parseFlightOptions(aiResponse, searchParams);
      
      // Enhance with AI scoring
      const enhancedOptions = flightOptions.map(option => ({
        ...option,
        aiScore: this.calculateFlightScore(option, searchParams),
        aiInsights: this.generateFlightInsights(option, searchParams)
      }));

      console.log(`✅ Found ${enhancedOptions.length} flight options`);
      return enhancedOptions.sort((a, b) => b.aiScore - a.aiScore);

    } catch (error) {
      console.error('Error in AI flight search:', error);
      return [];
    }
  }

  /**
   * Searches for hotels using AI.
   * @param {HotelSearch} searchParams The hotel search parameters.
   * @returns {Promise<HotelOption[]>} A promise that resolves with a list of hotel options.
   */
  async searchHotels(searchParams: HotelSearch): Promise<HotelOption[]> {
    console.log(`🏨 AI-powered hotel search in ${searchParams.destination}`);
    
    try {
      const prompt = `Find the best hotel options in ${searchParams.destination} 
      for check-in ${searchParams.checkIn} and check-out ${searchParams.checkOut}.
      
      Guest details:
      - Guests: ${searchParams.guests}
      - Rooms: ${searchParams.rooms}
      - Budget: ${searchParams.budget ? `${searchParams.budget.min}-${searchParams.budget.max} ${searchParams.budget.currency}` : 'Flexible'}
      
      Preferences:
      - Star rating: ${searchParams.preferences.starRating || 'Any'}
      - Amenities: ${searchParams.preferences.amenities?.join(', ') || 'Any'}
      - Location: ${searchParams.preferences.location || 'Any'}
      
      Provide 5 hotel options with detailed information including:
      1. Hotel name and location
      2. Star rating and price
      3. Amenities and features
      4. Guest reviews summary
      5. AI recommendations
      6. Best for (business, leisure, families, etc.)
      
      Format as JSON array of hotel options.`;

      const aiResponse = await generateContent(prompt);
      
      // Parse AI response and create hotel options
      const hotelOptions = this.parseHotelOptions(aiResponse, searchParams);
      
      // Enhance with AI scoring
      const enhancedOptions = hotelOptions.map(option => ({
        ...option,
        aiScore: this.calculateHotelScore(option, searchParams),
        aiInsights: this.generateHotelInsights(option, searchParams)
      }));

      console.log(`✅ Found ${enhancedOptions.length} hotel options`);
      return enhancedOptions.sort((a, b) => b.aiScore - a.aiScore);

    } catch (error) {
      console.error('Error in AI hotel search:', error);
      return [];
    }
  }

  /**
   * Gets personalized travel recommendations for a user.
   * @param {string} userId The ID of the user.
   * @param {string} destination The destination.
   * @returns {Promise<TravelPackage[]>} A promise that resolves with a list of travel packages.
   */
  async getPersonalizedRecommendations(userId: string, destination: string): Promise<TravelPackage[]> {
    console.log(`🎯 Generating personalized travel recommendations for ${userId} in ${destination}`);
    
    try {
      const userProfile = await this.getUserProfile(userId);
      const destinationInfo = this.destinations.get(destination);
      
      if (!destinationInfo) {
        throw new Error('Destination not found');
      }

      const prompt = `Create personalized travel recommendations for ${destination} based on user profile:
      
      User Preferences:
      - Travel Style: ${userProfile.preferences.travelStyle}
      - Interests: ${userProfile.preferences.interests.join(', ')}
      - Budget: ${userProfile.budget.averageTripBudget} ${userProfile.budget.currency}
      - Previous Destinations: ${userProfile.history.destinations.join(', ')}
      
      Destination: ${destinationInfo.name}, ${destinationInfo.country}
      - Best Time: ${destinationInfo.bestTimeToVisit.join(', ')}
      - Attractions: ${destinationInfo.attractions.join(', ')}
      
      Create 3 travel package options:
      1. Budget-friendly option
      2. Comfort/standard option  
      3. Luxury/premium option
      
      Each package should include:
      - Duration (3-7 days)
      - Detailed itinerary
      - Activities and attractions
      - Dining recommendations
      - Transportation options
      - Price estimation
      - AI insights and tips
      
      Format as JSON array of travel packages.`;

      const aiResponse = await generateContent(prompt);
      const packages = this.parseTravelPackages(aiResponse, destinationInfo);
      
      console.log(`✅ Generated ${packages.length} personalized travel packages`);
      return packages;

    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return [];
    }
  }

  /**
   * Books a travel service.
   * @param {any} bookingRequest The booking request.
   * @returns {Promise<TravelBooking>} A promise that resolves with the booking information.
   */
  async bookTravel(bookingRequest: any): Promise<TravelBooking> {
    console.log(`📋 Processing travel booking: ${bookingRequest.type}`);
    
    try {
      // AI-powered booking validation
      const validationResult = await this.validateBooking(bookingRequest);
      
      if (!validationResult.valid) {
        throw new Error(`Booking validation failed: ${validationResult.reason}`);
      }

      // Generate booking reference
      const reference = this.generateBookingReference();
      const confirmationCode = this.generateConfirmationCode();

      const booking: TravelBooking = {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: bookingRequest.type,
        reference,
        status: 'confirmed',
        bookingDate: new Date(),
        travelDate: new Date(bookingRequest.travelDate),
        details: bookingRequest.details,
        price: bookingRequest.price,
        confirmationCode,
        cancellationPolicy: this.getCancellationPolicy(bookingRequest.type)
      };

      this.bookings.set(booking.id, booking);

      // Update user profile with booking
      await this.updateUserProfile(bookingRequest.userId, booking);

      // Send AI-powered confirmation
      await this.sendBookingConfirmation(booking);

      console.log(`✅ Travel booking confirmed: ${booking.confirmationCode}`);
      return booking;

    } catch (error) {
      console.error('Error processing travel booking:', error);
      throw error;
    }
  }

  // AI Travel Analysis and Monitoring
  private async runAITravelAnalysis() {
    console.log('🧠 Running AI travel analysis...');
    
    try {
      // Analyze travel trends and patterns
      const trendsPrompt = `Analyze current travel trends and provide insights for:
      1. Popular destinations this season
      2. Best booking times and strategies
      3. Price trends for flights and hotels
      4. Emerging travel preferences
      5. Travel safety considerations
      
      Provide actionable recommendations for travelers.`;

      const trendsResponse = await generateContent(trendsPrompt);
      
      // Store AI insights
      this.aiRecommendations.set('travel_trends', {
        timestamp: new Date(),
        insights: trendsResponse,
        recommendations: this.extractRecommendations(trendsResponse)
      });

      console.log('✅ AI travel analysis completed');

    } catch (error) {
      console.error('Error in AI travel analysis:', error);
    }
  }

  private async monitorTravelPrices() {
    console.log('💰 Monitoring travel prices...');
    
    // Simulate price monitoring for popular routes
    const popularRoutes = [
      { origin: 'NYC', destination: 'LAX' },
      { origin: 'LHR', destination: 'CDG' },
      { origin: 'NRT', destination: 'ICN' }
    ];

    for (const route of popularRoutes) {
      try {
        const priceAlert = await this.checkPriceDrops(route.origin, route.destination);
        if (priceAlert) {
          await this.sendPriceAlert(priceAlert);
        }
      } catch (error) {
        console.error(`Error monitoring prices for ${route.origin}-${route.destination}:`, error);
      }
    }
  }

  // Utility Methods
  private parseFlightOptions(aiResponse: string, searchParams: FlightSearch): FlightOption[] {
    // Parse AI response and create structured flight options
    // This would parse the JSON response from AI and create FlightOption objects
    const mockOptions: FlightOption[] = [
      {
        id: 'flight_1',
        airline: 'Airline A',
        flightNumber: 'AA123',
        departure: { airport: searchParams.origin, time: '08:00' },
        arrival: { airport: searchParams.destination, time: '12:00' },
        duration: '4h 00m',
        stops: 0,
        price: { amount: 299, currency: 'USD', breakdown: { base: 250, taxes: 40, fees: 9 } },
        aircraft: 'Boeing 737',
        amenities: ['WiFi', 'Entertainment', 'Meals'],
        baggageAllowance: { carryOn: '1 bag', checked: '2 bags' },
        aiScore: 0,
        aiInsights: []
      }
    ];
    
    return mockOptions;
  }

  private parseHotelOptions(aiResponse: string, searchParams: HotelSearch): HotelOption[] {
    // Parse AI response and create structured hotel options
    const mockOptions: HotelOption[] = [
      {
        id: 'hotel_1',
        name: 'Grand Hotel',
        address: '123 Main St, City Center',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        starRating: 4,
        price: { amount: 150, currency: 'USD', perNight: 150, total: 450 },
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
        images: [],
        reviews: { rating: 4.5, count: 1234, highlights: ['Great location', 'Excellent service'] },
        availability: true,
        cancellationPolicy: 'Free cancellation until 24h before check-in',
        aiScore: 0,
        aiInsights: []
      }
    ];
    
    return mockOptions;
  }

  private parseTravelPackages(aiResponse: string, destination: TravelDestination): TravelPackage[] {
    // Parse AI response and create structured travel packages
    const mockPackages: TravelPackage[] = [
      {
        id: 'package_1',
        name: `${destination.name} Discovery Package`,
        destination: destination.name,
        duration: 5,
        price: { amount: 1200, currency: 'USD', perPerson: 1200 },
        includes: ['Flights', 'Hotel', 'Activities', 'Meals'],
        highlights: ['City tour', 'Local experiences', 'Cultural sites'],
        itinerary: [],
        aiRecommendations: [],
        bestFor: ['First-time visitors', 'Cultural enthusiasts']
      }
    ];
    
    return mockPackages;
  }

  private calculateFlightScore(option: FlightOption, searchParams: FlightSearch): number {
    let score = 0;
    
    // Price score (lower price = higher score)
    if (searchParams.budget) {
      const priceRatio = option.price.amount / searchParams.budget.max;
      score += (1 - priceRatio) * 30;
    }
    
    // Duration score (shorter = higher score)
    const durationHours = this.parseDurationToHours(option.duration);
    score += (1 - durationHours / 12) * 25;
    
    // Stops score (fewer stops = higher score)
    score += (1 - option.stops / 3) * 20;
    
    // Amenities score
    score += option.amenities.length * 5;
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateHotelScore(option: HotelOption, searchParams: HotelSearch): number {
    let score = 0;
    
    // Review score
    score += option.reviews.rating * 15;
    
    // Star rating score
    score += option.starRating * 10;
    
    // Price score
    if (searchParams.budget) {
      const priceRatio = option.price.perNight / searchParams.budget.max;
      score += (1 - priceRatio) * 25;
    }
    
    // Amenities score
    score += option.amenities.length * 3;
    
    return Math.min(100, Math.max(0, score));
  }

  private generateFlightInsights(option: FlightOption, searchParams: FlightSearch): string[] {
    const insights = [];
    
    if (option.stops === 0) {
      insights.push('Direct flight - no layovers for maximum convenience');
    } else if (option.stops === 1) {
      insights.push('One stop - good balance of price and convenience');
    } else {
      insights.push('Multiple stops - most economical option');
    }
    
    if (option.price.amount < 300) {
      insights.push('Excellent value for money');
    }
    
    if (option.amenities.includes('WiFi')) {
      insights.push('WiFi available for productivity');
    }
    
    return insights;
  }

  private generateHotelInsights(option: HotelOption, searchParams: HotelSearch): string[] {
    const insights = [];
    
    if (option.reviews.rating > 4.5) {
      insights.push('Highly rated by guests');
    }
    
    if (option.starRating >= 4) {
      insights.push('Premium accommodation with excellent amenities');
    }
    
    if (option.amenities.includes('Pool')) {
      insights.push('Swimming pool available for relaxation');
    }
    
    return insights;
  }

  private parseDurationToHours(duration: string): number {
    const match = duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      return parseInt(match[1]) + parseInt(match[2]) / 60;
    }
    return 0;
  }

  private generateBookingReference(): string {
    return `TRV${Date.now().toString(36).toUpperCase()}`;
  }

  private generateConfirmationCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private getCancellationPolicy(type: string): string {
    const policies = {
      flight: 'Cancellation allowed up to 24 hours before departure',
      hotel: 'Free cancellation until 24 hours before check-in',
      package: 'Cancellation policy varies by component',
      activity: 'Cancellation allowed up to 48 hours before activity'
    };
    
    return policies[type as keyof typeof policies] || 'Standard cancellation policy applies';
  }

  private async validateBooking(bookingRequest: any): Promise<{ valid: boolean; reason?: string }> {
    // AI-powered booking validation
    const prompt = `Validate this travel booking request:
    Type: ${bookingRequest.type}
    Travel Date: ${bookingRequest.travelDate}
    Price: ${bookingRequest.price?.amount} ${bookingRequest.price?.currency}
    
    Check for:
    1. Valid travel dates
    2. Reasonable pricing
    3. Required information completeness
    4. Any potential issues
    
    Respond with JSON: {"valid": true/false, "reason": "explanation"}`;

    try {
      const aiResponse = await generateContent(prompt);
      const validation = JSON.parse(aiResponse);
      return validation;
    } catch (error) {
      return { valid: true }; // Default to valid if AI validation fails
    }
  }

  private async getUserProfile(userId: string): Promise<UserTravelProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      // Create default profile
      profile = {
        userId,
        preferences: {
          destinations: [],
          travelStyle: 'comfort',
          interests: ['culture', 'food', 'sightseeing'],
          dietaryRestrictions: [],
          accessibilityNeeds: []
        },
        history: {
          bookings: [],
          destinations: [],
          airlines: [],
          hotels: []
        },
        budget: {
          averageTripBudget: 2000,
          currency: 'USD',
          flexibility: 'medium'
        },
        aiInsights: {
          preferredTravelTimes: [],
          favoriteDestinations: [],
          spendingPatterns: {},
          recommendations: []
        }
      };
      
      this.userProfiles.set(userId, profile);
    }
    
    return profile;
  }

  private async updateUserProfile(userId: string, booking: TravelBooking): Promise<void> {
    const profile = await this.getUserProfile(userId);
    profile.history.bookings.push(booking);
    this.userProfiles.set(userId, profile);
  }

  private async sendBookingConfirmation(booking: TravelBooking): Promise<void> {
    console.log(`📧 Sending booking confirmation for ${booking.confirmationCode}`);
    // Implementation would send email/SMS confirmation
  }

  private async checkPriceDrops(origin: string, destination: string): Promise<any> {
    // Simulate price drop detection
    return null;
  }

  private async sendPriceAlert(alert: any): Promise<void> {
    console.log(`💰 Price alert sent: ${alert.message}`);
  }

  private extractRecommendations(response: string): string[] {
    // Extract actionable recommendations from AI response
    return ['Book flights 6-8 weeks in advance for best prices', 'Consider shoulder season for fewer crowds'];
  }

  /**
   * Gets all travel destinations.
   * @returns {Promise<TravelDestination[]>} A promise that resolves with a list of travel destinations.
   */
  async getDestinations(): Promise<TravelDestination[]> {
    return Array.from(this.destinations.values());
  }

  /**
   * Gets a travel destination by its ID.
   * @param {string} id The ID of the travel destination to get.
   * @returns {Promise<TravelDestination | null>} A promise that resolves with the travel destination, or null if not found.
   */
  async getDestination(id: string): Promise<TravelDestination | null> {
    return this.destinations.get(id) || null;
  }

  /**
   * Gets all bookings for a user.
   * @param {string} userId The ID of the user.
   * @returns {Promise<TravelBooking[]>} A promise that resolves with a list of bookings.
   */
  async getUserBookings(userId: string): Promise<TravelBooking[]> {
    const profile = await this.getUserProfile(userId);
    return profile.history.bookings;
  }

  /**
   * Gets a booking by its ID.
   * @param {string} id The ID of the booking to get.
   * @returns {Promise<TravelBooking | null>} A promise that resolves with the booking, or null if not found.
   */
  async getBooking(id: string): Promise<TravelBooking | null> {
    return this.bookings.get(id) || null;
  }

  /**
   * Gets AI-powered travel recommendations.
   * @returns {Promise<any>} A promise that resolves with AI-powered travel recommendations.
   */
  async getAIRecommendations(): Promise<any> {
    return Array.from(this.aiRecommendations.entries());
  }
}

// Export singleton instance
let enhancedTravelAgency: EnhancedTravelAgency | null = null;

/**
 * Gets the singleton instance of the EnhancedTravelAgency.
 * @returns {EnhancedTravelAgency} The singleton instance of the EnhancedTravelAgency.
 */
export function getEnhancedTravelAgency(): EnhancedTravelAgency {
  if (!enhancedTravelAgency) {
    enhancedTravelAgency = new EnhancedTravelAgency();
  }
  return enhancedTravelAgency;
}
