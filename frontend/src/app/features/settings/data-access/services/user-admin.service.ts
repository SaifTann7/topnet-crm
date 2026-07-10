import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { PageResponse } from '../../../../core/models/page.model';

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  active: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly api = inject(ApiService);

  list(page = 0, size = 20): Observable<PageResponse<UserDto>> {
    return this.api.get<PageResponse<UserDto>>('/users', { page, size });
  }

  deactivate(id: number): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }
}
