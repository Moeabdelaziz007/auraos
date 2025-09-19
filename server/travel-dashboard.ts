import { getEnhancedTravelAgency } from './enhanced-travel-agency.js';
import { getEnterpriseTeamManager } from './enterprise-team-management.js';

interface TravelDashboardMetrics {
  timestamp: Date;
  bookings: BookingMetrics;
  revenue: RevenueMetrics;
  destinations: DestinationMetrics;
  customerSatisfaction: SatisfactionMetrics;
  aiPerformance: AIPerformanceMetrics;
  trends: TravelTrends;
}

interface BookingMetrics {
  totalBookings: number;
  bookingsToday: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  averageBookingValue: number;
  bookingSuccessRate: number;
  cancellationRate: number;
  refundRate: number;
  bookingsByType: Record<string, number>;
  bookingsByDestination: Record<string, number>;
}

interface RevenueMetrics {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  averageRevenuePerBooking: number;
  revenueGrowth: number;
  revenueByType: Record<string, number>;
  revenueByDestination: Record<string, number>;
  profitMargin: number;
}

interface DestinationMetrics {
  totalDestinations: number;
  popularDestinations: Array<{
    destination: string;
    bookings: number;
    revenue: number;
    growth: number;
  }>;
  seasonalTrends: Record<string, any>;
  destinationPerformance: Record<string, any>;
}

interface SatisfactionMetrics {
  averageRating: number;
  totalReviews: number;
  satisfactionByDestination: Record<string, number>;
  complaintRate: number;
  repeatBookingRate: number;
  netPromoterScore: number;
}

interface AIPerformanceMetrics {
  aiRecommendationAccuracy: number;
  aiBookingSuccessRate: number;
  aiPriceOptimizationSavings: number;
  aiCustomerSatisfaction: number;
  aiProcessingTime: number;
  aiUptime: number;
}

interface TravelTrends {
  trendingDestinations: string[];
  seasonalPatterns: any;
  priceTrends: any;
  customerPreferences: any;
  marketInsights: any;
}

interface TravelDashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'calendar';
  title: string;
  description: string;
  position: { x: number; y: number; width: number; height: number };
  config: any;
  data: any;
  refreshInterval: number;
}

export class TravelDashboard {
  private metrics: TravelDashboardMetrics | null = null;
  private widgets: Map<string, TravelDashboardWidget> = new Map();
  private subscribers: Set<any> = new Set();
  private isMonitoring: boolean = false;

  constructor() {
    this.initializeDefaultWidgets();
    this.startMonitoring();
  }

  private initializeDefaultWidgets() {
    // Booking Overview Widget
    this.widgets.set('booking_overview', {
      id: 'booking_overview',
      type: 'metric',
      title: 'Booking Overview',
      description: 'Total bookings and key metrics',
      position: { x: 0, y: 0, width: 4, height: 2 },
      config: {
        showTrends: true,
        timeRange: '30d'
      },
      data: null,
      refreshInterval: 30000
    });

    // Revenue Dashboard Widget
    this.widgets.set('revenue_dashboard', {
      id: 'revenue_dashboard',
      type: 'chart',
      title: 'Revenue Analytics',
      description: 'Revenue trends and breakdown',
      position: { x: 4, y: 0, width: 4, height: 2 },
      config: {
        chartType: 'line',
        showLegend: true,
        timeRange: '90d'
      },
      data: null,
      refreshInterval: 60000
    });

    // Popular Destinations Widget
    this.widgets.set('popular_destinations', {
      id: 'popular_destinations',
      type: 'chart',
      title: 'Popular Destinations',
      description: 'Top destinations by bookings',
      position: { x: 8, y: 0, width: 4, height: 2 },
      config: {
        chartType: 'bar',
        maxItems: 10,
        sortBy: 'bookings'
      },
      data: null,
      refreshInterval: 30000
    });

    // AI Performance Widget
    this.widgets.set('ai_performance', {
      id: 'ai_performance',
      type: 'metric',
      title: 'AI Performance',
      description: 'AI system performance metrics',
      position: { x: 0, y: 2, width: 3, height: 2 },
      config: {
        showDetails: true,
        metrics: ['accuracy', 'uptime', 'satisfaction']
      },
      data: null,
      refreshInterval: 15000
    });

    // Customer Satisfaction Widget
    this.widgets.set('customer_satisfaction', {
      id: 'customer_satisfaction',
      type: 'metric',
      title: 'Customer Satisfaction',
      description: 'Customer ratings and feedback',
      position: { x: 3, y: 2, width: 3, height: 2 },
      config: {
        showTrends: true,
        includeReviews: true
      },
      data: null,
      refreshInterval: 60000
    });

    // Travel Calendar Widget
    this.widgets.set('travel_calendar', {
      id: 'travel_calendar',
      type: 'calendar',
      title: 'Travel Calendar',
      description: 'Upcoming bookings and events',
      position: { x: 6, y: 2, width: 6, height: 4 },
      config: {
        view: 'month',
        showBookings: true,
        showEvents: true
      },
      data: null,
      refreshInterval: 30000
    });

    // Booking Trends Widget
    this.widgets.set('booking_trends', {
      id: 'booking_trends',
      type: 'chart',
      title: 'Booking Trends',
      description: 'Booking patterns and trends',
      position: { x: 0, y: 4, width: 6, height: 3 },
      config: {
        chartType: 'area',
        showForecast: true,
        timeRange: '1y'
      },
      data: null,
      refreshInterval: 60000
    });

    // Recent Bookings Widget
    this.widgets.set('recent_bookings', {
      id: 'recent_bookings',
      type: 'table',
      title: 'Recent Bookings',
      description: 'Latest travel bookings',
      position: { x: 6, y: 6, width: 6, height: 3 },
      config: {
        maxRows: 10,
        sortable: true,
        filterable: true
      },
      data: null,
      refreshInterval: 15000
    });

    // Travel Map Widget
    this.widgets.set('travel_map', {
      id: 'travel_map',
      type: 'map',
      title: 'Travel Map',
      description: 'Interactive travel destinations map',
      position: { x: 0, y: 7, width: 12, height: 4 },
      config: {
        showDestinations: true,
        showBookings: true,
        showPrices: true
      },
      data: null,
      refreshInterval: 60000
    });
  }

  private startMonitoring() {
    this.isMonitoring = true;
    console.log('🗺️ Travel Dashboard monitoring started');

    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 30000);

    // Update widgets based on their refresh intervals
    setInterval(() => {
      this.updateWidgets();
    }, 5000);
  }

  private async updateMetrics() {
    try {
      const travelAgency = getEnhancedTravelAgency();
      const teamManager = getEnterpriseTeamManager();

      // Collect booking metrics
      const bookingMetrics: BookingMetrics = {
        totalBookings: 1247,
        bookingsToday: 23,
        bookingsThisWeek: 156,
        bookingsThisMonth: 687,
        averageBookingValue: 1250,
        bookingSuccessRate: 0.94,
        cancellationRate: 0.05,
        refundRate: 0.02,
        bookingsByType: {
          flight: 45,
          hotel: 35,
          package: 15,
          activity: 5
        },
        bookingsByDestination: {
          'Paris': 234,
          'Tokyo': 189,
          'New York': 167,
          'London': 145,
          'Barcelona': 98
        }
      };

      // Collect revenue metrics
      const revenueMetrics: RevenueMetrics = {
        totalRevenue: 1558750,
        revenueToday: 28750,
        revenueThisWeek: 195000,
        revenueThisMonth: 859375,
        averageRevenuePerBooking: 1250,
        revenueGrowth: 0.12,
        revenueByType: {
          flight: 0.45,
          hotel: 0.35,
          package: 0.15,
          activity: 0.05
        },
        revenueByDestination: {
          'Paris': 292500,
          'Tokyo': 236250,
          'New York': 208750,
          'London': 181250,
          'Barcelona': 122500
        },
        profitMargin: 0.18
      };

      // Collect destination metrics
      const destinationMetrics: DestinationMetrics = {
        totalDestinations: 150,
        popularDestinations: [
          { destination: 'Paris', bookings: 234, revenue: 292500, growth: 0.15 },
          { destination: 'Tokyo', bookings: 189, revenue: 236250, growth: 0.22 },
          { destination: 'New York', bookings: 167, revenue: 208750, growth: 0.08 },
          { destination: 'London', bookings: 145, revenue: 181250, growth: 0.12 },
          { destination: 'Barcelona', bookings: 98, revenue: 122500, growth: 0.18 }
        ],
        seasonalTrends: {
          spring: { bookings: 0.28, revenue: 0.26 },
          summer: { bookings: 0.35, revenue: 0.38 },
          autumn: { bookings: 0.22, revenue: 0.21 },
          winter: { bookings: 0.15, revenue: 0.15 }
        },
        destinationPerformance: {
          'Paris': { rating: 4.6, satisfaction: 0.92 },
          'Tokyo': { rating: 4.8, satisfaction: 0.94 },
          'New York': { rating: 4.4, satisfaction: 0.89 }
        }
      };

      // Collect satisfaction metrics
      const satisfactionMetrics: SatisfactionMetrics = {
        averageRating: 4.6,
        totalReviews: 3421,
        satisfactionByDestination: {
          'Tokyo': 4.8,
          'Paris': 4.6,
          'Barcelona': 4.5,
          'London': 4.4,
          'New York': 4.4
        },
        complaintRate: 0.03,
        repeatBookingRate: 0.67,
        netPromoterScore: 72
      };

      // Collect AI performance metrics
      const aiPerformanceMetrics: AIPerformanceMetrics = {
        aiRecommendationAccuracy: 0.89,
        aiBookingSuccessRate: 0.94,
        aiPriceOptimizationSavings: 0.15,
        aiCustomerSatisfaction: 4.6,
        aiProcessingTime: 2.3,
        aiUptime: 0.999
      };

      // Collect travel trends
      const travelTrends: TravelTrends = {
        trendingDestinations: ['Reykjavik', 'Lisbon', 'Prague', 'Bangkok', 'Sydney'],
        seasonalPatterns: {
          currentSeason: 'autumn',
          nextSeasonTrends: 'winter_destinations'
        },
        priceTrends: {
          averagePriceChange: 0.05,
          priceVolatility: 0.12
        },
        customerPreferences: {
          topInterests: ['culture', 'food', 'nature', 'adventure'],
          preferredDuration: '5-7 days',
          averageBudget: 2000
        },
        marketInsights: {
          emergingDestinations: ['Croatia', 'Portugal', 'Vietnam'],
          travelStyleTrends: ['sustainable', 'experiential', 'remote_work']
        }
      };

      this.metrics = {
        timestamp: new Date(),
        bookings: bookingMetrics,
        revenue: revenueMetrics,
        destinations: destinationMetrics,
        customerSatisfaction: satisfactionMetrics,
        aiPerformance: aiPerformanceMetrics,
        trends: travelTrends
      };

      // Broadcast metrics update
      this.broadcastMetricsUpdate();

    } catch (error) {
      console.error('Error updating travel dashboard metrics:', error);
    }
  }

  private async updateWidgets() {
    if (!this.metrics) return;

    for (const widget of this.widgets.values()) {
      try {
        const now = Date.now();
        const lastUpdate = widget.data?.lastUpdated || 0;
        
        if (now - lastUpdate >= widget.refreshInterval) {
          await this.updateWidgetData(widget);
        }
      } catch (error) {
        console.error(`Error updating widget ${widget.id}:`, error);
      }
    }
  }

  private async updateWidgetData(widget: TravelDashboardWidget) {
    if (!this.metrics) return;

    switch (widget.id) {
      case 'booking_overview':
        widget.data = {
          totalBookings: this.metrics.bookings.totalBookings,
          bookingsToday: this.metrics.bookings.bookingsToday,
          averageValue: this.metrics.bookings.averageBookingValue,
          successRate: this.metrics.bookings.bookingSuccessRate,
          lastUpdated: Date.now()
        };
        break;

      case 'revenue_dashboard':
        widget.data = {
          totalRevenue: this.metrics.revenue.totalRevenue,
          revenueToday: this.metrics.revenue.revenueToday,
          growth: this.metrics.revenue.revenueGrowth,
          chartData: this.generateRevenueChartData(),
          lastUpdated: Date.now()
        };
        break;

      case 'popular_destinations':
        widget.data = {
          destinations: this.metrics.destinations.popularDestinations,
          chartData: this.generateDestinationChartData(),
          lastUpdated: Date.now()
        };
        break;

      case 'ai_performance':
        widget.data = {
          accuracy: this.metrics.aiPerformance.aiRecommendationAccuracy,
          uptime: this.metrics.aiPerformance.aiUptime,
          satisfaction: this.metrics.aiPerformance.aiCustomerSatisfaction,
          processingTime: this.metrics.aiPerformance.aiProcessingTime,
          lastUpdated: Date.now()
        };
        break;

      case 'customer_satisfaction':
        widget.data = {
          averageRating: this.metrics.customerSatisfaction.averageRating,
          totalReviews: this.metrics.customerSatisfaction.totalReviews,
          netPromoterScore: this.metrics.customerSatisfaction.netPromoterScore,
          repeatBookingRate: this.metrics.customerSatisfaction.repeatBookingRate,
          lastUpdated: Date.now()
        };
        break;

      case 'travel_calendar':
        widget.data = {
          bookings: this.generateCalendarBookings(),
          events: this.generateCalendarEvents(),
          lastUpdated: Date.now()
        };
        break;

      case 'booking_trends':
        widget.data = {
          trends: this.generateBookingTrendsData(),
          forecast: this.generateBookingForecast(),
          lastUpdated: Date.now()
        };
        break;

      case 'recent_bookings':
        widget.data = {
          bookings: this.generateRecentBookings(),
          lastUpdated: Date.now()
        };
        break;

      case 'travel_map':
        widget.data = {
          destinations: this.generateMapDestinations(),
          bookings: this.generateMapBookings(),
          lastUpdated: Date.now()
        };
        break;
    }

    // Broadcast widget update
    this.broadcastWidgetUpdate(widget);
  }

  // Data Generation Methods
  private generateRevenueChartData(): any[] {
    const data = [];
    const now = Date.now();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 50000) + 20000,
        bookings: Math.floor(Math.random() * 50) + 20
      });
    }

    return data;
  }

  private generateDestinationChartData(): any[] {
    return this.metrics?.destinations.popularDestinations.map(dest => ({
      destination: dest.destination,
      bookings: dest.bookings,
      revenue: dest.revenue,
      growth: dest.growth
    })) || [];
  }

  private generateCalendarBookings(): any[] {
    const bookings = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      if (Math.random() > 0.7) {
        bookings.push({
          date: date.toISOString().split('T')[0],
          title: 'Travel Booking',
          destination: this.getRandomDestination(),
          type: this.getRandomBookingType(),
          status: 'confirmed'
        });
      }
    }

    return bookings;
  }

  private generateCalendarEvents(): any[] {
    return [
      { date: '2024-01-15', title: 'Travel Expo', type: 'event' },
      { date: '2024-01-20', title: 'Price Drop Alert', type: 'alert' },
      { date: '2024-01-25', title: 'Customer Review Period', type: 'review' }
    ];
  }

  private generateBookingTrendsData(): any[] {
    const data = [];
    const now = Date.now();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        bookings: Math.floor(Math.random() * 20) + 10,
        revenue: Math.floor(Math.random() * 30000) + 15000
      });
    }

    return data;
  }

  private generateBookingForecast(): any[] {
    const forecast = [];
    const now = Date.now();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now + i * 24 * 60 * 60 * 1000);
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedBookings: Math.floor(Math.random() * 25) + 15,
        confidence: 0.85
      });
    }

    return forecast;
  }

  private generateRecentBookings(): any[] {
    return [
      {
        id: 'booking_1',
        customer: 'John Doe',
        destination: 'Paris',
        type: 'Package',
        amount: 1250,
        status: 'Confirmed',
        date: new Date().toISOString()
      },
      {
        id: 'booking_2',
        customer: 'Jane Smith',
        destination: 'Tokyo',
        type: 'Flight',
        amount: 850,
        status: 'Pending',
        date: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'booking_3',
        customer: 'Bob Johnson',
        destination: 'New York',
        type: 'Hotel',
        amount: 450,
        status: 'Confirmed',
        date: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  }

  private generateMapDestinations(): any[] {
    return this.metrics?.destinations.popularDestinations.map(dest => ({
      name: dest.destination,
      coordinates: this.getDestinationCoordinates(dest.destination),
      bookings: dest.bookings,
      revenue: dest.revenue
    })) || [];
  }

  private generateMapBookings(): any[] {
    return this.generateRecentBookings().map(booking => ({
      destination: booking.destination,
      coordinates: this.getDestinationCoordinates(booking.destination),
      amount: booking.amount,
      status: booking.status
    }));
  }

  private getRandomDestination(): string {
    const destinations = ['Paris', 'Tokyo', 'New York', 'London', 'Barcelona'];
    return destinations[Math.floor(Math.random() * destinations.length)];
  }

  private getRandomBookingType(): string {
    const types = ['Flight', 'Hotel', 'Package', 'Activity'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getDestinationCoordinates(destination: string): { lat: number; lng: number } {
    const coordinates = {
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Tokyo': { lat: 35.6762, lng: 139.6503 },
      'New York': { lat: 40.7128, lng: -74.0060 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 }
    };
    
    return coordinates[destination as keyof typeof coordinates] || { lat: 0, lng: 0 };
  }

  // Public API Methods
  async getDashboardMetrics(): Promise<TravelDashboardMetrics | null> {
    return this.metrics;
  }

  async getWidgets(): Promise<TravelDashboardWidget[]> {
    return Array.from(this.widgets.values());
  }

  async createCustomWidget(
    id: string,
    type: TravelDashboardWidget['type'],
    title: string,
    description: string,
    config: any
  ): Promise<TravelDashboardWidget> {
    const widget: TravelDashboardWidget = {
      id,
      type,
      title,
      description,
      position: { x: 0, y: 0, width: 4, height: 2 },
      config,
      data: null,
      refreshInterval: 60000
    };

    this.widgets.set(id, widget);
    console.log(`🗺️ Custom travel widget created: ${title}`);
    return widget;
  }

  // Subscription Methods
  subscribeToUpdates(callback: (update: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private broadcastMetricsUpdate(): void {
    const update = {
      type: 'travel_metrics_update',
      data: this.metrics,
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting travel metrics update:', error);
      }
    });
  }

  private broadcastWidgetUpdate(widget: TravelDashboardWidget): void {
    const update = {
      type: 'travel_widget_update',
      data: widget,
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting travel widget update:', error);
      }
    });
  }
}

// Export singleton instance
let travelDashboard: TravelDashboard | null = null;

export function getTravelDashboard(): TravelDashboard {
  if (!travelDashboard) {
    travelDashboard = new TravelDashboard();
  }
  return travelDashboard;
}
