import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as jwt_decode from 'jwt-decode';
import { TOKEN_KEY, environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let notifyMock: Partial<NotificationService>;

  beforeEach(() => {
    // clear localStorage between tests
    localStorage.removeItem(TOKEN_KEY);

    notifyMock = { success: jest.fn(), error: jest.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NotificationService, useValue: notifyMock }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(TOKEN_KEY);
  });

  it('isLoggedIn reflects token presence', () => {
    expect(service.isLoggedIn()).toBe(false);
    (service as any)['_token$'].next('tok1');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('getUserName and getUserRole decode token', () => {
    const fakeToken = 'fake.jwt.token';
    // spy on jwt decode to return our fake payload
    const payload = { username: 'alice', role: 'owner' };
    jest.spyOn(jwt_decode as any, 'jwtDecode').mockReturnValue(payload);

    (service as any)['_token$'].next(fakeToken);
    expect(service.getUserName()).toBe('alice');
    expect(service.getUserRole()).toBe('owner');

    // restore mock
    (jwt_decode as any).jwtDecode.mockRestore();
  });

  it('login posts to API, stores token and shows success toast on success', (done) => {
    const resp = { success: true, data: { accessToken: 'abc.def.ghi' }, message: '' };

    service.login('x@y.com', 'pass').subscribe((r) => {
      expect(r).toEqual(resp);
      expect(localStorage.getItem(TOKEN_KEY)).toBe('abc.def.ghi');
      expect(service.getToken()).toBe('abc.def.ghi');
      expect((notifyMock.success as jest.Mock).mock.calls.length).toBeGreaterThan(0);
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(resp);
  });

  it('login shows error toast on failure', (done) => {
    const err = { error: { message: 'nope' } };
    service.login('x@y.com', 'pass').subscribe((r) => {
      expect((notifyMock.error as jest.Mock).mock.calls.length).toBeGreaterThan(0);
      expect(r.success).toBe(false);
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.error(new ErrorEvent('fail'), { status: 400, statusText: 'Bad' });
  });

  it('logout clears token', () => {
    (service as any)['_token$'].next('tok');
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
