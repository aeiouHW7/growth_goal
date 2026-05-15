export interface Flight {
  id: number;
  flightNumber: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
}

export interface Filters {
  departureCity: string;
  arrivalCity: string;
  airline: string;
  status: string;
}

export interface FilterOptions {
  departureCities: string[];
  arrivalCities: string[];
  airlines: string[];
  statuses: string[];
}
