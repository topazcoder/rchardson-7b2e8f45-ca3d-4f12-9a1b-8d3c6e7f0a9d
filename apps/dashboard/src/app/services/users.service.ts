import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { NotificationService } from './notification.service';

import { environment } from '../../environments/environment';

export interface AppUser {
  id: string;
  username: string;
  email?: string;
  role: string;
  organization?: { id: string; name?: string };
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = environment.apiUrl + '/users';

  constructor(private http: HttpClient, private notify: NotificationService) {}

  list(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.base);
  }

  me() {
    return this.http.get<AppUser>(`${this.base}/me`);
  }

  create(payload: {
    username: string;
    password: string;
    email?: string;
    role?: string;
  }) {
    return this.http.post<AppUser>(this.base, payload).pipe(
      tap(() => this.notify.success('User created successfully.')),
      catchError((err) => {
        const msg = err?.error?.message || 'Create user failed';
        this.notify.error(msg);
        return of(null as any);
      })
    );
  }

  update(id: string, payload: Partial<AppUser>) {
    return this.http.put<AppUser>(`${this.base}/${id}`, payload).pipe(
      tap(() => this.notify.success('User updated successfully.')),
      catchError((err) => {
        const msg = err?.error?.message || 'Update user failed';
        this.notify.error(msg);
        return of(null as any);
      })
    );
  }

  delete(id: string) {
    return this.http.delete<any>(`${this.base}/${id}`).pipe(
      tap(() => this.notify.success('User deleted successfully.')),
      catchError((err) => {
        const msg = err?.error?.message || 'Delete user failed';
        this.notify.error(msg);
        return of(null as any);
      })
    );
  }
}
