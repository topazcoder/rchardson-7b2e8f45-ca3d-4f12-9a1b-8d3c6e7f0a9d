import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

describe('HeaderComponent', () => {
  let mockTheme: any;
  let mockAuth: any;
  let mockUsers: any;

  beforeEach(async () => {
    mockTheme = {
      toggle: jest.fn(),
      isDark: jest.fn(() => false),
      init: jest.fn(),
    };
    mockAuth = {
      isLoggedIn: jest.fn(() => true),
      getUserName: jest.fn(() => 'test'),
      getUserRole: jest.fn(() => 'owner'),
      logout: jest.fn(),
    };
    mockUsers = { me: jest.fn(() => of({ username: 'bob', organization: { name: 'Org' } })) };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: ThemeService, useValue: mockTheme },
        { provide: AuthService, useValue: mockAuth },
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compileComponents();
  });

  it('calls ThemeService.toggle when clicking toggle button', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[title="Toggle theme"]');
    expect(btn).toBeTruthy();
    btn.click();
    expect(mockTheme.toggle).toHaveBeenCalled();
  });

  it('renders the username and organization when logged in', async () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    // wait for any async subscriptions (usersSvc.me())
    await fixture.whenStable();
    fixture.detectChanges();
    // open profile menu to reveal username/organization
    const btn = fixture.nativeElement.querySelector('.profile-button');
    expect(btn).toBeTruthy();
    btn.click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('test');
    expect(text).toContain('Org');
  });

  it('logout calls auth.logout and navigates to login', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();
    comp.logout();
    expect(mockAuth.logout).toHaveBeenCalled();
  });
});
