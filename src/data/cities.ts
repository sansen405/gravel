interface CityData {
  label: string;
  value: string;
  country: string;
}

export const cities: CityData[] = [
  { label: 'Austin, Texas', value: 'Austin', country: 'United States' },
  { label: 'New York City, New York', value: 'New York City', country: 'United States' },
  { label: 'Los Angeles, California', value: 'Los Angeles', country: 'United States' },
  { label: 'London', value: 'London', country: 'United Kingdom' },
  { label: 'Paris', value: 'Paris', country: 'France' },
  { label: 'Tokyo', value: 'Tokyo', country: 'Japan' },
  { label: 'Sydney', value: 'Sydney', country: 'Australia' },
  { label: 'Toronto', value: 'Toronto', country: 'Canada' },
  { label: 'Berlin', value: 'Berlin', country: 'Germany' },
  { label: 'Amsterdam', value: 'Amsterdam', country: 'Netherlands' },
  // Add more cities as needed
];

export const countries = Array.from(new Set(cities.map(city => city.country))); 