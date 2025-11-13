import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private router: Router, private notify: NotificationService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('auth_token');
    const request = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(request).pipe(
      catchError((err) => {
        try {
          const status = err?.status;
          const message = err?.error?.message || err?.message || 'An error occurred';
          if (status === 401 || status === 403) {
            // clear token and redirect to login
            localStorage.removeItem('auth_token');
            this.notify.warn('You have been signed out. Please log in.');
            // navigate asynchronously to avoid interfering with interceptor lifecycle
            setTimeout(() => this.router.navigate(['/login']), 0);
          } else if (status >= 500) {
            this.notify.error('Server error. Please try again later.');
          } else if (status >= 400) {
            // show specific message when available
            this.notify.error(message);
          }
        } catch (e) {
          // Ignore notification errors
        }
        return throwError(() => err);
      })
    );
  }
}
