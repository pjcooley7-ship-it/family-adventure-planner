export interface TravelPreferences {
  // Step 1 — Who
  travelerName: string
  originCity: string      // human-readable city label from geocoder
  originAirports: string[] // selected IATA codes (up to 3)
  adults: number
  kids: number

  // Step 2 — When
  earliestDeparture: string
  latestReturn: string
  flexibleDates: boolean
  tripDurationMin: number
  tripDurationMax: number

  // Step 3 — Budget
  budgetMin: number
  budgetMax: number
  currency: string

  // Step 4 — Activities
  activities: string[]
  accommodationTypes: string[]

  // Step 5 — Notes
  specialRequirements: string
}

export const ACTIVITY_OPTIONS = [
  { id: 'beach', label: 'Beach & Water', emoji: '🏖️' },
  { id: 'hiking', label: 'Hiking & Nature', emoji: '🥾' },
  { id: 'city', label: 'City Exploration', emoji: '🏙️' },
  { id: 'culture', label: 'Cultural & History', emoji: '🏛️' },
  { id: 'food', label: 'Food & Culinary', emoji: '🍽️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🎶' },
  { id: 'adventure', label: 'Adventure Sports', emoji: '🧗' },
  { id: 'wellness', label: 'Relaxation & Spa', emoji: '🧘' },
  { id: 'family', label: 'Family-Friendly', emoji: '👨‍👩‍👧' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'wildlife', label: 'Wildlife & Safari', emoji: '🦁' },
  { id: 'skiing', label: 'Skiing & Snow', emoji: '⛷️' },
] as const

export const ACCOMMODATION_OPTIONS = [
  { id: 'budget', label: 'Budget / Hostel' },
  { id: 'midrange', label: 'Mid-range Hotel' },
  { id: 'luxury', label: 'Luxury Resort' },
  { id: 'apartment', label: 'Apartment / Airbnb' },
  { id: 'boutique', label: 'Boutique Hotel' },
] as const

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY'] as const

export const DEFAULT_PREFERENCES: TravelPreferences = {
  travelerName: '',
  originCity: '',
  originAirports: [],
  adults: 2,
  kids: 0,
  earliestDeparture: '',
  latestReturn: '',
  flexibleDates: false,
  tripDurationMin: 5,
  tripDurationMax: 10,
  budgetMin: 1000,
  budgetMax: 3000,
  currency: 'USD',
  activities: [],
  accommodationTypes: [],
  specialRequirements: '',
}
