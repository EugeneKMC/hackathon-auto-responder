import {
  getMaxTicketNumber,
  getServiceRequestByIdForClient,
  getServiceRequestsForClient,
  insertServiceRequest,
  updateServiceRequestForClient,
} from '@/repositories/service_request';
import { findClient } from '@/repositories/client';
import { ServiceResponse } from '@/utils/service_response';
import type {
  ClientServiceRequest,
  NewClientServiceRequest,
} from '@/models/client_service_requests';
import type { ServiceRequest } from '@/types/dashboard';
import type {
  CreateServiceRequestPayload,
  UpdateServiceRequestPayload,
} from '@/schemas/service_request';

function mapStatus(status: string): ServiceRequest['status'] {
  switch (status) {
    case 'Open':
      return 'open';
    case 'In Progress':
      return 'in_progress';
    case 'Resolved':
      return 'resolved';
    default:
      return 'open';
  }
}

function mapPriority(priority: string): ServiceRequest['priority'] {
  switch (priority) {
    case 'High':
      return 'high';
    case 'Medium':
      return 'medium';
    case 'Low':
      return 'low';
    default:
      return 'medium';
  }
}

// Contract value -> DB value (for writes).
function toDbPriority(p: 'low' | 'medium' | 'high'): 'Low' | 'Medium' | 'High' {
  return p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low';
}

function toDbStatus(
  s: 'open' | 'in_progress' | 'resolved'
): 'Open' | 'In Progress' | 'Resolved' {
  return s === 'resolved'
    ? 'Resolved'
    : s === 'in_progress'
      ? 'In Progress'
      : 'Open';
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function mapServiceRequest(t: ClientServiceRequest): ServiceRequest {
  return {
    id: t.ticketId,
    reference: t.ticketId,
    subject: t.description,
    category: t.requestType,
    priority: mapPriority(t.priority),
    status: mapStatus(t.status),
    createdAt: t.submittedDate,
  };
}

export const serviceRequestService = {
  async list(clientId: string, direction: 'asc' | 'desc') {
    // Repository returns rows ordered by submitted_date desc.
    const rows = await getServiceRequestsForClient({ client_id: clientId });
    const items = rows.map(mapServiceRequest);
    if (direction === 'asc') items.reverse();
    return ServiceResponse.success(items);
  },

  async getById(clientId: string, ticketId: string) {
    const row = await getServiceRequestByIdForClient(clientId, ticketId);
    if (!row) return ServiceResponse.notFound('Service request not found');
    return ServiceResponse.success(mapServiceRequest(row));
  },

  async create(clientId: string, payload: CreateServiceRequestPayload) {
    const client = await findClient({ client_id: clientId });
    const ticketId = `SR-${String((await getMaxTicketNumber()) + 1).padStart(4, '0')}`;

    const row = await insertServiceRequest({
      ticketId,
      clientId,
      companyName: client?.companyName ?? null,
      requestType: payload.category,
      description: payload.subject,
      priority: toDbPriority(payload.priority),
      status: 'Open',
      submittedDate: todayIso(),
      assignedTo: 'Unassigned',
      resolvedDate: null,
      daysOpen: 0,
      clientNotes: payload.details ?? null,
    });

    return ServiceResponse.success(mapServiceRequest(row));
  },

  async update(
    clientId: string,
    ticketId: string,
    payload: UpdateServiceRequestPayload
  ) {
    const set: Partial<NewClientServiceRequest> = {};
    if (payload.subject !== undefined) set.description = payload.subject;
    if (payload.category !== undefined) set.requestType = payload.category;
    if (payload.priority !== undefined) {
      set.priority = toDbPriority(payload.priority);
    }
    if (payload.details !== undefined) set.clientNotes = payload.details;
    if (payload.status !== undefined) {
      set.status = toDbStatus(payload.status);
      // Stamp/clear the resolved date to match the new status.
      set.resolvedDate = payload.status === 'resolved' ? todayIso() : null;
    }

    const row = await updateServiceRequestForClient(clientId, ticketId, set);
    if (!row) return ServiceResponse.notFound('Service request not found');
    return ServiceResponse.success(mapServiceRequest(row));
  },
};
