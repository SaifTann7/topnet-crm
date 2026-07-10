import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ChangePasswordRequest, ProfileUpdateRequest, UserProfile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  getProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/profile');
  }

  updateProfile(request: ProfileUpdateRequest): Observable<UserProfile> {
    return this.api.put<UserProfile>('/profile', request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.api.post<void>('/profile/change-password', request);
  }
}
