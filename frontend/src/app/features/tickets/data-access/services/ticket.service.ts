import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { PageResponse } from '../../../../core/models/page.model';
import {
  AssignableUser,
  Ticket,
  TicketComment,
  TicketListParams,
  TicketPriority,
  TicketRequest,
  TicketStatistics,
  TicketStatus,
  TicketTimelineItem,
} from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly api = inject(ApiService);

  list(params: TicketListParams): Observable<PageResponse<Ticket>> {
    return this.api.get<PageResponse<Ticket>>('/tickets', {
      page: params.page,
      size: params.size,
      search: params.search,
      status: params.status,
      priority: params.priority,
      customerId: params.customerId,
      assignedToId: params.assignedToId,
      unassigned: params.unassigned,
      sort: params.sort,
    });
  }

  getById(id: number): Observable<Ticket> {
    return this.api.get<Ticket>(`/tickets/${id}`);
  }

  getStatistics(): Observable<TicketStatistics> {
    return this.api.get<TicketStatistics>('/tickets/statistics');
  }

  getAssignableUsers(): Observable<AssignableUser[]> {
    return this.api.get<AssignableUser[]>('/tickets/assignees');
  }

  getTimeline(id: number): Observable<TicketTimelineItem[]> {
    return this.api.get<TicketTimelineItem[]>(`/tickets/${id}/timeline`);
  }

  getComments(id: number): Observable<TicketComment[]> {
    return this.api.get<TicketComment[]>(`/tickets/${id}/comments`);
  }

  addComment(id: number, body: string): Observable<TicketComment> {
    return this.api.post<TicketComment>(`/tickets/${id}/comments`, { body });
  }

  create(request: TicketRequest): Observable<Ticket> {
    return this.api.post<Ticket>('/tickets', request);
  }

  update(id: number, request: TicketRequest): Observable<Ticket> {
    return this.api.put<Ticket>(`/tickets/${id}`, request);
  }

  updateStatus(id: number, status: TicketStatus): Observable<Ticket> {
    return this.api.patch<Ticket>(`/tickets/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/tickets/${id}`);
  }
}
