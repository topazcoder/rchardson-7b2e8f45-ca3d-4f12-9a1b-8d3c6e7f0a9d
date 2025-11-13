import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';

import { JwtPayload } from 'libs/auth';
import { type RegisterUserDto } from 'libs/auth/register';
import { ResponseData } from 'libs/data/response';

import { environment, TOKEN_KEY } from '../../environments/environment';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token$ = new BehaviorSubject<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  private apiUrl = environment.apiUrl;
  public token$ = this._token$.asObservable();

  constructor(private http: HttpClient, private notify: NotificationService) {}

  isLoggedIn(): boolean {
    return !!this._token$.value;
  }

  getUserName(): string | null {
    const token = this._token$.value;
    if (!token) return null;
    try {
      const decoded = jwt_decode.jwtDecode(token) as JwtPayload;
      return decoded?.username || null;
    } catch (e) {
      return null;
    }
  }

  getUserId(): string | null {
    const token = this._token$.value;
    if (!token) return null;
    try {
      const decoded = jwt_decode.jwtDecode(token) as JwtPayload;
      return decoded?.id || null;
    } catch (e) {
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this._token$.value;
    if (!token) return null;
    try {
      const decoded = jwt_decode.jwtDecode(token) as JwtPayload;
      return decoded?.role || null;
    } catch (e) {
      return null;
    }
  }

  login(
    email: string,
    password: string
  ): Observable<ResponseData<{ accessToken: string }>> {
    return this.http
      .post<ResponseData<{ accessToken: string }>>(
        `${this.apiUrl}/auth/login`,
        {
          email,
          password,
        }
      )
      .pipe(
        tap((res) => {
          console.log(res.data);
          const accessToken = res.data.accessToken;
          if (accessToken) {
            localStorage.setItem(TOKEN_KEY, accessToken);
            this._token$.next(accessToken);
            this.notify.success('Logged in successfully');
          }
        }),
        catchError((err) => {
          const msg = err?.error?.message || 'Login failed';
          this.notify.error(msg);
          return of({
            success: false,
            data: { accessToken: '' },
            message: msg,
          });
        })
      );
  }

  register(
    user: RegisterUserDto
  ): Observable<ResponseData<{ accessToken: string }>> {
    return this.http
      .post<ResponseData<{ accessToken: string }>>(
        `${this.apiUrl}/auth/register`,
        user
      )
      .pipe(
        tap((res) => {
          const accessToken = res.data.accessToken;
          if (accessToken) {
            localStorage.setItem(TOKEN_KEY, accessToken);
            this._token$.next(accessToken);
            this.notify.success('Registration successful');
          }
        }),
        catchError((err) => {
          const msg = err?.error?.message || 'Registration failed';
          this.notify.error(msg);
          return of({
            success: false,
            data: { accessToken: '' },
            message: msg,
          });
        })
      );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this._token$.next(null);
  }

  getToken(): string | null {
    return this._token$.value;
  }
}
