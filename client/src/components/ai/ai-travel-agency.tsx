
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlightOption, HotelOption } from '../../lib/firestore-types';

const AITravelAgency: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flights');

  // Flight search state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [flightResults, setFlightResults] = useState<FlightOption[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(false);

  // Hotel search state
  const [hotelDestination, setHotelDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [hotelResults, setHotelResults] = useState<HotelOption[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);

  const handleFlightSearch = async () => {
    setFlightsLoading(true);
    try {
      const response = await fetch('/api/travel/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, departureDate, returnDate, passengers: 1, class: 'economy' }),
      });
      const data = await response.json();
      setFlightResults(data);
    } catch (error) {
      console.error('Failed to search for flights:', error);
    }
    setFlightsLoading(false);
  };

  const handleHotelSearch = async () => {
    setHotelsLoading(true);
    try {
      const response = await fetch('/api/travel/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: hotelDestination, checkIn: checkInDate, checkOut: checkOutDate, guests: 1, rooms: 1 }),
      });
      const data = await response.json();
      setHotelResults(data);
    } catch (error) {
      console.error('Failed to search for hotels:', error);
    }
    setHotelsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Travel Agency</CardTitle>
        <p className="text-muted-foreground">Let our AI-powered agents help you plan your next trip.</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
          </TabsList>
          <TabsContent value="flights">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input id="origin" placeholder="e.g., NYC" value={origin} onChange={e => setOrigin(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" placeholder="e.g., Paris" value={destination} onChange={e => setDestination(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departure">Departure Date</Label>
                  <Input id="departure" type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return">Return Date</Label>
                  <Input id="return" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleFlightSearch} disabled={flightsLoading}>
                {flightsLoading ? 'Searching...' : 'Search Flights'}
              </Button>
              <div className="mt-4 space-y-4">
                {flightResults.map(flight => (
                  <Card key={flight.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{flight.airline} {flight.flightNumber}</span>
                        <Badge variant={flight.aiScore > 80 ? 'success' : 'secondary'}>AI Score: {flight.aiScore.toFixed(0)}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-semibold">{flight.departure.airport}</p>
                          <p className="text-muted-foreground">{flight.departure.time}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{flight.duration}</p>
                          <p className="text-muted-foreground">{flight.stops} stop(s)</p>
                        </div>
                        <div>
                          <p className="font-semibold">{flight.arrival.airport}</p>
                          <p className="text-muted-foreground">{flight.arrival.time}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-lg font-bold text-right">${flight.price.amount.toFixed(2)}</p>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        {flight.aiInsights.map((insight, i) => <p key={i}>- {insight}</p>)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="hotels">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hotel-destination">Destination</Label>
                  <Input id="hotel-destination" placeholder="e.g., Tokyo" value={hotelDestination} onChange={e => setHotelDestination(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-in">Check-in Date</Label>
                  <Input id="check-in" type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-out">Check-out Date</Label>
                  <Input id="check-out" type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleHotelSearch} disabled={hotelsLoading}>
                {hotelsLoading ? 'Searching...' : 'Search Hotels'}
              </Button>
              <div className="mt-4 space-y-4">
                {hotelResults.map(hotel => (
                  <Card key={hotel.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{hotel.name}</span>
                        <Badge variant={hotel.aiScore > 80 ? 'success' : 'secondary'}>AI Score: {hotel.aiScore.toFixed(0)}</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{Array(hotel.starRating).fill('⭐').join('')}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{hotel.address}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-lg font-bold">${hotel.price.perNight.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                        <p className="text-sm">{hotel.reviews.rating} ({hotel.reviews.count} reviews)</p>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        {hotel.aiInsights.map((insight, i) => <p key={i}>- {insight}</p>)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AITravelAgency;
