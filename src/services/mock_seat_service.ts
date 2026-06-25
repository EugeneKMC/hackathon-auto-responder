export type SeatAvailability = {
  building: string;
  city: string;
  floor: string;
  seat_type: 'dedicated_desk' | 'private_office' | 'meeting_room';
  available_count: number;
  monthly_price_php: number;
  notes: string;
};

const MOCK_SEATS: SeatAvailability[] = [
  {
    building: 'V Corporate Centre',
    city: 'Makati',
    floor: '8th',
    seat_type: 'dedicated_desk',
    available_count: 12,
    monthly_price_php: 16000,
    notes: '24/7 access, fiber internet, ergonomic chair',
  },
  {
    building: 'V Corporate Centre',
    city: 'Makati',
    floor: '8th',
    seat_type: 'private_office',
    available_count: 3,
    monthly_price_php: 75000,
    notes: '4-seater office, lockable, includes meeting room credits',
  },
  {
    building: 'Picadilly Star',
    city: 'BGC',
    floor: '12th',
    seat_type: 'dedicated_desk',
    available_count: 8,
    monthly_price_php: 18000,
    notes: 'Premium location, view of the skyline',
  },
  {
    building: 'Picadilly Star',
    city: 'BGC',
    floor: '12th',
    seat_type: 'meeting_room',
    available_count: 4,
    monthly_price_php: 1500,
    notes: 'Price per hour, seats 6-8 people, AV included',
  },
  {
    building: 'Cebu IT Park Tower',
    city: 'Cebu',
    floor: '6th',
    seat_type: 'dedicated_desk',
    available_count: 20,
    monthly_price_php: 12000,
    notes: 'Most affordable, near food court',
  },
  {
    building: 'Cebu IT Park Tower',
    city: 'Cebu',
    floor: '6th',
    seat_type: 'private_office',
    available_count: 5,
    monthly_price_php: 50000,
    notes: '6-seater, lockable, AC controlled',
  },
];

export function getAvailableSeats(args: {
  city?: string;
  seat_type?: string;
}): SeatAvailability[] {
  return MOCK_SEATS.filter((seat) => {
    if (
      args.city &&
      seat.city.toLowerCase() !== args.city.toLowerCase()
    ) {
      return false;
    }
    if (args.seat_type && seat.seat_type !== args.seat_type) {
      return false;
    }
    return seat.available_count > 0;
  });
}
