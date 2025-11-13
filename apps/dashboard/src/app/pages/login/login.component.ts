import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styles: [],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
  }

  submit(event: Event) {
    event.preventDefault();
    if (this.email === '') {
      this.error = 'Email is required';
      return;
    }
    if (this.password === '') {
      this.error = 'Password is required';
      return;
    }

    this.auth.login(this.email, this.password).subscribe((data) => {
      if (data.success) {
        this.router.navigate(['/']);
      } else {
        this.error = data.message || 'Login failed';
        this.router.navigate(['/login']);
      }
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(_event: Event) {
    this.close();
  }

  close() {
    this.router.navigate(['/']);
  }

  register(event: Event) {
    event.preventDefault();
    this.router.navigate(['/register']);
  }
}
