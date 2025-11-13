import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface AuditActor {
  id: string;
  username?: string;
  email?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  meta?: any;
  actor?: AuditActor | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<AuditEntry[]> {
    return this.http.get<AuditEntry[]>(`${this.api}/audit-log`);
  }
}
