import { getSeatAllocationForClient } from '@/repositories/seat';
import { ServiceResponse } from '@/utils/service_response';
import type { ClientSeat } from '@/models/client_seats';
import type { Seat, SeatSummary } from '@/types/dashboard';

// NOTE: the `seats` table holds one aggregate allocation row per client
// (total/occupied/available), not per-seat records. The full list synthesizes
// individual seat rows from that aggregate so the table can render: the first
// `seatsOccupied` are "occupied", the rest "vacant". There is no per-seat
// assignee in the dataset, so `assignedTo` is always null.
function buildSeat(agg: ClientSeat, index: number): Seat {
  const occupied = index <= agg.seatsOccupied;
  return {
    id: `${agg.seatRecordId}-${index}`,
    seatNumber: `S-${String(index).padStart(3, '0')}`,
    assignedTo: null,
    status: occupied ? 'occupied' : 'vacant',
    assignedDate: occupied ? agg.contractStart : null,
  };
}

function buildSeatList(agg: ClientSeat): Seat[] {
  const seats: Seat[] = [];
  for (let i = 1; i <= agg.totalSeats; i++) {
    seats.push(buildSeat(agg, i));
  }
  return seats;
}

export const seatService = {
  async getSummary(clientId: string) {
    const agg = await getSeatAllocationForClient({ client_id: clientId });
    const summary: SeatSummary = {
      used: agg?.seatsOccupied ?? 0,
      total: agg?.totalSeats ?? 0,
    };
    return ServiceResponse.success(summary);
  },

  async list(clientId: string, direction: 'asc' | 'desc') {
    const agg = await getSeatAllocationForClient({ client_id: clientId });
    const items = agg ? buildSeatList(agg) : [];
    // Default (desc by assignedDate) shows occupied seats first, vacant last.
    items.sort((a, b) => {
      const ad = a.assignedDate ?? '';
      const bd = b.assignedDate ?? '';
      if (ad !== bd) return bd.localeCompare(ad);
      return a.seatNumber.localeCompare(b.seatNumber);
    });
    if (direction === 'asc') items.reverse();
    return ServiceResponse.success(items);
  },

  // Synthetic seat id is `${seatRecordId}-${index}`. Parse it, confirm it
  // belongs to the caller's allocation, and rebuild that single seat.
  async getById(clientId: string, seatId: string) {
    const agg = await getSeatAllocationForClient({ client_id: clientId });
    if (!agg) return ServiceResponse.notFound('Seat not found');

    const dash = seatId.lastIndexOf('-');
    const recordId = seatId.slice(0, dash);
    const index = Number(seatId.slice(dash + 1));

    if (
      dash < 0 ||
      recordId !== agg.seatRecordId ||
      !Number.isInteger(index) ||
      index < 1 ||
      index > agg.totalSeats
    ) {
      return ServiceResponse.notFound('Seat not found');
    }

    return ServiceResponse.success(buildSeat(agg, index));
  },
};
