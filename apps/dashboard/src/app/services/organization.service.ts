import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';

import { environment } from '../../environments/environment';

export interface Organization {
  id: string;
  name: string;
  parentId?: string;
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private notify: NotificationService) {}

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.apiUrl}/organizations`);
  }

  getOrganizationsByParent(parentId: string): Observable<Organization[]> {
    return this.http.get<Organization[]>(
      `${this.apiUrl}/organizations/parent/${parentId}`
    );
  }

  getOrganization(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/organizations/${id}`);
  }

  getParentOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(
      `${this.apiUrl}/organizations/parents`
    );
  }

  createOrganization(data: Partial<Organization>): Observable<Organization> {
    return this.http
      .post<Organization>(`${this.apiUrl}/organizations`, data)
      .pipe(
        tap(() => this.notify.success('Organization created successfully.')),
        catchError((err) => {
          const msg = err?.error?.message || 'Create organization failed';
          try {
            this.notify.error(msg);
          } catch {}
          return of(null as any);
        })
      );
  }

  updateOrganization(
    id: string,
    data: Partial<Organization>
  ): Observable<Organization> {
    return this.http
      .put<Organization>(`${this.apiUrl}/organizations/${id}`, data)
      .pipe(
        tap(() => this.notify.success('Organization updated successfully.')),
        catchError((err) => {
          const msg = err?.error?.message || 'Update organization failed';
          try {
            this.notify.error(msg);
          } catch {}
          return of(null as any);
        })
      );
  }

  deleteOrganization(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/organizations/${id}`)
      .pipe(
        tap(() => this.notify.success('Organization deleted')),
        catchError((err) => {
          const msg = err?.error?.message || 'Delete organization failed';
          try {
            this.notify.error(msg);
          } catch {}
          return of(null as any);
        })
      );
  }
}
