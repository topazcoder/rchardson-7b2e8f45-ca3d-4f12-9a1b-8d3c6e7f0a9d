import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { AuditService, AuditEntry } from '../../services/audit.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { UsersService } from '../../services';
import { AppUser } from '../../services/users.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, HeaderComponent, DatePipe],
  templateUrl: './audit.component.html',
})
export class AuditComponent implements OnInit {
  loading = false;
  error: string | null = null;
  audits: AuditEntry[] = [];

  public profileUser: AppUser | null = null;

  constructor(
    private audit: AuditService,
    private usersSvc: UsersService,
    private router: Router
  ) {
    this.usersSvc.me().subscribe({
      next: (user) => {
        this.profileUser = user;
        if (this.profileUser?.role === 'viewer') {
          this.router.navigate(['/']);
        }
      },
      error: () => (this.profileUser = null),
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    this.audit.list().subscribe({
      next: (v) => {
        this.audits = v || [];
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.message || 'Failed to load audit log';
        this.loading = false;
      },
    });
  }
}
