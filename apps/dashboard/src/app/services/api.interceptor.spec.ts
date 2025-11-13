import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiInterceptor } from './api.interceptor';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';

describe('ApiInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let notifyMock: Partial<NotificationService>;
  let routerMock: Partial<Router>;

  beforeEach(() => {
    notifyMock = { warn: jest.fn(), error: jest.fn() };
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: NotificationService, useValue: notifyMock },
        { provide: Router, useValue: routerMock },
        { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('calls warn and navigates to /login on 401', fakeAsync(() => {
    // ensure token present to be attached
    localStorage.setItem('auth_token', 'x');

    http.get('/test').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/test');
    req.flush({ message: 'bad' }, { status: 401, statusText: 'Unauthorized' });

    // allow setTimeout navigation
    tick(1);

    expect((notifyMock.warn as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    expect((routerMock.navigate as jest.Mock).mock.calls[0][0]).toEqual(['/login']);
  }));

  it('shows error toast on 400', () => {
    http.get('/test2').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/test2');
    req.flush({ message: 'bad' }, { status: 400, statusText: 'Bad' });

    expect((notifyMock.error as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });
});
