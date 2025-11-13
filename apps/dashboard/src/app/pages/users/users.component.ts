import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ResponseData } from 'libs/data/response';

import { UsersService, AppUser } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  loading = false;
  error: string | null = null;

  newUsername = '';
  newEmail = '';
  newPassword = '';
  newRole = 'viewer';

  public profileUser: AppUser | null = null;

  constructor(
    private usersSvc: UsersService,
    public auth: AuthService,
    private router: Router
  ) {
    this.usersSvc.me().subscribe({
      next: (user) => {
        console.log(user);
        this.profileUser = user;
        console.log(this.profileUser);
        if (this.profileUser?.role !== 'owner') {
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
    this.usersSvc.list().subscribe({
      next: (resp) => {
        if (Array.isArray(resp)) {
          const currentId = this.auth.getUserId();
          this.users = currentId
            ? resp.filter((x) => x.id !== currentId)
            : resp;
        } else {
          const r = resp as unknown as ResponseData<AppUser[]>;
          if (r?.data && Array.isArray(r.data)) {
            const currentId = this.auth.getUserId();
            this.users = currentId
              ? r.data.filter((x) => x.id !== currentId)
              : r.data;
          } else {
            this.users = [];
            this.error =
              (resp as any)?.message || 'Unexpected response from server';
          }
        }
        this.loading = false;
      },
      error: (e) => {
        this.error = (e as any)?.message || 'Failed to load users';
        this.loading = false;
      },
    });
  }

  create() {
    this.usersSvc
      .create({
        username: this.newUsername,
        password: this.newPassword,
        email: this.newEmail,
        role: this.newRole,
      })
      .subscribe({
        next: () => {
          this.newUsername = this.newEmail = this.newPassword = '';
          this.newRole = 'viewer';
          this.load();
        },
        error: (e) => (this.error = e?.message || 'Failed to create user'),
      });
  }

  remove(id: string) {
    if (!confirm('Delete this user?')) return;
    this.usersSvc.delete(id).subscribe({
      next: () => this.load(),
      error: (e) => (this.error = e?.message || 'Delete failed'),
    });
  }

  updateRole(u: AppUser, role: string) {
    this.usersSvc.update(u.id, { role }).subscribe({
      next: () => this.load(),
      error: (e) => (this.error = e?.message || 'Update failed'),
    });
  }
}
