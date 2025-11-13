import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService, ThemeService } from '../../services';
import { UsersService } from '../../services/users.service';
import { AppUser } from '../../services/users.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styles: [],
})
export class HeaderComponent implements OnInit {
  public profileOpen = false;
  public profileUser: AppUser | null = null;
  @ViewChild('profileMenu') profileMenuRef?: ElementRef;
  @ViewChild('profileBtn') profileBtnRef?: ElementRef;
  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private router: Router,
    private usersSvc: UsersService
  ) {
    this.theme.init();
  }

  ngOnInit(): void {
    // attempt to load current user (will include organization if available)
    this.usersSvc.me().subscribe({
      next: (u) => (this.profileUser = u),
      error: () => (this.profileUser = null),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    this.theme.toggle();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.profileOpen) return;
    const target = event.target as HTMLElement;
    try {
      const insideMenu = this.profileMenuRef?.nativeElement.contains(target);
      const onButton = this.profileBtnRef?.nativeElement.contains(target);
      if (!insideMenu && !onButton) {
        this.profileOpen = false;
      }
    } catch (e) {
      // ignore
      this.profileOpen = false;
    }
  }
}
